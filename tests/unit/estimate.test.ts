import { describe, it, expect } from "vitest"
import { estimateQuote } from "@/lib/swap/estimate"

const ZEC = "nep141:zec.omft.near"
const SOL = "nep141:sol.omft.near"
const prices = { [ZEC]: 40, [SOL]: 200 }

describe("estimateQuote", () => {
  it("computes a fee-adjusted indicative quote", () => {
    const q = estimateQuote(ZEC, SOL, "10", prices)!
    expect(q).not.toBeNull()
    expect(q.indicative).toBe(true)
    // 10 ZEC * $40 = $400 of SOL @ $200 = 2 SOL, minus 0.5% fee = 1.99
    expect(q.amountInUsd).toBe("400.00")
    expect(Number(q.amountOutFormatted)).toBeCloseTo(1.99, 5)
  })

  it("applies a configurable fee in basis points", () => {
    const noFee = estimateQuote(ZEC, SOL, "10", prices, 0)!
    expect(Number(noFee.amountOutFormatted)).toBeCloseTo(2, 5)
  })

  it("returns null for unknown assets", () => {
    expect(estimateQuote("bad", SOL, "1", prices)).toBeNull()
    expect(estimateQuote(ZEC, "bad", "1", prices)).toBeNull()
  })

  it("returns null when a price is missing", () => {
    expect(estimateQuote(ZEC, SOL, "1", { [ZEC]: 40 })).toBeNull()
  })

  it("returns null for non-positive or non-finite amounts", () => {
    expect(estimateQuote(ZEC, SOL, "0", prices)).toBeNull()
    expect(estimateQuote(ZEC, SOL, "-5", prices)).toBeNull()
    expect(estimateQuote(ZEC, SOL, "abc", prices)).toBeNull()
  })

  it("carries smallest-unit amounts for both legs", () => {
    const q = estimateQuote(ZEC, SOL, "1", prices)!
    // ZEC has 8 decimals
    expect(q.amountIn).toBe("100000000")
    // SOL has 9 decimals; amountOut is a numeric string of digits
    expect(/^\d+$/.test(q.amountOut)).toBe(true)
  })
})
