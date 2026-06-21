import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to swap privately?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            No account, no KYC. Move ZEC across chains in a few clicks — or share a payment request anyone can pay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link href="/zolana">
                Open the Swap
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="https://github.com/TheoryofShadows/ZecLana" target="_blank" rel="noreferrer">
                View source
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
