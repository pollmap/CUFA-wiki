CUFA

충북대학교 가치투자학회

신입교육 교안

E주차. 데이터 파이프라인

CUFA 3기

작성: 이찬희

목차

# CUFA 부록E. 데이터 파이프라인 실전 — NEXUS MCP · API · AI 코딩 에이전트

데이터 수집 방법은 3가지다. 상황에 맞게 선택한다.

CUFA 학회원이라면 NEXUS MCP부터 시작한다. 연결법과 활용법은 부록H를 참조. 이 부록에서는 NEXUS로 안 되는 작업을 위한 Python 직접 코딩과 AI 에이전트 활용법을 다룬다.

# 1. 데이터 소스 총정리

NEXUS MCP로 대부분 커버되지만, Yahoo Finance와 FRED는 직접 Python으로 접근해야 한다.

# 2. 환경 설정

```bash

pip install opendartreader pykrx yfinance fredapi requests pandas matplotlib openpyxl

```

API Key 발급:

DART: https://opendart.fss.or.kr → 인증키 신청 (즉시 발급)

FRED: https://fred.stlouisfed.org/docs/api/api_key.html

ECOS: https://ecos.bok.or.kr → Open API → 인증키 발급

```python

# config.py — API Key 관리 (Git에 올리지 않는다)

DART_API_KEY = "YOUR_DART_KEY"

FRED_API_KEY = "YOUR_FRED_KEY"

ECOS_API_KEY = "YOUR_ECOS_KEY"

```

# 3. pykrx — 주가·시총·밸류에이션

pykrx는 KRX(한국거래소) 데이터를 Python으로 직접 가져오는 라이브러리다.

```python

from pykrx import stock

import pandas as pd

# 종목 코드 조회

code = stock.get_market_ticker_name("192820")  # 코스맥스

# 일별 주가 (최근 1년)

df = stock.get_market_ohlcv("20240101", "20251231", "192820")

# 컬럼: 시가, 고가, 저가, 종가, 거래량, 거래대금, 등락률

# KOSPI 전 종목 시가총액

caps = stock.get_market_cap("20251231")

# KOSPI 전 종목 PER/PBR/배당수익률

fundamentals = stock.get_market_fundamental("20251231", market="KOSPI")

# 컬럼: BPS, PER, PBR, EPS, DIV, DPS

# 업종별 PER

sector_per = stock.get_market_fundamental("20251231", market="KOSPI")

```

실전 활용:

Peer 비교용 시총/PER/PBR 한번에 수집

12개월 주가 차트 데이터 (보고서 표지용)

KOSPI 대비 상대 수익률 계산

# 4. Yahoo Finance — 글로벌 데이터

```python

import yfinance as yf

# 한국 종목 (코드 뒤에 .KS 또는 .KQ)

cosmax = yf.Ticker("192820.KS")

hist = cosmax.history(period="2y")

# 환율

usdkrw = yf.download("USDKRW=X", period="1y")

# 원자재

oil = yf.download("CL=F", period="5y")     # WTI 원유

gold = yf.download("GC=F", period="5y")    # 금

# 글로벌 지수

sp500 = yf.download("^GSPC", period="5y")  # S&P 500

nikkei = yf.download("^N225", period="5y") # Nikkei 225

```

실전 활용:

글로벌 Peer 주가 비교 (코스맥스 vs Intercos)

원자재 가격 추이 (화학/정유 분석)

환율과 수출기업 실적의 상관관계

# 5. FRED — 미국 매크로 데이터

```python

from fredapi import Fred

fred = Fred(api_key="YOUR_FRED_KEY")

# 미국 기준금리

fed_rate = fred.get_series("FEDFUNDS", start="2020-01-01")

# 미국 CPI

cpi = fred.get_series("CPIAUCSL", start="2020-01-01")

# 미국 10년 국채 금리

us10y = fred.get_series("DGS10", start="2020-01-01")

# 미국 실업률

unemployment = fred.get_series("UNRATE", start="2020-01-01")

# DRAM 가격 (반도체 분석용)

# FRED에는 없으므로 DRAMeXchange 또는 TrendForce 수동 입력

```

# 6. ECOS — 한국은행 경제통계

```python

import requests

import pandas as pd

ECOS_KEY = "YOUR_ECOS_KEY"

BASE_URL = "https://ecos.bok.or.kr/api"

def get_ecos(stat_code, item_code, start="202001", end="202512", cycle="M"):

url = f"{BASE_URL}/StatisticSearch/{ECOS_KEY}/json/kr/1/100/{stat_code}/{cycle}/{start}/{end}/{item_code}"

resp = requests.get(url)

data = resp.json()

rows = data.get("StatisticSearch", {}).get("row", [])

df = pd.DataFrame(rows)

return df

# 한국 기준금리

base_rate = get_ecos("722Y001", "0101000")

# 소비자물가지수(CPI)

cpi_kr = get_ecos("901Y009", "0")

# 원/달러 환율

usdkrw = get_ecos("731Y001", "0000001")

# 수출입 동향

exports = get_ecos("403Y001", "1")

```

주요 통계코드:

# 7. 통합 파이프라인 — 기업분석 원스톱

아래 함수 하나를 실행하면 3~6주차 과제에 필요한 데이터가 전부 생성된다.

```python

import opendartreader as dart

from pykrx import stock

import yfinance as yf

import pandas as pd

import matplotlib.pyplot as plt

import platform

# 한글 폰트

if platform.system() == 'Darwin':

plt.rcParams['font.family'] = 'AppleGothic'

elif platform.system() == 'Windows':

plt.rcParams['font.family'] = 'Malgun Gothic'

else:

plt.rcParams['font.family'] = 'NanumGothic'

plt.rcParams['axes.unicode_minus'] = False

def analyze_company(corp_name, stock_code, dart_key, years=5):

"""기업분석 통합 파이프라인"""

api = dart.OpenDartReader(dart_key)

results = {}

# 1) 재무제표 수집 (DART)

print(f"[1/5] {corp_name} 재무제표 수집...")

fs_list = []

for year in range(2025-years+1, 2026):

try:

fs = api.finstate(corp_name, year, reprt_code="11011")

if fs is not None and len(fs) > 0:

fs['year'] = year

fs_list.append(fs)

except:

pass

if fs_list:

results['financials'] = pd.concat(fs_list)

# 2) 주가 데이터 (pykrx)

print(f"[2/5] 주가 데이터 수집...")

price = stock.get_market_ohlcv("20230101", "20251231", stock_code)

results['price'] = price

# 3) PER/PBR/배당 (pykrx)

print(f"[3/5] 밸류에이션 지표...")

fund = stock.get_market_fundamental("20251231", "20251231", stock_code)

results['fundamental'] = fund

# 4) KOSPI 대비 상대수익률

print(f"[4/5] KOSPI 대비 상대수익률...")

kospi = stock.get_index_ohlcv("20230101", "20251231", "1001")

# 5) 차트 생성

print(f"[5/5] 차트 생성...")

fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# 주가 차트

axes[0,0].plot(price.index, price['종가'], color='#7C6AF7', linewidth=1.5)

axes[0,0].set_title(f'{corp_name} 주가 추이', fontweight='bold')

axes[0,0].set_ylabel('원')

# 거래량

axes[0,1].bar(price.index, price['거래량'], color='#7C6AF7', alpha=0.5, width=1)

axes[0,1].set_title('거래량', fontweight='bold')

# KOSPI 대비 상대수익률

if len(kospi) > 0 and len(price) > 0:

common_idx = price.index.intersection(kospi.index)

if len(common_idx) > 100:

rel = (price.loc[common_idx, '종가'] / price.loc[common_idx[0], '종가']) / \

(kospi.loc[common_idx, '종가'] / kospi.loc[common_idx[0], '종가']) * 100

axes[1,0].plot(common_idx, rel, color='#5B4CC4', linewidth=1.5)

axes[1,0].axhline(y=100, color='gray', linestyle='--', alpha=0.5)

axes[1,0].set_title('KOSPI 대비 상대수익률', fontweight='bold')

plt.tight_layout()

chart_path = f'{corp_name}_분석차트.png'

plt.savefig(chart_path, dpi=150, bbox_inches='tight')

results['chart'] = chart_path

print(f"✓ 완료. 차트: {chart_path}")

return results

# 사용 예시

# results = analyze_company("코스맥스", "192820", "YOUR_DART_KEY")

```

# 8. AI 코딩 에이전트 활용 — Claude Code, ChatGPT, Codex CLI

위 Python 파이프라인을 직접 코딩하지 않고, AI 에이전트에게 자연어로 시키는 방법이다. 어떤 AI를 쓰든 핵심 워크플로우는 같다.

## 8-1. 도구 비교

실전 추천: "데이터 수집(pykrx, DART API)" → Claude Code 또는 Codex CLI (로컬 실행 필요). "업로드한 엑셀/CSV 분석" → ChatGPT Code Interpreter (가장 간편). "보고서 차트 대량 생성" → Claude Code 또는 Codex CLI (파일 I/O 자유).

## 8-2. Claude Code 활용

```bash

# 설치

npm install -g @anthropic-ai/claude-code

# 실행

claude

```

사용 시나리오:

```

사용자: "코스맥스의 최근 5년 재무제표를 DART에서 가져와서 매출/영업이익/순이익 추이를 차트로 그려줘"

Claude Code:

1) OpenDartReader로 2021~2025 재무제표 수집

2) 매출/OP/NI 추출 → DataFrame

3) matplotlib 차트 생성 → PNG 저장

```

```

사용자: "코스맥스와 한국콜마의 OPM 비교 차트를 그려줘"

Claude Code:

1) 두 기업 재무제표 수집

2) OPM 계산 (영업이익/매출)

3) 비교 차트 생성

```

MCP(Model Context Protocol) 서버 활용: DART, FRED, ECOS의 API를 MCP 서버로 감싸면, Claude가 직접 데이터를 조회하고 분석할 수 있다.

## 8-3. ChatGPT Code Interpreter 활용

ChatGPT Plus/Team 사용자라면 가장 쉬운 방법이다. 파일을 업로드하고 자연어로 분석을 요청한다.

워크플로우:

1단계. CompanyGuide에서 관심 기업의 재무데이터를 엑셀로 다운로드한다.

2단계. ChatGPT에 엑셀을 업로드하고 지시한다.

```

"이 엑셀의 매출/영업이익/순이익 5개년 추이를 차트로 그려줘.

GPM, OPM, NPM도 계산해서 수익성 추이 차트도 만들어줘.

한글 폰트로 깔끔하게."

```

3단계. 생성된 차트를 보고서에 삽입한다.

주의: ChatGPT Code Interpreter는 외부 API를 호출할 수 없다. pykrx나 DART API는 사용 불가. 데이터를 먼저 엑셀/CSV로 준비해서 업로드해야 한다.

활용 시나리오:

```

"이 CSV에서 피어 기업 5개의 PER, PBR, OPM을 비교하는 차트를 그려줘"

→ Peer 비교 시각화 즉시 생성

"이 3-Statement 모델 엑셀에서 민감도 분석 테이블을 만들어줘.

매출 성장률 -5%~+15%, GPM 25%~35% 조합으로."

→ 민감도 테이블 + 히트맵 생성

"이 재무데이터로 듀폰 분해를 해줘.

NPM × 총자산회전율 × 재무레버리지로."

→ 듀폰 분해 차트 생성

```

## 8-4. Codex CLI (OpenAI) 활용

OpenAI의 터미널 에이전트. Claude Code와 유사하게 로컬에서 실행되며, 파일 읽기/쓰기 + API 호출이 가능하다.

```bash

# 설치

npm install -g @openai/codex

# 실행

codex

```

사용 시나리오:

```

사용자: "pykrx로 코스맥스 1년 주가 데이터를 가져와서 KOSPI 대비 상대수익률 차트를 그려줘"

Codex CLI:

1) pykrx로 주가 + KOSPI 데이터 수집

2) 상대수익률 계산

3) matplotlib 차트 → PNG 저장

```

Claude Code와 Codex CLI의 선택 기준: 둘 다 유사한 역할을 하므로, 자신이 익숙한 쪽을 쓰면 된다. 두 도구 모두 빠르게 진화하고 있어서, 시점에 따라 강점이 바뀔 수 있다.

## 8-5. 실전 조합 — 어떤 도구를 언제 쓰는가

핵심: 도구는 수단이다. 어떤 AI를 쓰든 "무엇을 요청해야 하는지"를 아는 것이 진짜 역량이다. 이 교안의 2~6주차에서 배운 분석 프레임워크가 곧 AI에게 줄 지시의 뼈대다.

# 9. 주간 자동 모니터링 스크립트

```python

def weekly_monitor(stock_code, corp_name):

"""매주 월요일 실행. 관심 기업의 주간 데이터 수집."""

from datetime import datetime, timedelta

today = datetime.now().strftime("%Y%m%d")

week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y%m%d")

# 주간 주가

price = stock.get_market_ohlcv(week_ago, today, stock_code)

weekly_return = (price['종가'].iloc[-1] / price['종가'].iloc[0] - 1) * 100

# 외국인 순매수

foreign = stock.get_market_trading_value_by_date(week_ago, today, stock_code)

# KOSPI 주간 수익률

kospi = stock.get_index_ohlcv(week_ago, today, "1001")

kospi_return = (kospi['종가'].iloc[-1] / kospi['종가'].iloc[0] - 1) * 100

print(f"=== {corp_name} 주간 모니터링 ===")

print(f"주간 수익률: {weekly_return:+.1f}% (KOSPI: {kospi_return:+.1f}%)")

print(f"상대수익률: {weekly_return - kospi_return:+.1f}%p")

print(f"현재 종가: {price['종가'].iloc[-1]:,}원")

# weekly_monitor("192820", "코스맥스")

```

# 10. 데이터 시차 주의사항

작성: 이찬희 (CUFA 2대 회장)

CUFA — Chungbuk National University Financial Analysis.

## 저작권 및 이용 안내

© CUFA (충북대학교 가치투자학회). All rights reserved.

본 교안은 CUFA 학회 교육 목적으로 작성되었으며, 작성자 이찬희의 사전 서면 동의 없이 전체 또는 일부를 복제, 배포, 전송, 2차 저작물 작성에 이용할 수 없습니다.

본 자료의 저작권은 CUFA 및 작성자 이찬희에게 있습니다.

학회 내부 교육 목적의 열람 및 인쇄는 허용됩니다.

외부 유출, SNS 게시, 타 학회·기관 공유, 상업적 이용은 금지됩니다.

인용 시 출처를 반드시 명시해야 합니다: "CUFA 3기 신입교육 교안, 이찬희 작성"

위반 시 저작권법에 따른 민·형사상 책임을 질 수 있습니다.

문의: CUFA 회장 이찬희


[table 1]

| 방법 | 난이도 | 속도 | 적합한 상황 |

| **NEXUS Finance MCP** | 가장 쉬움 | 가장 빠름 | CUFA 기본 도구. Claude에 연결만 하면 자연어로 데이터 조회·분석·밸류에이션 자동 |

| **AI 코딩 에이전트** (Claude Code / ChatGPT / Codex CLI) | 중간 | 빠름 | 커스텀 분석, 대량 차트 생성, 복잡한 모델링 |

| **직접 Python 코딩** (pykrx / yfinance / FRED API) | 높음 | 느림 | MCP·에이전트로 안 되는 특수 작업, 파이프라인 커스터마이징 |


[table 2]

| 소스 | 데이터 | NEXUS MCP | Python 직접 | 비용 |

| 한국은행 (ECOS) | 금리, 환율, GDP, M2 | ✓ (자동) | requests | 무료 |

| 통계청 (KOSIS) | 인구, 실업률, 주택가격 | ✓ (자동) | requests | 무료 |

| KRX | 시세, 베타, PER, PBR | ✓ (자동) | pykrx | 무료 |

| DART | 재무제표, 공시 | 부분 지원 | OpenDartReader | 무료 (API key) |

| Yahoo Finance | 글로벌 주가, 환율, 원자재 | ✗ | yfinance | 무료 |

| FRED (미연준) | 미국 금리, CPI, 고용 | ✗ | fredapi | 무료 (API key) |

| 관세청 | 수출입 통계 | ✓ (자동) | requests | 무료 |

| Finnhub | 미국 주식, 경제캘린더 | ✓ (자동) | requests | 무료 |

| EIA | WTI, 천연가스 | ✓ (자동) | requests | 무료 |


[table 3]

| 통계코드 | 항목 | 주기 |

| 722Y001 | 한국은행 기준금리 | 일 |

| 901Y009 | 소비자물가지수 | 월 |

| 731Y001 | 주요 환율 | 일 |

| 403Y001 | 수출입 동향 | 월 |

| 200Y001 | 경제성장률(GDP) | 분기 |


[table 4]

| 도구 | 특징 | 실행 환경 | 강점 | 약점 |

| Claude Code | Anthropic CLI 에이전트. 터미널에서 자연어로 코딩 | 로컬 터미널 | 파일 직접 읽기/쓰기, 긴 컨텍스트, MCP 연동 | API 비용 발생 |

| ChatGPT Code Interpreter | OpenAI 내장 Python 실행 환경 | 브라우저(ChatGPT) | 파일 업로드 → 즉시 분석, 시각화 강력 | 외부 API 호출 불가(pykrx, DART 등) |

| Codex CLI (OpenAI) | OpenAI CLI 에이전트. 터미널에서 자연어로 코딩 | 로컬 터미널 | Claude Code와 유사한 로컬 실행, 파일 직접 조작 | API 비용, 컨텍스트 Claude 대비 짧음 |

| Cursor / Windsurf | AI 코드 에디터. 코드베이스 전체 이해 | 데스크톱 IDE | 프로젝트 단위 코딩에 최적 | 분석보다 개발에 특화 |


[table 5]

| 작업 | 최적 도구 | 이유 |

| DART API로 재무제표 수집 | Claude Code / Codex CLI | 로컬 API 호출 필요 |

| pykrx로 주가 데이터 수집 | Claude Code / Codex CLI | 로컬 패키지 실행 필요 |

| 업로드한 엑셀 분석·시각화 | ChatGPT Code Interpreter | 가장 빠르고 간편 |

| 보고서 차트 대량 생성 | Claude Code / Codex CLI | 파일 I/O 자유 |

| 3-Statement 모델 검증 | ChatGPT Code Interpreter | 엑셀 업로드 후 수식 검증 |

| FRED/ECOS 매크로 데이터 | Claude Code / Codex CLI | API 호출 필요 |

| 증권사 리포트 요약 | ChatGPT / Claude | PDF 업로드 후 요약 |


[table 6]

| 데이터 | 시차 | 대응 |

| DART 연간 재무제표 | 결산 후 90일 (3월 말 공시) | 3월 중에는 직전 분기 데이터 사용 |

| DART 분기 보고서 | 분기 종료 후 45일 | 잠정실적은 DART 공시에서 먼저 확인 |

| pykrx 주가 | 당일 장 마감 후 | 장 중 실시간은 증권사 API 필요 |

| FRED 데이터 | 지표별 상이 (CPI: 발표 후 즉시) | 발표 일정 확인 (FRED 캘린더) |

| ECOS 데이터 | 한국은행 발표 후 1~3일 | 금통위 결과는 당일 반영 |