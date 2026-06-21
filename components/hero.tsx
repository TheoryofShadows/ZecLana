import { Button } from "@/components/ui/button"
import { ArrowRight, Lock, ShieldCheck } from "lucide-react"
import Link from "next/link"

const STATS = [
  { value: "0", label: "Accounts required" },
  { value: "0", label: "KYC checks" },
  { value: "100%", label: "Non-custodial" },
]

export function Hero() {
  return (
    <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <ShieldCheck size={16} className="text-primary" />
          <span className="text-sm text-primary">Non-custodial · powered by NEAR Intents</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance">
          Move ZEC across chains.
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary">
            {" "}
            No account. No KYC.
          </span>
        </h1>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
          Swap ZEC between Zcash and Solana — and back — through a decentralized solver network. Your keys, your
          addresses, with a privacy meter that flags when a swap would leak metadata.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" asChild className="gap-2">
            <Link href="/zolana">
              Open the Swap
              <ArrowRight size={18} />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/request">Request a payment</Link>
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-12">
          {STATS.map((s) => (
            <div key={s.label} className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{s.value}</div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="relative w-full h-96 bg-gradient-to-b from-primary/5 to-secondary/5 rounded-2xl border border-border flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="relative text-center">
            <Lock size={48} className="mx-auto mb-4 text-primary neon-pulse" />
            <p className="text-muted-foreground">Settled by solvers. Funds never touch a custodian.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
