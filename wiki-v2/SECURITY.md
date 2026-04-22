# Security Policy — CUFA wiki v2

> CLAUDE.md 보안 규정 v1 (2026-04-20) 준수. `../SECURITY.md` 상위 정책의 하위 부속 문서.

## Supported Versions

v2는 현재 활발히 개발 중이며, 최신 `main` 브랜치에서만 보안 패치가 제공됩니다.
v1 (Docusaurus, `../wiki/`)은 `pollmap.github.io/Value_Alpha/`에서 legacy로 유지됩니다.

| Version | Branch | Status            | Security Patches |
|---------|--------|-------------------|------------------|
| v2.x    | `main` | Active            | Yes (latest)     |
| v1.x    | legacy | Maintenance only  | Critical only    |

## Reporting a Vulnerability

취약점을 공개 이슈로 등록하지 말아 주세요. 다음 경로를 사용하세요:

1. **GitHub Security Advisories** (권장) — 이 저장소의 **Security → Report a vulnerability**
2. **이메일** — `<SECURITY_CONTACT_EMAIL>` (placeholder, 배포 전 실제 주소로 교체)

다음 정보를 포함해 주세요:

- 영향받는 파일/경로 및 버전 (커밋 SHA)
- 재현 단계 (PoC 포함 시 private gist 링크)
- 예상 영향 범위 (기밀성/무결성/가용성)
- 제안된 수정안 (선택)

## Response SLA

| Severity     | Ack     | Fix            | Disclosure       |
|--------------|---------|----------------|------------------|
| **Critical** | 24시간  | 72시간 이내    | 패치 배포 후 7일 |
| **High**     | 48시간  | 2주 이내       | 패치 배포 후 14일|
| **Medium**   | 5일     | 다음 릴리즈    | 릴리즈 노트에 공개 |
| **Low**      | 10일    | best-effort    | Changelog에 언급 |

Responsible disclosure: 패치 릴리즈 전까지 공개 금지. Ack 후 90일 내 수정
불가 시 협의하에 조정된 시점에 공개.

## Scope

**In scope**
- `wiki-v2/` 하위 모든 코드 (Next.js 앱, MCP 브리지, 스크립트)
- `public/`, `content/`, `research/` 빌드 산출물
- `next.config.ts` 보안 헤더 / CSP
- `/api/*` 엔드포인트

**Out of scope**
- `../wiki/` (v1 legacy)
- 제3자 라이브러리 취약점 (해당 업스트림에 제보)
- 사회공학 / 물리적 공격 / DoS 부하 테스트
- 스팸 / 스크래핑

## Security Controls (CLAUDE.md v1 요약)

- 웹 5헤더: `X-Frame-Options: DENY` / `X-Content-Type-Options: nosniff` /
  `Referrer-Policy` / `Permissions-Policy` / `Strict-Transport-Security` + CSP
- Rate limiting: `@upstash/ratelimit` (MCP/AI/Auth/Email/DB write 전 엔드포인트)
- Zod 입력 검증: 모든 `route.ts`에 스키마 + `safeParse` + DoS 상한
- CORS: `*` 와일드카드 금지, `allow_headers` 명시 헤더만
- 환경변수: 하드코딩 금지 (`<MCP_VPS_HOST>`, `<your-key>` placeholder 사용)
- Prompt injection: 클라이언트 `systemPrompt` 주입 금지, MCP 도구 화이트리스트
- Pre-commit grep-ban: VPS IP / 사용자 경로 / 실명 / 토큰 패턴 차단
- 분기별 API 키 회전: 1/1, 4/1, 7/1, 10/1

## Secret Exposure Protocol

민감 정보(API 키, 토큰, 비밀번호)가 커밋된 경우:

1. **즉시 해당 credential 무효화 (revoke)** — purge 이전에 반드시
2. 새 credential 발급 + 환경변수/secret manager 저장
3. Git history 정리는 team 공지 + `git clone --mirror` 백업 후
4. GitHub Support에 cache purge 요청

## 관련 문서

- 상위 정책: [`../SECURITY.md`](../SECURITY.md)
- 기여 가이드: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- 보안 규정 원문: `~/.claude/projects/C--Users-lch68/memory/feedback_security_regulations_2026_04_20.md`
