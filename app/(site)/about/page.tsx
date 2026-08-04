import Link from "next/link"
import { intro } from "../../../components/home/homeData"

export const metadata = {
  title: "About",
  description: "오세준(Sejune Oh) — C#/.NET 백엔드 개발자 소개",
}

/*
  이 이슈에서는 껍데기만 만들지 않고 제목과 기존 소개 문구까지 담는다.
  소개 문구는 새로 쓰지 않고 홈에서 쓰던 것(components/home/homeData 의 intro)을
  그대로 가져온다 — 한 사람의 소개가 두 벌이 되면 갈라진다.

  타임라인·스킬·연락 카드 같은 상세 구성은 별도 About 화면 작업에서 완성한다.
*/
export default function About() {
  return (
    <div className="max-w-[720px]">
      <h1 className="text-[48px] font-bold leading-[1.1] tracking-tight text-ink">About</h1>

      <p className="eyebrow mt-4 text-muted">오세준 · Sejune Oh · Backend C#/.NET</p>

      <div className="mt-8 space-y-5">
        {intro.map((p) => (
          <p key={p} className="text-[15px] leading-[1.8] text-muted">
            {p}
          </p>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href="/about/resume"
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2A2B22]"
        >
          이력서 보기 →
        </Link>
        <Link href="/contact" className="link-underline text-sm">
          연락하기
        </Link>
      </div>
    </div>
  )
}
