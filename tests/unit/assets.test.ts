import { describe, it, expect } from "vitest"
import { CURATED_ASSETS, getAssetById, isCuratedAsset, mergePrices } from "@/lib/swap/assets"

describe("CURATED_ASSETS invariants", () => {
  it("has unique asset ids", () => {
    const ids = CURATED_ASSETS.map((a) => a.assetId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("every asset has positive integer decimals and a chain", () => {
    for (const a of CURATED_ASSETS) {
      expect(Number.isInteger(a.decimals)).toBe(true)
      expect(a.decimals).toBeGreaterThan(0)
      expect(a.chain).toBeTruthy()
      expect(a.symbol).toBeTruthy()
    }
  })

  it("includes both native ZEC and ZEC-on-Solana", () => {
    expect(getAssetById("nep141:zec.omft.near")?.chain).toBe("zec")
    expect(getAssetById("1cs_v1:sol:spl:A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS")?.chain).toBe("sol")
  })
})

describe("getAssetById / isCuratedAsset", () => {
  it("finds curated assets and rejects unknown ones", () => {
    expect(getAssetById("nep141:sol.omft.near")?.symbol).toBe("SOL")
    expect(getAssetById("does:not:exist")).toBeUndefined()
    expect(isCuratedAsset("nep141:sol.omft.near")).toBe(true)
    expect(isCuratedAsset("does:not:exist")).toBe(false)
  })
})

describe("mergePrices", () => {
  it("merges live prices by assetId and leaves others untouched", () => {
    const merged = mergePrices({ "nep141:zec.omft.near": 42.5 })
    const zec = merged.find((a) => a.assetId === "nep141:zec.omft.near")
    const sol = merged.find((a) => a.assetId === "nep141:sol.omft.near")
    expect(zec?.priceUsd).toBe(42.5)
    expect(sol?.priceUsd).toBeUndefined()
  })

  it("does not mutate the original curated list", () => {
    const before = CURATED_ASSETS.map((a) => a.priceUsd)
    mergePrices({ "nep141:zec.omft.near": 99 })
    expect(CURATED_ASSETS.map((a) => a.priceUsd)).toEqual(before)
  })
})
