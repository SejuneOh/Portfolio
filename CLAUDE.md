# CLAUDE.md

이 저장소에서 작업할 때 지켜야 할 규칙. 사람과 에이전트 모두에게 적용된다.

## 프로젝트

개인 포트폴리오 사이트. Next.js App Router 기반이며 Vercel에 배포된다.
콘텐츠 일부는 Notion에서 가져오고, 관리자 화면과 문의 폼을 직접 운영한다.

| 영역 | 사용 기술 |
|---|---|
| 프레임워크 | Next.js (App Router), React, TypeScript |
| 스타일 | Tailwind CSS, `next-themes` |
| 인증 | NextAuth (`auth.ts`, `proxy.ts`) |
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

- 작업은 **`origin/dev`에서 브랜치를 딴다.** (핫픽스만 예외 — 아래 참조)
- `dev` → `main` 승격 PR은 `promote.yml`이 자동 생성한다. **병합은 사람이 한다**
- `main`에 직접 push하지 않는다. force-push하지 않는다

### 핫픽스

프로덕션 장애처럼 `dev`를 거칠 수 없는 경우에만 쓴다.
이슈에 `priority` 라벨이 붙은 것이 판단 기준이다.

```
hotfix 브랜치  →  main (프로덕션)
              →  dev  (동기화)
```

- 베이스는 **`origin/main`**. `dev`에서 따면 아직 배포되지 않은 변경이 함께 나간다
- 브랜치 이름은 `hotfix/<이슈번호>-<slug>`
- **PR을 2개 만든다** — `main` 병합용, `dev` 동기화용. 같은 브랜치에서 base만 다르게
- `dev` 동기화 PR을 빠뜨리면 다음 승격 PR에서 핫픽스가 되돌려지거나 충돌한다
- 병합 순서는 `main` → `dev`. **둘 다 사람이 병합한다**

### 브랜치 이름

```
<type>/<이슈번호>-<slug>        일반
hotfix/<이슈번호>-<slug>        핫픽스
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

이 저장소는 이슈를 자동 처리하는 루프를 운영한다. **작성과 검사를 분리한다.**

| 정의 | 역할 | 작업 공간 | 쓰기 |
|---|---|---|---|
| `.claude/skills/issue-loop/` | 이슈를 골라 작업하고 PR을 연다 | `.claude/worktrees/issue-<N>` | 커밋·푸시 |
| `.claude/agents/issue-reviewer.md` | 그 PR을 검사한다 | `.claude/worktrees/review-<N>` (detach) | **코멘트만** |

검사는 **서브에이전트**로 분리돼 있다. 컨텍스트가 나뉘므로 자기가 쓴 코드를 옹호할 수 없고,
정의에서 파일 편집 도구를 제거했으므로 코드를 고치는 것이 지시 위반이 아니라 불가능이다.
작업 공간도 분리돼 있어 서로의 파일을 덮어쓰지 않는다.

작업 공간 회수는 `scripts/loop-reclaim.sh`가 담당한다.
루프는 매 실행 시작 시 이것을 먼저 돌린다 — 남은 브랜치가 다음 실행을 막기 때문이다.
이 스크립트는 **실행 중인 자기 워크트리와 사람이 만든 워크트리는 건드리지 않는다.**

### 권한 설정

`.claude/settings.json`에 허용/차단 목록이 커밋되어 있다.
루프가 사람 없이 진행할 수 있도록 필요한 명령을 허용하고, 되돌리기 어려운 것은 차단한다.

차단 항목(`gh pr merge`, force-push, `git reset --hard`, `.env` 읽기 등)은
**절차 문서가 아니라 Claude Code가 강제**한다. 차단 규칙은 허용 규칙보다 먼저 평가되므로
허용 목록으로 뚫을 수 없고, `&&`로 이어 붙여도 각 부분이 따로 검사된다.

`settings.local.json`은 각자의 머신 기록이므로 커밋하지 않는다.
루프가 허용되지 않은 명령에서 멈추면, 권한을 전부 끄는 대신 그 명령을 허용 목록에 추가한다.

에이전트로 동작할 때는 위 규칙에 더해 다음을 지킨다.

1. **매 실행은 빈 컨텍스트에서 시작한다고 가정한다.** 이전 실행의 기억에 의존하지 말고
   `docs/loop/STATE.md`·이슈·PR에서 필요한 맥락을 다시 읽는다
2. **한 실행에 이슈 하나만 처리한다.** 여러 이슈를 묶지 않는다
3. **작업 전 반드시 워크트리를 만든다.** 기존 체크아웃에서 직접 편집하지 않는다
4. **판정 기준을 임의로 완화하지 않는다.** `lint`·`build`가 통과하지 않으면 PR을 열지 않는다
5. **막히면 넘긴다.** 해결 못 하는 이슈는 이유를 코멘트로 남기고 `needs-human` 라벨을 단다.
   이것은 실패가 아니라 정상 종료 경로다
6. 판정 기준은 `docs/loop/TRIAGE.md`, 우선순위는 `docs/loop/PRIORITY.md`를 따른다
7. **Next.js 16 은 학습 데이터와 다르다.** API·규약·파일 구조가 바뀌었다.
   Next 관련 코드를 쓰기 전에 `node_modules/next/dist/docs/` 의 해당 가이드를 읽고,
   빌드 출력의 deprecation 경고를 무시하지 않는다. 이미 바뀐 것들:
   `middleware.ts` → `proxy.ts`, `next lint` 제거(`eslint` 직접 호출), Edge Runtime deprecated

   Next 16 은 `next dev` 때 이 파일에 같은 취지의 블록을 스스로 써 넣으려 한다.
   그 자동 쓰기는 `next.config.js` 의 `agentRules: false` 로 껐다 — 이유는 그쪽 주석에 있다.
