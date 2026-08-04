import "../styles/globals.css"
import type { Metadata, Viewport } from "next"
import { Fraunces, JetBrains_Mono, Space_Grotesk } from "next/font/google"
import Providers from "./providers"
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from "../lib/site"
import { Analytics } from "@vercel/analytics/next"

// 제목용 디스플레이 폰트(라틴). --font-display 변수로 노출 → globals.css 헤딩에서 사용.
// 굵기·스타일 조합은 components/resumeDoc.tsx가 이미 쓰는 것과 같게 맞췄다.
// components/resumeDoc.tsx 가 이 인스턴스를 상속받는다(자체 Fraunces 로드는 제거됨).
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
})

// 코드·수치·메타·eyebrow용 고정폭 폰트. --font-jbmono 변수로 노출 → globals.css 유틸에서 사용.
// Tailwind 4가 기본 테마에 --font-mono를 이미 정의하고 font-mono 유틸이 곳곳에서 쓰이므로
// 그 이름을 피한다. components/resumeDoc.tsx가 쓰는 이름과도 같아진다.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jbmono",
  display: "swap",
})

// 로고(SEJUNE.DEV) 전용. --font-logo 변수로 노출 → tailwind.config.js 의 font-logo 로 사용.
// 제목은 Fraunces 로 통일했지만 워드마크는 기하학적 산세리프를 쓴다 — 상단 필 내비 규격이
// 이 조합을 지정한다. 굵기는 로고에 쓰는 700 하나만 받는다.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-logo",
  display: "swap",
})

// 파비콘/터치 아이콘은 app/icon.svg · app/apple-icon 파일 컨벤션으로 자동 주입된다.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — Sejune Oh",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
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
    <html
      lang="ko"
      className={`${fraunces.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
