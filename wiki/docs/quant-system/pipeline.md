---
sidebar_position: 2
title: "E2E 파이프라인"
description: "7단계 퀀트 운용 파이프라인 — 분석부터 복기까지"
---

# E2E 파이프라인

Luxon Quant System의 7단계 End-to-End 파이프라인.

## 전체 흐름

```
분석(CUFA) → 시그널(MCP 398도구)
  → 최적화(BL/HRP)
    → 검증(Walk-Forward)
      → 배포(Capital Ladder)
        → 실행(KIS/Upbit)
          → 모니터링(WebSocket)
            → 복기(Vault+Blog)
              → 다음 사이클 피드백
```

## 1단계: 데이터 수집 및 분석

**입력:** 종목코드, 섹터

**도구:**
- `stocks_search` — 종목 검색
- `dart_financial_statements` — CFS 재무제표
- `ecos_get_base_rate` — 기준금리
- `get_stock_price` — 주가 시계열

**출력:** 팩터 스코어, 재무 데이터, 가격 시계열

```python
from kis_backtest.portfolio.mcp_data_provider import MCPDataProvider

provider = MCPDataProvider()
prices = provider.get_stock_prices_sync("005930", start_date="20210101")
ratios = provider.get_financial_ratios_sync("005930")
```

## 2단계: 시그널 생성

**입력:** 팩터 스코어, 가격 데이터

**도구:**
- `factor_score` — 멀티팩터 스코어링
- MCP 퀀트 38도구

**출력:** 종목별 투자 시그널, BL 뷰

## 3단계: 포트폴리오 최적화

**입력:** 시그널, 가격 시계열

**도구:**
- `portadv_black_litterman` — Black-Litterman 최적화
- `portadv_hrp` — Hierarchical Risk Parity

**출력:** 종목별 최적 비중

```python
from kis_backtest.core.strategy_comparison import StrategyComparison

comp = StrategyComparison(provider, symbols=["005930", "000660"])
bl_weights, hrp_weights = comp.optimize_portfolio_sync(prices_dict, factor_scores)
```

## 4단계: Walk-Forward 검증

**입력:** 포트폴리오 수익률, 비중

**모듈:** `kis_backtest.core.walk_forward`

**출력:** OOS Sharpe, degradation, pass/fail

```python
from kis_backtest.core.walk_forward import WalkForwardValidator, WFConfig

validator = WalkForwardValidator(WFConfig(n_folds=5, min_sharpe=0.3))
result = validator.validate_multi_asset(returns_dict, weights)

if result.passed:
    print("OOS 검증 통과!")
```

## 5단계: Capital Ladder 배포

**입력:** 검증 결과, 자본 규모

**모듈:** `kis_backtest.execution.capital_ladder`

**5단계:**

| 단계 | 비율 | 최소 기간 | 최소 Sharpe | 최대 MDD |
|------|------|----------|------------|---------|
| PAPER | 0% | 20일 | 0.0 | -15% |
| SEED | 10% | 20일 | 0.2 | -10% |
| GROWTH | 30% | 15일 | 0.3 | -8% |
| SCALE | 60% | 10일 | 0.4 | -7% |
| FULL | 100% | - | - | - |

## 6단계: 주문 실행

**입력:** PortfolioOrder, 계좌 정보

**흐름:**
```
QuantPipeline.run()
  → RiskGateway.check() [7개 체크]
    → LiveOrderExecutor.execute()
      → KIS API 또는 Upbit API
```

**리스크 게이트 7개 체크:**
1. 킬 스위치 비활성
2. 파이프라인 리스크 PASS
3. DD 상태 != HALT
4. 시장 시간 확인
5. 총 주문금액 <= 가용현금
6. 단일 주문 <= 30%
7. Rate limit

## 7단계: 모니터링 및 복기

**실시간 모니터링:**
- WebSocket으로 체결가 추적
- DD 경고 (5%) → 킬 스위치 (8%)
- AlertSystem (콘솔 + Discord)

**복기:**
- 매일 16:00 일간 스냅샷 (Vault)
- 매주 금요일 16:30 주간 복기
- 블로그 자동 발행 (피드백 루프)

```python
# Task Scheduler에서 자동 실행
python scripts/run_daily_review.py --force
python scripts/feedback_loop.py --publish
```
