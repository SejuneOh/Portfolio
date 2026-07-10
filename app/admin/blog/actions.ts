"use server"

import { revalidatePath } from "next/cache"
import {
  createBlogPage,
  updateBlogPage,
  archiveBlogPage,
  setBlogPublished,
} from "../../../lib/notionWrite"
import { parseTags, slugify, requireOwner, type ActionState } from "../../../lib/adminForm"

function revalidateBlog() {
  revalidatePath("/admin/blog")
  revalidatePath("/blog")
  revalidatePath("/")
}

// 생성/수정 겸용. hidden id 가 있으면 수정, 없으면 생성.
// 이동은 클라이언트가 담당(성공/실패 UX·토스트 제어 위해 redirect 안 함).
export async function saveBlogPost(formData: FormData): Promise<ActionState> {
  const authError = await requireOwner()
  if (authError) return { ok: false, message: authError }

  const id = String(formData.get("id") || "").trim()
  const title = String(formData.get("title") || "").trim()
  if (!title) return { ok: false, message: "제목은 필수입니다." }

  const input = {
    title,
    slug: String(formData.get("slug") || "").trim() || slugify(title),
    date: String(formData.get("date") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    tags: parseTags(String(formData.get("tags") || "")),
    summary: String(formData.get("summary") || "").trim(),
    body: String(formData.get("body") || ""),
    published: formData.get("published") === "on",
  }

  try {
    if (id) {
      // 본문이 실제로 바뀐 경우에만 블록을 교체(다건 삭제·재생성). 아니면 속성만 갱신.
      const originalBody = String(formData.get("originalBody") || "")
      const bodyChanged = input.body !== originalBody
      await updateBlogPage(id, input, bodyChanged)
    } else {
      await createBlogPage(input)
    }
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }

  revalidateBlog()
  return { ok: true, message: id ? "변경이 저장되었습니다." : "글이 등록되었습니다." }
}

export async function deleteBlogPost(id: string): Promise<void> {
  const authError = await requireOwner()
  if (authError) throw new Error(authError)
  await archiveBlogPage(id)
  revalidateBlog()
}

export async function togglePublish(id: string, published: boolean): Promise<void> {
  const authError = await requireOwner()
  if (authError) throw new Error(authError)
  await setBlogPublished(id, published)
  revalidateBlog()
}
