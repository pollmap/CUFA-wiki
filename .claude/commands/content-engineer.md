# /content-engineer — 금융 문서 작성 에이전트

새로운 금융 위키 문서를 작성할 때 이 명령어를 사용하세요. 분석 엔지니어처럼 체계적으로 문서를 작성하고, 리뷰하고, 검증합니다.

## 인자
- `$ARGUMENTS` — 작성할 문서 주제 또는 경로 (예: "industry-analysis/energy/key-metrics", "새로운 ETF 가이드 문서")

## 수행할 작업

### Phase 1: 설계
1. 기존 관련 문서 탐색 — 중복 방지, 참조할 내용 파악
2. 문서 구조 설계:
   - frontmatter (title, sidebar_label, description, keywords만 — **`id:` 절대 사용 금지**)
   - 목차 구성
   - 관련 페이지 링크 목록 (실제 존재하는 경로만 사용, `/docs/` 접두사 금지)
3. sidebars.js에서 어디에 배치할지 결정

### Phase 2: 작성
1. 한국어로 작성, 영어 기술 용어 병기 (예: 자기자본이익률(ROE))
2. 금융 데이터는 출처 명시
3. KaTeX 수학 공식 사용 (해당 시)
4. 실제 한국 기업/시장 사례 포함
5. 분량: 최소 150줄, 핵심 지표 문서는 200줄 이상

### Phase 3: 리뷰 & 검증
1. **링크 검증**: 문서 내 모든 내부 링크가 실제 존재하는 파일을 가리키는지 확인
2. **ID 검증**: frontmatter에 `id:` 필드가 없는지 확인
3. **사이드바 등록**: sidebars.js에 새 문서 추가
4. **빌드 테스트**: `cd wiki && npm run build` 실행하여 broken link 및 sidebar 오류 확인
5. **빌드 실패 시 즉시 수정** 후 재빌드

### Phase 4: 커밋
1. 변경된 파일만 선택적으로 `git add`
2. 커밋 메시지: `feat(docs): Add {문서 주제}` 형식
