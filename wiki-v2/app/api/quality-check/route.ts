/**
 * /api/quality-check — CI 품질 게이트 (PR runner에서 curl 호출)
 *
 * `scripts/quality-check.ts`의 핵심 규칙을 HTTP로 노출:
 *   1. 보안 grep ban (CLAUDE.md 보안 규정 v1)
 *   2. 필수 블록 존재 (<WhatYouWillLearn>, <Related>)
 *   3. <SourceCitation/> 최소 개수 (≥2)
 *   4. 한국어 비율 (≥0.7)
 *
 * 응답: ok=true → 200, 위반 → 422. 본문 파싱/스키마 실패 → 400.
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z
  .object({
    content: z.string().min(1).max(500_000),
    slug: z.string().max(256).optional(),
  })
  .strict();

type Severity = "CRITICAL" | "HIGH";

interface BanPattern {
  readonly name: string;
  readonly re: RegExp;
  readonly severity: Severity;
}

const BAN_PATTERNS: readonly BanPattern[] = [
  { name: "VPS IP", re: /62\.171\.141\.206/g, severity: "CRITICAL" },
  { name: "WSL SSH target", re: /valuealpha@10\.0\.0\.2/g, severity: "CRITICAL" },
  { name: "Personal handle", re: /lch6817556/g, severity: "HIGH" },
  { name: "Private key", re: /BEGIN .* PRIVATE KEY/g, severity: "CRITICAL" },
  {
    name: "Telegram token",
    re: /\b\d{8,12}:AA[A-Za-z0-9_-]{30,}\b/g,
    severity: "CRITICAL",
  },
  { name: "Windows user path", re: /C:[\\/]Users[\\/]lch68/gi, severity: "HIGH" },
  { name: "Private vault path", re: /\/root\/obsidian-vault/g, severity: "CRITICAL" },
  { name: "OpenAI API key", re: /sk-[A-Za-z0-9]{20,}/g, severity: "CRITICAL" },
  { name: "AWS access key", re: /\bAKIA[0-9A-Z]{16}\b/g, severity: "CRITICAL" },
];

interface RequireBlock {
  readonly name: string;
  readonly re: RegExp;
}

const REQUIRE_BLOCKS: readonly RequireBlock[] = [
  { name: "<WhatYouWillLearn>", re: /<WhatYouWillLearn/ },
  { name: "<Related>", re: /<Related/ },
];

const MIN_SOURCES = 2;
const MIN_KOREAN_RATIO = 0.7;

interface SecurityViolation {
  readonly rule: string;
  readonly severity: Severity;
  readonly count: number;
}

function checkSecurity(content: string): SecurityViolation[] {
  const violations: SecurityViolation[] = [];
  for (const p of BAN_PATTERNS) {
    // `re` is declared with /g — create a fresh matcher to avoid lastIndex bleed.
    const matches = content.match(new RegExp(p.re.source, p.re.flags));
    if (matches && matches.length > 0) {
      violations.push({ rule: p.name, severity: p.severity, count: matches.length });
    }
  }
  return violations;
}

function checkMissingBlocks(content: string): string[] {
  return REQUIRE_BLOCKS.filter((b) => !b.re.test(content)).map((b) => b.name);
}

function countSources(content: string): number {
  return (content.match(/<SourceCitation/g) ?? []).length;
}

function koreanRatio(content: string): number {
  // Count Korean Hangul syllables vs. Hangul + ASCII letters (ignoring
  // whitespace, code fences, and punctuation-only tokens).
  const koMatches = content.match(/[가-힣]/g) ?? [];
  const asciiLetters = content.match(/[A-Za-z]/g) ?? [];
  const total = koMatches.length + asciiLetters.length;
  if (total === 0) return 1;
  return koMatches.length / total;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid json" },
      { status: 400 },
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { content, slug } = parsed.data;

  const security = checkSecurity(content);
  const missingBlocks = checkMissingBlocks(content);
  const sourceCount = countSources(content);
  const sourcesPass = sourceCount >= MIN_SOURCES;
  const ratio = koreanRatio(content);
  const koreanPass = ratio >= MIN_KOREAN_RATIO;

  const ok =
    security.length === 0 &&
    missingBlocks.length === 0 &&
    sourcesPass &&
    koreanPass;

  return NextResponse.json(
    {
      ok,
      slug: slug ?? null,
      violations: {
        security,
        missingBlocks,
        sources: {
          required: MIN_SOURCES,
          got: sourceCount,
          pass: sourcesPass,
        },
        korean: {
          ratio: Number(ratio.toFixed(3)),
          required: MIN_KOREAN_RATIO,
          pass: koreanPass,
        },
      },
    },
    { status: ok ? 200 : 422 },
  );
}
