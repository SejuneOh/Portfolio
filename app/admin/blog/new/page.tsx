import type { Metadata } from "next"
import Link from "next/link"
import BlogPostForm from "../../../../components/admin/blogPostForm"

export const metadata: Metadata = {
  title: "새 글",
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

export default function NewBlogPost() {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-16">
      <Link href="/admin/blog" className="font-mono text-xs text-muted hover:text-accent">
        ← 블로그
      </Link>
      <h1 className="mb-8 mt-4 text-2xl font-semibold text-fg">새 글</h1>
      <BlogPostForm />
    </main>
  )
}
