#!/usr/bin/env bash
#
# loop-guard.sh — 이슈 자동 처리 루프의 게이트.
#
# 루프 본문(.claude/skills/issue-loop/)이 작업을 시작하기 전에 호출한다.
# 모델의 판단에 맡기면 잊기 쉬운 두 가지를 결정적으로 처리한다.
#
#   1. 죽은 `in-progress` 락 회수 — 에이전트가 중간에 죽으면 라벨이 남아
#      해당 이슈가 영구 교착된다. 오래된 락을 해제한다.
#   2. 진행 중 작업 확인 — 열린 `agent-loop` PR이 있으면 새 작업을 시작하지 않는다.
#      사람이 병합해야 다음이 나가는 구조를 강제한다.
#
# 사용법:
#   scripts/loop-guard.sh            상태만 보고 (읽기 전용)
#   scripts/loop-guard.sh --reap     오래된 락을 실제로 해제한 뒤 상태 보고
#
# 종료 코드:
#   0  진행 가능 — 열린 agent-loop PR 없음
#   1  진행 불가 — 열린 agent-loop PR 있음 (루프는 여기서 종료해야 한다)
#   2  실행 오류 (gh 미설치, 인증 실패 등)

set -uo pipefail

REPO="${LOOP_REPO:-SejuneOh/Portfolio}"
LOCK_LABEL="${LOOP_LOCK_LABEL:-in-progress}"
PR_LABEL="${LOOP_PR_LABEL:-agent-loop}"
STALE_HOURS="${LOOP_STALE_HOURS:-2}"

REAP=0
[ "${1:-}" = "--reap" ] && REAP=1

die() { echo "ERROR: $*" >&2; exit 2; }

command -v gh >/dev/null 2>&1 || die "gh CLI가 없습니다."
gh auth status >/dev/null 2>&1 || die "gh 인증이 필요합니다: gh auth login"

echo "=== loop-guard ==="
echo "repo        : ${REPO}"
echo "stale 기준  : ${STALE_HOURS}시간"
echo "모드        : $([ $REAP -eq 1 ] && echo '회수 실행' || echo '읽기 전용')"
echo

# ---------------------------------------------------------------------------
# 1. 죽은 락 회수
# ---------------------------------------------------------------------------
echo "--- 락 점검 ---"

# --label 서버 필터는 검색 인덱스 지연을 타므로 쓰지 않는다 (게이트 주석 참조).
locked=$(gh issue list --repo "$REPO" --state open --limit 100 \
           --json number,labels \
           --jq ".[] | select([.labels[].name] | index(\"${LOCK_LABEL}\")) | .number" \
           2>/dev/null)

if [ -z "$locked" ]; then
  echo "락 걸린 이슈 없음"
else
  now=$(date -u +%s)
  for n in $locked; do
    # 연결된 열린 PR이 있으면 정상 작업 중이므로 유지한다.
    #
    # 주의: 본문에 "#<번호>"가 등장하는 것만으로 연결이라고 보면 안 된다.
    # `[Deploy] dev → main` 승격 PR은 포함된 커밋 제목을 모두 나열하고, 커밋 제목에는
    # 이슈 번호가 들어 있다. 그래서 아무 관계 없는 이슈가 "작업 중"으로 잘못 판정되고,
    # 락이 영원히 풀리지 않는다(실측 확인).
    #
    # 그래서 두 가지를 적용한다.
    #   1. 승격 PR(base=main, head=dev)은 대상에서 제외한다
    #   2. 연결로 인정하는 신호는 두 가지뿐이다
    #      - 본문에 이슈를 닫는 키워드(Closes/Fixes/Resolves)와 함께 번호가 있다
    #      - 브랜치 이름에 이슈 번호가 있다 (예: feat/54-auth-ratelimit)
    #      커밋 제목에 우연히 섞인 번호는 둘 중 어느 쪽에도 걸리지 않는다
    linked=$(gh pr list --repo "$REPO" --state open --limit 100 \
               --json number,body,baseRefName,headRefName \
               --jq "[.[]
                      | select((.baseRefName == \"main\" and .headRefName == \"dev\") | not)
                      | select(
                          (.body // \"\" | test(\"(close[sd]?|fix(e[sd])?|resolve[sd]?)[[:space:]]*:?[[:space:]]*#${n}([^0-9]|\$)\"; \"i\"))
                          or (.headRefName | test(\"(^|[^0-9])${n}([^0-9]|\$)\"))
                        )
                     ] | length" \
               2>/dev/null || echo 0)
    if [ "${linked:-0}" -gt 0 ]; then
      echo "#${n}: 유지 — 연결된 열린 PR 있음"
      continue
    fi

    # in-progress 라벨이 마지막으로 붙은 시각을 타임라인에서 찾는다.
    labeled_at=$(gh api "repos/${REPO}/issues/${n}/timeline" \
                   --paginate -H "Accept: application/vnd.github+json" \
                   --jq "[.[] | select(.event==\"labeled\" and .label.name==\"${LOCK_LABEL}\")] | last | .created_at" \
                   2>/dev/null)

    if [ -z "$labeled_at" ] || [ "$labeled_at" = "null" ]; then
      echo "#${n}: 유지 — 라벨 부착 시각을 확인할 수 없음"
      continue
    fi

    then_s=$(date -u -d "$labeled_at" +%s 2>/dev/null) || {
      echo "#${n}: 유지 — 타임스탬프 파싱 실패 (${labeled_at})"
      continue
    }
    age_h=$(( (now - then_s) / 3600 ))

    if [ "$age_h" -lt "$STALE_HOURS" ]; then
      echo "#${n}: 유지 — ${age_h}시간 경과 (기준 ${STALE_HOURS}시간 미만)"
      continue
    fi

    if [ $REAP -eq 1 ]; then
      gh issue edit "$n" --repo "$REPO" --remove-label "$LOCK_LABEL" >/dev/null 2>&1
      gh issue comment "$n" --repo "$REPO" --body \
"이전 자동 처리 시도가 완료되지 않아 \`${LOCK_LABEL}\` 락을 회수했습니다.

- 락 설정: ${labeled_at}
- 경과: 약 ${age_h}시간 (기준 ${STALE_HOURS}시간)
- 연결된 열린 PR: 없음

이 이슈는 다음 실행에서 다시 후보가 됩니다." >/dev/null 2>&1
      echo "#${n}: 회수됨 — ${age_h}시간 경과, 열린 PR 없음"
    else
      echo "#${n}: 회수 대상 — ${age_h}시간 경과 (--reap 필요)"
    fi
  done
fi

echo

# ---------------------------------------------------------------------------
# 2. 진행 중 작업 게이트
# ---------------------------------------------------------------------------
echo "--- 게이트 ---"

# `gh pr list --label` 은 GitHub 검색 인덱스를 쓴다. 라벨 제거가 인덱스에
# 반영되기까지 지연이 있어, 이미 떼어낸 라벨로도 PR이 걸린다(실측 확인).
# 게이트가 그걸 믿으면 루프가 영원히 차단된다.
# 그래서 서버 필터를 쓰지 않고, 열린 PR을 모두 받아 labels 필드로 직접 판정한다.
open_prs=$(gh pr list --repo "$REPO" --state open --limit 100 \
             --json number,title,labels \
             --jq ".[] | select([.labels[].name] | index(\"${PR_LABEL}\")) | \"#\(.number) \(.title)\"" \
             2>/dev/null)

if [ -n "$open_prs" ]; then
  echo "차단 — 열린 ${PR_LABEL} PR이 있습니다:"
  echo "$open_prs" | sed 's/^/  /'
  echo
  echo "결과: 진행 불가. 사람이 병합하거나 닫아야 다음 작업이 시작됩니다."
  exit 1
fi

echo "통과 — 열린 ${PR_LABEL} PR 없음"
echo
echo "결과: 진행 가능"
exit 0
