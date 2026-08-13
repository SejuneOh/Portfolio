/*
  관리 화면의 글상자 ↔ ResumeData 변환 (#262 3단계).

  ## 왜 글상자인가

  이력서에는 반복·중첩되는 부분이 있다 — 스킬 6행, 경력의 회사 → 프로젝트 → 항목(3단),
  학력 3항목. 이것을 전부 개별 입력칸으로 만들면 칸이 백 개 넘게 생기고, 행을 더하거나
  지우는 버튼까지 붙어야 한다.

  대신 **한 줄이 한 항목**인 글상자를 쓴다. 이력서 본문은 이미 `**결과**`·`` `194 → 3ms` ``
  같은 표기를 손으로 적는 텍스트이므로(#262 1단계), 편집 방식이 내용의 성질과 맞는다.
  줄을 지우면 항목이 사라지고 줄을 더하면 항목이 생긴다 — 버튼이 필요 없다.

  지표 띠(3개)는 예외로 개별 칸이다. 값·앞·뒤·화살표가 뒤섞여 한 줄로 적으면 규칙이
  마술처럼 되기 때문이다.

  ## 왜 순수 모듈인가

  변환이 서버 액션 안에 있으면 왕복(encode → decode)을 확인할 수 없다. 여기 떼어 두면
  **원본 → 글상자 → 원본이 정확히 같은지** 검사로 못 박을 수 있다
  (scripts/test-resume-fallback.mjs). 저장이 내용을 조용히 바꾸는 것이 가장 무서운 결함이다.

  ## 문법

      스킬     그룹 | 주로 쓰는 것 | 함께 쓰는 것(선택)
      사이드   한 줄에 하나 (본문 표기 그대로)
      학력     이름 | 기간 | 설명(선택)
      연락처   글자 | 주소(선택 — 없으면 링크가 아니다)

      경력
        ## 회사 | 기간 | 역할
        #  프로젝트 이름 | 기간 | 설명(선택)      ← 이름 앞에 ◆ 를 붙이면 별표가 붙는다
        -  연도 | 항목 본문                        ← 연도를 비우면 `- | 본문`

  구분자는 `|` 다. 내용에 `|` 를 쓸 일이 없어서 골랐다 — 만약 쓰이면 파싱이 어긋나므로
  decode 가 줄 번호와 함께 문제를 돌려준다.
*/

import type {
  ResumeCareerEntry,
  ResumeContact,
  ResumeData,
  ResumeEduItem,
  ResumeSkillRow,
} from "./resumeData"
import { isSafeHref } from "./resumeSchema"

/** 글상자로 펼친 이력서. 지표는 칸으로 받으므로 여기 없다. */
export interface ResumeTextForm {
  contacts: string
  skills: string
  career: string
  side: string
  education: string
}

const splitCells = (line: string) => line.split("|").map((c) => c.trim())

/*
  칸이 예상보다 많으면 **버리지 않고 알린다.**

  전에는 `const [a, b, c] = splitCells(...)` 로 받아 네 번째 칸부터 조용히 사라졌다. 저장하면
  Notion 이 정본이 되므로 사라진 글자는 되찾을 수 없는데, 이 파일 머리 주석은 "쓰이면 decode 가
  줄 번호와 함께 문제를 돌려준다"고 적고 있었다 — 문서가 거짓이었다. 검사에서 잡혔다.

  본문에 `|` 를 쓰고 싶은 경우가 실제로 있다("A/B 테스트 | 전환율 12% 개선"처럼). 그래서 조용히
  버리는 대신 어디가 문제인지 알려 주고, 사람이 그 줄을 고치게 한다.
*/
function tooManyCells(
  cells: string[],
  max: number,
  where: string,
  n: number,
  out: string[]
): boolean {
  if (cells.length <= max) return false
  out.push(
    `${where} ${n}번째 줄: 칸이 ${cells.length}개다 (최대 ${max}개). ` +
      `내용에 \`|\` 가 들어가면 칸으로 읽힌다 — 다른 기호로 바꾸라`
  )
  return true
}
const lines = (src: string) =>
  src
    .split("\n")
    .map((l, i) => ({ n: i + 1, text: l.trim() }))
    .filter((l) => l.text.length > 0)

// ── 내보내기 (데이터 → 글상자) ───────────────────────────────────────────────

const joinCells = (...cells: (string | undefined)[]) => {
  // 뒤쪽 빈 칸은 떨군다 — `이름 | 기간 |` 처럼 지저분해지지 않게.
  const out = cells.map((c) => c ?? "")
  while (out.length && out[out.length - 1] === "") out.pop()
  return out.join(" | ")
}

export function encodeResume(data: ResumeData): ResumeTextForm {
  const career: string[] = []
  for (const e of data.career) {
    if (e.kind === "job") {
      career.push(`## ${joinCells(e.org, e.when, e.role)}`)
      continue
    }
    career.push(`# ${joinCells(`${e.star ? "◆ " : ""}${e.name}`, e.when, e.desc)}`)
    for (const b of e.bullets) career.push(`- ${joinCells(b.year, b.text)}`)
  }

  return {
    contacts: data.header.contacts.map((c) => joinCells(c.text, c.href)).join("\n"),
    skills: data.skills.map((s) => joinCells(s.group, s.primary, s.also)).join("\n"),
    career: career.join("\n"),
    side: data.side.join("\n"),
    education: data.education.map((e) => joinCells(e.name, e.meta, e.desc)).join("\n"),
  }
}

// ── 읽어들이기 (글상자 → 데이터) ─────────────────────────────────────────────

export type ResumeDecode =
  | { ok: true; parts: Omit<ResumeData, "header" | "metrics" | "footer"> & { contacts: ResumeContact[] } }
  | { ok: false; problems: string[] }

export function decodeResume(form: ResumeTextForm): ResumeDecode {
  const problems: string[] = []

  const contacts: ResumeContact[] = []
  for (const { n, text } of lines(form.contacts)) {
    const cells = splitCells(text)
    if (tooManyCells(cells, 2, "연락처", n, problems)) continue
    const [label, href] = cells
    if (!label) problems.push(`연락처 ${n}번째 줄: 글자가 비어 있다`)
    else if (href && !isSafeHref(href))
      problems.push(
        `연락처 ${n}번째 줄: 주소는 mailto: · https: · http: 또는 \`/\` 로 시작해야 한다`
      )
    else contacts.push({ text: label, ...(href ? { href } : {}) })
  }
  if (contacts.length === 0) problems.push("연락처: 최소 한 줄이 있어야 한다")

  const skills: ResumeSkillRow[] = []
  for (const { n, text } of lines(form.skills)) {
    const cells = splitCells(text)
    if (tooManyCells(cells, 3, "핵심 역량", n, problems)) continue
    const [group, primary, also] = cells
    if (!group || !primary)
      problems.push(`핵심 역량 ${n}번째 줄: \`그룹 | 주로 쓰는 것\` 은 비울 수 없다`)
    else skills.push({ group, primary, ...(also ? { also } : {}) })
  }
  if (skills.length === 0) problems.push("핵심 역량: 최소 한 줄이 있어야 한다")

  const side = lines(form.side).map((l) => l.text)
  if (side.length === 0) problems.push("사이드 프로젝트: 최소 한 줄이 있어야 한다")

  const education: ResumeEduItem[] = []
  for (const { n, text } of lines(form.education)) {
    const cells = splitCells(text)
    if (tooManyCells(cells, 3, "학력", n, problems)) continue
    const [name, meta, desc] = cells
    if (!name || !meta)
      problems.push(`학력 ${n}번째 줄: \`이름 | 기간\` 은 비울 수 없다`)
    else education.push({ name, meta, ...(desc ? { desc } : {}) })
  }
  if (education.length === 0) problems.push("학력: 최소 한 줄이 있어야 한다")

  const career: ResumeCareerEntry[] = []
  for (const { n, text } of lines(form.career)) {
    // `##` 를 `#` 보다 먼저 본다 — 순서를 바꾸면 회사가 프로젝트로 읽힌다.
    if (text.startsWith("##")) {
      const cells = splitCells(text.slice(2))
      if (tooManyCells(cells, 3, "경력", n, problems)) continue
      const [org, when, role] = cells
      if (!org) problems.push(`경력 ${n}번째 줄: 회사 이름이 비어 있다`)
      else career.push({ kind: "job", org, ...(when ? { when } : {}), ...(role ? { role } : {}) })
      continue
    }
    if (text.startsWith("#")) {
      const cells = splitCells(text.slice(1))
      if (tooManyCells(cells, 3, "경력", n, problems)) continue
      const [rawName, when, desc] = cells
      const star = rawName.startsWith("◆")
      const name = star ? rawName.slice(1).trim() : rawName
      /*
        키를 넣는 순서를 lib/resumeData.ts 와 같게 둔다(star 가 name 앞).

        값이 같아도 순서가 다르면 저장되는 JSON 문자열이 달라진다. 이력서는 Notion 본문에
        직렬화해 넣으므로, 순서가 저장마다 흔들리면 내용이 그대로인데도 블록이 전부 다시
        쓰인다. 눈으로 확인하는 길이 이 저장 방식의 유일한 확인 수단이라 안정적으로 둔다.
      */
      career.push({
        kind: "project",
        ...(star ? { star: true } : {}),
        name, // 이름이 빈 프로젝트는 실제로 있다(인지소프트 아래 블록)
        ...(when ? { when } : {}),
        ...(desc ? { desc } : {}),
        bullets: [],
      })
      continue
    }
    if (text.startsWith("-")) {
      const last = career[career.length - 1]
      if (!last || last.kind !== "project") {
        problems.push(`경력 ${n}번째 줄: 항목(-)이 프로젝트(#) 아래에 있지 않다`)
        continue
      }
      const cells = splitCells(text.slice(1))
      if (tooManyCells(cells, 2, "경력", n, problems)) continue
      // `- 본문` 처럼 칸이 하나면 연도가 없는 것으로 본다.
      const [year, body] = cells.length >= 2 ? cells : ["", cells[0] || ""]
      if (!body) problems.push(`경력 ${n}번째 줄: 항목 본문이 비어 있다`)
      else last.bullets.push({ ...(year ? { year } : {}), text: body })
      continue
    }
    problems.push(`경력 ${n}번째 줄: \`##\`(회사) · \`#\`(프로젝트) · \`-\`(항목) 으로 시작해야 한다`)
  }

  for (const e of career) {
    if (e.kind === "project" && e.bullets.length === 0)
      problems.push(`경력: 프로젝트 "${e.name || "(이름 없음)"}" 에 항목(-)이 없다`)
  }
  if (!career.some((e) => e.kind === "job")) problems.push("경력: 회사(##) 가 최소 하나 있어야 한다")

  if (problems.length) return { ok: false, problems }
  return { ok: true, parts: { contacts, skills, career, side, education } }
}
