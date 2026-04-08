---
sidebar_position: 2
title: 7단계 E2E 파이프라인
description: 분석에서 복기까지, Luxon Quant System의 End-to-End 투자 파이프라인 상세 설명
---

# 7단계 E2E 파이프라인

## 파이프라인 전체 흐름

Luxon Quant System은 기업 분석부터 사후 복기까지 **7단계 End-to-End 파이프라인**으로 운영된다. 각 단계는 명확한 입력/출력을 가지며, 이전 단계의 출력이 다음 단계의 입력이 된다.

```
[1] 분석(CUFA) --> [2] 시그널(MCP) --> [3] 최적화(BL/HRP)
        |                                      |
[7] 복기(Vault+Blog) <-- [6] 실행(KIS/Upbit) <-- [5] 배포(Capital Ladder)
                                                 ^
                              [4] 검증(Walk-Forward)
```

### 단계별 요약

| 단계 | 이름 | 핵심 동작 | 소요 시간 |
|------|------|----------|----------|
| 1 | 분석 (CUFA) | 기업 펀더멘털 분석 + 보고서 생성 | 2-4시간/종목 |
| 2 | 시그널 (MCP) | 팩터 스코어링 + 매매 시그널 생성 | 5-10분 |
| 3 | 최적화 (BL/HRP) | 포트폴리오 비중 최적화 | 1-2분 |
| 4 | 검증 (Walk-Forward) | OOS 백테스트 + 과최적화 탐지 | 10-30분 |
| 5 | 배포 (Capital Ladder) | 자본 단계별 투입 결정 | 즉시 |
| 6 | 실행 (KIS/Upbit) | 주문 집행 + 체결 확인 | 1-5분 |
| 7 | 복기 (Vault+Blog) | 성과 분석 + 교훈 기록 | 30분 |

---

## Stage 1: 분석 (CUFA)

CUFA(충북대 가치투자학회) 기업분석 프레임워크를 사용한 펀더멘털 분석 단계이다.

### 입력

```yaml
input:
  stock_code: "000660"          # 종목 코드
  stock_name: "SK하이닉스"       # 종목명
  analysis_type: "full"         # full | quick | update
  data_sources:
    - dart_financial_statements  # DART 재무제표 (CFS 필수)
    - dart_disclosures           # 전자공시
    - krx_market_data            # 시장 데이터
    - industry_reports           # 산업 보고서
```

### 처리 과정

1. **재무제표 수집**: DART API로 최근 5년 연결재무제표(CFS) 수집
2. **산업 분석**: 경쟁사 비교, 시장 점유율, 진입 장벽 분석
3. **밸류에이션**: DCF, PER/PBR 밴드, EV/EBITDA 멀티플 산출
4. **리스크 식별**: 산업 리스크, 재무 리스크, 지배구조 리스크 평가
5. **보고서 생성**: HTML 보고서 (80K자+, SVG 25+, 테이블 25+)

### 출력

```yaml
output:
  report: "cufa_report_000660_v14.html"
  valuation:
    target_price: 185000
    upside: 0.23
    confidence: "MEDIUM"
  risk_factors:
    - "중국 CXMT 양산 본격화"
    - "AI 수요 둔화 가능성"
  investment_thesis: "HBM3E 독점 공급으로 영업이익률 30%+ 회복 전망"
```

### 핵심 MCP 도구

```python
# DART 재무제표 조회 (CFS 필수)
dart_fs = mcp.call("dart_financial_statements", {
    "corp_code": "00126380",
    "bsns_year": "2025",
    "reprt_code": "11011",  # 사업보고서
    "fs_div": "CFS"         # 연결재무제표 (절대 OFS 사용 금지)
})

# KRX 시장 데이터 조회
market = mcp.call("krx_market_data", {
    "stock_code": "000660",
    "period": "1Y"
})
```

### MCPDataProvider 연동

```python
from kis_backtest.portfolio.mcp_data_provider import MCPDataProvider

provider = MCPDataProvider()
prices = provider.get_stock_prices_sync("005930", start_date="20210101")
ratios = provider.get_financial_ratios_sync("005930")
```

---

## Stage 2: 시그널 (MCP)

MCP 398도구를 활용한 정량 시그널 생성 단계이다.

### 입력

```yaml
input:
  universe: ["000660", "005930", "035420"]
  factors:
    value: ["PER_TTM", "PBR", "EV_EBITDA"]
    quality: ["ROE", "영업이익률", "부채비율"]
    momentum: ["12M_수익률", "6M_수익률"]
    size: ["시가총액"]
  lookback_period: "12M"
```

### 처리 과정

```python
class FactorScorer:
    """멀티팩터 스코어링 엔진"""

    def __init__(self, universe: list[str], factors: dict):
        self.universe = universe
        self.factors = factors

    def compute_z_scores(self, factor_data: pd.DataFrame) -> pd.DataFrame:
        """각 팩터를 Z-Score로 정규화"""
        return (factor_data - factor_data.mean()) / factor_data.std()

    def composite_score(
        self, z_scores: pd.DataFrame, weights: dict
    ) -> pd.Series:
        """가중 합산 컴포짓 스코어"""
        score = pd.Series(0.0, index=z_scores.index)
        for factor, weight in weights.items():
            score += z_scores[factor] * weight
        return score.rank(pct=True)

    def generate_signals(self, scores: pd.Series) -> dict:
        """시그널 생성: 상위 20% 매수, 하위 20% 회피"""
        return {
            "buy": scores[scores >= 0.8].index.tolist(),
            "avoid": scores[scores <= 0.2].index.tolist(),
            "hold": scores[
                (scores > 0.2) & (scores < 0.8)
            ].index.tolist(),
        }
```

### 팩터 가중치 기본값

| 팩터 그룹 | 비중 | 근거 |
|----------|------|------|
| Value | 30% | 한국 시장에서 가치 프리미엄 유의 |
| Quality | 30% | 부실 기업 필터링 효과 |
| Momentum | 25% | 12-1 모멘텀 유효 |
| Size | 15% | 소형주 프리미엄 (유동성 제약 고려) |

### 출력

```yaml
output:
  signals:
    buy: ["000660", "005930"]
    hold: ["035420"]
    avoid: ["035720"]
  factor_scores:
    "000660": 0.87
    "005930": 0.82
  timestamp: "2026-04-08T09:00:00+09:00"
```

---

## Stage 3: 최적화 (BL/HRP)

포트폴리오 비중을 결정하는 최적화 단계이다. 두 가지 방법을 병행한다.

### Black-Litterman 모델

시장 균형 수익률에 투자자의 뷰(View)를 결합한다. CUFA 분석의 목표가와 상승여력이 View로 입력된다.

```python
def black_litterman(
    market_cap_weights: np.ndarray,
    sigma: np.ndarray,
    views: np.ndarray,
    view_confidence: np.ndarray,
    risk_aversion: float = 2.5,
    tau: float = 0.05,
) -> np.ndarray:
    """Black-Litterman 최적 비중 계산"""
    pi = risk_aversion * sigma @ market_cap_weights
    omega = np.diag(np.diag(
        view_confidence @ (tau * sigma) @ view_confidence.T
    ))
    inv_tau_sigma = np.linalg.inv(tau * sigma)
    inv_omega = np.linalg.inv(omega)

    posterior = np.linalg.inv(
        inv_tau_sigma + view_confidence.T @ inv_omega @ view_confidence
    ) @ (
        inv_tau_sigma @ pi
        + view_confidence.T @ inv_omega @ views
    )

    weights = np.linalg.inv(risk_aversion * sigma) @ posterior
    return weights / weights.sum()
```

### HRP (Hierarchical Risk Parity)

공분산 행렬의 계층적 구조를 활용한 리스크 패리티 방식이다. Markowitz 최적화의 불안정성 문제(공분산 행렬 역행렬 추정 오차)를 해결한다.

```python
from kis_backtest.core.strategy_comparison import StrategyComparison

comp = StrategyComparison(provider, symbols=["005930", "000660"])
bl_weights, hrp_weights = comp.optimize_portfolio_sync(
    prices_dict, factor_scores
)
```

### BL vs HRP 사용 기준

| 상황 | 권장 방법 | 이유 |
|------|----------|------|
| 종목 수 5개 미만 | BL | 뷰 반영이 핵심 |
| 종목 수 20개 이상 | HRP | 공분산 추정 불안정 |
| 강한 투자 확신 | BL | 뷰 가중 효과 |
| 분산 중심 | HRP | 클러스터 기반 분산 |

### 출력

```yaml
output:
  portfolio:
    "000660": 0.25
    "005930": 0.20
    "035420": 0.15
    "CASH": 0.40
  method: "BL+HRP_blend"
  expected_return: 0.12
  expected_vol: 0.18
  sharpe_ratio: 0.67
```

---

## Stage 4: 검증 (Walk-Forward)

과최적화를 방지하기 위한 Out-of-Sample 검증 단계이다.

```python
from kis_backtest.core.walk_forward import WalkForwardValidator, WFConfig

validator = WalkForwardValidator(WFConfig(n_folds=5, min_sharpe=0.3))
result = validator.validate_multi_asset(returns_dict, weights)

if result.passed:
    print("OOS 검증 통과 - Capital Ladder 진입 가능")
else:
    print(f"검증 실패: {result.reason}")
```

상세 내용은 [Walk-Forward 검증](./walk-forward.md) 참고.

### 핵심 검증 항목

| 항목 | 기준 | 실패 시 조치 |
|------|------|------------|
| OOS Sharpe | > 0.5 | 전략 재설계 |
| IS/OOS Sharpe 비율 | > 0.5 (OOS/IS) | 과최적화 의심 |
| Max Drawdown | < 15% | 포지션 축소 |
| 승률 | > 45% | 팩터 재검토 |
| Profit Factor | > 1.3 | 손익비 개선 |

---

## Stage 5: 배포 (Capital Ladder)

검증을 통과한 전략에 단계별로 자본을 투입한다.

### Capital Ladder 5단계

| Stage | 설명 | 자본 비율 | 최소 기간 | 최소 Sharpe | 최대 MDD |
|-------|------|----------|----------|------------|---------|
| PAPER | 페이퍼 트레이딩 | 0% | 20일 | 0.0 | -15% |
| SEED | 시드 투입 | 10% | 20일 | 0.2 | -10% |
| GROWTH | 확대 | 30% | 15일 | 0.3 | -8% |
| SCALE | 스케일업 | 60% | 10일 | 0.4 | -7% |
| FULL | 풀 배포 | 100% | - | - | - |

### 강등 조건

MDD가 기준을 초과하거나 Sharpe가 기준 미달이면 한 단계 강등된다. PAPER로 강등되면 전략을 전면 재검토한다.

---

## Stage 6: 실행 (KIS/Upbit)

RiskGateway 검증을 통과한 주문을 실제로 집행하는 단계이다.

### RiskGateway 7개 사전 체크

```
QuantPipeline.run()
  --> RiskGateway.check() [7개 체크]
    --> LiveOrderExecutor.execute()
      --> KIS API 또는 Upbit API
```

| 번호 | 체크 항목 | 설명 |
|------|----------|------|
| 1 | 킬 스위치 비활성 | 킬 스위치가 OFF인지 확인 |
| 2 | 파이프라인 리스크 PASS | 전체 파이프라인 리스크 점수 |
| 3 | DD 상태 != HALT | Drawdown Guard 상태 확인 |
| 4 | 시장 시간 확인 | 장중(09:00-15:30) 여부 |
| 5 | 총 주문금액 <= 가용현금 | 현금 잔고 초과 방지 |
| 6 | 단일 주문 <= 30% | 집중 투자 방지 |
| 7 | Rate limit | API 호출 제한 준수 |

### KIS 주문 예시

```python
async def execute_kis_order(
    stock_code: str,
    side: str,
    quantity: int,
    order_type: str,
    price: int = None,
) -> dict:
    """KIS API 주문 집행"""
    risk_check = risk_gateway.pre_trade_check(
        stock_code=stock_code,
        side=side,
        quantity=quantity,
        price=price or get_current_price(stock_code),
    )
    if not risk_check.passed:
        return {"status": "REJECTED", "reason": risk_check.reason}

    response = await kis_client.place_order(
        stock_code=stock_code,
        order_side="01" if side == "buy" else "02",
        order_type="01" if order_type == "market" else "00",
        quantity=quantity,
        price=price or 0,
    )

    if response["rt_cd"] == "0":
        vault.record_trade(response)
        return {"status": "EXECUTED", "order_no": response["odno"]}
    return {"status": "FAILED", "message": response["msg1"]}
```

---

## Stage 7: 복기 (Vault + Blog)

모든 트레이딩 결과를 기록하고 교훈을 추출한다.

### 자동 복기 스케줄

| 주기 | 시간 | 내용 |
|------|------|------|
| 일간 | 16:00 | 일간 스냅샷 (Vault 저장) |
| 주간 | 금요일 16:30 | 주간 복기 보고서 |
| 월간 | 말일 | 월간 성과 분석 + 블로그 발행 |

### 복기 자동 실행

```python
# Task Scheduler에서 자동 실행
python scripts/run_daily_review.py --force
python scripts/feedback_loop.py --publish
```

### Vault 저장 구조

```
obsidian-vault/3-Resources/trading/
    postmortem/2026-04/       # 트레이드별 복기
    performance/2026-04.md    # 월별 성과 요약
    strategies/               # 전략별 성과 추적
    risk-events/              # 리스크 이벤트 기록
```

---

## 파이프라인 운영 주기

| 주기 | 실행 단계 | 설명 |
|------|----------|------|
| 수시 | Stage 1 | 신규 종목 발굴 시 CUFA 분석 |
| 일간 | Stage 2 | 팩터 스코어 업데이트 |
| 주간 | Stage 3-4 | 포트폴리오 최적화 + 검증 |
| 월간 | Stage 5-6 | 리밸런싱 실행 |
| 월간 | Stage 7 | 성과 복기 + Vault 기록 |
| 분기 | 전체 | 전략 전면 재검토 |

---

## 관련 문서

- [리스크 관리](./risk-management.md): RiskGateway와 6모듈 상세
- [전략 프리셋](./strategies.md): 팩터 모델과 6종 전략
- [Walk-Forward 검증](./walk-forward.md): OOS 검증과 과최적화 탐지
