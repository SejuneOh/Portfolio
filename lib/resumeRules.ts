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

      현재      항목 19개 · 본문 2706자   → 2쪽 (1쪽 61줄 / 2쪽 29줄)
      항목 +7   항목 26개 · 본문 ~3370자  → 2쪽
      항목 +10  항목 29개 · 본문 ~3660자  → 2쪽
      항목 +12  항목 31개 · 본문 ~3850자  → 3쪽   ← 여기서 넘어간다

  그래서 3쪽이 되는 지점은 **항목 30개 · 본문 3800자 부근**이다. 상한은 그보다 앞에 둔다 —
  넘어간 뒤에 알려 주면 이미 늦다.

  **이 값은 어림이다.** 어느 섹션이 늘어나느냐에 따라 차지하는 높이가 다르고(항목 한 줄과
  학력 한 항목이 같지 않다), 최종 쪽수는 브라우저가 정한다. 정확히 알려면 재야 한다 —
  방법은 knowledge 노트(헤드리스 Chrome PDF)와 scripts/test-resume-fallback.sh 에 있다.
  내용을 크게 바꾼 뒤에는 위 표를 다시 뜨고 이 상수를 고칠 것.
*/

import { countBold, tokenizeInline, stripInline } from "./inlineTokens"
import type { ResumeData } from "./resumeData"

/** 실측 기준: 3쪽이 되는 지점이 항목 30개 부근. 그보다 앞에서 알린다. */
const MAX_BULLETS = 25
/** 실측 기준: 3쪽이 되는 지점이 본문 3800자 부근. */
const MAX_BODY_CHARS = 3300
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

export function checkResumeRules(data: ResumeData): ResumeRuleReport {
  const errors: string[] = []
  const warnings: string[] = []

  // ── 강조 규칙 (#256) ──────────────────────────────────────────────────────
  if (countBold(data.header.tagline) > 0 || /`/.test(data.header.tagline))
    errors.push(
      "소개 문단에는 굵은 강조도 칩도 쓰지 않습니다 — 역할·연수는 위아래 줄이 이미 말합니다"
    )

  const items: { where: string; text: string }[] = []
  for (const e of data.career) {
    if (e.kind !== "project") continue
    const label = e.name || "(이름 없는 블록)"
    e.bullets.forEach((b, i) => items.push({ where: `경력 · ${label} · ${i + 1}번째 항목`, text: b.text }))
  }
  data.side.forEach((s, i) => items.push({ where: `사이드 프로젝트 ${i + 1}번째`, text: s }))

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
  const bulletCount = items.filter((i) => i.where.startsWith("경력")).length
  if (bulletCount > MAX_BULLETS)
    warnings.push(
      `경력 항목이 ${bulletCount}개입니다 — ${MAX_BULLETS}개를 넘으면 인쇄가 3쪽이 될 수 있습니다 ` +
        `(실측: 30개 부근에서 넘어갑니다)`
    )

  const body =
    visibleLength(data.header.tagline) +
    data.skills.reduce((n, s) => n + visibleLength(s.primary) + visibleLength(s.also || ""), 0) +
    data.career.reduce(
      (n, e) =>
        e.kind === "project"
          ? n + visibleLength(e.desc || "") + e.bullets.reduce((m, b) => m + visibleLength(b.text), 0)
          : n,
      0
    ) +
    data.side.reduce((n, s) => n + visibleLength(s), 0)

  if (body > MAX_BODY_CHARS)
    warnings.push(
      `본문이 ${body}자입니다 — ${MAX_BODY_CHARS}자를 넘으면 인쇄가 3쪽이 될 수 있습니다 ` +
        `(실측: 3800자 부근에서 넘어갑니다)`
    )

  return { errors, warnings }
}
