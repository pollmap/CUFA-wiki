# v1 wiki/ Audit (Phase 0 간이)

> 감사 날짜: 2026-04-21
> 대상: `wiki/docs/` (Docusaurus 3.4 기반)
> 목적: v2 마이그레이션 분류 기초 자료. Phase 1 IA 재편에서 본격 재감사 예정.

## 총계
- 총 문서: **255** (Markdown/MDX)
- 컴포넌트: **19** (Calculator/Chat/CompanyComparison/CrossLink/EconomicCalendar/FinanceMBTI/FinanceTimeline/GiscusComments/GuidedDCF/HomepageHero/MarketDataWidget/MarketOverviewWidget/MarketSurvivor/PortfolioSimulator/ProgressTracker/Quiz/ReadingProgress/RealTimeDataDashboard/CandlestickChart)
- sidebars.js: 629 lines (22KB)
- docusaurus.config.js: 240 lines

## 카테고리별 문서 수

| 카테고리 | 수 | v2 이식 계획 |
|---|---|---|
| assets (bonds/crypto/derivatives/real-estate) | 50 | **이식 + 확장** (주식/ETF/원자재/FX/대체 신규) |
| industry-analysis | 34 | **이식** (Learn/산업분석 L3) |
| foundation | 23 | **이식** (Learn/L1) |
| calculators | 13 | **이식 + 20종 신규** (Tools) |
| valuation | 12 | **이식** (Learn/밸류에이션) |
| financial-analysis | 11 | **이식** (Learn/L2) |
| company-analysis | 11 | **이식** (Learn/L4) |
| risk-management | 11 | **이식 + Portfolio 축 확장** |
| technical | 11 | **이식** (Learn/기술 분석) |
| masters | 10 | **이식 + 5명 추가** (Soros/Druckenmiller/Ackman/Simons/Thorp) |
| companies | 9 | **이식** (Industries/기업 디렉토리 170+의 시드) |
| quiz | 8 | **이식 + 자격증 모의고사** |
| trading-strategies | 7 | **이식 + Stat Arb/Factor/Execution 확장** |
| macroeconomics | 6 | **이식 + 확장** (Monetary/Fiscal/Cycle/Inflation/FX/Imbalances) |
| career | 5 | **이식** (Career 축) |
| case-studies | 5 | **이식** (Research/케이스) |
| glossary | 5 | **이식** (용어사전) |
| quant-system | 5 | **이식** (Learn/Quant) |
| modeling-tools | 4 | **이식** (Tools) |
| actuarial | 3 | **이식** (Insurance/계리) |
| banking-industry | 1 | **이식 + 확장** (산업 가이드) |
| securities-industry | 1 | **이식 + 확장** |
| insurance-industry | 1 | **이식 + 확장** |
| asset-management-industry | 1 | **이식 + 확장** |
| card-capital-industry | 1 | **이식 + 확장** |
| crypto-industry | 1 | **이식 + 확장** |

## 빠진 섹션 (신규 필요)

- **Asset Classes 확장**: 주식(별도)/ETF/원자재/FX/대체
- **Products & Structures** (전체 신규): Funds/Structured(ELS/DLS)/Pensions/Insurance상품/Credit/RWA
- **Market Structure** (전체 신규): Exchanges/Clearing/Microstructure/MMs/Dark Pools/Price Discovery
- **Portfolio 심화**: Asset Allocation/MPT/BL/Risk Parity/Factor/Hedging 실전
- **Behavioral Finance**: Bias/Prospect/Anomalies/Self-Audit
- **Regulation**: 자본시장법/Basel III/Solvency II/IFRS 9·17/MiFID/AML
- **History & Crises**: 1929/1987/1997/2000/2008/2010/2020/2022
- **ESG**: K-Taxonomy/EU Taxonomy/Scoring/Green Bond/Transition
- **Research Front 축**: 5 CUFA Report + 254 현장 노트 Map + 경력 narrative

## 현재 기술 스택 (v1)

```json
Docusaurus 3.4 / React 18 / MDX 3 / TypeScript 5.4
@anthropic-ai/sdk 0.40
@docusaurus/preset-classic 3.4
@easyops-cn/docusaurus-search-local 0.44
@giscus/react 3.1
mathjs 12.4
recharts 2.12
rehype-katex 7 · remark-math 6
lucide-react 0.378
```

## v2 분류

- **이식**: 기존 MDX → Velite 스키마 적용 후 재활용 (255 중 ≥ 230 예상)
- **업데이트**: KoreaContext/Related/WhatYouWillLearn 블록 추가 필요 (전체 대상)
- **신규**: 플랜 §1.3 신규 섹션 전체 (Asset/Product/Structure/Portfolio/Behavioral/Regulation/History/ESG/Research front)

## 다음 액션 (Phase 1)
1. sidebars.js 완전 파싱 → IA 매핑 테이블 생성
2. 255 문서 각각 front matter 읽어서 slug 생성
3. 링크 재작성 규칙 확정 (`/docs/foundation/x` → `/learn/foundation/x`)
