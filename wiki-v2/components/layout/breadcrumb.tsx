import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbSegment = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  segments: BreadcrumbSegment[];
};

/**
 * shadcn/ui 스타일 Breadcrumb. 마지막 세그먼트는 현재 페이지로
 * 링크 없이 aria-current="page"만 부여.
 */
export function Breadcrumb({ segments }: BreadcrumbProps) {
  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-neutral-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const key = `${segment.label}-${index}`;

          return (
            <li key={key} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-neutral-400"
                  aria-hidden="true"
                />
              )}
              {isLast || !segment.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="font-medium text-[color:var(--color-ink)]"
                >
                  {segment.label}
                </span>
              ) : (
                <Link
                  href={segment.href}
                  className="no-underline transition-colors hover:text-[color:var(--color-ink)]"
                >
                  {segment.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
