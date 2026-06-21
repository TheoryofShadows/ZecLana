import { describe, it, expect, beforeEach, vi } from "vitest"
import { listSwaps, saveSwap, updateSwapStatus, clearSwaps, type SwapRecord } from "@/lib/swap/history"

const KEY = "zolana.swaps.v1"

function record(id: string, createdAt = Date.now()): SwapRecord {
  return {
    id,
    createdAt,
    fromAssetId: "a",
    toAssetId: "b",
    fromSymbol: "ZEC",
    toSymbol: "SOL",
    fromChain: "zec",
    toChain: "sol",
    amountInFormatted: "1",
    amountOutFormatted: "2",
    recipient: "rcpt",
    depositAddress: id,
    status: "PENDING_DEPOSIT",
  }
}

beforeEach(() => window.localStorage.clear())

describe("saveSwap / listSwaps", () => {
  it("saves and lists newest-first", () => {
    saveSwap(record("a", 1000))
    saveSwap(record("b", 2000))
    const list = listSwaps()
    expect(list.map((r) => r.id)).toEqual(["b", "a"])
  })

  it("dedupes by id (re-saving replaces)", () => {
    saveSwap(record("a", 1000))
    saveSwap({ ...record("a", 3000), amountInFormatted: "9" })
    const list = listSwaps()
    expect(list).toHaveLength(1)
    expect(list[0].amountInFormatted).toBe("9")
  })

  it("caps stored history at 100 records", () => {
    for (let i = 0; i < 130; i++) saveSwap(record(`id-${i}`, i))
    expect(listSwaps().length).toBe(100)
  })

  it("fires a zolana-history event on write", () => {
    const spy = vi.fn()
    window.addEventListener("zolana-history", spy)
    saveSwap(record("a"))
    expect(spy).toHaveBeenCalled()
    window.removeEventListener("zolana-history", spy)
  })
})

describe("updateSwapStatus", () => {
  it("updates an existing record's status", () => {
    saveSwap(record("a"))
    updateSwapStatus("a", "SUCCESS")
    expect(listSwaps()[0].status).toBe("SUCCESS")
  })
  it("is a no-op for unknown id or unchanged status", () => {
    saveSwap(record("a"))
    const spy = vi.fn()
    window.addEventListener("zolana-history", spy)
    updateSwapStatus("missing", "SUCCESS")
    updateSwapStatus("a", "PENDING_DEPOSIT") // unchanged
    expect(spy).not.toHaveBeenCalled()
    window.removeEventListener("zolana-history", spy)
  })
})

describe("clearSwaps", () => {
  it("empties the history", () => {
    saveSwap(record("a"))
    clearSwaps()
    expect(listSwaps()).toEqual([])
  })
})

describe("corruption tolerance", () => {
  it("returns an empty list when storage holds invalid JSON", () => {
    window.localStorage.setItem(KEY, "{not json")
    expect(listSwaps()).toEqual([])
  })
  it("returns an empty list when storage holds a non-array", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ foo: 1 }))
    expect(listSwaps()).toEqual([])
  })
})
