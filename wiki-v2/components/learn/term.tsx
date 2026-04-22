import type { ReactNode } from "react";

/**
 * 인라인 용어 툴팁. 본문 속 전문용어를 `<Term def="...">` 으로 감싸면
 * 데스크톱에서 점선 밑줄 + hover 시 정의 팝오버가 나온다.
 * 모바일에선 그냥 점선 강조.
 */
export function Term({
  children,
  def,
  href,
}: {
  children: ReactNode;
  /** 한 문장 정의. 400자 이내 권장. */
  def: string;
  /** 용어사전 해당 페이지 링크 (선택). */
  href?: string;
}) {
  const content = (
    <span className="group relative inline">
      <span
        className="cursor-help"
        style={{
          textDecoration: "underline",
          textDecorationStyle: "dotted",
          textDecorationThickness: "1px",
          textUnderlineOffset: "3px",
          textDecorationColor: "var(--color-vermilion)",
        }}
      >
        {children}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 hidden w-64 -translate-x-1/2 whitespace-normal border border-[color:var(--color-rule)] bg-[color:var(--color-paper)] p-3 text-left text-xs font-normal not-italic leading-relaxed text-[color:var(--color-ink)] shadow-md group-hover:block group-focus-within:block"
        style={{ fontFamily: "var(--font-sans-kr)" }}
      >
        {def}
      </span>
    </span>
  );

  if (href) {
    return <a href={href} className="no-underline">{content}</a>;
  }
  return content;
}
