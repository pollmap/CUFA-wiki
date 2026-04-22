"use client";

import { Calculator } from "./Calculator";

/**
 * Ohlson Residual Income Model.
 * V₀ = BV₀ + Σ RI_t/(1+Re)^t, RI_t = NI_t − Re·BV_{t−1}.
 * Ohlson 감쇠계수 ω (0~1): 영구잔여이익 감쇠율.
 */
export function RIM() {
  return (
    <Calculator
      title="RIM 계산기 — 잔여이익모형 (Ohlson)"
      description={
        <p>
          Residual Income Model. 장부가(BV) + 초과이익(ROE−Re)·BV 현가합. 배당/FCF
          추정이 어려울 때 사용. Ohlson(1995) 감쇠계수 ω로 RI 영구 지속 완화.
        </p>
      }
      inputs={[
        {
          key: "BV0",
          label: "현재 주당순자산 BV₀",
          unit: "원",
          default: 30000,
          step: 500,
          hint: "Book Value per Share (가장 최근 분기)",
        },
        {
          key: "ROE",
          label: "지속가능 ROE",
          unit: "%",
          default: 12,
          step: 0.25,
          hint: "ROE − Re > 0 이어야 가치 생성",
        },
        {
          key: "Re",
          label: "자기자본비용 Re (Cost of Equity)",
          unit: "%",
          default: 9,
          step: 0.25,
        },
        {
          key: "N",
          label: "명시기간",
          unit: "년",
          default: 5,
          min: 3,
          max: 15,
          step: 1,
        },
        {
          key: "omega",
          label: "Ohlson 감쇠계수 ω",
          default: 1.0,
          min: 0,
          max: 1,
          step: 0.05,
          hint: "1.0=영구지속(ROE 유지), 0=경쟁에 의해 RI 즉시 소멸",
        },
        {
          key: "payout",
          label: "배당성향 (Dividend Payout)",
          unit: "%",
          default: 30,
          step: 5,
          hint: "BV 성장경로 계산용. g_BV = ROE·(1−payout)",
        },
      ]}
      outputs={[
        {
          key: "intrinsicValue",
          label: "내재가치 V₀ (주당)",
          format: (n) => `${n.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}원`,
          emphasis: true,
        },
        {
          key: "bvContribution",
          label: "장부가 기여분 BV₀",
          format: (n) => `${n.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}원`,
        },
        {
          key: "pvRI",
          label: "명시기간 RI 현가합",
          format: (n) => `${n.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}원`,
        },
        {
          key: "pvRIContinuing",
          label: "연속기간 RI 현가",
          format: (n) => `${n.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}원`,
        },
        {
          key: "pbImplied",
          label: "내재 P/B (Trailing 기준)",
          format: (n) => `${n.toFixed(2)}x`,
        },
      ]}
      compute={(values) => {
        const BV0 = values.BV0 ?? 0;
        const ROE = (values.ROE ?? 0) / 100;
        const Re = (values.Re ?? 0) / 100;
        const N = Math.max(1, Math.floor(values.N ?? 5));
        const omega = Math.min(1, Math.max(0, values.omega ?? 1));
        const payout = Math.min(1, Math.max(0, (values.payout ?? 0) / 100));

        const gBV = ROE * (1 - payout);
        let bvPrev = BV0;
        let pvRI = 0;
        let lastRI = 0;
        for (let t = 1; t <= N; t++) {
          const NIt = ROE * bvPrev;
          const RIt = NIt - Re * bvPrev;
          pvRI += RIt / Math.pow(1 + Re, t);
          lastRI = RIt;
          bvPrev = bvPrev + NIt * (1 - payout); // BV_{t} = BV_{t-1} + retained earnings
          void gBV; // g_BV는 근사 참고용
        }

        // 연속기간 RI = RI_N · ω / (1+Re−ω). Ohlson LID 단순화.
        let pvRIContinuing = 0;
        if (omega > 0 && 1 + Re - omega > 0) {
          const continuing = (lastRI * omega) / (1 + Re - omega);
          pvRIContinuing = continuing / Math.pow(1 + Re, N);
        }

        const intrinsicValue = BV0 + pvRI + pvRIContinuing;
        const pbImplied = BV0 > 0 ? intrinsicValue / BV0 : NaN;
        return {
          intrinsicValue,
          bvContribution: BV0,
          pvRI,
          pvRIContinuing,
          pbImplied,
        };
      }}
      notes={
        <>
          가정: (1) Clean Surplus Relation (BV_t = BV_{"{"}t−1{"}"} + NI_t − D_t), (2) ROE
          지속가능, (3) 배당성향 일정. 금융주·고무형자산 기업에서 DDM/DCF 대안.
          <br />
          출처: Ohlson (1995) <em>Contemporary Accounting Research</em>; Feltham-Ohlson
          (1995) LID framework. · P/B는 Trailing 기준 (BV₀ = 최근 분기).
        </>
      }
    />
  );
}
