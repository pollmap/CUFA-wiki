import Link from "next/link";

const sections = [
  { slug: "mbti", label: "Finance MBTI", hint: "16 유형 직무 매칭 진단" },
  { slug: "jobs", label: "직무 매트릭스", hint: "15 섹터 · 50+ 직무" },
  { slug: "requirements", label: "합격 요건", hint: "섹터×요건 체크리스트" },
  { slug: "competitions", label: "공모전 캘린더", hint: "42+ 대회 · ICS 내보내기" },
  { slug: "certifications", label: "자격증 로드맵", hint: "SQLD/금투사/CFA/FRM/CAIA" },
  { slug: "roadmap", label: "학년별 로드맵", hint: "1-4학년 분기별 할 일" },
  { slug: "interviews", label: "합격 수기", hint: "커뮤니티 기여 (신규)" },
];

export default function CareerIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-brand-accent)]">
        커리어
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">금융권 취업 허브</h1>
      <p className="mt-4 max-w-2xl text-[color:var(--color-text-secondary)]">
        진단 → 직무 매칭 → 합격 요건 → 공모전 → 자격증. 학년별 로드맵으로 단계별 준비.
      </p>

      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.slug}
            href={`/career/${s.slug}`}
            className="rounded-xl border p-5 hover:shadow-md"
            style={{ backgroundColor: "var(--color-bg-surface)" }}
          >
            <p className="text-lg font-semibold">{s.label}</p>
            <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">{s.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
