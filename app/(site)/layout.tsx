import TopNav from "../../components/topNav"
import MobileHeader from "../../components/mobileHeader"
import Footer from "../../components/footer"
import InstrumentBg from "../../components/console/instrumentBg"

/*
  계측 콘솔 셸.

  이전에는 지면 위에 흰 표면(rounded-[28px] bg-surface) 하나를 올리고 그 안에 내용을
  담았다. 계측 콘솔에서는 지면 자체가 계기판이므로 그 껍데기를 쓰지 않는다 —
  본문이 전폭으로 놓이고, 배경은 InstrumentBg 가 담당한다.

  InstrumentBg 는 이 레이아웃에만 붙는다. app/admin 은 별도 레이아웃이 없어
  루트 레이아웃 아래에 바로 놓이므로 계측 배경이 올라가지 않는다.

  인쇄: 배경은 InstrumentBg 자신이 print:hidden 으로 빠지고, 내비·푸터도 각 컴포넌트가
  print:hidden 을 가진다. 여기서는 문서가 종이 폭을 다 쓰게만 하면 된다 —
  /about/resume 가 이 레이아웃 안에 있어서 필요한 처리다.
*/
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InstrumentBg />
      <div className="relative z-10 px-4 py-6 md:px-6 md:py-8 print:p-0">
        <div className="mx-auto max-w-[1240px] print:max-w-none">
          <MobileHeader />
          <TopNav />
          <main className="min-w-0 py-10 md:py-14 print:py-0">{children}</main>
          <Footer />
        </div>
      </div>
    </>
  )
}
