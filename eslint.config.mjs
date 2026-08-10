// ESLint flat config (#102).
//
// ESLint 10 은 .eslintrc 를 더 이상 읽지 않는다. eslint-config-next 16 도 flat 배열을
// 내보내므로 두 변경이 한 파일에서 만난다.
//
// `next lint` 는 Next 16 에서 제거됐다. package.json 의 lint 스크립트가 eslint 를
// 직접 부른다 — 그쪽 주석 참조.

import { defineConfig, globalIgnores } from "eslint/config"
import nextCoreWebVitals from "eslint-config-next/core-web-vitals"

export default defineConfig([
  // 예전 .eslintrc.json 에는 ignore 가 없었다. `next lint` 가 빌드 산출물과
  // node_modules 를 자동으로 걸렀는데, eslint 를 직접 부르면 그 기본값이 없다.
  // 빼면 .next 안의 생성 파일 수천 개를 검사하다 죽는다.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    "next-env.d.ts",
    // 검사 워크트리·작성 워크트리. 같은 저장소를 두 번 검사하지 않는다.
    ".claude/worktrees/**",
  ]),

  // next/core-web-vitals 는 next 기본 규칙 + Core Web Vitals 규칙이다.
  // 예전 .eslintrc.json 의 `extends: "next/core-web-vitals"` 와 같은 것을 가리킨다.
  nextCoreWebVitals,
])
