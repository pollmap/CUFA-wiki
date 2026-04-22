import Link from "next/link";

const sections = [
  { slug: "foundation", title: "기초 회계 (L1)", count: 23, state: "이식 예정" },
  { slug: "financial-analysis", title: "재무제표 분석 (L2)", count: 11, state: "이식 예정" },
  { slug: "industry-analysis", title: "산업분석 (L3)", count: 34, state: "이식 예정" },
  { slug: "company-analysis", title: "기업분석 (L4)", count: 11, state: "이식 예정" },
  { slug: "valuation", title: "밸류에이션", count: 12, state: "이식 예정" },
  { slug: "macro", title: "거시경제 & 시장", count: 6, state: "이식 + 확장 (→12)" },
  { slug: "trading", title: "매매 전략", count: 7, state: "이식 + 확장 (→10)" },
  { slug: "portfolio", title: "포트폴리오 & 리스크 ★", count: 11, state: "이식 + 확장 (→20)" },
  { slug: "assets", title: "자산별 심층 ★★", count: 50, state: "이식 + ETF/원자재/FX/대체 신규" },
  { slug: "products", title: "상품 & 구조 (신규)", count: 0, state: "전체 신규" },
  { slug: "market-structure", title: "시장 구조 (신규)", count: 0, state: "전체 신규" },
  { slug: "behavioral", title: "행동재무 (신규)", count: 0, state: "전체 신규" },
  { slug: "regulation", title: "규제 & 컴플라이언스 (신규)", count: 0, state: "전체 신규" },
  { slug: "history", title: "금융사 & 위기 (신규)", count: 0, state: "전체 신규" },
  { slug: "esg", title: "ESG & Sustainable (신규)", count: 0, state: "전체 신규" },
  { slug: "quant", title: "Quant System", count: 5, state: "이식" },
  { slug: "glossary", title: "용어사전", count: 5, state: "이식" },
];

export default function LearnIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-brand-accent)]">
        학습
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">
        투자분석 · 자산 · 상품 · 구조
      </h1>
      <p className="mt-4 max-w-2xl text-[color:var(--color-text-secondary)]">
        4-Layer 체계를 중심축으로 자산 클래스·상품·시장 구조·행동재무·규제까지.
        Tiered Disclosure로 초보자·중급·고급 동선 분리.
      </p>

      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.slug}
            href={`/learn/${s.slug}`}
            className="group rounded-xl border p-5 transition-shadow hover:shadow-md"
            style={{ backgroundColor: "var(--color-bg-surface)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-semibold">{s.title}</h2>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{
                  backgroundColor:
                    s.count > 0
                      ? "var(--color-brand-accent-soft)"
                      : "color-mix(in srgb, var(--color-live-signal) 20%, transparent)",
                  color: s.count > 0 ? "var(--color-brand-accent)" : "var(--color-live-signal)",
                }}
              >
                {s.count > 0 ? `${s.count} docs` : "신규"}
              </span>
            </div>
            <p className="mt-2 text-xs text-[color:var(--color-text-secondary)]">
              {s.state}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
