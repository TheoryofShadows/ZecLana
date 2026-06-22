import { describe, it, expect } from "vitest"
import { buildZip321Uri } from "@/lib/swap/zashi"

const ADDR = "t1KzZxbwUNB4Hu1Hg3a4qWxGpGT5Bo4Mr8w"

describe("buildZip321Uri", () => {
  it("encodes address and amount as a zcash: URI", () => {
    expect(buildZip321Uri(ADDR, "1.25")).toBe(`zcash:${ADDR}?amount=1.25`)
  })

  it("trims trailing zeros and respects 8-decimal precision", () => {
    expect(buildZip321Uri(ADDR, "1.50000000")).toBe(`zcash:${ADDR}?amount=1.5`)
    expect(buildZip321Uri(ADDR, "0.00052")).toBe(`zcash:${ADDR}?amount=0.00052`)
  })

  it("omits the amount when missing, zero, or invalid", () => {
    expect(buildZip321Uri(ADDR)).toBe(`zcash:${ADDR}`)
    expect(buildZip321Uri(ADDR, "0")).toBe(`zcash:${ADDR}`)
    expect(buildZip321Uri(ADDR, "abc")).toBe(`zcash:${ADDR}`)
  })

  it("trims surrounding whitespace on the address", () => {
    expect(buildZip321Uri(`  ${ADDR}  `, "1")).toBe(`zcash:${ADDR}?amount=1`)
  })
})
