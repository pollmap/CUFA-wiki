import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Desktop: 마진 노트 상단을 앵커 텍스트와 정렬할 때 사용 */
  align?: "baseline" | "top";
  /** 원어/어원 · 출처 · 한국 맥락 · 수식 · 초보자 구분 */
  kind?: "source" | "etymology" | "korea" | "math" | "primer";
};

const kindLabel: Record<NonNullable<Props["kind"]>, string> = {
  source: "출처",
  etymology: "어원",
  korea: "한국 맥락",
  math: "수식",
  primer: "기초",
};

/**
 * Tufte 스타일 마진노트.
 * 데스크톱(≥1024px)에서는 우측 3번째 그리드 컬럼에 배치되며,
 * 모바일에서는 인라인 블록으로 변환된다. CSS는 globals.css의 `.margin-note` 규칙.
 */
export function MarginNote({ children, kind }: Props) {
  return (
    <aside className="margin-note" role="note">
      {kind && (
        <span className="label-caps mb-1 block text-[0.62rem] text-[color:var(--color-vermilion)]">
          {kindLabel[kind]}
        </span>
      )}
      {children}
    </aside>
  );
}
