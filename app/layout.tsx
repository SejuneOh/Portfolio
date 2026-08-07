import "../styles/globals.css"
import type { Metadata, Viewport } from "next"
import { IBM_Plex_Sans_KR, IBM_Plex_Mono, Gowun_Batang } from "next/font/google"
import Providers from "./providers"
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from "../lib/site"
import { Analytics } from "@vercel/analytics/next"

/*
  제목·본문용 서체. --font-display 변수로 노출 → globals.css 헤딩과 tailwind 의 font-display.

  이전에는 Fraunces(라틴 전용)였고 한글 제목이 전부 시스템 폰트로 폴백됐다.
  IBM Plex Sans KR 은 한글을 포함하므로 한글 제목이 처음으로 의도한 서체로 렌더된다.

  subsets 에 "korean" 을 넣을 수 없다 — next/font 가 이 서체에 노출하는 것은
  latin·latin-ext 뿐이다. 그래도 Google 이 내려주는 CSS 에 한글 unicode-range 블록이
  함께 들어오므로 글리프는 실린다. 빌드 산출물에서 확인할 것: .next/static/media 의
  woff2 개수와 생성된 CSS 의 unicode-range 에 U+AC00-D7A3 가 있어야 한다.
*/
const plexSansKr = IBM_Plex_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
  /*
    preload 를 끈다. 한글 unicode-range 블록이 함께 들어오면서 woff2 조각이 수백 개로
    쪼개지는데, preload 가 켜져 있으면 그 전부에 <link rel="preload"> 가 붙어
    첫 로드에 수백 건의 폰트 요청이 나간다(끄기 전 홈에서 378건 확인).
    display: swap 이므로 필요한 조각만 그때 받아 온다.
  */
  preload: false,
})

/*
  계측·코드·메타·eyebrow 용 고정폭. --font-jbmono 변수로 노출 → globals.css 유틸에서 사용.

  변수 이름을 유지한다. 이 이름을 참조하는 자리가 여러 파일에 흩어져 있고
  globals.css 의 eyebrow·proof·proof-sm 유틸도 여기에 걸려 있다 — 이름을 바꾸면
  전부 고쳐야 한다. Tailwind 4 가 기본 테마에 --font-mono 를 이미 정의하므로
  그 이름은 여전히 피한다.

  파일 수를 적어 두지 않는다 (#199). "13개 파일" 이라고 적어 뒀는데 그 뒤 늘어
  세 곳의 주석이 한꺼번에 거짓이 됐다. 지금 수가 궁금하면 세면 된다:

    git grep -l -- "--font-jbmono" -- app components lib styles tailwind.config.js
*/
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jbmono",
  display: "swap",
})

/*
  본문 문단용 세리프. --font-serif 변수로 노출 → tailwind 의 font-serif.
  구조는 고딕(Plex Sans KR), 읽는 자리는 세리프(Gowun Batang)로 나눈다.
*/
const gowunBatang = Gowun_Batang({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
  display: "swap",
  // 한글을 포함하므로 위와 같은 이유로 preload 를 끈다.
  preload: false,
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
      className={`${plexSansKr.variable} ${plexMono.variable} ${gowunBatang.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
