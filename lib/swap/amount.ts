// Decimal-safe conversion between human amounts and on-chain smallest units.
// Uses BigInt to avoid floating-point rounding on token balances.

/** Convert a human amount string (e.g. "1.25") to smallest units for `decimals`. */
export function toSmallestUnit(amount: string, decimals: number): string {
  const trimmed = amount.trim()
  if (!/^\d*\.?\d*$/.test(trimmed) || trimmed === "" || trimmed === ".") {
    throw new Error(`Invalid amount: "${amount}"`)
  }

  const [whole, fraction = ""] = trimmed.split(".")
  if (fraction.length > decimals) {
    // Truncate excess precision rather than rounding up.
    return toSmallestUnit(`${whole}.${fraction.slice(0, decimals)}`, decimals)
  }

  const paddedFraction = fraction.padEnd(decimals, "0")
  const combined = `${whole || "0"}${paddedFraction}`.replace(/^0+(?=\d)/, "")
  return BigInt(combined || "0").toString()
}

/** Convert smallest units back to a human-readable decimal string. */
export function fromSmallestUnit(raw: string, decimals: number, maxFractionDigits = 6): string {
  const negative = raw.startsWith("-")
  const digits = (negative ? raw.slice(1) : raw).padStart(decimals + 1, "0")
  const whole = digits.slice(0, digits.length - decimals)
  let fraction = digits.slice(digits.length - decimals)

  fraction = fraction.slice(0, maxFractionDigits).replace(/0+$/, "")
  const value = fraction ? `${whole}.${fraction}` : whole
  return negative ? `-${value}` : value
}
