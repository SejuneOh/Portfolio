import BlogIndex from "../../../components/blogIndex"
import { getPosts } from "../../../lib/postsData"
import { deriveCategories } from "../../../lib/posts"

export const metadata = { title: "Blog" }
export const revalidate = 3600

export default async function Blog() {
  const posts = await getPosts()
  const categories = deriveCategories(posts)
  return <BlogIndex posts={posts} categories={categories} />
}
