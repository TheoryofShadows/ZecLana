import { NextResponse } from "next/server"
import { getQuote, SwapApiError, fetchPrices } from "@/lib/swap/oneclick"
import { estimateQuote } from "@/lib/swap/estimate"
import type { QuoteRequestInput } from "@/lib/swap/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  let input: QuoteRequestInput
  try {
    input = (await request.json()) as QuoteRequestInput
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!input.originAssetId || !input.destinationAssetId || !input.amount) {
    return NextResponse.json({ error: "Missing originAssetId, destinationAssetId, or amount" }, { status: 400 })
  }
  if (input.originAssetId === input.destinationAssetId) {
    return NextResponse.json({ error: "Choose two different assets" }, { status: 400 })
  }

  const dry = input.dry ?? true

  try {
    const quote = await getQuote(input)
    return NextResponse.json({ quote })
  } catch (err) {
    const status = err instanceof SwapApiError ? err.status : 502
    const message = err instanceof Error ? err.message : "Failed to fetch quote"

    // For preview (dry) quotes only, fall back to an indicative spot estimate so
    // the UI stays responsive when the solver network is slow. A live quote
    // (needed to reserve a real deposit address) must come from the solver.
    if (dry && status >= 500) {
      try {
        const prices = await fetchPrices()
        const estimate = estimateQuote(input.originAssetId, input.destinationAssetId, input.amount, prices)
        if (estimate) {
          return NextResponse.json({ quote: estimate, degraded: true, message })
        }
      } catch {
        // ignore and fall through to the error below
      }
    }

    return NextResponse.json({ error: message }, { status })
  }
}
