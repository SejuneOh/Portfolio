"use server"

import { revalidatePath } from "next/cache"

import { requireOwner, type ActionState } from "../../../lib/adminForm"
import { saveResume } from "../../../lib/notionResume"
import type { ResumeData, ResumeMetric } from "../../../lib/resumeData"
import { decodeResume } from "../../../lib/resumeText"

/*
  이력서 저장 (#262 3단계).

  순서가 중요하다 — **인증 → 폼 파싱 → 스키마 검사 → 저장**. 검사를 저장 뒤로 미루면
  잘못된 값이 이미 Notion 에 들어간 뒤에 발견되고, 이력서는 한 칸에 통째로 들어가므로
  그것은 전체를 잃는 것과 같다. (검사는 saveResume 안에서 한 번 더 돈다 — 이 액션을
  거치지 않는 호출도 막기 위해서다.)
*/
export async function saveResumeAction(formData: FormData): Promise<ActionState> {
  const authError = await requireOwner()
  if (authError) return { ok: false, message: authError }

  const s = (k: string) => String(formData.get(k) || "").trim()

  // 지표 띠는 3개 고정이라 개별 칸으로 받는다. 값·앞·뒤가 섞여 한 줄로 적으면 규칙이
  // 마술처럼 되기 때문이다 (lib/resumeText.ts 머리 주석).
  const metrics: ResumeMetric[] = [0, 1, 2].map((i) => {
    const label = s(`metric${i}Label`)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
    return {
      ...(s(`metric${i}From`) ? { from: s(`metric${i}From`) } : {}),
      ...(formData.get(`metric${i}Arrow`) === "on" ? { arrow: true } : {}),
      value: s(`metric${i}Value`),
      ...(s(`metric${i}After`) ? { after: s(`metric${i}After`) } : {}),
      ...(formData.get(`metric${i}AfterSmall`) === "on" ? { afterSmall: true } : {}),
      label,
    }
  })

  const decoded = decodeResume({
    contacts: String(formData.get("contacts") || ""),
    skills: String(formData.get("skills") || ""),
    career: String(formData.get("career") || ""),
    side: String(formData.get("side") || ""),
    education: String(formData.get("education") || ""),
  })
  if (!decoded.ok) {
    return { ok: false, message: `입력을 읽을 수 없습니다 — ${decoded.problems.join(" / ")}` }
  }

  const data: ResumeData = {
    header: {
      eyebrow: s("eyebrow"),
      name: s("name"),
      nameSub: s("nameSub"),
      tagline: s("tagline"),
      contacts: decoded.parts.contacts,
    },
    metrics,
    skills: decoded.parts.skills,
    career: decoded.parts.career,
    side: decoded.parts.side,
    education: decoded.parts.education,
    footer: [s("footerLeft"), s("footerRight")],
  }

  try {
    await saveResume(data)
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }

  // 이력서와 /about 이 같은 데이터를 읽는다 (#262 1단계). 둘 다 새로 굽는다.
  revalidatePath("/about/resume")
  revalidatePath("/about")
  revalidatePath("/admin/resume")
  return { ok: true, message: "이력서가 저장되었습니다." }
}
