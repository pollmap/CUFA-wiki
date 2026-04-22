/**
 * 자격증 모의고사 문항 뱅크.
 *
 * 주의: 상업 교재·기출 원문 복사 금지. 문항은 공개된 제도 설명,
 * 표준 교재의 일반 개념, 또는 학습 목적으로 재구성한 MCQ만 포함한다.
 * 실제 기출을 쓰려면 각 주관 기관의 공식 허가가 필요하다.
 */

export type ExamSubject =
  | "ifm-01" // 투자자산운용사 1과목 — 금융상품 및 세제
  | "ifm-02" // 투자자산운용사 2과목 — 투자운용 및 전략 I
  | "ifm-03" // 투자자산운용사 3과목 — 투자운용 및 전략 II / 투자분석
  | "ifm-04" // 투자자산운용사 4과목 — 직무윤리 및 법규·투자운용지원
  | "cfa-l1" // CFA Level 1
  | "frm-p1" // FRM Part 1
  | "kifa-fsc" // 금융투자분석사
  | "kifa-con"; // 금융투자상담사

export interface ExamSubjectMeta {
  readonly id: ExamSubject;
  readonly label: string;
  readonly track: "국내" | "국외";
  readonly estimatedMinutes: number;
}

export const EXAM_SUBJECTS: readonly ExamSubjectMeta[] = [
  { id: "ifm-01", label: "투자자산운용사 1과목 — 금융상품·세제", track: "국내", estimatedMinutes: 30 },
  { id: "ifm-02", label: "투자자산운용사 2과목 — 투자운용·전략 I", track: "국내", estimatedMinutes: 45 },
  { id: "ifm-03", label: "투자자산운용사 3과목 — 투자운용·전략 II·투자분석", track: "국내", estimatedMinutes: 45 },
  { id: "ifm-04", label: "투자자산운용사 4과목 — 직무윤리·법규", track: "국내", estimatedMinutes: 30 },
  { id: "kifa-fsc", label: "금융투자분석사", track: "국내", estimatedMinutes: 45 },
  { id: "kifa-con", label: "금융투자상담사", track: "국내", estimatedMinutes: 30 },
  { id: "cfa-l1", label: "CFA Level 1 (영문 개념)", track: "국외", estimatedMinutes: 45 },
  { id: "frm-p1", label: "FRM Part 1 (영문 개념)", track: "국외", estimatedMinutes: 45 },
];

export interface ExamQuestion {
  readonly id: string;
  readonly subject: ExamSubject;
  readonly difficulty: 1 | 2 | 3;
  readonly stem: string;
  readonly choices: readonly [string, string, string, string];
  readonly answer: 0 | 1 | 2 | 3;
  readonly explanation: string;
}

/**
 * 최소 샘플 뱅크. 모두 공개 개념 기반 재구성 문항이며, 어떤 출판사의
 * 기출 원문도 포함하지 않는다. 확장 시 `content/career/exam-banks/*.json`
 * 으로 이관 예정.
 */
export const EXAM_BANK: readonly ExamQuestion[] = [
  {
    id: "ifm-02-001",
    subject: "ifm-02",
    difficulty: 2,
    stem: "다음 중 ROE를 3요소로 분해한 DuPont 항등식에 포함되지 않는 항목은?",
    choices: [
      "순이익률 (Net Margin)",
      "총자산회전율 (Asset Turnover)",
      "재무레버리지 (Equity Multiplier)",
      "주가수익비율 (PER)",
    ],
    answer: 3,
    explanation:
      "3요소 DuPont: ROE = 순이익률 × 총자산회전율 × 재무레버리지. PER은 밸류에이션 지표로 ROE 분해식에 들어가지 않는다.",
  },
  {
    id: "ifm-02-002",
    subject: "ifm-02",
    difficulty: 2,
    stem:
      "효율적 시장가설(EMH) 중 '공개된 모든 정보가 즉시 가격에 반영된다'는 형태는?",
    choices: ["약형 (Weak)", "준강형 (Semi-strong)", "강형 (Strong)", "완전형 (Perfect)"],
    answer: 1,
    explanation:
      "준강형 EMH는 공개된 모든 정보(재무제표·공시 포함)가 즉시 가격에 반영된다고 본다. 약형=과거 가격, 강형=내부정보 포함.",
  },
  {
    id: "ifm-02-003",
    subject: "ifm-02",
    difficulty: 2,
    stem:
      "주식 A의 베타가 1.2, 무위험수익률 3%, 시장 기대수익률 9%일 때 CAPM 요구수익률은?",
    choices: ["9.0%", "10.2%", "10.8%", "12.0%"],
    answer: 1,
    explanation:
      "CAPM: E(r) = Rf + β × (Rm − Rf) = 3% + 1.2 × (9% − 3%) = 3% + 7.2% = 10.2%.",
  },
  {
    id: "ifm-03-001",
    subject: "ifm-03",
    difficulty: 2,
    stem: "채권의 듀레이션(Macaulay duration)에 대한 설명으로 옳지 않은 것은?",
    choices: [
      "만기가 길수록 듀레이션은 길어진다.",
      "쿠폰율이 높을수록 듀레이션은 짧아진다.",
      "만기수익률(YTM)이 높을수록 듀레이션은 길어진다.",
      "무이표채(zero coupon)의 듀레이션은 만기와 같다.",
    ],
    answer: 2,
    explanation:
      "YTM이 높을수록 미래 현금흐름의 현가 가중치가 뒤로 갈수록 작아져 듀레이션은 짧아진다. 나머지는 모두 옳다.",
  },
  {
    id: "ifm-03-002",
    subject: "ifm-03",
    difficulty: 3,
    stem:
      "옵션 가격 결정 요인에 관한 설명 중 콜옵션 가격에 '양(+)의 영향'을 주지 않는 것은?",
    choices: [
      "기초자산 가격 상승",
      "변동성 확대",
      "무위험이자율 상승",
      "행사가격 상승",
    ],
    answer: 3,
    explanation:
      "행사가격이 높아질수록 콜옵션 가치는 감소한다. 나머지는 모두 콜옵션 가치에 양(+)의 영향을 준다.",
  },
  {
    id: "ifm-01-001",
    subject: "ifm-01",
    difficulty: 1,
    stem:
      "예금자보호법상 예금보험공사가 1인당 지급하는 예금보험금 한도는 원금과 이자를 합하여 얼마인가? (2026년 기준)",
    choices: ["3,000만원", "5,000만원", "1억원", "2억원"],
    answer: 2,
    explanation:
      "2026년 예금자보호법 개정으로 보호한도가 5천만원에서 1억원으로 상향되었다. 금융기관별 1인당 원금+이자 합산.",
  },
  {
    id: "ifm-04-001",
    subject: "ifm-04",
    difficulty: 2,
    stem:
      "금융소비자보호법상 금융상품 판매 시 '적합성 원칙'의 핵심 요구사항이 아닌 것은?",
    choices: [
      "소비자의 투자목적·재산상황·투자경험 파악",
      "파악된 정보에 적합한 상품만 권유",
      "권유 전 핵심설명서 교부",
      "모든 고객에게 동일 수익률 보장",
    ],
    answer: 3,
    explanation:
      "적합성 원칙은 소비자 프로파일에 맞는 상품을 권유하는 원칙일 뿐, 수익률 보장과는 무관하다. 수익률 보장은 오히려 불건전영업행위.",
  },
  {
    id: "kifa-fsc-001",
    subject: "kifa-fsc",
    difficulty: 2,
    stem: "EV/EBITDA 배수를 PER 대비 사용하는 주요 이유로 가장 적절한 것은?",
    choices: [
      "자본구조와 감가상각 정책 차이를 완화해 비교가능성을 높인다.",
      "미래 성장률만을 반영한다.",
      "배당정책을 직접 평가한다.",
      "환율 변동의 영향을 제거한다.",
    ],
    answer: 0,
    explanation:
      "EV/EBITDA는 영업가치(EV)와 영업현금흐름(EBITDA)를 사용해 자본구조·감가상각·세율 차이를 완화한다. 동업종 크로스보더 비교에 유용.",
  },
  {
    id: "cfa-l1-001",
    subject: "cfa-l1",
    difficulty: 2,
    stem:
      "In the Capital Asset Pricing Model (CAPM), the slope of the Security Market Line (SML) represents:",
    choices: [
      "the risk-free rate",
      "the market risk premium (Rm − Rf)",
      "total volatility of the market portfolio",
      "beta of the individual asset",
    ],
    answer: 1,
    explanation:
      "The SML plots expected return against beta; its slope equals the market risk premium (Rm − Rf). The intercept is Rf.",
  },
  {
    id: "frm-p1-001",
    subject: "frm-p1",
    difficulty: 2,
    stem:
      "Which of the following is NOT a limitation of Value-at-Risk (VaR) as a risk measure?",
    choices: [
      "It does not describe loss magnitude beyond the VaR threshold.",
      "It is not sub-additive in general (fails coherence).",
      "It depends on the chosen confidence level and horizon.",
      "It cannot be computed for a single position.",
    ],
    answer: 3,
    explanation:
      "VaR can absolutely be computed for a single position. Real limitations: no info on tail beyond threshold, not always sub-additive, and sensitive to parameter choices.",
  },
  {
    id: "kifa-con-001",
    subject: "kifa-con",
    difficulty: 1,
    stem:
      "국내 주식시장에서 'ETF'와 'ETN'의 가장 핵심적인 차이로 가장 적절한 것은?",
    choices: [
      "ETF는 발행사의 신용위험이 없고, ETN은 발행사 신용위험이 존재한다.",
      "ETF는 상장되지 않고, ETN은 상장된다.",
      "ETF는 파생상품을 담을 수 없고, ETN은 담을 수 있다.",
      "ETF는 세금이 부과되지 않고, ETN은 부과된다.",
    ],
    answer: 0,
    explanation:
      "ETF는 펀드 형태로 기초자산을 실물 편입해 발행사 신용위험이 없으나, ETN은 발행사의 무담보 채권이므로 발행사 신용위험이 존재한다.",
  },
  {
    id: "ifm-02-004",
    subject: "ifm-02",
    difficulty: 2,
    stem:
      "포트폴리오 분산효과가 발생하기 위해 두 자산 수익률의 상관계수 조건으로 가장 정확한 것은?",
    choices: ["ρ = 1", "ρ < 1", "ρ = 0", "ρ > 0"],
    answer: 1,
    explanation:
      "상관계수가 1 미만이면 분산효과가 발생한다. ρ = −1일 때 이론적으로 분산효과가 최대, ρ = 1이면 분산효과 없음.",
  },
];

export function questionsBySubject(subject: ExamSubject): readonly ExamQuestion[] {
  return EXAM_BANK.filter((q) => q.subject === subject);
}
