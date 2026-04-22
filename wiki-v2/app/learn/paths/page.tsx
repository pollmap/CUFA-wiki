import Link from "next/link";
import { ArrowRight, BookOpen, Coins, PiggyBank, Briefcase } from "lucide-react";

/**
 * 학습 경로 허브 — 4개 큐레이션 코스.
 * 각 Path MDX는 content/learn/paths/{slug}.mdx 에 있으며 Velite가
 * learnDocs 컬렉션으로 빌드하여 /learn/paths/{slug} 로 라우팅된다.
 */

type Path = {
  code: string;
  slug: string;
  title: string;
  days: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  summary: string;
  steps: readonly string[];
  audience: string;
  icon: typeof BookOpen;
};

const PATHS: readonly Path[] = [
  {
    code: "P1",
    slug: "stocks-first",
    title: "주식 분석 처음이에요",
    days: 14,
    difficulty: "beginner",
    summary:
      "재무제표 3표 읽기부터 첫 DCF 리포트까지. 14일 동안 회계 언어와 밸류에이션 기초를 완주한다.",
    steps: [
      "Week 1 — 회계 토대 (I/S · B/S · C/F)",
      "Week 2 — 상대가치 + DCF 입문",
      "산출물 — 첫 분석 리포트 1편",
    ],
    audience: "주식 경험은 있지만 숫자로 읽어본 적 없는 사람",
    icon: BookOpen,
  },
  {
    code: "P2",
    slug: "etf-first",
    title: "ETF로 시작",
    days: 7,
    difficulty: "beginner",
    summary:
      "개별 종목 대신 ETF로 자산배분을 시작한다. 상관관계·분산·리밸런싱까지 7일에 끝낸다.",
    steps: [
      "Day 1-2 — ETF 구조 · 비용 · 추적오차",
      "Day 3-5 — 자산배분 + 분산효과",
      "Day 6-7 — 포트폴리오 구축 + 리밸런싱 IPS",
    ],
    audience: "종목 고르는 시간 부담스러운 직장인·학생",
    icon: Coins,
  },
  {
    code: "P3",
    slug: "pension",
    title: "퇴직연금 굴리기",
    days: 5,
    difficulty: "beginner",
    summary:
      "DC/DB/IRP 차이 → TDF · 글라이드 패스 → 인출 전략까지. 본인 연금 포트폴리오를 직접 재구성.",
    steps: [
      "Day 1-2 — 제도 이해 (DB · DC · IRP · TDF)",
      "Day 3-4 — 포트폴리오 템플릿 3종 · 리스크",
      "Day 5 — 4% Rule · 세제혜택 · 연금 IPS",
    ],
    audience: "원리금보장 방치 중인 직장인 / 은퇴 예정자",
    icon: PiggyBank,
  },
  {
    code: "P4",
    slug: "finance-job",
    title: "금융권 취업 로드맵",
    days: 90,
    difficulty: "intermediate",
    summary:
      "Finance MBTI · 합격 요건 · 자격증 · CUFA 리포트 · 공모전까지. 12주 순차 실행 설계.",
    steps: [
      "Phase 1 (W1-3) — 진단 + GAP 분석",
      "Phase 2 (W4-9) — 재무 · 밸류 · 매크로 · 자격증",
      "Phase 3 (W10-12) — CUFA 리포트 + 공모전 + 지원",
    ],
    audience: "대학 2-4학년 · 비전공자 · 금융권 전환자",
    icon: Briefcase,
  },
];

const difficultyLabel: Record<Path["difficulty"], string> = {
  beginner: "입문",
  intermediate: "중급",
  advanced: "고급",
};

export const metadata = {
  title: "학습 경로 — 큐레이션 코스 4종",
  description:
    "주식 처음 / ETF / 퇴직연금 / 금융권 취업. 목적별로 골라 시작하는 단계별 학습 로드맵.",
};

export default function LearnPathsIndexPage() {
  return (
    <div className="container-wide py-12">
      <p className="label-caps">학습 · 경로</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">학습 경로</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
        내 목적에 맞는 순서를 골라 시작하세요. 각 경로는 일자별 문서 링크 + 실습
        체크포인트 + 한국 맥락 박스로 구성됩니다. 중도에 자유롭게 넘어가도 괜찮습니다.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {PATHS.map((p) => (
          <Link
            key={p.slug}
            href={`/learn/paths/${p.slug}`}
            className="group flex flex-col border border-[color:var(--color-rule)] p-6 no-underline transition-colors hover:border-[color:var(--color-vermilion)]"
          >
            <div className="flex items-start gap-4">
              <p.icon
                className="h-6 w-6 shrink-0 text-[color:var(--color-ink-soft)] group-hover:text-[color:var(--color-vermilion)]"
                strokeWidth={1.5}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs text-[color:var(--color-vermilion)]">
                    {p.code}
                  </span>
                  <h2 className="!mt-0 text-lg font-bold tracking-tight">
                    {p.title}
                  </h2>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="font-mono text-[color:var(--color-ink-muted)]">
                    {p.days}일
                  </span>
                  <span className="text-[color:var(--color-ink-muted)]">·</span>
                  <span className={`badge badge--${p.difficulty}`}>
                    {difficultyLabel[p.difficulty]}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
              {p.summary}
            </p>

            <ol className="mt-4 space-y-1.5 text-xs text-[color:var(--color-ink-muted)]">
              {p.steps.map((s) => (
                <li key={s} className="flex gap-2">
                  <span aria-hidden className="font-mono">
                    ›
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>

            <div className="mt-5 flex items-center justify-between border-t border-[color:var(--color-rule)] pt-3">
              <p className="text-xs text-[color:var(--color-ink-muted)]">
                {p.audience}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[color:var(--color-vermilion)]">
                시작하기
                <ArrowRight className="h-3 w-3" aria-hidden strokeWidth={2} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-14 border-t border-[color:var(--color-rule)] pt-8">
        <h2 className="text-xl font-bold">어떤 경로를 골라야 할지 모르겠다면</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
          <li>
            - 투자를 아직 해본 적 없다 →{" "}
            <Link href="/learn/paths/stocks-first">P1 주식 처음이에요</Link>
          </li>
          <li>
            - 바쁘고 시간 투입이 어렵다 →{" "}
            <Link href="/learn/paths/etf-first">P2 ETF로 시작</Link>
          </li>
          <li>
            - DC/IRP 계좌가 있는데 손대본 적 없다 →{" "}
            <Link href="/learn/paths/pension">P3 퇴직연금 굴리기</Link>
          </li>
          <li>
            - 금융권 취업·이직을 준비한다 →{" "}
            <Link href="/learn/paths/finance-job">P4 금융권 취업 로드맵</Link>
          </li>
        </ul>
        <p className="mt-4 text-xs text-[color:var(--color-ink-muted)]">
          또는{" "}
          <Link href="/career/mbti" className="font-semibold">
            Finance MBTI 진단
          </Link>
          으로 본인 성향에 맞는 경로를 추천받을 수 있습니다.
        </p>
      </section>
    </div>
  );
}
