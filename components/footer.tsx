"use client"

import { useState } from "react"
import type React from "react"
import Link from "next/link"

const nav = [
  { href: "/", label: "HOME" },
  { href: "/projects", label: "PROJECTS" },
  { href: "/blog", label: "BLOG" },
]

export default function Footer() {
  const [email, setEmail] = useState("")

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email) return
    const subject = encodeURIComponent("포트폴리오 소식 받기")
    const body = encodeURIComponent(`소식을 받아보고 싶습니다.\n제 이메일: ${email}`)
    window.location.href = `mailto:etry0715@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <footer className="pb-16">
      {/* divider with // mark */}
      <div className="flex items-center py-10">
        <div className="h-px flex-1 bg-line" />
        <span className="px-4 font-mono text-sm text-muted">{"//"}</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold tracking-wide text-fg">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-accent">
              {n.label}
            </Link>
          ))}
          <a href="mailto:etry0715@gmail.com" className="hover:text-accent">
            CONTACT
          </a>
        </nav>

        <form onSubmit={handleSubscribe} className="w-full md:max-w-sm">
          <p className="mb-2 text-sm text-muted">새 글과 소식을 이메일로 받아보세요.</p>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="min-w-0 flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none"
            />
            <button type="submit" className="btn-accent shrink-0">
              Subscribe
            </button>
          </div>
        </form>
      </div>

      <p className="mt-10 text-xs text-muted">
        © {new Date().getFullYear()} Sejune Oh · Backend / Fullstack
      </p>
    </footer>
  )
}
