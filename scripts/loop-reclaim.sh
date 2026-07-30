#!/usr/bin/env bash
#
# loop-reclaim.sh — 루프가 남긴 작업 공간을 회수한다.
#
# 루프는 이슈마다 워크트리와 브랜치를 만든다. PR이 병합되거나 에이전트가 중간에
# 죽으면 그것들이 남는다. 남은 브랜치는 다음 실행의 `git worktree add -b`를
# 실패시켜 **같은 이슈를 영구 교착**시킨다. 이 스크립트가 그것을 푼다.
#
# 사용법:
#   scripts/loop-reclaim.sh           무엇을 회수할지 보여주기만 한다 (기본)
#   scripts/loop-reclaim.sh --apply   실제로 회수한다
#
# 안전 규칙 (넘지 않는다):
#   - 잠긴(locked) 워크트리는 건드리지 않는다
#   - 루프 명명 규칙에 맞는 것만 대상: issue-<숫자> / review-<숫자>
#     (`issue-loop` 같은 사람이 만든 워크트리는 숫자가 아니므로 제외된다)
#   - 커밋이 남은 브랜치는 **삭제하지 않는다.** abandoned/ 로 이름만 바꿔 비켜준다
#   - 리모트 브랜치는 건드리지 않는다 (PR 이력이 걸려 있다)
#
# 종료 코드:
#   0  정상 (회수했거나 회수할 것이 없음)
#   2  실행 오류

set -uo pipefail

REPO="${LOOP_REPO:-SejuneOh/Portfolio}"
STALE_HOURS="${LOOP_STALE_HOURS:-2}"
WT_DIR=".claude/worktrees"

APPLY=0
[ "${1:-}" = "--apply" ] && APPLY=1

die() { echo "ERROR: $*" >&2; exit 2; }
act() { if [ $APPLY -eq 1 ]; then eval "$1"; else echo "      (dry-run) $1"; fi; }

command -v gh >/dev/null 2>&1 || die "gh CLI가 없습니다."
git rev-parse --git-dir >/dev/null 2>&1 || die "git 저장소가 아닙니다."

ROOT=$(git rev-parse --show-toplevel)
# 워크트리 안에서 실행돼도 본체 기준으로 동작해야 한다.
MAIN=$(git worktree list --porcelain | awk '/^worktree /{print $2; exit}')
cd "$MAIN" || die "본체 워크트리로 이동 실패: $MAIN"

echo "=== loop-reclaim ==="
echo "repo       : ${REPO}"
echo "본체       : ${MAIN}"
echo "stale 기준 : ${STALE_HOURS}시간"
echo "모드       : $([ $APPLY -eq 1 ] && echo '실제 회수' || echo 'dry-run — 보여주기만')"
echo

git fetch origin --quiet 2>/dev/null || true

# PR 상태를 조회한다. 출력: MERGED | CLOSED | OPEN | NONE
pr_state_of() {
  local br="$1" st
  st=$(gh pr list --repo "$REPO" --head "$br" --state all \
         --json state --jq '.[0].state // "NONE"' 2>/dev/null)
  echo "${st:-NONE}"
}

# 이 브랜치의 PR을 루프가 만들었는가? (agent-loop 라벨로 판별)
# 사람이 만든 브랜치를 지우지 않기 위한 방어선이다.
is_loop_branch() {
  local br="$1" has
  has=$(gh pr list --repo "$REPO" --head "$br" --state all \
          --json labels --jq '[.[0].labels[]?.name] | index("agent-loop") // empty' 2>/dev/null)
  [ -n "$has" ]
}

# 브랜치에만 있는 커밋 수 (dev/main 어느 쪽에도 없는 것)
unique_commits_of() {
  git rev-list --count "$1" --not origin/dev origin/main 2>/dev/null || echo 0
}

reclaimed=0
kept=0

# ---------------------------------------------------------------------------
# 1. 워크트리 회수
# ---------------------------------------------------------------------------
echo "--- 워크트리 ---"

# porcelain 출력을 워크트리 단위로 읽는다.
current_wt=""; current_br=""; current_locked=0
process_wt() {
  [ -z "$current_wt" ] && return

  local name; name=$(basename "$current_wt")

  # 루프가 만든 것만 대상으로 한다.
  if ! [[ "$name" =~ ^(issue|review)-[0-9]+$ ]]; then
    return
  fi

  if [ "$current_locked" -eq 1 ]; then
    echo "  ${name}: 유지 — 잠김(locked)"
    kept=$((kept+1)); return
  fi

  local br="${current_br#refs/heads/}"
  local st; st=$(pr_state_of "$br")
  local uniq; uniq=$(unique_commits_of "$br")

  case "$st" in
    OPEN)
      echo "  ${name}: 유지 — PR 열림 (브랜치 ${br})"
      kept=$((kept+1))
      ;;
    MERGED|CLOSED)
      echo "  ${name}: 회수 — PR ${st} (브랜치 ${br}, 고유 커밋 ${uniq})"
      act "git worktree remove --force '$current_wt'"
      act "git branch -D '$br'"
      reclaimed=$((reclaimed+1))
      ;;
    NONE)
      # PR이 없다 = 에이전트가 PR을 열기 전에 죽었을 가능성.
      local age_h=99
      if [ -d "$current_wt" ]; then
        local mt; mt=$(stat -c %Y "$current_wt" 2>/dev/null || echo 0)
        age_h=$(( ( $(date -u +%s) - mt ) / 3600 ))
      fi
      if [ "$age_h" -lt "$STALE_HOURS" ]; then
        echo "  ${name}: 유지 — PR 없음이나 ${age_h}시간 경과 (기준 미만, 작업 중일 수 있음)"
        kept=$((kept+1))
      elif [ "$uniq" -gt 0 ]; then
        echo "  ${name}: 회수 — PR 없음, ${age_h}시간 경과. 커밋 ${uniq}개는 abandoned/ 로 보존"
        act "git worktree remove --force '$current_wt'"
        act "git branch -m '$br' 'abandoned/$br'"
        reclaimed=$((reclaimed+1))
      else
        echo "  ${name}: 회수 — PR 없음, ${age_h}시간 경과, 커밋 없음"
        act "git worktree remove --force '$current_wt'"
        act "git branch -D '$br'"
        reclaimed=$((reclaimed+1))
      fi
      ;;
  esac
}

while IFS= read -r line; do
  case "$line" in
    worktree\ *) process_wt; current_wt="${line#worktree }"; current_br=""; current_locked=0 ;;
    branch\ *)   current_br="${line#branch }" ;;
    locked*)     current_locked=1 ;;
    "")          process_wt; current_wt="" ;;
  esac
done < <(git worktree list --porcelain; echo "")

[ $reclaimed -eq 0 ] && [ $kept -eq 0 ] && echo "  루프가 만든 워크트리 없음"

echo

# ---------------------------------------------------------------------------
# 2. 워크트리 없이 남은 브랜치 (교착의 직접 원인)
# ---------------------------------------------------------------------------
echo "--- 고아 브랜치 ---"

in_use=$(git worktree list --porcelain | awk '/^branch /{sub("refs/heads/","",$2); print $2}')
orphans=0

while IFS= read -r br; do
  [ -z "$br" ] && continue
  # 보호 브랜치와 보존용 이름은 제외
  case "$br" in main|dev|abandoned/*) continue ;; esac
  # 루프 명명 규칙: <type>/<숫자>-... 또는 hotfix/<숫자>-...
  [[ "$br" =~ ^(feat|fix|chore|ci|docs|refactor|hotfix)/[0-9]+- ]] || continue
  # 워크트리가 쓰고 있으면 위 단계가 처리한다
  echo "$in_use" | grep -qx "$br" && continue

  st=$(pr_state_of "$br")
  uniq=$(unique_commits_of "$br")

  case "$st" in
    OPEN)
      echo "  ${br}: 유지 — PR 열림"
      ;;
    MERGED|CLOSED)
      if ! is_loop_branch "$br"; then
        echo "  ${br}: 유지 — PR ${st}이나 agent-loop 라벨 없음 (사람이 만든 브랜치)"
        continue
      fi
      echo "  ${br}: 회수 — 루프 PR ${st}"
      act "git branch -D '$br'"
      orphans=$((orphans+1))
      ;;
    NONE)
      # PR이 없으면 라벨로 판별할 수 없다. 잃을 것이 없을 때만 손댄다.
      if [ "$uniq" -gt 0 ]; then
        echo "  ${br}: 유지 — PR 없음, 고유 커밋 ${uniq}개. 사람 작업일 수 있어 손대지 않는다"
        continue
      fi
      if git rev-parse --verify --quiet "origin/${br}" >/dev/null; then
        echo "  ${br}: 유지 — 리모트에 존재 (푸시된 브랜치)"
        continue
      fi
      echo "  ${br}: 회수 — PR 없음, 고유 커밋 없음, 미푸시 (잃을 것 없음)"
      act "git branch -D '$br'"
      orphans=$((orphans+1))
      ;;
  esac
done <<< "$(git for-each-ref --format='%(refname:short)' refs/heads/)"

[ $orphans -eq 0 ] && echo "  회수 대상 브랜치 없음"

echo
act "git worktree prune"

echo
echo "=== 요약 ==="
echo "워크트리 회수 : ${reclaimed}   유지: ${kept}"
echo "브랜치 회수   : ${orphans}"
[ $APPLY -eq 0 ] && echo && echo "dry-run이었습니다. 실제로 회수하려면 --apply 를 붙이세요."
exit 0
