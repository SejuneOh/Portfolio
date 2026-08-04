import TopNav from "../../components/topNav"
import MobileHeader from "../../components/mobileHeader"
import Footer from "../../components/footer"

/*
  세이지는 html/body 배경(styles/globals.css 의 --bg)이 전폭으로 담당한다.
  그 위에 흰 표면 하나만 올린다 — 세이지를 감싸는 별도 프레임 래퍼는 두지 않는다.
  프레임(22px)이 표면(28px)보다 덜 둥글어 표면이 곡선 밖으로 삐져나와 보이는 문제가
  구조 자체에서 없어지고, 프레임 좌우 padding 40px 을 본문 폭으로 되돌린다.

  바깥 div 는 배경도 라운드도 없는 여백 전용이다. 세이지가 표면의 사방으로 보이게 해서
  색이 실제로 배경처럼 읽히게 한다.
*/
/*
  인쇄할 때는 표면 껍데기(여백·라운드·최대폭)를 벗긴다. 내비·푸터는 각 컴포넌트가
  print:hidden 으로 빠지므로 여기서는 문서가 종이 폭을 다 쓰게만 하면 된다.
  /about/resume 가 이 레이아웃 안에 있어서 필요한 처리다.
*/
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-6 md:px-6 md:py-8 print:p-0">
      <div className="mx-auto max-w-[1240px] rounded-[28px] bg-surface p-[26px] print:max-w-none print:rounded-none print:p-0">
        <MobileHeader />
        <TopNav />
        <main className="min-w-0 py-10 md:py-14 print:py-0">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
