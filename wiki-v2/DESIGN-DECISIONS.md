# CUFA Journal — Design Decisions (v2 Aesthetic Spec)

> **승인 버전**: 2026-04-22
> **개념**: "CUFA Journal" — 조선 목판 × 학술 저널 × Tufte 마진노트
> **반대 개념**: AI slop (Inter+퍼플그라데+마케팅 히어로)

---

## 0. Why This Direction?

**찬희 요구 다섯 축 교집합**:
1. 박사급 전문성 ← 학술 저널 조판
2. 초보자·비전공자 친화 ← Tufte 마진노트 (본문/주석 분리)
3. 실용주의·객관성·지엽 삭제 ← 백준형 기능 우선
4. 검증된 출처·논문·중앙은행 인용 ← 각주·참고문헌 표준
5. AI 문체 금지 + 서사 강의체 ← 학술 저널 내러티브

**하나의 답** = "학술지처럼 조판하되, 마진 주석으로 초보자 배려, 한 발자국도 AI slop 없이."

---

## 1. Typography

| 역할 | 서체 | 대체 | 근거 |
|---|---|---|---|
| 한글 본문 | **Noto Serif KR** | 본명조 | 학술지 세리프 전통. 국립국어원 공식 한국어 세리프 |
| 한글 디스플레이 | **Noto Sans KR 900** | 본고딕 Heavy | 제목 밀도. 세리프/산스 대비 학술 표지 |
| 영문 본문 | **EB Garamond** | Garamond Premier | Damodaran NYU 페이지 사용. 학술 정격 |
| 영문 디스플레이 | **Noto Sans KR 900** (범용) | — | 한글/영문 혼재 일관성 |
| 숫자·시세·코드 | **IBM Plex Mono** | JetBrains Mono | Bloomberg/Plex 학술 표준. 한글 병기 가독 |
| 원어 병기 (漢·한자) | **Noto Serif CJK TC** | — | 전통 한자 서체 |

**추방 목록**: Inter, Roboto, Arial, Space Grotesk, Helvetica, SF Pro, system-ui. 이유: AI 기본값·개성 없음.

**조판 규칙**:
- 본문 행간 1.75, 자간 -0.005em
- 제목 행간 1.15, 자간 -0.02em
- 본문 `text-align: justify` + 하이픈 자동
- 첫 단락 드롭캡 (2줄 높이, 세리프)
- 각주 `<sup>¹²³</sup>` upper alpha 학술 표기
- 섹션 번호 로만 **Ⅰ. Ⅱ. Ⅲ.** (한국어 보고서 관습 + 학술)
- Ornament 구분자 `❦` `⁂` `◈`

---

## 2. Color Palette

### Light ("Paper" 지면)
| 토큰 | Hex | 용도 |
|---|---|---|
| `--paper` | `#F7F3EC` | 배경 (아이보리 갱지) |
| `--paper-soft` | `#EFEAE0` | 카드·뮤트 |
| `--ink` | `#111111` | 본문 (잉크 블랙) |
| `--ink-soft` | `#3A3A38` | 부제·설명 |
| `--ink-muted` | `#6B665E` | 각주·메타 |
| `--rule` | `#D5CFC3` | 얇은 규정선 |
| `--vermilion` | `#C8372D` | **유일 액센트** — 교정 인장·도장 색 |
| `--vermilion-ink` | `#8A1F18` | 어두운 인장 (hover) |

### Dark ("Ink" 잉크)
| 토큰 | Hex | 용도 |
|---|---|---|
| `--paper` | `#0D1015` | 배경 (짙은 잉크) |
| `--paper-soft` | `#161B22` | 카드 |
| `--ink` | `#E8E4DA` | 본문 (아이보리 역전) |
| `--ink-soft` | `#B8B4AA` | 부제 |
| `--ink-muted` | `#7D7870` | 각주 |
| `--rule` | `#2A2F38` | 규정선 |
| `--vermilion` | `#E85D4E` | 액센트 (밝아짐) |

**추방**: 퍼플(#7C3AED), 네온 그라데, rainbow, 16색 팔레트. 이유: AI 기본값.

---

## 3. Layout

### Grid — 3단 저널
```
Desktop ≥ 1024px
┌─────────┬──────────────────────┬─────────────┐
│ Sidebar │ Main (prose, 62ch)   │ Margin      │
│ (TOC)   │                      │ (notes,     │
│ 14rem   │                      │  주석·원어) │
│         │                      │ 14rem       │
└─────────┴──────────────────────┴─────────────┘
```
- **본문 최대 폭 62ch** (≈580px) — 세리프 가독 golden ratio
- **마진 노트** (right sidebar) — Tufte Edward Tufte 스타일, `position: absolute; offset: body`
- **섹션 구분** = hairline rule (1px `--rule`)

### Mobile → 단단 + 마진노트 = `<aside>` 인라인 details/summary
```
┌─────────────┐
│ Main        │
│             │
│ (각 마진    │
│  노트는     │
│  우측 배지  │
│  → 탭하면   │
│  펼침)      │
└─────────────┘
```

### Running Head (학술지 러닝 헤드)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUFA JOURNAL  ·  Vol. Ⅱ · No. 4 · 2026 · ISSN 0000-0000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 4. Motion

**원칙**: 모션은 텍스트를 돕는다. 페이지 전체에 1–2 개만. 잔재 X.

- **페이지 로드 stagger** — 제목·부제·메타 0.05s 간격 fade+rise
- **스크롤 진행** — 상단 1px 얇은 vermilion 선 (두께 증가 X)
- **마진노트 hover** — `text-decoration: underline wavy var(--vermilion)` 본문 쪽 앵커 표시
- **각주 hover** — sup 번호 → 하단 툴팁 (학술지 관습)

**추방**: live-pulse 애니메이션, bouncing, parallax, 그라데이션 애니, spring scale. 이유: AI slop.

---

## 5. Special Components

### `<MarginNote>` — Tufte 스타일 우측 주석
**용도**: 원어 표기, 출처 각주, 한국 맥락, 초보자 보충, 수식 유도 펼치기.
**UX**: 데스크톱 = 우측 `.margin-note` 자동 배치. 모바일 = 인라인 `<details>` 펼침.

### `<DropCap>` — 드롭캡
섹션/챕터 첫 문단 자동 적용. 2줄 높이. Noto Serif KR.

### `<Footnote id="n">` / `<FootnoteRef id="n" />`
MDX 컴포넌트로 각주 시스템. sup 번호 + 페이지 하단 자동 집계.

### `<SourceCitation>`
APA/MLA 스타일 학술 인용 블록. 도메인 화이트리스트 검증 (Evaluator).

### `<KoreaContext>` — "한국에서는" 박스
- 배경 = `--paper-soft`
- 좌측 2px vermilion bar
- 라벨 = `Ⅰ 한국에서는` 스몰캡

### `<Related>`
문서 하단 교차 링크. "함께 읽으면 좋은 글" 학술지 관습.

### `<FormulaWithProof>`
KaTeX 수식 + `<details>` 유도 펼침. 초보자 Skip / 고급자 Expand.

### `<Term>` (용어 인라인 툴팁)
본문 특수 용어 = 밑줄 점선. hover 시 정의 팝오버.

---

## 6. Content Conventions (Documents)

모든 MDX 문서 공통:
```mdx
---
title: "DCF 밸류에이션 — 현재가치 할인의 원리"
difficulty: "intermediate"   # beginner | intermediate | advanced
readingMinutes: 12
tags: [밸류에이션, 주식]
certifications: [투자자산운용사, CFA L2]
sources:
  - {label: "Damodaran, Investment Valuation 3rd ed.", url: "..."}
  - {label: "FSS DART 공시 가이드", url: "..."}
koreaContext: true
---

<WhatYouWillLearn>
- WACC 계산 원리
- FCFF vs FCFE 구분
- 터미널 성장률 선택 기준
</WhatYouWillLearn>

## Ⅰ. 왜 현재가치로 할인하는가

<DropCap>화</DropCap>폐에는 시간 가치가 있다. 오늘의 1,000원과 1년 뒤의 1,000원은 같지 않다<FootnoteRef id="1" />. <MarginNote>Fisher, I. (1930). *The Theory of Interest*. 이 책이 현대 DCF의 철학적 뿌리다.</MarginNote> ...

## Ⅱ. 핵심 수식

<FormulaWithProof>
$$PV = \sum_{t=1}^{n} \frac{CF_t}{(1+r)^t}$$
<details>유도: 기하급수 합 공식 ...</details>
</FormulaWithProof>

<KoreaContext>
한국은행이 발표하는 국고채 3년 수익률을 risk-free rate로 관행적으로 사용한다. FRED는 2Y T-note를 쓰는데, 이 차이는 ...
</KoreaContext>

<Related>
- [WACC 계산기](/tools/wacc)
- [한국콜마 DCF 실전 적용](/research/equity/kolmar-korea)
- [터미널 성장률 이론](/learn/valuation/terminal-growth)
</Related>

<Footnotes>
  <Footnote id="1">시간 선호(time preference) 개념은 Böhm-Bawerk 1889가 체계화했다.</Footnote>
</Footnotes>
```

---

## 7. AI Slop 금지 Rules

구현·콘텐츠 양쪽에서 **절대 금지**:
- ❌ Inter/Roboto/Arial/Space Grotesk/Helvetica
- ❌ 퍼플 그라데 (#7C3AED on white)
- ❌ 3 페르소나 큰 카드 히어로 (마케팅 SaaS 템플릿)
- ❌ "Trusted by 10,000+ users" 식 소셜 프루프
- ❌ "100x faster / AI-powered / Next-gen" 카피
- ❌ bouncing icon · parallax · 무한 스크롤 그라데
- ❌ ChatGPT 불릿 나열 문체 ("Key Features / How to Use / Pro Tip")
- ❌ emoji 남발 (🚀 ✨ 💡 ⭐)
- ❌ Tailwind 기본 스택 (`text-gray-500` 등) 직접 사용

대신:
- ✅ 세리프 본문 + 로만 번호
- ✅ 단일 vermilion 액센트
- ✅ 마진노트 + 각주 + 드롭캡
- ✅ 학술 서사 문체 ("왜 그런가? 살펴보자. 본시 이것은..." 식)
- ✅ 출처 각주·참고문헌 학술지 표준
- ✅ 토큰 기반 색상 접근 (`var(--ink)`)

---

## 8. References (레퍼런스 사이트)

**문체·조판 벤치마크**:
1. **Aswath Damodaran — NYU Stern** (pages.stern.nyu.edu/~adamodar) — 학술 심도 문체 표준
2. **FRED — St. Louis Fed** (fred.stlouisfed.org) — 데이터 엄정 표시
3. **한국은행 경제통계시스템 (ECOS)** (ecos.bok.or.kr) — 공식 한국어 통계 표준
4. **한국금융연구원 (KIF)** (kif.re.kr) — 한국어 연구 보고서 문체
5. **National Bureau of Economic Research (NBER)** (nber.org) — 워킹페이퍼 학술 관습
6. **Tufte Books / Edward Tufte** (edwardtufte.com) — 마진노트·정보 디자인

**UX 기능 벤치마크**:
7. **백준 온라인 저지** (acmicpc.net) — 난이도 뱃지 + 진도 트래킹 + 기능 우선 UX
8. **Stripe Docs** (stripe.com/docs) — 3단 레이아웃 + 검색 + 타이포 정결성
9. **MDN Web Docs** (developer.mozilla.org) — 공공 레퍼런스 구조

**콘텐츠 깊이 벤치마크**:
10. **Howard Marks Memos** (oaktreecapital.com) — 투자 철학 에세이
11. **Matt Levine — Money Stuff** (Bloomberg) — 대중 이해 + 전문성 균형

**초보자 친화 벤치마크** (구조만 참고, 표절 X):
12. **Investopedia** — 용어 정의 포맷
13. **Corporate Finance Institute (CFI)** — 단계적 교육 순서
14. **Khan Academy Finance** — 수식 유도 단계 분해

---

## 9. 개발·빌드 반영 체크리스트

Phase 0 완료 후 즉시 반영 (Phase 1 착수 전):
- [ ] `app/globals.css` 전면 재작성 (Paper/Ink 토큰 + Noto Serif)
- [ ] `app/layout.tsx` Google Fonts 교체 (Pretendard → Noto Serif/Sans KR + EB Garamond + IBM Plex Mono)
- [ ] `components/layout/site-header.tsx` Running Head 스타일
- [ ] `components/layout/site-footer.tsx` Colophon 스타일
- [ ] `app/page.tsx` 학술 저널 표지 히어로 (페르소나 카드 제거 또는 대폭 축소)
- [ ] `components/learn/margin-note.tsx` 신규 — 데스크톱 우측 · 모바일 details
- [ ] `components/learn/drop-cap.tsx` 신규
- [ ] `components/learn/footnote.tsx` 신규
- [ ] `components/learn/source-citation.tsx` 신규 (도메인 화이트리스트 검증)
- [ ] `lib/nav.ts` 라벨 간소화 (마케팅 카피 제거)
- [ ] `scripts/quality-check.ts` AI slop 패턴 검출 추가 (금지 폰트/색 import 검사)
