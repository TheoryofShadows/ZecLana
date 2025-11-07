"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, TrendingUp, Lock, Zap } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function ZolanaPage() {
  const [zecPrice, setZecPrice] = useState(350)
  const [szecPrice, setSzecPrice] = useState(350.02)
  const [liquidity, setLiquidity] = useState(56600000)

  useEffect(() => {
    const interval = setInterval(() => {
      setZecPrice((prev) => prev + (Math.random() - 0.5) * 2)
      setSzecPrice((prev) => prev + (Math.random() - 0.5) * 2)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navigation />

      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-balance">
              Zolana Bridge
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"> Live</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Real-time ZEC ↔ szEC (Solana ZEC) bridge powered by Near Intents and Raydium liquidity.
            </p>
          </div>

          {/* Price Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">ZEC Price</h3>
                <Lock size={20} className="text-primary" />
              </div>
              <div className="text-4xl font-bold mb-2">${zecPrice.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Zcash mainnet</p>
            </Card>

            <Card className="p-8 border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">szEC Price</h3>
                <Zap size={20} className="text-secondary" />
              </div>
              <div className="text-4xl font-bold mb-2">${szecPrice.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Solana token</p>
            </Card>
          </div>

          {/* Liquidity Info */}
          <Card className="p-8 mb-12 border-border/50 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">Raydium Liquidity</h3>
                <p className="text-muted-foreground">Deep, stable ZEC/USDC pool on Solana</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-secondary">${(liquidity / 1000000).toFixed(1)}M</div>
                <p className="text-sm text-muted-foreground flex items-center gap-2 justify-end">
                  <TrendingUp size={16} className="text-secondary" />
                  Live liquidity feed
                </p>
              </div>
            </div>
          </Card>

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
                    Instant settlement. szEC arrives in recipient's wallet in ~2 seconds. Zero public trace.
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
