import Link from "next/link"
import { NAV, CONTACT } from "../lib/nav"

// 라벨을 여기서 따로 들고 있으면 상단 내비와 갈라진다. 한 곳(lib/nav.ts)만 본다.
const nav = [...NAV, CONTACT]

/*
  상단 1px 보더 + padding-top 24px, 연락 액션은 우측 정렬.
  `//` 구분자와 두꺼운 여백은 이전 디자인 요소라 걷어냈다.

  같이 없앤 문구: `협업·채용·면접 제안은 언제든 환영합니다.`
  새 규격의 우측 블록은 이메일과 문의 필만 두므로 들어갈 자리가 없다. 같은 뜻은
  /contact 화면의 리드와 "이런 제안을 기다립니다" 카드가 더 구체적으로 말한다.
  전 페이지 공통 컴포넌트에서 지운 것이라 여기 근거를 남긴다.

  좌측의 GitHub·Location 은 사이드바를 없애면서 여기로 옮겨 온 정보다(데스크톱에서
  이 정보의 자리가 사라지므로). 이메일은 우측 블록에 있어 중복을 피해 뺐다.
*/
export default function Footer() {
  return (
    <footer className="border-t border-line pt-6 pb-10 print:hidden">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold text-ink">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-muted">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 space-y-1 text-[12.5px] leading-relaxed text-muted">
            <p>GitHub. github.com/SejuneOh</p>
            <p>Location. Seoul, Korea</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
          {/*
            "고정폭"만 요구됐다. eyebrow 유틸은 대문자 변환과 넓은 자간을 함께 걸어
            이메일 주소를 ETRY0715@GMAIL.COM 으로 만들므로 여기서는 쓰지 않는다.
          */}
          <a
            href="mailto:etry0715@gmail.com"
            className="font-[family-name:var(--font-jbmono)] text-[12.5px] text-muted transition-colors hover:text-ink"
          >
            etry0715@gmail.com
          </a>
          <div className="flex items-center gap-3">
            {/* 히어로에서 내려온 RSS. 구독은 이력서와 같은 무게가 아니다. */}
            <a
              href="/feed.xml"
              className="font-[family-name:var(--font-jbmono)] text-[12.5px] text-muted transition-colors hover:text-ink"
            >
              RSS ↗
            </a>
            <Link href="/contact" className="btn-lime">
              문의 남기기 →
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-muted">
        © {new Date().getFullYear()} Sejune Oh · Backend / Fullstack
      </p>
    </footer>
  )
}
