import { describe, it, expect, vi, beforeEach } from "vitest"

// The browser swap client wraps the 1Click calls with the fallback/validation
// logic the old API routes used. 1Click is mocked here (SwapApiError stays real).
vi.mock("@/lib/swap/oneclick", async (importActual) => {
  const actual = (await importActual()) as Record<string, unknown>
  return { ...actual, getQuote: vi.fn(), getStatus: vi.fn(), fetchPrices: vi.fn() }
})

import { getQuote, getStatus, fetchPrices, SwapApiError } from "@/lib/swap/oneclick"
import { loadAssets, requestQuote, fetchStatus } from "@/lib/swap/client"

const ZEC = "nep141:zec.omft.near"
const SOL = "nep141:sol.omft.near"

beforeEach(() => vi.clearAllMocks())

describe("loadAssets", () => {
  it("merges live prices when the feed is up", async () => {
    vi.mocked(fetchPrices).mockResolvedValue({ [ZEC]: 42 })
    const { assets, pricesLive } = await loadAssets()
    expect(pricesLive).toBe(true)
    expect(assets.find((a) => a.assetId === ZEC)?.priceUsd).toBe(42)
  })

  it("falls back to the static list when the feed is down", async () => {
    vi.mocked(fetchPrices).mockRejectedValue(new SwapApiError("down", 500))
    const { assets, pricesLive } = await loadAssets()
    expect(pricesLive).toBe(false)
    expect(assets.length).toBeGreaterThan(0)
  })
})

describe("requestQuote", () => {
  it("rejects identical assets without calling the solver", async () => {
    const res = await requestQuote({ originAssetId: ZEC, destinationAssetId: ZEC, amount: "1", recipient: "r", refundTo: "f" })
    expect(res.error).toMatch(/different assets/i)
    expect(getQuote).not.toHaveBeenCalled()
  })

  it("returns the quote on success", async () => {
    vi.mocked(getQuote).mockResolvedValue({ amountIn: "1", amountInFormatted: "1", amountOut: "2", amountOutFormatted: "2", depositAddress: "DEP" })
    const res = await requestQuote({ originAssetId: ZEC, destinationAssetId: SOL, amount: "1", recipient: "r", refundTo: "f", dry: false })
    expect(res.quote?.depositAddress).toBe("DEP")
  })

  it("falls back to a degraded estimate when a dry quote 5xx's", async () => {
    vi.mocked(getQuote).mockRejectedValue(new SwapApiError("busy", 503))
    vi.mocked(fetchPrices).mockResolvedValue({ [ZEC]: 40, [SOL]: 200 })
    const res = await requestQuote({ originAssetId: ZEC, destinationAssetId: SOL, amount: "10", recipient: "r", refundTo: "f", dry: true })
    expect(res.degraded).toBe(true)
    expect(res.quote?.indicative).toBe(true)
  })

  it("does NOT fabricate a deposit when a live quote fails", async () => {
    vi.mocked(getQuote).mockRejectedValue(new SwapApiError("busy", 503))
    vi.mocked(fetchPrices).mockResolvedValue({ [ZEC]: 40, [SOL]: 200 })
    const res = await requestQuote({ originAssetId: ZEC, destinationAssetId: SOL, amount: "10", recipient: "r", refundTo: "f", dry: false })
    expect(res.quote).toBeUndefined()
    expect(res.error).toMatch(/busy/i)
  })
})

describe("fetchStatus", () => {
  it("returns the mapped status", async () => {
    vi.mocked(getStatus).mockResolvedValue({ status: "SUCCESS", depositAddress: "DEP" })
    expect((await fetchStatus("DEP")).status?.status).toBe("SUCCESS")
  })

  it("returns an error message on failure", async () => {
    vi.mocked(getStatus).mockRejectedValue(new SwapApiError("boom", 504))
    expect((await fetchStatus("DEP")).error).toMatch(/boom/i)
  })
})
