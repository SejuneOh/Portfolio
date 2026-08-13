#!/usr/bin/env node
//
// 이력서 Notion 읽기의 **폴백 경로**와 스키마 검사를 검증한다 (#262 2단계).
//
//   bash scripts/test-resume-fallback.sh        ← 이렇게 부른다 (tsc 컴파일이 필요하다)
//
// 왜 있나 — 이력서는 Notion 한 칸에 JSON 통째로 들어간다. 한 번 잘못 쓰면 전부 잃는 구조라
// 폴백이 유일한 안전망이다. 그런데 폴백은 평소에 돌지 않는 길이라, 만들어 두고 확인하지
// 않으면 정작 필요한 순간에 동작하지 않는다 — 이 저장소에서 이미 겪은 종류의 결함이다
// (#244 무성 실패, #253 판별기 안의 대조군).
//
// 이 검사는 소스를 정규식으로 읽지 않고 **실제로 실행한다.** 그래서 tsc 로 먼저 컴파일한다
// (test-shiki-contrast.mjs 처럼 텍스트만 보면 폴백이 실제로 도는지는 알 수 없다).

import { createRequire } from "node:module"
import path from "node:path"
import process from "node:process"

const OUT = process.argv[2]
if (!OUT) {
  console.error("컴파일 산출물 경로를 인자로 넘겨야 한다. scripts/test-resume-fallback.sh 를 쓰라.")
  process.exit(2)
}
const require = createRequire(import.meta.url)

let pass = 0
let fail = 0
const check = (name, cond, extra) => {
  if (cond) {
    pass++
    console.log(`  통과  ${name}`)
  } else {
    fail++
    console.log(`  실패  ${name}${extra ? ` — ${extra}` : ""}`)
  }
}

// config 가 import 시점에 process.env 를 읽으므로 시나리오마다 새로 불러온다.
function loadFresh() {
  for (const k of Object.keys(require.cache)) {
    if (k.startsWith(path.resolve(OUT))) delete require.cache[k]
  }
  return {
    notionResume: require(path.resolve(OUT, "lib/notionResume.js")),
    resumeData: require(path.resolve(OUT, "lib/resumeData.js")).resumeData,
    schema: require(path.resolve(OUT, "lib/resumeSchema.js")),
  }
}

// Notion code 블록은 항목당 2000자 제한이 있어 실제 저장은 여러 블록으로 쪼개진다.
function codeBlocks(text, size = 2000) {
  const out = []
  for (let i = 0; i < text.length; i += size)
    out.push({ type: "code", code: { rich_text: [{ plain_text: text.slice(i, i + size) }] } })
  return out
}

function stubFetch({ dbStatus = 200, rows, blocks, throwOn }) {
  globalThis.fetch = async (url) => {
    const u = String(url)
    if (throwOn && u.includes(throwOn)) throw new Error("네트워크 끊김")
    if (u.includes("/databases/")) {
      if (dbStatus !== 200) return { ok: false, status: dbStatus }
      return { ok: true, status: 200, json: async () => ({ results: rows }) }
    }
    if (u.includes("/blocks/"))
      return { ok: true, status: 200, json: async () => ({ results: blocks, has_more: false }) }
    throw new Error(`예상 못한 URL: ${u}`)
  }
}

const row = (title, id = "page-1") => ({
  id,
  properties: { Title: { title: [{ plain_text: title }] } },
})

// 폴백은 일부러 경고를 남긴다. 검사 출력이 묻히지 않게 잠시 삼킨다.
const realWarn = console.warn
const silence = () => void (console.warn = () => {})
const unsilence = () => void (console.warn = realWarn)

async function run() {
  console.log("\n1. 토큰·DB id 가 없다 (로컬·프리뷰의 흔한 경우)")
  delete process.env.NOTION_TOKEN
  delete process.env.NOTION_RESUME_DB
  {
    const { notionResume, resumeData } = loadFresh()
    silence()
    const r = await notionResume.getResume()
    unsilence()
    check("폴백으로 떨어진다", r.source.from === "fallback")
    check("이유에 env 이름이 있다", /NOTION_TOKEN|NOTION_RESUME_DB/.test(r.source.reason))
    check("코드 폴백 데이터를 돌려준다", r.data === resumeData)
  }

  process.env.NOTION_TOKEN = "test-token"
  process.env.NOTION_RESUME_DB = "test-db"

  console.log("\n2. DB 조회가 404 로 실패한다")
  {
    const { notionResume, resumeData } = loadFresh()
    stubFetch({ dbStatus: 404 })
    silence()
    const r = await notionResume.getResume()
    unsilence()
    check("폴백으로 떨어진다", r.source.from === "fallback")
    check("이유에 상태 코드가 있다", r.source.reason.includes("404"), r.source.reason)
    check("데이터는 폴백", r.data === resumeData)
  }

  console.log("\n3. 조회 중 예외가 난다")
  {
    const { notionResume } = loadFresh()
    stubFetch({ throwOn: "/databases/" })
    silence()
    const r = await notionResume.getResume()
    unsilence()
    check("던지지 않고 폴백으로 떨어진다", r.source.from === "fallback")
    check("이유가 조회 오류다", r.source.reason.includes("조회 중 오류"), r.source.reason)
  }

  console.log("\n4. DB 는 있지만 행이 없다")
  {
    const { notionResume } = loadFresh()
    stubFetch({ rows: [] })
    silence()
    const r = await notionResume.getResume()
    unsilence()
    check("폴백으로 떨어진다", r.source.from === "fallback")
    check("이유가 '행이 없다'", r.source.reason.includes("행이 없다"), r.source.reason)
  }

  console.log("\n5. 본문에 코드 블록이 없다 (사람이 적은 문단만 있다)")
  {
    const { notionResume } = loadFresh()
    stubFetch({
      rows: [row("resume")],
      blocks: [{ type: "paragraph", paragraph: { rich_text: [{ plain_text: "메모" }] } }],
    })
    silence()
    const r = await notionResume.getResume()
    unsilence()
    check("폴백으로 떨어진다", r.source.from === "fallback")
    check("문단은 무시한다", r.source.reason.includes("코드 블록이 없다"), r.source.reason)
  }

  console.log("\n6. 본문 JSON 이 깨졌다 (쓰다가 중단된 경우)")
  {
    const { notionResume, resumeData } = loadFresh()
    stubFetch({
      rows: [row("resume")],
      blocks: codeBlocks(JSON.stringify(resumeData).slice(0, 3000)),
    })
    silence()
    const r = await notionResume.getResume()
    unsilence()
    check("폴백으로 떨어진다", r.source.from === "fallback")
    check("이유가 파싱 실패", r.source.reason.includes("읽을 수 없다"), r.source.reason)
  }

  console.log("\n7. JSON 은 읽히지만 모양이 이력서가 아니다")
  {
    const { notionResume } = loadFresh()
    stubFetch({ rows: [row("resume")], blocks: codeBlocks(JSON.stringify({ hello: "world" })) })
    silence()
    const r = await notionResume.getResume()
    unsilence()
    check("폴백으로 떨어진다", r.source.from === "fallback")
    check("이유가 모양 불일치", r.source.reason.includes("모양"), r.source.reason)
    check("무엇이 틀렸는지 남긴다", (r.source.detail || []).length > 0)
  }

  console.log("\n8. 정상 — 2000자마다 쪼개진 코드 블록을 이어 붙인다")
  {
    const { notionResume, resumeData } = loadFresh()
    const json = JSON.stringify(resumeData)
    const blocks = codeBlocks(json)
    stubFetch({ rows: [row("resume")], blocks })
    const r = await notionResume.getResume()
    check(`블록이 2개 이상으로 쪼개진다 (${blocks.length}개)`, blocks.length > 1)
    check("Notion 에서 읽었다", r.source.from === "notion", JSON.stringify(r.source))
    check("내용이 일치한다", JSON.stringify(r.data) === json)
  }

  console.log('\n9. 행이 여러 개면 제목이 "resume" 인 것을 고른다')
  {
    const { notionResume, resumeData } = loadFresh()
    const json = JSON.stringify(resumeData)
    globalThis.fetch = async (url) => {
      const u = String(url)
      if (u.includes("/databases/"))
        return {
          ok: true,
          status: 200,
          json: async () => ({ results: [row("메모", "other"), row("resume", "target")] }),
        }
      if (u.includes("/blocks/target/"))
        return { ok: true, status: 200, json: async () => ({ results: codeBlocks(json) }) }
      return { ok: true, status: 200, json: async () => ({ results: [] }) }
    }
    const r = await notionResume.getResume()
    check(
      "target 행을 읽는다",
      r.source.from === "notion" && r.source.pageId === "target",
      JSON.stringify(r.source)
    )
  }

  console.log("\n10. 스키마 검사가 막아야 할 것들")
  {
    const { schema, resumeData } = loadFresh()
    const clone = () => JSON.parse(JSON.stringify(resumeData))
    check("원본은 통과한다", schema.validateResume(clone()).ok)

    const cases = [
      ["지표가 3개가 아니다", (d) => (d.metrics = d.metrics.slice(0, 2))],
      ["지표 label 이 3줄이다", (d) => (d.metrics[0].label = ["a", "b", "c"])],
      ["스킬이 빈 배열", (d) => (d.skills = [])],
      ["스킬 group 이 공백뿐", (d) => (d.skills[0].group = "  ")],
      ["경력에 회사가 없다", (d) => (d.career = d.career.filter((e) => e.kind !== "job"))],
      ["kind 오타", (d) => (d.career[1].kind = "porject")],
      ["프로젝트 bullets 가 빈 배열", (d) => (d.career[1].bullets = [])],
      ["bullet text 없음", (d) => delete d.career[1].bullets[0].text],
      ["bullet year 가 숫자", (d) => (d.career[1].bullets[0].year = 2024)],
      ["footer 가 1개", (d) => (d.footer = ["하나"])],
      ["side 에 빈 항목", (d) => (d.side[1] = "")],
      ["header.contacts 가 빈 배열", (d) => (d.header.contacts = [])],
      ["header.tagline 없음", (d) => delete d.header.tagline],
      ["education meta 없음", (d) => delete d.education[0].meta],
    ]
    for (const [name, mutate] of cases) {
      const d = clone()
      mutate(d)
      check(`막는다: ${name}`, schema.validateResume(d).ok === false, "통과해 버렸다")
    }
    check("막는다: 최상위가 배열", schema.validateResume([]).ok === false)
    check("막는다: 최상위가 null", schema.validateResume(null).ok === false)

    // 이름이 빈 프로젝트는 실제로 있다(인지소프트 아래 블록). 막으면 안 된다.
    const emptyName = clone()
    emptyName.career[emptyName.career.length - 1].name = ""
    check("허용한다: 이름이 빈 프로젝트", schema.validateResume(emptyName).ok)
  }

  console.log(`\n통과 ${pass} · 실패 ${fail}`)
  if (fail) process.exit(1)
}

run().catch((e) => {
  unsilence()
  console.error(e)
  process.exit(2)
})
