import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Rocket, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"

export default function TachyonPage() {
  const tachyonDate = new Date("2026-01-01")
  const now = new Date()
  const daysLeft = Math.ceil((tachyonDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const roadmapItems = [
    {
      phase: "Phase 1: Foundation",
      timeframe: "Q4 2025",
      items: [
        "Zcash + Solana bridge launches (completed)",
        "Helius Privacy 2.0 integrations",
        "Zolana reaches 10k users",
      ],
    },
    {
      phase: "Phase 2: Scale",
      timeframe: "Q1 2026",
      items: [
        "Project Tachyon mainnet candidate release",
        "Zolana adds 100k+ diaspora users",
        "Multi-corridor fiat on/off ramps",
      ],
    },
    {
      phase: "Phase 3: Tachyon Mainnet",
      timeframe: "Q2 2026",
      items: [
        "Thousands of private TPS on Zcash",
        "Zolana becomes critical diaspora infrastructure",
        "$1B+ remittances processed",
      ],
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
              Project Tachyon
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                {" "}
                Countdown
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              The future of Zcash privacy infrastructure. Thousands of private TPS. Coming soon.
            </p>
          </div>

          {/* Countdown */}
          <Card className="p-8 mb-12 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent text-center">
            <p className="text-sm text-muted-foreground mb-4">Mainnet launch estimate</p>
            <div className="text-6xl font-bold text-primary mb-4">{daysLeft} days</div>
            <p className="text-lg font-semibold mb-2">Until Project Tachyon Mainnet</p>
            <p className="text-sm text-muted-foreground">Zcash's next-generation privacy architecture</p>
          </Card>

          {/* What is Tachyon */}
          <Card className="p-8 mb-12 border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
            <h2 className="text-2xl font-bold mb-4">What is Project Tachyon?</h2>
            <p className="text-muted-foreground mb-6">
              Project Tachyon is Zcash's next-generation upgrade enabling thousands of private transactions per second.
              It's the answer to Bitcoin's UTXO model meeting Solana's throughput.
            </p>

            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <Zap size={24} className="text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Massive Throughput</h3>
                  <p className="text-sm text-muted-foreground">
                    From ~25 TPS to 10,000+ private TPS using shielded pools
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Rocket size={24} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">New Privacy Model</h3>
                  <p className="text-sm text-muted-foreground">
                    Orchard protocol evolution enabling larger shielded pools
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <TrendingUp size={24} className="text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Bitcoin Layer</h3>
                  <p className="text-sm text-muted-foreground">Privacy-first DeFi emerges on Zcash with Tachyon</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Roadmap */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-8 text-center">Zolana Roadmap</h2>
            <div className="space-y-6">
              {roadmapItems.map((phase, idx) => (
                <div key={idx} className="border border-border rounded-lg p-6 hover:bg-muted/30 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{phase.phase}</h3>
                      <p className="text-sm text-primary font-semibold">{phase.timeframe}</p>
                    </div>
                    <div className="text-3xl opacity-30">{idx + 1}</div>
                  </div>
                  <ul className="space-y-2">
                    {phase.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-3">
                        <span className="text-secondary font-bold">✓</span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-Upgrade Path */}
          <Card className="p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent mb-12">
            <h2 className="text-2xl font-bold mb-4">Auto-Upgrade for Zolana Users</h2>
            <p className="text-muted-foreground mb-6">
              When Project Tachyon launches, Zolana users automatically benefit from:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="text-secondary font-bold">•</span>
                <span>10x faster remittances (even lower fees)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-secondary font-bold">•</span>
                <span>Unlimited privacy throughput</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-secondary font-bold">•</span>
                <span>DeFi opportunities on Tachyon layer</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-secondary font-bold">•</span>
                <span>Full backward compatibility (no action needed)</span>
              </li>
            </ul>
          </Card>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link href="/zolana">
                Bridge Now. Future-Proof.
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/">Back Home</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
