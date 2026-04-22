"use client";

import { useState } from "react";

// F-Score = Σ(9 binary checks): 수익성(4) + 자본구조(3) + 효율성(2). Piotroski (2000).

type CheckKey =
  | "roaPos"
  | "cfoPos"
  | "roaUp"
  | "cfoGtNi"
  | "leverageDown"
  | "currentUp"
  | "noIssuance"
  | "gmUp"
  | "atUp";

type CheckDef = {
  key: CheckKey;
  group: "수익성 (Profitability)" | "자본구조 (Leverage/Liquidity)" | "효율성 (Efficiency)";
  label: string;
  hint: string;
};

const CHECKS: CheckDef[] = [
  { key: "roaPos", group: "수익성 (Profitability)", label: "ROA > 0 (당기)", hint: "당기순이익 / 평균총자산이 양수인가?" },
  { key: "cfoPos", group: "수익성 (Profitability)", label: "영업현금흐름 > 0", hint: "당기 CFO가 양수인가?" },
  { key: "roaUp", group: "수익성 (Profitability)", label: "ROA 전년 대비 증가", hint: "전년 ROA보다 높은가?" },
  { key: "cfoGtNi", group: "수익성 (Profitability)", label: "CFO > 순이익 (Accrual quality)", hint: "영업CF가 순이익보다 크면 이익의 질 양호" },
  { key: "leverageDown", group: "자본구조 (Leverage/Liquidity)", label: "장기부채비율 전년 대비 감소", hint: "장기부채 / 총자산 비율이 낮아졌는가?" },
  { key: "currentUp", group: "자본구조 (Leverage/Liquidity)", label: "유동비율 전년 대비 증가", hint: "유동자산 / 유동부채가 개선됐는가?" },
  { key: "noIssuance", group: "자본구조 (Leverage/Liquidity)", label: "신주발행 없음", hint: "발행주식수가 동일하거나 감소했는가?" },
  { key: "gmUp", group: "효율성 (Efficiency)", label: "매출총이익률 전년 대비 증가", hint: "GP margin 개선됐는가?" },
  { key: "atUp", group: "효율성 (Efficiency)", label: "자산회전율 전년 대비 증가", hint: "매출 / 평균총자산이 개선됐는가?" },
];

type ScoreState = Record<CheckKey, boolean>;

const INITIAL: ScoreState = {
  roaPos: false, cfoPos: false, roaUp: false, cfoGtNi: false,
  leverageDown: false, currentUp: false, noIssuance: false,
  gmUp: false, atUp: false,
};

function classify(score: number): { label: string; cls: string } {
  if (score >= 8) return { label: "Strong (8-9)", cls: "bg-emerald-100 text-emerald-800 border-emerald-400" };
  if (score >= 6) return { label: "Good (6-7)", cls: "bg-sky-100 text-sky-800 border-sky-400" };
  if (score >= 4) return { label: "Neutral (4-5)", cls: "bg-amber-100 text-amber-800 border-amber-400" };
  return { label: "Weak (0-3)", cls: "bg-rose-100 text-rose-800 border-rose-400" };
}

export function PiotroskiFScore() {
  const [state, setState] = useState<ScoreState>(INITIAL);
  const score = Object.values(state).filter(Boolean).length;
  const badge = classify(score);

  const groups = Array.from(new Set(CHECKS.map((c) => c.group)));

  return (
    <section className="not-prose my-8 border border-[color:var(--color-rule)] bg-[color:var(--color-paper)]">
      <header className="flex items-baseline justify-between border-b border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] px-5 py-3">
        <h3 className="!mt-0 text-base font-bold">🧮 Piotroski F-Score — 재무 건전성 9점 스코어</h3>
        <span className="label-caps">인터랙티브</span>
      </header>
      <div className="px-5 pt-4 text-sm text-[color:var(--color-ink-soft)]">
        <p>
          Joseph Piotroski (2000) 9-point screen. 저PBR 가치주 중 재무 건전성 우량기업을
          선별하는 필터. 각 항목에 해당하면 1점, 아니면 0점. 합산 (0–9).
        </p>
      </div>
      <div className="grid gap-6 p-5 md:grid-cols-[1fr_280px]">
        <div className="grid gap-5">
          {groups.map((g) => (
            <fieldset key={g} className="border border-[color:var(--color-rule)] p-3">
              <legend className="label-caps px-2">{g}</legend>
              <div className="grid gap-2">
                {CHECKS.filter((c) => c.group === g).map((c) => (
                  <label key={c.key} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={state[c.key]}
                      onChange={(e) =>
                        setState((s) => ({ ...s, [c.key]: e.target.checked }))
                      }
                      className="mt-1 h-4 w-4 accent-[color:var(--color-vermilion)]"
                    />
                    <span>
                      <span className="font-semibold">{c.label}</span>
                      <span className="mt-0.5 block text-xs text-[color:var(--color-ink-muted)]">
                        {c.hint}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <div>
          <p className="label-caps mb-3">결과</p>
          <div className="border-b-2 border-[color:var(--color-vermilion)] py-2 text-center">
            <div className="text-xs text-[color:var(--color-ink-muted)]">F-Score</div>
            <div className="font-mono text-3xl font-bold text-[color:var(--color-vermilion)]">
              {score} <span className="text-base text-[color:var(--color-ink-muted)]">/ 9</span>
            </div>
          </div>
          <div
            className={`mt-4 block w-full border px-3 py-2 text-center text-sm font-semibold ${badge.cls}`}
          >
            {badge.label}
          </div>
          <p className="mt-3 text-xs text-[color:var(--color-ink-muted)]">
            해석: 8-9 초건전 · 6-7 건전 · 4-5 중립 · 0-3 재무위험 신호
          </p>
        </div>
      </div>
      <footer className="border-t border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] px-5 py-3 text-xs leading-relaxed text-[color:var(--color-ink-muted)]">
        출처: Piotroski, <em>Value Investing: The Use of Historical Financial Statement Information</em>,
        Journal of Accounting Research 38 (2000). · 금융업 제외 (은행·보험은 별도 스크린).
      </footer>
    </section>
  );
}
