/*
  Notion 에서 읽어 온 값이 정말 ResumeData 인지 확인한다 (#262 2단계).

  ## 왜 이게 필요한가

  이력서를 **한 칸에 JSON 통째로** 저장하기로 정했다(#262 코멘트). 그 선택의 대가는
  **한 번 잘못 쓰면 전부 잃는다**는 것이다. 속성을 여러 개로 쪼갠 구조라면 한 칸이 깨져도
  나머지가 남지만, 여기서는 파싱이 실패하는 순간 이력서 전체가 사라진다.

  그래서 읽기 경로에 검사를 둔다. 모양이 다르면 화면을 깨뜨리지 않고 lib/resumeData.ts
  폴백으로 떨어진다. 3·4단계에서 **쓰기 전에도 같은 검사**를 돌린다 — 읽기에서만 막으면
  잘못된 값이 이미 저장된 뒤에 발견된다.

  ## 왜 손으로 쓰는가

  zod 같은 것을 넣지 않는다. 이 저장소는 지금까지 스키마 검증 의존성이 없고, 검사할 모양이
  고정(#262 에서 "고정 골격"으로 정함)이라 손으로 쓰는 비용이 라이브러리를 들이는 비용보다
  작다. 새 의존성은 package-lock 과 Dependabot 표면을 함께 늘린다.

  ## 검사가 하지 않는 것

  내용이 **말이 되는지**는 보지 않는다 — 연도가 미래인지, 강조가 항목당 하나인지 같은 것은
  4단계의 저장 전 검사가 본다. 여기서는 **타입과 필수 항목만** 본다.
*/

import type {
  ResumeBullet,
  ResumeCareerEntry,
  ResumeContact,
  ResumeData,
  ResumeEduItem,
  ResumeHeader,
  ResumeMetric,
  ResumeSkillRow,
} from "./resumeData"

/** 어디가 왜 틀렸는지 남긴다. 폴백으로 조용히 떨어지면 원인을 찾을 수 없다. */
export type ResumeValidation =
  | { ok: true; data: ResumeData }
  | { ok: false; problems: string[] }

type Obj = Record<string, unknown>

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v)
const isStr = (v: unknown): v is string => typeof v === "string"
const isBool = (v: unknown): v is boolean => typeof v === "boolean"

/** 비어 있지 않은 문자열. 빈 문자열은 대개 "칸을 만들었지만 안 채운" 상태다. */
const isText = (v: unknown): v is string => isStr(v) && v.trim().length > 0

/*
  연락처 주소로 허용할 형태.

  이 값은 공개 화면에서 `<a href={...}>` 로 그대로 나간다(components/resumeDoc.tsx).
  아무 문자열이나 허용하면 `javascript:` 를 넣어 실행되는 링크를 만들 수 있다 — 관리 화면은
  본인만 쓰지만, **이력서 내용은 Notion 이라는 별도 표면에서도 고쳐진다.** 그쪽으로 들어온
  값은 폼을 거치지 않으므로 스키마(읽기 경로)에서 막아야 한다. 검사에서 잡힌 지적이다.

  상대 경로(`/about`)도 허용한다 — 사이트 안을 가리키는 연락처 줄을 쓸 수 있다.
*/
export function isSafeHref(v: string): boolean {
  const s = v.trim()
  if (s.startsWith("/")) return true
  return /^(mailto:|https?:\/\/)/i.test(s)
}

function checkContact(v: unknown, at: string, out: string[]): ResumeContact | null {
  if (!isObj(v)) return (out.push(`${at}: 객체가 아니다`), null)
  if (!isText(v.text)) return (out.push(`${at}.text: 빈 문자열이거나 문자열이 아니다`), null)
  if (v.href !== undefined) {
    if (!isText(v.href)) {
      out.push(`${at}.href: 있으면 문자열이어야 한다`)
      return null
    }
    if (!isSafeHref(v.href)) {
      out.push(`${at}.href: mailto: · https: · http: 또는 \`/\` 로 시작해야 한다`)
      return null
    }
  }
  return { text: v.text, ...(v.href ? { href: v.href as string } : {}) }
}

function checkHeader(v: unknown, out: string[]): ResumeHeader | null {
  if (!isObj(v)) return (out.push("header: 객체가 아니다"), null)
  for (const k of ["eyebrow", "name", "nameSub", "tagline"]) {
    if (!isText(v[k])) out.push(`header.${k}: 빈 문자열이거나 문자열이 아니다`)
  }
  if (!Array.isArray(v.contacts) || v.contacts.length === 0) {
    out.push("header.contacts: 최소 하나가 있어야 한다")
    return null
  }
  const contacts = v.contacts.map((c, i) => checkContact(c, `header.contacts[${i}]`, out))
  if (out.length || contacts.some((c) => c === null)) return null
  return {
    eyebrow: v.eyebrow as string,
    name: v.name as string,
    nameSub: v.nameSub as string,
    tagline: v.tagline as string,
    contacts: contacts as ResumeContact[],
  }
}

function checkMetric(v: unknown, at: string, out: string[]): ResumeMetric | null {
  if (!isObj(v)) return (out.push(`${at}: 객체가 아니다`), null)
  if (!isText(v.value)) out.push(`${at}.value: 빈 문자열이거나 문자열이 아니다`)
  if (v.from !== undefined && !isStr(v.from)) out.push(`${at}.from: 문자열이어야 한다`)
  if (v.after !== undefined && !isStr(v.after)) out.push(`${at}.after: 문자열이어야 한다`)
  if (v.arrow !== undefined && !isBool(v.arrow)) out.push(`${at}.arrow: 참/거짓이어야 한다`)
  if (v.afterSmall !== undefined && !isBool(v.afterSmall))
    out.push(`${at}.afterSmall: 참/거짓이어야 한다`)
  // 지표 띠는 자리가 좁다. 줄이 셋 이상이면 조판이 깨지므로 여기서 막는다.
  if (!Array.isArray(v.label) || v.label.length === 0 || v.label.length > 2)
    out.push(`${at}.label: 한 줄 또는 두 줄이어야 한다`)
  else if (!v.label.every(isText)) out.push(`${at}.label: 빈 줄이 있다`)
  return out.length ? null : (v as unknown as ResumeMetric)
}

function checkSkill(v: unknown, at: string, out: string[]): ResumeSkillRow | null {
  if (!isObj(v)) return (out.push(`${at}: 객체가 아니다`), null)
  if (!isText(v.group)) out.push(`${at}.group: 빈 문자열이거나 문자열이 아니다`)
  if (!isText(v.primary)) out.push(`${at}.primary: 빈 문자열이거나 문자열이 아니다`)
  if (v.also !== undefined && !isStr(v.also)) out.push(`${at}.also: 문자열이어야 한다`)
  return out.length ? null : (v as unknown as ResumeSkillRow)
}

function checkBullet(v: unknown, at: string, out: string[]): ResumeBullet | null {
  if (!isObj(v)) return (out.push(`${at}: 객체가 아니다`), null)
  if (!isText(v.text)) out.push(`${at}.text: 빈 문자열이거나 문자열이 아니다`)
  if (v.year !== undefined && !isStr(v.year)) out.push(`${at}.year: 문자열이어야 한다`)
  return out.length ? null : (v as unknown as ResumeBullet)
}

function checkCareer(v: unknown, at: string, out: string[]): ResumeCareerEntry | null {
  if (!isObj(v)) return (out.push(`${at}: 객체가 아니다`), null)
  if (v.kind === "job") {
    if (!isText(v.org)) out.push(`${at}.org: 빈 문자열이거나 문자열이 아니다`)
    for (const k of ["when", "role"]) {
      if (v[k] !== undefined && !isStr(v[k])) out.push(`${at}.${k}: 문자열이어야 한다`)
    }
    return out.length ? null : (v as unknown as ResumeCareerEntry)
  }
  if (v.kind === "project") {
    // 이름이 빈 프로젝트가 실제로 있다(인지소프트 아래 블록). 그래서 isText 가 아니다.
    if (!isStr(v.name)) out.push(`${at}.name: 문자열이어야 한다 (빈 문자열은 허용)`)
    for (const k of ["when", "desc"]) {
      if (v[k] !== undefined && !isStr(v[k])) out.push(`${at}.${k}: 문자열이어야 한다`)
    }
    if (v.star !== undefined && !isBool(v.star)) out.push(`${at}.star: 참/거짓이어야 한다`)
    if (!Array.isArray(v.bullets) || v.bullets.length === 0) {
      out.push(`${at}.bullets: 최소 하나가 있어야 한다`)
      return null
    }
    v.bullets.forEach((b, i) => checkBullet(b, `${at}.bullets[${i}]`, out))
    return out.length ? null : (v as unknown as ResumeCareerEntry)
  }
  out.push(`${at}.kind: "job" 또는 "project" 여야 한다 (받은 값: ${JSON.stringify(v.kind)})`)
  return null
}

function checkEdu(v: unknown, at: string, out: string[]): ResumeEduItem | null {
  if (!isObj(v)) return (out.push(`${at}: 객체가 아니다`), null)
  if (!isText(v.name)) out.push(`${at}.name: 빈 문자열이거나 문자열이 아니다`)
  if (!isText(v.meta)) out.push(`${at}.meta: 빈 문자열이거나 문자열이 아니다`)
  if (v.desc !== undefined && !isStr(v.desc)) out.push(`${at}.desc: 문자열이어야 한다`)
  return out.length ? null : (v as unknown as ResumeEduItem)
}

function checkList(
  v: unknown,
  at: string,
  out: string[],
  each: (item: unknown, at: string, out: string[]) => unknown
): boolean {
  if (!Array.isArray(v) || v.length === 0) {
    out.push(`${at}: 최소 하나가 있어야 한다`)
    return false
  }
  v.forEach((item, i) => each(item, `${at}[${i}]`, out))
  return true
}

/**
 * 값이 ResumeData 인지 확인한다. 통과하면 그 값을, 아니면 문제 목록을 돌려준다.
 * 던지지 않는다 — 부르는 쪽이 폴백으로 떨어질지 정한다.
 */
export function validateResume(input: unknown): ResumeValidation {
  const problems: string[] = []

  if (!isObj(input)) return { ok: false, problems: ["최상위가 객체가 아니다"] }

  checkHeader(input.header, problems)

  // 지표 띠는 3열 격자다. 개수가 다르면 빈 칸이 생기거나 넘친다.
  if (!Array.isArray(input.metrics) || input.metrics.length !== 3)
    problems.push(`metrics: 정확히 3개여야 한다 (받은 개수: ${
      Array.isArray(input.metrics) ? input.metrics.length : "배열이 아님"
    })`)
  else input.metrics.forEach((m, i) => checkMetric(m, `metrics[${i}]`, problems))

  checkList(input.skills, "skills", problems, checkSkill)
  checkList(input.career, "career", problems, checkCareer)
  checkList(input.education, "education", problems, checkEdu)

  if (!Array.isArray(input.side) || input.side.length === 0)
    problems.push("side: 최소 하나가 있어야 한다")
  else if (!input.side.every(isText)) problems.push("side: 빈 항목이 있다")

  // 경력에 회사가 하나도 없으면 프로젝트만 떠 있는 문서가 된다.
  if (Array.isArray(input.career) && !input.career.some((e) => isObj(e) && e.kind === "job"))
    problems.push("career: 회사(kind:'job') 가 최소 하나 있어야 한다")

  if (
    !Array.isArray(input.footer) ||
    input.footer.length !== 2 ||
    !input.footer.every(isText)
  )
    problems.push("footer: 문자열 두 개여야 한다")

  if (problems.length) return { ok: false, problems }
  return { ok: true, data: input as unknown as ResumeData }
}
