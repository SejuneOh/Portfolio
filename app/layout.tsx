import "../styles/globals.css"
import type { Metadata, Viewport } from "next"
import Providers from "./providers"
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from "../lib/site"

// 파비콘/터치 아이콘은 app/icon.svg · app/apple-icon 파일 컨벤션으로 자동 주입된다.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — Sejune Oh",
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
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
