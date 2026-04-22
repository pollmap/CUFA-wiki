/**
 * 읽음 감지 훅 — 스크롤 80%+ & 체류 2분+ 충족 시 `markRead(slug)` 호출.
 * Phase 4 Supabase 마이그레이션 이전까지 localStorage 기반.
 *
 * Usage:
 *   const read = useReadDetect(slug, { threshold: 0.8, minDurationSec: 120 });
 *   return read ? <Badge>읽음 완료</Badge> : null;
 */

"use client";

import { useEffect, useState } from "react";
import { loadProgress, markRead } from "./progress";

type Options = {
  threshold?: number; // 0~1 — 문서 전체 대비 스크롤 도달 비율
  minDurationSec?: number; // 최소 체류 시간(초)
};

export function useReadDetect(
  slug: string | undefined | null,
  { threshold = 0.8, minDurationSec = 120 }: Options = {},
): boolean {
  const [read, setRead] = useState<boolean>(false);

  // mount 시점에 기존 읽음 상태 복원
  useEffect(() => {
    if (!slug) return;
    const state = loadProgress();
    if (state.read[slug]) setRead(true);
  }, [slug]);

  useEffect(() => {
    if (!slug || read) return;

    let reachedScroll = false;
    let stayTimerDone = false;
    let raf = 0;

    const tryCommit = (): void => {
      if (reachedScroll && stayTimerDone) {
        markRead(slug);
        setRead(true);
      }
    };

    const checkScroll = (): void => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      if (max <= 0) {
        // 문서가 짧아 스크롤이 불가능한 경우 — 체류만으로 인정
        reachedScroll = true;
        tryCommit();
        return;
      }
      const ratio = window.scrollY / max;
      if (ratio >= threshold) {
        reachedScroll = true;
        tryCommit();
      }
    };

    const onScroll = (): void => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        checkScroll();
        raf = 0;
      });
    };

    const timerId = window.setTimeout(() => {
      stayTimerDone = true;
      tryCommit();
    }, minDurationSec * 1000);

    window.addEventListener("scroll", onScroll, { passive: true });
    // 첫 체크 (로드 시 이미 끝까지 스크롤된 경우 대비)
    checkScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timerId);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [slug, threshold, minDurationSec, read]);

  return read;
}
