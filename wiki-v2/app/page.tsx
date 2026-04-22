import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Beaker, Map, Briefcase } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import {
  learnDocs,
  researchDocs,
  careerDocs,
  companies,
  fieldNotes,
} from "#content";

// 인터랙티브 계산기 수 — components/tools 아래 구체 계산기 컴포넌트
// (Calculator.tsx, Quiz.tsx 는 범용 래퍼이므로 집계에서 제외)
const INTERACTIVE_TOOLS_COUNT = 12;

const counts = {
  learn: learnDocs.length,
  research: researchDocs.length,
  fieldNotes: fieldNotes.length,
  companies: companies.length,
  career: careerDocs.length,
  tools: INTERACTIVE_TOOLS_COUNT,
} as const;

const fmt = (n: number) => n.toLocaleString("ko-KR");

const shortcutTracks = [
  {
    icon: BookOpen,
    label: "학습",
    href: "/learn",
    docs: counts.learn,
    hint: "4-Layer 투자분석 · 자산별 심층 · 상품·구조",
  },
  {
    icon: Compass,
    label: "기업·산업",
    href: "/industries",
    docs: counts.companies,
    hint: "5 산업 · DART LIVE",
    live: true,
  },
  {
    icon: Beaker,
    label: "도구",
    href: "/tools",
    docs: counts.tools,
    hint: "계산기 · 시뮬레이터 · Live 대시보드",
  },
  {
    icon: Map,
    label: "리서치",
    href: "/research",
    docs: counts.research,
    hint: `CUFA 리서치 · 현장 노트 ${fmt(counts.fieldNotes)} · 투자 대가`,
  },
  {
    icon: Briefcase,
    label: "커리어",
    href: "/career",
    docs: counts.career,
    hint: "직무 · 자격증 · 공모전",
  },
] as const;

const recent = [
  {
    kicker: "리서치 · 조선업",
    title: "HD현대중공업 2026 수주 회복 분석",
    href: "/research/equity/hd-hhi",
    date: "2026-04-20",
    meta: "초안 · 25분",
    diff: "advanced",
  },
  {
    kicker: "학습 · 밸류에이션",
    title: "DCF — 현재가치 할인의 원리",
    href: "/learn/valuation/dcf",
    date: "2026-04-18",
    meta: "12분 · Damodaran 인용",
    diff: "intermediate",
  },
  {
    kicker: "학습 · 채권",
    title: "듀레이션과 컨벡서티",
    href: "/learn/assets/bonds/duration",
    date: "2026-04-17",
    meta: "10분 · 수식 유도 포함",
    diff: "intermediate",
  },
  {
    kicker: "도구 · 계산기",
    title: "WACC 계산기 (민감도 포함)",
    href: "/tools/calculators/wacc",
    date: "2026-04-15",
    meta: "인터랙티브",
    diff: "beginner",
  },
  {
    kicker: "학습 · 기초 회계",
    title: "재무상태표 — 자산·부채·자본의 관계",
    href: "/learn/foundation/balance-sheet",
    date: "2026-04-14",
    meta: "8분 · 초심자",
    diff: "beginner",
  },
] as const;

const learningPaths = [
  {
    code: "P1",
    title: "주식 분석 처음이에요",
    days: 14,
    steps: "회계 → 재무분석 → 밸류에이션 → 첫 리포트",
    href: "/learn/paths/stocks-first",
  },
  {
    code: "P2",
    title: "ETF로 시작",
    days: 7,
    steps: "자산배분 → 비용·추적오차 → 포트폴리오 설계",
    href: "/learn/paths/etf-first",
  },
  {
    code: "P3",
    title: "퇴직연금 굴리기",
    days: 5,
    steps: "DC/DB/IRP → TDF → 글라이드패스 → 운용 점검",
    href: "/learn/paths/pension",
  },
  {
    code: "P4",
    title: "금융권 취업 로드맵",
    days: 90,
    steps: "직무 진단 → 합격 요건 → 자격증 → 공모전",
    href: "/learn/paths/finance-job",
  },
];

const totalDocs =
  counts.learn + counts.research + counts.career + counts.companies + counts.fieldNotes;

const stats = [
  {
    label: "전체 문서",
    value: fmt(totalDocs),
    hint: `학습 ${fmt(counts.learn)} · 리서치 ${fmt(counts.research)} · 기업 ${fmt(counts.companies)} · 커리어 ${fmt(counts.career)}`,
  },
  {
    label: "인터랙티브 도구",
    value: fmt(counts.tools),
    hint: "계산기 · 시뮬레이터",
  },
  {
    label: "현장 노트",
    value: fmt(counts.fieldNotes),
    hint: "거제·송도·부산신항·평택",
  },
  {
    label: "MCP 도구",
    value: "398",
    hint: "DART·ECOS·KRX·FRED",
  },
];

const diffClass: Record<string, string> = {
  beginner: "badge badge--beginner",
  intermediate: "badge badge--intermediate",
  advanced: "badge badge--advanced",
};

export default function HomePage() {
  return (
    <>
      {/* Above-the-fold: 검색 + 바로 가기 */}
      <section className="border-b border-[color:var(--color-rule)]">
        <div className="container-wide py-10 md:py-14">
          <p className="label-caps rise rise-d1">
            한국어 금융·투자 레퍼런스 · {new Date().getFullYear()}
          </p>
          <h1 className="mt-3 max-w-3xl rise rise-d2">
            검색하거나, 학습 트랙으로 바로 진입하세요.
          </h1>

          <div className="mt-6 max-w-2xl rise rise-d3">
            <SearchBar variant="hero" />
            <p className="mt-2 text-xs text-[color:var(--color-ink-muted)]">
              단축키 <kbd>/</kbd> 로 아무 곳에서나 검색.&nbsp;
              <kbd>g</kbd>+<kbd>l</kbd> 학습,&nbsp;
              <kbd>g</kbd>+<kbd>r</kbd> 리서치,&nbsp;
              <kbd>g</kbd>+<kbd>t</kbd> 도구.
            </p>
          </div>

          {/* Track shortcuts — 백준 "문제집"처럼 기능 우선 */}
          <nav
            aria-label="트랙 바로가기"
            className="mt-10 grid gap-3 rise rise-d4 md:grid-cols-5"
          >
            {shortcutTracks.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="group flex items-center gap-3 border border-[color:var(--color-rule)] p-4 no-underline transition-colors hover:border-[color:var(--color-vermilion)]"
              >
                <t.icon
                  className="h-5 w-5 shrink-0 text-[color:var(--color-ink-soft)] group-hover:text-[color:var(--color-vermilion)]"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-bold">
                    {t.label}
                    {"live" in t && t.live && (
                      <span
                        className="rounded-sm px-1 py-0.5 text-[9px] font-black"
                        style={{
                          backgroundColor: "var(--color-vermilion)",
                          color: "var(--color-paper)",
                        }}
                      >
                        LIVE
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-[color:var(--color-ink-muted)]">
                    {fmt(t.docs)}편 · {t.hint}
                  </p>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* Recent + Paths 2단 */}
      <section className="container-wide grid gap-12 py-14 md:grid-cols-[1.6fr_1fr]">
        {/* Recent updates */}
        <div>
          <div className="flex items-baseline justify-between border-b border-[color:var(--color-rule)] pb-3">
            <h2 className="!mt-0 text-xl">최근 업데이트</h2>
            <Link href="/changelog" className="label-caps no-underline hover:text-[color:var(--color-vermilion)]">
              전체 보기 →
            </Link>
          </div>
          <ol className="mt-4">
            {recent.map((r, i) => (
              <li
                key={r.href}
                className={
                  "flex flex-col gap-1.5 py-4 md:flex-row md:items-baseline md:justify-between md:gap-5 " +
                  (i > 0 ? "border-t border-[color:var(--color-rule)]" : "")
                }
              >
                <div className="min-w-0">
                  <p className="label-caps">{r.kicker}</p>
                  <Link
                    href={r.href}
                    className="mt-0.5 block text-[1.02rem] font-bold leading-snug no-underline hover:text-[color:var(--color-vermilion)]"
                  >
                    {r.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-[color:var(--color-ink-muted)]">
                    {r.meta}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={diffClass[r.diff]}>{r.diff}</span>
                  <time
                    className="font-mono text-xs text-[color:var(--color-ink-muted)]"
                    dateTime={r.date}
                  >
                    {r.date}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Learning paths */}
        <div>
          <div className="flex items-baseline justify-between border-b border-[color:var(--color-rule)] pb-3">
            <h2 className="!mt-0 text-xl">학습 경로</h2>
            <Link href="/learn/paths" className="label-caps no-underline hover:text-[color:var(--color-vermilion)]">
              전체 →
            </Link>
          </div>
          <ol className="mt-4 space-y-4">
            {learningPaths.map((p) => (
              <li key={p.code}>
                <Link
                  href={p.href}
                  className="group block border-l-2 border-[color:var(--color-rule)] pl-4 no-underline transition-colors hover:border-[color:var(--color-vermilion)]"
                >
                  <p className="flex items-baseline gap-2 text-sm font-bold">
                    <span className="font-mono text-xs text-[color:var(--color-vermilion)]">
                      {p.code}
                    </span>
                    <span>{p.title}</span>
                    <span className="ml-auto font-mono text-xs text-[color:var(--color-ink-muted)]">
                      {p.days}일
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--color-ink-muted)]">
                    {p.steps}
                  </p>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Stats strip — 실용 통계 */}
      <section
        className="border-y border-[color:var(--color-rule)]"
        style={{ backgroundColor: "var(--color-paper-soft)" }}
      >
        <div className="container-wide py-10">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="label-caps">{s.label}</dt>
                <dd className="stat-number mt-1">{s.value}</dd>
                <p className="mt-1 text-xs text-[color:var(--color-ink-muted)]">
                  {s.hint}
                </p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Why / 편집 원칙 — 짧게 */}
      <section className="container-wide py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="label-caps">출처 엄격</p>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
              FRED · 한국은행 ECOS · DART · OECD · BIS · 동료검토 논문에 기반한다.
              목업·가공·할루시네이션은 반려된다.
            </p>
          </div>
          <div>
            <p className="label-caps">현장 우선</p>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
              거제·송도·부산신항·평택의 현장 방문 노트를 공시 분석과 함께
              읽는다. 리서치의 1차 데이터 축이다.
            </p>
          </div>
          <div>
            <p className="label-caps">초보자 & 전문가 공존</p>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
              본문은 박사급 깊이로, 우측 마진노트는 원어·유도·한국 맥락을
              보충. 수준에 맞게 고르며 읽는다.
            </p>
          </div>
        </div>

        <p className="mt-14 text-center text-xs text-[color:var(--color-ink-muted)]">
          v1 위키는{" "}
          <a
            href="https://pollmap.github.io/Value_Alpha/"
            className="font-semibold"
          >
            pollmap.github.io/Value_Alpha
          </a>
          에서 계속 이용 가능합니다. v2는 Phase 1 IA 이식 진행 중.
        </p>
      </section>
    </>
  );
}
