import "../styles/globals.css"
import type { Metadata, Viewport } from "next"
import Providers from "./providers"

export const metadata: Metadata = {
  title: {
    default: "Sejune Oh — 백엔드 개발자",
    template: "%s — Sejune Oh",
  },
  description:
    "헬스케어 SaaS의 채팅/메시징 백엔드를 설계·운영하는 C#/.NET 백엔드 개발자 오세준의 포트폴리오",
  icons: { icon: "/favicon.ico" },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
