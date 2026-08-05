import { ImageResponse } from "next/og"

// iOS 홈스크린/터치 아이콘. 상단 내비 워드마크와 같은 모노그램.
// 주의: app/icon.svg(파비콘)는 아직 인디고 #4f46e5 다. 둘이 어긋난 상태이며 #194 에서 맞춘다.
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#070b0d",
          color: "#d8f26a",
          fontSize: 92,
          fontWeight: 800,
          letterSpacing: -6,
        }}
      >
        SO
      </div>
    ),
    { ...size }
  )
}
