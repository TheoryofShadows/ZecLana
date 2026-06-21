import { describe, it, expect, vi, beforeEach } from "vitest"

// Exercise the route handlers' own logic (validation, degraded fallback, error
// mapping) with the 1Click client mocked — hermetic, no network. SwapApiError
// stays real so the routes' `instanceof` checks behave correctly.
vi.mock("@/lib/swap/oneclick", async (importActual) => {
  const actual = (await importActual()) as Record<string, unknown>
  return { ...actual, getQuote: vi.fn(), getStatus: vi.fn(), fetchPrices: vi.fn() }
})

import { getQuote, getStatus, fetchPrices, SwapApiError } from "@/lib/swap/oneclick"
import { POST as quotePOST } from "@/app/api/swap/quote/route"
import { GET as statusGET } from "@/app/api/swap/status/route"
import { GET as tokensGET } from "@/app/api/swap/tokens/route"

const ZEC = "nep141:zec.omft.near"
const SOL = "nep141:sol.omft.near"

function postQuote(body: unknown, raw?: string) {
  return new Request("http://localhost/api/swap/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw ?? JSON.stringify(body),
  })
}

beforeEach(() => vi.clearAllMocks())

describe("POST /api/swap/quote", () => {
  it("400 on malformed JSON body", async () => {
    const res = await quotePOST(postQuote(null, "{not json"))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/invalid request body/i)
  })

  it("400 when required fields are missing", async () => {
    const res = await quotePOST(postQuote({ originAssetId: ZEC }))
    expect(res.status).toBe(400)
  })

  it("400 when origin and destination are identical", async () => {
    const res = await quotePOST(postQuote({ originAssetId: ZEC, destinationAssetId: ZEC, amount: "1" }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/different assets/i)
  })

  it("returns the quote on success", async () => {
    vi.mocked(getQuote).mockResolvedValue({ amountIn: "1", amountInFormatted: "1", amountOut: "2", amountOutFormatted: "2", depositAddress: "DEP" })
    const res = await quotePOST(postQuote({ originAssetId: ZEC, destinationAssetId: SOL, amount: "1", dry: false }))
    expect(res.status).toBe(200)
    expect((await res.json()).quote.depositAddress).toBe("DEP")
  })

  it("falls back to a degraded spot estimate when a dry quote 5xx's", async () => {
    vi.mocked(getQuote).mockRejectedValue(new SwapApiError("solver busy", 503))
    vi.mocked(fetchPrices).mockResolvedValue({ [ZEC]: 40, [SOL]: 200 })
    const res = await quotePOST(postQuote({ originAssetId: ZEC, destinationAssetId: SOL, amount: "10", dry: true }))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.degraded).toBe(true)
    expect(data.quote.indicative).toBe(true)
  })

  it("does NOT fake a deposit when a LIVE quote fails (propagates error)", async () => {
    vi.mocked(getQuote).mockRejectedValue(new SwapApiError("solver busy", 503))
    vi.mocked(fetchPrices).mockResolvedValue({ [ZEC]: 40, [SOL]: 200 })
    const res = await quotePOST(postQuote({ originAssetId: ZEC, destinationAssetId: SOL, amount: "10", dry: false }))
    expect(res.status).toBe(503)
    expect((await res.json()).error).toMatch(/solver busy/i)
  })
})

describe("GET /api/swap/status", () => {
  it("400 when depositAddress is missing", async () => {
    const res = await statusGET(new Request("http://localhost/api/swap/status"))
    expect(res.status).toBe(400)
  })

  it("returns mapped status on success", async () => {
    vi.mocked(getStatus).mockResolvedValue({ status: "SUCCESS", depositAddress: "DEP" })
    const res = await statusGET(new Request("http://localhost/api/swap/status?depositAddress=DEP"))
    expect(res.status).toBe(200)
    expect((await res.json()).status.status).toBe("SUCCESS")
  })

  it("maps a SwapApiError status code through", async () => {
    vi.mocked(getStatus).mockRejectedValue(new SwapApiError("boom", 504))
    const res = await statusGET(new Request("http://localhost/api/swap/status?depositAddress=DEP"))
    expect(res.status).toBe(504)
  })
})

describe("GET /api/swap/tokens", () => {
  it("returns live prices merged into curated assets", async () => {
    vi.mocked(fetchPrices).mockResolvedValue({ [ZEC]: 42 })
    const res = await tokensGET()
    const data = await res.json()
    expect(data.pricesLive).toBe(true)
    expect(data.assets.find((a: { assetId: string }) => a.assetId === ZEC).priceUsd).toBe(42)
  })

  it("falls back to the static list when the feed is down", async () => {
    vi.mocked(fetchPrices).mockRejectedValue(new SwapApiError("down", 500))
    const res = await tokensGET()
    const data = await res.json()
    expect(data.pricesLive).toBe(false)
    expect(Array.isArray(data.assets)).toBe(true)
    expect(data.assets.length).toBeGreaterThan(0)
  })
})
