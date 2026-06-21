"use client"

import { useState } from "react"
import { Wallet, Loader2 } from "lucide-react"
import { connectForChain, walletKindForChain, WalletError } from "@/lib/swap/wallet"

// Inline "fill from wallet" control shown next to address inputs on Solana/EVM
// chains. Connects Phantom (Solana or EVM) and fills the field. Hidden for
// chains with no browser wallet (Zcash, Bitcoin, NEAR).
export function WalletFillButton({ chain, onFill }: { chain: string; onFill: (address: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notInstalled, setNotInstalled] = useState(false)

  if (!walletKindForChain(chain)) return null

  const connect = async () => {
    setBusy(true)
    setError(null)
    setNotInstalled(false)
    try {
      const address = await connectForChain(chain)
      onFill(address)
    } catch (err) {
      if (err instanceof WalletError && err.notInstalled) {
        setNotInstalled(true)
        setError("No wallet found")
      } else {
        setError(err instanceof Error && err.message.includes("reject") ? "Connection cancelled" : "Couldn't connect")
      }
    } finally {
      setBusy(false)
    }
  }

  if (notInstalled) {
    return (
      <a
        href="https://phantom.app/download"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        <Wallet size={13} /> Install Phantom
      </a>
    )
  }

  return (
    <span className="inline-flex items-center gap-2">
      {error && <span className="text-[11px] text-destructive">{error}</span>}
      <button
        type="button"
        onClick={connect}
        disabled={busy}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
      >
        {busy ? <Loader2 size={13} className="animate-spin" /> : <Wallet size={13} />}
        {busy ? "Connecting…" : "Use Phantom"}
      </button>
    </span>
  )
}
