import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getQuote, getStatus, fetchPrices, SwapApiError } from "@/lib/swap/oneclick"

const ZEC = "nep141:zec.omft.near"
const SOL = "nep141:sol.omft.near"

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    text: async () => JSON.stringify(body),
  } as unknown as Response
}

function errorText(text: string, status: number): Response {
  return { ok: false, status, text: async () => text } as unknown as Response
}

beforeEach(() => vi.restoreAllMocks())
afterEach(() => vi.unstubAllGlobals())

describe("getQuote validation", () => {
  it("rejects an unsupported asset pair (400) before any network call", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    await expect(getQuote({ originAssetId: "bad", destinationAssetId: SOL, amount: "1", recipient: "r", refundTo: "f" }))
      .rejects.toMatchObject({ status: 400 })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("rejects an invalid amount (400)", async () => {
    vi.stubGlobal("fetch", vi.fn())
    await expect(getQuote({ originAssetId: ZEC, destinationAssetId: SOL, amount: "abc", recipient: "r", refundTo: "f" }))
      .rejects.toMatchObject({ status: 400 })
  })

  it("rejects a zero amount (400)", async () => {
    vi.stubGlobal("fetch", vi.fn())
    await expect(getQuote({ originAssetId: ZEC, destinationAssetId: SOL, amount: "0", recipient: "r", refundTo: "f" }))
      .rejects.toMatchObject({ status: 400 })
  })
})

describe("getQuote success", () => {
  it("normalises a solver quote response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        quote: {
          amountOut: "1990000000",
          amountInFormatted: "10",
          amountOutFormatted: "1.99",
          depositAddress: "DEP123",
          deadline: "2030-01-01T00:00:00Z",
          timeEstimate: 120,
        },
      }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const q = await getQuote({ originAssetId: ZEC, destinationAssetId: SOL, amount: "10", recipient: "r", refundTo: "f", dry: false })
    expect(q.depositAddress).toBe("DEP123")
    expect(q.amountOutFormatted).toBe("1.99")
    expect(q.timeEstimateSeconds).toBe(120)
    expect(q.indicative).toBe(false)
  })
})

describe("getQuote retry behaviour", () => {
  it("retries a live quote on 5xx then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errorText("upstream boom", 503))
      .mockResolvedValueOnce(jsonResponse({ quote: { amountOut: "1", depositAddress: "DEP" } }))
    vi.stubGlobal("fetch", fetchMock)
    const q = await getQuote({ originAssetId: ZEC, destinationAssetId: SOL, amount: "1", recipient: "r", refundTo: "f", dry: false })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(q.depositAddress).toBe("DEP")
  })

  it("does not retry a dry quote (single attempt) and surfaces the error", async () => {
    const fetchMock = vi.fn().mockResolvedValue(errorText("boom", 500))
    vi.stubGlobal("fetch", fetchMock)
    await expect(
      getQuote({ originAssetId: ZEC, destinationAssetId: SOL, amount: "1", recipient: "r", refundTo: "f", dry: true }),
    ).rejects.toBeInstanceOf(SwapApiError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("humanises an 'amount too low' solver error", async () => {
    const fetchMock = vi.fn().mockResolvedValue(errorText(JSON.stringify({ message: "amount too low, try at least 52000" }), 400))
    vi.stubGlobal("fetch", fetchMock)
    await expect(
      getQuote({ originAssetId: ZEC, destinationAssetId: SOL, amount: "0.00001", recipient: "r", refundTo: "f", dry: false }),
    ).rejects.toThrow(/at least 0\.00052 ZEC/)
  })

  it("maps an aborted request to a 504 friendly error", async () => {
    const fetchMock = vi.fn().mockImplementation(() => {
      const err = new Error("aborted")
      ;(err as Error).name = "AbortError"
      return Promise.reject(err)
    })
    vi.stubGlobal("fetch", fetchMock)
    await expect(
      getQuote({ originAssetId: ZEC, destinationAssetId: SOL, amount: "1", recipient: "r", refundTo: "f", dry: true }),
    ).rejects.toMatchObject({ status: 504 })
  })
})

describe("getStatus", () => {
  it("maps known statuses and extracts string tx hashes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          status: "SUCCESS",
          swapDetails: {
            originChainTxHashes: ["ORIGIN_HASH"],
            destinationChainTxHashes: ["DEST_HASH"],
            amountInFormatted: "10",
            amountOutFormatted: "1.99",
          },
        }),
      ),
    )
    const s = await getStatus("DEP123")
    expect(s.status).toBe("SUCCESS")
    expect(s.originTxHash).toBe("ORIGIN_HASH")
    expect(s.destinationTxHash).toBe("DEST_HASH")
    expect(s.amountOutFormatted).toBe("1.99")
  })

  it("extracts hashes from {hash} object form", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({ status: "PROCESSING", swapDetails: { destinationChainTxHashes: [{ hash: "OBJ_HASH" }] } }),
      ),
    )
    const s = await getStatus("DEP")
    expect(s.destinationTxHash).toBe("OBJ_HASH")
  })

  it("collapses INCOMPLETE_DEPOSIT to PENDING_DEPOSIT", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ status: "INCOMPLETE_DEPOSIT" })))
    expect((await getStatus("DEP")).status).toBe("PENDING_DEPOSIT")
  })

  it("maps an unrecognised status to UNKNOWN", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ status: "SOMETHING_NEW" })))
    expect((await getStatus("DEP")).status).toBe("UNKNOWN")
  })
})

describe("fetchPrices", () => {
  it("builds a price map keyed by assetId, skipping priceless tokens", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse([
          { assetId: ZEC, price: 40 },
          { assetId: SOL, price: 200 },
          { assetId: "no-price" },
        ]),
      ),
    )
    const prices = await fetchPrices()
    expect(prices[ZEC]).toBe(40)
    expect(prices[SOL]).toBe(200)
    expect(prices["no-price"]).toBeUndefined()
  })

  it("throws a SwapApiError on a non-OK token feed", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errorText("down", 500)))
    await expect(fetchPrices()).rejects.toBeInstanceOf(SwapApiError)
  })
})
