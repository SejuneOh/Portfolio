import { ImageResponse } from "next/og"
import { SITE_URL } from "../lib/site"

// 사이트 공용 OG 이미지(링크 공유 카드). 폰트 임베드 없이 렌더되도록 라틴만 사용.
// 글별 한국어 제목 OG 는 CJK 폰트 임베드가 필요해 별도 후속으로 처리.
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Sejune Oh — Backend Engineer"
export const runtime = "edge"

export default function OpengraphImage() {
  const domain = SITE_URL.replace(/^https?:\/\//, "")
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
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, color: "#2383e2", textTransform: "uppercase" }}>
          Backend Engineer · Fullstack
        </div>
        <div style={{ fontSize: 92, fontWeight: 800, marginTop: 24, lineHeight: 1.05 }}>Sejune Oh</div>
        <div style={{ fontSize: 34, color: "#9b9a97", marginTop: 20 }}>
          C#/.NET · Real-time messaging backend · DDD/CQRS
        </div>
        <div style={{ fontSize: 24, color: "#787774", marginTop: "auto" }}>{domain}</div>
      </div>
    ),
    size
  )
}
