# 디자인·구조 벤치마크 (v2.0)

> CUFA wiki v2가 지향하는 레퍼런스. 실제 스크래핑 근거는 `research/benchmarks/*.json`.

## 1. 핵심 비유

> **"백준의 구조 + Damodaran의 깊이 + Investopedia의 친절함 + Stripe Docs의 UX + Bloomberg의 Live 데이터"**

하나의 극단이 아닌 5개 모델의 **교집합**.

---

## 2. 구조·난이도 모델 — 백준 (acmicpc.net)

- 60단계 **점진 누적** 학습 (실측 `research/benchmarks/baekjoon_step.json`)
  - 1 입출력·사칙연산 → 2 조건문 → 3 반복문 → 4 1D배열 → 5 문자열 → … → 60+
- 각 단계에 한 줄 설명 + 난이도 아이콘(Bronze~Diamond)
- 진도 트래킹(풀이 수/맞은 사람 수) 노출 → **사회적 증거**
- 검색·태그 기반 문제 탐색

**CUFA 적용**
- Learn 섹션 = 단계 1-N (L1→L4→자산별→상품→구조→역사→규제)
- 각 문서 = "학습 유닛"
- 뱃지 5단계: 🥉Bronze 🥈Silver 🥇Gold 💎Platinum 🏅Diamond
- 진도 트래커(Phase 4 Supabase): "이 문서 완료 N명 · 평균 소요 X분"

## 3. 초보자 친화 모델 — Investopedia

실측 구조(`research/benchmarks/investopedia_dcf.json`):
- H1 용어명 → 한 줄 정의 → **Key Takeaways** 콜아웃 → Fast Fact → Important → H2 공식 → H2 예시 → H2 한계/대안 → References

**CUFA 적용**
- `<WhatYouWillLearn>` = Key Takeaways 역할
- `<FastFact>` `<Important>` `<Warning>` `<Tip>` 콜아웃 컴포넌트
- 용어 페이지는 Investopedia 구조 그대로 차용 (`learn/glossary/*.mdx`)

## 4. 박사급 심화 모델 — Damodaran / Howard Marks / Ray Dalio

| 레퍼런스 | 스타일 | CUFA 적용 |
|---|---|---|
| Aswath Damodaran (NYU Stern) | 개념→데이터→한계→자기비판 | `Deep Dive` 섹션 톤 |
| Howard Marks (Oaktree) memos | 에세이형 논증, 비관·낙관 균형 | 투자철학·매크로 페이지 |
| Ray Dalio *Principles* | 매크로 프레임워크 시각화 | `macro/` 세션 |
| Matt Levine *Money Stuff* (Bloomberg) | 뉴스 분석 + 재치 | 일일 리서치 요약 (장기) |

## 5. UX 레퍼런스

| 레퍼런스 | 강점 | CUFA 적용 |
|---|---|---|
| Stripe Docs (`stripe.com/docs`) | 좌 TOC / 본문 / 우 TOC 3분할, 인라인 API 예제 | 문서 페이지 레이아웃 표준 |
| Linear (`linear.app/changelog`) | 미니멀 타이포, 정돈된 아이콘 | 헤더·네비 스타일 |
| Notion (`notion.so` pages) | 펼치기/접기 블록 | `<FormulaWithProof>`, Deep Dive 토글 |
| Arc Browser landing | 브랜딩·마이크로인터랙션 절제 | 히어로 절제 |
| Vercel Docs | Next.js 공식, ISR 모범 | 기술 구현 모범 |
| GitHub Docs | 다국어·버전 스위처 | 한/영 스위처(옵션) |

## 6. 실데이터·터미널 — Bloomberg / OpenBB

- Bloomberg Terminal — 다크 테마 + 실시간 시세 대시보드
- **OpenBB Terminal** (`openbb.co`) 오픈소스 — 패널·차트 조합 (인터랙티브 대시보드 모범)
- TradingView Lightweight Charts — 주가/차트 표준

**CUFA 적용**
- `/tools` Live Dashboard = 패널 그리드 레이아웃 (거시/섹터/종목/공시)
- 기업 페이지 Live 위젯 = DART 공시 + Lightweight Charts + 재무 YoY

## 7. 한국 금융 레퍼런스

| 레퍼런스 | 강점 | CUFA 적용 |
|---|---|---|
| NH투자증권 리서치 센터 | 국내 리서치 보고서 형식 표준 | Research 페이지 톤 |
| 삼성증권 "오늘의 투자" | 차트·섹터 시각화 | 대시보드 참고 |
| 미래에셋 인덱스 | ETF 교육 | ETF 섹션 |
| KRX 공식 교육 | 시장구조·공시 | Market Structure 섹션 |
| BOK 알기 쉬운 경제지표 | 대중 교육 | Macro 섹션 초보자 버전 |
| FSC/FSS 금융용어사전 | 공식 용어 | Glossary Tier 1 출처 |

## 8. 가치투자·리서치 커뮤니티

| 레퍼런스 | 강점 | CUFA 적용 |
|---|---|---|
| Value Investing Club (`valueinvestorsclub.com`) | Analyst 간 아이디어 피드백 | Research 섹션 기여 모델 |
| Seeking Alpha | 리서치 플랫폼 템플릿 | Equity Report 템플릿 |
| Farnam Street (`fs.blog`) | 멘탈 모델·심리 | Behavioral Finance |
| Collaborative Fund (Morgan Housel) | 행동재무 에세이 | Behavioral 톤 |

## 9. 문체 레퍼런스 (절대)

> 2026-04-22 찬희 지정 — "유튜브 종교학 강의 자막 스타일" (유대교/기독교/이슬람/불교 비교 강의).
> 사례: "본시 메타노이아라는 용어는 신약 시대 이전, 그러니까 고대 헬라스 문명권에서는…"
>
> **특징**:
> 1. 구어체 질문→답→근거 서사
> 2. 원어(히브리어/헬라어/산스크리트) 직접 인용
> 3. 경전 장·절 구체 번호 (창세기 31장 13절)
> 4. A vs B 비교 대조 (유대교↔기독교)
> 5. 독자를 "여러분"으로 호명
> 6. 비판적 시각 + 자기비판 균형

**CUFA 적용**: 모든 Learn/Research 문서 톤. 상세는 [CONTENT-STYLE-GUIDE.md](./CONTENT-STYLE-GUIDE.md).

---

## 10. 우선순위 매트릭스

| Phase | 차용할 레퍼런스 | 구체 반영 |
|---|---|---|
| P0 Scaffolding (완료) | Stripe Docs 레이아웃 | 디자인 토큰 + 3분할 |
| P1 IA + 콘텐츠 | 백준 구조, Investopedia 용어 | Learn 트리 + Glossary |
| P2 Live | Bloomberg, OpenBB | 기업 페이지 Live 위젯 + MCP 대시보드 |
| P3 디자인 | Linear, Arc | 마이크로인터랙션 절제 |
| P4 학습루프 | 백준 진도 + Duolingo 게이미피케이션 | 뱃지 + 스트릭 |
| P5 리서치 | Damodaran + Howard Marks + VIC | CUFA Equity Report 페이지 |
| P6 커뮤니티 | GitHub Discussions + Giscus | 기여 흐름 |

---

*모든 벤치마크는 "배우되 복제 X". 각 요소를 CUFA만의 `현장 리서치 + AI 구조화` 정체성에 맞게 변형.*
