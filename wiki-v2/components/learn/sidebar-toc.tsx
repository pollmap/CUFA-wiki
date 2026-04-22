"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLeaf = { label: string; href: string };
type NavSection = { label: string; items: NavLeaf[] };

type Props = {
  sections: NavSection[];
  label?: string;
};

/**
 * 좌측 고정 사이드바 네비. Velite 데이터에서 트랙·섹션 트리로 조립해 전달.
 * 백준의 "문제집 목록"과 유사한 실용 UX.
 */
export function SidebarToc({ sections, label = "목차" }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block" aria-label={label}>
      <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-auto pr-2 text-sm">
        <p className="label-caps mb-3">{label}</p>
        <ol className="space-y-4">
          {sections.map((sec) => (
            <li key={sec.label}>
              <p className="mb-1 text-[0.78rem] font-bold tracking-wide text-[color:var(--color-ink)]">
                {sec.label}
              </p>
              <ul className="space-y-0.5 border-l border-[color:var(--color-rule)]">
                {sec.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={
                          "block py-0.5 pl-3 text-[0.85rem] leading-snug no-underline " +
                          (active
                            ? "border-l-2 border-[color:var(--color-vermilion)] -ml-px font-semibold text-[color:var(--color-vermilion)]"
                            : "text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-vermilion)]")
                        }
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}
