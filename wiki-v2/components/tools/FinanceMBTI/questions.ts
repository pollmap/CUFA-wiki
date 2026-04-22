/**
 * Finance MBTI 진단 문항.
 * v1 Docusaurus `wiki/src/components/FinanceMBTI/FinanceMBTI.tsx`에서 전수 이식.
 * 4 차원(SD, AQ, IE, RC) × 5 문항 = 20 문항.
 */

export type Dimension = "SD" | "AQ" | "IE" | "RC";

export interface Question {
  id: number;
  dimension: Dimension;
  text: string;
  choiceA: string;
  choiceB: string;
}

export const questions: Question[] = [
  // SD: 안정(S) vs 도전(D) — questions 1-5
  {
    id: 1,
    dimension: "SD",
    text: "커리어를 시작할 때, 어떤 환경이 더 끌리나요?",
    choiceA: "체계적인 교육 프로그램과 안정적인 연봉이 보장되는 대형 금융기관",
    choiceB: "빠르게 성장하며 다양한 역할을 경험할 수 있는 스타트업/소규모 조직",
  },
  {
    id: 2,
    dimension: "SD",
    text: "프로젝트 결과의 불확실성에 대해 어떻게 생각하나요?",
    choiceA: "예측 가능한 결과를 위해 검증된 방법론을 따르는 것이 좋다",
    choiceB: "불확실하더라도 높은 성과를 노릴 수 있는 새로운 접근이 흥미롭다",
  },
  {
    id: 3,
    dimension: "SD",
    text: "다음 중 더 가치 있다고 느끼는 것은?",
    choiceA: "수십 년간 축적된 조직의 노하우와 브랜드 신뢰",
    choiceB: "업계의 관행을 깨뜨리는 혁신적 비즈니스 모델",
  },
  {
    id: 4,
    dimension: "SD",
    text: "연봉 협상 시, 어떤 구조가 더 매력적인가요?",
    choiceA: "기본급이 높고 안정적인 보상 체계",
    choiceB: "기본급은 낮지만 성과에 따라 큰 인센티브가 가능한 구조",
  },
  {
    id: 5,
    dimension: "SD",
    text: "10년 후 자신의 모습으로 더 와닿는 것은?",
    choiceA: "해당 분야의 전문가로 인정받으며 조직의 핵심 인력이 된 모습",
    choiceB: "여러 도전을 거쳐 자신만의 투자 철학이나 사업을 구축한 모습",
  },

  // AQ: 분석(A) vs 정량(Q) — questions 6-10
  {
    id: 6,
    dimension: "AQ",
    text: "기업을 분석할 때 더 자연스러운 접근은?",
    choiceA: "경영진 인터뷰, 산업 동향, 경쟁 구도 등 정성적 요소 파악",
    choiceB: "재무제표 비율, 통계 모델, 밸류에이션 수치 중심 분석",
  },
  {
    id: 7,
    dimension: "AQ",
    text: "어떤 과목이 더 흥미로웠나요?",
    choiceA: "경영전략, 마케팅, 산업분석 등 비즈니스 판단 과목",
    choiceB: "통계학, 계량경제, 파생상품 이론 등 수리적 과목",
  },
  {
    id: 8,
    dimension: "AQ",
    text: "보고서를 작성할 때, 어떤 스타일인가요?",
    choiceA: "논리적 스토리라인과 설득력 있는 내러티브 구성에 집중",
    choiceB: "데이터 기반의 차트와 수치적 근거 제시에 집중",
  },
  {
    id: 9,
    dimension: "AQ",
    text: "투자 의사결정 시 더 신뢰하는 것은?",
    choiceA: "업계 전문가의 인사이트와 질적 판단",
    choiceB: "백테스팅 결과와 정량적 시그널",
  },
  {
    id: 10,
    dimension: "AQ",
    text: "새로운 업무 도구를 배운다면?",
    choiceA: "Bloomberg 터미널, 산업 리서치 DB 등 정보 분석 툴",
    choiceB: "Python, R, SQL 등 데이터 프로그래밍 언어",
  },

  // IE: 내향(I) vs 외향(E) — questions 11-15
  {
    id: 11,
    dimension: "IE",
    text: "가장 생산적이라고 느끼는 업무 환경은?",
    choiceA: "조용히 집중해서 깊이 있는 분석 작업을 하는 시간",
    choiceB: "다양한 사람들과 미팅하며 아이디어를 교환하는 시간",
  },
  {
    id: 12,
    dimension: "IE",
    text: "업무 성과를 인정받는 방식 중 더 와닿는 것은?",
    choiceA: "작성한 리포트나 분석의 정확성과 깊이를 인정받는 것",
    choiceB: "클라이언트나 동료로부터 커뮤니케이션 능력을 인정받는 것",
  },
  {
    id: 13,
    dimension: "IE",
    text: "점심시간 활용 방식으로 더 선호하는 것은?",
    choiceA: "혼자 또는 소수와 조용히 식사하며 에너지 재충전",
    choiceB: "다양한 부서 사람들과 네트워킹 점심",
  },
  {
    id: 14,
    dimension: "IE",
    text: "금융권에서 더 해보고 싶은 역할은?",
    choiceA: "데이터와 리서치에 기반한 의견을 제시하는 역할",
    choiceB: "고객을 직접 만나 솔루션을 제안하고 관계를 구축하는 역할",
  },
  {
    id: 15,
    dimension: "IE",
    text: "스트레스를 받을 때 선호하는 해소법은?",
    choiceA: "혼자만의 시간을 갖고 조용히 정리하기",
    choiceB: "친구나 동료와 대화하며 풀기",
  },

  // RC: 규정(R) vs 창의(C) — questions 16-20
  {
    id: 16,
    dimension: "RC",
    text: "업무 프로세스에 대한 생각은?",
    choiceA: "명확한 매뉴얼과 절차가 있어야 효율적으로 일할 수 있다",
    choiceB: "상황에 맞게 유연하게 대응하는 것이 더 효과적이다",
  },
  {
    id: 17,
    dimension: "RC",
    text: "규제와 컴플라이언스에 대한 태도는?",
    choiceA: "금융은 신뢰 산업이므로 규제 준수가 가장 중요하다",
    choiceB: "규제 안에서도 혁신의 여지를 찾는 것이 경쟁력이다",
  },
  {
    id: 18,
    dimension: "RC",
    text: "조직 문화에서 더 중요하게 생각하는 것은?",
    choiceA: "체계적인 의사결정 구조와 명확한 역할 분담",
    choiceB: "수평적 문화와 자율적인 업무 방식",
  },
  {
    id: 19,
    dimension: "RC",
    text: "새로운 금융 상품이 등장했을 때의 반응은?",
    choiceA: "기존 규정과 리스크 프레임워크로 먼저 검증해야 한다",
    choiceB: "시장 기회를 먼저 파악하고 빠르게 적용 방법을 모색한다",
  },
  {
    id: 20,
    dimension: "RC",
    text: "5년 후 금융업에서 가장 중요한 것은?",
    choiceA: "신뢰와 안정성을 기반으로 한 전통 금융의 진화",
    choiceB: "기술과 창의성으로 무장한 새로운 금융 패러다임",
  },
];

export const totalQuestions = questions.length;
