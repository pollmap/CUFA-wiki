import Link from "next/link";
import { CALC_CATEGORY_LABEL, CALC_REGISTRY } from "@/lib/calculator-registry";

const futureTools = [
  { label: "PEG Screener", section: "주식", status: "이식" },
  { label: "Factor Exposure", section: "포폴", status: "신규" },
  { label: "ETF Screener", section: "ETF", status: "신규" },
  { label: "Portfolio Rebalancer", section: "포폴", status: "신규" },
  { label: "Yield Curve Visualizer", section: "채권", status: "신규" },
  { label: "Credit Spread Tracker", section: "채권", status: "신규" },
  { label: "Bond Ladder Builder", section: "채권", status: "신규" },
  { label: "Option Pricer (BS)", section: "파생", status: "이식" },
  { label: "Options Payoff Diagram", section: "파생", status: "신규" },
  { label: "Implied Vol Surface", section: "파생", status: "신규" },
  { label: "Futures Basis / Carry", section: "파생", status: "신규" },
  { label: "Portfolio Simulator", section: "포폴", status: "확장" },
  { label: "Efficient Frontier", section: "포폴", status: "신규" },
  { label: "Monte Carlo Retirement", section: "포폴", status: "신규" },
  { label: "Risk Parity Allocator", section: "포폴", status: "신규" },
  { label: "Correlation Heatmap", section: "포폴", status: "신규" },
  { label: "Inflation Impact", section: "매크로", status: "신규" },
  { label: "FX Carry", section: "FX", status: "신규" },
  { label: "Mortgage Calculator", section: "부동산", status: "이식" },
  { label: "REIT Screener", section: "부동산", status: "신규" },
  { label: "Cap Rate / LTV / DSCR", section: "부동산", status: "신규" },
  { label: "DeFi Yield", section: "크립토", status: "신규" },
  { label: "Stablecoin Depeg", section: "크립토", status: "신규" },
  { label: "Bias Self-Audit", section: "행동", status: "신규" },
  { label: "Market Survivor", section: "교육", status: "이식" },
  { label: "Crisis Timeline", section: "교육", status: "신규" },
  { label: "Economic Calendar", section: "매크로", status: "이식" },
  { label: "Pension Projection", section: "연금", status: "신규" },
  { label: "TDF Glide Path", section: "연금", status: "신규" },
  { label: "ELS Payoff", section: "구조화", status: "신규" },
  { label: "MCP Live Dashboard", section: "라이브", status: "신규" },
  { label: "Finance MBTI", section: "취업", status: "이식" },
  { label: "Quiz + 자격증 모의고사", section: "전역", status: "확장" },
];

export default function ToolsIndexPage() {
  return (
    <div className="container-wide py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-vermilion)]">
        도구 · 데이터
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">
        인터랙티브 계산기 + 로드맵
      </h1>
      <p className="mt-4 max-w-2xl text-[color:var(--color-ink-soft)]">
        12개 핵심 계산기는 각 독립 랜딩에서 수식·예시·관련 학습 링크와 함께
        실행된다. 나머지는 Phase 2 — Luxon MCP 라이브 대시보드 + HERMES AI
        어시스턴트와 함께 연결.
      </p>

      <section aria-labelledby="core-calcs" className="mt-12">
        <h2
          id="core-calcs"
          className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-ink-muted)]"
        >
          Core 12 — 독립 랜딩
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CALC_REGISTRY.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/tools/calc/${c.slug}`}
                className="block rounded-md border p-4 no-underline transition-colors hover:border-[color:var(--color-vermilion)]"
                style={{ backgroundColor: "var(--color-paper-soft)" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-ink-muted)]">
                  {CALC_CATEGORY_LABEL[c.category]}
                </p>
                <p className="mt-1 text-base font-bold text-[color:var(--color-ink)]">
                  {c.title}
                </p>
                <p className="mt-1 text-xs text-[color:var(--color-ink-muted)]">
                  {c.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="future-tools" className="mt-16">
        <h2
          id="future-tools"
          className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-ink-muted)]"
        >
          Phase 2 로드맵
        </h2>
        <div
          className="mt-4 overflow-x-auto rounded-md border"
          style={{ backgroundColor: "var(--color-paper-soft)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wider text-[color:var(--color-ink-muted)]">
                <th className="px-4 py-3">도구</th>
                <th className="px-4 py-3">섹션</th>
                <th className="px-4 py-3">상태</th>
              </tr>
            </thead>
            <tbody>
              {futureTools.map((t) => (
                <tr key={t.label} className="border-b last:border-0">
                  <td className="px-4 py-2.5 font-medium">{t.label}</td>
                  <td className="px-4 py-2.5 text-[color:var(--color-ink-muted)]">
                    {t.section}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        backgroundColor:
                          t.status === "신규"
                            ? "color-mix(in srgb, var(--color-success) 18%, transparent)"
                            : t.status === "확장"
                              ? "color-mix(in srgb, var(--color-warning) 18%, transparent)"
                              : "var(--color-vermilion-soft)",
                        color:
                          t.status === "신규"
                            ? "var(--color-success)"
                            : t.status === "확장"
                              ? "var(--color-warning)"
                              : "var(--color-vermilion)",
                      }}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
