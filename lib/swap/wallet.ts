// Multi-wallet address detection. The app never signs or sends a transaction
// (1Click uses a deposit-address flow) — connecting a wallet only reads its
// public address to auto-fill a field. We use the modern discovery standards so
// any installed wallet works, not just one:
//   • Solana  → Wallet Standard (@wallet-standard/app): Phantom, Solflare, Backpack…
//   • EVM     → EIP-6963 multi-provider discovery: MetaMask, Rabby, Coinbase, Phantom…
import { getWallets } from "@wallet-standard/app"

export type WalletChainKind = "solana" | "evm"

export interface DetectedWallet {
  id: string
  name: string
  icon?: string
  /** Connect and return the wallet's public address. */
  connect: () => Promise<string>
}

export class WalletError extends Error {
  /** True when no wallet of this kind is installed (so the UI can link to one). */
  notInstalled: boolean
  constructor(message: string, notInstalled = false) {
    super(message)
    this.name = "WalletError"
    this.notInstalled = notInstalled
  }
}

/** Which wallet flow (if any) applies to a destination/refund chain. */
export function walletKindForChain(chain: string): WalletChainKind | null {
  if (chain === "sol") return "solana"
  if (chain === "eth" || chain === "base") return "evm"
  return null
}

// ---------------- Solana (Wallet Standard) ----------------
const STANDARD_CONNECT = "standard:connect"

interface StandardWallet {
  name: string
  icon?: string
  chains: readonly string[]
  features: Record<string, unknown>
}

function isSolanaWallet(w: StandardWallet): boolean {
  return w.chains.some((c) => c.startsWith("solana:")) && STANDARD_CONNECT in w.features
}

function detectSolanaWallets(): DetectedWallet[] {
  if (typeof window === "undefined") return []
  const wallets = getWallets().get() as unknown as StandardWallet[]
  return wallets.filter(isSolanaWallet).map((w) => ({
    id: w.name,
    name: w.name,
    icon: w.icon,
    connect: async () => {
      const feature = w.features[STANDARD_CONNECT] as {
        connect: () => Promise<{ accounts: readonly { address: string }[] }>
      }
      const { accounts } = await feature.connect()
      const address = accounts[0]?.address
      if (!address) throw new WalletError(`${w.name} returned no account`)
      return address
    },
  }))
}

// ---------------- EVM (EIP-6963) ----------------
interface Eip1193 {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}
interface Eip6963Detail {
  info: { uuid: string; name: string; icon?: string; rdns?: string }
  provider: Eip1193
}

function connectEvmProvider(provider: Eip1193): () => Promise<string> {
  return async () => {
    const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[]
    const address = accounts?.[0]
    if (!address) throw new WalletError("Wallet returned no account")
    return address
  }
}

function detectEvmWallets(waitMs = 300): Promise<DetectedWallet[]> {
  if (typeof window === "undefined") return Promise.resolve([])
  return new Promise((resolve) => {
    const found = new Map<string, Eip6963Detail>()
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<Eip6963Detail>).detail
      if (detail?.info?.uuid) found.set(detail.info.uuid, detail)
    }
    window.addEventListener("eip6963:announceProvider", handler as EventListener)
    window.dispatchEvent(new Event("eip6963:requestProvider"))
    setTimeout(() => {
      window.removeEventListener("eip6963:announceProvider", handler as EventListener)
      let details = [...found.values()]
      // Fall back to a legacy injected provider if nothing announced via EIP-6963.
      const legacy = (window as unknown as { ethereum?: Eip1193 }).ethereum
      if (details.length === 0 && legacy) {
        details = [{ info: { uuid: "legacy", name: "Browser wallet" }, provider: legacy }]
      }
      resolve(
        details.map((d) => ({
          id: d.info.uuid,
          name: d.info.name,
          icon: d.info.icon,
          connect: connectEvmProvider(d.provider),
        })),
      )
    }, waitMs)
  })
}

/** Detected wallets for a chain kind (empty if none installed). */
export async function detectWallets(kind: WalletChainKind): Promise<DetectedWallet[]> {
  return kind === "solana" ? detectSolanaWallets() : detectEvmWallets()
}

/** Where to install a wallet when none is detected. */
export function installLinks(kind: WalletChainKind): { name: string; url: string }[] {
  return kind === "solana"
    ? [
        { name: "Phantom", url: "https://phantom.app/download" },
        { name: "Solflare", url: "https://solflare.com" },
      ]
    : [
        { name: "MetaMask", url: "https://metamask.io/download" },
        { name: "Rabby", url: "https://rabby.io" },
      ]
}
