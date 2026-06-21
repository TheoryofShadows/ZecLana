import { describe, it, expect } from "vitest"
import { CHAINS, chainMeta, chainLabel } from "@/lib/swap/chains"
import type { Chain } from "@/lib/swap/types"

const VALID: Record<Chain, string> = {
  zec: "t1KzZxbwUNB4Hu1Hg3a4qWxGpGT5Bo4Mr8w",
  sol: "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK",
  btc: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
  eth: "0x427F9620Be0fe8Db2d840E2b6145D1CF2975bcaD",
  base: "0x427F9620Be0fe8Db2d840E2b6145D1CF2975bcaD",
  near: "intents.near",
}

describe("CHAINS address validation", () => {
  it("accepts a representative valid address for each chain", () => {
    for (const id of Object.keys(VALID) as Chain[]) {
      expect(CHAINS[id].isValidAddress(VALID[id])).toBe(true)
    }
  })

  it("accepts shielded and transparent Zcash variants", () => {
    expect(CHAINS.zec.isValidAddress("u1abcdefghijklmnopqrstuvwx")).toBe(true)
    expect(CHAINS.zec.isValidAddress("zs1abcdefghijklmnopqrstuvwx")).toBe(true)
    expect(CHAINS.zec.isValidAddress("t3abcdefghijklmnopqrstuvwx")).toBe(true)
  })

  it("accepts a 64-hex NEAR implicit account", () => {
    expect(CHAINS.near.isValidAddress("a".repeat(64))).toBe(true)
  })

  it("rejects empty and obviously malformed addresses", () => {
    for (const id of Object.keys(VALID) as Chain[]) {
      expect(CHAINS[id].isValidAddress("")).toBe(false)
      expect(CHAINS[id].isValidAddress("nonsense!!")).toBe(false)
    }
  })

  it("rejects cross-chain paste (right format, wrong field)", () => {
    // ETH address pasted into Solana field (0 is not in base58 alphabet)
    expect(CHAINS.sol.isValidAddress(VALID.eth)).toBe(false)
    // Solana address pasted into ETH field (not 0x + 40 hex)
    expect(CHAINS.eth.isValidAddress(VALID.sol)).toBe(false)
    // ETH pasted into Zcash field
    expect(CHAINS.zec.isValidAddress(VALID.eth)).toBe(false)
  })

  it("tolerates surrounding whitespace via trim", () => {
    expect(CHAINS.eth.isValidAddress(`  ${VALID.eth}  `)).toBe(true)
  })
})

describe("explorerTx", () => {
  it("builds explorer URLs that embed the hash", () => {
    expect(CHAINS.sol.explorerTx("HASH")).toContain("solscan.io/tx/HASH")
    expect(CHAINS.zec.explorerTx("HASH")).toContain("3xpl.com/zcash/transaction/HASH")
    expect(CHAINS.eth.explorerTx("HASH")).toContain("etherscan.io/tx/HASH")
    expect(CHAINS.base.explorerTx("HASH")).toContain("basescan.org/tx/HASH")
    expect(CHAINS.btc.explorerTx("HASH")).toContain("mempool.space/tx/HASH")
    expect(CHAINS.near.explorerTx("HASH")).toContain("nearblocks.io/txns/HASH")
  })
})

describe("chainMeta / chainLabel", () => {
  it("returns metadata for a known chain", () => {
    expect(chainMeta("zec").label).toBe("Zcash")
    expect(chainLabel("sol")).toBe("Solana")
  })
  it("falls back to Solana for an unknown chain", () => {
    expect(chainMeta("dogecoin").id).toBe("sol")
    expect(chainLabel("???")).toBe("Solana")
  })
})
