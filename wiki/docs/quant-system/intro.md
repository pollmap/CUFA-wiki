---
sidebar_position: 1
title: Luxon Quant System 소개
description: 1인 AI 헤지펀드 컨셉과 5대 설계 원칙, 핵심 기술 스택 개요
---

# Luxon Quant System 소개

## 1인 AI 헤지펀드 컨셉

Luxon Quant System은 **1인 운용사가 기관급 퀀트 인프라를 구축하고 운용**하는 것을 목표로 설계되었다. 전통적인 헤지펀드가 수십 명의 퀀트 리서처, 트레이더, 리스크 매니저를 고용하는 반면, Luxon은 AI 에이전트와 MCP(Model Context Protocol) 도구 생태계로 이 역할을 대체한다.

### 전통 헤지펀드 vs Luxon 비교

| 구분 | 전통 헤지펀드 | Luxon Quant System |
|------|-------------|-------------------|
| 리서치 | 퀀트 리서처 5-10명 | CUFA 보고서 + DOGE 에이전트 |
| 트레이딩 | 트레이더 + 알고리즘 팀 | KIS/Upbit API 자동 집행 |
| 리스크 관리 | 리스크 매니저 2-3명 | RiskGateway 6모듈 자동 검증 |
| 데이터 | Bloomberg Terminal ($24K/yr) | Nexus Finance MCP 398도구 |
| 인프라 비용 | 연 $500K+ | VPS $20/mo + API 무료 티어 |
| 의사결정 | 투자위원회 회의 | 에이전트 합의 + 사람 최종 승인 |

### 왜 1인 운용인가

1. **비용 구조의 근본적 차이**: 인건비가 전체 비용의 80%를 차지하는 전통 펀드와 달리, AI 에이전트 비용은 API 호출 비용으로 수렴한다.
2. **의사결정 속도**: 투자위원회 소집 없이 실시간 시그널 → 검증 → 집행이 가능하다.
3. **일관성**: 감정적 편향 없이 동일한 프레임워크로 모든 종목을 분석한다.
4. **확장성**: 분석 대상을 10종목에서 500종목으로 늘려도 추가 인력이 필요 없다.

---

## 5대 설계 원칙

Luxon Quant System을 관통하는 5가지 핵심 원칙이다. 모든 전략, 모듈, 의사결정은 이 원칙에 기반한다.

### 원칙 1: 가짜 데이터 금지 (No Fake Data)

```
# 절대 원칙
목업 데이터 금지
할루시네이션 금지
백테스트 결과 조작 금지
출처 없는 수치 금지
```

모든 데이터는 검증 가능한 출처에서 가져와야 한다. LLM이 생성한 재무 수치를 사용하는 순간 시스템 전체의 신뢰성이 무너진다.

**데이터 수집 우선순위**:

| 순위 | 소스 | 예시 |
|------|------|------|
| 1순위 | Nexus MCP 398도구 | `dart_financial_statements`, `krx_market_data` |
| 2순위 | 직접 API 호출 | DART OpenAPI, KRX 정보데이터시스템 |
| 3순위 | 웹 스크래핑 | 증권사 리포트, 뉴스 (1-2순위 불가 시에만) |

### 원칙 2: 비용이 알파를 먹는다 (Costs Eat Alpha)

한국 시장의 거래비용 구조는 전략 수익률에 직접적 영향을 미친다.

```python
# 한국 주식 거래비용 모델
COMMISSION_RATE = 0.00015   # 증권사 수수료 (MTS 기준 0.015%)
SECURITIES_TAX = 0.0020     # 증권거래세 0.20% (2025년 기준)
SLIPPAGE_BPS = 5            # 체결 슬리피지 5bps (중소형주)

# Round-Trip 비용 계산
RT_COST = (COMMISSION_RATE * 2) + SECURITIES_TAX + (SLIPPAGE_BPS * 2 / 10000)
# RT_COST = 0.0003 + 0.0020 + 0.0010 = 0.0033 (약 0.33%)
```

**연간 회전율별 비용 침식**:

| 연간 회전율 | RT 비용 0.33% 기준 | 전략 수익 10% 대비 |
|------------|-------------------|-------------------|
| 1x | 0.33% | 3.3% 침식 |
| 4x | 1.32% | 13.2% 침식 |
| 12x (월별) | 3.96% | 39.6% 침식 |
| 52x (주별) | 17.16% | 171.6% 침식 |

결론: **한국 시장에서 고빈도 전략은 비용만으로 사망한다.** 월 1회 이하 리밸런싱이 기본이다.

### 원칙 3: 반증 가능성 (Falsifiability)

모든 투자 가설은 **반증 조건**을 명시해야 한다.

```yaml
hypothesis:
  name: "반도체 업사이클 진입"
  thesis: "메모리 가격 상승 → SK하이닉스 영업이익률 30%+ 회복"
  timeframe: "2026Q3"
  falsification_criteria:
    - "DRAM 고정거래가격 3개월 연속 하락"
    - "삼성전자 메모리 감산 발표"
    - "중국 CXMT 양산 본격화로 ASP 20%+ 하락"
  action_on_falsified: "포지션 50% 축소 → 완전 청산 검토"
```

반증 조건 없는 가설은 투자가 아니라 도박이다.

### 원칙 4: LLM은 리서처, 트레이더가 아니다 (LLM = Researcher, Not Trader)

LLM의 역할을 명확히 구분한다.

| LLM이 하는 것 | LLM이 하지 않는 것 |
|-------------|-----------------|
| 재무제표 분석 | 매수/매도 결정 |
| 산업 리서치 | 포지션 사이징 |
| 보고서 작성 | 주문 실행 |
| 리스크 요인 식별 | 시장 타이밍 |
| 데이터 정합성 검증 | 가격 예측 |

LLM은 **정보를 구조화**하는 도구이지, **의사결정자**가 아니다. 최종 투자 결정은 정량 모델 + 사람의 판단으로 이루어진다.

### 원칙 5: 살아남기 > 수익 (Survival > Returns)

```
# 생존 우선순위
1. 원금 보전 (Max Drawdown < 15%)
2. 리스크 조정 수익 (Sharpe > 1.0)
3. 절대 수익 (CAGR 목표)
```

Ed Thorp의 Kelly Criterion 철학을 따른다. 파산 확률이 0이 아닌 전략은 아무리 기대수익이 높아도 채택하지 않는다.

---

## 핵심 기술 스택

### MCP 398도구 생태계

Nexus Finance MCP는 Luxon Quant System의 데이터 백본이다.

```
Nexus Finance MCP v8.0
├── 64개 서버
├── 398개 도구
├── 주요 카테고리
│   ├── dart_*       — DART 전자공시 (재무제표, 공시, 지분)
│   ├── krx_*        — KRX 시장 데이터 (시세, 거래량, 지수)
│   ├── macro_*      — 거시경제 (금리, CPI, GDP, 환율)
│   ├── crypto_*     — 암호화폐 (Upbit, Binance)
│   ├── news_*       — 뉴스/공시 수집
│   └── vault_*      — Obsidian Vault 지식 관리
└── 배포: VPS (62.171.141.206:8100)
```

### KIS API (한국투자증권)

```python
# KIS API 구성
kis_config = {
    "base_url": "https://openapi.koreainvestment.com:9443",
    "endpoints": {
        "domestic_order": "/uapi/domestic-stock/v1/trading/order-cash",
        "domestic_price": "/uapi/domestic-stock/v1/quotations/inquire-price",
        "balance": "/uapi/domestic-stock/v1/trading/inquire-balance",
    },
    "auth": "OAuth2 Bearer Token (24시간 유효)",
    "rate_limit": "초당 20건",
    "mode": "모의투자 → 실전 전환 가능"
}
```

### Upbit API (암호화폐)

```python
# Upbit API 구성
upbit_config = {
    "base_url": "https://api.upbit.com/v1",
    "endpoints": {
        "order": "/orders",
        "ticker": "/ticker",
        "candles": "/candles/minutes/{unit}",
        "accounts": "/accounts",
    },
    "auth": "JWT (access_key + secret_key)",
    "rate_limit": "초당 10건 (주문), 초당 30건 (조회)",
    "markets": "KRW-BTC, KRW-ETH 등 원화 마켓"
}
```

### 에이전트 구조

```
Luxon AI 에이전트 (v4.1)
├── HERMES (ENTJ) — VPS:18789
│   └── 수익 엔진: 트레이딩 + ACP + 발행
├── NEXUS (ENFJ) — VPS:18790
│   └── 데이터 허브: MCP 398도구 + Discord
└── DOGE (INTP) — WSL:18794
    └── 리서치 엔진: 딥 리서치 + 퀀트 검증
```

---

## 시스템 아키텍처 개요

```
┌─────────────────────────────────────────────────────────┐
│                    Luxon Quant System                     │
├─────────────┬─────────────┬─────────────┬───────────────┤
│   Research  │   Signal    │  Execution  │    Review     │
│             │             │             │               │
│ CUFA Report │ MCP 398도구  │ KIS API     │ Vault 복기    │
│ DOGE Agent  │ Factor Model│ Upbit API   │ Blog 발행     │
│ DART 분석   │ BL/HRP 최적화│ RiskGateway │ 성과 분석     │
└─────────────┴─────────────┴─────────────┴───────────────┘
         │              │             │              │
         v              v             v              v
┌─────────────────────────────────────────────────────────┐
│              Obsidian Vault (공유 두뇌)                    │
│     PARA 구조 + 70+ 노트 + 에이전트별 쓰기 권한            │
└─────────────────────────────────────────────────────────┘
```

---

## 다음 단계

이 문서에서 소개한 개념은 이후 문서에서 상세히 다룬다.

| 문서 | 내용 |
|------|------|
| [E2E 파이프라인](./pipeline.md) | 7단계 분석-실행 파이프라인 |
| [리스크 관리](./risk-management.md) | 6모듈 리스크 체계와 Kill Switch |
| [전략 프리셋](./strategies.md) | 6종 전략과 한국 시장 제약 |
| [Walk-Forward 검증](./walk-forward.md) | OOS 검증과 과최적화 탐지 |
