import type { Chain } from "./types"

// Per-chain metadata: display, block-explorer links, address hints, and a
// placeholder address used only for indicative preview quotes.
export interface ChainMeta {
  id: Chain
  label: string
  /** Placeholder used for dry preview quotes before the user enters an address. */
  placeholder: string
  /** Build a block-explorer transaction URL. */
  explorerTx: (hash: string) => string
  /** Loose validity check (format/length) — final validation happens at settlement. */
  isValidAddress: (addr: string) => boolean
  addressHint: string
}

export const CHAINS: Record<Chain, ChainMeta> = {
  zec: {
    id: "zec",
    label: "Zcash",
    placeholder: "t1KzZxbwUNB4Hu1Hg3a4qWxGpGT5Bo4Mr8w",
    explorerTx: (h) => `https://3xpl.com/zcash/transaction/${h}`,
    isValidAddress: (a) => /^(t1|t3|zs1|u1|zc)[a-zA-Z0-9]{20,}$/.test(a.trim()),
    addressHint: "Zcash address (u1…/zs1… shielded, or t1… transparent)",
  },
  sol: {
    id: "sol",
    label: "Solana",
    placeholder: "11111111111111111111111111111111",
    explorerTx: (h) => `https://solscan.io/tx/${h}`,
    isValidAddress: (a) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a.trim()),
    addressHint: "Solana wallet address",
  },
  btc: {
    id: "btc",
    label: "Bitcoin",
    placeholder: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
    explorerTx: (h) => `https://mempool.space/tx/${h}`,
    isValidAddress: (a) => /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{20,}$/.test(a.trim()),
    addressHint: "Bitcoin address (bc1…)",
  },
  eth: {
    id: "eth",
    label: "Ethereum",
    placeholder: "0x427F9620Be0fe8Db2d840E2b6145D1CF2975bcaD",
    explorerTx: (h) => `https://etherscan.io/tx/${h}`,
    isValidAddress: (a) => /^0x[0-9a-fA-F]{40}$/.test(a.trim()),
    addressHint: "Ethereum address (0x…)",
  },
  base: {
    id: "base",
    label: "Base",
    placeholder: "0x427F9620Be0fe8Db2d840E2b6145D1CF2975bcaD",
    explorerTx: (h) => `https://basescan.org/tx/${h}`,
    isValidAddress: (a) => /^0x[0-9a-fA-F]{40}$/.test(a.trim()),
    addressHint: "Base address (0x…)",
  },
  near: {
    id: "near",
    label: "NEAR",
    placeholder: "intents.near",
    explorerTx: (h) => `https://nearblocks.io/txns/${h}`,
    isValidAddress: (a) => /^([a-z0-9._-]+\.near|[0-9a-f]{64})$/.test(a.trim()),
    addressHint: "NEAR account (name.near)",
  },
}

export function chainMeta(chain: string): ChainMeta {
  return CHAINS[chain as Chain] ?? CHAINS.sol
}

export function chainLabel(chain: string): string {
  return chainMeta(chain).label
}
