import type { Chain, SwapAsset } from "./types"

// Privacy assessment for a swap. The headline differentiator: most cross-chain
// ZEC flows quietly leak metadata by settling to/refunding transparent t-addresses
// (a flaw publicly flagged for the Zashi <> NEAR Intents integration). This engine
// makes that visible and nudges users toward shielded addresses.

export type ZcashAddressKind = "shielded" | "transparent" | "unknown"

export function classifyZcashAddress(addr: string): ZcashAddressKind {
  const a = addr.trim()
  if (!a) return "unknown"
  if (/^(u1|zs1|zc)/.test(a)) return "shielded" // unified, sapling, sprout
  if (/^t[13]/.test(a)) return "transparent"
  return "unknown"
}

export type PrivacyLevel = "high" | "medium" | "low"

export interface PrivacyAssessment {
  level: PrivacyLevel
  score: number // 0-100
  /** Positive privacy properties. */
  good: string[]
  /** Metadata-leak warnings the user should act on. */
  warnings: string[]
}

interface AssessInput {
  origin?: SwapAsset
  destination?: SwapAsset
  recipient: string
  refundTo: string
}

export function assessPrivacy({ origin, destination, recipient, refundTo }: AssessInput): PrivacyAssessment {
  const good: string[] = []
  const warnings: string[] = []
  let score = 55 // baseline: non-custodial, no account, no KYC

  good.push("Non-custodial settlement — no account, no KYC")

  const zecIsDestination = destination?.chain === "zec"
  const zecIsOrigin = origin?.chain === "zec"

  // Receiving ZEC: the recipient address determines on-ledger privacy.
  if (zecIsDestination) {
    const kind = classifyZcashAddress(recipient)
    if (kind === "shielded") {
      score += 35
      good.push("Funds land in Zcash's shielded pool — amount and address stay private")
    } else if (kind === "transparent") {
      score -= 25
      warnings.push(
        "Receiving to a transparent t-address records this swap on Zcash's public ledger. Use a shielded address (u1…/zs1…) or shield immediately in Zashi.",
      )
    }
  }

  // Sending ZEC: a transparent refund address can be linked to your deposit.
  if (zecIsOrigin) {
    const kind = classifyZcashAddress(refundTo)
    if (kind === "shielded") {
      score += 10
      good.push("Shielded refund address keeps a failed swap private")
    } else if (kind === "transparent") {
      score -= 15
      warnings.push(
        "A transparent refund address can link your deposit on Zcash's public ledger if the swap is refunded. Prefer a shielded refund where supported.",
      )
    }
  }

  // No ZEC leg at all — purely transparent chains.
  if (!zecIsDestination && !zecIsOrigin && (origin || destination)) {
    warnings.push("Neither side touches Zcash's shielded pool, so both legs are publicly visible on their chains.")
    score -= 5
  }

  score = Math.max(5, Math.min(100, score))
  const level: PrivacyLevel = score >= 80 ? "high" : score >= 55 ? "medium" : "low"
  return { level, score, good, warnings }
}

/** Chains whose addresses are inherently public (everything except shielded ZEC). */
export function isPublicChain(chain?: Chain): boolean {
  return chain !== undefined && chain !== "zec"
}
