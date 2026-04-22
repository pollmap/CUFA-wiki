"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

type Question = {
  q: string;
  choices: string[];
  /** 정답 인덱스 (0-based). */
  answer: number;
  explain?: string;
};

/**
 * 인라인 3문항 이해도 체크. 문서 끝에 배치 권장.
 * 결과는 Phase 4 Supabase로 저장 예정. 지금은 세션 스코프.
 */
export function Quiz({ questions }: { questions: Question[] }) {
  const [picked, setPicked] = useState<Array<number | null>>(
    () => questions.map(() => null)
  );
  const [submitted, setSubmitted] = useState(false);

  const correct = submitted
    ? picked.filter((p, i) => p === questions[i]?.answer).length
    : 0;

  return (
    <section className="not-prose my-10 border border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)]">
      <header className="flex items-baseline justify-between border-b border-[color:var(--color-rule)] px-5 py-3">
        <h3 className="!mt-0 text-base font-bold">🧠 이해도 체크 ({questions.length}문항)</h3>
        {submitted && (
          <span className="label-caps">
            {correct} / {questions.length}
          </span>
        )}
      </header>
      <ol className="divide-y divide-[color:var(--color-rule)]">
        {questions.map((q, qi) => (
          <li key={qi} className="px-5 py-4">
            <p className="text-sm font-semibold">
              <span className="font-mono text-xs text-[color:var(--color-vermilion)]">
                Q{qi + 1}.
              </span>{" "}
              {q.q}
            </p>
            <ul className="mt-3 grid gap-1.5">
              {q.choices.map((c, ci) => {
                const isPicked = picked[qi] === ci;
                const isCorrect = submitted && q.answer === ci;
                const isWrongPick = submitted && isPicked && q.answer !== ci;
                return (
                  <li key={ci}>
                    <label
                      className={
                        "flex cursor-pointer items-start gap-2 border px-3 py-2 text-sm transition-colors " +
                        (submitted
                          ? isCorrect
                            ? "border-[color:var(--color-success)] bg-[color:var(--color-success)]/10"
                            : isWrongPick
                              ? "border-[color:var(--color-vermilion)] bg-[color:var(--color-vermilion)]/10"
                              : "border-[color:var(--color-rule)]"
                          : isPicked
                            ? "border-[color:var(--color-vermilion)]"
                            : "border-[color:var(--color-rule)] hover:border-[color:var(--color-ink-muted)]")
                      }
                    >
                      <input
                        type="radio"
                        name={`q-${qi}`}
                        disabled={submitted}
                        checked={isPicked}
                        onChange={() =>
                          setPicked((arr) => {
                            const next = [...arr];
                            next[qi] = ci;
                            return next;
                          })
                        }
                        className="mt-0.5 accent-[color:var(--color-vermilion)]"
                      />
                      <span className="flex-1">{c}</span>
                      {submitted && isCorrect && (
                        <Check
                          className="h-4 w-4 text-[color:var(--color-success)]"
                          strokeWidth={2}
                          aria-label="정답"
                        />
                      )}
                      {isWrongPick && (
                        <X
                          className="h-4 w-4 text-[color:var(--color-vermilion)]"
                          strokeWidth={2}
                          aria-label="오답"
                        />
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
            {submitted && q.explain && (
              <p className="mt-2 border-l-2 border-[color:var(--color-rule)] pl-3 text-xs leading-relaxed text-[color:var(--color-ink-soft)]">
                <span className="font-semibold">해설.</span> {q.explain}
              </p>
            )}
          </li>
        ))}
      </ol>
      <footer className="flex items-baseline justify-between gap-3 border-t border-[color:var(--color-rule)] px-5 py-3">
        {submitted ? (
          <>
            <p className="text-sm">
              {correct === questions.length
                ? "모두 정답. 다음 문서로 진행해도 좋다."
                : `오답 ${questions.length - correct}개. 본문의 해당 섹션을 다시 읽어보자.`}
            </p>
            <button
              type="button"
              onClick={() => {
                setPicked(questions.map(() => null));
                setSubmitted(false);
              }}
              className="border border-[color:var(--color-rule)] px-3 py-1.5 text-xs font-semibold hover:border-[color:var(--color-vermilion)]"
            >
              다시 풀기
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={picked.some((p) => p === null)}
            onClick={() => setSubmitted(true)}
            className="ml-auto border border-[color:var(--color-vermilion)] bg-[color:var(--color-vermilion)] px-4 py-1.5 text-xs font-bold text-[color:var(--color-paper)] disabled:cursor-not-allowed disabled:border-[color:var(--color-rule)] disabled:bg-transparent disabled:text-[color:var(--color-ink-muted)]"
          >
            채점
          </button>
        )}
      </footer>
    </section>
  );
}
