import { ImageResponse } from "next/og"

// iOS 홈스크린/터치 아이콘. 사이드바 브랜드 블록과 동일한 모노그램.
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
          background: "#4f46e5",
          color: "#ffffff",
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
