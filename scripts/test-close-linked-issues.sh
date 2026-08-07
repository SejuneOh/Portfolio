#!/usr/bin/env bash
#
# close-linked-issues 워크플로의 추출식과 run: 블록을 검사한다.
#
#   bash scripts/test-close-linked-issues.sh .github/workflows/close-linked-issues.yml
#
# 워크플로를 고치면 이것을 돌린다. YAML 이 파싱된다는 것과 스크립트가 동작한다는 것은
# 다른 문제고, 정규식은 눈으로 보면 늘 틀린다 — 실제로 #236 은 16진 색상값을 이슈 번호로
# 잘라내는 결함을 달고 병합됐다(#239). 그때 테스트 케이스에 색상값이 없었다.
#
# gh 는 가짜로 세운다. 진짜 API 를 부르지 않으므로 아무 이슈도 닫히지 않는다.
set -uo pipefail

WF="${1:-.github/workflows/close-linked-issues.yml}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

python3 - "$WF" > "$TMP/run.sh" <<'PY'
import sys, yaml
d = yaml.safe_load(open(sys.argv[1]))
print(d['jobs']['close']['steps'][0]['run'])
PY

# 워크플로에서 추출식만 떼어 낸다 (run.sh 첫 부분과 같은 식을 쓴다)
extract() {
  printf '%s' "${1:-}" \
    | grep -oiP '(?<![A-Za-z])(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#\d+(?![0-9A-Za-z]|\.\d)' \
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
chk "여러 개"               'Closes #225
Closes #226'                                                '225 226'
chk "9개 키워드"            'Close #1 Closed #2 Closes #3 Fix #4 Fixed #5 Fixes #6 Resolve #7 Resolved #8 Resolves #9'  '1 2 3 4 5 6 7 8 9'
chk "문장 끝 마침표"        'Closes #225.'                   '225'
chk "괄호 안"               '(Closes #225)'                  '225'
chk "쉼표"                  'Closes #225, Closes #226'       '225 226'
chk "줄 끝"                 'Closes #225'                    '225'

echo
echo "═ #239 가 고친 것 — 16진 색상값 ═"
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
echo "═ 알려진 한계 (닫는다 — 주석에 명시) ═"
chk "코드블록 안"           '```
Closes #77
```'                                                        '77'
chk "인용문 안"             '> Resolves #78'                  '78'

# ── run: 블록 — gh 실패 구분 ──────────────────────────────────────────
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
      *)   echo "issue";;
    esac
    ;;
  issue)
    case "$2" in
      view)
        case "$3" in
          201) echo "CLOSED";;
          505) echo "gh: Bad Gateway (HTTP 502)" >&2; exit 1;;
          *)   echo "OPEN";;
        esac
        ;;
      close) echo "$3" >> "$GH_CLOSED_LOG";;
    esac
    ;;
esac
SH
chmod +x "$TMP/bin/gh"
export PATH="$TMP/bin:$PATH" GH_TOKEN=x GH_REPO=o/r

run_case() {
  local name="$1" body="$2" want="$3" wantrc="$4"
  export GH_CLOSED_LOG="$TMP/closed.log"; : > "$GH_CLOSED_LOG"
  export PR_NUMBER=500 PR_TITLE="테스트 PR" PR_BODY="$body"
  local out rc got
  out="$(bash "$TMP/run.sh" 2>&1)"; rc=$?
  got="$(tr '\n' ' ' < "$GH_CLOSED_LOG" | sed 's/ $//')"
  if [ "$got" = "$want" ] && [ "$rc" -eq "$wantrc" ]; then
    printf '  ✓ %-30s 닫음 [%s] 종료 %d\n' "$name" "$got" "$rc"
  else
    printf '  ✗ %-30s 닫음 [%s] 기대 [%s], 종료 %d 기대 %d\n' "$name" "$got" "$want" "$rc" "$wantrc"
    echo "$out" | sed 's/^/       /'; FAIL=1
  fi
}

echo
echo "═ run: 블록 ═"
run_case "열린 이슈"          'Closes #200'  '200' 0
run_case "이미 닫힘"          'Closes #201'  ''    0
run_case "PR 번호"            'Closes #300'  ''    0
run_case "없는 번호(404)"      'Closes #999'  ''    0
run_case "502 → 실패로 남긴다"  'Closes #502'  ''    1
run_case "403 → 실패로 남긴다"  'Closes #403'  ''    1
run_case "상태조회 실패 → 실패" 'Closes #505'  ''    1
run_case "참조 없음"          '설명만'        ''    0
run_case "색상값만"           'fix #8a857a'   ''    0

echo
echo "═ 주입 방어 ═"
run_case "역따옴표"           'Closes #200 `touch /tmp/pwn239a`'   '200' 0
run_case "달러 괄호"          'Closes #200 $(touch /tmp/pwn239b)'  '200' 0
run_case "세미콜론"           'Closes #200; touch /tmp/pwn239c'    '200' 0
export PR_TITLE='x`touch /tmp/pwn239d`$(touch /tmp/pwn239e)'
run_case "제목에 메타문자"      'Closes #200'                        '200' 0
for f in /tmp/pwn239a /tmp/pwn239b /tmp/pwn239c /tmp/pwn239d /tmp/pwn239e; do
  [ -e "$f" ] && { echo "  ✗ 주입 성공: $f"; FAIL=1; rm -f "$f"; }
done
[ "$FAIL" -eq 0 ] && echo "  ✓ 주입 흔적 없음"

echo
[ "$FAIL" -eq 0 ] && echo "  전부 통과" || { echo "  실패 있음"; exit 1; }
