"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SwapWidget } from "@/components/swap/swap-widget"
import { ArrowRight, Lock, Zap, Sparkles, Wallet, ShieldCheck, EyeOff } from "lucide-react"
import Link from "next/link"

const TRUST_STATS = [
  { value: "0", label: "Accounts required" },
  { value: "0", label: "KYC checks" },
  { value: "~2s", label: "Solana finality" },
  { value: "24/7", label: "Solver network" },
]

const FLOW_STEPS = [
  {
    n: 1,
    accent: "primary" as const,
    title: "Quote the swap",
    body: "Pick a direction — native ZEC to ZEC-on-Solana (szEC), SOL, or USDC — and get a live rate from the solver network.",
  },
  {
    n: 2,
    accent: "secondary" as const,
    title: "Add your addresses",
    body: "Enter where you want funds delivered and a refund address. No sign-up, no email, no identity documents.",
  },
  {
    n: 3,
    accent: "primary" as const,
    title: "Send to deposit address",
    body: "Reserve a quote and send the exact amount to a one-time deposit address. Solvers settle it atomically.",
  },
  {
    n: 4,
    accent: "secondary" as const,
    title: "Receive on the other side",
    body: "Track status live until the destination asset lands in your wallet. Funds never touch a custodian.",
  },
]

export default function ZolanaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navigation />

      <section className="relative overflow-hidden px-4 pt-20 pb-32 sm:px-6 lg:px-8">
        {/* ambient backdrop */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-10 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-1/4 top-40 h-64 w-96 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
              <Sparkles size={16} className="text-primary" />
              <span className="text-sm text-primary">Live · non-custodial · powered by NEAR Intents</span>
            </div>

            <h1 className="mb-6 text-balance text-5xl font-bold sm:text-6xl">
              Move ZEC across chains.
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                {" "}
                No account. No KYC.
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-xl text-muted-foreground">
              Swap ZEC between Zcash and Solana — and back — through a decentralized solver network. Your keys, your
              addresses, zero surveillance.
            </p>
          </div>

          {/* Live swap widget */}
          <div className="mx-auto mb-8 max-w-xl">
            <SwapWidget />
          </div>

          {/* Trust stats */}
          <div className="mx-auto mb-20 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {TRUST_STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-primary sm:text-3xl">{s.value}</div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Why it's private */}
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Lock size={20} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No account, no KYC</h3>
              <p className="text-sm text-muted-foreground">
                Swaps settle through a decentralized solver network. You never create an account or hand over identity
                documents — funds move directly to the address you control.
              </p>
            </Card>

            <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent p-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <Zap size={20} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">ZEC, both ways</h3>
              <p className="text-sm text-muted-foreground">
                Move native ZEC onto Solana as szEC for instant, low-fee transfers — then unwrap back to native ZEC on
                Zcash whenever you want. SOL and USDC routes included.
              </p>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <EyeOff size={20} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">You stay in control</h3>
              <p className="text-sm text-muted-foreground">
                Every swap has a refund address. If a route can&apos;t complete, your funds are returned automatically —
                no support tickets, no frozen balances.
              </p>
            </Card>
          </div>

          {/* Supported routes */}
          <div className="mb-12 rounded-2xl border border-border bg-muted/20 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Wallet size={18} className="text-secondary" />
              <h2 className="text-lg font-semibold">Supported routes</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "ZEC ⇄ ZEC on Solana (szEC)",
                "ZEC ⇄ SOL",
                "ZEC ⇄ USDC",
                "SOL ⇄ USDC",
              ].map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Flow */}
          <div className="mb-12 rounded-2xl border border-border bg-gradient-to-r from-primary/5 to-secondary/5 p-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold">How a swap works</h2>
              <p className="mt-2 text-sm text-muted-foreground">Four steps, no intermediaries holding your funds.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {FLOW_STEPS.map((step) => (
                <div key={step.n} className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold ${
                      step.accent === "primary"
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary/15 text-secondary"
                    }`}
                  >
                    {step.n}
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-start gap-2 rounded-xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-secondary" />
              <span>
                Native ZEC can&apos;t live in a Solana wallet, so the ZEC side always uses a deposit-address flow. That
                is inherent to cross-chain settlement — not a limitation of the app — and it keeps the swap
                non-custodial end to end.
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
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
