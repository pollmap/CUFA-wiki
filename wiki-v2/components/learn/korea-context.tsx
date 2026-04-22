import type { ReactNode } from "react";

/**
 * 한국 맥락 박스. 글로벌 주제를 다룰 때 한국의 관련 통계·규제·관행을 보완한다.
 */
export function KoreaContext({ children }: { children: ReactNode }) {
  return (
    <aside className="korea-context" role="complementary">
      {children}
    </aside>
  );
}
