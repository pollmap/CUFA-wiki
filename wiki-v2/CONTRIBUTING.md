# Contributing to CUFA wiki v2

기여해 주셔서 감사합니다. wiki-v2는 Next.js 15 기반 리빌드 프로젝트이며,
`../CONTRIBUTING.md` 레포 공통 규칙의 하위 부속 문서입니다.

## 이슈 작성

PR을 올리기 전에 이슈를 먼저 확인/등록하세요.

- **버그 리포트**: 재현 단계 / 기대 동작 / 실제 동작 / 환경(Node/브라우저/OS) / 스크린샷
- **기능 제안**: 문제 정의 → 대안 비교 → 제안안. 아키텍처 변경이면 RFC로 작성
- **보안 이슈**: 공개 이슈 금지. [`SECURITY.md`](./SECURITY.md) 참조
- **콘텐츠 수정**: `content/` 하위 MDX 파일. 출처/근거 필수

중복 이슈 피하기 위해 검색 먼저. 라벨로 분류: `bug` / `feat` / `docs` / `content` / `good-first-issue`.

## PR 흐름

1. **Fork & Branch**
   ```bash
   gh repo fork pollmap/CUFA-wiki-update --clone
   cd CUFA-wiki-update/wiki-v2
   git checkout -b feat/your-feature
   ```

2. **로컬 개발 setup** — 아래 섹션 참조

3. **작업 + 테스트**
   - 작은 단위로 커밋 (한 커밋 = 한 논리 변경)
   - 타입 체크 / 린트 / 빌드 모두 통과
   - 새 기능은 테스트 추가 (목표 커버리지 80%)

4. **PR 생성**
   - base: `main`
   - 템플릿 따라 작성 (변경 요약 / 테스트 계획 / 스크린샷 / 체크리스트)
   - `quality:check` CI 통과 필수 (grep-ban + lint + build + test)

5. **리뷰 & 머지**
   - 최소 1명 maintainer 승인
   - `squash merge` 사용 (히스토리 정결)
   - 피드백은 24~72시간 내 반영

## 커밋 메시지

Conventional Commits 준수:

```
<type>[(scope)]: <description>

[body]
```

| Type       | 용도                               |
|------------|------------------------------------|
| `feat`     | 새 기능                            |
| `fix`      | 버그 수정                          |
| `refactor` | 동작 변경 없는 구조 개선           |
| `docs`     | 문서 / MDX 콘텐츠                  |
| `test`     | 테스트 추가/수정                   |
| `chore`    | 빌드/의존성/설정                   |
| `perf`     | 성능 개선                          |
| `ci`       | CI/CD 파이프라인                   |

예: `feat(mcp): Luxon 브리지 Zod 스키마 추가`, `fix(learn): 다크모드 차트 렌더링`.

## 로컬 개발 Setup

### 요구사항
- Node.js 20+ (LTS 권장)
- npm 10+ (또는 pnpm 9+)
- Git

### 설치 & 실행
```bash
cd wiki-v2
npm install
cp .env.example .env.local   # 값 채우기 (실제 값 커밋 금지)
npm run dev                  # http://localhost:3000
```

### 주요 스크립트
```bash
npm run build       # velite build && next build
npm run typecheck   # tsc --noEmit (strict)
npm run lint        # ESLint (Next.js 설정)
npm run test        # (Phase 2+ 추가 예정)
npm run quality     # scripts/quality-check.ts (Evaluator)
```

### 환경 변수
모든 키는 `.env.example`에 placeholder로 선언되어 있음. `.env.local`에
실제 값 작성. 절대 실제 값을 커밋하지 말 것.

## 코드 스타일

- **TypeScript strict**: `any` 지양, 제네릭 활용
- **Immutability**: 객체 mutation 금지 (`const`, spread, `Readonly<T>`)
- **파일 크기**: 파일 200~400줄, 최대 800줄. 함수 <50줄. nesting <4단계
- **ESLint + Prettier**: PR 전 `npm run lint -- --fix` 실행
- **Tailwind v4**: shadcn/ui 컴포넌트 먼저 검토, 없을 때만 커스텀
- **MDX 콘텐츠**: Velite 스키마 준수 (`velite.config.ts`)
- **차트**: Recharts 우선, 저수준은 Lightweight Charts
- **네이밍**: 컴포넌트 `PascalCase`, hook `useXxx`, util `camelCase`, 파일 `kebab-case.tsx`

## 금지 사항

다음이 포함된 PR은 거부:

- API 키 / 토큰 / 비밀번호 등 민감 정보 하드코딩
- VPS IP / 사용자 경로 / 실명 / 실이메일
- 악성 코드 (backdoor, miner, 외부 C&C)
- 저작권 침해 콘텐츠 (이미지, 차트, 문서)
- 검증되지 않은 투자 조언 / 종목 추천
- 스팸 / 광고 / 정치·종교 콘텐츠

## 콘텐츠 기여 (MDX)

`content/` 하위 교육 문서를 작성할 때:

1. **출처 명시**: 모든 수치 / 통계 / 인용에 출처 (DART, BOK, 논문 DOI 등)
2. **객관성**: 특정 종목 매매 추천 금지. 교육 목적 한정
3. **면책 조항**: 투자 관련 섹션에 면책 명시
4. **최신성**: 법규 / 세율 / 회계기준은 마지막 검토일 표기
5. **한국어 우선**: 전문용어는 영문 병기 가능 (최초 등장 시)
6. **KaTeX**: 수식은 MDX 내 `$...$` 또는 `$$...$$`

## 리뷰 프로세스

1. **자동 검사** (CI): 타입/린트/빌드/grep-ban 통과
2. **코드 리뷰** (1 maintainer 이상): 스타일 / 보안 / 성능
3. **콘텐츠 검토** (해당 시): 금융 정보 정확성
4. **머지** (squash): `feat(scope): 설명 (#PR번호)`

## 행동 강령

Contributor Covenant v2.1 준수. 상호 존중, 건설적 피드백, 괴롭힘 금지.
위반 시 maintainer가 경고 → 임시 차단 → 영구 차단 순으로 대응.

## 질문

- **GitHub Discussions**: 일반 질문 / 아이디어
- **GitHub Issues**: 구체적 버그 / 기능 요청
- **보안**: [`SECURITY.md`](./SECURITY.md)
