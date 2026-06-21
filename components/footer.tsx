import Link from "next/link"
import { Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">⚡</span>
              </div>
              <span className="font-bold">Zolana</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Non-custodial cross-chain ZEC swaps. No account, no KYC — settled by the NEAR Intents solver network.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/zolana" className="text-muted-foreground hover:text-foreground transition">
                  Swap
                </Link>
              </li>
              <li>
                <Link href="/request" className="text-muted-foreground hover:text-foreground transition">
                  Request a payment
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://zashi.cash"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  Zashi Wallet
                </a>
              </li>
              <li>
                <a
                  href="https://near-intents.org"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  NEAR Intents
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/TheoryofShadows/ZecLana"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  Source code
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Non-custodial · no account · no KYC. You control your keys and addresses.
            </p>
            <a
              href="https://github.com/TheoryofShadows/ZecLana"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-foreground transition"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
