/**
 * Finance MBTI 16 유형 결과 데이터.
 * v1 Docusaurus 원본 데이터 전수 이식.
 */

export interface JobDef {
  title: string;
  desc: string;
}

export interface TypeProfile {
  code: string;
  name: string;
  description: string;
  sectors: string[];
  sectorLinks: string[];
  jobs: JobDef[];
  certs: string[];
  companies: string[];
}

export const typeProfiles: Record<string, TypeProfile> = {
  SAIR: {
    code: "SAIR",
    name: "안정의 수호자",
    description:
      "당신은 체계적이고 신중한 성격으로, 조직의 안정성과 리스크 관리를 최우선으로 생각합니다. 정성적 판단력과 분석 능력이 뛰어나며, 규정과 프로세스를 충실히 따르는 가운데 조직의 건전성을 지키는 데 큰 보람을 느낍니다. 대형 금융기관의 핵심 인력으로 성장할 잠재력이 높습니다.",
    sectors: ["시중은행", "정책금융기관", "공제회"],
    sectorLinks: ["/industries/banks", "/industries/public-infra", "/industries/public-infra"],
    jobs: [
      { title: "여신심사", desc: "기업 및 개인 대출의 건전성을 심사하고 리스크를 평가합니다" },
      { title: "리스크관리", desc: "시장·신용·운영 리스크를 모니터링하고 관리 체계를 운영합니다" },
      { title: "감사/컴플라이언스", desc: "내부통제와 규정 준수를 관리합니다" },
    ],
    certs: ["신용분석사", "금융위험관리사(FRM)", "CFA Level 1"],
    companies: ["KB국민은행", "산업은행", "한국수출입은행", "신용보증기금"],
  },
  SAER: {
    code: "SAER",
    name: "관계의 조율사",
    description:
      "당신은 사람과의 관계를 통해 가치를 창출하는 데 뛰어난 재능이 있습니다. 안정적인 환경에서 고객과의 신뢰를 쌓아가며, 체계적인 프로세스 안에서 고객 맞춤형 서비스를 제공하는 것에 강점이 있습니다. 금융 서비스업의 핵심 가치인 관계 금융을 실현할 인재입니다.",
    sectors: ["은행 PB", "카드사", "보험사"],
    sectorLinks: ["/industries/banks", "/industries/cards-capital", "/industries/insurance"],
    jobs: [
      { title: "PB(프라이빗뱅커)", desc: "고액자산가를 대상으로 종합 자산관리 서비스를 제공합니다" },
      { title: "마케팅", desc: "고객 세분화와 맞춤 금융 상품 마케팅 전략을 수립합니다" },
      { title: "고객관리(RM)", desc: "기업/개인 고객과의 관계를 관리하고 금융 솔루션을 제안합니다" },
    ],
    certs: ["AFPK", "CFP", "은행텔러자격"],
    companies: ["하나은행", "삼성카드", "삼성생명", "KB증권 WM"],
  },
  SAIC: {
    code: "SAIC",
    name: "혁신의 설계자",
    description:
      "당신은 안정성을 기반으로 하되, 창의적 사고로 새로운 방향을 제시하는 능력이 있습니다. 정성적 분석력과 혁신적 마인드를 결합하여, 기존 금융의 프레임워크를 개선하고 디지털 전환을 이끄는 역할에 적합합니다. 전통 금융과 핀테크의 가교 역할을 할 수 있는 인재입니다.",
    sectors: ["인터넷전문은행", "핀테크", "금융 IT"],
    sectorLinks: ["/industries/banks", "/industries/vc-fintech", "/industries/securities"],
    jobs: [
      { title: "프로덕트매니저(PM)", desc: "금융 상품·서비스의 기획부터 출시까지 총괄합니다" },
      { title: "디지털전략", desc: "금융기관의 디지털 트랜스포메이션 전략을 수립합니다" },
      { title: "UX 기획", desc: "사용자 중심의 금융 서비스 경험을 설계합니다" },
    ],
    certs: ["AFPK", "SQLD", "PMP"],
    companies: ["카카오뱅크", "토스", "네이버파이낸셜", "케이뱅크"],
  },
  SAEC: {
    code: "SAEC",
    name: "소통의 개척자",
    description:
      "당신은 뛰어난 대인관계 능력과 분석적 사고를 겸비한 유형입니다. 안정적 기반 위에서 자율적으로 고객과 시장을 개척하는 역할에 강합니다. 금융 상품에 대한 이해를 바탕으로 영업 현장에서 고객의 니즈를 정확히 파악하고 솔루션을 제안하는 데 탁월합니다.",
    sectors: ["보험 GA관리", "WM센터", "은행 영업점"],
    sectorLinks: ["/industries/insurance", "/industries/securities", "/industries/banks"],
    jobs: [
      { title: "영업관리", desc: "GA채널 및 영업조직의 성과를 관리하고 전략을 수립합니다" },
      { title: "자산관리(WM)", desc: "고객의 자산 포트폴리오를 설계하고 관리합니다" },
      { title: "방카슈랑스", desc: "은행 채널을 통한 보험 상품 판매 전략을 수립합니다" },
    ],
    certs: ["AFPK", "CFP", "변액보험판매자격"],
    companies: ["삼성생명", "KB손해보험", "미래에셋증권 WM", "한화생명"],
  },
  SQIR: {
    code: "SQIR",
    name: "정밀의 분석가",
    description:
      "당신은 수리적 능력과 체계적 사고를 겸비한 분석 전문가입니다. 복잡한 데이터 속에서 패턴을 찾아내고, 정밀한 모델을 구축하는 데 강점이 있습니다. 규정과 프로세스를 준수하며 독립적으로 깊이 있는 분석 작업을 수행하는 환경에서 최고의 성과를 발휘합니다.",
    sectors: ["보험 계리", "리스크관리", "금융감독원"],
    sectorLinks: ["/industries/insurance", "/career", "/industries/public-infra"],
    jobs: [
      { title: "계리사", desc: "보험 상품의 가격 결정과 책임준비금을 산출합니다" },
      { title: "리스크모델링", desc: "금융 리스크를 정량화하고 모델을 개발·검증합니다" },
      { title: "ALM 분석", desc: "자산-부채 매칭 전략을 수립하고 관리합니다" },
    ],
    certs: ["보험계리사", "FRM", "SOA(북미계리사)"],
    companies: ["삼성화재", "한화생명", "금융감독원", "DB손해보험"],
  },
  SQER: {
    code: "SQER",
    name: "데이터의 통역사",
    description:
      "당신은 수리적 분석 능력과 커뮤니케이션 능력을 균형 있게 갖춘 유형입니다. 데이터에서 의미를 추출하고 이를 비전문가에게도 이해하기 쉽게 전달하는 데 탁월합니다. 체계적 환경에서 데이터 기반 의사결정을 지원하는 역할에 가장 적합합니다.",
    sectors: ["카드사", "저축은행", "캐피탈"],
    sectorLinks: ["/industries/cards-capital", "/industries/savings-asset", "/industries/cards-capital"],
    jobs: [
      { title: "데이터분석", desc: "고객 행동 데이터를 분석하여 비즈니스 인사이트를 도출합니다" },
      { title: "심사/여신", desc: "정량적 모델 기반으로 신용 심사 체계를 운영합니다" },
      { title: "CRM 분석", desc: "고객 관계 데이터를 분석하여 마케팅 전략을 수립합니다" },
    ],
    certs: ["ADsP", "SQLD", "신용분석사"],
    companies: ["삼성카드", "현대카드", "SBI저축은행", "현대캐피탈"],
  },
  SQIC: {
    code: "SQIC",
    name: "시스템의 혁신가",
    description:
      "당신은 수리·기술적 역량과 혁신적 사고를 겸비한 유형입니다. 복잡한 시스템을 설계하고 기술로 금융의 새로운 가능성을 여는 데 관심이 많습니다. 독립적으로 깊이 있는 기술 작업을 수행하면서도 창의적 접근을 추구하는 환경에서 빛납니다.",
    sectors: ["핀테크", "금융인프라", "빅테크 금융"],
    sectorLinks: ["/industries/vc-fintech", "/industries/public-infra", "/industries/securities"],
    jobs: [
      { title: "데이터사이언스", desc: "ML/AI를 활용한 금융 모델을 개발합니다" },
      { title: "시스템개발", desc: "금융 거래 시스템과 인프라를 설계·개발합니다" },
      { title: "AI/ML 엔지니어", desc: "금융 데이터를 활용한 인공지능 모델을 구축합니다" },
    ],
    certs: ["ADsP/ADP", "CFA Level 1", "AWS 자격증"],
    companies: ["토스", "카카오페이", "두나무", "NHN페이코"],
  },
  SQEC: {
    code: "SQEC",
    name: "정량의 소통가",
    description:
      "당신은 정량적 분석 역량과 뛰어난 소통 능력을 동시에 보유한 유형입니다. 수치와 데이터를 활용하면서도 고객과의 직접적인 소통을 즐기며, 자율적인 환경에서 성과를 만들어내는 데 강합니다. 금융 세일즈와 자문 분야에서 차별화된 역량을 발휘할 수 있습니다.",
    sectors: ["증권 WM", "은행 기업금융", "자산운용 세일즈"],
    sectorLinks: ["/industries/securities", "/industries/banks", "/industries/savings-asset"],
    jobs: [
      { title: "자산관리(WM)", desc: "정량적 분석을 기반으로 고객 맞춤 포트폴리오를 제안합니다" },
      { title: "기업금융(CF)", desc: "기업 고객의 자금 조달과 재무 구조를 자문합니다" },
      { title: "펀드세일즈", desc: "기관투자자에게 펀드 상품을 소개하고 관계를 관리합니다" },
    ],
    certs: ["CFA", "AFPK/CFP", "투자자산운용사"],
    companies: ["미래에셋증권", "KB증권", "삼성자산운용", "NH투자증권"],
  },
  DAIR: {
    code: "DAIR",
    name: "전략의 감별사",
    description:
      "당신은 도전적 환경에서 깊이 있는 분석으로 투자 기회를 발굴하는 유형입니다. 독립적으로 산업과 기업을 연구하며, 체계적인 분석 프레임워크 안에서 날카로운 인사이트를 도출하는 데 탁월합니다. 리서치와 신용분석 분야에서 최고의 역량을 발휘할 수 있습니다.",
    sectors: ["증권 리서치", "신용평가사", "자산운용"],
    sectorLinks: ["/industries/securities", "/industries/securities", "/industries/savings-asset"],
    jobs: [
      { title: "애널리스트(리서치)", desc: "산업과 기업을 분석하여 투자 의견을 제시합니다" },
      { title: "신용분석", desc: "기업 및 금융상품의 신용등급을 평가합니다" },
      { title: "전략/이코노미스트", desc: "거시경제와 시장 전략에 대한 분석을 수행합니다" },
    ],
    certs: ["CFA", "CIIA", "금융투자분석사"],
    companies: ["한국투자증권", "한국신용평가", "NICE신용평가", "삼성증권"],
  },
  DAER: {
    code: "DAER",
    name: "딜의 마에스트로",
    description:
      "당신은 도전적인 딜 환경에서 관계를 활용하여 기회를 만드는 데 뛰어난 유형입니다. 분석적 사고와 대인관계 역량을 결합하여, 체계적 프로세스 안에서 대규모 금융 거래를 성사시키는 역할에 적합합니다. IB와 M&A 분야에서 최고의 딜메이커로 성장할 수 있습니다.",
    sectors: ["증권 IB", "M&A 자문", "대형 회계법인 FAS"],
    sectorLinks: ["/industries/securities", "/career", "/industries/securities"],
    jobs: [
      { title: "IB(투자은행)", desc: "기업의 자본 조달, 구조조정, M&A를 자문합니다" },
      { title: "딜소싱", desc: "M&A 및 투자 기회를 발굴하고 딜을 추진합니다" },
      { title: "IPO/유상증자", desc: "기업공개와 자본시장 거래를 주관합니다" },
    ],
    certs: ["CFA", "공인회계사(CPA)", "변호사"],
    companies: ["삼성증권 IB", "한국투자증권 IB", "미래에셋증권 IB", "NH투자증권 IB"],
  },
  DAIC: {
    code: "DAIC",
    name: "가치의 탐험가",
    description:
      "당신은 남들이 보지 못하는 가치를 발견하는 눈을 가진 유형입니다. 도전적이고 자율적인 환경에서 독립적으로 투자 대상을 분석하고, 창의적 시각으로 숨겨진 가치를 평가하는 데 강점이 있습니다. VC, PE, 자산운용 분야에서 탁월한 투자 전문가로 성장할 수 있습니다.",
    sectors: ["자산운용", "VC/PEF", "사모펀드"],
    sectorLinks: ["/industries/savings-asset", "/industries/vc-fintech", "/industries/securities"],
    jobs: [
      { title: "펀드매니저", desc: "투자 포트폴리오를 구성하고 운용 전략을 실행합니다" },
      { title: "심사역(VC)", desc: "스타트업의 투자 가치를 평가하고 투자를 집행합니다" },
      { title: "바이아웃 심사", desc: "기업 인수 기회를 평가하고 가치 창출 전략을 수립합니다" },
    ],
    certs: ["CFA", "CAIA", "투자자산운용사"],
    companies: ["한국투자파트너스", "스틱인베스트먼트", "삼성자산운용", "IMM인베스트먼트"],
  },
  DAEC: {
    code: "DAEC",
    name: "시장의 교섭가",
    description:
      "당신은 시장의 역동적인 환경에서 빠른 판단력과 대인관계 능력으로 기회를 잡는 유형입니다. 정성적 감각과 소통 능력을 바탕으로 트레이딩과 세일즈 영역에서 뛰어난 성과를 발휘할 수 있습니다. 자유롭고 도전적인 금융시장의 최전선에서 가장 빛나는 인재입니다.",
    sectors: ["증권 S&T", "외환딜링", "선물사"],
    sectorLinks: ["/industries/securities", "/industries/banks", "/industries/vc-fintech"],
    jobs: [
      { title: "트레이더", desc: "주식, 채권, 외환 등 금융상품을 직접 매매합니다" },
      { title: "세일즈(기관영업)", desc: "기관투자자에게 시장 뷰와 투자 아이디어를 제공합니다" },
      { title: "외환딜러", desc: "외환시장에서 환율 거래를 수행합니다" },
    ],
    certs: ["금융투자분석사", "외환관리사", "CFA"],
    companies: ["골드만삭스 서울", "JP모간 서울", "한국투자증권 S&T", "삼성증권 트레이딩"],
  },
  DQIR: {
    code: "DQIR",
    name: "퀀트 전략가",
    description:
      "당신은 수학과 통계를 무기로 금융시장의 비밀을 풀어내는 유형입니다. 도전적 환경에서 독립적으로 정밀한 정량 모델을 개발하는 데 열정이 있으며, 체계적인 리스크 프레임워크 안에서 최적의 투자 전략을 설계합니다. 퀀트 금융의 최전선에서 활약할 인재입니다.",
    sectors: ["자산운용 퀀트", "선물사", "리스크 컨설팅"],
    sectorLinks: ["/industries/savings-asset", "/industries/securities", "/career"],
    jobs: [
      { title: "퀀트", desc: "수학적 모델을 활용하여 투자 전략을 개발합니다" },
      { title: "리스크모델링", desc: "VaR, 스트레스테스트 등 리스크 모델을 설계합니다" },
      { title: "파생상품 가격결정", desc: "옵션 등 파생상품의 이론가를 산출합니다" },
    ],
    certs: ["FRM", "CQF", "CFA"],
    companies: ["삼성자산운용", "미래에셋자산운용", "타워리서치", "이스트스프링"],
  },
  DQER: {
    code: "DQER",
    name: "시장의 해석자",
    description:
      "당신은 정량적 분석과 시장 감각을 겸비한 유형입니다. 도전적 환경에서 데이터와 수치를 기반으로 시장을 해석하며, 규정된 프레임워크 안에서 거래 상대방과 적극적으로 소통합니다. 파생상품, 구조화 금융 등 복잡한 금융의 세계에서 핵심 역할을 수행할 수 있습니다.",
    sectors: ["증권 S&T", "파생상품", "구조화금융"],
    sectorLinks: ["/industries/securities", "/career", "/industries/securities"],
    jobs: [
      { title: "파생상품트레이딩", desc: "옵션, 선물 등 파생상품을 거래하고 헤지합니다" },
      { title: "구조화금융", desc: "ABS, MBS 등 구조화 상품을 설계하고 운용합니다" },
      { title: "프라이싱", desc: "복잡한 금융상품의 가격을 산정하고 호가를 제시합니다" },
    ],
    certs: ["FRM", "CFA", "금융공학 관련 석사"],
    companies: ["한국투자증권", "NH투자증권", "메리츠증권", "KB증권"],
  },
  DQIC: {
    code: "DQIC",
    name: "알고리즘의 창조자",
    description:
      "당신은 기술과 금융의 교차점에서 새로운 가치를 창출하는 유형입니다. 도전적이고 자율적인 환경에서 독립적으로 정량 모델과 알고리즘을 설계·구현하는 데 열정이 있습니다. 코딩과 수학적 사고를 결합하여 금융의 미래를 프로그래밍하는 인재입니다.",
    sectors: ["핀테크", "자산운용 퀀트", "크립토/블록체인"],
    sectorLinks: ["/industries/vc-fintech", "/industries/savings-asset", "/industries/securities"],
    jobs: [
      { title: "퀀트개발", desc: "투자 전략 알고리즘을 설계하고 시스템으로 구현합니다" },
      { title: "알고리즘트레이딩", desc: "자동화된 매매 시스템을 개발하고 운영합니다" },
      { title: "블록체인개발", desc: "DeFi, 스마트컨트랙트 등 블록체인 금융을 개발합니다" },
    ],
    certs: ["CQF", "FRM", "CS/금융공학 석사"],
    companies: ["두나무", "토스증권", "쿼터백자산운용", "헤지펀드"],
  },
  DQEC: {
    code: "DQEC",
    name: "네트워크의 전략가",
    description:
      "당신은 정량적 역량과 대인관계 능력, 그리고 창의적 사고를 모두 갖춘 다재다능한 유형입니다. 도전적 환경에서 다양한 이해관계자와 소통하며 복잡한 딜을 성사시키는 역할에 적합합니다. VC/PE와 자본시장 분야에서 전략적 네트워킹과 분석을 결합한 독보적 역할을 수행할 수 있습니다.",
    sectors: ["VC/PEF", "증권 IB", "벤처캐피탈"],
    sectorLinks: ["/industries/vc-fintech", "/industries/securities", "/industries/savings-asset"],
    jobs: [
      { title: "심사역(PE)", desc: "투자 대상 기업의 가치를 평가하고 딜을 구조화합니다" },
      { title: "ECM/DCM", desc: "주식/채권 발행을 통한 자본 조달을 주관합니다" },
      { title: "벤처투자심사", desc: "스타트업의 기술·시장성을 분석하고 투자를 결정합니다" },
    ],
    certs: ["CFA", "CPA", "CAIA"],
    companies: ["한국벤처투자", "KKR 서울", "MBK파트너스", "NH투자증권 IB"],
  },
};
