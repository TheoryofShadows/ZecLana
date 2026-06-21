import { describe, it, expect, vi } from "vitest"
import { walletKindForChain, isWalletAvailable, connectForChain, WalletError } from "@/lib/swap/wallet"

type W = Record<string, unknown>

describe("walletKindForChain", () => {
  it("maps chains to wallet kinds", () => {
    expect(walletKindForChain("sol")).toBe("sol")
    expect(walletKindForChain("eth")).toBe("evm")
    expect(walletKindForChain("base")).toBe("evm")
    expect(walletKindForChain("zec")).toBeNull()
    expect(walletKindForChain("btc")).toBeNull()
    expect(walletKindForChain("near")).toBeNull()
  })
})

describe("isWalletAvailable", () => {
  it("is false with no injected provider", () => {
    expect(isWalletAvailable("sol")).toBe(false)
    expect(isWalletAvailable("evm")).toBe(false)
  })
  it("detects a Phantom Solana provider", () => {
    ;(window as unknown as W).phantom = { solana: { isPhantom: true, connect: vi.fn() } }
    expect(isWalletAvailable("sol")).toBe(true)
  })
  it("detects an EVM provider", () => {
    ;(window as unknown as W).ethereum = { request: vi.fn() }
    expect(isWalletAvailable("evm")).toBe(true)
  })
})

describe("connectForChain - Solana", () => {
  it("returns the connected public key", async () => {
    ;(window as unknown as W).phantom = {
      solana: { isPhantom: true, connect: vi.fn().mockResolvedValue({ publicKey: { toString: () => "SOLPUBKEY" } }) },
    }
    await expect(connectForChain("sol")).resolves.toBe("SOLPUBKEY")
  })

  it("throws notInstalled WalletError when Phantom is absent", async () => {
    await expect(connectForChain("sol")).rejects.toMatchObject({ notInstalled: true })
  })

  it("propagates a user rejection", async () => {
    ;(window as unknown as W).phantom = {
      solana: { isPhantom: true, connect: vi.fn().mockRejectedValue(new Error("User rejected the request")) },
    }
    await expect(connectForChain("sol")).rejects.toThrow(/reject/i)
  })
})

describe("connectForChain - EVM", () => {
  it("returns the first account", async () => {
    ;(window as unknown as W).ethereum = { request: vi.fn().mockResolvedValue(["0xabc", "0xdef"]) }
    await expect(connectForChain("eth")).resolves.toBe("0xabc")
  })

  it("throws notInstalled when no EVM provider exists", async () => {
    await expect(connectForChain("base")).rejects.toMatchObject({ notInstalled: true })
  })

  it("throws when no account is returned", async () => {
    ;(window as unknown as W).ethereum = { request: vi.fn().mockResolvedValue([]) }
    await expect(connectForChain("eth")).rejects.toBeInstanceOf(WalletError)
  })
})

describe("connectForChain - unsupported chain", () => {
  it("throws for chains without a browser wallet", async () => {
    await expect(connectForChain("zec")).rejects.toThrow(/no supported browser wallet/i)
  })
})
