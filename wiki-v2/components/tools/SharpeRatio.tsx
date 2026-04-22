"use client";

import { Calculator } from "./Calculator";

/**
 * Sharpe Ratio + Sortino Ratio 계산기.
 * Sharpe  = (Rp − Rf) / σp
 * Sortino = (Rp − Rf) / σ_downside  (하방 변동성만 페널티)
 */
export function SharpeRatio() {
  return (
    <Calculator
      title="Sharpe Ratio + Sortino Ratio"
      description={
        <p>
          위험조정수익률 2종. Sharpe는 전체 변동성으로, Sortino는 하방 변동성
          (MAR 또는 0 이하 수익률의 표준편차)으로 초과수익을 나눈다. Sortino ≥
          Sharpe이 일반적이며, 차이가 클수록 수익 분포가 우측으로 skewed.
        </p>
      }
      inputs={[
        {
          key: "Rp",
          label: "포트폴리오 연수익률 Rp",
          unit: "%",
          default: 12,
          step: 0.5,
          hint: "연환산 산술평균 또는 기하평균 수익률",
        },
        {
          key: "Rf",
          label: "무위험수익률 Rf",
          unit: "%",
          default: 3.5,
          step: 0.25,
          hint: "국고채 3년 수익률 (ECOS 722Y001)",
        },
        {
          key: "sigmaP",
          label: "총 변동성 σp",
          unit: "%",
          default: 15,
          min: 0.01,
          step: 0.5,
          hint: "연환산 표준편차",
        },
        {
          key: "sigmaDown",
          label: "하방 변동성 σ_down",
          unit: "%",
          default: 10,
          min: 0.01,
          step: 0.5,
          hint: "수익률 < 0 (또는 < MAR) 구간의 표준편차",
        },
      ]}
      outputs={[
        {
          key: "sharpe",
          label: "Sharpe Ratio",
          format: (n) => n.toFixed(3),
          emphasis: true,
        },
        {
          key: "sortino",
          label: "Sortino Ratio",
          format: (n) => n.toFixed(3),
          emphasis: true,
        },
        {
          key: "excess",
          label: "초과수익 (Rp − Rf)",
          format: (n) => `${n.toFixed(2)}%`,
        },
        {
          key: "interpretation",
          label: "Sharpe 해석",
          format: interpretSharpe,
        },
      ]}
      compute={(values) => {
        const Rp = (values.Rp ?? 0) / 100;
        const Rf = (values.Rf ?? 0) / 100;
        const sp = (values.sigmaP ?? 0) / 100;
        const sd = (values.sigmaDown ?? 0) / 100;
        const excess = Rp - Rf;
        // Sharpe = (Rp − Rf) / σp, Sortino = (Rp − Rf) / σ_down
        const sharpe = sp > 0 ? excess / sp : NaN;
        const sortino = sd > 0 ? excess / sd : NaN;
        return {
          sharpe,
          sortino,
          excess: excess * 100,
          interpretation: sharpe, // format 함수가 동일값 사용
        };
      }}
      notes={
        <>
          주석: <strong>변동성은 연환산 기준</strong> — 월별 표준편차 × √12로
          환산해 입력한다. 해석 기준: &lt; 1 Poor / 1~2 Good / 2~3 Great / &gt; 3
          Exceptional. Sortino MAR(Minimum Acceptable Return)을 0이 아닌 Rf로
          잡으면 Sharpe와 등가 구조가 된다.
          <br />
          출처: Sharpe, W. F., <em>The Sharpe Ratio</em>, Journal of Portfolio
          Management, 1994. · Sortino, F. A. &amp; van der Meer, R.,{" "}
          <em>Downside Risk</em>, JPM, 1991.
        </>
      }
    />
  );
}

/** Sharpe 수치 → 언어적 등급 (< 1 Poor / 1~2 Good / 2~3 Great / > 3 Exceptional). */
function interpretSharpe(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n < 1) return `Poor (${n.toFixed(2)})`;
  if (n < 2) return `Good (${n.toFixed(2)})`;
  if (n < 3) return `Great (${n.toFixed(2)})`;
  return `Exceptional (${n.toFixed(2)})`;
}
