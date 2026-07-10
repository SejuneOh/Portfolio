"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
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

// 생성/수정 겸용. hidden id 가 있으면 수정, 없으면 생성. 성공 시 목록으로 이동.
export async function saveBlogPost(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
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
    if (id) await updateBlogPage(id, input)
    else await createBlogPage(input)
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }

  // 성공: 캐시 무효화 후 목록으로 리다이렉트 (redirect 는 try 밖에서 — throw 로 동작).
  revalidateBlog()
  redirect("/admin/blog")
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
