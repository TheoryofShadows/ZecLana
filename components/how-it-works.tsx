import { Card } from "@/components/ui/card"
import { ArrowDown } from "lucide-react"

const steps = [
  {
    number: "1",
    title: "Quote the swap",
    description:
      "Pick a direction — native ZEC to ZEC-on-Solana (szEC), SOL, or USDC — and get a live rate from the solver network.",
  },
  {
    number: "2",
    title: "Add your addresses",
    description:
      "Enter where you want funds delivered and a refund address. No sign-up, no email, no identity documents.",
  },
  {
    number: "3",
    title: "Send to the deposit address",
    description:
      "Reserve a quote and send the exact amount to a one-time deposit address (scan it into Zashi for the ZEC side). Solvers settle it.",
  },
  {
    number: "4",
    title: "Receive on the other side",
    description:
      "Track status live until the destination asset lands in your wallet. Funds never touch a custodian.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">How a swap works</h2>
          <p className="text-xl text-muted-foreground">
            Four steps, no intermediaries holding your funds.
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
