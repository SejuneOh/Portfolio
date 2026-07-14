import Link from "next/link"

const nav = [
  { href: "/", label: "HOME" },
  { href: "/projects", label: "PROJECTS" },
  { href: "/blog", label: "BLOG" },
  { href: "/resume", label: "RESUME" },
  { href: "/contact", label: "CONTACT" },
]

export default function Footer() {
  return (
    <footer className="pb-16">
      {/* divider with // mark */}
      <div className="flex items-center py-10">
        <div className="h-px flex-1 bg-line" />
        <span className="px-4 font-mono text-sm text-muted">{"//"}</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold tracking-wide text-fg">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-accent">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="text-sm text-muted">
          <p>협업·채용·면접 제안은 언제든 환영합니다.</p>
          <Link href="/contact" className="link-underline mt-1 inline-block text-accent">
            문의 남기기 →
          </Link>
        </div>
      </div>

      <p className="mt-10 text-xs text-muted">
        © {new Date().getFullYear()} Sejune Oh · Backend / Fullstack
      </p>
    </footer>
  )
}
