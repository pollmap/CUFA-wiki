/**
 * Calculator registry for `/tools/calc/[slug]` routes.
 *
 * Drives:
 *  - `generateStaticParams()` — 12 slug pre-render
 *  - Per-page header/formula/related
 *  - Tools hub card links
 *
 * Related slugs MUST match existing learn doc slugs under `content/learn/**`.
 * Formula is stored as plain LaTeX text and rendered inside `<code>` (no KaTeX
 * runtime here — KaTeX remark pipeline only applies to MDX body).
 */

export type CalcCategory =
  | "valuation"
  | "screening"
  | "portfolio"
  | "fixed-income";

export type CalcDifficulty = "beginner" | "intermediate" | "advanced";

export interface CalcMeta {
  slug: string;
  title: string;
  kicker: string;
  component: string;
  description: string;
  formula: string;
  category: CalcCategory;
  difficulty: CalcDifficulty;
  related: readonly string[];
  example: {
    title: string;
    body: string;
  };
}

export const CALC_CATEGORY_LABEL: Record<CalcCategory, string> = {
  valuation: "밸류에이션 · Valuation",
  screening: "스크리닝 · Screening",
  portfolio: "포트폴리오 · Portfolio",
  "fixed-income": "채권 · Fixed Income",
};

export const CALC_REGISTRY: readonly CalcMeta[] = [
  {
    slug: "dcf",
    title: "DCF — 현금흐름할인",
    kicker: "DCF · Discounted Cash Flow",
    component: "GuidedDCF",
    description:
      "기업 내재가치를 미래 Free Cash Flow 할인으로 추정. 3년 고성장 + Gordon Terminal Value 2단계 모델. 학습용 가정 공개.",
    formula: "V = Σ_{t=1..n} FCF_t / (1+WACC)^t + TV / (1+WACC)^n",
    category: "valuation",
    difficulty: "intermediate",
    related: [
      "valuation/dcf/overview",
      "valuation/dcf/wacc",
      "valuation/dcf/terminal-value",
      "valuation/dcf/sensitivity",
    ],
    example: {
      title: "활용 예 — 삼성전자 (005930)",
      body: "컨센서스 기반 2025E FCF ~45조원 · WACC ~8.5% · Terminal g ~2.5%. 민감도 표에서 g, WACC ±1%p 스트레스로 EV 밴드 확인.",
    },
  },
  {
    slug: "wacc",
    title: "WACC — 가중평균자본비용",
    kicker: "WACC · Weighted Average Cost of Capital",
    component: "WACC",
    description:
      "자기자본비용(CAPM)과 세후 타인자본비용을 자본구조 비중으로 가중 평균. DCF 할인율의 기준.",
    formula: "WACC = (E/V)·Re + (D/V)·Rd·(1 − T)",
    category: "valuation",
    difficulty: "intermediate",
    related: [
      "valuation/dcf/wacc",
      "valuation/dcf/overview",
      "financial-analysis/stability/debt-ratio",
    ],
    example: {
      title: "활용 예 — KOSPI 대형주 평균 (2025)",
      body: "무위험수익률 3.2% (국고 10Y) · ERP 6.0% · β 0.9 → Re ≈ 8.6%. 세율 24.2% · 부채비중 25% → WACC ≈ 7.4%.",
    },
  },
  {
    slug: "ddm",
    title: "DDM — 배당할인모형",
    kicker: "DDM · Dividend Discount Model",
    component: "DDM",
    description:
      "기대 배당을 요구수익률로 할인. Gordon 성장모형: 안정배당 기업·금융·유틸리티에 유효.",
    formula: "P = D_1 / (r − g)",
    category: "valuation",
    difficulty: "beginner",
    related: [
      "valuation/dcf/overview",
      "financial-analysis/profitability/return-analysis",
    ],
    example: {
      title: "활용 예 — KT&G (033780)",
      body: "D₀ 5,200원 · 기대 성장 g 2% · 요구수익률 r 8% → 적정 주가 = 5,200·1.02 / (0.08−0.02) ≈ 88,400원.",
    },
  },
  {
    slug: "rim",
    title: "RIM — 잔여이익모형",
    kicker: "RIM · Residual Income Model",
    component: "RIM",
    description:
      "장부가치 + 초과수익의 현재가치. ROE−Re 스프레드가 핵심. 회계 기반이라 FCF 추정 어려운 금융 섹터에 유용.",
    formula: "V = BV_0 + Σ (ROE_t − Re) · BV_{t−1} / (1+Re)^t",
    category: "valuation",
    difficulty: "advanced",
    related: [
      "valuation/residual-income",
      "financial-analysis/profitability/return-analysis",
      "financial-analysis/profitability/dupont",
    ],
    example: {
      title: "활용 예 — KB금융 (105560)",
      body: "BPS 95,000원 · ROE 10% · Re 9% → 스프레드 1%p. 1%p × BV 현재가치 누적이 장부가 프리미엄.",
    },
  },
  {
    slug: "ev-ebitda",
    title: "EV/EBITDA — 역산 밸류에이션",
    kicker: "EV/EBITDA Reverse",
    component: "EVEBITDAReverse",
    description:
      "Peer 멀티플을 역으로 적용해 내재 주가 산출. CapEx 집약 산업·레버리지 상이 기업 비교에 강함.",
    formula: "Equity = EBITDA × Multiple − Net Debt − Minority + Non-Op Assets",
    category: "valuation",
    difficulty: "intermediate",
    related: [
      "valuation/relative/ev-ebitda",
      "valuation/relative/overview",
      "financial-analysis/valuation-multiples/overview",
    ],
    example: {
      title: "활용 예 — HD현대중공업 (329180)",
      body: "2025E EBITDA 1.7조원 · Peer median EV/EBITDA 9.0x → EV 15.3조원. 순차입 0.8조 차감 → Equity 14.5조원.",
    },
  },
  {
    slug: "graham",
    title: "Graham Number — 보수적 내재가치",
    kicker: "Graham Number",
    component: "GrahamNumber",
    description:
      "Benjamin Graham의 보수적 내재가치 공식. EPS·BPS 기반 간이 스크리닝 툴. 저성장 안정 기업에 적합.",
    formula: "V = √(22.5 × EPS × BPS)",
    category: "screening",
    difficulty: "beginner",
    related: [
      "valuation/relative/per",
      "valuation/relative/pbr",
      "trading/value-investing",
    ],
    example: {
      title: "활용 예 — POSCO홀딩스 (005490)",
      body: "EPS 40,000원 · BPS 580,000원 → √(22.5 × 40,000 × 580,000) ≈ 722,000원. 현재가와 비교로 할인율 확인.",
    },
  },
  {
    slug: "piotroski",
    title: "Piotroski F-Score — 재무건전성",
    kicker: "Piotroski F-Score",
    component: "PiotroskiFScore",
    description:
      "9개 회계 기준 통과 여부 합산(0–9). F≥7은 우량 벨류, F≤3은 경고. 저PBR 스크리너와 결합 시 효과적.",
    formula: "F = Σ_{i=1..9} 1[criterion_i pass]",
    category: "screening",
    difficulty: "intermediate",
    related: [
      "financial-analysis/overview",
      "financial-analysis/profitability/dupont",
      "financial-analysis/stability/debt-ratio",
    ],
    example: {
      title: "활용 예 — KT (030200)",
      body: "순이익+ · CFO+ · ROA↑ · CFO>NI · 부채비율↓ · 유동비율↑ · 주식발행 無 · GPM↑ · 자산회전↑ → F=9 만점.",
    },
  },
  {
    slug: "altman-z",
    title: "Altman Z-Score — 파산 예측",
    kicker: "Altman Z-Score",
    component: "AltmanZ",
    description:
      "5개 재무비율 가중합. Z>2.99 안전권, Z<1.81 위험권. 부실 채권·워크아웃 리스크 스크리닝에 사용.",
    formula:
      "Z = 1.2·A + 1.4·B + 3.3·C + 0.6·D + 1.0·E (A=WC/TA, B=RE/TA, C=EBIT/TA, D=MV/TL, E=Sales/TA)",
    category: "screening",
    difficulty: "advanced",
    related: [
      "financial-analysis/stability/debt-ratio",
      "financial-analysis/stability/liquidity",
      "company-analysis/quantitative/scenario-analysis",
    ],
    example: {
      title: "활용 예 — 한진중공업 (2019 워크아웃 직전)",
      body: "EBIT/TA 음수 · WC/TA 음수 · RE/TA 음수 → Z ≈ 0.8 (Distress Zone). 이후 채권단 출자전환 현실화.",
    },
  },
  {
    slug: "dupont",
    title: "DuPont — ROE 3분해",
    kicker: "DuPont Analysis",
    component: "DuPont",
    description:
      "ROE = 마진 × 회전율 × 레버리지. 수익성·효율성·재무구조 드라이버 분리. 동종 비교에 강력.",
    formula: "ROE = (NI/Sales) × (Sales/Assets) × (Assets/Equity)",
    category: "screening",
    difficulty: "beginner",
    related: [
      "financial-analysis/profitability/dupont",
      "financial-analysis/profitability/return-analysis",
      "financial-analysis/efficiency/asset-turnover",
    ],
    example: {
      title: "활용 예 — LG생활건강 vs 아모레퍼시픽",
      body: "LG생활건강 ROE 12% = 마진 9% × 회전 1.0 × 레버리지 1.3. 아모레 ROE 5% = 마진 3% × 회전 0.9 × 레버리지 1.9 — 마진 격차가 주 드라이버.",
    },
  },
  {
    slug: "kelly",
    title: "Kelly Criterion — 베팅 사이즈",
    kicker: "Kelly Criterion",
    component: "KellyCriterion",
    description:
      "장기 복리 성장률 최대화 포지션 크기. 승률·손익비 기반. 실무는 Fractional Kelly (½·¼) 사용.",
    formula: "f* = (p·b − q) / b  (p=승률, q=1−p, b=손익비)",
    category: "portfolio",
    difficulty: "intermediate",
    related: [
      "portfolio/position-sizing",
      "portfolio/risk-adjusted-returns",
      "portfolio/drawdown-management",
    ],
    example: {
      title: "활용 예 — 이벤트 드리븐 전략",
      body: "승률 55% · 평균 손익비 1.5 → f* = (0.55·1.5 − 0.45)/1.5 ≈ 25%. Half-Kelly 적용 시 12.5%.",
    },
  },
  {
    slug: "sharpe",
    title: "Sharpe Ratio — 위험조정수익률",
    kicker: "Sharpe Ratio",
    component: "SharpeRatio",
    description:
      "초과수익 / 변동성. 서로 다른 전략·펀드의 리스크 대비 보상 비교. >1 양호, >2 우수 기준.",
    formula: "SR = (R_p − R_f) / σ_p",
    category: "portfolio",
    difficulty: "beginner",
    related: [
      "portfolio/risk-adjusted-returns",
      "portfolio/overview",
      "portfolio/drawdown-management",
    ],
    example: {
      title: "활용 예 — KOSPI200 vs 국고 10Y",
      body: "KOSPI200 연수익 7% · 변동성 18% · 무위험 3.2% → SR ≈ 0.21. 국고 10Y는 σ 낮아 SR 상대적 열위 아님.",
    },
  },
  {
    slug: "bond-duration",
    title: "Bond Duration — 듀레이션 · 볼록성",
    kicker: "Duration · Convexity",
    component: "BondDuration",
    description:
      "금리 민감도 측정. Macaulay/Modified Duration + Convexity 보정. 채권 포트폴리오 헷지 설계 기초.",
    formula: "ΔP/P ≈ −D·Δy + ½·C·(Δy)²",
    category: "fixed-income",
    difficulty: "advanced",
    related: [
      "assets/bonds/bonds/intro",
      "assets/bonds/bonds/inflation-linked",
      "portfolio/hedging",
    ],
    example: {
      title: "활용 예 — KSS해운 회사채 5년물",
      body: "Coupon 4.5% · YTM 5.0% · 잔존 5Y → Modified Duration ≈ 4.3. 금리 +100bp 시 가격 −4.3% (Convexity 보정 전).",
    },
  },
] as const;

export function getCalc(slug: string): CalcMeta | undefined {
  return CALC_REGISTRY.find((c) => c.slug === slug);
}

export const CALC_SLUGS: readonly string[] = CALC_REGISTRY.map((c) => c.slug);
