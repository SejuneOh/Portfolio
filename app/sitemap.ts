import type { MetadataRoute } from "next"
import { SITE_URL } from "../lib/site"
import { getPosts } from "../lib/postsData"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/resume`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ]

  let postRoutes: MetadataRoute.Sitemap = []
  try {
    const posts = await getPosts()
    postRoutes = posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.date ? new Date(p.date) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    }))
  } catch {
    // Notion 미설정/실패 시 정적 라우트만 반환
  }

  return [...staticRoutes, ...postRoutes]
}
