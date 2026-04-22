import type { ReactNode } from "react";

/**
 * 학습 유닛 상단 목표 명시. 백준의 "문제 개요" 상단 박스와 유사한 역할.
 * Evaluator가 draft=false 학습 문서에 존재 여부를 검사한다.
 */
export function WhatYouWillLearn({ children }: { children: ReactNode }) {
  return (
    <aside
      role="note"
      className="my-8 border-l-2 border-[color:var(--color-vermilion)] pl-5 py-1"
    >
      <p className="label-caps mb-2">이 문헌에서 다루는 것</p>
      <div className="text-[0.95rem] leading-[1.75] text-[color:var(--color-ink-soft)] [&_ul]:ml-5 [&_ul]:list-[lower-roman] [&_li]:mt-1">
        {children}
      </div>
    </aside>
  );
}
