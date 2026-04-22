import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

type PersonaData = {
  title: string;
  tagline: string;
  intro: string;
  path: { day: string; focus: string; docs: string[] }[];
  next: { label: string; href: string };
};

const personas: Record<string, PersonaData> = {
  beginner: {
    title: "입문자 — 30일 금융 기초",
    tagline: "금융 처음이에요",
    intro:
      "재무제표 용어도 처음이라면 여기서 시작. 30일 안에 첫 기업을 스스로 분석할 수 있게 됩니다.",
    path: [
      { day: "D1-7", focus: "기초 회계 (L1)", docs: ["재무상태표", "손익계산서", "현금흐름표", "주석"] },
      { day: "D8-14", focus: "재무분석 (L2)", docs: ["수익성", "성장성", "안정성", "효율성"] },
      { day: "D15-21", focus: "산업분석 (L3)", docs: ["5 Forces", "시장 구조", "규제 환경"] },
      { day: "D22-30", focus: "첫 기업 분석 (L4)", docs: ["경쟁우위", "경영진 평가", "첫 리포트 작성"] },
    ],
    next: { label: "4-Layer L1 시작", href: "/learn/foundation" },
  },
  jobseeker: {
    title: "취준생 — 직무 진단 → 합격 플랜",
    tagline: "취업 준비 중",
    intro:
      "Finance MBTI 진단 → 본인 성향에 맞는 직무 매칭 → 합격 요건 체크리스트 → 공모전 캘린더.",
    path: [
      { day: "Step 1", focus: "Finance MBTI", docs: ["16 유형 진단", "직무 매칭"] },
      { day: "Step 2", focus: "직무 탐색", docs: ["15 섹터", "50+ 직무 매트릭스"] },
      { day: "Step 3", focus: "합격 요건", docs: ["자격증 로드맵", "학점·영어·경험"] },
      { day: "Step 4", focus: "실전 준비", docs: ["공모전 캘린더", "합격 수기"] },
    ],
    next: { label: "Finance MBTI 하러 가기", href: "/career/mbti" },
  },
  practitioner: {
    title: "실무지망 — 리서치 역량 강화",
    tagline: "리서치 역량 키우자",
    intro:
      "CUFA 실전 리서치 5편 정독 → 퀀트 시스템 학습 → AI 도구(MCP 398) 활용까지.",
    path: [
      { day: "Track A", focus: "CUFA 리서치", docs: ["KSS해운", "한국콜마", "HD현대중공업", "JYP", "플리토"] },
      { day: "Track B", focus: "퀀트 시스템", docs: ["Factor Zoo", "Stat Arb", "Execution"] },
      { day: "Track C", focus: "AI + Live 데이터", docs: ["Luxon MCP 398", "HERMES 어시스턴트"] },
    ],
    next: { label: "CUFA 리서치 보기", href: "/research" },
  },
};

export function generateStaticParams() {
  return Object.keys(personas).map((slug) => ({ slug }));
}

export default async function PersonaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = personas[slug];
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-brand-accent)]">
        {data.tagline}
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">{data.title}</h1>
      <p className="mt-4 text-lg text-[color:var(--color-text-secondary)]">{data.intro}</p>

      <ol className="mt-12 space-y-4">
        {data.path.map((step, i) => (
          <li
            key={i}
            className="rounded-xl border p-5"
            style={{ backgroundColor: "var(--color-bg-surface)" }}
          >
            <div className="flex items-baseline gap-3">
              <span className="text-sm font-bold" style={{ color: "var(--color-brand-accent)" }}>
                {step.day}
              </span>
              <h2 className="text-lg font-semibold">{step.focus}</h2>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2 text-xs text-[color:var(--color-text-secondary)]">
              {step.docs.map((d) => (
                <li
                  key={d}
                  className="rounded-full border px-2.5 py-0.5"
                  style={{ backgroundColor: "var(--color-bg-muted)" }}
                >
                  {d}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <div className="mt-12">
        <Link
          href={data.next.href}
          className="inline-flex h-12 items-center gap-2 rounded-lg px-5 text-sm font-semibold"
          style={{
            backgroundColor: "var(--color-brand-primary)",
            color: "var(--color-bg-primary)",
          }}
        >
          {data.next.label} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
