# /sync — 프로젝트 컨텍스트 동기화

세션 시작 시 이 명령어를 실행하여 프로젝트 현황을 한 번에 파악하세요.

## 수행할 작업

### 1. Git 현황
- `git log --oneline -20` — 최근 커밋 20개
- `git status` — 변경된 파일
- `git branch -a` — 브랜치 목록
- `git diff --stat HEAD~5` — 최근 5커밋 변경 규모

### 2. GitHub Issues & PRs
- `gh issue list --limit 10` — 열린 이슈
- `gh pr list --limit 10` — 열린 PR
- `gh pr checks` — 현재 브랜치 CI 상태 (해당 시)

### 3. 프로젝트 규모 파악
- `find wiki/docs -name '*.md' -o -name '*.mdx' | wc -l` — 총 문서 수
- `wc -l wiki/sidebars.js` — 사이드바 규모
- 사이드바 카테고리별 문서 수 집계

### 4. 빌드 상태
- `cd wiki && npm run build 2>&1 | tail -5` — 빌드 성공 여부 빠르게 확인

### 5. 최근 변경 영향도
- 최근 커밋에서 변경된 주요 파일 목록
- broken link 또는 빌드 경고가 있는지 확인

### 6. 결과 요약
위 정보를 간결하게 요약하여 보고:
- 프로젝트 현재 상태 (문서 수, 빌드 상태, 열린 이슈)
- 최근 작업 히스토리
- 즉시 주의가 필요한 사항
