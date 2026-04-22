"use client";

import { Calculator } from "./Calculator";

/**
 * EV/EBITDA 멀티플 역산 적정주가.
 * Implied EV = (EV/EBITDA_target) · EBITDA, Equity = EV − NetDebt, Price = Equity/Shares.
 * 민감도: 타겟 멀티플 ±20% 동시 출력.
 */
export function EVEBITDAReverse() {
  return (
    <Calculator
      title="EV/EBITDA 역산 적정주가 (Forward 1Y 기준)"
      description={
        <p>
          타겟 EV/EBITDA 멀티플 × EBITDA = 내재 EV → 순차입금 차감 → 발행주식수 나눔.
          Peer median 또는 historical average 기반. <strong>Forward 1Y</strong>
          EBITDA 컨센서스 사용 권장 (Trailing은 사이클 정점에서 과대평가).
        </p>
      }
      inputs={[
        {
          key: "ebitda",
          label: "EBITDA (Forward 1Y)",
          unit: "원 (억)",
          default: 3000,
          step: 50,
          hint: "컨센서스 Forward 1Y EBITDA. Trailing/TTM 혼용 금지",
        },
        {
          key: "multiple",
          label: "타겟 EV/EBITDA 멀티플 (Forward)",
          unit: "x",
          default: 8.0,
          step: 0.25,
          hint: "Peer median·historical 5Y average 기준",
        },
        {
          key: "netDebt",
          label: "순차입금 Net Debt",
          unit: "원 (억)",
          default: 5000,
          step: 100,
          hint: "총부채 − 현금성자산 (가장 최근 분기)",
        },
        {
          key: "shares",
          label: "발행주식수",
          unit: "백만주",
          default: 50,
          step: 1,
          hint: "희석 주식수 (diluted) 권장",
        },
      ]}
      outputs={[
        {
          key: "impliedEV",
          label: "내재 EV (기업가치)",
          format: (n) => `${n.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}억`,
        },
        {
          key: "impliedEquity",
          label: "내재 시가총액 (Equity Value)",
          format: (n) => `${n.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}억`,
        },
        {
          key: "impliedPrice",
          label: "내재 주가 (Implied Price, Forward 1Y)",
          format: (n) => `${n.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}원`,
          emphasis: true,
        },
        {
          key: "priceLow",
          label: "가격대역 하단 (멀티플 −20%)",
          format: (n) => `${n.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}원`,
        },
        {
          key: "priceHigh",
          label: "가격대역 상단 (멀티플 +20%)",
          format: (n) => `${n.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}원`,
        },
      ]}
      compute={(values) => {
        const ebitda = values.ebitda ?? 0;
        const multiple = values.multiple ?? 0;
        const netDebt = values.netDebt ?? 0;
        const shares = values.shares ?? 0;

        const calc = (mult: number) => {
          const ev = mult * ebitda;
          const equity = ev - netDebt;
          // equity(억원) → 원 단위 × 1e8 / (shares 백만주 × 1e6)
          const price = shares > 0 ? (equity * 1e8) / (shares * 1e6) : NaN;
          return { ev, equity, price };
        };

        const base = calc(multiple);
        const low = calc(multiple * 0.8);
        const high = calc(multiple * 1.2);

        return {
          impliedEV: base.ev,
          impliedEquity: base.equity,
          impliedPrice: base.price,
          priceLow: low.price,
          priceHigh: high.price,
        };
      }}
      notes={
        <>
          가정: (1) EBITDA forward 1Y 정확, (2) Net Debt 변동 없음, (3) Peer multiple
          비교 가능성. EBITDA는 non-GAAP — stock-based comp, lease expense 조정 여부
          확인. 한국 KIFRS는 IFRS 16 적용으로 운용리스도 부채 계상 (순차입금 정의 주의).
          <br />
          출처: Damodaran, <em>Relative Valuation</em> ch. 19. · Forward 멀티플은
          FnGuide/Bloomberg 컨센서스 (I/B/E/S 12MF).
        </>
      }
    />
  );
}
