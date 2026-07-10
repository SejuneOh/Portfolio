import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import BlogPostForm from "../../../../../components/admin/blogPostForm"
import { getAdminPost } from "../../../../../lib/postsData"
import { blocksToText } from "../../../../../lib/notionWrite"

export const metadata: Metadata = {
  title: "글 수정",
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"
// 본문 블록 교체(다건 Notion 호출)가 기본 10초를 넘을 수 있어 상향(플랜 허용 범위 내).
export const maxDuration = 60

export default async function EditBlogPost({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getAdminPost(id)
  if (!post) notFound()

  const initial = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    date: post.date,
    category: post.category,
    tags: post.tags.join(", "),
    summary: post.summary,
    body: blocksToText(post.body || []),
    published: post.published,
  }

  return (
    <main className="mx-auto max-w-[720px] px-6 py-16">
      <Link href="/admin/blog" className="font-mono text-xs text-muted hover:text-accent">
        ← 블로그
      </Link>
      <h1 className="mb-8 mt-4 text-2xl font-semibold text-fg">글 수정</h1>
      <BlogPostForm initial={initial} />
    </main>
  )
}
