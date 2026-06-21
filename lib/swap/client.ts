// Browser-side swap client. The 1Click API sends `Access-Control-Allow-Origin: *`,
// so the app can call it directly from the browser — no server proxy required.
// This is what makes a fully static deploy (e.g. GitHub Pages) possible while
// keeping the swap fully functional. Mirrors the logic the old API routes had.
import { getQuote, getStatus, fetchPrices, SwapApiError } from "./oneclick"
import { CURATED_ASSETS, mergePrices } from "./assets"
import { estimateQuote } from "./estimate"
import type { Quote, QuoteRequestInput, SwapAsset, SwapStatus } from "./types"

export async function loadAssets(): Promise<{ assets: SwapAsset[]; pricesLive: boolean }> {
  try {
    const prices = await fetchPrices()
    return { assets: mergePrices(prices), pricesLive: true }
  } catch {
    return { assets: CURATED_ASSETS, pricesLive: false }
  }
}

export interface QuoteResult {
  quote?: Quote
  degraded?: boolean
  error?: string
}

export async function requestQuote(input: QuoteRequestInput): Promise<QuoteResult> {
  if (input.originAssetId === input.destinationAssetId) {
    return { error: "Choose two different assets" }
  }
  const dry = input.dry ?? true
  try {
    return { quote: await getQuote(input) }
  } catch (err) {
    const status = err instanceof SwapApiError ? err.status : 502
    const message = err instanceof Error ? err.message : "Failed to fetch quote"
    // Preview quotes fall back to an indicative spot estimate if the solver is slow.
    if (dry && status >= 500) {
      try {
        const prices = await fetchPrices()
        const estimate = estimateQuote(input.originAssetId, input.destinationAssetId, input.amount, prices)
        if (estimate) return { quote: estimate, degraded: true }
      } catch {
        /* fall through */
      }
    }
    return { error: message }
  }
}

export async function fetchStatus(depositAddress: string): Promise<{ status?: SwapStatus; error?: string }> {
  try {
    return { status: await getStatus(depositAddress) }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to fetch status" }
  }
}
