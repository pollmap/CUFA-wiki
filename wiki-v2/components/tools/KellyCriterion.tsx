"use client";

import { useState } from "react";
import { Calculator } from "./Calculator";

/**
 * Kelly Criterion 계산기.
 * Binary 베팅: f* = (b·p − q) / b  (b = 손익비, p = 승률, q = 1−p)
 * Continuous (주식): f* = (μ − r) / σ²  (μ = 기대수익률, r = 무위험수익률, σ² = 분산)
 */
export function KellyCriterion() {
  const [mode, setMode] = useState<"binary" | "continuous">("binary");

  return (
    <div>
      <div className="not-prose my-4 flex items-center gap-2">
        <span className="label-caps">모드 Mode</span>
        <button
          type="button"
          onClick={() => setMode("binary")}
          className={
            "border px-3 py-1 text-xs font-semibold transition-colors " +
            (mode === "binary"
              ? "border-[color:var(--color-vermilion)] bg-[color:var(--color-vermilion)] text-white"
              : "border-[color:var(--color-rule)] bg-[color:var(--color-paper)] text-[color:var(--color-ink)]")
          }
        >
          Binary 베팅
        </button>
        <button
          type="button"
          onClick={() => setMode("continuous")}
          className={
            "border px-3 py-1 text-xs font-semibold transition-colors " +
            (mode === "continuous"
              ? "border-[color:var(--color-vermilion)] bg-[color:var(--color-vermilion)] text-white"
              : "border-[color:var(--color-rule)] bg-[color:var(--color-paper)] text-[color:var(--color-ink)]")
          }
        >
          Continuous 수익률
        </button>
      </div>

      {mode === "binary" ? <KellyBinary /> : <KellyContinuous />}
    </div>
  );
}

/** Binary Kelly: f* = (bp − q) / b */
function KellyBinary() {
  return (
    <Calculator
      title="Kelly Criterion — Binary 베팅"
      description={
        <p>
          승률 p와 손익비 b(승리 시 배당배수, 패배 시 −1 손실)가 주어진 단일
          베팅에서의 최적 자본 비중. Full Kelly는 장기 기하평균 성장률을
          극대화하지만 실전 변동성이 크므로 분할 적용이 일반적이다.
        </p>
      }
      inputs={[
        {
          key: "p",
          label: "승률 p",
          unit: "%",
          default: 55,
          min: 0,
          max: 100,
          step: 0.5,
          hint: "사건이 성공할 확률",
        },
        {
          key: "b",
          label: "손익비 b (payoff odds)",
          unit: "배",
          default: 1.5,
          min: 0,
          step: 0.1,
          hint: "승리 시 순이익 / 패배 시 손실. b=1이면 동액 베팅",
        },
      ]}
      outputs={[
        {
          key: "fullKelly",
          label: "Full Kelly f*",
          format: (n) => `${n.toFixed(2)}%`,
          emphasis: true,
        },
        {
          key: "halfKelly",
          label: "Half Kelly (½·f*)",
          format: (n) => `${n.toFixed(2)}%`,
        },
        {
          key: "quarterKelly",
          label: "Quarter Kelly (¼·f*)",
          format: (n) => `${n.toFixed(2)}%`,
        },
        {
          key: "edge",
          label: "기대 엣지 (bp − q)",
          format: (n) => `${n.toFixed(3)}`,
        },
      ]}
      compute={(values) => {
        const p = (values.p ?? 0) / 100;
        const b = values.b ?? 0;
        const q = 1 - p;
        if (b <= 0) {
          return { fullKelly: NaN, halfKelly: NaN, quarterKelly: NaN, edge: NaN };
        }
        // f* = (b·p − q) / b
        const f = (b * p - q) / b;
        const fPct = f * 100;
        return {
          fullKelly: fPct,
          halfKelly: fPct / 2,
          quarterKelly: fPct / 4,
          edge: b * p - q,
        };
      }}
      notes={<KellyWarning mode="binary" />}
    />
  );
}

/** Continuous Kelly: f* = (μ − r) / σ² */
function KellyContinuous() {
  return (
    <Calculator
      title="Kelly Criterion — Continuous (주식)"
      description={
        <p>
          기하 브라운 운동 자산에서의 최적 비중. 초과수익(μ−r)을 분산(σ²)으로
          나눈 값으로, 샤프비율 / 변동성과 동형이다. Merton(1969) 포트폴리오
          문제의 정적 해와 일치한다.
        </p>
      }
      inputs={[
        {
          key: "mu",
          label: "기대수익률 μ",
          unit: "%",
          default: 10,
          step: 0.5,
          hint: "자산의 연환산 기대수익률",
        },
        {
          key: "rf",
          label: "무위험수익률 r",
          unit: "%",
          default: 3.5,
          step: 0.25,
          hint: "국고채 3년 수익률 (ECOS 722Y001)",
        },
        {
          key: "sigma",
          label: "변동성 σ",
          unit: "%",
          default: 20,
          min: 0.01,
          step: 0.5,
          hint: "연환산 표준편차",
        },
      ]}
      outputs={[
        {
          key: "fullKelly",
          label: "Full Kelly f*",
          format: (n) => `${n.toFixed(2)}%`,
          emphasis: true,
        },
        {
          key: "halfKelly",
          label: "Half Kelly (½·f*)",
          format: (n) => `${n.toFixed(2)}%`,
        },
        {
          key: "quarterKelly",
          label: "Quarter Kelly (¼·f*)",
          format: (n) => `${n.toFixed(2)}%`,
        },
        {
          key: "excess",
          label: "초과수익 (μ − r)",
          format: (n) => `${n.toFixed(2)}%`,
        },
      ]}
      compute={(values) => {
        const mu = (values.mu ?? 0) / 100;
        const rf = (values.rf ?? 0) / 100;
        const sigma = (values.sigma ?? 0) / 100;
        if (sigma <= 0) {
          return { fullKelly: NaN, halfKelly: NaN, quarterKelly: NaN, excess: NaN };
        }
        // f* = (μ − r) / σ²
        const f = (mu - rf) / (sigma * sigma);
        const fPct = f * 100;
        return {
          fullKelly: fPct,
          halfKelly: fPct / 2,
          quarterKelly: fPct / 4,
          excess: (mu - rf) * 100,
        };
      }}
      notes={<KellyWarning mode="continuous" />}
    />
  );
}

/** Full Kelly > 50% 이면 분산 분할 권고. */
function KellyWarning({ mode }: { mode: "binary" | "continuous" }) {
  // Calculator 외부에서 입력을 다시 읽을 수 없어, 경고는 정적으로 서술한다.
  return (
    <>
      <div className="not-prose mb-2 border-l-4 border-[color:var(--color-vermilion)] bg-[color:var(--color-paper)] px-3 py-2 text-xs font-semibold text-[color:var(--color-ink)]">
        ⚠️ f* &gt; 50%면 Half Kelly 권장 — 실전에서 f*를 그대로 베팅하는 것은
        공격적이며 단기 drawdown이 −50% 이상 발생한다.
      </div>
      {mode === "binary" ? (
        <>
          가정: 단일 베팅, 손익비 b 고정, 재투자 반복. 실전에서는 p 추정 오차
          때문에 Half Kelly (Thorp, 1997)나 Fractional Kelly가 표준이다.
          <br />
          출처: Kelly Jr., J. L., <em>A New Interpretation of Information Rate</em>
          , Bell System Technical Journal, 1956.
        </>
      ) : (
        <>
          가정: 로그 정규 수익률, 연속 리밸런싱, 거래비용 0. Sharpe / σ = Kelly
          비중이므로 Sharpe 1에 변동성 20%이면 f* ≈ 500%으로 레버리지 신호.
          <br />
          출처: Merton, R. C., <em>Lifetime Portfolio Selection under Uncertainty</em>
          , Review of Economics and Statistics, 1969.
        </>
      )}
    </>
  );
}

