import type { SwapStatusValue } from "./types"

// Self-custodial swap history. Stored only in the browser's localStorage — no
// server, no account, no login. The deposit address is the natural id and lets
// us re-poll live status for any past swap.

const KEY = "zolana.swaps.v1"

export interface SwapRecord {
  id: string // deposit address
  createdAt: number
  fromAssetId: string
  toAssetId: string
  fromSymbol: string
  toSymbol: string
  fromChain: string
  toChain: string
  amountInFormatted: string
  amountOutFormatted: string
  recipient: string
  depositAddress: string
  deadline?: string
  status: SwapStatusValue
}

function read(): SwapRecord[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as SwapRecord[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(records: SwapRecord[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(records.slice(0, 100)))
    window.dispatchEvent(new Event("zolana-history"))
  } catch {
    /* storage full or unavailable — non-fatal */
  }
}

export function listSwaps(): SwapRecord[] {
  return read().sort((a, b) => b.createdAt - a.createdAt)
}

export function saveSwap(record: SwapRecord) {
  const records = read().filter((r) => r.id !== record.id)
  records.unshift(record)
  write(records)
}

export function updateSwapStatus(id: string, status: SwapStatusValue) {
  const records = read()
  const idx = records.findIndex((r) => r.id === id)
  if (idx === -1 || records[idx].status === status) return
  records[idx] = { ...records[idx], status }
  write(records)
}

export function clearSwaps() {
  write([])
}
