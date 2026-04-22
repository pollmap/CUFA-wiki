"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Clock, X } from "lucide-react";
import {
  EXAM_BANK,
  EXAM_SUBJECTS,
  type ExamQuestion,
  type ExamSubject,
  type ExamSubjectMeta,
} from "@/lib/exam-banks";

type Stage = "select" | "exam" | "result";

interface Attempt {
  readonly question: ExamQuestion;
  readonly picked: number | null;
}

function formatMmSs(secondsLeft: number): string {
  const m = Math.max(0, Math.floor(secondsLeft / 60));
  const s = Math.max(0, secondsLeft % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function shuffle<T>(arr: readonly T[]): T[] {
  // Fisher–Yates — return a new array, never mutate input (immutability rule).
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function MockExam() {
  const [stage, setStage] = useState<Stage>("select");
  const [subject, setSubject] = useState<ExamSubject | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [idx, setIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const current = attempts[idx];

  const start = useCallback(
    (meta: ExamSubjectMeta) => {
      const pool = EXAM_BANK.filter((q) => q.subject === meta.id);
      if (pool.length === 0) return;
      const picked = shuffle(pool).slice(0, Math.min(pool.length, 10));
      setSubject(meta.id);
      setAttempts(picked.map((q) => ({ question: q, picked: null })));
      setIdx(0);
      setSecondsLeft(meta.estimatedMinutes * 60);
      setStage("exam");
    },
    [],
  );

  const pick = useCallback(
    (choiceIdx: number) => {
      setAttempts((prev) => {
        const next = prev.slice();
        const at = next[idx];
        if (!at) return prev;
        next[idx] = { ...at, picked: choiceIdx };
        return next;
      });
    },
    [idx],
  );

  const goNext = useCallback(() => {
    setIdx((prev) => {
      if (prev + 1 >= attempts.length) {
        setStage("result");
        return prev;
      }
      return prev + 1;
    });
  }, [attempts.length]);

  const finish = useCallback(() => setStage("result"), []);

  const restart = useCallback(() => {
    setStage("select");
    setSubject(null);
    setAttempts([]);
    setIdx(0);
    setSecondsLeft(0);
  }, []);

  // Timer — only tick during "exam" stage. Auto-submit at 0.
  useEffect(() => {
    if (stage !== "exam") return;
    if (secondsLeft <= 0) {
      setStage("result");
      return;
    }
    const t = window.setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1_000);
    return () => window.clearInterval(t);
  }, [stage, secondsLeft]);

  const correct = useMemo(
    () =>
      attempts.filter((a) => a.picked !== null && a.picked === a.question.answer)
        .length,
    [attempts],
  );

  const subjectLabel = useMemo(
    () => EXAM_SUBJECTS.find((s) => s.id === subject)?.label ?? "",
    [subject],
  );

  // ─── Stage: select ──────────────────────────────────────────────
  if (stage === "select") {
    return (
      <section className="mx-auto max-w-3xl">
        <p className="label-caps text-[color:var(--color-vermilion)]">
          모의고사
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">
          과목을 선택하세요
        </h2>
        <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">
          각 시험 당 최대 10문항 무작위 출제. 실제 시험 문항은 주관 기관의
          저작권이 있으므로, 이곳의 문항은 공개 개념을 기반으로 학습용으로
          재구성한 것입니다.
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {EXAM_SUBJECTS.map((meta) => {
            const count = EXAM_BANK.filter((q) => q.subject === meta.id).length;
            const disabled = count === 0;
            return (
              <li key={meta.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => start(meta)}
                  className="flex w-full items-start justify-between gap-4 border border-[color:var(--color-rule)] px-4 py-3 text-left transition-colors hover:border-[color:var(--color-vermilion)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <div>
                    <p className="text-sm font-semibold">{meta.label}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-ink-muted)]">
                      {meta.track} · {count}문항 뱅크 ·{" "}
                      {meta.estimatedMinutes}분
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  // ─── Stage: exam ────────────────────────────────────────────────
  if (stage === "exam" && current) {
    const q = current.question;
    const total = attempts.length;
    const answered = attempts.filter((a) => a.picked !== null).length;

    return (
      <section className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between border-b border-[color:var(--color-rule)] pb-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-ink-muted)]">
              {subjectLabel}
            </p>
            <p className="mt-1 text-sm font-semibold">
              Q{idx + 1} / {total} · 응답 {answered}/{total}
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 border border-[color:var(--color-rule)] px-3 py-1.5 font-mono text-xs tabular-nums">
            <Clock className="h-3 w-3" strokeWidth={2} />
            {formatMmSs(secondsLeft)}
          </div>
        </header>

        <article className="mt-6">
          <p className="text-base font-semibold leading-relaxed">{q.stem}</p>

          <ul className="mt-5 grid gap-2">
            {q.choices.map((c, ci) => {
              const isPicked = current.picked === ci;
              return (
                <li key={ci}>
                  <label
                    className={
                      "flex cursor-pointer items-start gap-2 border px-3 py-2.5 text-sm transition-colors " +
                      (isPicked
                        ? "border-[color:var(--color-vermilion)] bg-[color:var(--color-vermilion)]/10"
                        : "border-[color:var(--color-rule)] hover:border-[color:var(--color-ink-muted)]")
                    }
                  >
                    <input
                      type="radio"
                      name={`mq-${idx}`}
                      checked={isPicked}
                      onChange={() => pick(ci)}
                      className="mt-0.5 accent-[color:var(--color-vermilion)]"
                    />
                    <span className="flex-1">{c}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </article>

        <footer className="mt-6 flex items-center justify-between gap-3 border-t border-[color:var(--color-rule)] pt-4">
          <button
            type="button"
            onClick={restart}
            className="text-xs text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-vermilion)]"
          >
            시험 중단 · 과목 다시 선택
          </button>
          <div className="flex gap-2">
            {idx + 1 < total ? (
              <button
                type="button"
                onClick={goNext}
                disabled={current.picked === null}
                className="border border-[color:var(--color-vermilion)] bg-[color:var(--color-vermilion)] px-4 py-1.5 text-xs font-bold text-[color:var(--color-paper)] disabled:cursor-not-allowed disabled:border-[color:var(--color-rule)] disabled:bg-transparent disabled:text-[color:var(--color-ink-muted)]"
              >
                다음 문항
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                disabled={current.picked === null}
                className="border border-[color:var(--color-vermilion)] bg-[color:var(--color-vermilion)] px-4 py-1.5 text-xs font-bold text-[color:var(--color-paper)] disabled:cursor-not-allowed disabled:border-[color:var(--color-rule)] disabled:bg-transparent disabled:text-[color:var(--color-ink-muted)]"
              >
                제출 · 결과 보기
              </button>
            )}
          </div>
        </footer>
      </section>
    );
  }

  // ─── Stage: result ──────────────────────────────────────────────
  const percent =
    attempts.length > 0 ? Math.round((correct / attempts.length) * 100) : 0;

  // Stub: Phase 4.5에서 Supabase quiz_attempts dual-write 구현 예정.
  // 현재는 세션 스코프로만 유지 (persistence 없음).

  return (
    <section className="mx-auto max-w-3xl">
      <p className="label-caps text-[color:var(--color-vermilion)]">결과</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight">{subjectLabel}</h2>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="border border-[color:var(--color-rule)] p-4">
          <p className="label-caps">정답</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {correct} / {attempts.length}
          </p>
        </div>
        <div className="border border-[color:var(--color-rule)] p-4">
          <p className="label-caps">정답률</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{percent}%</p>
        </div>
        <div className="border border-[color:var(--color-rule)] p-4">
          <p className="label-caps">남은 시간</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {formatMmSs(secondsLeft)}
          </p>
        </div>
      </div>

      <ol className="mt-8 divide-y divide-[color:var(--color-rule)] border-y border-[color:var(--color-rule)]">
        {attempts.map((a, ai) => {
          const isCorrect = a.picked === a.question.answer;
          return (
            <li key={a.question.id} className="py-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold">
                  <span className="font-mono text-[10px] text-[color:var(--color-ink-muted)]">
                    Q{ai + 1}.
                  </span>{" "}
                  {a.question.stem}
                </p>
                {isCorrect ? (
                  <Check
                    className="h-4 w-4 flex-shrink-0 text-[color:var(--color-success)]"
                    aria-label="정답"
                  />
                ) : (
                  <X
                    className="h-4 w-4 flex-shrink-0 text-[color:var(--color-vermilion)]"
                    aria-label="오답"
                  />
                )}
              </div>
              <p className="mt-2 text-xs text-[color:var(--color-ink-muted)]">
                내 선택:{" "}
                {a.picked !== null
                  ? a.question.choices[a.picked]
                  : "(응답 없음)"}
                <br />
                정답: {a.question.choices[a.question.answer]}
              </p>
              <p className="mt-2 border-l-2 border-[color:var(--color-rule)] pl-3 text-xs leading-relaxed">
                <span className="font-semibold">해설.</span>{" "}
                {a.question.explanation}
              </p>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-xs text-[color:var(--color-ink-muted)]">
          결과 영속 저장은 Phase 4.5에서 Supabase 로 연결 예정입니다.
        </p>
        <button
          type="button"
          onClick={restart}
          className="border border-[color:var(--color-vermilion)] bg-[color:var(--color-vermilion)] px-4 py-1.5 text-xs font-bold text-[color:var(--color-paper)]"
        >
          다른 과목 풀기
        </button>
      </div>
    </section>
  );
}
