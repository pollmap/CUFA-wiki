import type { ReactNode } from "react";

/**
 * 수식 + 유도 증명 펼치기. 초보자는 Skip, 고급자는 펼쳐 확인.
 * Velite의 rehype-katex가 KaTeX 렌더를 처리하므로 이 컴포넌트는 레이아웃만.
 */
export function FormulaWithProof({
  children,
  proof,
  summary = "유도 보기",
}: {
  children: ReactNode;
  proof?: ReactNode;
  summary?: string;
}) {
  return (
    <figure className="my-6">
      <div
        className="overflow-x-auto border border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] p-4 text-center"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {children}
      </div>
      {proof && (
        <details className="mt-2">
          <summary className="label-caps cursor-pointer hover:text-[color:var(--color-vermilion)]">
            ▸ {summary}
          </summary>
          <div className="mt-3 border-l-2 border-[color:var(--color-rule)] pl-4 text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
            {proof}
          </div>
        </details>
      )}
    </figure>
  );
}
