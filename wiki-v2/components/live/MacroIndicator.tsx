"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis, XAxis } from "recharts";
import { MCPQuery } from "@/components/live/MCPQuery";

/**
 * MacroIndicator — 거시 지표 카드. ECOS 계열 MCP 도구로 시계열을 받아
 * 최신값 · YoY% · 120px mini line chart 를 표시한다.
 */
export type MacroIndicatorKind =
  | "interest_rate"
  | "cpi"
  | "gdp"
  | "exchange_rate"
  | "bond_yield";

export interface MacroIndicatorProps {
  indicator: MacroIndicatorKind;
  range?: "1Y" | "5Y" | "10Y";
}

interface ECOSPoint {
  date?: string;
  value?: number;
}

interface ECOSPayload {
  series?: ECOSPoint[];
  unit?: string;
}

const TOOL_MAP: Record<MacroIndicatorKind, string> = {
  interest_rate: "ecos_interest_rate",
  cpi: "ecos_cpi",
  gdp: "ecos_gdp",
  exchange_rate: "ecos_exchange_rate",
  bond_yield: "ecos_bond_yield",
};

const LABEL_MAP: Record<MacroIndicatorKind, string> = {
  interest_rate: "기준금리",
  cpi: "소비자물가지수",
  gdp: "GDP 성장률",
  exchange_rate: "원/달러 환율",
  bond_yield: "국고채 수익률",
};

function normalize(data: unknown): { series: ECOSPoint[]; unit: string } {
  try {
    const payload = data as ECOSPayload | null | undefined;
    const series = Array.isArray(payload?.series) ? (payload?.series ?? []) : [];
    const unit = typeof payload?.unit === "string" ? payload.unit : "";
    return { series, unit };
  } catch {
    return { series: [], unit: "" };
  }
}

function pickLatest(series: ECOSPoint[]): { latest: number | null; yoy: number | null } {
  const clean = series.filter(
    (p): p is { date: string; value: number } =>
      typeof p.date === "string" && typeof p.value === "number",
  );
  if (clean.length === 0) return { latest: null, yoy: null };

  const last = clean[clean.length - 1];
  if (!last) return { latest: null, yoy: null };

  // 1년 전 대비: 12개월 간격 가정, 데이터 포인트 개수로 오프셋 추정
  const yearOffset = Math.min(12, clean.length - 1);
  const prior = clean[clean.length - 1 - yearOffset];
  if (!prior || prior.value === 0) {
    return { latest: last.value, yoy: null };
  }
  const yoy = ((last.value - prior.value) / Math.abs(prior.value)) * 100;
  return { latest: last.value, yoy };
}

function formatNumber(v: number | null, unit: string): string {
  if (v === null || !Number.isFinite(v)) return "-";
  const abs = Math.abs(v);
  const digits = abs >= 1000 ? 0 : abs >= 10 ? 2 : 3;
  return `${v.toFixed(digits)}${unit ? ` ${unit}` : ""}`;
}

export function MacroIndicator({ indicator, range = "5Y" }: MacroIndicatorProps) {
  const tool = TOOL_MAP[indicator];
  const label = LABEL_MAP[indicator];

  return (
    <MCPQuery
      tool={tool}
      args={{ range }}
      render={(data: unknown) => {
        const { series, unit } = normalize(data);

        if (series.length === 0) {
          return (
            <div className="rounded-md border border-dashed p-4 text-sm text-[var(--color-ink-muted,#6b6b6b)]">
              {label} 데이터 없음
            </div>
          );
        }

        const { latest, yoy } = pickLatest(series);
        const up = (yoy ?? 0) >= 0;
        const accent = up ? "#c8372d" : "#2f8a4a";
        const arrow = up ? "▲" : "▼";

        const chartData = series
          .filter(
            (p): p is { date: string; value: number } =>
              typeof p.date === "string" && typeof p.value === "number",
          )
          .map((p) => ({ date: p.date, value: p.value }));

        return (
          <div className="flex flex-col gap-2 rounded-md border border-l-4 border-[var(--color-vermilion)] bg-[var(--color-paper-soft)] p-4 transition-colors hover:bg-[var(--color-paper-sunk)]">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-wide text-[var(--color-ink-muted,#6b6b6b)]">
                {label}
              </span>
              {yoy !== null && (
                <span
                  className="text-xs font-medium"
                  style={{ color: accent }}
                  aria-label={`YoY ${up ? "상승" : "하락"} ${Math.abs(yoy).toFixed(2)}%`}
                >
                  {arrow} {Math.abs(yoy).toFixed(2)}% YoY
                </span>
              )}
            </div>
            <div className="text-2xl font-bold">{formatNumber(latest, unit)}</div>
            <div style={{ width: "100%", height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={["auto", "auto"]} hide />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-paper)",
                      border: "1px solid var(--color-paper-sunk)",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "var(--color-ink, #262017)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={accent}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }}
    />
  );
}
