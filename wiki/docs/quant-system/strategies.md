---
sidebar_position: 4
title: "전략 프리셋"
description: "6종 퀀트 전략 프리셋과 한국 시장 제약"
---

# 전략 프리셋

## 6종 전략 프리셋

### Tier 1 (추천)

#### 한국 멀티팩터 (Monthly)
- 팩터: momentum + value + low_vol + quality
- 리밸런싱: 월간 (거래비용 연 -2.8%)
- 유니버스: KOSPI200 + KOSDAQ150
- 장점: 학술적 근거 풍부, 한국 팩터 프리미엄 확인됨 (Kang et al., 2019 KAIST)

#### 펀딩레이트 차익
- 현물 매수 + 선물 숏 → 펀딩레이트 수취
- 거래세 0% (크립토)
- 중립 포지션 → 시장 방향 무관

### Tier 2

#### 페어트레이딩
- 공매도 불가 → 롱-롱 비중차 또는 인버스 ETF
- OU 프로세스 기반 mean-reversion
- MCP `stat_arb_ou_fit` 도구 활용

#### 글로벌 매크로
- ECOS/FRED 거시지표 기반
- 금리/환율/원자재 로테이션
- ETF 활용 (국고채, 골드, WTI)

### Tier 3 (연구 단계)

#### 볼 타이밍
- HMM 레짐 탐지 → 고변동 시 현금/채권 이동
- GARCH 변동성 예측

#### ML 멀티알파
- Meta-labeling (Lopez de Prado)
- 팩터 결합 최적화

## 한국 시장 제약

| 제약 | 영향 | 대응 |
|------|------|------|
| 공매도 금지 (개인) | 숏 전략 불가 | 인버스 ETF, 비중 0 클리핑 |
| 거래세 0.18% | 고빈도 전략 비용 과다 | 월간 리밸런싱 (RT 12회/년) |
| 양도세 (대주주) | 250만 초과 22% | 분산 투자, 세금 최적화 |

## 거래비용 모델

```
연간 비용 = n_roundtrips × round_trip_cost
         = 12 × 0.23%
         = 2.76%

After-cost Alpha = Gross Alpha - 2.76%
→ Sharpe 0.5 미만이면 비용이 알파를 먹음
```

## 코드 예시

```python
from kis_backtest.core.pipeline import QuantPipeline, PipelineConfig

pipeline = QuantPipeline(PipelineConfig(
    total_capital=5_000_000,
    target_vol=0.10,
    kelly_fraction=0.5,       # Half-Kelly 필수
    rebalance_frequency="monthly",
))

result = pipeline.run(
    factor_scores=factor_scores,
    optimal_weights=bl_weights,
    returns_dict=returns_dict,
)
```
