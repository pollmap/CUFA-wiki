import Link from "next/link";

const industries = [
  { slug: "banking", label: "은행", metric: "예대마진 · BIS · NIM" },
  { slug: "securities", label: "증권", metric: "브로커리지 · IB · 자기매매" },
  { slug: "insurance", label: "보험", metric: "언더라이팅 · IFRS17 · 계리" },
  { slug: "card-capital", label: "여신금융", metric: "카드 · 캐피탈 · 할부" },
  { slug: "asset-management", label: "자산운용", metric: "AUM · 운용전략" },
];

export default function IndustriesIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-brand-accent)]">
          기업·산업
        </p>
        <span
          className="live-pulse ml-3 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-live-signal) 18%, transparent)",
            color: "var(--color-live-signal)",
          }}
        >
          LIVE
        </span>
      </div>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">
        5대 산업 + 170+ 기업 · Live 공시
      </h1>
      <p className="mt-4 max-w-2xl text-[color:var(--color-text-secondary)]">
        각 기업 페이지에 DART 최신 공시 · 실시간 주가 차트 · 핵심 재무 YoY ·
        관련 CUFA 리서치가 연결됩니다. Phase 2에서 Luxon MCP 398도구 연동.
      </p>

      <h2 className="mt-12 text-2xl font-bold">산업 가이드</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {industries.map((i) => (
          <Link
            key={i.slug}
            href={`/industries/${i.slug}`}
            className="rounded-xl border p-5 hover:shadow-md"
            style={{ backgroundColor: "var(--color-bg-surface)" }}
          >
            <p className="text-lg font-semibold">{i.label}</p>
            <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">{i.metric}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-16 text-2xl font-bold">기업 총람</h2>
      <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
        은행 · 증권 · 보험 · 카드·캐피탈 · 자산운용 · VC·PEF · 핀테크 · 공공·규제.
        Phase 1에서 170+ 기업 디렉토리 이식 후 Phase 2에서 Live 공시 연동.
      </p>
    </div>
  );
}
