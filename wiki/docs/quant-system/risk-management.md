---
sidebar_position: 3
title: "리스크 관리"
description: "6개 리스크 모듈과 7개 사전 체크 — 살아남기 > 수익"
---

# 리스크 관리

> "살아남는 것이 수익보다 중요하다" — Ed Thorp

## 설계 원칙

Millennium Management DD 규칙을 참고한 3단계 방어:

| DD 수준 | 조치 | 비중 조정 |
|---------|------|----------|
| -5% | 경고 발동 | 유지 |
| -7.5% | 비중 축소 | 50% 감소 |
| -10% | 전량 청산 | Kill Switch |

## 6개 리스크 모듈

### 1. 거래비용 모델 (cost_model.py)

한국 주식 거래비용은 알파를 먹는 핵심 요인:

| 구분 | KOSPI | KOSDAQ |
|------|-------|--------|
| 매수 수수료 | 0.015% | 0.015% |
| 매도 수수료 | 0.015% | 0.015% |
| 매도세 | 0.18% | 0.18% |
| 슬리피지 | ~5bps | ~10bps |
| **RT 비용** | **~0.23%** | **~0.24%** |

After-cost Kelly Criterion으로 비용 차감 후 실제 알파가 있는지 확인.

### 2. 드로다운 가드 (drawdown_guard.py)

EWMA 기반 고점 추적 + 3단계 조치:

```python
from kis_backtest.strategies.risk.drawdown_guard import DrawdownGuard

guard = DrawdownGuard(
    warning_pct=-0.05,   # -5% 경고
    reduce_pct=-0.075,   # -7.5% 축소
    halt_pct=-0.10,      # -10% 정지
)
state = guard.check(current_equity, peak_equity)
```

### 3. 변동성 타겟팅 (vol_target.py)

포트폴리오 변동성을 목표치(10%)로 조정:
- EWMA 변동성 추정 (lambda=0.94)
- 포트폴리오 레벨 스케일링
- 최대 레버리지 1.5x 제한

### 4. 상관관계 모니터 (correlation_monitor.py)

종목 간 상관계수가 높아지면 분산 효과 감소 → 경고:
- lookback 60일 롤링 상관
- 임계값 0.35 초과 시 경고

### 5. VPIN (마이크로구조)

Volume-clock Probability of Informed Trading:
- VPIN > 0.7: 비중 50% 감소
- VPIN > 0.5: 비중 20% 감소
- 3+ 종목 CRITICAL: 전체 주문 차단

### 6. 혼잡도 (Crowding)

동일 팩터에 과도한 자금 집중 탐지:
- 혼잡도 > 80%: 비중 30% 감소

## RiskGateway — 7개 사전 체크

주문 실행 전 반드시 통과해야 하는 7개 체크:

```
1. 킬 스위치 비활성 확인
2. 파이프라인 리스크 PASS
3. DD 상태 != HALT
4. 시장 시간 확인 (09:00-15:30 KST)
5. 총 주문금액 <= 가용현금
6. 단일 주문 <= 가용현금 30%
7. Rate limit (분당 10건)
```

prod 모드에서는 추가로 수동 승인 필요.

## Capital Ladder

점진적 자본 배포로 리스크 제한:

PAPER(0%) → SEED(10%) → GROWTH(30%) → SCALE(60%) → FULL(100%)

각 단계에서 Sharpe/MDD/기간 조건 충족 시 승격.
MDD 한도의 1.5배 초과 시 자동 강등.

## Kill Switch

파일 기반 긴급 정지 메커니즘:
- `~/kis_kill_switch.lock` 파일 생성 → 모든 주문 차단
- 해제: 파일 삭제

## 참고 문헌

- Ed Thorp, *A Man for All Markets* (2017)
- Marcos Lopez de Prado, *Advances in Financial Machine Learning* (2018)
- Millennium Management — Risk Management Framework
- AQR — Transaction Cost Analysis
