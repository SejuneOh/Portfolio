"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { createBlogPage, createProjectPage } from "../../lib/notionWrite"

export interface ActionState {
  ok: boolean
  message: string
}

function parseTags(raw: string): string[] {
  return (raw || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// 모든 쓰기 액션은 세션을 재확인한다(미들웨어에 더해 방어).
async function requireOwner(): Promise<string | null> {
  const session = await auth()
  return session?.user ? null : "인증이 필요합니다. 다시 로그인하세요."
}

export async function submitBlog(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const authError = await requireOwner()
  if (authError) return { ok: false, message: authError }

  const title = String(formData.get("title") || "").trim()
  if (!title) return { ok: false, message: "제목은 필수입니다." }

  try {
    await createBlogPage({
      title,
      slug: String(formData.get("slug") || "").trim() || slugify(title),
      date: String(formData.get("date") || "").trim(),
      category: String(formData.get("category") || "").trim(),
      tags: parseTags(String(formData.get("tags") || "")),
      summary: String(formData.get("summary") || "").trim(),
      body: String(formData.get("body") || ""),
      published: formData.get("published") === "on",
    })
    revalidatePath("/blog")
    revalidatePath("/")
    return { ok: true, message: `“${title}” 글을 Notion 에 등록했습니다.` }
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }
}

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
