import Link from "next/link"
import { NAV, CONTACT } from "../lib/nav"

// 라벨을 여기서 따로 들고 있으면 상단 내비와 갈라진다. 한 곳(lib/nav.ts)만 본다.
const nav = [...NAV, CONTACT]

/*
  상단 1px 보더 + padding-top 24px, 연락 액션은 우측 정렬.
  `//` 구분자와 두꺼운 여백은 이전 디자인 요소라 걷어냈다.

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
          <a
            href="mailto:etry0715@gmail.com"
            className="eyebrow text-[12.5px] text-muted transition-colors hover:text-ink"
          >
            etry0715@gmail.com
          </a>
          <Link href="/contact" className="btn-lime">
            문의 남기기 →
          </Link>
        </div>
      </div>

      <p className="eyebrow mt-8 text-muted">
        © {new Date().getFullYear()} Sejune Oh · Backend / Fullstack
      </p>
    </footer>
  )
}
