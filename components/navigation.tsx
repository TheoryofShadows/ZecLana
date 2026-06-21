"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

const NAV_LINKS = [
  { href: "/zolana", label: "Swap", emphasis: true },
  { href: "/request", label: "Request" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "https://github.com/TheoryofShadows/ZecLana", label: "GitHub", external: true },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">⚡</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline">Zolana</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noreferrer" : undefined}
                className={`text-sm hover:text-primary transition ${l.emphasis ? "font-medium" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex gap-3">
            <Button asChild className="gap-2">
              <Link href="/zolana">Open the Swap</Link>
            </Button>
          </div>

          <button className="lg:hidden" aria-label="Toggle navigation menu" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="lg:hidden pb-4 space-y-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noreferrer" : undefined}
                className={`block text-sm hover:text-primary transition ${l.emphasis ? "font-medium" : ""}`}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-2 flex-col">
              <Button asChild className="w-full">
                <Link href="/zolana">Open the Swap</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
