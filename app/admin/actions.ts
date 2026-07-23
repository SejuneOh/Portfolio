"use server"

import { revalidatePath } from "next/cache"
import {
  createProjectPage,
  updateProjectPage,
  archiveProjectPage,
} from "../../lib/notionWrite"
import { setInquiryStatus } from "../../lib/inquiries"
import { parseTags, requireOwner, type ActionState } from "../../lib/adminForm"

function revalidateProjects() {
  revalidatePath("/admin/projects")
  revalidatePath("/projects", "layout") // 목록 + /projects/[id] 상세까지 갱신
  revalidatePath("/")
}

// 생성/수정 겸용. hidden id 가 있으면 수정, 없으면 생성.
// 이동은 클라이언트가 담당(성공/실패 UX·토스트 제어 위해 redirect 안 함).
export async function saveProject(formData: FormData): Promise<ActionState> {
  const authError = await requireOwner()
  if (authError) return { ok: false, message: authError }

  const id = String(formData.get("id") || "").trim()
  const name = String(formData.get("name") || "").trim()
  if (!name) return { ok: false, message: "프로젝트명은 필수입니다." }

  const input = {
    name,
    description: String(formData.get("description") || "").trim(),
    tags: parseTags(String(formData.get("tags") || "")),
    github: String(formData.get("github") || "").trim(),
    startDate: String(formData.get("startDate") || "").trim(),
    endDate: String(formData.get("endDate") || "").trim(),
    status: String(formData.get("status") || "").trim(),
    impact: String(formData.get("impact") || "").trim(),
    role: String(formData.get("role") || "").trim(),
    teamSize: String(formData.get("teamSize") || "").trim(),
    liveUrl: String(formData.get("liveUrl") || "").trim(),
    group: String(formData.get("group") || "").trim(),
    groupSummary: String(formData.get("groupSummary") || "").trim(),
    cover: String(formData.get("cover") || "").trim(),
    body: String(formData.get("body") || ""),
  }

  try {
    if (id) {
      // 본문이 실제로 바뀐 경우에만 블록 교체(다건 삭제·재생성). 아니면 속성만 갱신.
      const originalBody = String(formData.get("originalBody") || "")
      await updateProjectPage(id, input, input.body !== originalBody)
    } else {
      await createProjectPage(input)
    }
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }

  revalidateProjects()
  return { ok: true, message: id ? "변경이 저장되었습니다." : `“${name}” 프로젝트를 등록했습니다.` }
}

export async function deleteProject(id: string): Promise<void> {
  const authError = await requireOwner()
  if (authError) throw new Error(authError)
  await archiveProjectPage(id)
  revalidateProjects()
}

export async function updateInquiryStatus(id: string, status: string): Promise<void> {
  const authError = await requireOwner()
  if (authError) throw new Error(authError)
  await setInquiryStatus(id, status)
  revalidatePath("/admin")
}
