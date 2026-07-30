# CLAUDE.md

이 저장소에서 작업할 때 지켜야 할 규칙. 사람과 에이전트 모두에게 적용된다.

## 프로젝트

개인 포트폴리오 사이트. Next.js App Router 기반이며 Vercel에 배포된다.
콘텐츠 일부는 Notion에서 가져오고, 관리자 화면과 문의 폼을 직접 운영한다.

| 영역 | 사용 기술 |
|---|---|
| 프레임워크 | Next.js (App Router), React, TypeScript |
| 스타일 | Tailwind CSS, `next-themes` |
| 인증 | NextAuth (`auth.ts`, `middleware.ts`) |
| 콘텐츠 | Notion API (`lib/notion.ts`, `lib/posts.ts`) |
| 코드 하이라이팅 | Shiki |
| 레이트리밋 | Upstash + in-memory 폴백 (`lib/rateLimit.ts`) |
| 배포 | Vercel (`main` 병합 시 프로덕션) |

## 디렉터리

```
app/
  (site)/        공개 페이지
  admin/         관리자 화면 (인증 필요)
  api/           라우트 핸들러
  resume/        이력서
components/      UI 컴포넌트 (admin / blog / contact / home / projects)
lib/             데이터 접근·유틸 (notion, posts, rateLimit, notify, …)
config/          사이트 설정
class/           Tailwind 색상 헬퍼
styles/          전역 CSS
```

## 개발 명령

Node **22** (`.nvmrc`). 패키지 매니저는 **npm**을 쓴다 — CI가 `npm ci`로 동작하고
`package-lock.json`이 정본이다. `pnpm`으로 설치하지 말 것.

```bash
npm ci          # 의존성 설치 (lockfile 기준)
npm run dev     # 개발 서버
npm run lint    # ESLint
npm run build   # 프로덕션 빌드 (타입 검사 포함)
```

## 품질 게이트

**작업 완료의 판정 기준은 다음 두 명령이 모두 통과하는 것이다.**

```bash
npm run lint && npm run build
```

CI(`.github/workflows/ci.yml`)가 PR과 `dev`/`main` push마다 같은 검사를 돌린다.
로컬에서 통과하지 못한 변경은 PR로 올리지 않는다.

## 브랜치 흐름

```
feature 브랜치  →  dev  →  main (프로덕션)
```

- 작업은 항상 **`origin/dev`에서 브랜치를 딴다.** `main`에서 따지 않는다
- `dev` → `main` 승격 PR은 `promote.yml`이 자동 생성한다. **병합은 사람이 한다**
- `main`에 직접 push하지 않는다. force-push하지 않는다

### 브랜치 이름

```
<type>/<이슈번호>-<slug>
```

예: `feat/82-rss-feed`, `ci/93-dependabot`, `chore/122-issue-loop`

이슈가 없으면 **먼저 이슈를 만든다.** 번호 없는 브랜치는 만들지 않는다.

## 커밋 메시지

Conventional Commits + 한국어 설명. 이슈 번호를 붙인다.

```
<type>(<scope>): 한국어 설명 (#이슈번호)
```

예:
```
feat(contact): 내구성 레이트리밋(Upstash) + in-memory 폴백 (#54)
ci: Dependabot로 의존성·GitHub Actions 자동 업데이트 등록 (#93)
chore(deps): Tailwind CSS 3 → 4 (#111)
```

`type`은 라벨과 같은 어휘를 쓴다: `feat` `fix` `chore` `ci` `docs` `refactor`

## PR 규칙

- **모든 PR은 이슈에 연결한다.** 본문에 `Closes #<번호>`
- base는 항상 `dev`
- 다른 기능 브랜치 위에 PR을 쌓지 않는다 (stacked PR 금지). 각 PR은 `dev` 기준
- 이슈와 PR 양쪽에 목적에 맞는 라벨을 단다
- PR 설명에는 내부 약어를 쓰지 않는다. diff만 보고도 검증 가능하게 쓴다

## 금지 사항

- `main` 직접 push / force-push / 브랜치 삭제
- PR 자동 병합 — **병합은 언제나 사람이 한다**
- `.env`, `.env.local` 등 시크릿 파일 커밋 또는 내용 출력
- 잠긴(locked) 워크트리나 다른 브랜치의 작업 공간 수정
- `package-lock.json`을 무시한 의존성 추가 (`npm ci` 기준 유지)

## 자동화 에이전트 규칙

이 저장소는 이슈를 자동 처리하는 루프를 운영한다 (`.claude/skills/issue-loop/`).
에이전트로 동작할 때는 위 규칙에 더해 다음을 지킨다.

1. **매 실행은 빈 컨텍스트에서 시작한다고 가정한다.** 이전 실행의 기억에 의존하지 말고
   `docs/loop/STATE.md`·이슈·PR에서 필요한 맥락을 다시 읽는다
2. **한 실행에 이슈 하나만 처리한다.** 여러 이슈를 묶지 않는다
3. **작업 전 반드시 워크트리를 만든다.** 기존 체크아웃에서 직접 편집하지 않는다
4. **판정 기준을 임의로 완화하지 않는다.** `lint`·`build`가 통과하지 않으면 PR을 열지 않는다
5. **막히면 넘긴다.** 해결 못 하는 이슈는 이유를 코멘트로 남기고 `needs-human` 라벨을 단다.
   이것은 실패가 아니라 정상 종료 경로다
6. 판정 기준은 `docs/loop/TRIAGE.md`, 우선순위는 `docs/loop/PRIORITY.md`를 따른다
