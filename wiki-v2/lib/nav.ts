export type NavItem = {
  label: string;
  href: string;
  /** 모바일에서 간결 표기용 */
  short?: string;
  hint?: string;
};

// UX-first: 라벨 짧게, 기능 중심
export const primaryNav: NavItem[] = [
  { label: "학습", href: "/learn", hint: "4-Layer · 자산 · 상품 · 구조" },
  { label: "기업·산업", href: "/industries", hint: "5 산업 · 170 기업 · LIVE" },
  { label: "도구", href: "/tools", hint: "계산기 · 대시보드" },
  { label: "리서치", href: "/research", hint: "CUFA 5 · 현장 254" },
  { label: "커리어", href: "/career", hint: "직무 · 자격증 · 공모전" },
];

export const quickLinks = [
  { label: "DCF 계산기", href: "/tools/calculators/dcf", kbd: "g d" },
  { label: "최근 공시", href: "/industries", kbd: "g i" },
  { label: "학습 로드맵", href: "/learn/paths", kbd: "g p" },
] as const;

export const siteMeta = {
  title: "CUFA wiki",
  subtitle: "한국어 금융·투자 레퍼런스",
  publisher: "충북대학교 가치투자학회",
} as const;
