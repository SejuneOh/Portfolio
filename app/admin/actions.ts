"use server"

import { revalidatePath } from "next/cache"
import { createProjectPage } from "../../lib/notionWrite"
import { parseTags, requireOwner, type ActionState } from "../../lib/adminForm"

export async function submitProject(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const authError = await requireOwner()
  if (authError) return { ok: false, message: authError }

  const name = String(formData.get("name") || "").trim()
  if (!name) return { ok: false, message: "프로젝트명은 필수입니다." }

  try {
    await createProjectPage({
      name,
      description: String(formData.get("description") || "").trim(),
      tags: parseTags(String(formData.get("tags") || "")),
      github: String(formData.get("github") || "").trim(),
      startDate: String(formData.get("startDate") || "").trim(),
      endDate: String(formData.get("endDate") || "").trim(),
      status: String(formData.get("status") || "").trim(),
    })
    revalidatePath("/projects")
    revalidatePath("/")
    return { ok: true, message: `“${name}” 프로젝트를 Notion 에 등록했습니다.` }
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }
}
