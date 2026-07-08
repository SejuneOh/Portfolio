import Link from "next/link"
import { useRouter } from "next/router"
import DarkModeToggleBtn from "./darkModeToggleBtn"

const nav = [
  { href: "/", label: "HOME" },
  { href: "/projects", label: "PROJECTS" },
  { href: "/blog", label: "BLOG" },
  { href: "/resume", label: "RESUME" },
]

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.6 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  )
}

export default function Sidebar() {
  const { pathname } = useRouter()
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <aside className="py-10 md:sticky md:top-0 md:h-screen md:self-start md:overflow-y-auto">
      {/* Brand block */}
      <Link href="/" aria-label="home" className="inline-block">
        <div className="relative flex h-36 w-36 flex-col justify-between bg-accent p-4 text-white">
          <span className="text-[28px] font-extrabold leading-none tracking-tight">SEJUNE</span>
          <span className="flex items-end justify-between">
            <span className="text-[28px] font-extrabold leading-none tracking-tight">OH</span>
            <span className="pb-0.5 text-[9px] font-medium tracking-widest opacity-90">
              portfolio
            </span>
          </span>
        </div>
      </Link>

      {/* Vertical nav */}
      <nav className="mt-9 flex flex-col gap-2.5">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`w-fit text-lg font-bold tracking-wide transition-colors ${
              isActive(n.href) ? "text-accent" : "text-fg hover:text-accent"
            }`}
          >
            {n.label}
          </Link>
        ))}
        <a
          href="mailto:etry0715@gmail.com"
          className="w-fit text-lg font-bold tracking-wide text-fg transition-colors hover:text-accent"
        >
          CONTACT
        </a>
      </nav>

      {/* Contact info */}
      <div className="mt-10 space-y-1.5 text-[13px] leading-relaxed text-muted">
        <p>Email. etry0715@gmail.com</p>
        <p>GitHub. github.com/SejuneOh</p>
        <p>Location. Seoul, Korea</p>
      </div>

      {/* Socials + theme toggle */}
      <div className="mt-6 flex items-center gap-3">
        <a
          href="https://github.com/SejuneOh"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="text-muted transition-colors hover:text-fg"
        >
          <GitHubIcon />
        </a>
        <a
          href="https://sejuneoh.github.io/devlog/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Blog"
          className="text-sm text-muted transition-colors hover:text-fg"
        >
          Blog
        </a>
        <DarkModeToggleBtn />
      </div>
    </aside>
  )
}
