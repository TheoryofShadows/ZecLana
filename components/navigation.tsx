"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

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

          <div className="hidden md:flex items-center gap-8">
            <Link href="/zolana" className="text-sm hover:text-primary transition font-medium">
              Bridge
            </Link>
            <Link href="/privacy-2.0" className="text-sm hover:text-primary transition">
              Privacy 2.0
            </Link>
            <Link href="/tachyon" className="text-sm hover:text-primary transition">
              Tachyon
            </Link>
            <Link href="#how-it-works" className="text-sm hover:text-primary transition">
              How It Works
            </Link>
            <Link href="/dashboard" className="text-sm hover:text-primary transition">
              Dashboard
            </Link>
          </div>

          <div className="hidden md:flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="gap-2">
              <Link href="/send">Send Money</Link>
            </Button>
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link href="/zolana" className="block text-sm hover:text-primary transition font-medium">
              Bridge
            </Link>
            <Link href="/privacy-2.0" className="block text-sm hover:text-primary transition">
              Privacy 2.0
            </Link>
            <Link href="/tachyon" className="block text-sm hover:text-primary transition">
              Tachyon
            </Link>
            <Link href="#how-it-works" className="block text-sm hover:text-primary transition">
              How It Works
            </Link>
            <Link href="/dashboard" className="block text-sm hover:text-primary transition">
              Dashboard
            </Link>
            <div className="flex gap-3 pt-2 flex-col">
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/send">Send Money</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
