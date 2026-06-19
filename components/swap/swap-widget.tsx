"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownUp, Check, Copy, Loader2, ShieldCheck, AlertTriangle } from "lucide-react"
import type { Quote, SwapAsset, SwapStatus } from "@/lib/swap/types"

// Placeholder addresses used only for indicative preview quotes before the user
// supplies their own. A real deposit address is never reserved with these.
const PLACEHOLDER: Record<string, string> = {
  zec: "t1KzZxbwUNB4Hu1Hg3a4qWxGpGT5Bo4Mr8w",
  sol: "11111111111111111111111111111111",
}

const ZEC_NATIVE = "nep141:zec.omft.near"
const ZEC_SOLANA = "1cs_v1:sol:spl:A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS"

const STATUS_STEPS: { key: string; label: string }[] = [
  { key: "PENDING_DEPOSIT", label: "Awaiting deposit" },
  { key: "PROCESSING", label: "Swapping" },
  { key: "SUCCESS", label: "Delivered" },
]

const STATUS_RANK: Record<string, number> = {
  PENDING_DEPOSIT: 0,
  KNOWN_DEPOSIT_TX: 1,
  PROCESSING: 1,
  SUCCESS: 2,
  REFUNDED: 2,
  FAILED: 2,
  EXPIRED: 2,
  UNKNOWN: 0,
}

function chainLabel(chain: string) {
  return chain === "zec" ? "Zcash" : "Solana"
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

export function SwapWidget() {
  const [assets, setAssets] = useState<SwapAsset[]>([])
  const [fromId, setFromId] = useState(ZEC_NATIVE)
  const [toId, setToId] = useState(ZEC_SOLANA)
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [refundTo, setRefundTo] = useState("")

  const [preview, setPreview] = useState<Quote | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const [liveQuote, setLiveQuote] = useState<Quote | null>(null)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [status, setStatus] = useState<SwapStatus | null>(null)

  const fromAsset = useMemo(() => assets.find((a) => a.assetId === fromId), [assets, fromId])
  const toAsset = useMemo(() => assets.find((a) => a.assetId === toId), [assets, toId])

  // Load the curated asset list (with live prices) once.
  useEffect(() => {
    let active = true
    fetch("/api/swap/tokens")
      .then((r) => r.json())
      .then((data) => {
        if (active && Array.isArray(data.assets)) setAssets(data.assets)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const swapDirection = useCallback(() => {
    setFromId(toId)
    setToId(fromId)
    setPreview(null)
  }, [fromId, toId])

  // Debounced indicative (dry) quote whenever the pair or amount changes.
  useEffect(() => {
    if (liveQuote) return // locked into a deposit; stop previewing
    const value = Number(amount)
    const valid = !!fromId && !!toId && fromId !== toId && Number.isFinite(value) && value > 0

    const controller = new AbortController()
    const handle = setTimeout(async () => {
      if (!valid) {
        setPreview(null)
        setPreviewError(null)
        return
      }
      setPreviewError(null)
      setPreviewLoading(true)
      try {
        const res = await fetch("/api/swap/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            originAssetId: fromId,
            destinationAssetId: toId,
            amount,
            recipient: recipient || PLACEHOLDER[toAsset?.chain ?? "sol"],
            refundTo: refundTo || PLACEHOLDER[fromAsset?.chain ?? "zec"],
            dry: true,
          }),
        })
        const data = await res.json()
        if (controller.signal.aborted) return
        if (!res.ok) {
          setPreviewError(data.error || "Couldn't fetch a quote")
          setPreview(null)
        } else {
          setPreview(data.quote)
        }
      } catch {
        if (!controller.signal.aborted) setPreviewError("Network error fetching quote")
      } finally {
        if (!controller.signal.aborted) setPreviewLoading(false)
      }
    }, 600)

    return () => {
      controller.abort()
      clearTimeout(handle)
    }
  }, [fromId, toId, amount, recipient, refundTo, fromAsset, toAsset, liveQuote])

  const createSwap = useCallback(async () => {
    setCreating(true)
    setCreateError(null)
    try {
      const res = await fetch("/api/swap/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originAssetId: fromId,
          destinationAssetId: toId,
          amount,
          recipient,
          refundTo,
          dry: false,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.quote?.depositAddress) {
        setCreateError(data.error || "Couldn't reserve a deposit address. Please try again.")
        return
      }
      setLiveQuote(data.quote)
    } catch {
      setCreateError("Network error. Please try again.")
    } finally {
      setCreating(false)
    }
  }, [fromId, toId, amount, recipient, refundTo])

  // Poll status once a deposit address is reserved.
  const depositAddress = liveQuote?.depositAddress
  useEffect(() => {
    if (!depositAddress) return
    let active = true

    const poll = async () => {
      try {
        const res = await fetch(`/api/swap/status?depositAddress=${encodeURIComponent(depositAddress)}`)
        const data = await res.json()
        if (active && res.ok && data.status) setStatus(data.status)
      } catch {
        // transient; keep polling
      }
    }

    poll()
    const interval = setInterval(() => {
      if ((status && STATUS_RANK[status.status] >= 2) || !active) return
      poll()
    }, 8000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [depositAddress, status])

  const reset = () => {
    setLiveQuote(null)
    setStatus(null)
    setCreateError(null)
    setAmount("")
    setPreview(null)
  }

  const recipientChain = toAsset?.chain ?? "sol"
  const refundChain = fromAsset?.chain ?? "zec"
  const addressesValid = recipient.trim().length >= 20 && refundTo.trim().length >= 20
  const amountValid = Number(amount) > 0

  // ----- Deposit + tracking view -----
  if (liveQuote?.depositAddress) {
    const terminal = status ? STATUS_RANK[status.status] >= 2 : false
    const failed = status?.status === "FAILED" || status?.status === "EXPIRED" || status?.status === "REFUNDED"
    const activeRank = status ? STATUS_RANK[status.status] : 0

    return (
      <Card className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Complete your swap</h2>
          <Badge variant="secondary" className="gap-1">
            <ShieldCheck size={14} /> Non-custodial
          </Badge>
        </div>

        {!terminal && (
          <p className="text-sm text-muted-foreground mb-4">
            Send exactly{" "}
            <span className="font-semibold text-foreground">
              {liveQuote.amountInFormatted} {fromAsset?.symbol}
            </span>{" "}
            on {chainLabel(refundChain)} to the address below. The solver delivers{" "}
            <span className="font-semibold text-foreground">
              ~{liveQuote.amountOutFormatted} {toAsset?.symbol}
            </span>{" "}
            to your {chainLabel(recipientChain)} address automatically.
          </p>
        )}

        {!terminal && (
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="rounded-xl bg-white p-3">
              <QRCodeSVG value={liveQuote.depositAddress} size={160} />
            </div>
            <div className="w-full rounded-lg border border-border p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Deposit address ({chainLabel(refundChain)})</span>
                <CopyButton value={liveQuote.depositAddress} />
              </div>
              <p className="font-mono text-xs break-all">{liveQuote.depositAddress}</p>
            </div>
          </div>
        )}

        {/* Status stepper */}
        <div className="flex items-center justify-between mb-6">
          {STATUS_STEPS.map((step, idx) => {
            const reached = activeRank >= idx
            return (
              <div key={step.key} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                      reached ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {reached && idx <= activeRank && idx < 2 ? (
                      <Loader2 size={16} className={activeRank === idx ? "animate-spin" : ""} />
                    ) : reached ? (
                      <Check size={16} />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground text-center">{step.label}</span>
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div className={`mx-1 h-0.5 flex-1 ${activeRank > idx ? "bg-secondary" : "bg-muted"}`} />
                )}
              </div>
            )
          })}
        </div>

        {failed && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <AlertTriangle size={16} className="mt-0.5 text-destructive" />
            <span>
              Swap {status?.status.toLowerCase()}. If you deposited, funds are returned to your refund address.
            </span>
          </div>
        )}

        {status?.status === "SUCCESS" && (
          <div className="mb-4 rounded-lg border border-secondary/30 bg-secondary/5 p-3 text-sm">
            Delivered {status.amountOutFormatted ?? liveQuote.amountOutFormatted} {toAsset?.symbol} to your{" "}
            {chainLabel(recipientChain)} address.
            {status.destinationTxHash && (
              <span className="block font-mono text-xs break-all mt-1">tx: {status.destinationTxHash}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Status: {status?.status ?? "PENDING_DEPOSIT"}</span>
          {!terminal && <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Live</span>}
        </div>

        <Button variant="outline" className="mt-6 w-full" onClick={reset}>
          Start a new swap
        </Button>
      </Card>
    )
  }

  // ----- Configure view -----
  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Swap ZEC ⇄ Solana</h2>
        <Badge variant="secondary" className="gap-1">
          <ShieldCheck size={14} /> No KYC
        </Badge>
      </div>

      {/* From */}
      <div className="rounded-xl border border-border p-4 mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">You send</span>
          {fromAsset?.priceUsd ? (
            <span className="text-xs text-muted-foreground">${fromAsset.priceUsd.toFixed(2)}</span>
          ) : null}
        </div>
        <div className="flex gap-3">
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg"
          />
          <Select value={fromId} onValueChange={setFromId}>
            <SelectTrigger className="w-[200px] shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assets.map((a) => (
                <SelectItem key={a.assetId} value={a.assetId} disabled={a.assetId === toId}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Direction toggle */}
      <div className="flex justify-center -my-1 relative z-10">
        <button
          type="button"
          onClick={swapDirection}
          className="rounded-full border border-border bg-background p-2 hover:bg-muted transition"
          aria-label="Swap direction"
        >
          <ArrowDownUp size={16} />
        </button>
      </div>

      {/* To */}
      <div className="rounded-xl border border-border p-4 mt-2 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">You receive (estimated)</span>
          {toAsset?.priceUsd ? (
            <span className="text-xs text-muted-foreground">${toAsset.priceUsd.toFixed(2)}</span>
          ) : null}
        </div>
        <div className="flex gap-3">
          <div className="flex h-9 w-full items-center text-lg font-semibold">
            {previewLoading ? (
              <Loader2 size={18} className="animate-spin text-muted-foreground" />
            ) : preview ? (
              preview.amountOutFormatted
            ) : (
              <span className="text-muted-foreground">0.00</span>
            )}
          </div>
          <Select value={toId} onValueChange={setToId}>
            <SelectTrigger className="w-[200px] shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assets.map((a) => (
                <SelectItem key={a.assetId} value={a.assetId} disabled={a.assetId === fromId}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quote detail */}
      {preview && (
        <div className="mb-4 space-y-1 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Rate</span>
            <span>
              1 {fromAsset?.symbol} ≈{" "}
              {(Number(preview.amountOutFormatted) / Math.max(Number(preview.amountInFormatted), 1e-9)).toFixed(4)}{" "}
              {toAsset?.symbol}
            </span>
          </div>
          {preview.amountOutUsd && (
            <div className="flex justify-between">
              <span>Value</span>
              <span>~${preview.amountOutUsd}</span>
            </div>
          )}
          {preview.indicative && (
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-500">
              <AlertTriangle size={12} /> Indicative estimate — exact rate locked when you reserve the deposit.
            </div>
          )}
        </div>
      )}
      {previewError && !preview && <p className="mb-4 text-xs text-destructive">{previewError}</p>}

      {/* Addresses */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Recipient address ({chainLabel(recipientChain)})
          </label>
          <Input
            placeholder={recipientChain === "zec" ? "Your Zcash address" : "Your Solana wallet address"}
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Refund address ({chainLabel(refundChain)})</label>
          <Input
            placeholder={refundChain === "zec" ? "Your Zcash address" : "Your Solana wallet address"}
            value={refundTo}
            onChange={(e) => setRefundTo(e.target.value)}
          />
          <p className="mt-1 text-xs text-muted-foreground">Where funds return if the swap can&apos;t complete.</p>
        </div>
      </div>

      {createError && <p className="mb-3 text-sm text-destructive">{createError}</p>}

      <Button className="w-full gap-2" disabled={!amountValid || !addressesValid || creating} onClick={createSwap}>
        {creating ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Reserving deposit…
          </>
        ) : (
          "Get deposit address"
        )}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Powered by NEAR Intents · non-custodial · no account required
      </p>
    </Card>
  )
}
