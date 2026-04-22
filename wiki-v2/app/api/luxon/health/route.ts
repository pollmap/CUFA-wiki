import { NextResponse, type NextRequest } from "next/server";
import { callTool, McpError } from "@/lib/mcp-client";
import { clientKey, getHealthLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rl = await getHealthLimiter().limit(clientKey(req));
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: "rate limited" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000))),
        },
      },
    );
  }

  try {
    const data = await callTool("gateway_status", {});
    return NextResponse.json(
      { success: true, data },
      { status: 200, headers: { "Cache-Control": "public, s-maxage=30" } },
    );
  } catch (err) {
    const status = err instanceof McpError ? err.status ?? 502 : 502;
    return NextResponse.json(
      { success: false, error: err instanceof McpError ? err.message : "upstream failure" },
      { status },
    );
  }
}
