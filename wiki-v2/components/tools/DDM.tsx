"use client";

import { Calculator } from "./Calculator";

/**
 * Gordon Growth 3-stage 배당할인모형(DDM).
 * P₀ = Σ D_t/(1+Re)^t + TV/(1+Re)^N, TV = D_{N+1}/(Re−g_∞).
 */
export function DDM() {
  return (
    <Calculator
      title="DDM 계산기 — 배당할인모형 (Gordon 3-stage)"
      description={
        <p>
          Dividend Discount Model. 고성장기(g_high, N년) 후 영구성장률(g_∞)로 수렴.
          금융주·유틸리티·성숙 배당주 valuation의 기본. 제약: g_∞ &lt; Re, g_∞ &lt; g_high.
        </p>
      }
      inputs={[
        {
          key: "D0",
          label: "기준년 주당배당 D₀",
          unit: "원",
          default: 2000,
          step: 100,
          hint: "최근 연간 DPS (주당배당금)",
        },
        {
          key: "gHigh",
          label: "고성장기 배당성장률 g_high",
          unit: "%",
          default: 8,
          step: 0.5,
          hint: "중기 배당성장률 전망",
        },
        {
          key: "N",
          label: "고성장 기간 N",
          unit: "년",
          default: 5,
          min: 1,
          max: 15,
          step: 1,
        },
        {
          key: "gTerm",
          label: "영구성장률 g_∞",
          unit: "%",
          default: 2.5,
          step: 0.25,
          hint: "명목 GDP 성장률 ≤ 4% 권장",
        },
        {
          key: "Re",
          label: "자기자본비용 Re (Cost of Equity)",
          unit: "%",
          default: 9,
          step: 0.25,
          hint: "CAPM 기반, g_∞보다 커야 함",
        },
      ]}
      outputs={[
        {
          key: "price",
          label: "적정주가 P₀",
          format: (n) => `${n.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}원`,
          emphasis: true,
        },
        {
          key: "pvExplicit",
          label: "명시기간 배당 현가합",
          format: (n) => `${n.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}원`,
        },
        {
          key: "terminal",
          label: "Terminal Value (N년 시점)",
          format: (n) => `${n.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}원`,
        },
        {
          key: "pvTerminal",
          label: "Terminal Value 현가",
          format: (n) => `${n.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}원`,
        },
        {
          key: "tvWeight",
          label: "TV가 차지하는 비중",
          format: (n) => `${n.toFixed(1)}%`,
        },
      ]}
      compute={(values) => {
        const D0 = values.D0 ?? 0;
        const gHigh = (values.gHigh ?? 0) / 100;
        const gTerm = (values.gTerm ?? 0) / 100;
        const Re = (values.Re ?? 0) / 100;
        const N = Math.max(1, Math.floor(values.N ?? 1));

        if (Re <= gTerm || gTerm >= gHigh) {
          return {
            price: NaN,
            pvExplicit: NaN,
            terminal: NaN,
            pvTerminal: NaN,
            tvWeight: NaN,
          };
        }

        let pvExplicit = 0;
        let Dn = D0;
        for (let t = 1; t <= N; t++) {
          Dn = D0 * Math.pow(1 + gHigh, t);
          pvExplicit += Dn / Math.pow(1 + Re, t);
        }
        const dNext = Dn * (1 + gTerm);
        const terminal = dNext / (Re - gTerm);
        const pvTerminal = terminal / Math.pow(1 + Re, N);
        const price = pvExplicit + pvTerminal;
        const tvWeight = price > 0 ? (pvTerminal / price) * 100 : NaN;
        return { price, pvExplicit, terminal, pvTerminal, tvWeight };
      }}
      notes={
        <>
          가정: (1) 배당 영구 지속, (2) 재투자·자사주매입 무시, (3) Re 불변. TV 비중 70%+
          시 가정 민감도 점검 필수 (H-model·2단 DDM 대안 고려).
          <br />
          출처: Gordon (1959); Damodaran, <em>Equity Valuation</em> ch. 13.
        </>
      }
    />
  );
}
