import { describe, it, expect, vi, afterEach } from "vitest"
import { getWallets } from "@wallet-standard/app"
import { walletKindForChain, detectWallets, installLinks } from "@/lib/swap/wallet"

describe("walletKindForChain", () => {
  it("maps chains to wallet kinds", () => {
    expect(walletKindForChain("sol")).toBe("solana")
    expect(walletKindForChain("eth")).toBe("evm")
    expect(walletKindForChain("base")).toBe("evm")
    expect(walletKindForChain("zec")).toBeNull()
    expect(walletKindForChain("btc")).toBeNull()
    expect(walletKindForChain("near")).toBeNull()
  })
})

describe("installLinks", () => {
  it("offers Solana and EVM install options", () => {
    expect(installLinks("solana").map((l) => l.name)).toContain("Phantom")
    expect(installLinks("evm").map((l) => l.name)).toContain("MetaMask")
  })
})

describe("detectWallets — Solana (Wallet Standard)", () => {
  const cleanups: Array<() => void> = []
  afterEach(() => {
    cleanups.splice(0).forEach((fn) => fn())
  })

  function registerMockSolana(address: string, name = "MockSol") {
    const wallet = {
      version: "1.0.0" as const,
      name,
      icon: "data:image/svg+xml," as const,
      chains: ["solana:mainnet"] as const,
      accounts: [],
      features: {
        "standard:connect": {
          version: "1.0.0",
          connect: vi.fn().mockResolvedValue({ accounts: [{ address }] }),
        },
      },
    }
    cleanups.push(getWallets().register(wallet as never))
    return wallet
  }

  it("detects a registered Solana wallet and returns its address on connect", async () => {
    registerMockSolana("SoLAddR111")
    const found = await detectWallets("solana")
    const mock = found.find((w) => w.name === "MockSol")
    expect(mock).toBeTruthy()
    await expect(mock!.connect()).resolves.toBe("SoLAddR111")
  })

  it("ignores wallets without a solana chain", async () => {
    const wallet = {
      version: "1.0.0" as const,
      name: "EthOnly",
      icon: "data:," as const,
      chains: ["eip155:1"] as const,
      accounts: [],
      features: { "standard:connect": { version: "1.0.0", connect: vi.fn() } },
    }
    cleanups.push(getWallets().register(wallet as never))
    const found = await detectWallets("solana")
    expect(found.find((w) => w.name === "EthOnly")).toBeUndefined()
  })
})

describe("detectWallets — EVM (EIP-6963)", () => {
  it("discovers an announced provider and returns the first account", async () => {
    const provider = { request: vi.fn().mockResolvedValue(["0xabc", "0xdef"]) }
    const announce = () =>
      window.dispatchEvent(
        new CustomEvent("eip6963:announceProvider", {
          detail: { info: { uuid: "u1", name: "MockMetaMask" }, provider },
        }),
      )
    window.addEventListener("eip6963:requestProvider", announce)
    try {
      const found = await detectWallets("evm")
      const mock = found.find((w) => w.name === "MockMetaMask")
      expect(mock).toBeTruthy()
      await expect(mock!.connect()).resolves.toBe("0xabc")
      expect(provider.request).toHaveBeenCalledWith({ method: "eth_requestAccounts" })
    } finally {
      window.removeEventListener("eip6963:requestProvider", announce)
    }
  })

  it("returns an empty list when no EVM wallet announces or is injected", async () => {
    expect(await detectWallets("evm")).toEqual([])
  })
})
