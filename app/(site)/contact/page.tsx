import ContactForm from "../../../components/contact/contactForm"

export const metadata = { title: "Contact" }

/*
  상단 내비의 이 페이지 예외(우측 Contact 버튼을 렌더하지 않고 라벨 바에 Contact 를
  다섯 번째 항목으로 넣어 활성 표시)는 components/topNav.tsx 에 이미 들어 있다.
  이 파일에서 할 일은 없다.
*/
export default function Contact() {
  return (
    <div className="grid gap-11 md:grid-cols-[1fr_320px]">
      {/* 본문 — 헤더 + 폼 */}
      <div className="min-w-0">
        {/* 제목 뒤 마침표는 쓰지 않는다. 목록 화면(WHAT I FIXED·WRITING)과 규칙을 맞춘다 */}
        <h1 className="text-[48px] font-bold leading-[1.1] tracking-tight text-ink">Contact</h1>
        <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.8] text-muted">
          면접·채용 제안을 환영합니다. 형식은 자유롭게 — 어떤 팀에서 어떤 일을 하는지 한 줄만
          적어주셔도 됩니다.
        </p>

        <ContactForm />
      </div>

      {/* 사이드 320px */}
      <aside className="flex flex-col gap-4">
        {/* 검정 카드 — 어떤 연락을 기다리는지 */}
        {/*
          --on-ink-* 는 밝은 지면에 얹던 검정 카드의 반전 색이었다. 어두운 지면에서는
          값이 본문 토큰과 같아져 이름만 남았으므로 본문 토큰을 직접 쓴다. 변수 삭제는 #191.
        */}
        <div className="card-ink p-6">
          <p className="eyebrow text-muted">이런 제안을 기다립니다</p>

          {/*
            문의 유형에서 "기술 문의"를 빼기로 해서 이 목록에서도 뺐다.
            고를 수 없는 유형을 안내하면 앞뒤가 맞지 않는다.
          */}
          <ul className="mt-4 space-y-2.5 text-sm leading-relaxed">
            {["백엔드 포지션 면접 제안", "글 피드백·정정"].map((t) => (
              <li key={t} className="flex gap-2">
                <span className="text-lime">—</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>

          {/* 응답 시간을 약속하지 않는다(24시간·30분 같은 문구). 부담이 된다. */}
          <p className="mt-5 border-t border-line pt-4 text-[12.5px] leading-relaxed text-muted">
            읽고 회신드립니다. 이력서나 채용 공고 링크가 있으면 함께 남겨주시면 더 정확히
            답할 수 있습니다.
          </p>
        </div>

        {/* 아웃라인 카드 — 직접 연락 */}
        <div className="card p-6">
          <p className="eyebrow text-muted">직접 연락</p>
          <div className="mt-4 space-y-2 text-sm leading-relaxed text-ink">
            <p>
              <span className="text-muted">Email. </span>
              <a href="mailto:etry0715@gmail.com" className="link-underline">
                etry0715@gmail.com
              </a>
            </p>
            <p>
              <span className="text-muted">GitHub. </span>
              <a
                href="https://github.com/SejuneOh"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
              >
                github.com/SejuneOh
              </a>
            </p>
            <p>
              <span className="text-muted">Location. </span>
              Seoul, Korea
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}
