#!/usr/bin/env bash
#
# 이력서 Notion 읽기의 폴백 경로 검사 (#262 2단계).
#
#   bash scripts/test-resume-fallback.sh
#
# 이 검사는 소스를 훑는 것이 아니라 **실제로 실행한다.** 폴백이 도는지는 실행해 봐야 알 수
# 있기 때문이다. 그래서 tsc 로 먼저 컴파일한 뒤 node 로 돌린다.
#
# npm ci 이후에 불러야 한다 — tsc 가 devDependency 다.
set -euo pipefail

cd "$(dirname "$0")/.."

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

# 검사 대상만 컴파일한다. tsconfig 를 쓰면 JSX·경로 별칭까지 끌고 와 느려지므로 끈다.
#
# --noCheck 로 **타입 검사 없이 방출만** 한다. 타입 검사는 npm run build 가 하는 일이고,
# 여기서 검사까지 하면 tsconfig 밖이라 process(@types/node)나 Next 의 fetch 확장
# (`next: { revalidate }`)을 몰라 엉뚱한 곳에서 멈춘다. 이 하네스에 필요한 것은 JS 뿐이다.
npx tsc \
  --ignoreConfig \
  --noCheck \
  --outDir "$TMP" \
  --rootDir . \
  --module commonjs \
  --target es2020 \
  --skipLibCheck \
  lib/notionResume.ts \
  lib/resumeSchema.ts \
  lib/resumeData.ts \
  config/index.ts

node scripts/test-resume-fallback.mjs "$TMP"
