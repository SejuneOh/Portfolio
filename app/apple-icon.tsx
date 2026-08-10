import { ImageResponse } from "next/og"

// iOS 홈스크린/터치 아이콘. 상단 내비 워드마크와 같은 모노그램.
// app/icon.svg(파비콘)와 색이 같아야 한다 — 어긋나면 탭과 홈스크린이 다른 브랜드로 보인다.
// 한쪽을 바꾸면 다른 쪽도 함께 바꾼다.
//
// **모서리 반경을 주지 않는다.** iOS 가 홈스크린에서 자체 마스크(squircle)를 씌우므로,
// 여기서 둥글리면 마스크와 이중으로 겹쳐 모서리가 어색해진다. 사이트 모양 토큰이
// 3px 이라고 해서 여기에 넣지 말 것 — 파비콘(icon.svg)만 rx=3 이다 (#212).
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
