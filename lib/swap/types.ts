// Shared types for the ZEC <-> Solana swap flow, backed by the NEAR Intents
// 1Click API (https://docs.near-intents.org / https://1click.chaindefuser.com).
//
// 1Click is non-custodial and requires no account or KYC: a solver network
// settles the swap to a deposit address. That matches Zolana's privacy goal.

export type Chain = "zec" | "sol"

/** A swappable asset as exposed by the 1Click `/v0/tokens` endpoint. */
export interface SwapAsset {
  /** 1Click asset identifier, e.g. "nep141:zec.omft.near". */
  assetId: string
  symbol: string
  /** Human label shown in the UI, e.g. "ZEC" or "ZEC on Solana". */
  label: string
  /** Chain the underlying asset settles on. */
  chain: Chain
  decimals: number
  /** Latest USD price from 1Click, when available. */
  priceUsd?: number
  /** On-chain contract/mint address, when applicable. */
  contractAddress?: string
}

export interface QuoteRequestInput {
  originAssetId: string
  destinationAssetId: string
  /** Human-readable amount of the origin asset, e.g. "1.5". */
  amount: string
  /** Where funds are delivered (destination chain address). */
  recipient: string
  /** Where funds are returned if the swap fails (origin chain address). */
  refundTo: string
  /** Slippage tolerance in basis points (100 = 1%). */
  slippageToleranceBps?: number
  /** When true, returns an indicative quote without reserving a deposit address. */
  dry?: boolean
}

/** Normalized quote returned to the client. */
export interface Quote {
  /** Origin amount in smallest units (string). */
  amountIn: string
  amountInFormatted: string
  amountInUsd?: string
  /** Destination amount in smallest units (string). */
  amountOut: string
  amountOutFormatted: string
  amountOutUsd?: string
  minAmountOut?: string
  /** Deposit address the user must send the origin asset to (only for live quotes). */
  depositAddress?: string
  /** ISO deadline after which the quote/deposit is no longer valid. */
  deadline?: string
  /** Estimated settlement time in seconds. */
  timeEstimateSeconds?: number
  /** True when this is an indicative estimate (e.g. derived from spot prices). */
  indicative?: boolean
}

export type SwapStatusValue =
  | "PENDING_DEPOSIT"
  | "KNOWN_DEPOSIT_TX"
  | "PROCESSING"
  | "SUCCESS"
  | "REFUNDED"
  | "FAILED"
  | "EXPIRED"
  | "UNKNOWN"

export interface SwapStatus {
  status: SwapStatusValue
  depositAddress: string
  /** Origin deposit transaction hash, once seen. */
  originTxHash?: string
  /** Destination settlement transaction hash, once settled. */
  destinationTxHash?: string
  amountInFormatted?: string
  amountOutFormatted?: string
  raw?: unknown
}
