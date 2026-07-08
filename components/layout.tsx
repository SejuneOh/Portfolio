import type React from "react"
import Head from "next/head"
import Sidebar from "./sidebar"
import Footer from "./footer"

type LayoutProps = {
  title?: string
  children: React.ReactNode
}

export default function Layout({ children, title = "Sejune Oh — 백엔드 개발자" }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content="헬스케어 SaaS의 채팅/메시징 백엔드를 설계·운영하는 C#/.NET 백엔드 개발자 오세준의 포트폴리오"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mx-auto max-w-[1240px] px-6">
        <div className="md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-14">
          <Sidebar />
          <main className="min-w-0 py-10 md:py-14">{children}</main>
        </div>
        <Footer />
      </div>
    </>
  )
}
