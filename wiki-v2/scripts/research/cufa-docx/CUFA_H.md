CUFA

충북대학교 가치투자학회

신입교육 교안

H주차. NEXUS Finance MCP 활용 가이드

CUFA 3기

작성: 이찬희

목차

# CUFA 부록 H — NEXUS Finance MCP 활용 가이드

NEXUS Finance MCP는 CUFA 전용 금융 데이터 인프라다. Claude에 연결하면 한국은행, 통계청, KRX, DART 등 실제 DB에서 데이터를 직접 가져와서 분석한다. DCF 밸류에이션, Peer 비교, 매크로 분석까지 자동으로.

"AI computes. You decide."

# 1. 개요

# 2. 연결 방법 (5분)

## Claude Desktop (가장 쉬움)

1단계. https://claude.ai/download 에서 Claude Desktop 앱 설치.

2단계. 설정 파일 열기.

Windows: Win+R → `%APPDATA%\Claude`

Mac: `~/Library/Application Support/Claude/`

3단계. `claude_desktop_config.json`을 메모장으로 열고 아래 붙여넣기:

```json

{

"mcpServers": {

"nexus-finance": {

"url": "http://<MCP_VPS_HOST>:8100/sse"

}

}

}

```

4단계. Claude Desktop 재시작. 끝.

## Claude Code (터미널)

```bash

claude mcp add nexus-finance --transport sse http://<MCP_VPS_HOST>:8100/sse

```

# 3. CUFA 주차별 활용 매핑

## W1. 투자란 무엇인가

## W2. 산업 분석과 비즈니스 모델

## W3~W4. 재무제표 읽기 / 재무비율

## W5. 실적 추정

## W6. 밸류에이션

# 4. 밸류에이션 도구 (10개)

CUFA에서 가장 많이 쓸 기능:

# 5. 전체 데이터 서버 (25개)

# 6. 실전 워크플로우 — 기업분석 보고서 30분 완성

NEXUS MCP가 연결된 상태에서 아래 순서대로 요청하면 보고서 재료가 30분 안에 모인다.

```

1단계 (5분): "한국 매크로 환경 브리핑해줘. 금리, 환율, GDP, 수출 동향."

→ W2 산업분석 서두 재료

2단계 (5분): "반도체 섹터 현황 분석해줘. 시가총액, PER, 외국인 동향."

→ W2 산업분석 본문 재료

3단계 (5분): "코스맥스 현재가, PER, PBR, 베타, 6개월 주가 히스토리."

→ W3~W4 재무 분석 재료

4단계 (5분): "코스맥스 Peer 비교해줘. 한국콜마, 코스메카코리아 포함."

→ W4 피어 비교 재료

5단계 (5분): "코스맥스 DCF 밸류에이션 해줘."

→ W6 밸류에이션 핵심

6단계 (5분): "민감도 분석 해줘. WACC 8~12%, 성장률 1~5%."

→ W6 민감도 테이블

```

이 6단계 결과물 + 2~6주차 과제로 작성한 정성 분석을 합치면 보고서가 완성된다.

# 7. 주의사항

모든 데이터는 정보 제공 목적이며, 투자 자문이 아닙니다.

DCF/밸류에이션 결과는 가정치에 따라 크게 달라지므로 반드시 본인이 검증하세요.

보고서에 사용할 때는 데이터 출처를 명시합니다. (ex. 출처: 한국은행 ECOS via NEXUS MCP)

서버는 24시간 가동 중이지만, API 특성상 약간의 딜레이가 있을 수 있습니다.

무료입니다. 문제 있으면 찬희한테 연락주세요.

## 저작권 및 이용 안내

© CUFA (충북대학교 가치투자학회). All rights reserved.

본 교안은 CUFA 학회 교육 목적으로 작성되었으며, 작성자 이찬희의 사전 서면 동의 없이 전체 또는 일부를 복제, 배포, 전송, 2차 저작물 작성에 이용할 수 없습니다.

문의: CUFA 회장 이찬희


[table 1]

| 항목 | 내용 |

| 버전 | v2.4 |

| 서버 수 | 25개 |

| 도구 수 | 123개 |

| 비용 | 무료 (CUFA 학회원) |

| 개발 | 이찬희 (NEXUS 프로젝트) |


[table 2]

| 이렇게 물어보면 | Claude가 하는 일 |

| "KOSPI 최근 1년 추이 보여줘" | KRX에서 일별 OHLCV 조회 |

| "한국 기준금리 추이 알려줘" | 한국은행 ECOS에서 기준금리 시계열 |


[table 3]

| 이렇게 물어보면 | Claude가 하는 일 |

| "한국 매크로 환경 브리핑해줘" | 금리, 환율, GDP, 수출 데이터 종합 조회 |

| "반도체 섹터 현황 분석해줘" | 섹터별 시가총액, PER, 외국인 동향 |

| "WTI 유가랑 BDI 지수 확인해줘" | 에너지 + 해운 데이터 동시 조회 |

| "최근 금융 관련 법안 뭐 있어?" | 열린국회 API에서 검색 |

| "한국 수출 동향 알려줘" | 관세청 수출입 데이터 조회 |


[table 4]

| 이렇게 물어보면 | Claude가 하는 일 |

| "코스맥스 현재가, PER, PBR, 베타 알려줘" | KRX에서 실시간 시세 + 투자지표 |

| "코스맥스 6개월 주가 히스토리" | 일별 OHLCV 데이터 |

| "코스맥스 재무제표 가져와줘" | DART에서 IS/BS/CF 자동 수집 |


[table 5]

| 이렇게 물어보면 | Claude가 하는 일 |

| "코스맥스 3-Statement 모델 만들어줘" | 재무데이터 기반 자동 구축 |

| "반도체 동종업체 PER, PBR 비교해줘" | Peer Comparison 분석 자동 실행 |


[table 6]

| 이렇게 물어보면 | Claude가 하는 일 |

| "코스맥스 DCF 밸류에이션 해줘" | val_dcf_valuation 자동 실행 |

| "WACC 계산해줘 (베타 1.2, 무위험이율 3.5%)" | val_calculate_wacc |

| "코스맥스 Peer 비교 (PER, PBR, EV/EBITDA)" | val_peer_comparison |

| "민감도 분석 해줘 (WACC 7~11%, 성장률 1~5%)" | val_sensitivity_analysis |

| "val_dcf_sample 실행해줘" | 학습용 DCF 샘플 (처음이면 이것부터) |


[table 7]

| 도구 | 설명 |

| val_dcf_valuation | DCF 밸류에이션 (FCF 추정, 연속가치, 할인) |

| val_calculate_wacc | WACC 계산 (베타, 무위험이율, 시장프리미엄) |

| val_peer_comparison | Peer 비교 (PER, PBR, EV/EBITDA, ROE) |

| val_sensitivity_analysis | 민감도 분석 (WACC × 성장률 매트릭스) |

| val_cross_market_comparison | 한미 크로스마켓 비교 |

| val_normalize_gaap | GAAP 정규화 (한국/미국 회계기준 차이 보정) |

| val_get_market_assumptions | 시장 가정치 조회 (무위험이율, ERP 등) |

| val_dcf_sample | DCF 샘플 실행 (학습용 예시) |

| val_peer_comparison_sample | Peer 비교 샘플 |

| val_refresh_market_data | 시장 데이터 갱신 |


[table 8]

| 분류 | 서버 | 도구 수 | 주요 기능 |

| 한국 매크로 | 한국은행 (ECOS) | 7 | 금리, 환율, GDP, M2 |

| 한국 통계 | 통계청 (KOSIS) | 5 | 인구, 실업률, 주택가격 |

| 한국 부동산 | 부동산원 (R-ONE) | 7 | 매매/전세지수, 실거래가, PIR |

| 한국 주식 | KRX/pykrx | 5 | 시세, 베타, PER, PBR |

| 한국 뉴스 | 네이버 | 4 | 뉴스 검색, 심리 분석 |

| 한국 금융위 | FSC | 2 | 주가, 채권 |

| 한국 정치 | 열린국회 | 3 | 금융 법안 검색 |

| 한국 농산물 | KAMIS/FAO | 4 | 농산물 도매가 |

| 한국 무역 | 관세청 | 3 | 수출/수입 |

| 미국 주식 | Finnhub | 4 | 시세, 기업 프로필, 경제캘린더 |

| 글로벌 매크로 | WB/IMF/OECD/BIS | 6 | 국가별 경제지표 |

| 글로벌 뉴스 | GDELT | 3 | 100개국 뉴스 모니터링 |

| 크립토 | 업비트/바이낸스 | 11 | 시세, 김치프리미엄, 호가 |

| DeFi | DefiLlama | 4 | TVL, 공포탐욕지수 |

| 온체인 | Etherscan | 3 | 지갑 잔액, 가스비 |

| 예측시장 | Polymarket | 3 | 이벤트 확률 |

| 밸류에이션 | 자체 엔진 | 10 | DCF, Peer, WACC, 민감도 |

| 시각화 | 자체 엔진 | 10 | 차트 10종 |

| 에너지 | EIA | 3 | WTI, 천연가스 |

| 해운 | 해운 API | 4 | BDI, 컨테이너 운임 |

| 항공 | 항공 API | 3 | 실시간 항공기 |

| 특허 | 특허 API | 2 | 기술 트렌드 |

| 학술 | arXiv/S.Scholar/OpenAlex | 9 | 논문, 인용, 저자 프로필 |

| 날씨 | 날씨 API | 2 | 도시별 예보 |