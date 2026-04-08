---
sidebar_position: 3
title: 리스크 관리 체계
description: 6개 리스크 모듈, RiskGateway 7개 사전 체크, Kill Switch, Capital Ladder 상세
---

# 리스크 관리 체계

> "살아남는 것이 수익보다 중요하다" -- Ed Thorp, *A Man for All Markets*

## 설계 철학

Luxon Quant System의 리스크 관리는 세 가지 핵심 철학에 기반한다.

### 1. 비대칭 손실 회피

수학적으로 50% 손실을 복구하려면 100%의 수익이 필요하다. 손실 방지가 수익 추구보다 항상 우선한다.

| 손실률 | 복구에 필요한 수익률 | 난이도 |
|--------|---------------------|--------|
| -10% | +11.1% | 보통 |
| -20% | +25.0% | 어려움 |
| -30% | +42.9% | 매우 어려움 |
| -50% | +100.0% | 사실상 불가능 |

### 2. Kelly Criterion의 보수적 적용

Ed Thorp가 실전에서 검증한 Kelly Criterion을 따르되, **Half-Kelly**를 기본으로 사용한다. Full Kelly는 이론적 최적이지만, 추정 오차가 있는 현실에서는 파산 확률이 급등한다.

```python
def half_kelly(win_prob: float, win_loss_ratio: float) -> float:
    """Half-Kelly 포지션 사이징
    
    Args:
        win_prob: 승률 (0-1)
        win_loss_ratio: 평균 이익 / 평균 손실
    
    Returns:
        투입 비율 (0-1)
    """
    full_kelly = win_prob - (1 - win_prob) / win_loss_ratio
    return max(0, full_kelly * 0.5)  # Half-Kelly

# 예시: 승률 55%, 손익비 1.5
position_size = half_kelly(0.55, 1.5)
# full_kelly = 0.55 - 0.45/1.5 = 0.25
# half_kelly = 0.125 (자본의 12.5%)
```

### 3. Millennium Management 스타일 DD 규칙

Millennium Management의 팟(pod) 매니저 리스크 관리를 참고한 3단계 방어 체계이다.

| DD 수준 | 상태 | 조치 | 비중 조정 |
|---------|------|------|----------|
| -5% | WARNING | 경고 발동, 모니터링 강화 | 유지 |
| -7.5% | REDUCE | 신규 진입 중단, 기존 축소 | 50% 감소 |
| -10% | HALT | 전량 청산, Kill Switch 발동 | 0% (전량 현금) |

---

## 6개 리스크 모듈

### 모듈 1: 거래비용 모델 (cost_model)

한국 시장의 거래비용은 알파를 먹는 핵심 요인이다. 비용을 무시한 백테스트는 의미가 없다.

#### 비용 구조

| 구분 | KOSPI | KOSDAQ | 비고 |
|------|-------|--------|------|
| 매수 수수료 | 0.015% | 0.015% | MTS 기준 |
| 매도 수수료 | 0.015% | 0.015% | MTS 기준 |
| 매도세 (증권거래세) | 0.18% | 0.18% | 2025년 기준 |
| 슬리피지 (대형주) | ~5bps | ~8bps | 시가총액 상위 |
| 슬리피지 (중소형주) | ~10bps | ~15bps | 시가총액 하위 |
| **RT 비용 (대형주)** | **~0.23%** | **~0.24%** | Round-Trip |
| **RT 비용 (중소형주)** | **~0.33%** | **~0.36%** | Round-Trip |

#### After-Cost Kelly

```python
class CostModel:
    """거래비용 모델"""

    def __init__(
        self,
        commission: float = 0.00015,
        tax: float = 0.0018,
        slippage_bps: float = 5.0,
    ):
        self.commission = commission
        self.tax = tax
        self.slippage = slippage_bps / 10000

    def round_trip_cost(self) -> float:
        """Round-Trip 비용 계산"""
        return (self.commission * 2) + self.tax + (self.slippage * 2)

    def annual_cost(self, turnover: int) -> float:
        """연간 비용 = 회전율 x RT 비용"""
        return turnover * self.round_trip_cost()

    def after_cost_sharpe(
        self, gross_sharpe: float, annual_cost: float, vol: float
    ) -> float:
        """비용 차감 후 Sharpe Ratio"""
        cost_drag = annual_cost / vol
        return gross_sharpe - cost_drag
```

#### 회전율별 비용 침식

| 연간 회전율 | RT 비용 0.23% 기준 | 비용 10% 수익 대비 |
|------------|-------------------|-------------------|
| 1x (연간) | 0.23% | 2.3% 침식 |
| 4x (분기) | 0.92% | 9.2% 침식 |
| 12x (월간) | 2.76% | 27.6% 침식 |
| 52x (주간) | 11.96% | 119.6% 침식 |

결론: **월간 리밸런싱(12x)이 비용 효율의 상한선이다.**

---

### 모듈 2: 드로다운 가드 (drawdown_guard)

EWMA(Exponentially Weighted Moving Average) 기반 고점 추적과 3단계 자동 방어 시스템이다.

```python
from kis_backtest.strategies.risk.drawdown_guard import DrawdownGuard

guard = DrawdownGuard(
    warning_pct=-0.05,   # -5% 경고
    reduce_pct=-0.075,   # -7.5% 축소
    halt_pct=-0.10,      # -10% 정지
)

# 매일 포트폴리오 가치 체크
state = guard.check(current_equity=9_300_000, peak_equity=10_000_000)
# state.level = "REDUCE" (-7% drawdown)
# state.action = "신규 진입 중단, 기존 포지션 50% 축소"
```

#### 상태 전이 다이어그램

```
NORMAL --(-5%)--> WARNING --(-7.5%)--> REDUCE --(-10%)--> HALT
  ^                 |                    |                  |
  |    (회복 > -3%) |   (회복 > -5%)     |   (수동 해제)    |
  +<----------------+<-------------------+<-----------------+
```

핵심: **강등은 자동이지만, HALT에서의 복귀는 수동 승인이 필요하다.** 자동 복귀를 허용하면 "반등에 물타기" 하는 행동 편향이 발생하기 때문이다.

---

### 모듈 3: 변동성 타겟팅 (vol_target)

포트폴리오의 연간 변동성을 목표치(기본 10%)로 조정한다.

```python
class VolTarget:
    """변동성 타겟팅 모듈"""

    def __init__(
        self,
        target_vol: float = 0.10,
        ewma_lambda: float = 0.94,
        max_leverage: float = 1.5,
        min_leverage: float = 0.3,
    ):
        self.target_vol = target_vol
        self.ewma_lambda = ewma_lambda
        self.max_leverage = max_leverage
        self.min_leverage = min_leverage

    def compute_leverage(self, realized_vol: float) -> float:
        """목표 변동성 대비 레버리지 계산"""
        if realized_vol <= 0:
            return self.min_leverage
        raw_leverage = self.target_vol / realized_vol
        return max(
            self.min_leverage,
            min(self.max_leverage, raw_leverage)
        )
```

#### 변동성에 따른 레버리지 조정

| 실현 변동성 | 레버리지 | 조정된 변동성 | 해석 |
|------------|---------|-------------|------|
| 5% | 1.5x (상한) | 7.5% | 저변동 구간: 최대 레버리지 |
| 10% | 1.0x | 10% | 목표 일치: 조정 불필요 |
| 20% | 0.5x | 10% | 고변동 구간: 비중 절반 |
| 30% | 0.33x | 10% | 극고변동: 대폭 축소 |

---

### 모듈 4: 상관관계 모니터 (correlation_monitor)

종목 간 상관계수가 상승하면 분산 효과가 감소한다. 위기 시 상관관계가 1로 수렴하는 현상(correlation breakdown)을 조기 탐지한다.

```python
class CorrelationMonitor:
    """종목 간 상관관계 모니터링"""

    def __init__(
        self,
        lookback: int = 60,
        warning_threshold: float = 0.35,
        critical_threshold: float = 0.60,
    ):
        self.lookback = lookback
        self.warning_threshold = warning_threshold
        self.critical_threshold = critical_threshold

    def check(self, returns: pd.DataFrame) -> dict:
        """상관행렬 체크"""
        corr = returns.tail(self.lookback).corr()
        avg_corr = corr.values[np.triu_indices_from(
            corr.values, k=1
        )].mean()

        if avg_corr > self.critical_threshold:
            return {"level": "CRITICAL", "avg_corr": avg_corr,
                    "action": "포지션 30% 축소"}
        elif avg_corr > self.warning_threshold:
            return {"level": "WARNING", "avg_corr": avg_corr,
                    "action": "모니터링 강화"}
        return {"level": "NORMAL", "avg_corr": avg_corr}
```

---

### 모듈 5: VPIN (Volume-Clock Probability of Informed Trading)

시장 미시구조 분석을 통해 정보 비대칭 트레이딩을 탐지한다. VPIN이 높으면 내부 정보를 가진 참여자가 활동 중일 가능성이 크다.

| VPIN 구간 | 해석 | 조치 |
|-----------|------|------|
| < 0.3 | 정상 | 없음 |
| 0.3 - 0.5 | 주의 | 모니터링 |
| 0.5 - 0.7 | 경고 | 비중 20% 감소 |
| > 0.7 | 위험 | 비중 50% 감소 |

추가 규칙: **3개 이상 종목이 CRITICAL이면 전체 주문을 차단한다.**

```python
class VPINMonitor:
    """VPIN 기반 정보 비대칭 탐지"""

    def __init__(self, bucket_size: int = 50, n_buckets: int = 50):
        self.bucket_size = bucket_size
        self.n_buckets = n_buckets

    def compute_vpin(self, trades: pd.DataFrame) -> float:
        """VPIN 계산"""
        buckets = self._create_volume_buckets(trades)
        buy_vol = buckets["buy_volume"]
        sell_vol = buckets["sell_volume"]
        total_vol = buy_vol + sell_vol
        vpin = abs(buy_vol - sell_vol).rolling(
            self.n_buckets
        ).sum() / total_vol.rolling(self.n_buckets).sum()
        return vpin.iloc[-1]
```

---

### 모듈 6: 혼잡도 (Crowding)

동일 팩터에 과도한 자금이 집중되면 팩터 수익률이 급락할 수 있다. 2020년 3월 모멘텀 팩터 붕괴가 대표적 사례이다.

| 혼잡도 수준 | 해석 | 조치 |
|------------|------|------|
| < 50% | 정상 | 없음 |
| 50% - 70% | 주의 | 팩터 분산 검토 |
| 70% - 80% | 경고 | 해당 팩터 비중 20% 감소 |
| > 80% | 위험 | 해당 팩터 비중 30% 감소 |

혼잡도 측정 방법:
1. **Short Interest Ratio**: 공매도 잔고 / 발행주식수
2. **Factor Valuation Spread**: 팩터 상위/하위 그룹 밸류에이션 차이
3. **ETF Flow Concentration**: 해당 팩터 ETF로의 자금 유입 집중도

---

## RiskGateway -- 7개 사전 체크

모든 주문은 실행 전에 RiskGateway의 7개 체크를 통과해야 한다. 하나라도 실패하면 주문이 거부된다.

```python
class RiskGateway:
    """주문 실행 전 7개 리스크 체크"""

    def pre_trade_check(self, order: PortfolioOrder) -> RiskResult:
        checks = [
            self._check_kill_switch(),        # 1. Kill Switch
            self._check_pipeline_risk(),      # 2. 파이프라인 리스크
            self._check_drawdown_state(),     # 3. DD 상태
            self._check_market_hours(),       # 4. 시장 시간
            self._check_total_exposure(),     # 5. 총 노출
            self._check_single_position(),    # 6. 단일 포지션
            self._check_rate_limit(),         # 7. Rate Limit
        ]

        failed = [c for c in checks if not c.passed]
        if failed:
            return RiskResult(
                passed=False,
                reason="; ".join(c.reason for c in failed)
            )
        return RiskResult(passed=True)
```

### 각 체크 상세

| 번호 | 체크 항목 | 기준 | 실패 시 |
|------|----------|------|---------|
| 1 | Kill Switch | 파일 미존재 | 모든 주문 즉시 차단 |
| 2 | Pipeline Risk | 6모듈 종합 PASS | 리스크 모듈 재평가 |
| 3 | DD 상태 | != HALT | 전략 재검토 후 수동 해제 |
| 4 | 시장 시간 | 09:00-15:30 KST | 장 시작까지 대기 |
| 5 | 총 주문금액 | <= 가용현금 | 주문 규모 축소 |
| 6 | 단일 포지션 | <= 가용현금 30% | 분할 주문 |
| 7 | Rate Limit | 분당 10건 | 대기 후 재시도 |

### prod 모드 추가 체크

실전 투자(prod) 모드에서는 위 7개에 추가로 **수동 승인**이 필요하다. Discord 알림 + 15초 대기 + 승인 버튼 클릭 과정을 거친다.

---

## Kill Switch

파일 기반 긴급 정지 메커니즘이다. 최악의 상황에서 모든 자동 매매를 즉시 중단한다.

### 발동 조건

```python
KILL_SWITCH_FILE = Path.home() / "kis_kill_switch.lock"

def check_kill_switch() -> bool:
    """Kill Switch 확인"""
    return KILL_SWITCH_FILE.exists()

def activate_kill_switch(reason: str) -> None:
    """Kill Switch 발동"""
    KILL_SWITCH_FILE.write_text(
        f"activated: {datetime.now().isoformat()}\n"
        f"reason: {reason}\n",
        encoding="utf-8"
    )

def deactivate_kill_switch() -> None:
    """Kill Switch 해제 (수동)"""
    KILL_SWITCH_FILE.unlink(missing_ok=True)
```

### 자동 발동 조건

| 조건 | 설명 |
|------|------|
| DD >= 10% | 드로다운 가드 HALT |
| 3+ 종목 VPIN CRITICAL | 시장 전반 이상 징후 |
| API 연속 실패 5회 | 시스템 장애 의심 |
| 미체결 주문 10건 초과 | 유동성 고갈 의심 |

### 해제 절차

Kill Switch 해제는 반드시 **수동**으로 수행한다.

1. 원인 파악 및 기록
2. 시장 상황 재평가
3. 포지션 현황 확인
4. `~/kis_kill_switch.lock` 파일 삭제
5. PAPER 모드에서 재시작

---

## Capital Ladder 5단계

전략의 실전 검증 상태에 따라 자본을 단계적으로 투입한다.

### 단계 구조

```
PAPER(0%) --> SEED(10%) --> GROWTH(30%) --> SCALE(60%) --> FULL(100%)
```

| 단계 | 자본 비율 | 최소 기간 | 최소 Sharpe | 최대 MDD | 최소 거래 |
|------|----------|----------|------------|---------|----------|
| PAPER | 0% | 20일 | 0.0 | -15% | 30건 |
| SEED | 10% | 20일 | 0.2 | -10% | 30건 |
| GROWTH | 30% | 15일 | 0.3 | -8% | 20건 |
| SCALE | 60% | 10일 | 0.4 | -7% | 15건 |
| FULL | 100% | - | - | - | - |

### 승급 로직

```python
class CapitalLadder:
    """단계별 자본 배포"""

    STAGES = ["PAPER", "SEED", "GROWTH", "SCALE", "FULL"]

    def check_promotion(self, stage: str, metrics: dict) -> bool:
        """승급 조건 충족 여부"""
        criteria = PROMOTION_CRITERIA[stage]
        return (
            metrics["days"] >= criteria["min_days"]
            and metrics["sharpe"] >= criteria["min_sharpe"]
            and metrics["max_dd"] >= criteria["max_mdd"]
            and metrics["n_trades"] >= criteria["min_trades"]
        )

    def check_demotion(self, stage: str, metrics: dict) -> bool:
        """강등 조건: MDD가 한도의 1.5배 초과"""
        limit = PROMOTION_CRITERIA[stage]["max_mdd"]
        return metrics["max_dd"] < limit * 1.5
```

### 강등 규칙

- MDD가 해당 단계 한도의 **1.5배**를 초과하면 한 단계 강등
- PAPER로 강등되면 전략 전면 재검토 필수
- 강등 후 승급 조건은 처음부터 다시 충족해야 함

---

## 6모듈 통합 리스크 스코어

6개 모듈의 결과를 종합하여 단일 리스크 스코어를 산출한다.

```python
def compute_risk_score(modules: dict) -> float:
    """0-100 리스크 스코어 (높을수록 위험)"""
    weights = {
        "cost_model": 0.10,
        "drawdown_guard": 0.25,
        "vol_target": 0.20,
        "correlation_monitor": 0.15,
        "vpin": 0.15,
        "crowding": 0.15,
    }
    score = sum(
        modules[name].risk_level * weight
        for name, weight in weights.items()
    )
    return min(100, max(0, score))
```

| 종합 점수 | 상태 | 조치 |
|----------|------|------|
| 0-30 | GREEN | 정상 운영 |
| 30-60 | YELLOW | 모니터링 강화 |
| 60-80 | ORANGE | 신규 진입 중단 |
| 80-100 | RED | Kill Switch 검토 |

---

## 참고 문헌

- Ed Thorp, *A Man for All Markets* (2017) -- Kelly Criterion 실전 적용
- Marcos Lopez de Prado, *Advances in Financial Machine Learning* (2018) -- VPIN, 과최적화
- AQR Capital Management -- Transaction Cost Analysis 방법론
- Millennium Management -- Pod Manager Risk Framework
- Robert Pardo, *The Evaluation and Optimization of Trading Strategies* (2008)
