"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 전역 키보드 단축키.
 *  / → 검색 포커스
 *  g l → /learn
 *  g i → /industries
 *  g t → /tools
 *  g r → /research
 *  g c → /career
 *  g h → 홈
 *  ? → 단축키 도움말 (Phase 1.5)
 */
export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    let awaitingG = false;
    let gTimer: ReturnType<typeof setTimeout> | null = null;

    const isTyping = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      );
    };

    const go = (href: string) => {
      awaitingG = false;
      router.push(href);
    };

    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (!awaitingG && e.key === "/") {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>(
          '[data-search-input="true"]'
        );
        input?.focus();
        return;
      }

      if (!awaitingG && e.key === "g") {
        awaitingG = true;
        if (gTimer) clearTimeout(gTimer);
        gTimer = setTimeout(() => {
          awaitingG = false;
        }, 800);
        return;
      }

      if (awaitingG) {
        switch (e.key.toLowerCase()) {
          case "h": go("/"); break;
          case "l": go("/learn"); break;
          case "i": go("/industries"); break;
          case "t": go("/tools"); break;
          case "r": go("/research"); break;
          case "c": go("/career"); break;
          default: awaitingG = false;
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [router]);

  return null;
}
