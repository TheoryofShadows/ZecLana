import type { SwapAsset } from "./types"

// Curated set of assets relevant to Zolana: native ZEC and the Solana side
// (ZEC-on-Solana / "szEC", plus SOL and USDC as common cash-out legs).
//
// Asset IDs and decimals are confirmed against the live 1Click `/v0/tokens`
// feed. The static list is the fallback/allowlist; live USD prices are merged
// in at request time when the tokens endpoint is reachable.
export const CURATED_ASSETS: SwapAsset[] = [
  {
    assetId: "nep141:zec.omft.near",
    symbol: "ZEC",
    label: "ZEC (Zcash)",
    chain: "zec",
    decimals: 8,
    contractAddress: "zec.omft.near",
  },
  {
    assetId: "1cs_v1:sol:spl:A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS",
    symbol: "ZEC",
    label: "ZEC on Solana (szEC)",
    chain: "sol",
    decimals: 8,
    contractAddress: "A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS",
  },
  {
    assetId: "nep141:sol.omft.near",
    symbol: "SOL",
    label: "SOL (Solana)",
    chain: "sol",
    decimals: 9,
    contractAddress: "sol.omft.near",
  },
  {
    assetId: "nep141:sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near",
    symbol: "USDC",
    label: "USDC on Solana",
    chain: "sol",
    decimals: 6,
    contractAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  },
  // "Anything → private ZEC" origins.
  {
    assetId: "nep141:btc.omft.near",
    symbol: "BTC",
    label: "BTC (Bitcoin)",
    chain: "btc",
    decimals: 8,
    contractAddress: "btc.omft.near",
  },
  {
    assetId: "nep141:eth.omft.near",
    symbol: "ETH",
    label: "ETH (Ethereum)",
    chain: "eth",
    decimals: 18,
    contractAddress: "eth.omft.near",
  },
  {
    assetId: "nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near",
    symbol: "USDC",
    label: "USDC on Ethereum",
    chain: "eth",
    decimals: 6,
    contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  },
  {
    assetId: "nep141:base.omft.near",
    symbol: "ETH",
    label: "ETH on Base",
    chain: "base",
    decimals: 18,
    contractAddress: "base.omft.near",
  },
  {
    assetId: "nep141:wrap.near",
    symbol: "NEAR",
    label: "NEAR",
    chain: "near",
    decimals: 24,
    contractAddress: "wrap.near",
  },
]

const CURATED_IDS = new Set(CURATED_ASSETS.map((a) => a.assetId))

export function getAssetById(assetId: string): SwapAsset | undefined {
  return CURATED_ASSETS.find((a) => a.assetId === assetId)
}

export function isCuratedAsset(assetId: string): boolean {
  return CURATED_IDS.has(assetId)
}

/** Merge live USD prices from the 1Click tokens feed into the curated list. */
export function mergePrices(prices: Record<string, number>): SwapAsset[] {
  return CURATED_ASSETS.map((asset) => ({
    ...asset,
    priceUsd: prices[asset.assetId] ?? asset.priceUsd,
  }))
}
