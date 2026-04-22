import type { ReactNode } from "react";

/**
 * 섹션·챕터 첫 문단에 감싼다. 첫 글자가 2줄 높이 드롭캡으로 렌더된다.
 * CSS는 `.drop-cap::first-letter`.
 */
export function DropCap({ children }: { children: ReactNode }) {
  return <p className="drop-cap">{children}</p>;
}
