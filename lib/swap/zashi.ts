// ZIP-321 Zcash payment requests (https://zips.z.cash/zip-0321). When paying the
// ZEC side of a swap, we encode the deposit address + exact amount as a `zcash:`
// URI so any Zcash wallet — Zashi in particular — can scan the QR or open the
// link and pre-fill the send. Zashi is mobile-only and exposes no browser API,
// so this is the real, useful integration point (there's no way to read your
// shielded address back into a web page).

// Official Zcash wallet by Electric Coin Company — "Zashi", rebranded to "Zodl"
// in 2026 (same app, same team). App IDs are stable across the rebrand, so we
// link the store listings directly rather than a marketing page that may rename.
export const ZCASH_WALLET = {
  ios: "https://apps.apple.com/app/id1672392439",
  android: "https://play.google.com/store/apps/details?id=co.electriccoin.zcash",
}

/** Format an amount to ZIP-321's allowed precision (up to 8 decimals, no trailing zeros). */
function formatZecAmount(amount: string): string | null {
  const n = Number(amount)
  if (!Number.isFinite(n) || n <= 0) return null
  // Max 8 fractional digits; trim trailing zeros and any trailing dot.
  return n.toFixed(8).replace(/0+$/, "").replace(/\.$/, "")
}

/** Build a `zcash:<address>?amount=<amount>` ZIP-321 URI. */
export function buildZip321Uri(address: string, amount?: string): string {
  const addr = address.trim()
  const params = new URLSearchParams()
  if (amount) {
    const formatted = formatZecAmount(amount)
    if (formatted) params.set("amount", formatted)
  }
  const query = params.toString()
  return query ? `zcash:${addr}?${query}` : `zcash:${addr}`
}
