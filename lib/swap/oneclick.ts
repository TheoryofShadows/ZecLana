import type { Quote, QuoteRequestInput, SwapStatus, SwapStatusValue } from "./types"
import { getAssetById } from "./assets"
import { fromSmallestUnit, toSmallestUnit } from "./amount"

// Thin server-side client for the NEAR Intents 1Click API. No API key is
// required; an optional JWT (ONECLICK_JWT) unlocks better solver rates but is
// not needed for the swap to work. Keeping calls server-side avoids CORS and
// keeps any token out of the browser.

const BASE_URL = (process.env.ONECLICK_BASE_URL || "https://1click.chaindefuser.com").replace(/\/$/, "")
const JWT = process.env.ONECLICK_JWT
const DEFAULT_SLIPPAGE_BPS = 100 // 1%
const TOKENS_TIMEOUT_MS = 12_000

// The 1Click gateway gives up on the solver relay after ~25s. Solver congestion
// is transient, so live quotes (which reserve a real deposit address) retry a
// couple of times; preview quotes stay snappy and fall back to a spot estimate.
const DRY_TIMEOUT_MS = 13_000
const DRY_ATTEMPTS = 1
const DRY_QUOTE_WAIT_MS = 2_000
const LIVE_TIMEOUT_MS = 26_000
const LIVE_ATTEMPTS = 2
const LIVE_QUOTE_WAIT_MS = 4_000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface RawToken {
  assetId: string
  decimals: number
  blockchain: string
  symbol: string
  price?: number
  contractAddress?: string
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (JWT) headers["Authorization"] = `Bearer ${JWT}`
  return headers
}

async function fetchJson(url: string, init: RequestInit, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    const text = await res.text()
    let body: unknown
    try {
      body = text ? JSON.parse(text) : {}
    } catch {
      body = { message: text }
    }
    if (!res.ok) {
      const message =
        (body as { message?: string })?.message || `1Click request failed (${res.status})`
      throw new SwapApiError(message, res.status)
    }
    return body
  } catch (err) {
    if (err instanceof SwapApiError) throw err
    if ((err as Error)?.name === "AbortError") {
      throw new SwapApiError("The solver network is busy right now. Please try again.", 504)
    }
    throw new SwapApiError((err as Error)?.message || "Network error reaching the solver", 502)
  } finally {
    clearTimeout(timer)
  }
}

/** Transient failures worth retrying: timeouts and 5xx from the solver relay. */
function isRetryable(err: unknown): boolean {
  return err instanceof SwapApiError && err.status >= 500
}

// The solver's "amount too low" message quotes the minimum in smallest units
// (e.g. "try at least 52000"), which reads as nonsense to a human. Convert it.
function humanizeQuoteError(err: unknown, decimals: number, symbol: string): unknown {
  if (!(err instanceof SwapApiError)) return err
  const match = err.message.match(/too low.*?(\d{4,})/i)
  if (match) {
    const human = fromSmallestUnit(match[1], decimals)
    return new SwapApiError(`Amount is too low — try at least ${human} ${symbol}.`, 400)
  }
  return err
}

/** A tx hash entry may be a bare string or an object with a `hash` field. */
function extractHash(arr: unknown): string | undefined {
  const first = Array.isArray(arr) ? arr[0] : undefined
  if (typeof first === "string") return first
  if (first && typeof first === "object" && typeof (first as { hash?: unknown }).hash === "string") {
    return (first as { hash: string }).hash
  }
  return undefined
}

export class SwapApiError extends Error {
  status: number
  constructor(message: string, status = 502) {
    super(message)
    this.name = "SwapApiError"
    this.status = status
  }
}

/** Live USD prices keyed by assetId, from the 1Click tokens feed. */
export async function fetchPrices(): Promise<Record<string, number>> {
  const tokens = (await fetchJson(`${BASE_URL}/v0/tokens`, { method: "GET" }, TOKENS_TIMEOUT_MS)) as RawToken[]
  const prices: Record<string, number> = {}
  for (const token of tokens) {
    if (typeof token.price === "number") prices[token.assetId] = token.price
  }
  return prices
}

export async function getQuote(input: QuoteRequestInput): Promise<Quote> {
  const origin = getAssetById(input.originAssetId)
  const destination = getAssetById(input.destinationAssetId)
  if (!origin || !destination) {
    throw new SwapApiError("Unsupported asset pair", 400)
  }

  let amountSmallest: string
  try {
    amountSmallest = toSmallestUnit(input.amount, origin.decimals)
  } catch {
    throw new SwapApiError("Enter a valid amount", 400)
  }
  if (BigInt(amountSmallest) <= BigInt(0)) {
    throw new SwapApiError("Amount must be greater than zero", 400)
  }

  const dry = input.dry ?? true

  // 1Click reserves a deposit address for ~10 minutes; give the user a window.
  const deadline = new Date(Date.now() + 15 * 60_000).toISOString()

  const requestBody = {
    dry,
    swapType: "EXACT_INPUT",
    slippageTolerance: input.slippageToleranceBps ?? DEFAULT_SLIPPAGE_BPS,
    originAsset: input.originAssetId,
    depositType: "ORIGIN_CHAIN",
    destinationAsset: input.destinationAssetId,
    amount: amountSmallest,
    refundTo: input.refundTo,
    refundType: "ORIGIN_CHAIN",
    recipient: input.recipient,
    recipientType: "DESTINATION_CHAIN",
    quoteWaitingTimeMs: dry ? DRY_QUOTE_WAIT_MS : LIVE_QUOTE_WAIT_MS,
    deadline,
  }

  const timeoutMs = dry ? DRY_TIMEOUT_MS : LIVE_TIMEOUT_MS
  const maxAttempts = dry ? DRY_ATTEMPTS : LIVE_ATTEMPTS

  let body: { quote?: Record<string, unknown> } | undefined
  let lastErr: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      body = (await fetchJson(
        `${BASE_URL}/v0/quote`,
        { method: "POST", headers: authHeaders(), body: JSON.stringify(requestBody) },
        timeoutMs,
      )) as { quote?: Record<string, unknown> }
      break
    } catch (err) {
      lastErr = err
      if (attempt < maxAttempts && isRetryable(err)) {
        await sleep(600 * attempt)
        continue
      }
      break
    }
  }
  if (!body) throw humanizeQuoteError(lastErr, origin.decimals, origin.symbol)

  const q = body.quote ?? {}
  const amountOut = String(q.amountOut ?? "0")

  return {
    amountIn: amountSmallest,
    amountInFormatted: String(q.amountInFormatted ?? input.amount),
    amountInUsd: q.amountInUsd != null ? String(q.amountInUsd) : undefined,
    amountOut,
    amountOutFormatted: String(q.amountOutFormatted ?? fromSmallestUnit(amountOut, destination.decimals)),
    amountOutUsd: q.amountOutUsd != null ? String(q.amountOutUsd) : undefined,
    minAmountOut: q.minAmountOut != null ? String(q.minAmountOut) : undefined,
    depositAddress: typeof q.depositAddress === "string" ? q.depositAddress : undefined,
    deadline: typeof q.deadline === "string" ? q.deadline : deadline,
    timeEstimateSeconds: typeof q.timeEstimate === "number" ? q.timeEstimate : undefined,
    indicative: dry,
  }
}

const STATUS_MAP: Record<string, SwapStatusValue> = {
  PENDING_DEPOSIT: "PENDING_DEPOSIT",
  KNOWN_DEPOSIT_TX: "KNOWN_DEPOSIT_TX",
  INCOMPLETE_DEPOSIT: "PENDING_DEPOSIT",
  PROCESSING: "PROCESSING",
  SUCCESS: "SUCCESS",
  REFUNDED: "REFUNDED",
  FAILED: "FAILED",
  EXPIRED: "EXPIRED",
}

export async function getStatus(depositAddress: string): Promise<SwapStatus> {
  const url = `${BASE_URL}/v0/status?depositAddress=${encodeURIComponent(depositAddress)}`
  const body = (await fetchJson(url, { method: "GET", headers: authHeaders() }, TOKENS_TIMEOUT_MS)) as {
    status?: string
    swapDetails?: {
      originChainTxHashes?: unknown
      destinationChainTxHashes?: unknown
      amountInFormatted?: string
      amountOutFormatted?: string
    }
  }

  const details = body.swapDetails
  return {
    status: STATUS_MAP[body.status ?? ""] ?? "UNKNOWN",
    depositAddress,
    originTxHash: extractHash(details?.originChainTxHashes),
    destinationTxHash: extractHash(details?.destinationChainTxHashes),
    amountInFormatted: details?.amountInFormatted ?? undefined,
    amountOutFormatted: details?.amountOutFormatted ?? undefined,
    raw: body,
  }
}
