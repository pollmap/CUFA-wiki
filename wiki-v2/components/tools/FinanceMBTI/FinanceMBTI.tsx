"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { questions, totalQuestions, type Dimension } from "./questions";
import { typeProfiles, type TypeProfile } from "./results";

type Answer = "A" | "B";
type AnswerMap = Record<number, Answer>;

const STORAGE_KEY = "cufa.finance-mbti.v1";

interface PersistedState {
  code?: string;
  answers?: AnswerMap;
  completedAt?: string;
}

const dimensionLabels: Record<Dimension, string> = {
  SD: "환경 선호",
  AQ: "사고 방식",
  IE: "업무 스타일",
  RC: "조직 문화",
};

const dimConfig: Array<{ key: Dimension; left: string; right: string }> = [
  { key: "SD", left: "S (안정)", right: "D (도전)" },
  { key: "AQ", left: "A (분석)", right: "Q (정량)" },
  { key: "IE", left: "I (내향)", right: "E (외향)" },
  { key: "RC", left: "R (규정)", right: "C (창의)" },
];

function computeType(ans: AnswerMap): string {
  const dims: Record<Dimension, { a: number; b: number }> = {
    SD: { a: 0, b: 0 },
    AQ: { a: 0, b: 0 },
    IE: { a: 0, b: 0 },
    RC: { a: 0, b: 0 },
  };
  for (const q of questions) {
    const choice = ans[q.id];
    if (choice === "A") dims[q.dimension].a++;
    else if (choice === "B") dims[q.dimension].b++;
  }
  const sd = dims.SD.a >= dims.SD.b ? "S" : "D";
  const aq = dims.AQ.a >= dims.AQ.b ? "A" : "Q";
  const ie = dims.IE.a >= dims.IE.b ? "I" : "E";
  const rc = dims.RC.a >= dims.RC.b ? "R" : "C";
  return `${sd}${aq}${ie}${rc}`;
}

function computeDimensionScores(ans: AnswerMap) {
  const dims: Record<Dimension, { a: number; b: number }> = {
    SD: { a: 0, b: 0 },
    AQ: { a: 0, b: 0 },
    IE: { a: 0, b: 0 },
    RC: { a: 0, b: 0 },
  };
  for (const q of questions) {
    const choice = ans[q.id];
    if (choice === "A") dims[q.dimension].a++;
    else if (choice === "B") dims[q.dimension].b++;
  }
  return dims;
}

function loadPersisted(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") return parsed as PersistedState;
    return null;
  } catch {
    return null;
  }
}

function savePersisted(state: PersistedState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or privacy mode — silently ignore
  }
}

function clearPersisted(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function FinanceMBTI() {
  const [currentQ, setCurrentQ] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [result, setResult] = useState<TypeProfile | null>(null);
  const [animating, setAnimating] = useState<boolean>(false);
  const [fadeIn, setFadeIn] = useState<boolean>(true);
  const [restored, setRestored] = useState<boolean>(false);

  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted?.code && persisted.answers) {
      const profile = typeProfiles[persisted.code];
      if (profile) {
        setAnswers(persisted.answers);
        setResult(profile);
        setRestored(true);
      }
    }
  }, []);

  const handleAnswer = useCallback(
    (choice: Answer) => {
      if (animating) return;
      const q = questions[currentQ];
      if (!q) return;
      const newAnswers: AnswerMap = { ...answers, [q.id]: choice };
      setAnswers(newAnswers);

      if (currentQ < totalQuestions - 1) {
        setAnimating(true);
        setFadeIn(false);
        setTimeout(() => {
          setCurrentQ((c) => c + 1);
          setFadeIn(true);
          setAnimating(false);
        }, 260);
      } else {
        setAnimating(true);
        setFadeIn(false);
        setTimeout(() => {
          const code = computeType(newAnswers);
          const profile = typeProfiles[code] ?? typeProfiles.SAIR;
          if (!profile) return;
          setResult(profile);
          savePersisted({
            code: profile.code,
            answers: newAnswers,
            completedAt: new Date().toISOString(),
          });
          setFadeIn(true);
          setAnimating(false);
        }, 420);
      }
    },
    [animating, answers, currentQ],
  );

  const handleReset = useCallback(() => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentQ(0);
      setAnswers({});
      setResult(null);
      setRestored(false);
      clearPersisted();
      setFadeIn(true);
    }, 260);
  }, []);

  const progress = result ? 100 : (currentQ / totalQuestions) * 100;

  const scores = useMemo(
    () => (result ? computeDimensionScores(answers) : null),
    [result, answers],
  );

  return (
    <section
      className="not-prose mx-auto my-8 w-full max-w-2xl"
      aria-label="Finance MBTI 진단"
    >
      {/* Progress */}
      <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-[color:var(--color-paper-sunk)]">
        <div
          className="h-full rounded-full bg-[color:var(--color-vermilion)] transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mb-6 text-right font-mono text-xs text-[color:var(--color-ink-muted)]">
        {result ? "완료" : `${currentQ + 1} / ${totalQuestions}`}
      </div>

      <div
        className={
          "border border-[color:var(--color-rule)] bg-[color:var(--color-paper)] p-6 transition-all duration-300 sm:p-8 " +
          (fadeIn ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")
        }
      >
        {result ? (
          <ResultView
            result={result}
            scores={scores}
            restored={restored}
            onReset={handleReset}
          />
        ) : (
          <QuestionView currentQ={currentQ} onAnswer={handleAnswer} />
        )}
      </div>
    </section>
  );
}

interface QuestionViewProps {
  currentQ: number;
  onAnswer: (choice: Answer) => void;
}

function QuestionView({ currentQ, onAnswer }: QuestionViewProps) {
  const q = questions[currentQ];
  if (!q) return null;
  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <span className="label-caps">
          Q{currentQ + 1} / {totalQuestions}
        </span>
        <span className="text-xs text-[color:var(--color-ink-muted)]">·</span>
        <span className="text-xs font-semibold text-[color:var(--color-vermilion)]">
          {dimensionLabels[q.dimension]}
        </span>
      </div>
      <h3 className="!mt-0 text-xl font-bold leading-snug text-[color:var(--color-ink)] sm:text-2xl">
        {q.text}
      </h3>
      <div className="mt-7 grid gap-3">
        <ChoiceButton label="A" text={q.choiceA} onClick={() => onAnswer("A")} />
        <ChoiceButton label="B" text={q.choiceB} onClick={() => onAnswer("B")} />
      </div>
    </>
  );
}

interface ChoiceButtonProps {
  label: string;
  text: string;
  onClick: () => void;
}

function ChoiceButton({ label, text, onClick }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-start gap-3 border border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] px-4 py-3.5 text-left text-sm leading-relaxed text-[color:var(--color-ink-soft)] transition-colors hover:border-[color:var(--color-vermilion)] hover:bg-[color:var(--color-paper-sunk)] hover:text-[color:var(--color-ink)] focus:outline-none focus-visible:border-[color:var(--color-vermilion)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-vermilion)] sm:text-base"
    >
      <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center border border-[color:var(--color-rule)] font-mono text-xs font-bold text-[color:var(--color-ink-muted)] group-hover:border-[color:var(--color-vermilion)] group-hover:text-[color:var(--color-vermilion)]">
        {label}
      </span>
      <span>{text}</span>
    </button>
  );
}

interface ResultViewProps {
  result: TypeProfile;
  scores: Record<Dimension, { a: number; b: number }> | null;
  restored: boolean;
  onReset: () => void;
}

function ResultView({ result, scores, restored, onReset }: ResultViewProps) {
  return (
    <div>
      {restored && (
        <div
          className="mb-5 border border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] px-3 py-2 text-xs text-[color:var(--color-ink-muted)]"
          role="status"
        >
          이전에 저장된 결과를 불러왔습니다. 다시 테스트하려면 하단 버튼을 눌러주세요.
        </div>
      )}

      <header className="mb-8 text-center">
        <span className="inline-block border border-[color:var(--color-vermilion)] px-4 py-1.5 font-mono text-2xl font-bold tracking-[0.3em] text-[color:var(--color-vermilion)] sm:text-3xl">
          {result.code}
        </span>
        <h3 className="mt-4 !mb-2 text-2xl font-bold text-[color:var(--color-ink)]">
          {result.name}
        </h3>
        <p className="!mt-3 text-sm leading-relaxed text-[color:var(--color-ink-soft)] sm:text-base">
          {result.description}
        </p>
      </header>

      {/* Dimension bars */}
      {scores && (
        <section className="mb-7">
          <SectionTitle>성향 분석</SectionTitle>
          <div className="mt-4 grid gap-3">
            {dimConfig.map((dim) => {
              const total = scores[dim.key].a + scores[dim.key].b;
              const leftPct = total > 0 ? (scores[dim.key].a / total) * 100 : 50;
              const rightPct = 100 - leftPct;
              const isLeft = leftPct >= 50;
              return (
                <div key={dim.key} className="flex items-center gap-3 text-xs sm:text-sm">
                  <span
                    className={
                      "w-24 flex-none text-right font-mono " +
                      (isLeft
                        ? "font-bold text-[color:var(--color-vermilion)]"
                        : "text-[color:var(--color-ink-muted)]")
                    }
                  >
                    {dim.left} {Math.round(leftPct)}%
                  </span>
                  <div className="flex h-2.5 flex-1 overflow-hidden rounded-full bg-[color:var(--color-paper-sunk)]">
                    <div
                      className="h-full bg-[color:var(--color-vermilion)] transition-[width] duration-500 ease-out"
                      style={{ width: `${leftPct}%` }}
                    />
                    <div
                      className="h-full bg-[color:var(--color-ink-muted)] opacity-60 transition-[width] duration-500 ease-out"
                      style={{ width: `${rightPct}%` }}
                    />
                  </div>
                  <span
                    className={
                      "w-24 flex-none text-left font-mono " +
                      (!isLeft
                        ? "font-bold text-[color:var(--color-vermilion)]"
                        : "text-[color:var(--color-ink-muted)]")
                    }
                  >
                    {Math.round(rightPct)}% {dim.right}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Sectors */}
      <section className="mb-7">
        <SectionTitle>추천 섹터</SectionTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          {result.sectors.map((sector, i) => {
            const href = result.sectorLinks[i];
            const tag = (
              <span className="inline-block border border-[color:var(--color-vermilion)] px-3 py-1 text-xs font-semibold text-[color:var(--color-vermilion)] sm:text-sm">
                {sector}
              </span>
            );
            return href ? (
              <Link key={`${sector}-${i}`} href={href} className="no-underline">
                {tag}
              </Link>
            ) : (
              <span key={`${sector}-${i}`}>{tag}</span>
            );
          })}
        </div>
      </section>

      {/* Jobs */}
      <section className="mb-7">
        <SectionTitle>추천 직무</SectionTitle>
        <div className="mt-3 grid gap-2">
          {result.jobs.map((job, i) => (
            <div
              key={`${job.title}-${i}`}
              className="border border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] px-4 py-3"
            >
              <p className="!my-0 text-sm font-bold text-[color:var(--color-vermilion)]">
                {job.title}
              </p>
              <p className="!mt-1 !mb-0 text-xs leading-relaxed text-[color:var(--color-ink-soft)] sm:text-sm">
                {job.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Certs */}
      <section className="mb-7">
        <SectionTitle>추천 자격증</SectionTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          {result.certs.map((cert, i) => (
            <span
              key={`${cert}-${i}`}
              className="inline-block border border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] px-3 py-1 font-mono text-xs text-[color:var(--color-ink-soft)] sm:text-sm"
            >
              {cert}
            </span>
          ))}
        </div>
      </section>

      {/* Companies */}
      <section className="mb-7">
        <SectionTitle>적합 기업 예시</SectionTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          {result.companies.map((company, i) => (
            <span
              key={`${company}-${i}`}
              className="inline-block border border-[color:var(--color-ink-muted)] px-3 py-1 text-xs text-[color:var(--color-ink-soft)] sm:text-sm"
            >
              {company}
            </span>
          ))}
        </div>
      </section>

      {/* Links */}
      <section className="mb-6 border-t border-[color:var(--color-rule)] pt-5">
        <p className="label-caps !mb-3">더 알아보기</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link
            href="/industries"
            className="font-semibold text-[color:var(--color-vermilion)] no-underline hover:underline"
          >
            금융권 기업 총람 →
          </Link>
          <Link
            href="/career/certifications"
            className="font-semibold text-[color:var(--color-vermilion)] no-underline hover:underline"
          >
            자격증 로드맵 →
          </Link>
          <Link
            href="/career"
            className="font-semibold text-[color:var(--color-vermilion)] no-underline hover:underline"
          >
            커리어 허브 →
          </Link>
        </div>
      </section>

      <button
        type="button"
        onClick={onReset}
        className="block w-full border border-[color:var(--color-vermilion)] bg-[color:var(--color-vermilion)] px-4 py-3 text-sm font-bold text-[color:var(--color-paper)] transition-opacity hover:opacity-90 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-vermilion)]"
      >
        다시 테스트하기
      </button>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="!mt-0 !mb-0 border-b border-[color:var(--color-rule)] pb-2 text-sm font-bold tracking-wide text-[color:var(--color-ink)] uppercase sm:text-base">
      {children}
    </h4>
  );
}

export default FinanceMBTI;
