# 출처 정책 (v2.0)

> 모든 사실·수치·정의는 아래 **Tier 1~4 도메인**에서만 인용. Tier 5는 "참고" 전용. 그 외 **금지**.
> Evaluator CI가 모든 `<SourceCitation>` URL을 화이트리스트 대조한다.

## Tier 1 — 중앙은행·공식 지표 (최우선)

| 분류 | 도메인 | 용도 |
|---|---|---|
| 한국은행 통계 | `ecos.bok.or.kr`, `bok.or.kr` | 기준금리·환율·CPI·GDP·통화량 |
| Federal Reserve | `federalreserve.gov`, `fred.stlouisfed.org` | 미 거시·금리·FOMC |
| ECB | `ecb.europa.eu` | 유로존 |
| BOJ | `boj.or.jp` | 일본 |
| BOE | `bankofengland.co.uk` | 영국 |
| BIS | `bis.org`, `stats.bis.org` | 국제결제은행 통계·리포트 |
| IMF | `imf.org`, `data.imf.org` | 국가별 거시 |
| OECD | `oecd.org`, `stats.oecd.org`, `data-explorer.oecd.org` | 회원국 통계 |
| World Bank | `worldbank.org`, `data.worldbank.org` | 개발·신흥시장 |

## Tier 2 — 한국 공공·규제·학술

| 분류 | 도메인 | 용도 |
|---|---|---|
| 통계청 | `kostat.go.kr`, `kosis.kr` | 인구·고용·주택·물가 |
| 금융감독원 | `fss.or.kr`, `fss.or.kr/fss/main/main.do`, `dart.fss.or.kr` | 감독·공시·DART |
| 금융위원회 | `fsc.go.kr` | 금융정책 |
| 한국거래소 | `krx.co.kr`, `data.krx.co.kr`, `open.krx.co.kr` | 시장 데이터·상장사 |
| KDI | `kdi.re.kr`, `kdi.re.kr/research` | 경제정책 연구 |
| 한국금융연구원 | `kif.re.kr` | 금융 연구 |
| 대외경제정책연구원 | `kiep.go.kr` | 국제경제 |
| 산업연구원 | `kiet.re.kr` | 산업 |
| 정보통신정책연구원 | `kisdi.re.kr` | ICT |
| 조세재정연구원 | `kipf.re.kr` | 재정 |
| 국민연금연구원 | `nps.or.kr/research` | 연금 |
| 보험연구원 | `kiri.or.kr` | 보험 |

## Tier 3 — 학술 논문·표준

| 분류 | 도메인 | 용도 |
|---|---|---|
| SSRN | `ssrn.com`, `papers.ssrn.com` | 금융 워킹페이퍼 |
| NBER | `nber.org` | 거시·재무 워킹페이퍼 |
| DOI | `doi.org`, `dx.doi.org` | 저널 영구식별자 |
| JSTOR | `jstor.org` | 고전 논문 아카이브 |
| Scholar | `scholar.google.com` | 인용 추적 |
| arXiv | `arxiv.org`, `arxiv.org/abs/q-fin` | 퀀트파이낸스 프리프린트 |
| IFRS | `ifrs.org` | 국제회계기준 |
| IAIS | `iaisweb.org` | 보험 감독 표준 |

## Tier 4 — 전문기관·표준교재

| 분류 | 도메인 | 용도 |
|---|---|---|
| CFA Institute | `cfainstitute.org` | CFA 커리큘럼 |
| GARP (FRM) | `garp.org` | FRM |
| CAIA | `caia.org` | 대체투자 |
| AICPA | `aicpa.org` | 미국 회계 |
| 한국회계기준원 | `kasb.or.kr` | K-IFRS |
| 한국공인회계사회 | `kicpa.or.kr` | KICPA |
| 금투협 | `kofia.or.kr` | 투자자격증 |

## Tier 5 — 산업 리서치 (참고용, 단독 인용 금지)

| 도메인 | 분류 | 제약 |
|---|---|---|
| `pages.stern.nyu.edu/~adamodar`, `damodaran.com` | Damodaran (밸류에이션) | Tier 1-3로 교차확인 권장 |
| `oaktreecapital.com` | Howard Marks memos | 관점 인용만 |
| `bridgewater.com` | Bridgewater daily observations | 관점 인용만 |
| `gmo.com`, `blackrock.com` | 운용사 리서치 | 관점 인용만 |
| `ark-invest.com` | Ark big ideas | 관점 인용만 |

## 금지 리스트

**인용 금지** — 수집용 reference로도 원칙적 X.
- 위키백과 한국어판/나무위키 (영문판 중 `en.wikipedia.org` 도 1차 출처 X, cross-check로만)
- 네이버/다음 블로그, 카페, 티스토리 개인 블로그 (`blog.naver.com`, `cafe.daum.net`, `tistory.com`)
- 개인 투자 유튜브 채널 (공식 기관 채널만 예외)
- SNS 게시물 (X/Threads/Instagram/YouTube shorts)
- ChatGPT/Claude/Gemini 등 **AI 응답**
- 비공식 요약 사이트 (investopedia 제외 — Tier 5에 해당)

## SourceCitation 컴포넌트 사용 규칙

```mdx
<SourceCitation
  type="paper"                         // paper | central-bank | gov | textbook | dataset | law | standard
  label="Fama & French (1992)"
  title="The Cross-Section of Expected Stock Returns"
  url="https://doi.org/10.1111/j.1540-6261.1992.tb04398.x"
  accessed="2026-04-22"
/>
```

- `type` 필수. Tier 0 (law, central-bank)이 Tier 3 (paper)보다 우선.
- 접근일(`accessed`)은 시계열·공시 데이터에 필수 (데이터가 갱신되기 때문).
- `type="law"`는 법 조항 번호 직접 표기: "자본시장과 금융투자업에 관한 법률 제9조 제21항".

## Evaluator 강제 규칙

- `draft: false` 문서는 `<SourceCitation>` **최소 2개** 필요.
- 모든 `url`이 **화이트리스트 도메인** 일치 필수. 불일치 시 실패.
- 금지 도메인 단 1개라도 매치 시 **CRITICAL** 실패.
- `accessed` 없이 `type="dataset"` 또는 `"central-bank"`는 HIGH 실패.

## 데이터 접근 자동화 (Nexus MCP 연동)

아래 MCP 도구는 Tier 1-2 도메인에 **직접 연결**된다. `<MCPQuery>` 컴포넌트는 이 도구만 화이트리스트 허용.

| MCP tool | 출처 | Tier |
|---|---|---|
| `ecos_interest_rate` / `ecos_exchange_rate` / `ecos_cpi` / `ecos_gdp` / `ecos_bond_yield` | BOK ECOS | 1 |
| `dart_latest_disclosures` / `dart_financial_statement` / `dart_company_basic` / `dart_insider_trading` | DART | 2 |
| `krx_stock_price_chart` / `krx_sector_heatmap` / `krx_market_summary` | KRX | 2 |
| `kosis_employment` | KOSIS | 2 |
| `fred_us_10y` / `fred_vix` | FRED | 1 |

---

*이 정책은 `quality-check.ts` Evaluator가 자동 검증한다. 위반 PR은 병합되지 않는다.*
