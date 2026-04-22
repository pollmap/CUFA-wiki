CUFA

충북대학교 가치투자학회

신입교육 교안

C주차. DART API 가이드

CUFA 3기

작성: 이찬희

목차

# CUFA 부록 C — DART API 데이터 추출 가이드

OpenDART API를 활용하여 재무 데이터를 자동 수집하는 방법을 다룬다. Python 기초만 알면 따라할 수 있다.

# 1. OpenDART 개요

DART(전자공시시스템)은 한국 모든 상장기업의 법정 공시를 제공한다. OpenDART는 이 데이터를 API로 제공하는 서비스다.

홈페이지: opendart.fss.or.kr

API Key 발급: 홈페이지 회원가입 → 인증키 신청 → 즉시 발급 (무료).

일일 호출 한도: 10,000건/일. CUFA 분석에 충분한 양이다.

제공 데이터: 재무제표(연결/별도, 연간/분기), 공시 검색, 대주주 변동, 임원 현황, 배당 정보 등.

# 2. 환경 설정

## 2-1. Python 설치

이미 Python이 설치되어 있으면 건너뛴다.

python.org에서 최신 버전 다운로드. 설치 시 "Add Python to PATH" 체크.

## 2-2. 필요 패키지 설치

터미널(명령 프롬프트)에서:

```

pip install opendartreader pandas openpyxl

```

opendartreader: OpenDART API를 쉽게 사용할 수 있는 Python 라이브러리.

pandas: 데이터 처리.

openpyxl: 엑셀 파일 생성.

## 2-3. API Key 설정

```python

import OpenDartReader as odr

# API Key를 여기에 입력

dart = odr.OpenDartReader('YOUR_API_KEY_HERE')

```

API Key는 외부에 노출하지 않는다. 코드를 공유할 때는 Key를 삭제하고 공유한다.

# 3. 기본 사용법

## 3-1. 기업 검색

```python

# 기업명으로 종목코드 검색

result = dart.company('삼성전자')

print(result)

# corp_code, corp_name, stock_code 등 반환

```

## 3-2. 재무제표 추출

```python

# 연결재무제표 (연간)

fs = dart.finstate('005930', 2025)  # 삼성전자, 2025년

# 주요 항목 확인

print(fs[['account_nm', 'thstrm_amount', 'frmtrm_amount']])

# account_nm: 계정명 (매출액, 영업이익, 당기순이익 등)

# thstrm_amount: 당기 금액

# frmtrm_amount: 전기 금액

```

## 3-3. 특정 항목 추출

```python

# 매출액 추출

revenue = fs[fs['account_nm'].str.contains('매출액')]['thstrm_amount']

print(f"매출액: {revenue.values[0]}")

# 영업이익 추출

op = fs[fs['account_nm'].str.contains('영업이익')]['thstrm_amount']

print(f"영업이익: {op.values[0]}")

```

주의: 계정명이 기업마다 미묘하게 다를 수 있다. "매출액" 대신 "수익(매출액)"으로 표기되는 경우도 있으므로 str.contains()로 부분 매칭한다.

## 3-4. 5개년 재무 데이터 수집

```python

import pandas as pd

code = '005930'  # 삼성전자

years = [2021, 2022, 2023, 2024, 2025]

data = []

for year in years:

try:

fs = dart.finstate(code, year)

rev = fs[fs['account_nm'].str.contains('매출액')]['thstrm_amount'].values[0]

op = fs[fs['account_nm'].str.contains('영업이익')]['thstrm_amount'].values[0]

ni = fs[fs['account_nm'].str.contains('당기순이익')]['thstrm_amount'].values[0]

data.append({'연도': year, '매출액': rev, '영업이익': op, '순이익': ni})

except:

print(f"{year}년 데이터 없음")

df = pd.DataFrame(data)

print(df)

```

## 3-5. 엑셀로 내보내기

```python

# 엑셀 파일로 저장

df.to_excel('삼성전자_5개년.xlsx', index=False)

print("엑셀 저장 완료")

```

이 엑셀 파일을 3주차 과제의 출발점으로 사용한다.

# 4. 실전 스크립트

## 4-1. 피어 비교 자동화

관심 기업 + 피어 3곳의 재무 데이터를 한번에 수집한다.

```python

import pandas as pd

import OpenDartReader as odr

dart = odr.OpenDartReader('YOUR_API_KEY')

# 분석 대상 + 피어

companies = {

'코스맥스': '192820',

'한국콜마': '161890',

'코스메카코리아': '241710',

}

year = 2025

results = []

for name, code in companies.items():

try:

fs = dart.finstate(code, year)

rev = float(fs[fs['account_nm'].str.contains('매출액')]['thstrm_amount'].values[0].replace(',',''))

op = float(fs[fs['account_nm'].str.contains('영업이익')]['thstrm_amount'].values[0].replace(',',''))

ni = float(fs[fs['account_nm'].str.contains('당기순이익')]['thstrm_amount'].values[0].replace(',',''))

equity = float(fs[fs['account_nm'].str.contains('자본총계')]['thstrm_amount'].values[0].replace(',',''))

opm = op / rev * 100

npm = ni / rev * 100

roe = ni / equity * 100

results.append({

'기업명': name,

'매출액': rev,

'영업이익': op,

'순이익': ni,

'OPM(%)': round(opm, 1),

'NPM(%)': round(npm, 1),

'ROE(%)': round(roe, 1),

})

except Exception as e:

print(f"{name} 오류: {e}")

df = pd.DataFrame(results)

print(df)

df.to_excel('피어비교.xlsx', index=False)

```

4주차 과제(피어 비교 비율 테이블)의 데이터 수집이 이 스크립트 하나로 완성된다.

## 4-2. 공시 모니터링

특정 기업의 최근 공시를 검색한다.

```python

# 삼성전자 최근 공시

disclosures = dart.list('005930', start='2026-01-01', end='2026-03-13')

print(disclosures[['rcept_dt', 'report_nm']].head(20))

```

자사주 소각 공시, 실적 발표, IR 자료 등을 자동으로 추적할 수 있다.

## 4-3. 대주주 변동 추적

```python

# 대주주 현황

shareholders = dart.major_shareholders('005930')

print(shareholders)

```

지배구조 분석(1주차, 4주차)에서 대주주 지분율 변동을 추적할 때 사용.

# 5. Claude Code와 연동

Claude Code에서 위 스크립트를 실행하면, 대화형으로 "삼성전자의 5개년 재무 데이터를 수집해서 엑셀로 내보내줘"라고 요청하는 것만으로 자동 실행된다.

활용 예시:

"코스맥스, 한국콜마, 코스메카코리아의 2023~2025년 OPM/ROE를 비교 테이블로 만들어줘"

"SK하이닉스의 최근 1년 공시 중 '자사주' 관련 공시만 필터링해줘"

"관심 기업 5곳의 5개년 재무 데이터를 한 엑셀에 시트별로 정리해줘"

Claude Code + OpenDART API 조합은 CUFA 분석의 데이터 수집 시간을 90% 이상 절약해준다.

# 6. 한국투자증권 API (보조)

한국투자증권 Open API는 실시간 주가, 시가총액, 거래량 등 시장 데이터를 제공한다.

홈페이지: apiportal.koreainvestment.com

계좌 필요: 한국투자증권 계좌 개설 후 API 신청.

OpenDART가 "재무 데이터"를 제공한다면, 한국투자증권 API는 "시장 데이터"를 제공한다. 둘을 조합하면 PER/PBR 등 밸류에이션 지표를 실시간으로 계산할 수 있다.

CUFA 교안 범위에서는 OpenDART + CompanyGuide(무료)로 충분하다. 한국투자증권 API는 자동화 수준을 한 단계 올리고 싶을 때 사용한다.

# 7. 주의사항

(1) API Key를 코드에 직접 넣지 말고 환경변수나 별도 파일로 관리한다. GitHub 등에 업로드 시 Key가 노출될 수 있다.

(2) 일일 호출 한도(10,000건)를 초과하지 않도록 한다. 반복 호출 시 time.sleep(0.5)으로 간격을 둔다.

(3) DART 데이터는 법정 공시 기준이므로 가장 신뢰할 수 있다. 다만 데이터 업데이트에 시차가 있을 수 있다(분기보고서 제출 후 1~2일).

(4) 계정명이 기업마다 다를 수 있으므로, 부분 매칭(str.contains)을 사용하고, 결과를 반드시 육안으로 확인한다.

# 8. 전체 재무제표 자동 수집 스크립트

앞서 5개년 기본 데이터 수집을 다뤘다. 여기서는 IS/CF/BS 전체 항목을 수집하는 확장 스크립트를 제시한다.

## 8-1. IS 전체 항목 수집

```python

import OpenDartReader as odr

import pandas as pd

dart = odr.OpenDartReader('YOUR_API_KEY')

def get_full_is(code, year):

"""손익계산서 전체 항목 수집"""

fs = dart.finstate(code, year, reprt_code='11011')  # 사업보고서(연간)

# 손익계산서 항목만 필터

is_items = fs[fs['sj_nm'].str.contains('손익')]

result = {}

for _, row in is_items.iterrows():

account = row['account_nm']

amount = row['thstrm_amount']

# 쉼표 제거 + 숫자 변환

try:

amount = float(str(amount).replace(',', ''))

except:

amount = 0

result[account] = amount

return result

# 코스맥스 2023~2025년 IS

for year in [2023, 2024, 2025]:

is_data = get_full_is('192820', year)

print(f"\n=== {year}년 ===")

for k, v in is_data.items():

print(f"  {k}: {v:,.0f}")

```

reprt_code 설명:

11011 = 사업보고서(연간, 가장 상세)

11012 = 반기보고서

11013 = 1분기보고서

11014 = 3분기보고서

## 8-2. CF 전체 항목 수집

```python

def get_full_cf(code, year):

"""현금흐름표 전체 항목 수집"""

fs = dart.finstate(code, year, reprt_code='11011')

cf_items = fs[fs['sj_nm'].str.contains('현금')]

result = {}

for _, row in cf_items.iterrows():

account = row['account_nm']

amount = row['thstrm_amount']

try:

amount = float(str(amount).replace(',', ''))

except:

amount = 0

result[account] = amount

return result

```

## 8-3. BS 전체 항목 수집

```python

def get_full_bs(code, year):

"""재무상태표 전체 항목 수집"""

fs = dart.finstate(code, year, reprt_code='11011')

bs_items = fs[fs['sj_nm'].str.contains('재무상태')]

result = {}

for _, row in bs_items.iterrows():

account = row['account_nm']

amount = row['thstrm_amount']

try:

amount = float(str(amount).replace(',', ''))

except:

amount = 0

result[account] = amount

return result

```

## 8-4. 3-Statement 통합 수집 + 엑셀 저장

```python

import pandas as pd

from openpyxl import Workbook

from openpyxl.styles import Font, PatternFill

def collect_all_statements(code, company_name, years):

"""3대 재무제표를 한 엑셀에 시트별로 저장"""

wb = Workbook()

# IS 시트

ws_is = wb.active

ws_is.title = "IS"

ws_is.append(["항목"] + [f"{y}A" for y in years])

all_is = {}

for year in years:

try:

is_data = get_full_is(code, year)

all_is[year] = is_data

except Exception as e:

print(f"IS {year} 오류: {e}")

# 전체 계정명 수집

all_accounts = []

for y_data in all_is.values():

for acc in y_data.keys():

if acc not in all_accounts:

all_accounts.append(acc)

for acc in all_accounts:

row = [acc]

for year in years:

val = all_is.get(year, {}).get(acc, 0)

row.append(val)

ws_is.append(row)

# CF 시트

ws_cf = wb.create_sheet("CF")

ws_cf.append(["항목"] + [f"{y}A" for y in years])

all_cf = {}

for year in years:

try:

cf_data = get_full_cf(code, year)

all_cf[year] = cf_data

except:

pass

all_cf_accounts = []

for y_data in all_cf.values():

for acc in y_data.keys():

if acc not in all_cf_accounts:

all_cf_accounts.append(acc)

for acc in all_cf_accounts:

row = [acc]

for year in years:

val = all_cf.get(year, {}).get(acc, 0)

row.append(val)

ws_cf.append(row)

# BS 시트

ws_bs = wb.create_sheet("BS")

ws_bs.append(["항목"] + [f"{y}A" for y in years])

all_bs = {}

for year in years:

try:

bs_data = get_full_bs(code, year)

all_bs[year] = bs_data

except:

pass

all_bs_accounts = []

for y_data in all_bs.values():

for acc in y_data.keys():

if acc not in all_bs_accounts:

all_bs_accounts.append(acc)

for acc in all_bs_accounts:

row = [acc]

for year in years:

val = all_bs.get(year, {}).get(acc, 0)

row.append(val)

ws_bs.append(row)

# 헤더 서식

header_fill = PatternFill(start_color="7C6AF7", fill_type="solid")

header_font = Font(color="FFFFFF", bold=True)

for ws in [ws_is, ws_cf, ws_bs]:

for cell in ws[1]:

cell.fill = header_fill

cell.font = header_font

filename = f"{company_name}_3Statement_{years[0]}_{years[-1]}.xlsx"

wb.save(filename)

print(f"저장 완료: {filename}")

# 실행

collect_all_statements('192820', '코스맥스', [2021, 2022, 2023, 2024, 2025])

```

이 스크립트 하나로 3주차 과제(5개년 재무 데이터 정리)의 데이터 수집이 2분 만에 끝난다.

# 9. 피어 비교 자동화 상세

## 9-1. 복수 기업 비율 자동 계산

```python

import pandas as pd

dart = odr.OpenDartReader('YOUR_API_KEY')

def calculate_ratios(code, year):

"""핵심 재무 비율 자동 계산"""

fs = dart.finstate(code, year)

def get_val(keyword):

matches = fs[fs['account_nm'].str.contains(keyword)]

if len(matches) > 0:

val = str(matches.iloc[0]['thstrm_amount']).replace(',', '')

try:

return float(val)

except:

return 0

return 0

revenue = get_val('매출액')

cogs = get_val('매출원가')

op = get_val('영업이익')

ni = get_val('당기순이익')

equity = get_val('자본총계')

assets = get_val('자산총계')

debt = get_val('부채총계')

interest = get_val('이자비용')

gross_profit = revenue - cogs if cogs > 0 else 0

ratios = {

'매출액': revenue,

'영업이익': op,

'순이익': ni,

'GPM(%)': round(gross_profit / revenue * 100, 1) if revenue else 0,

'OPM(%)': round(op / revenue * 100, 1) if revenue else 0,

'NPM(%)': round(ni / revenue * 100, 1) if revenue else 0,

'ROE(%)': round(ni / equity * 100, 1) if equity else 0,

'ROA(%)': round(ni / assets * 100, 1) if assets else 0,

'부채비율(%)': round(debt / equity * 100, 1) if equity else 0,

'이자보상배율': round(op / interest, 1) if interest else 999,

}

return ratios

# 피어 비교 실행

peers = {

'코스맥스': '192820',

'한국콜마': '161890',

'코스메카코리아': '241710',

}

years = [2023, 2024, 2025]

all_data = []

for name, code in peers.items():

for year in years:

try:

ratios = calculate_ratios(code, year)

ratios['기업명'] = name

ratios['연도'] = year

all_data.append(ratios)

except Exception as e:

print(f"{name} {year} 오류: {e}")

df = pd.DataFrame(all_data)

df = df[['기업명', '연도', '매출액', '영업이익', '순이익',

'GPM(%)', 'OPM(%)', 'NPM(%)', 'ROE(%)', 'ROA(%)',

'부채비율(%)', '이자보상배율']]

print(df.to_string(index=False))

df.to_excel('피어비교_상세.xlsx', index=False)

```

## 9-2. 듀폰 분해 자동화

```python

def dupont_decomposition(code, year):

"""듀폰 분해 자동"""

fs = dart.finstate(code, year)

def get_val(keyword):

matches = fs[fs['account_nm'].str.contains(keyword)]

if len(matches) > 0:

return float(str(matches.iloc[0]['thstrm_amount']).replace(',', ''))

return 0

revenue = get_val('매출액')

ni = get_val('당기순이익')

assets = get_val('자산총계')

equity = get_val('자본총계')

npm = ni / revenue if revenue else 0

turnover = revenue / assets if assets else 0

leverage = assets / equity if equity else 0

roe = npm * turnover * leverage

return {

'ROE': f"{roe*100:.1f}%",

'순이익률': f"{npm*100:.1f}%",

'자산회전율': f"{turnover:.2f}",

'레버리지': f"{leverage:.2f}",

'검증(곱)': f"{roe*100:.1f}%"

}

for name, code in peers.items():

result = dupont_decomposition(code, 2025)

print(f"\n{name} 듀폰: {result}")

```

# 10. 공시 모니터링 자동화

## 10-1. 최근 공시 검색

```python

# 삼성전자 최근 3개월 공시

disclosures = dart.list('005930',

start='2026-01-01',

end='2026-03-13')

print(f"총 {len(disclosures)}건")

for _, row in disclosures.head(20).iterrows():

print(f"  {row['rcept_dt']} | {row['report_nm']}")

```

## 10-2. 키워드 필터링

```python

# 자사주/배당 관련 공시만 필터

keywords = ['자사주', '자기주식', '배당', '주주환원']

filtered = disclosures[

disclosures['report_nm'].str.contains('|'.join(keywords))

]

for _, row in filtered.iterrows():

print(f"  {row['rcept_dt']} | {row['report_nm']}")

```

## 10-3. 관심 기업 리스트 일괄 모니터링

```python

import time

watchlist = {

'삼성전자': '005930',

'SK하이닉스': '000660',

'코스맥스': '192820',

'한화에어로스페이스': '012450',

}

for name, code in watchlist.items():

try:

recent = dart.list(code, start='2026-03-01', end='2026-03-13')

print(f"\n[{name}] 최근 공시 {len(recent)}건")

for _, row in recent.head(5).iterrows():

print(f"  {row['rcept_dt']} | {row['report_nm']}")

time.sleep(0.5)  # API 호출 간격

except:

print(f"\n[{name}] 조회 실패")

```

이 스크립트를 매주 월요일에 실행하면 5주차에서 다룬 "주간 데이터 모니터링 루틴"의 공시 파트가 자동화된다.

# 11. 시각화 자동화

## 11-1. matplotlib으로 매출/이익 추이 차트

```python

import matplotlib.pyplot as plt

import matplotlib.font_manager as fm

# 한글 폰트 설정 (OS별 자동 분기)

import platform

if platform.system() == 'Darwin':  # Mac

plt.rcParams['font.family'] = 'AppleGothic'

elif platform.system() == 'Windows':

plt.rcParams['font.family'] = 'Malgun Gothic'

else: # Linux

plt.rcParams['font.family'] = 'NanumGothic'  # apt install fonts-nanum

plt.rcParams['axes.unicode_minus'] = False

years = [2021, 2022, 2023, 2024, 2025]

revenue = [12000, 14500, 17775, 21661, 23988]  # 코스맥스 (억)

opm = [5.2, 5.8, 6.5, 8.1, 8.2]  # %

fig, ax1 = plt.subplots(figsize=(10, 6))

# 매출 막대

bars = ax1.bar(years, revenue, color='#7c6af7', alpha=0.8, width=0.6)

ax1.set_xlabel('연도')

ax1.set_ylabel('매출 (억 원)', color='#7c6af7')

ax1.tick_params(axis='y', labelcolor='#7c6af7')

# OPM 꺾은선 (보조 축)

ax2 = ax1.twinx()

ax2.plot(years, opm, 'o-', color='#34d399', linewidth=2, markersize=8)

ax2.set_ylabel('OPM (%)', color='#34d399')

ax2.tick_params(axis='y', labelcolor='#34d399')

plt.title('코스맥스 매출 및 OPM 추이', fontsize=14, fontweight='bold')

plt.tight_layout()

plt.savefig('코스맥스_매출OPM.png', dpi=150)

plt.show()

```

## 11-2. 피어 비교 차트

```python

companies = ['코스맥스', '한국콜마', '코스메카']

opm_values = [8.2, 7.5, 9.1]  # 2025년

colors = ['#7c6af7', '#999999', '#999999']  # 관심기업만 보라색

plt.figure(figsize=(8, 5))

plt.bar(companies, opm_values, color=colors)

plt.ylabel('OPM (%)')

plt.title('화장품 ODM 피어 비교 — OPM (2025년)')

plt.axhline(y=sum(opm_values)/len(opm_values),

color='red', linestyle='--', alpha=0.5, label='평균')

plt.legend()

plt.tight_layout()

plt.savefig('피어_OPM비교.png', dpi=150)

```

## 11-3. openpyxl 조건부서식 적용

엑셀 파일에 조건부서식을 프로그래밍으로 적용한다.

```python

from openpyxl.formatting.rule import CellIsRule

from openpyxl.styles import PatternFill

green_fill = PatternFill(start_color='C6EFCE', fill_type='solid')

red_fill = PatternFill(start_color='FFC7CE', fill_type='solid')

# OPM 10% 이상 → 초록, 5% 이하 → 빨강

ws.conditional_formatting.add(

'B5:J5',  # OPM 행 범위

CellIsRule(operator='greaterThan', formula=['0.10'], fill=green_fill)

)

ws.conditional_formatting.add(

'B5:J5',

CellIsRule(operator='lessThan', formula=['0.05'], fill=red_fill)

)

# ROE 15% 이상 → 초록

ws.conditional_formatting.add(

'B8:J8',

CellIsRule(operator='greaterThan', formula=['0.15'], fill=green_fill)

)

```

이 코드를 피어비교 자동화 스크립트(9-1절)의 엑셀 저장 부분에 추가하면, 열자마자 시각적으로 강약이 한눈에 보이는 테이블이 완성된다.

# 12. 에러 처리와 실전 팁

## 12-1. API 에러 대응

데이터 시차 주의: DART 재무제표 API는 기업이 공시를 제출한 뒤 1~3일 후에 데이터가 반영된다. 특히 연간 사업보고서는 결산일(보통 12/31) 후 약 90일 이내(3월 말)에 제출되므로, 2025년 연간 데이터는 2026년 4월 초가 되어야 API에서 안정적으로 조회된다. 3월 중에 조회하면 빈 결과가 나올 수 있다. 이 경우 직전 분기(3분기 누적) 데이터를 사용하거나, DART 웹에서 직접 PDF를 확인한다.

## 12-2. 계정명 매칭 팁

같은 "매출액"이 기업마다 다르게 표기될 수 있다:

"매출액", "수익(매출액)", "영업수익", "매출(수익)".

안전한 검색 방법:

```python

# 여러 키워드로 시도

def safe_get(fs, keywords):

for kw in keywords:

matches = fs[fs['account_nm'].str.contains(kw)]

if len(matches) > 0:

return float(str(matches.iloc[0]['thstrm_amount']).replace(',', ''))

return 0

revenue = safe_get(fs, ['매출액', '수익', '영업수익'])

```

## 12-3. 연결 vs 별도 기준

OpenDartReader의 기본은 연결재무제표. 별도(개별)를 원하면:

```python

fs = dart.finstate(code, year, reprt_code='11011', fs_div='OFS')

# fs_div: CFS=연결, OFS=별도

```

투자 분석에서는 연결 기준이 원칙이다. 다만 지주회사 분석 시 별도도 참고한다.

## 12-4. 분기 데이터 수집

```python

# 2025년 3분기 보고서

fs_q3 = dart.finstate(code, 2025, reprt_code='11014')

# 2025년 반기 보고서

fs_h1 = dart.finstate(code, 2025, reprt_code='11012')

```

분기 데이터로 연환산(trailing 4분기) 실적을 계산할 수 있다:

TTM 매출 = 최근 4분기 매출 합계.

# 13. 데이터 파이프라인 자동화

## 13-1. 전체 프로세스 자동화

```python

def full_pipeline(code, company_name, peers_dict, year=2025):

"""CUFA 보고서용 데이터 전체 자동 생성"""

print(f"=== {company_name} 데이터 파이프라인 시작 ===")

# 1. 5개년 재무제표 수집

print("\n[1/5] 재무제표 수집...")

collect_all_statements(code, company_name,

list(range(year-4, year+1)))

# 2. 피어 비교

print("\n[2/5] 피어 비교...")

all_data = []

for name, peer_code in peers_dict.items():

for y in range(year-2, year+1):

try:

ratios = calculate_ratios(peer_code, y)

ratios['기업명'] = name

ratios['연도'] = y

all_data.append(ratios)

except:

pass

df = pd.DataFrame(all_data)

df.to_excel(f'{company_name}_피어비교.xlsx', index=False)

# 3. 듀폰 분해

print("\n[3/5] 듀폰 분해...")

for name, peer_code in peers_dict.items():

result = dupont_decomposition(peer_code, year)

print(f"  {name}: {result}")

# 4. 최근 공시

print("\n[4/5] 최근 공시...")

recent = dart.list(code, start=f'{year}-01-01')

recent.to_excel(f'{company_name}_공시.xlsx', index=False)

# 5. 차트 생성

print("\n[5/5] 차트 생성...")

# (위의 matplotlib 코드 삽입)

print(f"\n=== {company_name} 파이프라인 완료 ===")

# 실행

full_pipeline(

'192820', '코스맥스',

{

'코스맥스': '192820',

'한국콜마': '161890',

'코스메카코리아': '241710'

}

)

```

이 함수 하나를 실행하면 3~6주차 과제에 필요한 데이터가 전부 생성된다.

## 13-2. 정기 실행 (크론잡)

매주 월요일 아침에 자동으로 데이터를 업데이트하고 싶다면:

Linux/Mac:

```bash

crontab -e

# 매주 월요일 08:00에 실행

0 8 * * 1 python3 /path/to/cufa_pipeline.py

```

Windows: 작업 스케줄러에서 동일 설정.

이렇게 하면 5주차의 "주간 데이터 모니터링 루틴"이 완전 자동화된다.

CUFA 3기 부록 C. DART API 데이터 추출 가이드.

OpenDART + Python으로 재무 데이터 수집을 자동화하면, 분석 시간의 90%를 절약할 수 있다.

데이터 수집은 AI와 코드에 맡기고, 판단에 시간을 투자하자.

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

| 에러 | 원인 | 대응 |

| 연결 오류 | API 서버 문제 | 5초 후 재시도 |

| 인증 오류 | API Key 만료/오류 | Key 재확인. 재발급 |

| 빈 결과 | 해당 연도 보고서 미공시 | 다른 연도/보고서 코드 시도 |

| 데이터 없음 | 계정명 불일치 | str.contains로 부분 매칭 |

| 호출 제한 | 일일 10,000건 초과 | time.sleep으로 간격 조절 |

| 데이터 시차 | 공시 후 API 반영까지 1~3일 | 최신 공시는 DART 웹에서 직접 확인 |