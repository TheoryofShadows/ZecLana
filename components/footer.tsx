import Link from "next/link"
import { Twitter, Github, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">⚡</span>
              </div>
              <span className="font-bold">Zolana</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Encrypted Bitcoin at scale. Zcash shielding + Solana speed + Helius reliability.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/zolana" className="text-muted-foreground hover:text-foreground transition">
                  Bridge
                </Link>
              </li>
              <li>
                <Link href="/privacy-2.0" className="text-muted-foreground hover:text-foreground transition">
                  Privacy 2.0
                </Link>
              </li>
              <li>
                <Link href="/tachyon" className="text-muted-foreground hover:text-foreground transition">
                  Tachyon Roadmap
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Developers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  SDK Docs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Status Page
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Vision</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Manifesto
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Community
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
              <span className="text-xs font-semibold text-primary">🛡️ Zolana Native</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-lg">
              <span className="text-xs font-semibold text-secondary">⚡ Powered by Helius Privacy 2.0</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
              <span className="text-xs font-semibold text-primary">🔐 Bitcoin-Grade Privacy</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              2025 Zolana. "20 years from now: Bitcoin, Solana, ZEC." — Mert Mumtaz
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                <Github size={20} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                <Mail size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
