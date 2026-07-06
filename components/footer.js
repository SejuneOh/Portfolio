import Link from "next/link"

const socials = [
  { href: "https://github.com/SejuneOh", label: "GitHub" },
  { href: "https://sejuneoh.github.io/devlog/", label: "Blog" },
  { href: "mailto:etry0715@gmail.com", label: "Email" },
]

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-3 px-5 py-8 sm:flex-row">
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} Sejune Oh · Backend / Fullstack
        </p>
        <div className="flex items-center gap-4 text-sm">
          {socials.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-accent"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
