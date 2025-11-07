import { Card } from "@/components/ui/card"
import { ArrowDown } from "lucide-react"

const steps = [
  {
    number: "1",
    title: "Shield on Zcash",
    description: "Connect Zashi wallet. Deposit ZEC into shielded pool. Amount is encrypted with zk-SNARKs.",
  },
  {
    number: "2",
    title: "Bridge via Helius",
    description: "Helius routes shielded ZEC → szEC on Solana via Near Intents atomic swap. Instant atomic settlement.",
  },
  {
    number: "3",
    title: "Send on Solana",
    description: "szEC arrives in recipient's wallet in 2-5 seconds. Zero public trace. No validator sees transaction.",
  },
  {
    number: "4",
    title: "Unshield on Arrival",
    description: "Recipient uses Zashi to unshield szEC back to ZEC or swap to any token. Privacy intact forever.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">The Zolana Flow</h2>
          <p className="text-xl text-muted-foreground">
            Four steps to send private remittances like Satoshi dreamed. Zero surveillance. Bitcoin-grade privacy.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={i}>
              <Card className="p-8 hover:border-primary/50 transition">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </Card>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-4">
                  <ArrowDown className="text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
