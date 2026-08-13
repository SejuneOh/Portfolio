/*
  저장 전 규칙 검사 (#262 4단계).

  ## 스키마 검사와 무엇이 다른가

  lib/resumeSchema.ts 는 **모양**을 본다 — 타입이 맞는지, 필수 칸이 있는지, 지표가 3개인지.
  여기서는 **내용이 규칙을 지키는지** 본다. 모양이 맞아도 규칙은 깨질 수 있다.

  ## 막는 것(errors)과 알리는 것(warnings)

  전부 막으면 쓸 수 없고, 전부 알리기만 하면 규칙이 없는 것과 같다. 그래서 갈랐다.

  **막는다** — 어기면 화면이 #256 이 없앤 상태로 돌아가는 것.
  항목당 강조 하나, 소개 문단에는 강조 없음. 이것은 취향이 아니라 그 화면의 조판 규칙이다.

  **알린다** — 사람이 판단할 것. 분량과 칩 내용.
  분량은 브라우저가 정하는 것을 코드가 정확히 알 수 없고, 칩은 "측정값인지"를 기계가
  확실히 가릴 수 없다. 확실하지 않은 것으로 저장을 막으면 도구가 방해가 된다.

  ## 분량 상한은 실측값이다

  헤드리스 Chrome 으로 항목을 늘려 가며 인쇄해 3쪽이 되는 지점을 쟀다 (#262 4단계).
  아래 글자 수는 **bodyChars() 기준**이다(아래 함수 주석 참조 — 화면에서 흐르는 것을 전부 센다).

      현재      항목 22개 · 본문 3316자  → 2쪽 (1쪽 61줄 / 2쪽 29줄)
      항목 +10  항목 32개 · 본문 4266자  → 2쪽
      항목 +12  항목 34개 · 본문 4456자  → 3쪽   ← 여기서 넘어간다

  그래서 3쪽이 되는 지점은 **항목 33개 · 본문 4350자 부근**이다. 상한은 그보다 앞에 둔다 —
  넘어간 뒤에 알려 주면 이미 늦다.

  (처음에는 계산으로 항목 +16 을 예측했다. 실제 경계는 +11~12 였다 — 재보지 않았으면 상한이
  경계보다 뒤에 있었을 것이다. 그리고 처음 표는 회사 줄·프로젝트 제목·학력을 빼고 센
  값이었다. 정의를 고치면서 다시 냈다.)

  **이 값은 어림이다.** 어느 섹션이 늘어나느냐에 따라 차지하는 높이가 다르고(항목 한 줄과
  학력 한 항목이 같지 않다), 최종 쪽수는 브라우저가 정한다. 정확히 알려면 재야 한다 —
  방법은 knowledge 노트(헤드리스 Chrome PDF)와 scripts/test-resume-fallback.sh 에 있다.
  내용을 크게 바꾼 뒤에는 위 표를 다시 뜨고 이 상수를 고칠 것.
*/

import { countBold, tokenizeInline, stripInline } from "./inlineTokens"
import type { ResumeData } from "./resumeData"

/** 실측 기준: 항목(경력 + 사이드)이 33개 부근에서 3쪽이 된다. 그보다 앞에서 알린다. */
const MAX_ROWS = 28
/** 실측 기준: 본문이 4300자 부근에서 3쪽이 된다. (아래 표의 값은 새 계산 기준이다) */
const MAX_BODY_CHARS = 3800
/** 현재 가장 긴 항목이 151자다. 200자를 넘으면 두 줄을 넘겨 쪽을 빨리 먹는다. */
const MAX_BULLET_CHARS = 200

export interface ResumeRuleReport {
  /** 저장을 막는다 */
  errors: string[]
  /** 저장은 되지만 알린다 */
  warnings: string[]
}

/** 표기를 벗긴 글자 수 — 분량은 보이는 글자로 센다. */
function visibleLength(s: string): number {
  return stripInline(s).length
}

/** 칩 안에 숫자가 없으면 측정값이 아닐 가능성이 높다. 확실하지 않으므로 경고다. */
function chipsWithoutNumber(text: string): string[] {
  return tokenizeInline(text)
    .filter((t) => t.kind === "code" && !/\d/.test(t.text))
    .map((t) => t.text)
}

/*
  분량에 들어가는 글자를 모은다.

  **화면에서 흐르는 것을 전부 센다.** 처음에는 항목 본문·프로젝트 설명·스킬·사이드·소개만
  셌는데, 회사 줄(`org`·`when`·`role`)·프로젝트 제목·학력이 빠져 있었다. 그것들도 렌더되고
  줄을 차지하므로, 학력을 세 개 늘리거나 긴 역할 줄을 가진 회사를 더해도 경고가 울리지
  않았다 — 이 모듈이 막으려던 바로 그 조용한 3쪽이다. 검사에서 지적됐다.

  지표 띠는 뺀다. 3열 격자라 글자가 늘어도 높이가 거의 변하지 않고(스키마가 label 을 두 줄로
  묶어 둔다), 넣으면 늘지 않는 값이 상한을 먹는다.
*/
function bodyChars(data: ResumeData): number {
  let n = visibleLength(data.header.tagline)
  for (const c of data.header.contacts) n += visibleLength(c.text)
  for (const s of data.skills) n += visibleLength(s.group) + visibleLength(s.primary) + visibleLength(s.also || "")
  for (const e of data.career) {
    if (e.kind === "job") {
      n += visibleLength(e.org) + visibleLength(e.when || "") + visibleLength(e.role || "")
      continue
    }
    n += visibleLength(e.name) + visibleLength(e.when || "") + visibleLength(e.desc || "")
    for (const b of e.bullets) n += visibleLength(b.text) + visibleLength(b.year || "")
  }
  for (const s of data.side) n += visibleLength(s)
  for (const e of data.education)
    n += visibleLength(e.name) + visibleLength(e.meta) + visibleLength(e.desc || "")
  return n
}

export function checkResumeRules(data: ResumeData): ResumeRuleReport {
  const errors: string[] = []
  const warnings: string[] = []

  // ── 강조 규칙 (#256) ──────────────────────────────────────────────────────
  if (countBold(data.header.tagline) > 0 || /`/.test(data.header.tagline))
    errors.push(
      "소개 문단에는 굵은 강조도 칩도 쓰지 않습니다 — 역할·연수는 위아래 줄이 이미 말합니다"
    )

  /*
    항목을 모은다. **어디에 있는지는 kind 로 들고 다닌다** — 전에는 라벨 문자열이
    "경력" 으로 시작하는지 보고 세었는데, 그러면 사람에게 보여 주는 말을 고치면 개수가
    조용히 0이 된다. 검사에서 지적됐다.

    라벨에 경력 순번을 넣는다. 이름이 빈 프로젝트가 실제로 있어서(인지소프트 아래 블록)
    같은 라벨이 둘 생길 수 있었다 — 사람이 어느 블록인지 못 가리고, 폼이 경고를 라벨로
    키를 잡아 그리므로 한 줄이 사라졌다.
  */
  const items: { kind: "bullet" | "side"; where: string; text: string }[] = []
  data.career.forEach((e, ci) => {
    if (e.kind !== "project") return
    const label = e.name || "(이름 없는 블록)"
    e.bullets.forEach((b, i) =>
      items.push({
        kind: "bullet",
        where: `경력 ${ci + 1} · ${label} · ${i + 1}번째 항목`,
        text: b.text,
      })
    )
  })
  data.side.forEach((s, i) => items.push({ kind: "side", where: `사이드 프로젝트 ${i + 1}번째`, text: s }))

  for (const it of items) {
    const bold = countBold(it.text)
    if (bold > 1)
      errors.push(`${it.where}: 굵은 강조가 ${bold}개입니다 — 항목당 하나만 (그 항목의 결과에)`)

    const chips = chipsWithoutNumber(it.text)
    if (chips.length)
      warnings.push(
        `${it.where}: 칩에 숫자가 없습니다 — 칩은 재서 확인한 값에만 씁니다 (\`${chips.join("`, `")}\`)`
      )

    const len = visibleLength(it.text)
    if (len > MAX_BULLET_CHARS)
      warnings.push(`${it.where}: ${len}자입니다 — ${MAX_BULLET_CHARS}자를 넘으면 줄을 많이 먹습니다`)
  }

  // ── 분량 (인쇄 쪽수) ──────────────────────────────────────────────────────
  //
  // 경력 항목과 사이드 항목을 함께 센다 — 둘 다 같은 지면에서 한 줄씩 차지한다.
  // 전에는 경력만 세어, 사이드를 3개에서 15개로 늘려도 개수 경고가 울리지 않았다(검사 지적).
  const rowCount = items.length
  if (rowCount > MAX_ROWS)
    warnings.push(
      `항목이 ${rowCount}개입니다(경력 + 사이드) — ${MAX_ROWS}개를 넘으면 인쇄가 3쪽이 될 수 있습니다 ` +
        `(실측: 33개 부근에서 넘어갑니다)`
    )

  const body = bodyChars(data)
  if (body > MAX_BODY_CHARS)
    warnings.push(
      `본문이 ${body}자입니다 — ${MAX_BODY_CHARS}자를 넘으면 인쇄가 3쪽이 될 수 있습니다 ` +
        `(실측: 3800자 부근에서 넘어갑니다)`
    )

  return { errors, warnings }
}
