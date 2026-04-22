import type { ReactNode } from "react";

/**
 * 본문 인라인 각주 참조. `<sup>` 숫자를 렌더하고 문서 하단 `<Footnote>`에 앵커.
 */
export function FootnoteRef({ id }: { id: string }) {
  return (
    <a href={`#fn-${id}`} id={`fnref-${id}`} className="fn-ref no-underline">
      [{id}]
    </a>
  );
}

/**
 * 문서 말미 각주 항목. `<Footnotes>` 컨테이너 안에 배치.
 */
export function Footnote({ id, children }: { id: string; children: ReactNode }) {
  return (
    <li id={`fn-${id}`} className="citation">
      <span aria-hidden className="mr-1 font-en italic">
        {id}.
      </span>
      {children}
      <a href={`#fnref-${id}`} aria-label={`각주 ${id} 본문으로 돌아가기`} className="ml-2 text-xs no-underline">
        ↩
      </a>
    </li>
  );
}

/**
 * 문서 말미 각주 모음. 참고문헌 위에 배치한다.
 */
export function Footnotes({ children }: { children: ReactNode }) {
  return (
    <section aria-label="각주" className="mt-12 border-t border-[color:var(--color-rule)] pt-6">
      <p className="label-caps mb-4">각주</p>
      <ol className="space-y-2 pl-4">{children}</ol>
    </section>
  );
}
