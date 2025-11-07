import { Card } from "@/components/ui/card"
import { Lock, Zap, Globe, Shield, TrendingUp, Key } from "lucide-react"

const features = [
  {
    icon: Lock,
    title: "Bitcoin-Grade Privacy",
    description:
      "Zcash zk-SNARKs ensure sender, receiver, and amounts are mathematically hidden. Even governments can't see.",
  },
  {
    icon: Zap,
    title: "Solana Speed",
    description: "Sub-second finality means remittances arrive in 2-5 seconds, not hours or days.",
  },
  {
    icon: Globe,
    title: "Truly Borderless",
    description: "Send to any country. No geographic restrictions, capital controls, or tracking. Pure sovereignty.",
  },
  {
    icon: Shield,
    title: "Helius Reliability",
    description: "Powered by Helius staked RPCs and Arcium zk-RPC for 99.99% uptime and zero middlemen.",
  },
  {
    icon: TrendingUp,
    title: "Earn While Bridged",
    description: "Shielded assets earn yield in Solana DeFi pools while maintaining privacy.",
  },
  {
    icon: Key,
    title: "Self-Custody Only",
    description: "You control your keys. No platform owns your money. Just pure decentralized privacy.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">The fusion of Zcash + Solana + Helius</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Bitcoin-grade privacy. Solana scalability. Helius infrastructure. Everything diaspora communities need.
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
