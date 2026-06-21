import type { Page, Route } from "@playwright/test"
import { CURATED_ASSETS } from "../../lib/swap/assets"
import type { SwapStatusValue } from "../../lib/swap/types"

// Hermetic mocks for the 1Click API (the app now calls it directly from the
// browser). Each test installs the responses it needs so flows are fully
// deterministic — including screens (SUCCESS/FAILED/EXPIRED, degraded estimate)
// that can't be reached reliably against the live solver.

const PRICES: Record<string, number> = {
  "nep141:zec.omft.near": 40,
  "1cs_v1:sol:spl:A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS": 40,
  "nep141:sol.omft.near": 200,
  "nep141:sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near": 1,
}

export const DEPOSIT_ADDRESS = "t1DepositAddr1111111111111111111111"

export interface MockOptions {
  pricesLive?: boolean
  /** Make the tokens feed fail (drives the "price feed unavailable" note). */
  tokensFail?: boolean
  /** Mark the dry quote as a degraded spot estimate (forces the estimate path). */
  degraded?: boolean
  /** Force the dry (preview) quote to error. */
  dryError?: { message: string; status: number }
  /** Force the live (reserve) quote to error. */
  liveError?: { message: string; status: number }
  /** Deadline (ISO) for the live quote — set in the past to test expiry. */
  liveDeadline?: string
  /** Sequence of statuses returned by successive /status polls (last repeats). */
  statuses?: SwapStatusValue[]
  /** Destination tx hash returned once status is SUCCESS. */
  destinationTxHash?: string
}

/** Raw 1Click /v0/tokens shape: an array of token records with prices. */
function tokensRaw(opts: MockOptions) {
  const live = opts.pricesLive ?? true
  return CURATED_ASSETS.map((a) => ({
    assetId: a.assetId,
    decimals: a.decimals,
    blockchain: a.chain,
    symbol: a.symbol,
    contractAddress: a.contractAddress,
    price: live ? PRICES[a.assetId] : undefined,
  }))
}

export async function installSwapMocks(page: Page, opts: MockOptions = {}) {
  let pollCount = 0

  await page.route("**/v0/tokens", async (route: Route) => {
    if (opts.tokensFail) {
      await route.fulfill({ status: 500, json: { message: "feed down" } })
      return
    }
    await route.fulfill({ status: 200, json: tokensRaw(opts) })
  })

  await page.route("**/v0/quote", async (route: Route) => {
    const body = route.request().postDataJSON() as { dry?: boolean; amount: string; originAsset: string }
    const isDry = body.dry ?? true
    // 1Click receives the amount in smallest units; recover the human amount.
    const origin = CURATED_ASSETS.find((a) => a.assetId === body.originAsset)
    const human = Number(body.amount) / 10 ** (origin?.decimals ?? 8)
    const amountIn = String(human)
    const amountOut = (human * 0.199).toFixed(4)

    if (isDry) {
      // A 5xx here makes the client fall back to a spot estimate (degraded).
      if (opts.dryError || opts.degraded) {
        await route.fulfill({ status: opts.dryError?.status ?? 503, json: { message: opts.dryError?.message ?? "solvers busy" } })
        return
      }
      await route.fulfill({
        status: 200,
        json: {
          quote: {
            amountInFormatted: amountIn,
            amountInUsd: (Number(amountIn) * 40).toFixed(2),
            amountOut: "1",
            amountOutFormatted: amountOut,
            amountOutUsd: (Number(amountOut) * 200).toFixed(2),
            timeEstimate: 120,
          },
        },
      })
      return
    }

    if (opts.liveError) {
      await route.fulfill({ status: opts.liveError.status, json: { message: opts.liveError.message } })
      return
    }
    await route.fulfill({
      status: 200,
      json: {
        quote: {
          amountInFormatted: amountIn,
          amountOut: "1",
          amountOutFormatted: amountOut,
          depositAddress: DEPOSIT_ADDRESS,
          deadline: opts.liveDeadline ?? new Date(Date.now() + 15 * 60_000).toISOString(),
          timeEstimate: 120,
        },
      },
    })
  })

  await page.route("**/v0/status**", async (route: Route) => {
    const seq = opts.statuses ?? ["PENDING_DEPOSIT"]
    const status = seq[Math.min(pollCount, seq.length - 1)]
    pollCount++
    const isSuccess = status === "SUCCESS"
    await route.fulfill({
      status: 200,
      json: {
        status,
        swapDetails: {
          destinationChainTxHashes: isSuccess ? [opts.destinationTxHash ?? "DEST_TX_HASH"] : [],
          amountOutFormatted: isSuccess ? "0.199" : undefined,
        },
      },
    })
  })
}

/** A valid Solana recipient and Zcash refund address for filling the form. */
export const VALID_SOL_RECIPIENT = "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK"
export const VALID_ZEC_REFUND = "t1KzZxbwUNB4Hu1Hg3a4qWxGpGT5Bo4Mr8w"
export const SHIELDED_ZEC = "u1abcdefghijklmnopqrstuvwxyz0123456789abcd"
