// Lightweight Phantom wallet connector. Uses the injected providers directly
// (no wallet-adapter dependency) to auto-fill Solana and EVM addresses. Phantom
// supports both; we never request signatures — only the public address.

export type WalletChainKind = "sol" | "evm"

interface PhantomSolana {
  isPhantom?: boolean
  connect: () => Promise<{ publicKey: { toString(): string } }>
}

interface Eip1193 {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

interface PhantomWindow {
  phantom?: { solana?: PhantomSolana; ethereum?: Eip1193 }
  solana?: PhantomSolana
  ethereum?: Eip1193
}

function win(): PhantomWindow | undefined {
  return typeof window === "undefined" ? undefined : (window as unknown as PhantomWindow)
}

function getPhantomSolana(): PhantomSolana | undefined {
  const w = win()
  return w?.phantom?.solana ?? (w?.solana?.isPhantom ? w.solana : undefined)
}

function getEvmProvider(): Eip1193 | undefined {
  const w = win()
  return w?.phantom?.ethereum ?? w?.ethereum
}

/** Which wallet flow (if any) applies to a destination/refund chain. */
export function walletKindForChain(chain: string): WalletChainKind | null {
  if (chain === "sol") return "sol"
  if (chain === "eth" || chain === "base") return "evm"
  return null
}

export function isWalletAvailable(kind: WalletChainKind): boolean {
  return kind === "sol" ? !!getPhantomSolana() : !!getEvmProvider()
}

async function connectSolana(): Promise<string> {
  const provider = getPhantomSolana()
  if (!provider) throw new WalletError("Phantom wallet not found", true)
  const { publicKey } = await provider.connect()
  return publicKey.toString()
}

async function connectEvm(): Promise<string> {
  const provider = getEvmProvider()
  if (!provider) throw new WalletError("No EVM wallet found", true)
  const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[]
  if (!accounts?.length) throw new WalletError("No account returned")
  return accounts[0]
}

export class WalletError extends Error {
  /** True when the wallet isn't installed (so the UI can link to it). */
  notInstalled: boolean
  constructor(message: string, notInstalled = false) {
    super(message)
    this.name = "WalletError"
    this.notInstalled = notInstalled
  }
}

/** Connect the right wallet for a chain and return its address. */
export async function connectForChain(chain: string): Promise<string> {
  const kind = walletKindForChain(chain)
  if (kind === "sol") return connectSolana()
  if (kind === "evm") return connectEvm()
  throw new WalletError("This chain has no supported browser wallet")
}
