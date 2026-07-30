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
REPO       = SejuneOh/Portfolio
BASE       = origin/dev
RUN_LOG    = 이슈 #122          # 모든 실행의 로그를 코멘트로 남기는 곳
LOCK_LABEL = in-progress
PR_LABEL   = agent-loop
```

## 절차

### 0. 게이트

```bash
scripts/loop-guard.sh --reap
```

죽은 락을 회수하고 진행 가능 여부를 판정한다.

- **종료 코드 1** (열린 `agent-loop` PR 있음) → **즉시 종료.**
  런 로그에 `게이트 차단`으로 기록하고 끝낸다. 다른 어떤 작업도 하지 않는다
- **종료 코드 2** (실행 오류) → 런 로그에 `실패`로 기록하고 종료
- **종료 코드 0** → 다음 단계

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

후보가 1개 이상이면 `docs/loop/PRIORITY.md`의 3단 정렬을 적용해 **하나만** 고른다.
탈락한 후보와 그 사유를 기록해 둔다 (런 로그에 남긴다).

### 4. 락

선택한 이슈에 `in-progress` 라벨을 단다.

```bash
gh issue edit <N> --repo SejuneOh/Portfolio --add-label in-progress
```

이 시점 이후 실패하면 **반드시 락을 해제**하거나, 해제하지 못한 채 종료했다면
다음 실행의 `--reap`이 2시간 뒤 회수한다.

### 5. 작업 공간

```bash
git fetch origin dev
git worktree add .claude/worktrees/issue-<N> -b <type>/<N>-<slug> origin/dev
```

- `<type>`은 이슈 라벨에서 가져온다 (`fix` `feat` `chore` `ci` `docs` `refactor`)
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
gh pr create --repo SejuneOh/Portfolio --base dev \
  --label agent-loop --label <type> \
  --title "<type>(<scope>): <한국어 설명> (#<N>)" \
  --body "..."
```

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
| 재시도 최대 2회 | 무한 왕복 방지 |
| 병합 금지 | 사람의 최종 검증이 마지막 방어선 |
| 항상 로그 | 아무것도 안 한 이유가 가장 중요한 정보 |

## 실행 방법

```bash
/issue-loop                 # 1회 실행
/loop 1h /issue-loop        # 1시간마다 반복
```

반복 실행 시 게이트가 대부분의 실행을 즉시 종료시킨다 — 정상이다.
**사람이 PR을 병합하는 속도가 곧 루프의 속도**가 된다.
