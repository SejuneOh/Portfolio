import Link from "next/link"
import DarkModeToggleBtn from "./darkModeToggleBtn"

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-fg"
        >
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-sm text-white">
            S
          </span>
          Sejune Oh
        </Link>

        <nav className="flex items-center gap-0.5 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-muted transition-colors hover:bg-surface hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="mailto:etry0715@gmail.com"
            className="rounded-md px-3 py-1.5 text-muted transition-colors hover:bg-surface hover:text-fg"
          >
            Contact
          </a>
          <DarkModeToggleBtn />
        </nav>
      </div>
    </header>
  )
}
