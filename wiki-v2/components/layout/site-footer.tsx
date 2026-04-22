import Link from "next/link";
import { siteMeta } from "@/lib/nav";

const sections = [
  {
    title: "학습",
    links: [
      { label: "4-Layer 로드맵", href: "/learn/paths" },
      { label: "자산별 심층", href: "/learn/assets" },
      { label: "밸류에이션", href: "/learn/valuation" },
      { label: "거시경제", href: "/learn/macro" },
    ],
  },
  {
    title: "레퍼런스",
    links: [
      { label: "CUFA 리서치", href: "/research/equity" },
      { label: "현장 노트 254", href: "/research/field-notes" },
      { label: "투자 대가", href: "/research/masters" },
      { label: "용어사전", href: "/learn/glossary" },
    ],
  },
  {
    title: "정책",
    links: [
      { label: "출처·인용", href: "/policies/sources" },
      { label: "문체 가이드", href: "/policies/style" },
      { label: "디자인 결정", href: "/policies/design" },
      { label: "기여 가이드", href: "/contribute" },
    ],
  },
  {
    title: "저장소",
    links: [
      { label: "GitHub", href: "https://github.com/pollmap/CUFA-wiki" },
      { label: "보안", href: "https://github.com/pollmap/CUFA-wiki/blob/main/SECURITY.md" },
      { label: "MIT 라이선스", href: "https://github.com/pollmap/CUFA-wiki/blob/main/LICENSE" },
      { label: "변경 이력", href: "/changelog" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-[color:var(--color-rule)]">
      <div className="container-wide py-12">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <p className="font-[family-name:var(--font-sans-kr)] text-sm font-black">
              {siteMeta.title}
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-ink-muted)]">
              {siteMeta.publisher} 편집
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[color:var(--color-ink-soft)]">
              본문의 모든 수치·사례는 한국은행 ECOS, FRED, DART, OECD, BIS,
              학술 논문을 1차 출처로 한다. 학습 목적 자료이며 투자 권유가 아니다.
            </p>
          </div>
          {sections.map((sec) => (
            <div key={sec.title}>
              <p className="label-caps">{sec.title}</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {sec.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="no-underline hover:text-[color:var(--color-vermilion)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <hr className="mt-10" />
        <p className="mt-4 flex flex-wrap items-baseline justify-between gap-2 text-xs text-[color:var(--color-ink-muted)]">
          <span>© {year} {siteMeta.publisher}. MIT License.</span>
          <span className="font-mono">v2.0-alpha · Next.js 15 · Velite</span>
        </p>
      </div>
    </footer>
  );
}
