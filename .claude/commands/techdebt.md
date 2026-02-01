# /techdebt — 기술 부채 점검

세션 종료 전 또는 대규모 변경 후 이 명령어를 실행하여 기술 부채를 점검하세요.

## 수행할 작업

### 1. 빌드 검증
`cd wiki && npm run build 2>&1`를 실행하여:
- Broken link 경고/에러 모두 수집
- Sidebar doc ID 불일치 확인
- 빌드 실패 여부 확인

### 2. 중복 코드 탐지
다음 패턴의 중복을 검색하세요:
- `wiki/docs/` 내 동일하거나 거의 동일한 "관련 페이지" 섹션
- `wiki/src/components/` 내 중복된 React 컴포넌트 로직
- `sidebars.js`에서 같은 문서가 여러 카테고리에 중복 등록된 경우

### 3. 사용되지 않는 파일 탐지
- `wiki/docs/` 내 파일 중 `sidebars.js`에 등록되지 않은 문서 찾기
- `wiki/src/components/` 내 어디서도 import되지 않는 컴포넌트 찾기
- `wiki/static/` 내 어디서도 참조되지 않는 정적 파일 찾기

### 4. 내부 링크 일관성
- 모든 markdown/mdx 파일의 내부 링크에서 `/docs/` 접두사가 포함된 것이 없는지 확인 (routeBasePath가 '/'이므로 금지)
- frontmatter에 custom `id:`가 있는 문서 탐지 (경로 기반 ID와 불일치 유발)

### 5. 결과 보고
발견된 문제를 카테고리별로 정리하여 보고하세요:
- **[Critical]** 빌드 실패 또는 broken link
- **[Warning]** 중복 코드, 미등록 문서
- **[Info]** 개선 가능한 사항

수정 가능한 항목은 즉시 수정하고, 대규모 변경이 필요한 항목은 목록으로 정리하세요.
