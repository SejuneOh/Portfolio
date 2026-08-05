import BlogIndex from "../../../components/blogIndex"
import { getPosts } from "../../../lib/postsData"
import { deriveCategories } from "../../../lib/posts"

export const metadata = { title: "Writing" }
export const revalidate = 3600

export default async function Writing() {
  const posts = await getPosts()
  const categories = deriveCategories(posts)
  return <BlogIndex posts={posts} categories={categories} />
}
