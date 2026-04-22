import Link from "next/link";

type PagerEntry = {
  title: string;
  url: string;
};

type PagerProps = {
  prev?: PagerEntry;
  next?: PagerEntry;
};

/**
 * 문서 하단 이전/다음 네비게이터. flat 순서(track → section → order) 기준으로
 * 인접 문서 2개를 2-column 카드로 표시.
 */
export function Pager({ prev, next }: PagerProps) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="문서 내비게이션"
      className="mt-12 grid grid-cols-1 gap-3 border-t border-[color:var(--color-rule)] pt-6 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={prev.url}
          className="group flex flex-col gap-1 rounded-lg border border-[color:var(--color-rule)] p-4 no-underline transition-colors hover:border-[color:var(--color-vermilion)]"
        >
          <span className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-ink-muted)] group-hover:text-[color:var(--color-vermilion)]">
            ← 이전
          </span>
          <span className="text-sm font-medium text-[color:var(--color-ink)] group-hover:text-[color:var(--color-vermilion)]">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div aria-hidden="true" className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={next.url}
          className="group flex flex-col gap-1 rounded-lg border border-[color:var(--color-rule)] p-4 text-right no-underline transition-colors hover:border-[color:var(--color-vermilion)] sm:col-start-2"
        >
          <span className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-ink-muted)] group-hover:text-[color:var(--color-vermilion)]">
            다음 →
          </span>
          <span className="text-sm font-medium text-[color:var(--color-ink)] group-hover:text-[color:var(--color-vermilion)]">
            {next.title}
          </span>
        </Link>
      ) : (
        <div aria-hidden="true" className="hidden sm:block sm:col-start-2" />
      )}
    </nav>
  );
}
