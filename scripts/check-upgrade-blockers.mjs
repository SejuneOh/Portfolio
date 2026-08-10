#!/usr/bin/env node
//
// ESLint 10 · TypeScript 7 을 막던 상류 조건이 풀렸는지 판별한다 (#253).
//
//   node scripts/check-upgrade-blockers.mjs
//   node scripts/check-upgrade-blockers.mjs --json
//
// **설치가 아니라 실행으로 판별한다.** `npm install --dry-run` 은 판별력이 없다 —
// 막힌 쪽도 "해석 성공"이 나온다. 두 패키지 모두 eslint-config-next 아래의 중첩
// 의존성이라 설치 시점에 peer 충돌로 잡히지 않고, eslint 를 실제로 돌릴 때 깨진다.
//
//   대조군  eslint@^9  · typescript@^6   해석 성공  (실제로 되는 것)
//   실험군  eslint@^10 · typescript@^7   해석 성공  (실제로는 깨지는 것)
//
// 그래서 후보 버전을 진짜로 설치하고 진짜로 eslint 를 돌린 뒤, 끝나면 npm ci 로
// 되돌린다. 되돌리기는 실패 경로에서도 반드시 수행한다 — 안 그러면 이 스크립트가
// 워크스페이스를 망가진 상태로 남긴다.
//
// **대조군을 먼저 돌린다.** 후보만 재면 조용히 틀린다 — 저장소에 lint 에러가 하나라도
// 들어오면 `npx eslint .` 가 어느 버전에서든 실패하고, 상류가 실제로 풀린 뒤에도
// 이 검사는 계속 "아직 막힘"을 보고한다. 그래서 지금 쓰는(=통과해야 하는) 의존성
// 상태에서 먼저 eslint 를 돌려 본다. 그것이 실패하면 판정을 내지 않고 "판별 불능"이라고
// 말한다. 대조군은 이미 설치된 버전을 쓰므로 추가 설치가 없다.
//
// 종료 코드는 언제나 0 이다. 아직 막혀 있는 것은 실패가 아니라 정상 상태이므로,
// 이것으로 CI 를 빨갛게 만들지 않는다. 결과는 --json 으로 워크플로가 읽는다.

import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"

const JSON_OUT = process.argv.includes("--json")

// 지켜보는 두 벽. why 는 사람이 읽을 설명이고, watch 는 풀렸을 때 무엇이 바뀌는지다.
const WALLS = [
  {
    id: "eslint-10",
    label: "ESLint 10",
    pkg: "eslint",
    spec: "10",
    blocker: "eslint-plugin-react",
    why: "eslint-config-next 가 품은 eslint-plugin-react 가 ESLint 10 에서 제거된 context.getFilename() 을 쓴다",
    watch: "eslint-plugin-react 의 peer eslint 에 ^10 이 들어오거나, eslint-config-next 가 다른 버전으로 교체한다",
  },
  {
    id: "typescript-7",
    label: "TypeScript 7",
    pkg: "typescript",
    spec: "7",
    blocker: "typescript-eslint",
    why: "typescript-eslint 가 TS 7 을 지원하지 않는다 (typescript-eslint#10940)",
    watch: "typescript-eslint 의 peer typescript 상한이 7 을 포함한다",
  },
]

// ── 도구 ────────────────────────────────────────────────────────────────
// execFileSync 를 쓴다. 셸을 거치지 않으므로 spec 문자열이 셸에 해석되지 않는다.
function run(cmd, args) {
  try {
    const stdout = execFileSync(cmd, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 15 * 60 * 1000,
    })
    return { code: 0, out: stdout }
  } catch (e) {
    // execFileSync 는 0 이 아닌 종료에서 던진다. status 가 null 이면 시그널·타임아웃이다.
    return {
      code: e.status ?? -1,
      out: `${e.stdout ?? ""}${e.stderr ?? ""}`,
    }
  }
}

const installed = (pkg) => {
  try {
    return JSON.parse(readFileSync(`node_modules/${pkg}/package.json`, "utf8")).version
  } catch {
    return null
  }
}

// 실행 로그에서 원인 한 줄을 뽑는다. 전체를 그대로 실으면 이슈 코멘트가 못 읽게 길어진다.
function firstError(log) {
  const lines = log.split("\n").map((l) => l.trim())
  const hit = lines.find(
    (l) => /^(TypeError|Error|SyntaxError):/.test(l) || /does not support/.test(l),
  )
  return hit ? hit.slice(0, 200) : ""
}

// ── 판별 ────────────────────────────────────────────────────────────────
// 후보를 설치하고 eslint 를 돌린다. 통과하면 벽이 풀린 것이다.
function probe(wall) {
  const before = installed(wall.pkg)

  const inst = run("npm", [
    "install", "--no-save", "--no-audit", "--no-fund",
    `${wall.pkg}@${wall.spec}`,
  ])
  if (inst.code !== 0) {
    // 설치 자체가 안 되는 것도 "아직 막힘"이다. 다만 이유가 다르므로 구분해 적는다.
    return { ...wall, cleared: false, stage: "install", before, after: null, error: firstError(inst.out) }
  }

  const after = installed(wall.pkg)
  const lint = run("npx", ["eslint", "."])

  return {
    ...wall,
    cleared: lint.code === 0,
    stage: lint.code === 0 ? "cleared" : "lint",
    before,
    after,
    error: lint.code === 0 ? "" : firstError(lint.out),
  }
}

// 되돌리기. lockfile 기준으로 되돌리므로 후보 설치의 흔적이 남지 않는다.
function restore() {
  const r = run("npm", ["ci", "--no-audit", "--no-fund"])
  if (r.code !== 0 && !JSON_OUT) {
    console.error("  ⚠ npm ci 실패 — node_modules 가 후보 버전인 채로 남았을 수 있다")
  }
  return r.code === 0
}

// ── 대조군 ──────────────────────────────────────────────────────────────
// 지금 쓰는 의존성(eslint 9 · typescript 6)에서 eslint 가 통과하는가.
// 통과하지 못하면 후보의 실패가 상류 탓인지 저장소 탓인지 구분할 수 없다.
const control = run("npx", ["eslint", "."])
const controlOk = control.code === 0

const results = []
let restored = true
if (controlOk) {
  for (const wall of WALLS) {
    try {
      results.push(probe(wall))
    } catch (e) {
      results.push({ ...wall, cleared: false, stage: "error", before: null, after: null, error: String(e.message).slice(0, 200) })
    } finally {
      // 다음 벽을 깨끗한 상태에서 재므로 매번 되돌린다.
      restored = restore() && restored
    }
  }
}

// ── 출력 ────────────────────────────────────────────────────────────────
if (JSON_OUT) {
  console.log(JSON.stringify({ controlOk, restored, results }, null, 2))
} else {
  console.log("═ 업그레이드 상류 판별 (#253) ═\n")
  console.log(`  대조군 — 현재 의존성에서 eslint 통과: ${controlOk ? "예" : "아니오"}`)
  if (!controlOk) {
    console.log(`    ${firstError(control.out) || "(사유를 뽑지 못함)"}`)
    console.log("\n  판별 불능 — 후보를 재도 상류 탓인지 저장소 탓인지 구분되지 않는다.")
    console.log("  먼저 `npx eslint .` 를 통과시킨 뒤 다시 돌려라.")
  }
  console.log()
  for (const r of results) {
    console.log(`  ${r.label}  (${r.pkg}@${r.spec})`)
    console.log(`    설치        ${r.before ?? "?"} → ${r.after ?? "실패"}`)
    console.log(`    판정        ${r.cleared ? "풀렸다 — 올릴 수 있다" : `아직 막힘 (${r.stage})`}`)
    if (r.error) console.log(`    사유        ${r.error}`)
    if (!r.cleared) console.log(`    막는 것      ${r.blocker}`)
    console.log()
  }
  if (controlOk) {
    const n = results.filter((r) => r.cleared).length
    console.log(n === 0 ? "  둘 다 아직 막혀 있다 — 정상 상태다." : `  ${n} 건이 풀렸다. #253 을 확인하라.`)
  }
  if (!restored) console.log("  ⚠ 되돌리기에 실패한 단계가 있다.")
}

// 막혀 있는 것은 실패가 아니다. 언제나 0 으로 끝낸다.
process.exit(0)
