import { NextResponse } from "next/server"
import { CURATED_ASSETS, mergePrices } from "@/lib/swap/assets"
import { fetchPrices } from "@/lib/swap/oneclick"

export const runtime = "nodejs"
// Refresh prices periodically; the asset set itself is static.
export const revalidate = 30

export async function GET() {
  try {
    const prices = await fetchPrices()
    return NextResponse.json({ assets: mergePrices(prices), pricesLive: true })
  } catch {
    // Fall back to the static asset list (without live prices) if the feed is down.
    return NextResponse.json({ assets: CURATED_ASSETS, pricesLive: false })
  }
}
