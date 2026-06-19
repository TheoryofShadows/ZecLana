import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, Lock } from "lucide-react"
import Link from "next/link"

export default function Privacy20Page() {
  const mertQuotes = [
    {
      text: "20 years from now: Bitcoin, Solana, ZEC.",
      date: "Oct 23, 2025",
      source: "Messari Fully Diluted",
    },
    {
      text: "Privacy is not a feature. It's a fundamental right.",
      date: "2025",
      source: "Zolana Manifesto",
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navigation />

      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-balance">
              Privacy 2.0
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                {" "}
                Powered by Helius
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              The infrastructure layer enabling Bitcoin-grade privacy at Solana scale.
            </p>
          </div>

          {/* Helius Badge */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-secondary/10 border border-secondary/20 rounded-full">
              <Zap size={20} className="text-secondary" />
              <span className="font-semibold">Powered by Helius staked RPCs + Arcium zk-RPC</span>
            </div>
          </div>

          {/* What is Privacy 2.0 */}
          <Card className="p-8 mb-12 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <h2 className="text-2xl font-bold mb-4">What is Privacy 2.0?</h2>
            <p className="text-muted-foreground mb-4">
              Privacy 2.0 is Helius&apos;s vision for a privacy-first infrastructure layer built on Solana. It combines:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <Shield size={20} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Arcium zk-RPC</h4>
                  <p className="text-sm text-muted-foreground">
                    Zero-knowledge RPC that hides sender/receiver/amount from validators
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Zap size={20} className="text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Staked RPCs</h4>
                  <p className="text-sm text-muted-foreground">
                    Decentralized validator network ensuring no single point of failure
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Lock size={20} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Confidential Transfers</h4>
                  <p className="text-sm text-muted-foreground">
                    Token Extensions on Solana enable encrypted amounts on-chain
                  </p>
                </div>
              </li>
            </ul>
          </Card>

          {/* Arcium Video Placeholder */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Arcium in Action</h2>
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 border border-border rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <Zap size={48} className="mx-auto mb-4 text-secondary neon-pulse" />
                <p className="text-muted-foreground">Video: Arcium zk-RPC Demo</p>
                <p className="text-sm text-muted-foreground mt-2">Coming soon on YouTube</p>
              </div>
            </div>
          </div>

          {/* Mert Quote Carousel */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">The Vision</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mertQuotes.map((quote, idx) => (
                <Card key={idx} className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <blockquote className="mb-4">
                    <p className="text-lg font-semibold italic">&ldquo;{quote.text}&rdquo;</p>
                  </blockquote>
                  <footer className="text-sm text-muted-foreground">
                    <span className="font-semibold">— Mert Mumtaz</span>
                    <br />
                    <span className="text-xs">{quote.source}</span>
                  </footer>
                </Card>
              ))}
            </div>
          </div>

          {/* Why Helius */}
          <div className="bg-gradient-to-r from-secondary/10 to-primary/10 border border-border rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6">Why Helius Leads Privacy 2.0</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap size={20} className="text-secondary" />
                  50k TPS
                </h3>
                <p className="text-sm text-muted-foreground">
                  Processes millions of private txs without breaking a sweat
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield size={20} className="text-primary" />
                  Proven Track Record
                </h3>
                <p className="text-sm text-muted-foreground">Already powering Solana&apos;s most critical infrastructure</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Lock size={20} className="text-primary" />
                  Open Stack
                </h3>
                <p className="text-sm text-muted-foreground">
                  Composable with Zcash, Solana, and future privacy layers
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link href="/tachyon">
                See the Future: Project Tachyon
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/zolana">Back to Bridge</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
