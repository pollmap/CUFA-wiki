"use client";

import { useEffect, useState } from "react";

/**
 * 세로 스크롤 진행도 바 (우측 고정).
 * - 모바일에서는 visual clutter 방지 위해 숨김 (`hidden md:block`).
 * - `requestAnimationFrame` 기반 스로틀로 repaint 최소화.
 * - 사용자가 `prefers-reduced-motion`을 설정한 경우에도 동작 자체는 남겨두되
 *   transition이 기본 CSS 규칙으로 즉시 0.01ms 가 되어 효과적으로 정적이 됨.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const compute = (): void => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const current = max > 0 ? window.scrollY / max : 0;
      setProgress(Math.min(1, Math.max(0, current)));
    };

    const onScroll = (): void => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        compute();
        raf = 0;
      });
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-0 top-0 z-40 hidden h-screen w-[3px] md:block"
      style={{ backgroundColor: "var(--color-paper-soft)" }}
    >
      <div
        className="w-full"
        style={{
          height: `${progress * 100}%`,
          backgroundColor: "var(--color-vermilion)",
          transition: "height 120ms linear",
        }}
      />
    </div>
  );
}
