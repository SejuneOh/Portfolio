import { ImageResponse } from "next/og"
import { getPost } from "../../../../lib/postsData"
import { SITE_URL, SITE_NAME } from "../../../../lib/site"

// 블로그 글별 동적 OG 이미지(링크 공유 카드).
// 제목이 한국어일 수 있어 Noto Sans KR 을 "필요한 글자만" 서브셋으로 임베드한다
// (Google Fonts CSS 의 text= 파라미터 → woff2 서브셋). 실패 시 폰트 없이 폴백.
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Sejune Oh — Blog"
export const runtime = "edge"

async function loadKoreanFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const api = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(text)}`
    const css = await fetch(api, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    }).then((r) => r.text())
    const url = css.match(/src:\s*url\(([^)]+)\)\s*format/)?.[1]
    if (!url) return null
    return await fetch(url).then((r) => r.arrayBuffer())
  } catch {
    return null
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  const title = post?.title || SITE_NAME
  const eyebrow = "BLOG"
  const domain = SITE_URL.replace(/^https?:\/\//, "")
  const footer = `${SITE_NAME} · ${domain}`

  // 렌더되는 모든 문자열을 합쳐 서브셋 요청(라틴+한글 모두 포함).
  const fontData = await loadKoreanFont(`${title}${eyebrow}${footer}·—`)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#191919",
          color: "#ffffff",
          fontFamily: fontData ? "Noto Sans KR" : "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#818cf8", textTransform: "uppercase" }}>
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: 62,
            fontWeight: 700,
            marginTop: 24,
            lineHeight: 1.15,
            display: "flex",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 26, color: "#9b9a97", marginTop: "auto" }}>{footer}</div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "Noto Sans KR", data: fontData, weight: 700 as const, style: "normal" as const }]
        : undefined,
    }
  )
}
