import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/breadcrumb";

/**
 * /about/chanhee — 이찬희 narrative page.
 *
 * Public profile (GitHub handle: pollmap). Real name disclosure is opt-in and
 * confirmed per task. Contains no private addresses, phone, email, or tokens.
 */

export const metadata: Metadata = {
  title: "이찬희 — 현장 1차 데이터 + AI 구조화 리서처",
  description:
    "CUFA 2대 회장 · Luxon AI 창업자. 254회 현장 방문 + Luxon MCP 398 도구 + 5년 가치투자 경험을 결합한 1차-데이터 우선 리서치 운영자.",
};

interface TimelineEntry {
  year: string;
  headline: string;
  detail: string;
}

const TIMELINE: readonly TimelineEntry[] = [
  {
    year: "2021",
    headline: "충북대 경영학과 입학",
    detail: "가치투자·회계·거시경제 자습을 시작. CUFA 초기 스터디에 합류.",
  },
  {
    year: "2022",
    headline: "CUFA 입회",
    detail:
      "충북대학교 가치투자학회 정회원. DART 공시 읽기 + 3재무제표 연결 훈련.",
  },
  {
    year: "2023",
    headline: "첫 Equity Report — 한국콜마",
    detail:
      "산업 방문·IR·DART 10-K 전수 분석으로 첫 정규 리포트 발간. 이후 20+ 기업 리포트의 템플릿이 됨.",
  },
  {
    year: "2024",
    headline: "Luxon AI 창업 · nexus-finance-mcp v1",
    detail:
      "MCP(Model Context Protocol) 기반 금융 데이터 게이트웨이 구축. DART·ECOS·FRED·KRX·KIS 통합.",
  },
  {
    year: "2025",
    headline: "CUFA 2대 회장 취임 · 254회 현장 방문 돌파",
    detail:
      "학회 운영 체계 재정비. 산업 현장 방문을 리포트 1차 데이터의 표준으로 정착시킴.",
  },
  {
    year: "2026",
    headline: "CUFA wiki v2 론칭 (지금 이 사이트)",
    detail:
      "Next.js 15 + Velite MDX + Luxon MCP 라이브 데이터. 255+ 문서 · 계산기 12종 · 실전 리서치 5편.",
  },
];

interface CoreNumber {
  value: string;
  label: string;
  sub: string;
}

const CORE_NUMBERS: readonly CoreNumber[] = [
  {
    value: "2대",
    label: "CUFA 회장",
    sub: "충북대 가치투자학회 · 2025–",
  },
  {
    value: "254",
    label: "현장 방문 누적",
    sub: "산업 1차 데이터 · Field notes",
  },
  {
    value: "398",
    label: "Luxon MCP 도구",
    sub: "nexus-finance-mcp v8 · 64 서버",
  },
  {
    value: "5년+",
    label: "가치투자 경험",
    sub: "DCF · 산업 모델링 · 리서치",
  },
];

interface ProjectEntry {
  name: string;
  role: string;
  body: string;
  href?: string;
}

const PROJECTS: readonly ProjectEntry[] = [
  {
    name: "Luxon AI",
    role: "창업자 · Principal Engineer",
    body: "AI-augmented investment research infrastructure. MCP 게이트웨이 + CUFA 리포트 빌더 + 퀀트 백테스터를 하나의 스택으로.",
  },
  {
    name: "nexus-finance-mcp",
    role: "메인테이너",
    body: "398 도구 MCP 게이트웨이 — DART, ECOS, FRED, KRX, KIS, SEC, OECD, World Bank 등 한국·글로벌 금융 데이터 통합 API.",
  },
  {
    name: "CUFA-WEB (wiki v2)",
    role: "설계 · 개발",
    body: "학회 공식 사이트 · 지금 이 페이지가 올라온 플랫폼. Next.js 15 App Router + Velite MDX + Pagefind 검색.",
  },
  {
    name: "Sophia-Atlas",
    role: "리서치 프로젝트",
    body: "거시·지정학·온톨로지 교차분석 실험. (세부 공개 준비 중)",
  },
];

export default function ChanheeAboutPage() {
  const breadcrumb = [
    { label: "홈", href: "/" },
    { label: "소개", href: "/about/chanhee" },
    { label: "이찬희" },
  ];

  return (
    <div className="container-wide py-12">
      <Breadcrumb segments={breadcrumb} />

      <article className="mt-6 max-w-3xl">
        <header aria-labelledby="chanhee-title" className="border-b pb-8">
          <div className="flex items-start gap-6">
            <div
              aria-label="프로필 사진 자리"
              role="img"
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border text-2xl font-bold text-[color:var(--color-ink-muted)]"
              style={{ backgroundColor: "var(--color-paper-soft)" }}
            >
              LCH
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-vermilion)]">
                About · 이찬희
              </p>
              <h1
                id="chanhee-title"
                className="mt-2 text-3xl font-bold tracking-tight md:text-4xl"
              >
                이찬희 — 현장 1차 데이터 + AI 구조화 리서처
              </h1>
              <p className="mt-3 text-[color:var(--color-ink-soft)]">
                CUFA 2대 회장 · Luxon AI 창업자. 공장·본사·매장 현장을 직접
                방문해 얻은 1차 데이터를 MCP 기반 AI 구조화 파이프라인에 태워
                재현 가능한 리포트로 출력하는 것이 핵심 작업 방식.
              </p>
            </div>
          </div>
        </header>

        <section aria-labelledby="core-numbers" className="mt-10">
          <h2
            id="core-numbers"
            className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-ink-muted)]"
          >
            핵심 자산 · Core Numbers
          </h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {CORE_NUMBERS.map((n) => (
              <div
                key={n.label}
                className="rounded-md border p-4"
                style={{ backgroundColor: "var(--color-paper-soft)" }}
              >
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-ink-muted)]">
                  {n.label}
                </dt>
                <dd className="mt-1 text-2xl font-bold tracking-tight text-[color:var(--color-ink)]">
                  {n.value}
                </dd>
                <p className="mt-1 text-[11px] text-[color:var(--color-ink-muted)]">
                  {n.sub}
                </p>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="timeline" className="mt-12">
          <h2
            id="timeline"
            className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-ink-muted)]"
          >
            타임라인 · Timeline
          </h2>
          <ol className="mt-4 border-l-2 pl-5">
            {TIMELINE.map((t) => (
              <li key={t.year} className="relative pb-5 last:pb-0">
                <span
                  aria-hidden="true"
                  className="absolute -left-[27px] mt-1 block h-3 w-3 rounded-full border-2"
                  style={{
                    backgroundColor: "var(--color-paper)",
                    borderColor: "var(--color-vermilion)",
                  }}
                />
                <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[color:var(--color-vermilion)]">
                  {t.year}
                </p>
                <p className="mt-0.5 text-base font-bold text-[color:var(--color-ink)]">
                  {t.headline}
                </p>
                <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">
                  {t.detail}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="projects" className="mt-12">
          <h2
            id="projects"
            className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-ink-muted)]"
          >
            프로젝트 · Projects
          </h2>
          <ul className="mt-4 space-y-4">
            {PROJECTS.map((p) => (
              <li
                key={p.name}
                className="rounded-md border p-4"
                style={{ backgroundColor: "var(--color-paper-soft)" }}
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-base font-bold text-[color:var(--color-ink)]">
                    {p.name}
                  </h3>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-vermilion)]">
                    {p.role}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="links" className="mt-12 border-t pt-6">
          <h2
            id="links"
            className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-ink-muted)]"
          >
            외부 링크 · External
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              GitHub —{" "}
              <a
                href="https://github.com/pollmap"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[color:var(--color-vermilion)] no-underline hover:underline"
              >
                github.com/pollmap
              </a>
            </li>
            <li>
              Luxon AI —{" "}
              <span className="text-[color:var(--color-ink-muted)]">
                (공식 도메인 준비 중)
              </span>
            </li>
            <li>
              CUFA —{" "}
              <Link
                href="/"
                className="text-[color:var(--color-vermilion)] no-underline hover:underline"
              >
                cufa-wiki-v2
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </div>
  );
}
