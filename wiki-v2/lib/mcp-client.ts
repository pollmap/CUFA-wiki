/**
 * Luxon MCP Bridge — server-side client
 *
 * Forwards tool calls from the Next.js API to the nexus-finance-mcp VPS.
 * - Endpoint: `${MCP_VPS_HOST}/tools/${name}` (POST JSON body)
 * - Auth:     Authorization: Bearer ${MCP_AUTH_TOKEN}
 * - Timeout:  8s (AbortController)
 * - Errors:   McpError { code, message }
 *
 * Security (CLAUDE.md §보안 규정 v1):
 * - No hardcoded hosts/IPs/tokens (env vars only)
 * - Upstream errors never surface raw payload to client
 * - Caller (route handler) handles whitelist + Zod validation
 */

const DEFAULT_TIMEOUT_MS = 8_000;

export type McpErrorCode =
  | "TIMEOUT"
  | "UNAUTHORIZED"
  | "NOT_WHITELISTED"
  | "UPSTREAM_ERROR"
  | "NO_HOST";

export class McpError extends Error {
  readonly code: McpErrorCode;
  readonly status?: number;

  constructor(code: McpErrorCode, message: string, status?: number) {
    super(message);
    this.name = "McpError";
    this.code = code;
    this.status = status;
  }
}

export interface CallToolOptions {
  /** Override default 8s timeout (ms). */
  timeoutMs?: number;
  /** Optional AbortSignal from caller (composed with internal timeout). */
  signal?: AbortSignal;
}

/**
 * Invoke a whitelisted MCP tool on the Luxon VPS.
 * The route handler must validate the tool name against TOOL_MAP before
 * calling this — this function trusts its input.
 */
export async function callTool(
  name: string,
  args: unknown,
  options: CallToolOptions = {},
): Promise<unknown> {
  const host = process.env.MCP_VPS_HOST;
  const token = process.env.MCP_AUTH_TOKEN;

  if (!host || host.includes("<") || host.includes(">")) {
    throw new McpError(
      "NO_HOST",
      "MCP_VPS_HOST is not configured (env var missing or placeholder).",
    );
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), timeoutMs);

  // Compose caller signal with internal timeout
  const onCallerAbort = () => controller.abort("caller-abort");
  if (options.signal) {
    if (options.signal.aborted) {
      clearTimeout(timer);
      throw new McpError("TIMEOUT", "Caller aborted before request.");
    }
    options.signal.addEventListener("abort", onCallerAbort, { once: true });
  }

  const url = `${host.replace(/\/$/, "")}/tools/${encodeURIComponent(name)}`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token && !token.includes("<")) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ args: args ?? {} }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (res.status === 401 || res.status === 403) {
      throw new McpError(
        "UNAUTHORIZED",
        `MCP upstream rejected credentials (${res.status}).`,
        res.status,
      );
    }

    if (!res.ok) {
      throw new McpError(
        "UPSTREAM_ERROR",
        `MCP upstream returned ${res.status}.`,
        res.status,
      );
    }

    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      // Non-JSON upstream body — treat as opaque string payload.
      return text;
    }
  } catch (err) {
    if (err instanceof McpError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new McpError(
        "TIMEOUT",
        `MCP call '${name}' timed out after ${timeoutMs}ms.`,
      );
    }
    throw new McpError(
      "UPSTREAM_ERROR",
      err instanceof Error ? err.message : "Unknown upstream failure.",
    );
  } finally {
    clearTimeout(timer);
    if (options.signal) {
      options.signal.removeEventListener("abort", onCallerAbort);
    }
  }
}
