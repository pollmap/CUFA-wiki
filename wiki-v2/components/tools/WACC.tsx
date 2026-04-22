"use client";

import { Calculator } from "./Calculator";

/**
 * WACC 계산기. 가중평균자본비용 = (E/V)·Re + (D/V)·Rd·(1−T).
 * CAPM 기반 Re 계산은 별도 툴. 여기서는 Re·Rd를 직접 입력받는다.
 */
export function WACC() {
  return (
    <Calculator
      title="WACC 계산기 — 가중평균자본비용"
      description={
        <p>
          Weighted Average Cost of Capital. 자본구조(E/V, D/V) 가중치로 자기자본비용
          (Re)과 세후 타인자본비용(Rd·(1−T))을 평균. DCF 할인율의 표준.
        </p>
      }
      inputs={[
        {
          key: "E",
          label: "시가총액 E",
          unit: "원 (억)",
          default: 10000,
          step: 100,
          hint: "Equity — 보통주 시가총액",
        },
        {
          key: "D",
          label: "총부채 D",
          unit: "원 (억)",
          default: 4000,
          step: 100,
          hint: "이자부 부채 장부가 (시장가 근사)",
        },
        {
          key: "Re",
          label: "자기자본비용 Re (Cost of Equity)",
          unit: "%",
          default: 9,
          step: 0.25,
          hint: "CAPM: rf + β·ERP. 한국 Kospi 장기 ERP ~6.5%",
        },
        {
          key: "Rd",
          label: "타인자본비용 Rd (Cost of Debt)",
          unit: "%",
          default: 4.5,
          step: 0.25,
          hint: "신용등급별 회사채 수익률",
        },
        {
          key: "T",
          label: "한계세율 T",
          unit: "%",
          default: 22,
          step: 0.5,
          hint: "한국 법인세 최고세율 24% (지방세 포함 26.4%)",
        },
      ]}
      outputs={[
        {
          key: "wacc",
          label: "WACC",
          format: (n) => `${n.toFixed(2)}%`,
          emphasis: true,
        },
        {
          key: "eOverV",
          label: "E/V 자기자본 비중",
          format: (n) => `${n.toFixed(1)}%`,
        },
        {
          key: "dOverV",
          label: "D/V 타인자본 비중",
          format: (n) => `${n.toFixed(1)}%`,
        },
        {
          key: "afterTaxRd",
          label: "세후 Rd",
          format: (n) => `${n.toFixed(2)}%`,
        },
      ]}
      compute={(values) => {
        const E = values.E ?? 0;
        const D = values.D ?? 0;
        const Re = (values.Re ?? 0) / 100;
        const Rd = (values.Rd ?? 0) / 100;
        const T = (values.T ?? 0) / 100;
        const V = E + D;
        if (V <= 0) return { wacc: NaN, eOverV: NaN, dOverV: NaN, afterTaxRd: NaN };
        const we = E / V;
        const wd = D / V;
        const afterTaxRd = Rd * (1 - T);
        const wacc = we * Re + wd * afterTaxRd;
        return {
          wacc: wacc * 100,
          eOverV: we * 100,
          dOverV: wd * 100,
          afterTaxRd: afterTaxRd * 100,
        };
      }}
      notes={
        <>
          가정: (1) 자본구조 불변, (2) 세율 단일, (3) 부채는 이자부 부채만. 실무에서는
          target capital structure와 iterative refinancing을 고려한다.
          <br />
          출처: Damodaran, <em>Cost of Capital</em>. · 한국 시장 ERP 추정:
          Damodaran Country Risk Premium 데이터 (매년 1월 갱신).
        </>
      }
    />
  );
}
