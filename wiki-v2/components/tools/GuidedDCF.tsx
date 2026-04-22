"use client";

import { Calculator } from "./Calculator";

/**
 * 인라인 DCF 계산기. 단순화된 3구간 FCF + 터미널 밸류 모델.
 * 학습용이며 실무 대체 아님. 상세 가정은 notes에서 공개.
 */
export function GuidedDCF() {
  return (
    <Calculator
      title="DCF (Discounted Cash Flow) — 학습용"
      description={
        <p>
          3년 초기 성장 후 일정 성장률로 수렴하는 Gordon 성장 모델. 모든 입력은
          사용자 재량이며 산업·기업별 실제 가정은 본문 각주를 참조한다.
        </p>
      }
      inputs={[
        {
          key: "fcf0",
          label: "기준년 FCF",
          unit: "원 (억)",
          default: 1000,
          step: 10,
          hint: "감가상각·CapEx·WC 변동 조정 후 Free Cash Flow to Firm",
        },
        {
          key: "gHigh",
          label: "초기 성장률 g₁",
          unit: "%",
          default: 12,
          step: 0.5,
          hint: "1–3차년도 평균",
        },
        {
          key: "years",
          label: "고성장 기간 (년)",
          default: 3,
          min: 1,
          max: 10,
          step: 1,
        },
        {
          key: "gTerm",
          label: "영구 성장률 g∞",
          unit: "%",
          default: 2.5,
          step: 0.25,
          hint: "명목 GDP 성장률 ≤ 4% 권장",
        },
        {
          key: "wacc",
          label: "할인율 WACC",
          unit: "%",
          default: 9,
          step: 0.25,
          hint: "자본비용 · risk-free + equity risk premium × β",
        },
        {
          key: "netDebt",
          label: "순차입금",
          unit: "원 (억)",
          default: 500,
          step: 10,
          hint: "총부채 − 현금성자산. 주식가치 환산용",
        },
        {
          key: "shares",
          label: "발행주식수",
          unit: "만주",
          default: 5000,
          step: 100,
        },
      ]}
      outputs={[
        {
          key: "pvExplicit",
          label: "명시기간 현재가치",
          format: (n) => `${n.toFixed(0)}억`,
        },
        {
          key: "terminal",
          label: "터미널 밸류 (미래)",
          format: (n) => `${n.toFixed(0)}억`,
        },
        {
          key: "pvTerminal",
          label: "터미널 밸류 현재가치",
          format: (n) => `${n.toFixed(0)}억`,
        },
        {
          key: "enterpriseValue",
          label: "기업가치 EV",
          format: (n) => `${n.toFixed(0)}억`,
          emphasis: true,
        },
        {
          key: "equityValue",
          label: "주식가치",
          format: (n) => `${n.toFixed(0)}억`,
        },
        {
          key: "perShare",
          label: "주당 가치",
          format: (n) => `${n.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}원`,
          emphasis: true,
        },
      ]}
      compute={(values) => {
        const fcf0 = values.fcf0 ?? 0;
        const wacc = values.wacc ?? 0;
        const gHigh = values.gHigh ?? 0;
        const gTerm = values.gTerm ?? 0;
        const years = values.years ?? 1;
        const netDebt = values.netDebt ?? 0;
        const shares = values.shares ?? 0;

        const r = wacc / 100;
        const g1 = gHigh / 100;
        const gT = gTerm / 100;
        const n = Math.max(1, Math.floor(years));

        let pvExplicit = 0;
        let fcfN = fcf0;
        for (let t = 1; t <= n; t++) {
          fcfN = fcf0 * Math.pow(1 + g1, t);
          pvExplicit += fcfN / Math.pow(1 + r, t);
        }
        const fcfAfter = fcfN * (1 + gT);
        const terminal = r > gT ? fcfAfter / (r - gT) : NaN;
        const pvTerminal = terminal / Math.pow(1 + r, n);
        const enterpriseValue = pvExplicit + pvTerminal;
        const equityValue = enterpriseValue - netDebt;
        // 주식가치(억 원) → 원 단위 × 1e8 / (만주 × 1e4)
        const perShare = shares > 0 ? (equityValue * 1e8) / (shares * 1e4) : 0;
        return {
          pvExplicit,
          terminal,
          pvTerminal,
          enterpriseValue,
          equityValue,
          perShare,
        };
      }}
      notes={
        <>
          가정: (1) FCF 명시기간 후 g∞로 영구 성장 (Gordon Growth), (2) WACC
          불변, (3) 자본구조 변동 반영 안 함. 실무 DCF는 최소 2단계 감쇠
          (H-model) 및 시나리오 분석이 필요하다.
          <br />
          출처: Damodaran, <em>Investment Valuation</em> 3rd ed., ch. 14. ·
          국고채 3년 수익률은 한국은행 ECOS 시계열 722Y001 참조.
        </>
      }
    />
  );
}
