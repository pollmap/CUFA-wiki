---
sidebar_position: 5
title: "Walk-Forward 검증"
description: "과최적화 탐지를 위한 N-fold OOS 검증"
---

# Walk-Forward 검증

## 과최적화란?

In-Sample 데이터에서만 좋은 성과를 보이고, 실전(Out-of-Sample)에서 실패하는 전략.

```
IS에서 Sharpe 2.0 → OOS에서 Sharpe -0.5
= 과최적화 (전략이 아닌 노이즈를 학습)
```

## Walk-Forward 방법론

데이터를 N개 폴드로 나누어 순차적으로 검증:

```
전체 데이터: [====================================]

Fold 1: [Train 70%  ][Test 30%]
Fold 2:        [Train 70%  ][Test 30%]
Fold 3:              [Train 70%  ][Test 30%]
Fold 4:                    [Train 70%  ][Test 30%]
Fold 5:                          [Train 70%  ][Test 30%]
```

## 두 가지 모드

### Rolling Window
- 각 폴드가 독립적으로 이동
- 데이터 효율이 낮지만 과적합 탐지에 강함

### Anchored (Expanding Window)
- 학습 시작점 고정, 점점 확장
- 더 많은 학습 데이터 → 안정적이지만 최근 데이터 편향

## 핵심 지표

### IS→OOS Sharpe Degradation

```
Degradation = 1 - (OOS Sharpe / IS Sharpe)

해석:
  0%   = 과최적화 없음 (이상적)
  50%  = 경고 (IS 성과의 절반만 OOS에서 유지)
  80%+ = 위험 (거의 과최적화)
```

### 통과 기준

| 기준 | 값 | 설명 |
|------|-----|------|
| OOS 평균 Sharpe | >= 0.3 | 최소 비용 후 양의 알파 |
| OOS 최악 MDD | >= -20% | 최악 폴드에서도 파산 안 함 |
| 승률 | >= 40% | 5폴드 중 2개 이상 양의 OOS Sharpe |

## 사용법

```python
from kis_backtest.core.walk_forward import WalkForwardValidator, WFConfig

# 기본 설정
validator = WalkForwardValidator(WFConfig(
    n_folds=5,
    train_ratio=0.7,
    min_sharpe=0.3,
    max_oos_dd=-0.20,
    anchored=False,
))

# 단일 종목
result = validator.validate(daily_returns)

# 멀티 종목 포트폴리오
result = validator.validate_multi_asset(
    returns_dict={"005930": [...], "000660": [...]},
    weights={"005930": 0.6, "000660": 0.4},
)

# 결과 확인
print(result.verdict)        # "PASS" or "FAIL: ..."
print(result.oos_mean_sharpe)
print(result.mean_degradation)

# 폴드별 상세
for fold in result.folds:
    print(f"Fold {fold.fold_idx}: IS={fold.is_sharpe:.3f} → OOS={fold.oos_sharpe:.3f}")
```

## Pipeline 통합

```python
pipeline = QuantPipeline(config)
wf_result = pipeline.validate_oos(returns_dict, weights, n_folds=5)

if wf_result.passed:
    # 검증 통과 → 실행
    result = pipeline.run(factor_scores, weights, returns_dict)
else:
    # 검증 실패 → 전략 조정 필요
    print(f"OOS 검증 실패: {wf_result.verdict}")
```

## 참고 문헌

- Robert Pardo, *The Evaluation and Optimization of Trading Strategies* (2008)
- David Aronson, *Evidence-Based Technical Analysis* (2006)
- Marcos Lopez de Prado, *Advances in Financial Machine Learning* (2018) — Chapter 12
