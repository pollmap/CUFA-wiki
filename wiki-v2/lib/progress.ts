/**
 * 로컬 진도 저장 — localStorage 전용 (서버 없음, 로그인 없음).
 *
 * Zero-config: 환경변수/DB/OAuth 의존 없음. 브라우저가 SSOT.
 * 기기 간 동기화는 하지 않는다 (의도된 제약).
 */

const KEY = "cufa:progress:v1";

export type ProgressState = {
  read: Record<string, { at: string; elapsed?: number }>;
  bookmarked: Record<string, { at: string }>;
  quizAttempts: Record<string, { correct: number; total: number; at: string }>;
};

const empty: ProgressState = {
  read: {},
  bookmarked: {},
  quizAttempts: {},
};

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return {
      read: parsed.read ?? {},
      bookmarked: parsed.bookmarked ?? {},
      quizAttempts: parsed.quizAttempts ?? {},
    };
  } catch {
    return empty;
  }
}

export function saveProgress(state: ProgressState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota error → ignore */
  }
}

export function markRead(slug: string): ProgressState {
  const state = loadProgress();
  state.read[slug] = { at: new Date().toISOString() };
  saveProgress(state);
  return state;
}

export function toggleBookmark(slug: string): ProgressState {
  const state = loadProgress();
  const wasOn = Boolean(state.bookmarked[slug]);
  if (wasOn) {
    delete state.bookmarked[slug];
  } else {
    state.bookmarked[slug] = { at: new Date().toISOString() };
  }
  saveProgress(state);
  return state;
}

export function recordQuiz(slug: string, correct: number, total: number): ProgressState {
  const state = loadProgress();
  state.quizAttempts[slug] = {
    correct,
    total,
    at: new Date().toISOString(),
  };
  saveProgress(state);
  return state;
}

export function progressSummary(state: ProgressState, totalDocs: number) {
  const readN = Object.keys(state.read).length;
  return {
    read: readN,
    bookmarked: Object.keys(state.bookmarked).length,
    quizzes: Object.keys(state.quizAttempts).length,
    percent: totalDocs > 0 ? Math.round((readN / totalDocs) * 100) : 0,
  };
}
