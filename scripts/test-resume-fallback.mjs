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

import { readFileSync } from "node:fs"
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
    text: require(path.resolve(OUT, "lib/resumeText.js")),
    rules: require(path.resolve(OUT, "lib/resumeRules.js")),
  }
}

// Notion code 블록은 항목당 2000자 제한이 있어 실제 저장은 여러 블록으로 쪼개진다.
function codeBlocks(text, size = 2000) {
  const out = []
  for (let i = 0; i < text.length; i += size)
    out.push({ type: "code", code: { rich_text: [{ plain_text: text.slice(i, i + size) }] } })
  return out
}

/*
  쓰기 경로는 제목 속성 **이름**을 알아야 해서 DB 스키마를 한 번 물어본다
  (GET /databases/{id} — 행 조회는 POST .../query 다). 스텁이 그 둘을 구분해야 한다.
  속성 이름을 "이름" 으로 돌려준다 — 코드가 이름이 아니라 타입으로 찾는지 확인하려는 것이다.
*/
const isSchemaCall = (u, method) => u.includes("/databases/") && !u.includes("/query")
const schemaRes = () => ({
  ok: true,
  status: 200,
  json: async () => ({ properties: { 이름: { type: "title" }, 메모: { type: "rich_text" } } }),
})

function stubFetch({ dbStatus = 200, rows, blocks, throwOn }) {
  globalThis.fetch = async (url) => {
    const u = String(url)
    if (throwOn && u.includes(throwOn)) throw new Error("네트워크 끊김")
    if (isSchemaCall(u)) return schemaRes()
    if (u.includes("/query")) {
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
  // 실제 Notion 응답처럼 type 을 담고, 이름은 일부러 "Title" 이 아니다 —
  // 코드가 이름이 아니라 타입으로 제목 속성을 찾는지 스텁이 증명한다.
  properties: { 이름: { type: "title", title: [{ plain_text: title }] } },
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

  // ── 11. 폼 왕복 (#262 3단계) ──────────────────────────────────────────────
  //
  // 관리 화면은 이력서를 글상자로 펼쳐 보여 주고, 저장할 때 다시 데이터로 읽는다.
  // 그 왕복이 내용을 조용히 바꾸면 저장 한 번에 이력서가 달라진다 — 가장 무서운 결함이다.
  console.log("\n11. 글상자 왕복 — 펼쳤다가 다시 읽으면 원본과 같아야 한다")
  {
    const { text, resumeData, schema } = loadFresh()
    const form = text.encodeResume(resumeData)
    const back = text.decodeResume(form)

    check("읽는 데 성공한다", back.ok, back.ok ? "" : (back.problems || []).join(" / "))
    if (back.ok) {
      /*
        값이 같은지와 키 순서가 같은지를 **따로** 본다.

        둘을 한 번에 보면 순서만 다를 때도 JSON 덩어리가 통째로 찍혀서 무엇이 다른지
        읽을 수 없다(실제로 처음에 그랬다). 값이 다른 것은 결함이고, 순서가 다른 것은
        저장되는 JSON 이 요동친다는 뜻이라 성격이 다르다.
      */
      const sortKeys = (v) =>
        Array.isArray(v)
          ? v.map(sortKeys)
          : v && typeof v === "object"
            ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]))
            : v

      const same = (name, a, b) => {
        const valueSame = JSON.stringify(sortKeys(a)) === JSON.stringify(sortKeys(b))
        check(`왕복해도 값이 같다: ${name}`, valueSame, valueSame ? "" : firstDiff(a, b))
        if (valueSame)
          check(`왕복해도 키 순서가 같다: ${name}`, JSON.stringify(a) === JSON.stringify(b),
            "값은 같지만 순서가 다르다 — 저장되는 JSON 이 저장마다 요동친다")
      }

      // 값이 다를 때 어디가 다른지 짧게 찍는다. 전체를 찍으면 읽을 수 없다.
      function firstDiff(a, b) {
        const sa = JSON.stringify(a)
        const sb = JSON.stringify(b)
        let i = 0
        while (i < sa.length && sa[i] === sb[i]) i++
        return `\n     전: …${sa.slice(Math.max(0, i - 30), i + 70)}\n     후: …${sb.slice(Math.max(0, i - 30), i + 70)}`
      }
      same("연락처", resumeData.header.contacts, back.parts.contacts)
      same("핵심 역량", resumeData.skills, back.parts.skills)
      same("경력", resumeData.career, back.parts.career)
      same("사이드", resumeData.side, back.parts.side)
      same("학력", resumeData.education, back.parts.education)

      // 왕복한 값으로 이력서를 다시 조립해도 스키마를 통과해야 한다.
      const rebuilt = {
        header: { ...resumeData.header, contacts: back.parts.contacts },
        metrics: resumeData.metrics,
        skills: back.parts.skills,
        career: back.parts.career,
        side: back.parts.side,
        education: back.parts.education,
        footer: resumeData.footer,
      }
      check("다시 조립한 이력서가 스키마를 통과한다", schema.validateResume(rebuilt).ok)
      check(
        "다시 조립한 이력서가 원본과 한 글자도 다르지 않다",
        JSON.stringify(rebuilt) === JSON.stringify(resumeData)
      )
    }
  }

  console.log("\n12. 글상자 문법 오류를 줄 번호와 함께 잡는다")
  {
    const { text, resumeData } = loadFresh()
    const base = text.encodeResume(resumeData)

    const bad = [
      ["항목(-)이 프로젝트 밖에 있다", { career: "- 2024 | 떠 있는 항목" }],
      ["회사(##)가 없다", { career: "# 프로젝트\n- 2024 | 항목" }],
      ["프로젝트에 항목이 없다", { career: "## 회사\n# 프로젝트" }],
      ["시작 기호가 없다", { career: "## 회사\n그냥 문장" }],
      ["스킬에 주로 쓰는 것이 없다", { skills: "Backend" }],
      ["학력에 기간이 없다", { education: "학교 이름" }],
      ["연락처가 비었다", { contacts: "" }],
      ["사이드가 비었다", { side: "" }],
    ]
    for (const [name, patch] of bad) {
      const r = text.decodeResume({ ...base, ...patch })
      check(`막는다: ${name}`, r.ok === false, "통과해 버렸다")
    }

    // 연도 없는 항목은 두 형태 모두 허용한다.
    for (const form of ["## 회사\n# P\n- | 본문", "## 회사\n# P\n- 본문"]) {
      const r = text.decodeResume({ ...base, career: form })
      check(
        `허용한다: 연도 없는 항목 (${JSON.stringify(form.split("\n")[2])})`,
        r.ok === true && r.parts.career[1].bullets[0].year === undefined,
        r.ok ? JSON.stringify(r.parts.career[1].bullets[0]) : (r.problems || []).join(" / ")
      )
    }
  }

  console.log("\n13. 저장용 코드 블록 쪼개기")
  {
    const { notionResume, resumeData } = loadFresh()
    const blocks = notionResume.resumeToBlocks(resumeData)
    check("여러 블록으로 쪼개진다", blocks.length > 1, `${blocks.length}개`)
    check(
      "모든 블록이 2000자 이하다",
      blocks.every((b) => b.code.rich_text[0].text.content.length <= 2000)
    )
    check(
      "모든 블록이 code · json 이다",
      blocks.every((b) => b.type === "code" && b.code.language === "json")
    )
    /*
      **읽는 쪽과 같은 방식으로 이어 붙인다.**

      전에는 여기서 `"\n"` 으로 이어 붙였는데 실제 코드(joinCodeText)는 `""` 로 붙인다.
      그래서 이 검사는 진짜 복원 경로를 재지 않았고, 긴 줄이 글자 수로 잘리는 경우에는
      **올바른 코드에서 오히려 실패**했다(문자열 안에 개행이 끼어 든다). 검사에서 지적된 것이다.
    */
    const join = (bs) => bs.map((b) => b.code.rich_text[0].text.content).join("")
    const joined = join(blocks)
    check("이어 붙이면 원문이 글자 하나까지 복원된다", joined === JSON.stringify(resumeData, null, 2))
    let parsed = null
    try {
      parsed = JSON.parse(joined)
    } catch {
      /* 아래 check 에서 잡는다 */
    }
    check("이어 붙이면 다시 읽힌다", parsed !== null)
    check("이어 붙인 내용이 원본과 같다", JSON.stringify(parsed) === JSON.stringify(resumeData))

    // 한 줄이 혼자 2000자를 넘는 경우 — 줄 경계로 자를 수 없어 글자 수로 자른다.
    const long = JSON.parse(JSON.stringify(resumeData))
    long.career[1].bullets[0].text = `아주 긴 항목 ${"가".repeat(2600)} 끝`
    const longBlocks = notionResume.resumeToBlocks(long)
    check(
      "긴 줄도 모든 블록이 2000자 이하다",
      longBlocks.every((b) => b.code.rich_text[0].text.content.length <= 2000)
    )
    check(
      "긴 줄도 이어 붙이면 복원된다",
      join(longBlocks) === JSON.stringify(long, null, 2)
    )
    let longParsed = null
    try {
      longParsed = JSON.parse(join(longBlocks))
    } catch {
      /* 아래 check 에서 잡는다 */
    }
    check("긴 줄도 다시 읽힌다", JSON.stringify(longParsed) === JSON.stringify(long))
  }

  // ── 14. 저장 (#262 3단계) ─────────────────────────────────────────────────
  //
  // 저장 전 검사가 가장 중요한 관문이다 — 이력서는 한 칸에 통째로 들어가므로 잘못된 값이
  // 들어가면 전체를 잃는다. 처음에는 이 시나리오가 없어서 "저장 전 검사를 없앤다" 돌연변이가
  // 하네스를 통과했다. 그래서 넣었다.
  console.log("\n14. 저장 — 검사를 통과하지 못한 값은 Notion 을 건드리지 않는다")
  {
    const { notionResume, resumeData } = loadFresh()
    const broken = JSON.parse(JSON.stringify(resumeData))
    broken.metrics = broken.metrics.slice(0, 2) // 3개가 아니다

    const calls = []
    globalThis.fetch = async (url, init) => {
      calls.push(`${init?.method || "GET"} ${String(url)}`)
      return { ok: true, status: 200, json: async () => ({ results: [], id: "new" }) }
    }

    let threw = null
    try {
      await notionResume.saveResume(broken)
    } catch (e) {
      threw = e
    }
    check("잘못된 값이면 던진다", threw !== null)
    check(
      "던지는 말에 무엇이 틀렸는지 담긴다",
      threw !== null && /metrics/.test(String(threw.message)),
      threw ? String(threw.message).slice(0, 120) : ""
    )
    check("Notion 을 한 번도 부르지 않는다", calls.length === 0, calls.join(" · "))
  }

  console.log("\n15. 저장 — 올바른 값은 붙인 뒤 옛 블록을 지운다")
  {
    const { notionResume, resumeData } = loadFresh()
    const calls = []
    globalThis.fetch = async (url, init) => {
      const u = String(url)
      const method = init?.method || "GET"
      calls.push(`${method} ${u.replace("https://api.notion.com/v1", "")}`)
      if (isSchemaCall(u)) return schemaRes()
      if (u.includes("/query") && method === "POST")
        // 제목이 resume 인 행이 이미 있다고 본다.
        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: [row("resume", "row-1")],
          }),
        }
      if (u.includes("/blocks/row-1/children") && method === "GET")
        return {
          ok: true,
          status: 200,
          json: async () => ({ results: [{ id: "old-1" }, { id: "old-2" }], has_more: false }),
        }
      return { ok: true, status: 200, json: async () => ({}) }
    }

    const res = await notionResume.saveResume(resumeData)
    check("저장한 행 id 를 돌려준다", res.pageId === "row-1", JSON.stringify(res))

    const appendAt = calls.findIndex((c) => c.startsWith("PATCH /blocks/row-1/children"))
    const firstDeleteAt = calls.findIndex((c) => c.startsWith("DELETE /blocks/"))
    check("새 블록을 붙인다", appendAt >= 0, calls.join(" · "))
    check("옛 블록을 지운다", firstDeleteAt >= 0, calls.join(" · "))
    // 순서가 뒤집히면 중간 실패 시 내용이 사라진다 (lib/notionWrite.ts replaceChildren).
    check(
      "붙이기가 지우기보다 먼저다",
      appendAt >= 0 && firstDeleteAt >= 0 && appendAt < firstDeleteAt,
      calls.join(" · ")
    )
    check("행을 새로 만들지 않는다", !calls.some((c) => c === "POST /pages"), calls.join(" · "))
  }

  console.log("\n16. 저장 — 행이 없으면 만든다")
  {
    const { notionResume, resumeData } = loadFresh()
    const calls = []
    globalThis.fetch = async (url, init) => {
      const u = String(url)
      const method = init?.method || "GET"
      calls.push(`${method} ${u.replace("https://api.notion.com/v1", "")}`)
      if (isSchemaCall(u)) return schemaRes()
      if (u.includes("/query") && method === "POST")
        return { ok: true, status: 200, json: async () => ({ results: [] }) }
      if (u.endsWith("/pages") && method === "POST")
        return { ok: true, status: 200, json: async () => ({ id: "made" }) }
      return { ok: true, status: 200, json: async () => ({ results: [], has_more: false }) }
    }
    const res = await notionResume.saveResume(resumeData)
    check("행을 만든다", calls.some((c) => c === "POST /pages"), calls.join(" · "))
    check("만든 행에 쓴다", res.pageId === "made", JSON.stringify(res))
  }

  // ── 18~21. 검사(#266)에서 지적된 것들 ────────────────────────────────────
  console.log("\n18. 칸이 넘치면 버리지 않고 알린다 (내용에 `|` 를 쓴 경우)")
  {
    const { text, resumeData } = loadFresh()
    const base = text.encodeResume(resumeData)
    const over = [
      ["항목 본문", { career: "## 회사\n# P\n- 2024 | A/B 테스트 | 전환율 12% 개선" }],
      ["스킬", { skills: "Backend | C# | EF | Kafka" }],
      ["학력", { education: "학교 | 2020 – 2024 | 전공 | 남는 칸" }],
      ["연락처", { contacts: "메일 | mailto:a@b.c | 남는 칸" }],
      ["회사", { career: "## 회사 | 기간 | 역할 | 남는 칸\n# P\n- 항목" }],
      ["프로젝트", { career: "## 회사\n# P | 기간 | 설명 | 남는 칸\n- 항목" }],
    ]
    for (const [name, patch] of over) {
      const r = text.decodeResume({ ...base, ...patch })
      const said = !r.ok && r.problems.some((p) => p.includes("칸이"))
      check(`알린다: ${name} 에 칸이 많다`, said, r.ok ? "통과해 버렸다" : r.problems.join(" / "))
    }
  }

  console.log("\n19. 연락처 주소는 허용된 형태만 받는다")
  {
    const { text, schema, resumeData } = loadFresh()
    const base = text.encodeResume(resumeData)
    for (const bad of ["javascript:alert(1)", "data:text/html,x", "JavaScript:alert(1)"]) {
      const r = text.decodeResume({ ...base, contacts: `이름 | ${bad}` })
      check(`막는다: ${bad}`, r.ok === false, "통과해 버렸다")
    }
    for (const good of ["mailto:a@b.c", "https://x.dev", "http://x.dev", "/about/resume"]) {
      const r = text.decodeResume({ ...base, contacts: `이름 | ${good}` })
      check(`허용한다: ${good}`, r.ok === true, r.ok ? "" : r.problems.join(" / "))
    }
    // 폼을 거치지 않고 Notion 에서 직접 넣은 값도 막아야 한다 — 읽기 경로 검사.
    const evil = JSON.parse(JSON.stringify(resumeData))
    evil.header.contacts[0].href = "javascript:alert(1)"
    check("읽기 경로에서도 막는다", schema.validateResume(evil).ok === false)
  }

  console.log("\n20. 저장은 제목이 맞는 행에만 쓴다 (엉뚱한 행을 덮지 않는다)")
  {
    const { notionResume, resumeData } = loadFresh()
    const calls = []
    globalThis.fetch = async (url, init) => {
      const u = String(url)
      const method = init?.method || "GET"
      calls.push(`${method} ${u.replace("https://api.notion.com/v1", "")}`)
      if (isSchemaCall(u)) return schemaRes()
      if (u.includes("/query") && method === "POST") {
        // 제목으로 걸러 조회하므로 메모 행은 결과에 오지 않는다.
        const body = JSON.parse(init.body)
        check("제목으로 걸러 조회한다", Boolean(body.filter), JSON.stringify(body).slice(0, 120))
        return { ok: true, status: 200, json: async () => ({ results: [] }) }
      }
      if (u.endsWith("/pages") && method === "POST")
        return { ok: true, status: 200, json: async () => ({ id: "made" }) }
      return { ok: true, status: 200, json: async () => ({ results: [], has_more: false }) }
    }
    const res = await notionResume.saveResume(resumeData)
    check("메모 행을 덮지 않고 새로 만든다", res.pageId === "made", calls.join(" · "))
  }

  console.log("\n21. 옛 블록을 지우지 못하면 알린다 (조용히 성공하지 않는다)")
  {
    const { notionResume, resumeData } = loadFresh()
    globalThis.fetch = async (url, init) => {
      const u = String(url)
      const method = init?.method || "GET"
      if (isSchemaCall(u)) return schemaRes()
      if (u.includes("/query") && method === "POST")
        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: [row("resume", "row-1")],
          }),
        }
      if (u.includes("/blocks/row-1/children") && method === "GET")
        return { ok: true, status: 200, json: async () => ({ results: [{ id: "old-1" }] }) }
      if (method === "DELETE") return { ok: false, status: 429 } // 지우기 실패
      return { ok: true, status: 200, json: async () => ({}) }
    }
    let threw = null
    try {
      await notionResume.saveResume(resumeData)
    } catch (e) {
      threw = e
    }
    check("던진다", threw !== null)
    check(
      "무엇을 해야 하는지 알려 준다",
      threw !== null && /지우지 못했습니다/.test(String(threw.message)),
      threw ? String(threw.message).slice(0, 140) : ""
    )
  }

  /*
    22. /about 이 이력서와 같은 출처를 읽는지 — **소스를 읽어서** 확인한다.

    이것만 실행으로 잡을 수 없다. /about 이 컴파일된 lib/resumeData.ts 를 읽어도 env 가 없는
    환경에서는 폴백과 값이 같아 렌더 비교로는 구별되지 않는다. 실제로 그래서 놓쳤고,
    저장한 뒤에야 갈라지는 결함이었다(#266 검사에서 잡힘).

    그래서 test-shiki-contrast.mjs 처럼 정본(소스)을 직접 센다.
  */
  console.log("\n22. /about 이 이력서와 같은 출처를 읽는다 (소스 확인)")
  {
    const raw = readFileSync("app/(site)/about/page.tsx", "utf8")

    /*
      **주석을 걷어내고 센다.** 처음에는 걷지 않아서, 이 파일에 적어 둔 설명 문구
      ("이제 이곳도 getResume() 을 부른다")가 호출로 잡혔다 — 호출을 지워도 검사가 통과했다.
      돌연변이를 태워서 알아냈다. 자기 설명에 속는 검사는 아무것도 지키지 못한다.
    */
    const src = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "")

    check("await getResume() 를 부른다", /await\s+getResume\s*\(/.test(src))
    check(
      "resumeData 를 값으로 가져오지 않는다",
      !/import\s+(?!type\b)[^\n]*from\s+["'][^"']*lib\/resumeData["']/.test(src),
      "값으로 가져오면 저장해도 /about 이 안 바뀐다 (타입 import 는 괜찮다)"
    )
    check(
      "컴파일된 배열에서 스킬을 만들지 않는다",
      !/resumeData\s*\.\s*skills/.test(src),
      "resumeData.skills 를 쓰면 Notion 값이 아니라 코드 값이 나온다"
    )
  }

  // ── 23~25. 저장 전 규칙 검사 (#262 4단계) ────────────────────────────────
  console.log("\n23. 지금 이력서는 규칙을 지킨다 (기준선)")
  {
    const { rules, resumeData } = loadFresh()
    const r = rules.checkResumeRules(resumeData)
    check("막을 것이 없다", r.errors.length === 0, r.errors.join(" / "))
    check("알릴 것도 없다", r.warnings.length === 0, r.warnings.join(" / "))
  }

  console.log("\n24. 막는 것 — 어기면 #256 이 없앤 상태로 돌아가는 것")
  {
    const { rules, resumeData } = loadFresh()
    const clone = () => JSON.parse(JSON.stringify(resumeData))

    const bad = [
      [
        "항목에 굵은 강조가 둘",
        (d) => (d.career[1].bullets[0].text = "**하나** 그리고 **둘**"),
      ],
      ["소개 문단에 굵은 강조", (d) => (d.header.tagline = "서버를 **만듭니다**.")],
      ["소개 문단에 칩", (d) => (d.header.tagline = "서버를 `194 → 3ms` 만듭니다.")],
      [
        "사이드 항목에 굵은 강조가 둘",
        (d) => (d.side[0] = "**농구** 서비스 — **React** 로 만들었다"),
      ],
    ]
    for (const [name, mutate] of bad) {
      const d = clone()
      mutate(d)
      const r = rules.checkResumeRules(d)
      check(`막는다: ${name}`, r.errors.length > 0, "통과해 버렸다")
    }

    // 강조 하나는 규칙이다 — 막지 않아야 한다.
    const one = clone()
    one.career[1].bullets[0].text = "무엇을 해서 **어떤 결과**가 났다"
    check("허용한다: 강조 하나", rules.checkResumeRules(one).errors.length === 0)
  }

  console.log("\n25. 알리는 것 — 사람이 판단할 분량과 칩")
  {
    const { rules, resumeData } = loadFresh()
    const clone = () => JSON.parse(JSON.stringify(resumeData))

    const chip = clone()
    chip.career[1].bullets[0].text = "`SignalR` 로 이벤트를 처리했다"
    const chipR = rules.checkResumeRules(chip)
    check("알린다: 칩에 숫자가 없다", chipR.warnings.some((w) => w.includes("숫자")))
    check("막지는 않는다: 칩", chipR.errors.length === 0, chipR.errors.join(" / "))

    /*
      문구를 **그 규칙만의 말**로 맞춘다. 처음에는 "자입니다" 로 봤는데 본문 길이 경고
      ("본문이 N자입니다")도 같은 말을 담아서, 항목 길이 규칙이 죽어 있어도 통과할 수 있었다.
      실제로는 그 돌연변이에서 본문이 상한 아래라 우연히 참이었을 뿐이다 (검사 지적).
    */
    const long = clone()
    long.career[1].bullets[0].text = `길다 ${"가".repeat(230)}`
    const longW = rules.checkResumeRules(long).warnings
    check("알린다: 항목이 너무 길다", longW.some((w) => w.includes("줄을 많이 먹습니다")), longW.join(" / "))

    /*
      분량 경고의 기준은 실측이다 — 항목 +12(총 31개)에서 인쇄가 3쪽이 됐고 +10(29개)은
      2쪽이었다. 그래서 25개를 넘으면 알린다. 여기서는 그 상한이 실제로 걸리는지 본다.
    */
    const many = clone()
    // 실제 항목 평균이 95자다. 짧은 더미를 쓰면 글자 수 상한에 못 미쳐 그 경고를 못 잰다
    // (처음에 48자짜리를 써서 실제로 그랬다).
    const pad = (i) => ({ year: "2026", text: `채움 ${i} — ${"가".repeat(85)}` })
    for (let i = 0; i < 10; i++) many.career[1].bullets.push(pad(i))
    const manyR = rules.checkResumeRules(many)
    check("알린다: 항목 수가 많다", manyR.warnings.some((w) => w.includes("항목이")))
    check("알린다: 본문이 길다", manyR.warnings.some((w) => w.includes("본문이")))
    check("막지는 않는다: 분량", manyR.errors.length === 0, manyR.errors.join(" / "))

    // 사이드 항목도 같은 지면에서 줄을 차지한다 — 경력만 세면 이쪽이 늘어도 조용하다.
    const manySide = clone()
    for (let i = 0; i < 14; i++) manySide.side.push(`채움 사이드 ${i} — 짧은 한 줄`)
    check(
      "알린다: 사이드 항목이 많아도 센다",
      rules.checkResumeRules(manySide).warnings.some((w) => w.includes("항목이")),
      rules.checkResumeRules(manySide).warnings.join(" / ")
    )

    // 회사·학력이 늘어난 경우 — 전에는 이 글자들을 세지 않아 조용했다.
    const manyEdu = clone()
    for (let i = 0; i < 8; i++)
      manyEdu.education.push({
        name: `교육 과정 ${i} — 이름을 길게 적은 경우`,
        meta: "2020.01 – 2020.12",
        desc: "배운 것을 길게 적는다. 실제 학력 항목의 설명 길이에 맞춘 문장이다.",
      })
    check(
      "알린다: 학력이 늘어난 것도 분량에 든다",
      rules.checkResumeRules(manyEdu).warnings.some((w) => w.includes("본문이")),
      rules.checkResumeRules(manyEdu).warnings.join(" / ")
    )
  }

  console.log("\n26. 저장 — 규칙을 어기면 Notion 을 건드리지 않는다")
  {
    const { notionResume, resumeData } = loadFresh()
    const broken = JSON.parse(JSON.stringify(resumeData))
    broken.career[1].bullets[0].text = "**하나** 그리고 **둘**" // 모양은 맞지만 규칙 위반

    const calls = []
    globalThis.fetch = async (url, init) => {
      calls.push(`${init?.method || "GET"} ${String(url)}`)
      return { ok: true, status: 200, json: async () => ({ results: [], id: "x" }) }
    }
    let threw = null
    try {
      await notionResume.saveResume(broken)
    } catch (e) {
      threw = e
    }
    check("던진다", threw !== null)
    check(
      "규칙 위반임을 알려 준다",
      threw !== null && /규칙|강조/.test(String(threw.message)),
      threw ? String(threw.message).slice(0, 120) : ""
    )
    check("Notion 을 부르지 않는다", calls.length === 0, calls.join(" · "))
  }

  console.log("\n27. 저장 — 경고는 막지 않고 돌려준다")
  {
    const { notionResume, resumeData } = loadFresh()
    const warny = JSON.parse(JSON.stringify(resumeData))
    warny.career[1].bullets[0].text = "`SignalR` 로 이벤트를 처리했다"
    globalThis.fetch = async (url, init) => {
      const u = String(url)
      const method = init?.method || "GET"
      if (isSchemaCall(u)) return schemaRes()
      if (u.includes("/query") && method === "POST")
        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: [row("resume", "row-1")],
          }),
        }
      if (u.includes("/blocks/row-1/children") && method === "GET")
        return { ok: true, status: 200, json: async () => ({ results: [] }) }
      return { ok: true, status: 200, json: async () => ({}) }
    }
    const res = await notionResume.saveResume(warny)
    check("저장된다", res.pageId === "row-1")
    check("경고를 함께 돌려준다", (res.warnings || []).length > 0, JSON.stringify(res.warnings))
  }

  // ── 28~30. 제목 속성 이름에 의존하지 않는다 ──────────────────────────────
  //
  // 실제로 걸린 것이다. 안내를 따라 `Title` 이라는 **텍스트 열**을 새로 만들었더니
  // 저장이 400 으로 실패했다 — "Title is expected to be rich_text."
  // 이름이 맞아도 타입이 다르면 실패하고, 타입이 맞아도 이름이 다르면 실패했다.
  console.log('\n28. 제목 열 이름이 "Title" 이 아니어도 읽는다')
  {
    const { notionResume, resumeData } = loadFresh()
    const json = JSON.stringify(resumeData, null, 2)
    globalThis.fetch = async (url) => {
      const u = String(url)
      if (u.includes("/query"))
        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: [
              {
                id: "row-1",
                properties: {
                  // 제목 열은 한국어 UI 기본 이름, 그 옆에 텍스트 열 Title 이 미끼로 있다.
                  이름: { type: "title", title: [{ plain_text: "resume" }] },
                  Title: { type: "rich_text", rich_text: [{ plain_text: "엉뚱한 값" }] },
                },
              },
            ],
          }),
        }
      if (u.includes("/blocks/"))
        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: [{ type: "code", code: { rich_text: [{ plain_text: json }] } }],
          }),
        }
      return { ok: true, status: 200, json: async () => ({}) }
    }
    const r = await notionResume.getResume()
    check("Notion 에서 읽는다", r.source.from === "notion", JSON.stringify(r.source))
    // json 은 들여쓴 문자열이므로 압축본끼리 비교한다(처음에 이 둘을 그냥 비교해 실패했다).
    check(
      "미끼 Title(rich_text) 을 제목으로 보지 않는다",
      JSON.stringify(r.data) === JSON.stringify(resumeData)
    )
  }

  console.log("\n29. 저장 — 스키마에서 찾은 이름으로 행을 만든다")
  {
    const { notionResume, resumeData } = loadFresh()
    let createBody = null
    let queryBody = null
    globalThis.fetch = async (url, init) => {
      const u = String(url)
      const method = init?.method || "GET"
      if (u.includes("/databases/") && !u.includes("/query"))
        return {
          ok: true,
          status: 200,
          json: async () => ({
            properties: {
              Title: { type: "rich_text" }, // 미끼
              제목: { type: "title" }, // 진짜
            },
          }),
        }
      if (u.includes("/query")) {
        queryBody = JSON.parse(init.body)
        return { ok: true, status: 200, json: async () => ({ results: [] }) }
      }
      if (u.endsWith("/pages") && method === "POST") {
        createBody = JSON.parse(init.body)
        return { ok: true, status: 200, json: async () => ({ id: "made" }) }
      }
      return { ok: true, status: 200, json: async () => ({ results: [], has_more: false }) }
    }
    const res = await notionResume.saveResume(resumeData)
    check("행을 만든다", res.pageId === "made")
    check(
      "진짜 제목 속성 이름을 쓴다",
      Boolean(createBody?.properties?.["제목"]?.title),
      JSON.stringify(createBody?.properties)
    )
    check(
      "미끼 Title 에는 쓰지 않는다",
      createBody?.properties?.Title === undefined,
      JSON.stringify(createBody?.properties)
    )
    check(
      "필터도 진짜 이름으로 건다",
      queryBody?.filter?.property === "제목",
      JSON.stringify(queryBody?.filter)
    )
    check(
      "필터가 대소문자를 가리지 않는다 (contains)",
      queryBody?.filter?.title?.contains === "resume",
      JSON.stringify(queryBody?.filter)
    )
  }

  console.log("\n30. 저장 — 제목 속성이 없으면 무엇이 문제인지 말한다")
  {
    const { notionResume, resumeData } = loadFresh()
    globalThis.fetch = async (url) => {
      const u = String(url)
      if (u.includes("/databases/") && !u.includes("/query"))
        // 데이터베이스가 아니라 일반 페이지 ID 를 넣은 경우 이렇게 보인다.
        return { ok: true, status: 200, json: async () => ({ properties: {} }) }
      return { ok: true, status: 200, json: async () => ({ results: [] }) }
    }
    let threw = null
    try {
      await notionResume.saveResume(resumeData)
    } catch (e) {
      threw = e
    }
    check("던진다", threw !== null)
    check(
      "일반 페이지 ID 를 의심하라고 알려 준다",
      threw !== null && /제목\(title\) 속성이 없습니다/.test(String(threw.message)),
      threw ? String(threw.message).slice(0, 160) : ""
    )
  }

  console.log("\n17. 저장 — env 가 없으면 부르기 전에 막는다")
  {
    delete process.env.NOTION_RESUME_DB
    const { notionResume, resumeData } = loadFresh()
    let threw = null
    globalThis.fetch = async () => {
      throw new Error("불렀으면 안 된다")
    }
    try {
      await notionResume.saveResume(resumeData)
    } catch (e) {
      threw = e
    }
    check("던진다", threw !== null)
    check(
      "env 이름을 알려 준다",
      threw !== null && /NOTION_RESUME_DB|NOTION_TOKEN/.test(String(threw.message)),
      threw ? String(threw.message) : ""
    )
    process.env.NOTION_RESUME_DB = "test-db"
  }

  console.log(`\n통과 ${pass} · 실패 ${fail}`)
  if (fail) process.exit(1)
}

run().catch((e) => {
  unsilence()
  console.error(e)
  process.exit(2)
})
