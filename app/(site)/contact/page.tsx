import ContactForm from "../../../components/contact/contactForm"

export const metadata = { title: "Contact" }

export default function Contact() {
  return (
    <div className="max-w-[640px]">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">Contact</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
        연락하기
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        협업·채용·면접 요청 등 무엇이든 편하게 남겨주세요. 이메일로 확인 후 회신드립니다.
      </p>
      <ContactForm />
    </div>
  )
}
