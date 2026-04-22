# CUFA wiki v2

> "현장 리서치 + AI 구조화" · Next.js 15 App Router · Luxon MCP · 6축 IA

**v2는 v1(Docusaurus 3.4)의 풀 리빌드입니다.** v1은 `../wiki/`에 유지되며
`pollmap.github.io/Value_Alpha/`에서 계속 서비스됩니다.

## 스택

- **프레임워크**: Next.js 15 · App Router · React 19
- **콘텐츠**: MDX + [Velite](https://velite.js.org) (타입 안전 스키마)
- **스타일**: Tailwind v4 · shadcn/ui (new-york)
- **차트**: Recharts · Lightweight Charts
- **검색**: Pagefind (Phase 1)
- **인증/DB**: 없음 (zero-config · localStorage 전용)
- **실시간 데이터**: Luxon nexus-finance-mcp 398도구 (env-guarded fallback)
- **댓글**: Giscus (env-guarded fallback)

## 6축 IA

| 축 | 경로 | 비고 |
|---|---|---|
| 학습 | `/learn` | 4-Layer + 자산별 + 상품 + 구조 + 행동/규제/역사/ESG |
| 기업·산업 | `/industries` | 5 산업 + 170+ 기업 + LIVE 공시 |
| 커리어 | `/career` | 직무/공모전/자격증 |
| 도구·데이터 | `/tools` | 35+ 계산기 + Live 대시보드 |
| 리서치 ★ | `/research` | CUFA 5 리서치 + 254 현장 노트 |
| MY | `/my` | 진도/북마크/배지 (보호) |

## Vercel 배포 (Production)

**1회성 대시보드 작업** (Vercel CLI/API로 자동화 불가):

1. Vercel Dashboard → 해당 프로젝트 → **Settings → General**
2. **Root Directory** 섹션에서 `wiki` → `wiki-v2` 로 변경 후 Save
3. (선택) **Build & Development Settings** 의 Override 항목이 있으면 **모두 체크 해제** — `wiki-v2/vercel.json` + `package.json` 자동 감지됨
4. **Deployments** 탭에서 "Redeploy" 클릭

이후 `main` branch push 는 자동 재배포됩니다. `wiki-v2/vercel.json`이 Next.js 프레임워크 선언과 build/install 명령을 담고 있어 대시보드 변경 직후부터 유효합니다.

### env 주입 (모두 선택 · 없어도 배포 성공)

- `MCP_VPS_HOST`, `MCP_AUTH_TOKEN` — Luxon 라이브 데이터 활성
- `NEXT_PUBLIC_GISCUS_REPO`, `_REPO_ID`, `_CATEGORY_ID` — 댓글 활성
- `NEXT_PUBLIC_MAPBOX_TOKEN` — 현장 노트 맵 활성

주입하지 않아도 placeholder UI로 빌드는 성공합니다. Supabase/NextAuth/OAuth는 v2에서 모두 제거되어 env 0건으로 운영 가능합니다.

## 로컬 개발

```bash
cd wiki-v2
npm install
npm run dev         # http://localhost:3000
npm run build       # velite build && next build
npm run typecheck   # tsc --noEmit
npm run lint
```

### 환경 변수
`.env.example` 복사 → `.env.local` 작성. **실제 값 커밋 금지.** 보안 규정 v1 준수.

### 콘텐츠 마이그레이션 (v1 → v2)
```bash
npm run migrate:docusaurus                    # dry-run, 리포트만
npm run migrate:docusaurus -- --apply         # 실제 쓰기
npm run migrate:docusaurus -- --only=foundation,assets
```

## 디렉토리

```
wiki-v2/
├─ app/                    # Next.js App Router
│  ├─ layout.tsx           # 루트 + 테마 + 헤더/푸터
│  ├─ page.tsx             # 히어로 + 3 페르소나
│  ├─ start/[slug]/        # 페르소나 랜딩
│  ├─ learn/               # 학습 축
│  ├─ industries/          # 기업·산업 축
│  ├─ career/              # 커리어 축
│  ├─ tools/               # 도구·데이터 축
│  ├─ research/            # 리서치 축 ★
│  ├─ my/                  # MY (보호, Phase 4)
│  └─ api/luxon/           # MCP 브리지 (Phase 2)
├─ components/
│  ├─ layout/              # 헤더 · 푸터
│  ├─ providers/           # 테마
│  ├─ ui/                  # shadcn
│  └─ learn|tools|live|ai/ # 도메인 컴포넌트
├─ content/                # MDX (Velite)
│  ├─ learn/  research/  career/  industries/companies/
├─ lib/                    # nav · utils · mcp-client · cache
├─ scripts/
│  ├─ migrate-from-docusaurus.ts
│  ├─ build-related.ts     # 자동 교차 링크
│  └─ quality-check.ts     # Evaluator CI
├─ velite.config.ts
├─ next.config.ts          # 보안 5헤더 + CSP + 301 리다이렉트
└─ tsconfig.json           # strict
```

## 보안 (CLAUDE.md 보안 규정 v1)

- 웹 5헤더: `X-Frame-Options` / `X-Content-Type-Options` / `Referrer-Policy` / `Permissions-Policy` / `HSTS` + CSP — `next.config.ts`에서 적용
- 환경변수만 사용 (VPS IP / 사용자 경로 / 실명 / 토큰 하드코딩 금지)
- Rate limit (Upstash) — Phase 2 MCP 브리지에서
- Zod 입력 검증 — 모든 API route
- Prompt injection 방어 (클라 systemPrompt 주입 금지, MCP 화이트리스트)
- 5종 세트는 레포 루트에서 승계: `LICENSE` / `README.md` / `.gitignore` / `SECURITY.md` / `CONTRIBUTING.md`
- PR 트리거 `quality:check` 에서 grep ban 재검증

## Phase 로드맵 (11주 6 Phase)

| Phase | 기간 | 산출물 |
|---|---|---|
| P0 | 1주 | **빈 프레임 배포** ← 현재 |
| P1 | 2주 | IA + 콘텐츠 이식 + Pagefind |
| P2 | 2주 | Luxon MCP Live 대시보드 + 기업 Live 위젯 |
| P3 | 1주 | 다크모드 · 모바일 · 인쇄 |
| P4 | 2주 | Supabase 진도 · MY 대시보드 · 자격증 모의고사 |
| P5 | 2주 | 5 리서치 풀 퀄리티 + 254 현장 노트 Map |
| P6 | 1주 | Giscus + 동아리 에디터 + **v2 공식 런칭** |

상세: 플랜 파일 (`~/.claude/plans/cufa-piped-kitten.md`).

## 라이선스
MIT (레포 루트 `LICENSE`).
