"use client"

import { useState } from "react"
import { Wallet, Loader2 } from "lucide-react"
import { detectWallets, installLinks, walletKindForChain, type DetectedWallet } from "@/lib/swap/wallet"

// Inline "connect wallet" control shown next to address inputs on Solana/EVM
// chains. Detects every installed wallet (Wallet Standard for Solana, EIP-6963
// for EVM), lets the user pick one, and fills the field with its address. We
// never request a signature — only the public address. Hidden for chains with no
// browser wallet (Zcash, Bitcoin, NEAR).
type Mode = "idle" | "busy" | "picking" | "none" | "error"

export function WalletFillButton({ chain, onFill }: { chain: string; onFill: (address: string) => void }) {
  const kind = walletKindForChain(chain)
  const [mode, setMode] = useState<Mode>("idle")
  const [wallets, setWallets] = useState<DetectedWallet[]>([])
  const [error, setError] = useState<string | null>(null)

  if (!kind) return null

  const fillFrom = async (wallet: DetectedWallet) => {
    setMode("busy")
    setError(null)
    try {
      onFill(await wallet.connect())
      setMode("idle")
    } catch (err) {
      setError(err instanceof Error && /reject|denied|cancel/i.test(err.message) ? "Connection cancelled" : "Couldn't connect")
      setMode("error")
    }
  }

  const start = async () => {
    setMode("busy")
    setError(null)
    const found = await detectWallets(kind)
    if (found.length === 0) {
      setMode("none")
    } else if (found.length === 1) {
      await fillFrom(found[0])
    } else {
      setWallets(found)
      setMode("picking")
    }
  }

  if (mode === "none") {
    return (
      <span className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
        No wallet found —
        {installLinks(kind).map((l) => (
          <a key={l.name} href={l.url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
            Install {l.name}
          </a>
        ))}
      </span>
    )
  }

  if (mode === "picking") {
    return (
      <span className="inline-flex flex-wrap items-center gap-2">
        {wallets.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => fillFrom(w)}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs font-medium hover:border-primary/40"
          >
            {w.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={w.icon} alt="" width={13} height={13} className="rounded" />
            ) : (
              <Wallet size={13} />
            )}
            {w.name}
          </button>
        ))}
        <button type="button" onClick={() => setMode("idle")} className="text-[11px] text-muted-foreground hover:underline">
          Cancel
        </button>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-2">
      {error && <span className="text-[11px] text-destructive">{error}</span>}
      <button
        type="button"
        onClick={start}
        disabled={mode === "busy"}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
      >
        {mode === "busy" ? <Loader2 size={13} className="animate-spin" /> : <Wallet size={13} />}
        {mode === "busy" ? "Connecting…" : "Connect wallet"}
      </button>
    </span>
  )
}
