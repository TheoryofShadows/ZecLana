import { describe, it, expect } from "vitest"
import { classifyZcashAddress, assessPrivacy, isPublicChain } from "@/lib/swap/privacy"
import { getAssetById } from "@/lib/swap/assets"
import type { SwapAsset } from "@/lib/swap/types"

const ZEC = getAssetById("nep141:zec.omft.near") as SwapAsset
const SZEC = getAssetById("1cs_v1:sol:spl:A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS") as SwapAsset
const SOL = getAssetById("nep141:sol.omft.near") as SwapAsset

const SHIELDED_U = "u1abcdefghijklmnopqrstuvwxyz0123456789"
const SHIELDED_ZS = "zs1abcdefghijklmnopqrstuvwxyz0123456789"
const TRANSPARENT = "t1KzZxbwUNB4Hu1Hg3a4qWxGpGT5Bo4Mr8w"

describe("classifyZcashAddress", () => {
  it("recognises shielded prefixes", () => {
    expect(classifyZcashAddress("u1xyz")).toBe("shielded")
    expect(classifyZcashAddress("zs1xyz")).toBe("shielded")
    expect(classifyZcashAddress("zcMyShieldedSprout")).toBe("shielded")
  })
  it("recognises transparent prefixes", () => {
    expect(classifyZcashAddress("t1abc")).toBe("transparent")
    expect(classifyZcashAddress("t3abc")).toBe("transparent")
  })
  it("returns unknown for blanks and unrelated strings", () => {
    expect(classifyZcashAddress("")).toBe("unknown")
    expect(classifyZcashAddress("   ")).toBe("unknown")
    expect(classifyZcashAddress("0xdeadbeef")).toBe("unknown")
  })
})

describe("assessPrivacy", () => {
  it("rewards receiving ZEC to a shielded address (high, no warning)", () => {
    const a = assessPrivacy({ origin: SOL, destination: ZEC, recipient: SHIELDED_U, refundTo: "" })
    expect(a.level).toBe("high")
    expect(a.score).toBeGreaterThanOrEqual(80)
    expect(a.warnings).toHaveLength(0)
    expect(a.good.join(" ")).toMatch(/shielded pool/i)
  })

  it("warns when receiving ZEC to a transparent t-address", () => {
    const a = assessPrivacy({ origin: SOL, destination: ZEC, recipient: TRANSPARENT, refundTo: "" })
    expect(a.warnings.some((w) => w.includes("transparent"))).toBe(true)
    expect(a.score).toBeLessThan(55)
    expect(a.level).toBe("low")
  })

  it("warns about a transparent refund when sending ZEC", () => {
    const a = assessPrivacy({ origin: ZEC, destination: SOL, recipient: "", refundTo: TRANSPARENT })
    expect(a.warnings.some((w) => w.includes("refund"))).toBe(true)
  })

  it("rewards a shielded refund when sending ZEC", () => {
    const a = assessPrivacy({ origin: ZEC, destination: SOL, recipient: "", refundTo: SHIELDED_ZS })
    expect(a.good.some((g) => /refund/i.test(g))).toBe(true)
  })

  it("warns when neither leg touches the shielded pool", () => {
    const a = assessPrivacy({ origin: SOL, destination: SZEC, recipient: "", refundTo: "" })
    // szEC settles on Solana (chain !== zec), so neither leg is shielded ZEC.
    expect(a.warnings.some((w) => /publicly visible/i.test(w))).toBe(true)
  })

  it("always clamps score to 5..100 and includes the non-custodial good", () => {
    const a = assessPrivacy({ origin: ZEC, destination: ZEC, recipient: TRANSPARENT, refundTo: TRANSPARENT })
    expect(a.score).toBeGreaterThanOrEqual(5)
    expect(a.score).toBeLessThanOrEqual(100)
    expect(a.good.some((g) => /Non-custodial/i.test(g))).toBe(true)
  })

  it("gives a neutral baseline with no assets selected", () => {
    const a = assessPrivacy({ recipient: "", refundTo: "" })
    expect(a.level).toBe("medium")
    expect(a.warnings).toHaveLength(0)
  })
})

describe("isPublicChain", () => {
  it("treats every chain except zec as public", () => {
    expect(isPublicChain("zec")).toBe(false)
    expect(isPublicChain("sol")).toBe(true)
    expect(isPublicChain("eth")).toBe(true)
    expect(isPublicChain(undefined)).toBe(false)
  })
})
