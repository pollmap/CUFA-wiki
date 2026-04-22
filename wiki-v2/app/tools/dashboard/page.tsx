import { MacroIndicator } from "@/components/live/MacroIndicator";

export const metadata = {
  title: "Live 대시보드 — CUFA",
  description: "ECOS 거시 지표 + KRX 시장 요약 + DART 공시 흐름. Luxon MCP 398도구 연동.",
};

const MACRO_CARDS = [
  { indicator: "interest_rate", label: "기준금리", source: "한국은행 ECOS" },
  { indicator: "cpi", label: "CPI (소비자물가)", source: "한국은행 ECOS" },
  { indicator: "exchange_rate", label: "원/달러 환율", source: "한국은행 ECOS" },
  { indicator: "gdp", label: "명목 GDP", source: "한국은행 ECOS" },
  { indicator: "bond_yield", label: "국고채 3Y 금리", source: "한국은행 ECOS" },
] as const;

export default function DashboardPage() {
  return (
    <div className="container-wide py-10">
      <header className="mb-8">
        <p className="label-caps">Tools · Live</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Live 대시보드
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
          Luxon nexus-finance-mcp 398도구를 통한 실시간 거시·시장 데이터.
          Vercel KV 캐시로 TTL 차등 적용 (기준금리 1hr · DART 5min · 주가 30s).
        </p>
      </header>

      <section aria-labelledby="macro" className="mb-10">
        <h2 id="macro" className="mb-4 text-xl font-bold">
          거시 지표
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MACRO_CARDS.map((m) => (
            <article
              key={m.indicator}
              className="rounded border border-[color:var(--color-ink-muted)] bg-paper-surface p-4"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold">{m.label}</h3>
                <span className="text-[0.65rem] uppercase tracking-wider text-[color:var(--color-ink-muted)]">
                  {m.source}
                </span>
              </div>
              <MacroIndicator indicator={m.indicator} range="5Y" />
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="note"
        className="rounded border border-dashed border-[color:var(--color-ink-muted)] p-4 text-xs text-[color:var(--color-ink-muted)]"
      >
        <h2 id="note" className="sr-only">
          데이터 출처 공지
        </h2>
        데이터는 한국은행 ECOS / 금융감독원 DART / KRX / FRED 공식 API를 통해
        Luxon MCP 게이트웨이에서 전달됩니다. 학습 목적이며, 투자 권유가 아닙니다.
        캐시 TTL: 기준금리 1시간 · DART 5분 · 주가 장중 30초 · 장마감 1일.
      </section>
    </div>
  );
}
