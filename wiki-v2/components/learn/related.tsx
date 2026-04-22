import Link from "next/link";

type Item = { label: string; href: string; kind?: string };

/**
 * 문서 하단 교차 링크. Evaluator CI가 최소 3개 요구.
 */
export function Related({ items }: { items: Item[] }) {
  if (!items || items.length === 0) return null;
  return (
    <aside
      aria-label="관련 문서"
      className="mt-12 border-t border-[color:var(--color-rule)] pt-6"
    >
      <p className="label-caps mb-3">함께 읽으면 좋은 문서</p>
      <ul className="grid gap-2">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              className="flex items-baseline justify-between gap-3 text-sm no-underline hover:text-[color:var(--color-vermilion)]"
            >
              <span>{it.label}</span>
              {it.kind && (
                <span className="label-caps shrink-0">{it.kind}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
