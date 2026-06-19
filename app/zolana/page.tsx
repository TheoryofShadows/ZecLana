"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SwapWidget } from "@/components/swap/swap-widget"
import { ArrowRight, Lock, Zap } from "lucide-react"
import Link from "next/link"

export default function ZolanaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navigation />

      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-balance">
              Zolana Bridge
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"> Live</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Swap ZEC between Zcash and Solana — and back — with no account and no KYC. Powered by NEAR Intents.
            </p>
          </div>

          {/* Live swap widget */}
          <div className="max-w-xl mx-auto mb-16">
            <SwapWidget />
          </div>

          {/* Why it's private */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-center gap-3 mb-2">
                <Lock size={20} className="text-primary" />
                <h3 className="font-semibold text-lg">No account, no KYC</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Swaps settle through a decentralized solver network. You never create an account or hand over identity
                documents — funds move directly to the address you control.
              </p>
            </Card>

            <Card className="p-6 border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
              <div className="flex items-center gap-3 mb-2">
                <Zap size={20} className="text-secondary" />
                <h3 className="font-semibold text-lg">ZEC, both ways</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Move native ZEC onto Solana as szEC for instant, low-fee transfers — then unwrap back to native ZEC on
                Zcash whenever you want. SOL and USDC routes included.
              </p>
            </Card>
          </div>

          {/* Bridge Flow */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-border rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold mb-8 text-center">The Zolana Flow</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center font-bold text-primary">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Shield on Zcash</h3>
                  <p className="text-sm text-muted-foreground">
                    Deposit ZEC into shielded pool via Zashi wallet. Your balance is encrypted using zk-SNARKs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center font-bold text-secondary">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Bridge via Helius</h3>
                  <p className="text-sm text-muted-foreground">
                    Helius staked RPC routes your shielded ZEC → szEC on Solana via Near Intents atomic swap.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center font-bold text-primary">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Send on Solana</h3>
                  <p className="text-sm text-muted-foreground">
                    Instant settlement. szEC arrives in recipient&apos;s wallet in ~2 seconds. Zero public trace.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center font-bold text-secondary">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Unshield on Arrival</h3>
                  <p className="text-sm text-muted-foreground">
                    Recipient uses Zashi to unshield szEC back to ZEC or swap to any Solana token. Privacy intact.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link href="https://zashi.cash" target="_blank">
                Open Zashi Wallet
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/privacy-2.0">Learn about Privacy 2.0</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
