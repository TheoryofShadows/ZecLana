"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { SwapWidget, type SwapPrefill } from "@/components/swap/swap-widget"
import { readRequestFromHash } from "@/lib/swap/payment-link"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function PayPage() {
  const [prefill, setPrefill] = useState<SwapPrefill | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    queueMicrotask(() => {
      const req = readRequestFromHash(window.location.hash)
      if (req) {
        setPrefill({ toAssetId: req.destAssetId, recipient: req.recipient, amount: req.amount, label: req.label })
      }
      setReady(true)
    })
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navigation />
      <section className="px-4 pt-20 pb-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          {!ready ? null : prefill ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="mb-3 text-4xl font-bold">Complete the payment</h1>
                <p className="text-muted-foreground">
                  Pay with any supported asset — it settles to the requester&apos;s address. Non-custodial, no account.
                </p>
              </div>
              <SwapWidget prefill={prefill} />
            </>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <AlertTriangle className="mx-auto mb-4 text-amber-500" size={36} />
              <h1 className="mb-2 text-2xl font-bold">No payment request found</h1>
              <p className="mb-6 text-muted-foreground">
                This link doesn&apos;t contain a valid request. Ask the requester for a new link, or create your own.
              </p>
              <div className="flex justify-center gap-3">
                <Button asChild>
                  <Link href="/request">Create a request</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/zolana">Open the swap</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
