import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Limiter = {
  limit: (key: string) => Promise<{ success: boolean; remaining: number; reset: number }>;
};

function memoryLimiter(windowMs: number, max: number): Limiter {
  const hits = new Map<string, number[]>();
  return {
    async limit(key) {
      const now = Date.now();
      const windowStart = now - windowMs;
      const list = (hits.get(key) ?? []).filter((t) => t > windowStart);
      if (list.length >= max) {
        const oldest = list[0] ?? now;
        return { success: false, remaining: 0, reset: oldest + windowMs };
      }
      list.push(now);
      hits.set(key, list);
      return { success: true, remaining: max - list.length, reset: now + windowMs };
    },
  };
}

let mcpLimiter: Limiter | null = null;
let healthLimiter: Limiter | null = null;

function buildRemoteLimiter(max: number, window: "60 s" | "300 s"): Limiter {
  const url = process.env.UPSTASH_REDIS_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return memoryLimiter(window === "60 s" ? 60_000 : 300_000, max);
  const redis = new Redis({ url, token });
  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, window),
    analytics: false,
    prefix: "cufa:mcp",
  });
  return {
    async limit(key) {
      const r = await rl.limit(key);
      return { success: r.success, remaining: r.remaining, reset: r.reset };
    },
  };
}

export function getMcpLimiter(): Limiter {
  if (!mcpLimiter) mcpLimiter = buildRemoteLimiter(60, "60 s");
  return mcpLimiter;
}

export function getHealthLimiter(): Limiter {
  if (!healthLimiter) healthLimiter = buildRemoteLimiter(5, "60 s");
  return healthLimiter;
}

export function clientKey(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
