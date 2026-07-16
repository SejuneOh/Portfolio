import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "../../lib/site"
import { getPosts } from "../../lib/postsData"

// 블로그 RSS 2.0 피드 — 구독/수집 경로 제공. sitemap과 동일한 revalidate 정책.
export const revalidate = 3600

// XML 특수문자 이스케이프.
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

// RFC-822 형식(RSS pubDate). 유효하지 않은 날짜는 생략.
function rfc822(date: string): string {
  const d = new Date(date)
  return isNaN(d.getTime()) ? "" : d.toUTCString()
}

export async function GET() {
  const blogUrl = `${SITE_URL}/blog`
  const feedUrl = `${SITE_URL}/feed.xml`

  let items = ""
  try {
    const posts = await getPosts()
    items = posts
      .map((p) => {
        const link = `${SITE_URL}/blog/${p.slug}`
        const pub = rfc822(p.date)
        return [
          "    <item>",
          `      <title>${esc(p.title)}</title>`,
          `      <link>${esc(link)}</link>`,
          `      <guid isPermaLink="true">${esc(link)}</guid>`,
          pub ? `      <pubDate>${pub}</pubDate>` : "",
          p.summary ? `      <description><![CDATA[${p.summary}]]></description>` : "",
          "    </item>",
        ]
          .filter(Boolean)
          .join("\n")
      })
      .join("\n")
  } catch {
    // Notion 미설정/실패 시에도 유효한 빈 피드를 반환.
    items = ""
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${esc(blogUrl)}</link>
    <description>${esc(SITE_DESCRIPTION)}</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${esc(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate",
    },
  })
}
