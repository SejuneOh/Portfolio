#!/usr/bin/env node
//
// 코드 블록 토큰색이 지면 대비 WCAG AA(4.5:1)를 넘는지 검사한다.
//
//   node scripts/test-shiki-contrast.mjs
//
// **테마를 정본으로 센다.** 렌더된 글을 훑어 세면 그 표본에 없는 스코프를 놓친다 —
// #224 가 그렇게 3개만 고쳤고, 승격 뒤 프로덕션에서 네 번째가 잡혔다(#246).
// 여기서는 vitesse-dark 의 tokenColors 전부를 읽어, codeBlock.tsx 의 치환을 적용한 뒤
// 남는 미달이 있으면 실패한다.
//
// 알파는 지면색에 합성해서 잰다. 합성하지 않으면 실제보다 밝게 나와 통과로 보인다.

import { readFileSync } from "node:fs"
import theme from "shiki/themes/vitesse-dark.mjs"

const SRC = "components/blog/codeBlock.tsx"
const BG = [0x07, 0x0b, 0x0d] // --bg. codeBlock 이 테마 배경을 이 값으로 치환한다
const MIN = 4.5

// ── 색 계산 ────────────────────────────────────────────────────────────
const lin = (v) => {
  v /= 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}
const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])
const ratio = (a, b) => {
  const l1 = lum(a), l2 = lum(b)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}
const parse = (h) => {
  const s = h.replace("#", "")
  return {
    rgb: [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)),
    a: s.length === 8 ? parseInt(s.slice(6, 8), 16) / 255 : 1,
  }
}
const over = (fg, a, bg) => fg.map((v, i) => v * a + bg[i] * (1 - a))

// ── codeBlock.tsx 에서 치환표를 읽는다 ──────────────────────────────────
// 사본을 두면 소스와 어긋난다. 소스를 읽는다.
const src = readFileSync(SRC, "utf8")
const block = src.match(/const colorReplacements = \{([\s\S]*?)\n\s*\}/)
if (!block) {
  console.error(`${SRC} 에서 colorReplacements 를 찾지 못했습니다.`)
  process.exit(1)
}
const repl = new Map()
for (const m of block[1].matchAll(/"(#[0-9a-fA-F]{6,8})"\s*:\s*"([^"]+)"/g)) {
  repl.set(m[1].toLowerCase(), m[2])
}
console.log(`  ${SRC} 의 치환 ${repl.size}개를 읽었습니다`)

// ── 테마의 토큰색 전수 ─────────────────────────────────────────────────
const scopes = new Map()
for (const rule of theme.tokenColors ?? []) {
  const fg = rule.settings?.foreground
  if (!fg) continue
  const k = fg.toLowerCase()
  if (!scopes.has(k)) scopes.set(k, [].concat(rule.scope ?? "?").join(", ").slice(0, 46))
}

const rows = []
for (const [color, scope] of scopes) {
  const mapped = repl.get(color)
  // var(--…) 로 치환된 것은 배경용이라 글자색 검사 대상이 아니다
  if (mapped && mapped.startsWith("var(")) continue
  const used = mapped ?? color
  const { rgb, a } = parse(used)
  const eff = over(rgb, a, BG)
  rows.push({ color, scope, used, replaced: Boolean(mapped), r: +ratio(eff, BG).toFixed(2) })
}

rows.sort((x, y) => x.r - y.r)
const bad = rows.filter((x) => x.r < MIN)

console.log(`\n  대비    테마 색      → 적용 색     스코프`)
for (const x of rows) {
  const mark = x.r < MIN ? "✗" : " "
  const arrow = x.replaced ? `→ ${x.used.padEnd(11)}` : " ".repeat(14)
  console.log(`  ${mark} ${String(x.r).padStart(6)}:1  ${x.color.padEnd(11)} ${arrow} ${x.scope}`)
}

console.log(`\n  토큰색 ${rows.length}개, AA(${MIN}:1) 미달 ${bad.length}개`)
if (bad.length) {
  console.log(`\n  치환표에 넣어야 합니다 — ${SRC} 의 colorReplacements:`)
  for (const x of bad) console.log(`    "${x.color}": "…",   // ${x.r}:1  ${x.scope}`)
  process.exit(1)
}
console.log("  통과 — 치환표가 테마의 미달 색을 전부 덮는다")

// ── 2단계: Shiki 가 그 치환을 실제로 적용하는가 ─────────────────────────
//
// 위 검사는 "표가 덮는가" 만 본다. 표가 옳아도 Shiki 가 적용하지 않으면 소용없다
// (키 표기가 어긋나거나, 옵션 이름이 바뀌거나). 렌더 결과를 직접 잰다.
//
// 언어를 섞는 이유: 스코프마다 나오는 언어가 다르다. property-name 따옴표는
// YAML·JSON 에서만 나오는데, #224 는 그 표본이 없어 놓쳤다 (#246).

const { codeToHtml } = await import("shiki")

const SAMPLES = [
  ["yaml", 'name: "issue-reviewer"\n# 주석\non:\n  push:\n    branches: ["dev"]\n'],
  ["json", '{\n  "name": "portfolio",\n  "scripts": { "dev": "next dev" }\n}\n'],
  ["ts", 'type Kind = "code"\nconst RULES: { kind: Kind; re: RegExp }[] = []\n'],
  ["bash", 'set -euo pipefail\n# 주석\ngh pr view "$N" --json state\n'],
  ["diff", "--- a/x\n+++ b/x\n@@ -1 +1 @@\n-old\n+new\n"],
]

// var(--bg) 는 브라우저가 푸는 값이라 여기서는 지면색 리터럴로 바꿔 잰다
const renderRepl = { ...Object.fromEntries(repl), "#121212": "#070b0d" }

const rendered = new Map()
for (const [lang, code] of SAMPLES) {
  const html = await codeToHtml(code, { lang, theme: "vitesse-dark", colorReplacements: renderRepl })
  // background-color: 의 뒷부분이 걸리지 않게 경계를 둔다
  for (const m of html.matchAll(/(?<![-\w])color:(#[0-9a-fA-F]{6,8})/g)) {
    const c = m[1].toLowerCase()
    if (rendered.has(c)) continue
    const { rgb, a } = parse(c)
    rendered.set(c, { r: +ratio(over(rgb, a, BG), BG).toFixed(2), lang })
  }
}

const renderBad = [...rendered.entries()].filter(([, v]) => v.r < MIN)
console.log(`\n  렌더 결과 고유 색 ${rendered.size}개, AA 미달 ${renderBad.length}개`)
if (renderBad.length) {
  for (const [c, v] of renderBad) console.log(`    ✗ ${v.r}:1  ${c}  (${v.lang})`)
  console.log("\n  표는 옳은데 렌더에 반영되지 않았습니다 — 키 표기나 옵션을 확인하세요.")
  process.exit(1)
}
console.log("  통과 — 치환이 렌더 결과에 반영된다")
