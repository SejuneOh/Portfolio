import Footer from "./footer"
import Header from "./header"
import Head from "next/head"

export default function Layout({ children, title = "Sejune Oh — 백엔드 개발자" }) {
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
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  )
}
