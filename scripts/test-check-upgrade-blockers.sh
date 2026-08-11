#!/usr/bin/env bash
#
# check-upgrade-blockers 워크플로의 보고 로직을 검사한다.
#
#   bash scripts/test-check-upgrade-blockers.sh
#
# 판별기(check-upgrade-blockers.mjs)는 후보를 실제로 설치하므로 몇 분이 걸린다.
# 여기서는 그 뒤에 오는 **보고 판단**만 본다 — 언제 알리고 언제 침묵하는가.
# 조용히 틀리기 가장 쉬운 부분이고, 실제 실행은 몇 주에 한 번이라 틀려도 늦게 발견된다.
#
# 로직은 워크플로에서 직접 읽어 온다. 여기에 복사해 두면 워크플로가 바뀌어도
# 이 검사는 옛 코드를 통과시킨다 — #240 의 하네스가 정규식을 복사해 두는 바람에
# 회귀를 못 잡았던 것과 같은 함정이다.

set -uo pipefail
WF=".github/workflows/check-upgrade-blockers.yml"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
FAIL=0

[ -f "$WF" ] || { echo "워크플로 파일이 없습니다: $WF"; exit 1; }

# ── 워크플로에서 node -p 표현식을 뽑아 온다 ─────────────────────────────
# 표현식이 바뀌면 이 검사도 새 표현식을 쓴다.
EXPR_CONTROL='require("./probe.json").controlOk'
grep -qF "$EXPR_CONTROL" "$WF" || {
  echo "✗ 워크플로에서 controlOk 표현식을 찾지 못했습니다 — 검사가 낡았습니다"
  exit 1
}

# node -p 로 돌아가면 안 된다. -p 는 값을 검사기로 찍어 TTY 에서 ANSI 색을 입히고,
# 그러면 "true" 비교가 어긋나 상류가 풀려도 영영 침묵한다. 실제로 이 검사가 그것을
# 잡았으므로 회귀 항목으로 남긴다.
if grep -qE "node -p .*probe\.json" "$WF"; then
  echo "✗ 워크플로가 node -p 로 probe.json 을 읽습니다 — 색 때문에 비교가 깨집니다"
  echo "  node -e + process.stdout.write 를 쓰십시오"
  exit 1
fi
grep -qF 'process.stdout.write' "$WF" || {
  echo "✗ 워크플로에서 process.stdout.write 를 찾지 못했습니다 — 검사가 낡았습니다"
  exit 1
}

# 판별기를 두 번 돌리면 시간이 두 배가 되고, 그 사이에 상류가 배포되면 사람이 읽는
# 표와 기계가 읽는 JSON 이 어긋난다. 한 번 재고 두 형태로 내야 한다.
n_probe="$(grep -cE 'node scripts/check-upgrade-blockers\.mjs' "$WF")"
if [ "$n_probe" -ne 1 ]; then
  echo "✗ 워크플로가 판별기를 ${n_probe} 번 실행합니다 — 1 번이어야 합니다"
  echo "  --json-out 으로 표와 JSON 을 한 번에 내십시오"
  exit 1
fi
grep -qF -- '--json-out' "$WF" || {
  echo "✗ 워크플로가 --json-out 을 쓰지 않습니다 — 두 번 실행으로 되돌아간 것 같습니다"
  exit 1
}

# 코멘트 조회 실패를 삼키면 표지를 못 찾아 매주 같은 알림을 다시 단다.
if grep -qE 'gh api .*issues/.*comments.*\|\| true' "$WF"; then
  echo "✗ 워크플로가 코멘트 조회 실패를 '|| true' 로 삼킵니다 — 중복 알림이 됩니다"
  exit 1
fi
grep -qF 'filter(r => r.cleared)' "$WF" || {
  echo "✗ 워크플로에서 cleared 필터를 찾지 못했습니다 — 검사가 낡았습니다"
  exit 1
}
grep -qF 'upgrade-blocker-cleared:' "$WF" || {
  echo "✗ 워크플로에서 중복 방지 표지를 찾지 못했습니다 — 검사가 낡았습니다"
  exit 1
}

# ── 워크플로와 같은 판단을 재현한다 ─────────────────────────────────────
decide() { # probe.json 경로 → 알릴 id 목록(또는 SILENT/UNKNOWN)
  local f="$1"
  local control
  control="$(F="$f" node -e 'process.stdout.write(String(require(process.env.F).controlOk))')"
  if [ "$control" != "true" ]; then echo "UNKNOWN"; return; fi
  local cleared
  cleared="$(F="$f" node -e 'process.stdout.write(
    require(process.env.F).results.filter(r => r.cleared).map(r => r.id).join(" ")
  )')"
  if [ -z "$cleared" ]; then echo "SILENT"; return; fi
  echo "$cleared"
}

case_json() { # 파일명, controlOk, "id:cleared" ...
  local out="$TMP/$1"; shift
  local ctrl="$1"; shift
  local items=""
  for spec in "$@"; do
    local id="${spec%%:*}" cl="${spec##*:}"
    items="${items}${items:+,}{\"id\":\"$id\",\"cleared\":$cl,\"label\":\"$id\",\"watch\":\"w\"}"
  done
  printf '{"controlOk":%s,"restored":true,"results":[%s]}' "$ctrl" "$items" > "$out"
  echo "$out"
}

check() { # 라벨, 기대값, 실제값
  if [ "$2" = "$3" ]; then
    printf '  ✓ %-46s → %s\n' "$1" "$3"
  else
    printf '  ✗ %-46s → %s (기대: %s)\n' "$1" "$3" "$2"; FAIL=1
  fi
}

echo "═ 보고 판단 ═"
check "둘 다 막힘 → 침묵" "SILENT" \
  "$(decide "$(case_json a.json true eslint-10:false typescript-7:false)")"
check "하나 풀림 → 그것만 알림" "eslint-10" \
  "$(decide "$(case_json b.json true eslint-10:true typescript-7:false)")"
check "둘 다 풀림 → 둘 다 알림" "eslint-10 typescript-7" \
  "$(decide "$(case_json c.json true eslint-10:true typescript-7:true)")"
check "대조군 실패 → 판별 불능, 침묵" "UNKNOWN" \
  "$(decide "$(case_json d.json false eslint-10:true typescript-7:true)")"

# 대조군이 깨졌을 때 침묵하는 것이 이 검사의 핵심이다. 저장소에 lint 에러가 있으면
# 후보도 전부 실패하는데, 그것을 "아직 막힘"으로 보고하면 상류가 풀린 뒤에도
# 영영 알림이 오지 않는다. 반대로 대조군 실패를 "풀렸다"로 오독하면 거짓 알림이 된다.

echo
echo "═ 중복 방지 표지 ═"
marker_test() { # 라벨, 기존 코멘트 본문, id, 기대(SKIP/POST)
  local existing="$2" id="$3" want="$4"
  local marker="<!-- upgrade-blocker-cleared:${id} -->"
  local got
  if printf '%s' "$existing" | grep -qF "$marker"; then got="SKIP"; else got="POST"; fi
  check "$1" "$want" "$got"
}
marker_test "코멘트 없음 → 알린다" "" "eslint-10" "POST"
marker_test "이미 알린 것 → 건너뛴다" "<!-- upgrade-blocker-cleared:eslint-10 -->" "eslint-10" "SKIP"
marker_test "다른 벽의 표지만 있음 → 알린다" "<!-- upgrade-blocker-cleared:typescript-7 -->" "eslint-10" "POST"
# 표지가 부분 문자열로 잘못 매칭되지 않는지. eslint-10 표지가 있을 때
# typescript-7 을 건너뛰면 한쪽 알림이 영영 오지 않는다.
marker_test "부분 일치로 오탐하지 않는다" "<!-- upgrade-blocker-cleared:eslint-10 -->" "typescript-7" "POST"

echo
echo "═ 판별기 자체 ═"
S="scripts/check-upgrade-blockers.mjs"
[ -f "$S" ] && echo "  ✓ $S 존재" || { echo "  ✗ $S 없음"; FAIL=1; }
node --check "$S" 2>/dev/null && echo "  ✓ 문법 통과" || { echo "  ✗ 문법 오류"; FAIL=1; }
grep -qF 'controlOk' "$S" && echo "  ✓ 대조군을 낸다" || { echo "  ✗ 대조군 출력이 없다"; FAIL=1; }
grep -qF 'process.exit(0)' "$S" && echo "  ✓ 언제나 0 으로 끝낸다" || { echo "  ✗ 종료 코드가 0 이 아닐 수 있다"; FAIL=1; }

echo
if [ "$FAIL" -eq 0 ]; then echo "전부 통과"; else echo "실패 있음"; exit 1; fi
