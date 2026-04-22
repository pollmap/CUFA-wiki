import type { ReactNode } from "react";

type Source = {
  label: string;
  /** DOI · 공식 URL · ISBN 등 식별자 */
  url?: string;
  accessed?: string;
};

/**
 * 학술 인용 블록. 본문 말미에 배치하거나 MDX `<SourceCitation>` 으로 사용.
 * URL은 Evaluator CI가 도메인 화이트리스트로 검증한다 (SOURCES-POLICY 참조).
 */
export function SourceCitation({
  sources,
  children,
}: {
  sources?: Source[];
  children?: ReactNode;
}) {
  return (
    <section aria-label="참고문헌" className="mt-12 border-t border-[color:var(--color-rule)] pt-6">
      <p className="label-caps mb-4">참고문헌</p>
      <ol className="space-y-2 pl-4">
        {sources?.map((s, i) => (
          <li key={i} className="citation">
            {s.url ? (
              <a href={s.url} rel="noopener noreferrer">
                {s.label}
              </a>
            ) : (
              <span>{s.label}</span>
            )}
            {s.accessed && (
              <span className="ml-1 not-italic text-[color:var(--color-ink-muted)]">
                · 열람 {s.accessed}
              </span>
            )}
          </li>
        ))}
        {children}
      </ol>
    </section>
  );
}
