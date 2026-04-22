"use client";

/**
 * MCPQuery — client component + useLuxon hook for the Luxon MCP bridge.
 *
 * - SWR-style fetch with exponential retry (0.5s / 1s / 2s, max 3x)
 * - AbortController cancellation on unmount / args change
 * - Loading skeleton (animate-pulse) — error box with retry button
 * - Caller-provided render(data) for full styling control
 *
 * Security: NEVER accepts `systemPrompt` or arbitrary request bodies from
 * the caller — only the whitelisted `{ tool, args }` pair reaches the API.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Envelope types                                                      */
/* ------------------------------------------------------------------ */

export type LuxonEnvelope<T> =
  | { success: true; data: T; cached?: boolean; ttl?: number }
  | { success: false; error: { code: string; message: string } };

export type LuxonError = {
  code: string;
  message: string;
};

/* ------------------------------------------------------------------ */
/* useLuxon hook                                                       */
/* ------------------------------------------------------------------ */

export interface UseLuxonResult<T> {
  data: T | undefined;
  error: LuxonError | undefined;
  isLoading: boolean;
  cached: boolean;
  ttl: number | undefined;
  refetch: () => void;
}

const RETRY_DELAYS_MS = [500, 1_000, 2_000] as const;

/**
 * Fetch a Luxon MCP tool with 3x exponential retry.
 * Re-runs when tool/args change (deep-equal via JSON.stringify).
 */
export function useLuxon<T = unknown>(
  tool: string,
  args: Record<string, unknown> = {},
): UseLuxonResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<LuxonError | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [cached, setCached] = useState(false);
  const [ttl, setTtl] = useState<number | undefined>(undefined);
  const [nonce, setNonce] = useState(0);

  const argsKey = JSON.stringify(args);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setError(undefined);

      for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
        if (cancelled) return;
        try {
          const res = await fetch(
            `/api/luxon/${encodeURIComponent(tool)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ args }),
              signal: controller.signal,
              cache: "no-store",
            },
          );
          const envelope = (await res.json()) as LuxonEnvelope<T>;
          if (cancelled) return;
          if (envelope.success) {
            setData(envelope.data);
            setCached(envelope.cached ?? false);
            setTtl(envelope.ttl);
            setError(undefined);
            setIsLoading(false);
            return;
          }
          // Non-retryable client errors
          const code = envelope.error.code;
          const retryable =
            code !== "NOT_WHITELISTED" &&
            code !== "INVALID_INPUT" &&
            code !== "UNAUTHORIZED";
          if (!retryable || attempt === RETRY_DELAYS_MS.length) {
            setError(envelope.error);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          if (cancelled) return;
          if (err instanceof DOMException && err.name === "AbortError") return;
          if (attempt === RETRY_DELAYS_MS.length) {
            setError({
              code: "NETWORK_ERROR",
              message:
                err instanceof Error ? err.message : "Unknown network error.",
            });
            setIsLoading(false);
            return;
          }
        }
        const delay = RETRY_DELAYS_MS[attempt];
        if (delay === undefined) return;
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    void run();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // nonce triggers manual refetch; argsKey triggers on args change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, argsKey, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return { data, error, isLoading, cached, ttl, refetch };
}

/* ------------------------------------------------------------------ */
/* <MCPQuery /> component                                              */
/* ------------------------------------------------------------------ */

export interface MCPQueryProps<T = unknown> {
  /** Whitelisted tool name (e.g. 'ecos_interest_rate'). */
  tool: string;
  /** Arguments forwarded to the upstream MCP tool. */
  args?: Record<string, unknown>;
  /** Renderer called with upstream data on success. */
  render: (data: T, meta: { cached: boolean; ttl: number | undefined }) => ReactNode;
  /** Optional custom loading placeholder. */
  fallback?: ReactNode;
  /** Optional className for the wrapper element. */
  className?: string;
}

export function MCPQuery<T = unknown>({
  tool,
  args = {},
  render,
  fallback,
  className,
}: MCPQueryProps<T>): ReactNode {
  const { data, error, isLoading, cached, ttl, refetch } = useLuxon<T>(
    tool,
    args,
  );
  const retryRef = useRef<HTMLButtonElement>(null);

  if (isLoading) {
    return (
      <div
        className={className}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {fallback ?? (
          <div className="animate-pulse rounded-md border border-border bg-muted/40 p-4">
            <div className="mb-2 h-3 w-2/3 rounded bg-muted" />
            <div className="mb-2 h-3 w-5/6 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <span className="sr-only">Loading live data…</span>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={className}
        role="alert"
      >
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">
          <div className="font-semibold">
            Live data unavailable ({error.code})
          </div>
          <div className="mt-1 opacity-80">{error.message}</div>
          <button
            ref={retryRef}
            type="button"
            onClick={refetch}
            className="mt-3 inline-flex items-center rounded border border-red-500/50 px-3 py-1 text-xs font-medium hover:bg-red-500/20"
          >
            재시도
          </button>
        </div>
      </div>
    );
  }

  if (data === undefined) return null;

  return <div className={className}>{render(data, { cached, ttl })}</div>;
}

export default MCPQuery;
