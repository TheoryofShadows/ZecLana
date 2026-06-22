import { Card } from "@/components/ui/card"
import { Lock, ShieldCheck, ArrowLeftRight, Receipt, EyeOff, Key } from "lucide-react"

const features = [
  {
    icon: Lock,
    title: "No account, no KYC",
    description:
      "Swaps settle through the NEAR Intents solver network. You never create an account or hand over identity documents.",
  },
  {
    icon: ArrowLeftRight,
    title: "ZEC, both ways",
    description:
      "Move native ZEC onto Solana as szEC, or back to Zcash. SOL and USDC routes are included too.",
  },
  {
    icon: EyeOff,
    title: "Privacy meter",
    description:
      "A live meter flags when a swap would settle to or refund a transparent t-address, and nudges you toward shielded addresses.",
  },
  {
    icon: Receipt,
    title: "No-account payment requests",
    description:
      "Generate a shareable link that anyone can pay from any chain. The request lives in the link — nothing is stored on a server.",
  },
  {
    icon: ShieldCheck,
    title: "Refunds built in",
    description:
      "Every swap has a refund address. If a route can't complete, your funds are returned automatically — no support tickets.",
  },
  {
    icon: Key,
    title: "Self-custody only",
    description:
      "Funds move directly to the address you control and never touch a custodian. The app never asks you to sign or spend.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Private by default, custodian-free</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cross-chain ZEC swaps with the privacy trade-offs made visible — not hidden.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <Card key={i} className="p-6 hover:border-secondary/50 transition">
                <Icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
