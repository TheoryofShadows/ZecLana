import type { Quote } from "./types"
import { getAssetById } from "./assets"
import { fromSmallestUnit, toSmallestUnit } from "./amount"

// Indicative quote derived from spot USD prices. Used only as a UI fallback
// when the solver network is slow to respond. It never returns a deposit
// address, so it cannot be used to initiate a real swap — it just keeps the
// estimate visible. `feeBps` approximates spread + network costs.
export function estimateQuote(
  originAssetId: string,
  destinationAssetId: string,
  amount: string,
  prices: Record<string, number>,
  feeBps = 50,
): Quote | null {
  const origin = getAssetById(originAssetId)
  const destination = getAssetById(destinationAssetId)
  if (!origin || !destination) return null

  const priceIn = prices[originAssetId] ?? origin.priceUsd
  const priceOut = prices[destinationAssetId] ?? destination.priceUsd
  if (!priceIn || !priceOut) return null

  const amountInNum = Number(amount)
  if (!Number.isFinite(amountInNum) || amountInNum <= 0) return null

  const usdValue = amountInNum * priceIn
  const grossOut = usdValue / priceOut
  const netOut = grossOut * (1 - feeBps / 10_000)

  const amountInSmallest = toSmallestUnit(amount, origin.decimals)
  const amountOutSmallest = toSmallestUnit(netOut.toFixed(destination.decimals), destination.decimals)

  return {
    amountIn: amountInSmallest,
    amountInFormatted: amount,
    amountInUsd: usdValue.toFixed(2),
    amountOut: amountOutSmallest,
    amountOutFormatted: fromSmallestUnit(amountOutSmallest, destination.decimals),
    amountOutUsd: (netOut * priceOut).toFixed(2),
    indicative: true,
  }
}
