import type { Page, Route } from "@playwright/test"
import { CURATED_ASSETS } from "../../lib/swap/assets"
import type { SwapStatusValue } from "../../lib/swap/types"

// Hermetic mocks for the swap API. Each test installs the responses it needs so
// flows are fully deterministic — including screens (SUCCESS/FAILED/EXPIRED,
// degraded estimate) that can't be reached reliably against the live solver.

const PRICES: Record<string, number> = {
  "nep141:zec.omft.near": 40,
  "1cs_v1:sol:spl:A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS": 40,
  "nep141:sol.omft.near": 200,
  "nep141:sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near": 1,
}

export const DEPOSIT_ADDRESS = "t1DepositAddr1111111111111111111111"

export interface MockOptions {
  /** Live prices on/off for the tokens feed. */
  pricesLive?: boolean
  /** Make the tokens feed fail (drives the "price feed unavailable" note). */
  tokensFail?: boolean
  /** Mark the dry quote as a degraded spot estimate. */
  degraded?: boolean
  /** Force the dry (preview) quote to error with this message + status. */
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

function tokensPayload(opts: MockOptions) {
  const live = opts.pricesLive ?? true
  return {
    assets: CURATED_ASSETS.map((a) => ({ ...a, priceUsd: live ? PRICES[a.assetId] ?? a.priceUsd : undefined })),
    pricesLive: live,
  }
}

export async function installSwapMocks(page: Page, opts: MockOptions = {}) {
  let pollCount = 0

  await page.route("**/api/swap/tokens", async (route: Route) => {
    if (opts.tokensFail) {
      await route.fulfill({ status: 200, json: { assets: CURATED_ASSETS, pricesLive: false } })
      return
    }
    await route.fulfill({ status: 200, json: tokensPayload(opts) })
  })

  await page.route("**/api/swap/quote", async (route: Route) => {
    const body = route.request().postDataJSON() as { dry?: boolean; amount: string }
    const isDry = body.dry ?? true
    const amountIn = body.amount || "1"
    const amountOut = (Number(amountIn) * 0.199).toFixed(4) // ~ZEC->SOL-ish rate for display

    if (isDry) {
      if (opts.dryError) {
        await route.fulfill({ status: opts.dryError.status, json: { error: opts.dryError.message } })
        return
      }
      await route.fulfill({
        status: 200,
        json: {
          quote: {
            amountIn,
            amountInFormatted: amountIn,
            amountInUsd: (Number(amountIn) * 40).toFixed(2),
            amountOut: "1",
            amountOutFormatted: amountOut,
            amountOutUsd: (Number(amountOut) * 200).toFixed(2),
            timeEstimateSeconds: 120,
            indicative: true,
          },
          degraded: Boolean(opts.degraded),
        },
      })
      return
    }

    // live (reserve) quote
    if (opts.liveError) {
      await route.fulfill({ status: opts.liveError.status, json: { error: opts.liveError.message } })
      return
    }
    await route.fulfill({
      status: 200,
      json: {
        quote: {
          amountIn,
          amountInFormatted: amountIn,
          amountOut: "1",
          amountOutFormatted: amountOut,
          depositAddress: DEPOSIT_ADDRESS,
          deadline: opts.liveDeadline ?? new Date(Date.now() + 15 * 60_000).toISOString(),
          timeEstimateSeconds: 120,
          indicative: false,
        },
      },
    })
  })

  await page.route("**/api/swap/status**", async (route: Route) => {
    const seq = opts.statuses ?? ["PENDING_DEPOSIT"]
    const status = seq[Math.min(pollCount, seq.length - 1)]
    pollCount++
    const isSuccess = status === "SUCCESS"
    await route.fulfill({
      status: 200,
      json: {
        status: {
          status,
          depositAddress: DEPOSIT_ADDRESS,
          destinationTxHash: isSuccess ? opts.destinationTxHash ?? "DEST_TX_HASH" : undefined,
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
