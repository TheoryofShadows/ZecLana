import "server-only"

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
const QUOTE_TIMEOUT_MS = 30_000
const TOKENS_TIMEOUT_MS = 12_000

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
  } finally {
    clearTimeout(timer)
  }
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

  const amountSmallest = toSmallestUnit(input.amount, origin.decimals)
  if (BigInt(amountSmallest) <= BigInt(0)) {
    throw new SwapApiError("Amount must be greater than zero", 400)
  }

  // 1Click reserves a deposit address for ~10 minutes; give the user a window.
  const deadline = new Date(Date.now() + 15 * 60_000).toISOString()

  const requestBody = {
    dry: input.dry ?? true,
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
    deadline,
  }

  const body = (await fetchJson(
    `${BASE_URL}/v0/quote`,
    { method: "POST", headers: authHeaders(), body: JSON.stringify(requestBody) },
    QUOTE_TIMEOUT_MS,
  )) as { quote?: Record<string, unknown> }

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
    indicative: input.dry ?? true,
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
      originChainTxHashes?: { hash: string }[]
      destinationChainTxHashes?: { hash: string }[]
      amountInFormatted?: string
      amountOutFormatted?: string
    }
  }

  const details = body.swapDetails
  return {
    status: STATUS_MAP[body.status ?? ""] ?? "UNKNOWN",
    depositAddress,
    originTxHash: details?.originChainTxHashes?.[0]?.hash,
    destinationTxHash: details?.destinationChainTxHashes?.[0]?.hash,
    amountInFormatted: details?.amountInFormatted,
    amountOutFormatted: details?.amountOutFormatted,
    raw: body,
  }
}
