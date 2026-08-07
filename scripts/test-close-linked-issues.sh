#!/usr/bin/env bash
#
# close-linked-issues 워크플로의 추출식과 run: 블록을 검사한다.
#
#   bash scripts/test-close-linked-issues.sh [워크플로 경로]
#
# 워크플로를 고치면 이것을 돌린다. CI 가 매 PR 에서 돌린다(.github/workflows/ci.yml).
#
# **정규식도 run: 블록도 워크플로 파일에서 직접 뽑아 쓴다.** (#243)
# 이전 판은 정규식을 하네스 안에 복붙해 뒀다 — 워크플로의 정규식을 회귀판으로 되돌려도
# 전부 초록이었다. 검사가 그것을 실증해 반려했다. 사본을 검사하는 테스트는 테스트가 아니다.
#
# 의존성을 늘리지 않으려고 YAML 파서를 쓰지 않는다. run: 블록은 들여쓰기로 잘라낸다.
# gh 는 가짜로 세운다 — 진짜 API 를 부르지 않으므로 아무 이슈도 닫히지 않는다.
set -uo pipefail

WF="${1:-.github/workflows/close-linked-issues.yml}"
[ -r "$WF" ] || { echo "워크플로를 읽을 수 없습니다: $WF"; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# ── run: 블록을 잘라낸다 ────────────────────────────────────────────────
# "run: |" 다음 줄부터, 그 줄보다 얕은 들여쓰기가 나오기 전까지.
awk '
  /^[[:space:]]*run:[[:space:]]*\|[[:space:]]*$/ { inrun=1; next }
  inrun {
    if ($0 ~ /^[[:space:]]*$/) { print ""; next }
    match($0, /^[[:space:]]*/)
    if (indent == 0) indent = RLENGTH
    if (RLENGTH < indent) exit
    print substr($0, indent + 1)
  }
' "$WF" > "$TMP/run.sh"
[ -s "$TMP/run.sh" ] || { echo "run: 블록을 찾지 못했습니다"; exit 1; }
bash -n "$TMP/run.sh" || { echo "run: 블록이 bash 문법 검사에 실패했습니다"; exit 1; }

# ── 정규식도 워크플로에서 뽑는다 ────────────────────────────────────────
RE="$(grep -oP "(?<=grep -oiP ')[^']+(?=')" "$TMP/run.sh" | head -1)"
[ -n "$RE" ] || { echo "워크플로에서 추출식을 찾지 못했습니다"; exit 1; }
echo "  워크플로에서 뽑은 추출식:"
echo "    $RE"
echo

extract() {
  printf '%s' "${1:-}" \
    | grep -oiP "$RE" \
    | grep -oE '#[0-9]+' | tr -d '#' | sort -un | tr '\n' ' ' | sed 's/ $//'
}

FAIL=0
chk() {
  local name="$1" body="$2" want="$3" got
  got="$(extract "$body")"
  if [ "$got" = "$want" ]; then printf '  ✓ %-34s → [%s]\n' "$name" "$got"
  else printf '  ✗ %-34s → [%s]  기대 [%s]\n' "$name" "$got" "$want"; FAIL=1; fi
}

echo "═ 정상 동작 ═"
chk "Closes #N"            'Closes #225'                    '225'
chk "여러 줄"               'Closes #225
Closes #226'                                                '225 226'
chk "한 줄에 9개 키워드"     'Close #1 Closed #2 Closes #3 Fix #4 Fixed #5 Fixes #6 Resolve #7 Resolved #8 Resolves #9'  '1 2 3 4 5 6 7 8 9'
chk "문장 끝 마침표"        'Closes #225.'                   '225'
chk "괄호 안"               '(Closes #225)'                  '225'
chk "쉼표"                  'Closes #225, Closes #226'       '225 226'
chk "큰 번호"               'Closes #1000000'                '1000000'

echo
echo "═ 16진 색상값을 닫지 않는다 (#239) ═"
chk "fix #8a857a"          'fix #8a857a → #6f6b62'          ''
chk "fixed #6f6b62"        '인쇄 흐림을 fixed #6f6b62 로'     ''
chk "resolved #1c1b18"     'resolved #1c1b18 대비 17.22:1'   ''
chk "closed #3b5998"       'closed #3b5998 브랜드색'          ''
chk "Fixes #16.2.10"       'Fixes #16.2.10'                 ''
chk "closes #12abc"        'closes #12abc'                  ''
chk "fix #54707f"          'fix #54707f 로 올린다'            ''
chk "색상 뒤에 진짜 참조"    'fix #8a857a 를 고침. Closes #225' '225'

echo
echo "═ 계속 닫지 않아야 하는 것 ═"
chk "다른 저장소"           'Closes SejuneOh/other#12'        ''
chk "전체 URL"              'Closes https://github.com/o/r/issues/12' ''
chk "키워드 없음"           '#214 에서 배운 것'                ''
chk "단어 안 close"         'preclose #12'                    ''
chk "줄바꿈 분리"           'Closes
#12'                                                        ''
chk "빈 본문"               ''                                ''

echo
echo "═ 알려진 한계 (닫는다 — 파일 주석에 명시) ═"
chk "코드블록 안"           '```
Closes #77
```'                                                        '77'
chk "인용문 안"             '> Resolves #78'                  '78'

# ── 가짜 gh ────────────────────────────────────────────────────────────
#   200 열린 이슈 / 201 이미 닫힘 / 300 PR / 999 404 / 502·403 조회 실패
#   601 "Not Found" 문구를 가진 403   602 빈 응답   505 상태조회 실패
#   606 상태가 빈 문자열   607 상태 조회가 stderr 에 알림을 찍음
mkdir -p "$TMP/bin"
cat > "$TMP/bin/gh" <<'SH'
#!/usr/bin/env bash
case "$1" in
  api)
    n="${2##*/}"
    case "$n" in
      300) echo "pr";;
      999) echo "gh: Not Found (HTTP 404)" >&2; exit 1;;
      502) echo "gh: Bad Gateway (HTTP 502)" >&2; exit 1;;
      403) echo "gh: API rate limit exceeded (HTTP 403)" >&2; exit 1;;
      601) echo "gh: Not Found (HTTP 403)" >&2; exit 1;;
      602) exit 0;;
      *)   echo "issue";;
    esac
    ;;
  issue)
    case "$2" in
      view)
        case "$3" in
          201) echo "CLOSED";;
          505) echo "gh: Bad Gateway (HTTP 502)" >&2; exit 1;;
          606) exit 0;;
          607) echo "! A new release of gh is available" >&2; echo "OPEN";;
          *)   echo "OPEN";;
        esac
        ;;
      close)
        echo "$3" >> "$GH_CLOSED_LOG"
        # 코멘트 본문을 남겨 제목 처리 검사에 쓴다
        shift 3
        while [ "$#" -gt 0 ]; do
          [ "$1" = "--comment" ] && { printf '%s' "$2" > "$GH_COMMENT_OUT"; break; }
          shift
        done
        ;;
    esac
    ;;
esac
SH
chmod +x "$TMP/bin/gh"
export PATH="$TMP/bin:$PATH" GH_TOKEN=x GH_REPO=o/r

# title 을 인자로 받는다 (#243) — 이전 판은 run_case 안에서 PR_TITLE 을 덮어써
# 제목 처리 테스트가 아무것도 검사하지 않았다.
run_case() {
  local name="$1" body="$2" want="$3" wantrc="$4" title="${5:-테스트 PR}"
  export GH_CLOSED_LOG="$TMP/closed.log" GH_COMMENT_OUT="$TMP/comment.txt"
  : > "$GH_CLOSED_LOG"; : > "$GH_COMMENT_OUT"
  export PR_NUMBER=500 PR_BODY="$body" PR_TITLE="$title"
  local out rc got
  out="$(bash "$TMP/run.sh" 2>&1)"; rc=$?
  got="$(tr '\n' ' ' < "$GH_CLOSED_LOG" | sed 's/ $//')"
  if [ "$got" = "$want" ] && [ "$rc" -eq "$wantrc" ]; then
    printf '  ✓ %-32s 닫음 [%s] 종료 %d\n' "$name" "$got" "$rc"
  else
    printf '  ✗ %-32s 닫음 [%s] 기대 [%s], 종료 %d 기대 %d\n' "$name" "$got" "$want" "$rc" "$wantrc"
    echo "$out" | sed 's/^/       /'; FAIL=1
  fi
}

echo
echo "═ run: 블록 — 성공 경로 ═"
run_case "열린 이슈"            'Closes #200'  '200' 0
run_case "둘 다 닫는다"          'Closes #200 Closes #202'  '200 202' 0
run_case "이미 닫힘"            'Closes #201'  ''    0
run_case "PR 번호"              'Closes #300'  ''    0
run_case "없는 번호(HTTP 404)"   'Closes #999'  ''    0
run_case "참조 없음"            '설명만'        ''    0
run_case "색상값만"             'fix #8a857a'   ''    0

echo
echo "═ run: 블록 — 무성 실패를 남기지 않는다 (#243) ═"
run_case "502 → 실패"           'Closes #502'  ''    1
run_case "403 → 실패"           'Closes #403'  ''    1
run_case "403+NotFound → 실패"   'Closes #601'  ''    1
run_case "빈 응답 → 실패"        'Closes #602'  ''    1
run_case "상태조회 실패 → 실패"   'Closes #505'  ''    1
run_case "상태 빈값 → 실패"      'Closes #606'  ''    1
run_case "stderr 알림은 무시"     'Closes #607'  '607' 0

echo
echo "═ 주입·마크다운 방어 ═"
run_case "본문 역따옴표"         'Closes #200 `touch /tmp/pwn243a`'   '200' 0
run_case "본문 달러괄호"         'Closes #200 $(touch /tmp/pwn243b)'  '200' 0
run_case "본문 세미콜론"         'Closes #200; touch /tmp/pwn243c'    '200' 0
# 코멘트 자체가 코드스팬을 여럿 쓰므로 절대 개수로는 판정할 수 없다.
# 평범한 제목으로 한 번 돌려 기준선을 잡고, 백틱·개행이 든 제목과 비교한다.
run_case "제목 대조군"           'Closes #200' '200' 0 '평범한 제목'
base_ticks="$(tr -cd '`' < "$TMP/comment.txt" | wc -c)"
base_lines="$(wc -l < "$TMP/comment.txt")"

run_case "제목 메타문자"         'Closes #200' '200' 0 'x`touch /tmp/pwn243d`$(touch /tmp/pwn243e)'
ticks="$(tr -cd '`' < "$TMP/comment.txt" | wc -c)"
if [ "$ticks" -eq "$base_ticks" ]; then
  echo "  ✓ 제목의 백틱이 제거됐습니다 (백틱 ${ticks}개 = 기준선)"
else
  echo "  ✗ 제목의 백틱이 코멘트에 남았습니다 (백틱 ${ticks}개, 기준선 ${base_ticks})"; FAIL=1
fi

run_case "제목에 개행"           'Closes #200' '200' 0 '앞줄
뒷줄'
lines="$(wc -l < "$TMP/comment.txt")"
if [ "$lines" -eq "$base_lines" ]; then
  echo "  ✓ 제목의 개행이 제거됐습니다 (${lines}줄 = 기준선)"
else
  echo "  ✗ 제목의 개행이 코멘트 줄 수를 늘렸습니다 (${lines}줄, 기준선 ${base_lines})"; FAIL=1
fi
for f in /tmp/pwn243a /tmp/pwn243b /tmp/pwn243c /tmp/pwn243d /tmp/pwn243e; do
  [ -e "$f" ] && { echo "  ✗ 주입 성공: $f"; FAIL=1; rm -f "$f"; }
done
[ "$FAIL" -eq 0 ] && echo "  ✓ 주입 흔적 없음"

echo
[ "$FAIL" -eq 0 ] && echo "  전부 통과" || { echo "  실패 있음"; exit 1; }
