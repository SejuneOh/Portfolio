---
name: issue-loop
description: 열린 이슈를 트리아지해 자동 처리 가능한 것 하나를 골라 작업하고 PR을 연다. 병합은 하지 않는다. 반복 실행을 전제로 하며 매 실행은 빈 컨텍스트에서 시작한다고 가정한다.
---

# Issue Loop

이슈 하나를 처리해 PR까지 여는 **루프 1회분**의 절차.

## 전제

**이전 실행의 기억은 없다고 가정한다.** 필요한 맥락은 전부 다시 읽는다:

| 읽을 것 | 위치 |
|---|---|
| 레포 규칙 | `CLAUDE.md` |
| 판정 기준 | `docs/loop/TRIAGE.md` |
| 우선순위 | `docs/loop/PRIORITY.md` |
| 지난 실행 | `docs/loop/STATE.md` + 런 로그 이슈 코멘트 |

이 가정을 지켜야 나중에 GitHub Actions로 그대로 옮길 수 있다.

## 상수

```
REPO         = SejuneOh/Portfolio
BASE         = origin/dev        # 일반 작업
HOTFIX_BASE  = origin/main       # priority 라벨이 붙은 이슈
RUN_LOG      = 이슈 #122          # 모든 실행의 로그를 코멘트로 남기는 곳
LOCK_LABEL   = in-progress
PR_LABEL     = agent-loop
HOTFIX_LABEL = hotfix
REVIEW_PASS  = review-passed     # 검사 통과 — 사람 리뷰 대기
REVIEW_FAIL  = review-changes    # 검사 반려 — 작성 쪽이 다시 들어와야 함
```

## 두 개의 에이전트

작성과 검사는 **서로 다른 세션**에서 돈다. 이 스킬은 작성 쪽이다.

| | 작성 (`issue-loop`) | 검사 (`issue-review`) |
|---|---|---|
| 작업 공간 | `.claude/worktrees/issue-<N>` | `.claude/worktrees/review-<N>` (detach) |
| 쓰기 권한 | 있음 — 커밋·푸시 | **없음 — 코멘트만** |
| 브랜치 소유 | 만들고 푸시한다 | 만들지 않는다 |
| 병합 | 하지 않는다 | 하지 않는다 |

작업 공간이 분리돼 있어 서로의 파일을 덮어쓰지 않는다.
검사 쪽은 `--detach`로 체크아웃하므로 브랜치 이름도 경합하지 않는다.

## 절차

### 0. 회수와 게이트

```bash
scripts/loop-reclaim.sh --apply    # 작업 공간 회수 (워크트리·브랜치)
scripts/loop-guard.sh --reap       # 락 회수 + 진행 가능 판정
```

**회수를 먼저 돌린다.** 순서가 뒤바뀌면 안 된다 —
락만 풀리고 브랜치가 남아 있으면 5번에서 `worktree add`가 실패해
같은 이슈가 영원히 처리되지 않는다.

`loop-reclaim.sh`가 하는 일:

| 대상 | 조치 |
|---|---|
| PR이 병합·종료된 루프 워크트리 | 워크트리·브랜치 제거 |
| PR 없이 방치된 루프 워크트리 | 제거. 커밋이 남았으면 `abandoned/`로 이름만 바꿔 보존 |
| 워크트리 없이 남은 루프 브랜치 | 제거 (교착의 직접 원인) |
| 잠긴 워크트리, 사람 브랜치 | **건드리지 않는다** |

`loop-guard.sh --reap`이 죽은 락을 회수하고 진행 가능 여부를 판정한다.

- **종료 코드 2** (실행 오류) → 런 로그에 `실패`로 기록하고 종료
- **종료 코드 0** → 새 이슈를 집는다. 1번으로
- **종료 코드 1** (열린 `agent-loop` PR 있음) → 그 PR의 라벨을 본다

  | 차단한 PR의 라벨 | 조치 |
  |---|---|
  | `review-changes` | **재작업 경로로 간다** (8-2번). 새 이슈는 집지 않는다 |
  | 그 외 | **즉시 종료.** 런 로그에 `게이트 차단`으로 기록 |

  ```bash
  gh pr list --repo SejuneOh/Portfolio --label agent-loop --state open \
    --json number,labels --jq '.[0] | {n: .number, labels: [.labels[].name]}'
  ```

  검사에서 반려된 PR이 있으면 **그것을 고치는 것이 최우선**이다.
  고치지 않고 새 이슈를 집으면 반려된 PR이 영영 방치된다.

### 1. 이슈 수집

```bash
gh issue list --repo SejuneOh/Portfolio --state open \
  --json number,title,labels,body,createdAt --limit 50
```

### 2. 트리아지

각 이슈에 `docs/loop/TRIAGE.md`의 3관문을 **순서대로** 적용한다.

| 판정 | 조치 |
|---|---|
| 즉시 제외 | 아무것도 하지 않는다. 코멘트도 남기지 않는다 |
| 사람 필요 | `needs-human` 라벨 + **구체적 사유** 코멘트. 가능하면 쪼개는 방법도 제안 |
| 자동 처리 가능 | 후보 목록에 넣는다 |

이미 `needs-human`이 붙은 이슈에 **중복 코멘트를 달지 않는다.**

기준을 임의로 완화하지 않는다. **애매하면 사람 필요로 판정한다.**

### 3. 선택

후보가 0개면 → **정상 종료.** 런 로그에 `처리 대상 없음`으로 기록하고 끝낸다.
억지로 하나를 고르지 않는다.

후보 중 **`priority` 라벨이 붙은 것이 있으면 그것을 먼저 고른다** — 핫픽스 경로다.
여러 개면 그 안에서만 변경 범위 → 이슈 번호 순으로 하나를 정한다.

`priority`가 없으면 `docs/loop/PRIORITY.md`의 3단 정렬을 적용해 **하나만** 고른다.

어느 쪽이든 탈락한 후보와 그 사유를 기록해 둔다 (런 로그에 남긴다).

> **루프는 `priority` 라벨을 스스로 붙이지 않는다.** 사람만 붙인다.

### 4. 락

선택한 이슈에 `in-progress` 라벨을 단다.

```bash
gh issue edit <N> --repo SejuneOh/Portfolio --add-label in-progress
```

이 시점 이후 실패하면 **반드시 락을 해제**하거나, 해제하지 못한 채 종료했다면
다음 실행의 `--reap`이 2시간 뒤 회수한다.

### 5. 작업 공간

**일반 작업** — 베이스는 `origin/dev`:

```bash
git fetch origin dev
git worktree add .claude/worktrees/issue-<N> -b <type>/<N>-<slug> origin/dev
```

**핫픽스** (`priority` 라벨) — 베이스는 `origin/main`:

```bash
git fetch origin main
git worktree add .claude/worktrees/issue-<N> -b hotfix/<N>-<slug> origin/main
```

- `<type>`은 이슈 라벨에서 가져온다 (`fix` `feat` `chore` `ci` `docs` `refactor`)
- 베이스를 헷갈리지 않는다. 핫픽스를 `dev`에서 따면 아직 배포되지 않은 변경이 함께 프로덕션으로 나간다
- 기존 체크아웃에서 직접 편집하지 않는다
- 잠긴(locked) 워크트리는 건드리지 않는다

### 6. 작업

이슈에 적힌 완료 조건만 구현한다. **범위를 넓히지 않는다.**

작업 중 TRIAGE의 "사람 필요" 조건에 해당하는 것이 발견되면
(예: 인증 로직을 건드려야 함이 드러남) **즉시 중단하고 9번으로 간다.**

### 7. 검증

```bash
npm ci
npm run lint
npm run build
```

**둘 중 하나라도 실패하면 PR을 열지 않는다.**

- 원인이 자기 변경이면 고치고 다시 검증한다 (**최대 2회 재시도**)
- 2회 초과 또는 원인이 기존 코드면 → 9번(에스컬레이션)

### 8. PR 생성

```bash
git add -A
git commit -m "<type>(<scope>): <한국어 설명> (#<N>)"
git push -u origin <브랜치>
```

**일반 작업** — PR 1개, base `dev`:

```bash
gh pr create --repo SejuneOh/Portfolio --base dev \
  --label agent-loop --label <type> \
  --title "<type>(<scope>): <한국어 설명> (#<N>)" \
  --body "..."
```

**핫픽스** — PR **2개**를 같은 브랜치에서 만든다:

```bash
# ① main 병합 PR — 프로덕션 반영
gh pr create --repo SejuneOh/Portfolio --base main --head hotfix/<N>-<slug> \
  --label agent-loop --label hotfix --label priority \
  --title "hotfix: <한국어 설명> (#<N>)" \
  --body "..."   # Closes #<N> 포함

# ② dev 동기화 PR — dev가 main과 어긋나지 않게
gh pr create --repo SejuneOh/Portfolio --base dev --head hotfix/<N>-<slug> \
  --label agent-loop --label hotfix \
  --title "hotfix: <한국어 설명> — dev 동기화 (#<N>)" \
  --body "..."   # Closes 없이, ①번 PR 번호를 참조
```

두 PR 본문에 **서로의 번호를 적는다.** 사람이 병합 순서를 판단할 수 있어야 한다:
`main` 병합 → `dev` 동기화 순.

`Closes #<N>`는 **①번(main)에만** 넣는다. 양쪽에 넣으면 중복 연결이 된다.

PR 본문에 반드시 포함:

- `Closes #<N>`
- 변경 요약 (무엇을 왜)
- 검증 결과 (`lint` / `build` 통과)
- 리뷰어가 확인해야 할 지점

**PR 설명에 내부 약어를 쓰지 않는다.** diff만 보고 검증 가능하게 쓴다.

이어서 `docs/loop/STATE.md`에 실행 항목을 추가하고 같은 브랜치에 커밋·푸시한다.

#### 절대 하지 않는 것

- `gh pr merge` — **어떤 상황에서도 병합하지 않는다**
- `--admin`, force-push, `main` 직접 조작
- PR을 auto-merge로 설정

### 8-1. 검사 요청

PR을 연 뒤 **검사 전담 세션을 별도로 띄운다.** 직접 검사하지 않는다 —
자기가 쓴 코드를 자기가 검사하면 옹호하게 된다.

```bash
(cd <레포 경로> && claude --bg --name "review-<PR번호>" "/issue-review <PR번호>")
```

이 세션은 작성 과정을 모른 채 PR diff만 보고 판단한다. 그것이 검사가 성립하는 조건이다.

검사 세션은 **코멘트만 남긴다.** 코드를 고치지 않고 병합하지도 않는다.
결과에 따라 PR에 `review-passed` 또는 `review-changes` 라벨이 붙는다.

띄운 뒤 이번 실행은 여기서 끝난다. 검사 결과를 기다리지 않는다.

### 8-2. 재작업 (검사에서 반려된 경우)

게이트에서 `review-changes` 라벨이 붙은 PR을 발견했을 때 들어온다.

1. **반려 횟수를 센다**

   ```bash
   gh pr view <PR번호> --repo SejuneOh/Portfolio --json comments \
     --jq '[.comments[] | select(.body | test("검사 결과 — 반려"))] | length'
   ```

   **3회 이상이면 재작업하지 않는다.** 9번(에스컬레이션)으로 간다.
   무한 왕복을 막는 유일한 장치다.

2. **검사 코멘트를 읽는다.** 가장 최근 `## 검사 결과 — 반려` 코멘트가 기준이다

3. **지적된 것만 고친다.** 범위를 넓히지 않는다.
   동의하지 않는 지적이 있으면 고치지 말고 PR에 근거를 코멘트로 남긴다

4. 작업 공간은 PR 브랜치를 다시 체크아웃해 만든다

   ```bash
   git fetch origin <PR브랜치>
   git worktree add .claude/worktrees/issue-<N> <PR브랜치>
   ```

   `-b`를 쓰지 않는다. 브랜치는 이미 있다

5. 7번(검증)을 다시 통과시킨 뒤 같은 브랜치에 푸시한다

6. **`review-changes` 라벨을 제거**하고 8-1번으로 다시 검사를 요청한다

7. 10번(정리), 11번(런 로그)을 수행하고 끝낸다

### 9. 에스컬레이션 (정상 종료 경로)

처리하지 못했을 때. **실패가 아니다.**

1. `in-progress` 라벨 제거
2. `needs-human` 라벨 추가
3. 이슈에 코멘트 — 어디까지 했고, 무엇에 막혔고, 사람이 무엇을 판단해야 하는지
4. 작업 브랜치가 의미 있으면 남기고, 아니면 워크트리와 브랜치를 정리
5. 런 로그에 `에스컬레이션`으로 기록

### 10. 정리

```bash
git worktree remove .claude/worktrees/issue-<N>
```

푸시가 끝났으면 워크트리를 지운다. **만들기만 하고 치우지 않으면 계속 쌓인다.**
정리하지 못한 워크트리가 있으면 런 로그에 적어 다음 실행이 알 수 있게 한다.

### 11. 런 로그 기록 (모든 실행에서 수행)

결과와 무관하게 **항상** 이슈 #122에 코멘트를 남긴다.

```bash
gh issue comment 122 --repo SejuneOh/Portfolio --body "..."
```

형식:

```markdown
### 루프 실행 — <YYYY-MM-DD HH:MM>

- **결과:** PR 생성 | 게이트 차단 | 처리 대상 없음 | 에스컬레이션 | 실패
- **회수:** 없음 | #NN 락 해제
- **후보:** #NN, #NN
- **선택:** #NN — <PRIORITY 근거>
- **탈락:** #NN (사유)
- **검증:** lint ✅ build ✅
- **산출물:** PR #NN
- **비고:** <다음 실행이 알아야 할 것>
```

`STATE.md`는 PR 브랜치에만 커밋되므로 PR 없는 실행은 기록이 남지 않는다.
**런 로그가 모든 실행을 덮는 유일한 기록**이다.

## 안전 원칙 요약

| 원칙 | 이유 |
|---|---|
| 한 실행에 이슈 하나 | 실패 격리, 리뷰 부담 통제 |
| 애매하면 사람 | 기준 완화가 사고로 이어진다 |
| 검증 재시도 최대 2회 | 자기 변경을 못 고치면 넘긴다 |
| **검사 반려 최대 2회** | 작성 ⇄ 검사 무한 왕복 방지 |
| **작성과 검사는 다른 세션** | 같은 세션이면 자기 결과를 옹호한다 |
| **검사는 코멘트만** | 검사자가 고치면 검사자가 아니다 |
| **회수를 게이트보다 먼저** | 순서가 바뀌면 같은 이슈가 영구 교착된다 |
| 병합 금지 | 사람의 최종 검증이 마지막 방어선 |
| 항상 로그 | 아무것도 안 한 이유가 가장 중요한 정보 |

## 실행 방법

```bash
/issue-loop                 # 1회 실행
/loop 1h /issue-loop        # 1시간마다 반복
```

반복 실행 시 게이트가 대부분의 실행을 즉시 종료시킨다 — 정상이다.
**사람이 PR을 병합하는 속도가 곧 루프의 속도**가 된다.
