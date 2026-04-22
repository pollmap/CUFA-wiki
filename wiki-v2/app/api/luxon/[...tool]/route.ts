/**
 * /api/luxon/[...tool] — Luxon MCP bridge route
 *
 * Responsibilities (CLAUDE.md §보안 규정 v1):
 * - Whitelist (15 logical tools mapped to real MCP tool names)
 * - Zod input validation + DoS guards (limit ≤ 50, depth ≤ 5)
 * - Rate limit (@upstash/ratelimit with in-memory LRU fallback, 60 req/min/IP)
 * - Vercel KV cache with TTL differentiation (base-rate 1hr / DART 5min
 *   / stock live 30s / stock after-hours 1d)
 * - Prompt-injection defense (client cannot inject systemPrompt; page IDs
 *   are whitelisted; only 'args' accepted)
 * - API response envelope (patterns.md): { success, data?, error?, cached?, ttl? }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callTool, McpError } from "@/lib/mcp-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/* 1. Whitelist (logical name → real nexus-finance-mcp tool name)     */
/* ------------------------------------------------------------------ */

/**
 * Plan §3.3 lists 15 "logical" tool names. The real MCP server uses slightly
 * different identifiers (verified against nexus-finance-vps tool list on
 * 2026-04-22). This map is the single source of truth.
 */
export const TOOL_MAP: Record<string, { real: string; ttlSec: number }> = {
  // --- DART (Korean disclosures / fundamentals) ---
  dart_latest_disclosures: { real: "dart_disclosure_search", ttlSec: 300 },
  dart_financial_statement: { real: "dart_financial_statements", ttlSec: 3_600 },
  dart_company_basic: { real: "dart_company_info", ttlSec: 86_400 },
  dart_insider_trading: { real: "dart_5pct_disclosure", ttlSec: 300 },
  // --- Korean market prices ---
  krx_stock_price_chart: { real: "stocks_history", ttlSec: 30 },
  krx_market_summary: { real: "stocks_market_overview", ttlSec: 60 },
  krx_sector_heatmap: { real: "stocks_market_overview", ttlSec: 60 },
  // --- Korean macro (ECOS) ---
  ecos_interest_rate: { real: "ecos_get_base_rate", ttlSec: 3_600 },
  ecos_exchange_rate: { real: "ecos_get_exchange_rate", ttlSec: 300 },
  ecos_cpi: { real: "ecos_get_stat_data", ttlSec: 3_600 },
  ecos_gdp: { real: "ecos_get_gdp", ttlSec: 3_600 },
  ecos_bond_yield: { real: "ecos_get_bond_yield", ttlSec: 3_600 },
  // --- KOSIS (statistics) ---
  kosis_employment: { real: "kosis_get_unemployment", ttlSec: 86_400 },
  // --- US macro (FRED) ---
  fred_us_10y: { real: "macro_fred", ttlSec: 3_600 },
  fred_vix: { real: "macro_fred", ttlSec: 300 },
};

/* ------------------------------------------------------------------ */
/* 2. Zod schemas — DoS guards                                        */
/* ------------------------------------------------------------------ */

const MAX_LIMIT = 50;
const MAX_DEPTH = 5;
const MAX_ARG_STRING = 256;
const MAX_ARG_COUNT = 20;

const primitive = z.union([
  z.string().max(MAX_ARG_STRING),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

function bounded(depth: number): z.ZodType<unknown> {
  if (depth >= MAX_DEPTH) return primitive;
  return z.union([
    primitive,
    z.array(z.lazy(() => bounded(depth + 1))).max(MAX_LIMIT),
    z
      .record(
        z.string().max(64),
        z.lazy(() => bounded(depth + 1)),
      )
      .refine((o) => Object.keys(o).length <= MAX_ARG_COUNT, {
        message: `too many keys (>${MAX_ARG_COUNT})`,
      }),
  ]);
}

const ArgsSchema = z.record(z.string().max(64), bounded(0)).refine(
  (o) => {
    const limit = (o as Record<string, unknown>).limit;
    if (typeof limit === "number" && limit > MAX_LIMIT) return false;
    return Object.keys(o).length <= MAX_ARG_COUNT;
  },
  { message: `args violate DoS guards (limit≤${MAX_LIMIT}, keys≤${MAX_ARG_COUNT})` },
);

const BodySchema = z.object({ args: ArgsSchema.optional() });

/* ------------------------------------------------------------------ */
/* 3. Rate limit — Upstash if configured, in-memory LRU fallback      */
/* ------------------------------------------------------------------ */

type RateLimiter = (ip: string) => Promise<{ ok: boolean; remaining: number }>;

const RL_WINDOW_MS = 60_000;
const RL_MAX = 60;

function createInMemoryLimiter(): RateLimiter {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  return async (ip) => {
    const now = Date.now();
    const bucket = buckets.get(ip);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS });
      return { ok: true, remaining: RL_MAX - 1 };
    }
    if (bucket.count >= RL_MAX) return { ok: false, remaining: 0 };
    bucket.count += 1;
    // Keep map bounded (LRU-ish: clear expired entries opportunistically)
    if (buckets.size > 10_000) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    }
    return { ok: true, remaining: RL_MAX - bucket.count };
  };
}

let upstashLimiter: RateLimiter | null = null;
function getLimiter(): RateLimiter {
  if (upstashLimiter) return upstashLimiter;
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_TOKEN;
  if (url && token && !url.includes("<") && !token.includes("<")) {
    try {
      // Dynamic require so missing envs don't break builds.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Ratelimit } = require("@upstash/ratelimit");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Redis } = require("@upstash/redis");
      const redis = new Redis({ url, token });
      const rl = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(RL_MAX, "1 m"),
        analytics: false,
        prefix: "luxon:rl",
      });
      upstashLimiter = async (ip: string) => {
        const r = await rl.limit(ip);
        return { ok: r.success, remaining: r.remaining };
      };
      return upstashLimiter;
    } catch {
      // Fall through to in-memory
    }
  }
  upstashLimiter = createInMemoryLimiter();
  return upstashLimiter;
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/* ------------------------------------------------------------------ */
/* 4. Vercel KV cache (optional)                                      */
/* ------------------------------------------------------------------ */

type KvClient = {
  get: <T>(k: string) => Promise<T | null>;
  set: (k: string, v: unknown, opts?: { ex?: number }) => Promise<unknown>;
};

let kvClient: KvClient | null | undefined;
function getKv(): KvClient | null {
  if (kvClient !== undefined) return kvClient;
  const url = process.env.KV_REST_API_URL || process.env.VERCEL_KV_REST_API_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.VERCEL_KV_REST_API_TOKEN;
  if (!url || !token || url.includes("<") || token.includes("<")) {
    kvClient = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { kv } = require("@vercel/kv");
    kvClient = kv as KvClient;
    return kvClient;
  } catch {
    kvClient = null;
    return null;
  }
}

function cacheKey(tool: string, args: unknown): string {
  return `luxon:${tool}:${JSON.stringify(args ?? {})}`;
}

/** Stock tools get dynamic TTL: 30s during KR market hours, 1d otherwise. */
function resolveTtl(tool: string, baseTtl: number): number {
  if (!tool.startsWith("krx_") && tool !== "krx_stock_price_chart") return baseTtl;
  const now = new Date();
  // Seoul timezone offset is UTC+9 (no DST); approximate with UTC + 9h.
  const seoul = new Date(now.getTime() + 9 * 3_600_000);
  const day = seoul.getUTCDay(); // 0 Sun..6 Sat
  const minutes = seoul.getUTCHours() * 60 + seoul.getUTCMinutes();
  const open = 9 * 60;
  const close = 15 * 60 + 30;
  const isWeekday = day >= 1 && day <= 5;
  const isOpen = isWeekday && minutes >= open && minutes <= close;
  return isOpen ? 30 : 86_400;
}

/* ------------------------------------------------------------------ */
/* 5. Response helpers                                                */
/* ------------------------------------------------------------------ */

type SuccessEnvelope = {
  success: true;
  data: unknown;
  cached?: boolean;
  ttl?: number;
};
type ErrorEnvelope = {
  success: false;
  error: { code: string; message: string };
};

function ok(
  data: unknown,
  meta: { cached?: boolean; ttl?: number } = {},
): NextResponse<SuccessEnvelope> {
  const body: SuccessEnvelope = { success: true, data };
  if (meta.cached !== undefined) body.cached = meta.cached;
  if (meta.ttl !== undefined) body.ttl = meta.ttl;
  return NextResponse.json(body);
}

function fail(
  code: string,
  message: string,
  status: number,
): NextResponse<ErrorEnvelope> {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status },
  );
}

/* ------------------------------------------------------------------ */
/* 6. Core handler (shared by GET + POST)                             */
/* ------------------------------------------------------------------ */

async function handle(
  req: NextRequest,
  tool: string,
  rawArgs: unknown,
): Promise<NextResponse> {
  // 6a. Whitelist check (prompt-injection defense)
  const mapping = TOOL_MAP[tool];
  if (!mapping) {
    return fail(
      "NOT_WHITELISTED",
      `Tool '${tool}' is not on the Luxon bridge whitelist.`,
      403,
    );
  }

  // 6b. Zod validation + DoS guards
  const parsed = BodySchema.safeParse({ args: rawArgs });
  if (!parsed.success) {
    return fail(
      "INVALID_INPUT",
      parsed.error.issues[0]?.message ?? "Invalid args.",
      400,
    );
  }
  const args = parsed.data.args ?? {};

  // 6c. Rate limit
  const ip = getClientIp(req);
  const limiter = getLimiter();
  const rl = await limiter(ip);
  if (!rl.ok) {
    return fail(
      "RATE_LIMITED",
      `Rate limit exceeded (${RL_MAX}/min). Try again shortly.`,
      429,
    );
  }

  // 6d. Cache lookup
  const kv = getKv();
  const key = cacheKey(mapping.real, args);
  const ttl = resolveTtl(tool, mapping.ttlSec);
  if (kv) {
    try {
      const cached = await kv.get<unknown>(key);
      if (cached !== null && cached !== undefined) {
        return ok(cached, { cached: true, ttl });
      }
    } catch {
      // Cache miss on error — continue to upstream
    }
  }

  // 6e. Upstream MCP call
  try {
    const data = await callTool(mapping.real, args);
    if (kv) {
      try {
        await kv.set(key, data, { ex: ttl });
      } catch {
        // Cache write failure is non-fatal
      }
    }
    return ok(data, { cached: false, ttl });
  } catch (err) {
    if (err instanceof McpError) {
      const status =
        err.code === "TIMEOUT"
          ? 504
          : err.code === "UNAUTHORIZED"
            ? 502
            : err.code === "NO_HOST"
              ? 503
              : 502;
      return fail(err.code, err.message, status);
    }
    return fail(
      "UPSTREAM_ERROR",
      err instanceof Error ? err.message : "Unknown upstream failure.",
      502,
    );
  }
}

/* ------------------------------------------------------------------ */
/* 7. GET + POST handlers                                             */
/* ------------------------------------------------------------------ */

type RouteContext = { params: Promise<{ tool: string[] }> };

function resolveTool(segments: string[] | undefined): string {
  if (!segments || segments.length === 0) return "";
  // Route is /api/luxon/[...tool] — last segment is the logical tool name.
  return segments[segments.length - 1] ?? "";
}

export async function GET(
  req: NextRequest,
  ctx: RouteContext,
): Promise<NextResponse> {
  const { tool: segments } = await ctx.params;
  const tool = resolveTool(segments);
  if (!tool) return fail("INVALID_INPUT", "Missing tool name in path.", 400);

  // Parse query string into args (flat object; values stay as strings —
  // tool implementations coerce as needed).
  const args: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((v, k) => {
    args[k] = v;
  });
  return handle(req, tool, args);
}

export async function POST(
  req: NextRequest,
  ctx: RouteContext,
): Promise<NextResponse> {
  const { tool: segments } = await ctx.params;
  const tool = resolveTool(segments);
  if (!tool) return fail("INVALID_INPUT", "Missing tool name in path.", 400);

  let body: unknown = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    return fail("INVALID_INPUT", "Body is not valid JSON.", 400);
  }
  if (typeof body !== "object" || body === null) {
    return fail("INVALID_INPUT", "Body must be a JSON object.", 400);
  }
  // Reject client attempts to inject systemPrompt or sibling metadata.
  const ALLOWED_KEYS = new Set(["args"]);
  for (const k of Object.keys(body)) {
    if (!ALLOWED_KEYS.has(k)) {
      return fail(
        "INVALID_INPUT",
        `Unexpected body key '${k}' (only 'args' accepted).`,
        400,
      );
    }
  }
  const args = (body as { args?: unknown }).args ?? {};
  return handle(req, tool, args);
}
