"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowDownUp,
  Check,
  Copy,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Zap,
  ExternalLink,
  RefreshCw,
  PartyPopper,
} from "lucide-react"
import type { Quote, SwapAsset, SwapStatus } from "@/lib/swap/types"

// Placeholder addresses used only for indicative preview quotes before the user
// supplies their own. A real deposit address is never reserved with these.
const PLACEHOLDER: Record<string, string> = {
  zec: "t1KzZxbwUNB4Hu1Hg3a4qWxGpGT5Bo4Mr8w",
  sol: "11111111111111111111111111111111",
}

const ZEC_NATIVE = "nep141:zec.omft.near"
const ZEC_SOLANA = "1cs_v1:sol:spl:A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS"
const SOL_NATIVE = "nep141:sol.omft.near"

const STATUS_STEPS = [
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

const QUICK_AMOUNTS = ["0.1", "0.5", "1", "5"]

function chainLabel(chain: string) {
  return chain === "zec" ? "Zcash" : "Solana"
}

function explorerTx(chain: string, hash: string): string {
  return chain === "zec" ? `https://3xpl.com/zcash/transaction/${hash}` : `https://solscan.io/tx/${hash}`
}

function tokenGradient(asset?: SwapAsset): string {
  if (!asset) return "from-muted to-muted"
  if (asset.symbol === "ZEC") return "from-primary to-[oklch(0.45_0.18_300)]"
  if (asset.symbol === "SOL") return "from-[#9945FF] to-secondary"
  if (asset.symbol === "USDC") return "from-[#2775CA] to-[#4Fa3ff]"
  return "from-primary to-secondary"
}

function TokenIcon({ asset, size = 24 }: { asset?: SwapAsset; size?: number }) {
  const ring = asset?.chain === "zec" ? "ring-primary/40" : "ring-secondary/40"
  return (
    <span
      className={`inline-grid place-items-center rounded-full bg-gradient-to-br ${tokenGradient(
        asset,
      )} text-white font-bold ring-2 ${ring}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {asset?.symbol?.[0] ?? "?"}
    </span>
  )
}

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied" : label}
    </button>
  )
}

function useCountdown(deadline?: string) {
  const [remaining, setRemaining] = useState<number>(0)
  useEffect(() => {
    if (!deadline) return
    const target = new Date(deadline).getTime()
    const tick = () => setRemaining(Math.max(0, Math.floor((target - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [deadline])
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0")
  const ss = String(remaining % 60).padStart(2, "0")
  return { remaining, formatted: `${mm}:${ss}` }
}

export function SwapWidget() {
  const [assets, setAssets] = useState<SwapAsset[]>([])
  const [pricesLive, setPricesLive] = useState(true)
  const [fromId, setFromId] = useState(ZEC_NATIVE)
  const [toId, setToId] = useState(ZEC_SOLANA)
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [refundTo, setRefundTo] = useState("")
  const [rotated, setRotated] = useState(false)

  const [preview, setPreview] = useState<Quote | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)

  const [liveQuote, setLiveQuote] = useState<Quote | null>(null)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [status, setStatus] = useState<SwapStatus | null>(null)

  const fromAsset = useMemo(() => assets.find((a) => a.assetId === fromId), [assets, fromId])
  const toAsset = useMemo(() => assets.find((a) => a.assetId === toId), [assets, toId])

  useEffect(() => {
    let active = true
    fetch("/api/swap/tokens")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return
        if (Array.isArray(data.assets)) setAssets(data.assets)
        setPricesLive(Boolean(data.pricesLive))
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
    setRotated((r) => !r)
  }, [fromId, toId])

  const setPair = useCallback((from: string, to: string) => {
    setFromId(from)
    setToId(to)
    setPreview(null)
  }, [])

  // Auto-refresh the preview rate periodically while configuring.
  useEffect(() => {
    if (liveQuote) return
    const id = setInterval(() => setRefreshTick((t) => t + 1), 25000)
    return () => clearInterval(id)
  }, [liveQuote])

  // Debounced indicative (dry) quote whenever the pair or amount changes.
  useEffect(() => {
    if (liveQuote) return
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
    }, 550)

    return () => {
      controller.abort()
      clearTimeout(handle)
    }
  }, [fromId, toId, amount, recipient, refundTo, fromAsset, toAsset, liveQuote, refreshTick])

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
        setCreateError(data.error || "Couldn't reserve a deposit address. The solver network may be busy — try again.")
        return
      }
      setLiveQuote(data.quote)
    } catch {
      setCreateError("Network error. Please try again.")
    } finally {
      setCreating(false)
    }
  }, [fromId, toId, amount, recipient, refundTo])

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
        /* transient */
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
  const recipientValid = recipient.trim().length >= 20
  const refundValid = refundTo.trim().length >= 20
  const amountValid = Number(amount) > 0

  const fromUsd = fromAsset?.priceUsd && amountValid ? (Number(amount) * fromAsset.priceUsd).toFixed(2) : null
  const rate =
    preview && Number(preview.amountInFormatted) > 0
      ? (Number(preview.amountOutFormatted) / Number(preview.amountInFormatted)).toFixed(4)
      : null

  const countdown = useCountdown(liveQuote?.deadline)

  // ---------------- Deposit + tracking view ----------------
  if (liveQuote?.depositAddress) {
    const terminal = status ? STATUS_RANK[status.status] >= 2 : false
    const failed = status?.status === "FAILED" || status?.status === "EXPIRED" || status?.status === "REFUNDED"
    const success = status?.status === "SUCCESS"
    const activeRank = status ? STATUS_RANK[status.status] : 0

    return (
      <div className="swap-frame p-[1.5px]">
        <div className="rounded-[calc(1.5rem-1.5px)] bg-card p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">{success ? "Swap complete" : "Complete your swap"}</h2>
            <Badge variant="secondary" className="gap-1">
              <ShieldCheck size={14} /> Non-custodial
            </Badge>
          </div>

          {success ? (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="pop-in mb-4 grid h-20 w-20 place-items-center rounded-full bg-secondary/15 text-secondary">
                <PartyPopper size={40} />
              </div>
              <p className="text-lg font-semibold">
                {status?.amountOutFormatted ?? liveQuote.amountOutFormatted} {toAsset?.symbol} delivered
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Sent to your {chainLabel(recipientChain)} address.
              </p>
              {status?.destinationTxHash && (
                <a
                  href={explorerTx(recipientChain, status.destinationTxHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View transaction <ExternalLink size={13} />
                </a>
              )}
            </div>
          ) : (
            <>
              {/* Amount to send */}
              <div className="mb-5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4">
                <p className="mb-1 text-xs text-muted-foreground">Send exactly</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-2xl font-bold">
                    <TokenIcon asset={fromAsset} size={28} />
                    {liveQuote.amountInFormatted} {fromAsset?.symbol}
                  </span>
                  <CopyButton value={liveQuote.amountInFormatted} label="Copy amt" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  on {chainLabel(refundChain)} · you receive ~{liveQuote.amountOutFormatted} {toAsset?.symbol}
                </p>
              </div>

              {/* QR + address */}
              <div className="mb-5 flex flex-col items-center gap-4">
                <div className="rounded-2xl border border-border bg-white p-3 shadow-sm">
                  <QRCodeSVG value={liveQuote.depositAddress} size={168} marginSize={1} />
                </div>
                <div className="w-full rounded-xl border border-border bg-muted/30 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Deposit address ({chainLabel(refundChain)})
                    </span>
                    <CopyButton value={liveQuote.depositAddress} />
                  </div>
                  <p className="break-all font-mono text-xs">{liveQuote.depositAddress}</p>
                </div>
                {countdown.remaining > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock size={14} />
                    Quote valid for <span className="font-mono font-semibold text-foreground">{countdown.formatted}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Status stepper */}
          {!success && (
            <div className="mb-6 flex items-center justify-between">
              {STATUS_STEPS.map((step, idx) => {
                const reached = activeRank >= idx
                const isActive = activeRank === idx && idx < 2
                return (
                  <div key={step.key} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold transition-colors ${
                          reached ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isActive ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : reached ? (
                          <Check size={16} />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span className="text-center text-[11px] text-muted-foreground">{step.label}</span>
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`mx-1 h-0.5 flex-1 rounded ${activeRank > idx ? "bg-secondary" : "bg-muted"}`} />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {failed && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-destructive" />
              <span>
                Swap {status?.status.toLowerCase()}. If you already deposited, funds are returned to your refund
                address.
              </span>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Status: {status?.status ?? "PENDING_DEPOSIT"}</span>
            {!terminal && (
              <span className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                </span>
                Live tracking
              </span>
            )}
          </div>

          <Button variant="outline" className="w-full" onClick={reset}>
            Start a new swap
          </Button>
        </div>
      </div>
    )
  }

  // ---------------- Configure view ----------------
  const presets = [
    { label: "ZEC → Solana", from: ZEC_NATIVE, to: ZEC_SOLANA },
    { label: "Solana → ZEC", from: ZEC_SOLANA, to: ZEC_NATIVE },
    { label: "ZEC → SOL", from: ZEC_NATIVE, to: SOL_NATIVE },
  ]

  return (
    <div className="swap-frame p-[1.5px]">
      <div className="rounded-[calc(1.5rem-1.5px)] bg-card p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Swap ZEC ⇄ Solana</h2>
            <p className="text-xs text-muted-foreground">Private, non-custodial, no account</p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <ShieldCheck size={14} /> No KYC
          </Badge>
        </div>

        {/* Presets */}
        <div className="mb-4 flex flex-wrap gap-2">
          {presets.map((p) => {
            const active = fromId === p.from && toId === p.to
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => setPair(p.from, p.to)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            )
          })}
        </div>

        {/* From */}
        <div className="rounded-2xl border border-border bg-muted/20 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">You send</span>
            {fromAsset?.priceUsd ? (
              <span className="text-xs text-muted-foreground">${fromAsset.priceUsd.toFixed(2)}</span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 border-0 bg-transparent px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
            />
            <Select value={fromId} onValueChange={setFromId}>
              <SelectTrigger className="h-11 w-[210px] shrink-0 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assets.map((a) => (
                  <SelectItem key={a.assetId} value={a.assetId} disabled={a.assetId === toId}>
                    <span className="flex items-center gap-2">
                      <TokenIcon asset={a} size={18} /> {a.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{fromUsd ? `≈ $${fromUsd}` : " "}</span>
            <div className="flex gap-1">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q)}
                  className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Direction toggle */}
        <div className="relative z-10 -my-2 flex justify-center">
          <button
            type="button"
            onClick={swapDirection}
            className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card shadow-sm transition-transform hover:bg-muted"
            style={{ transform: rotated ? "rotate(180deg)" : "rotate(0deg)" }}
            aria-label="Swap direction"
          >
            <ArrowDownUp size={16} />
          </button>
        </div>

        {/* To */}
        <div className="rounded-2xl border border-border bg-muted/20 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">You receive (estimated)</span>
            {toAsset?.priceUsd ? (
              <span className="text-xs text-muted-foreground">${toAsset.priceUsd.toFixed(2)}</span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 flex-1 items-center text-2xl font-semibold">
              {previewLoading ? (
                <span className="shimmer h-7 w-28 rounded-md bg-muted" />
              ) : preview ? (
                <span>{preview.amountOutFormatted}</span>
              ) : (
                <span className="text-muted-foreground">0.00</span>
              )}
            </div>
            <Select value={toId} onValueChange={setToId}>
              <SelectTrigger className="h-11 w-[210px] shrink-0 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assets.map((a) => (
                  <SelectItem key={a.assetId} value={a.assetId} disabled={a.assetId === fromId}>
                    <span className="flex items-center gap-2">
                      <TokenIcon asset={a} size={18} /> {a.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {preview?.amountOutUsd ? `≈ $${preview.amountOutUsd}` : " "}
          </div>
        </div>

        {/* Quote detail */}
        {preview && (
          <div className="mt-4 space-y-1.5 rounded-xl border border-border bg-muted/20 p-3 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Rate</span>
              <span className="font-medium text-foreground">
                1 {fromAsset?.symbol} ≈ {rate} {toAsset?.symbol}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span className="flex items-center gap-1">
                <Zap size={12} /> Est. settlement
              </span>
              <span className="font-medium text-foreground">
                {preview.timeEstimateSeconds
                  ? `~${Math.max(1, Math.round(preview.timeEstimateSeconds / 60))} min`
                  : "~1–5 min"}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Max slippage</span>
              <span className="font-medium text-foreground">1%</span>
            </div>
            {preview.indicative && (
              <div className="flex items-center gap-1 pt-1 text-amber-600 dark:text-amber-500">
                <RefreshCw size={12} /> Indicative rate — locked exactly when you reserve the deposit.
              </div>
            )}
          </div>
        )}
        {previewError && !preview && (
          <p className="mt-3 flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle size={12} /> {previewError}
          </p>
        )}

        {/* Addresses */}
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Recipient address <span className="text-muted-foreground">({chainLabel(recipientChain)})</span>
            </label>
            <div className="relative">
              <Input
                placeholder={recipientChain === "zec" ? "Your Zcash address" : "Your Solana wallet address"}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="pr-9"
              />
              {recipientValid && (
                <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary" />
              )}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Refund address <span className="text-muted-foreground">({chainLabel(refundChain)})</span>
            </label>
            <div className="relative">
              <Input
                placeholder={refundChain === "zec" ? "Your Zcash address" : "Your Solana wallet address"}
                value={refundTo}
                onChange={(e) => setRefundTo(e.target.value)}
                className="pr-9"
              />
              {refundValid && <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary" />}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Where funds return if the swap can&apos;t complete.</p>
          </div>
        </div>

        {createError && (
          <p className="mt-3 flex items-start gap-1 text-sm text-destructive">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {createError}
          </p>
        )}

        <Button
          size="lg"
          className="mt-5 w-full gap-2 text-base"
          disabled={!amountValid || !recipientValid || !refundValid || creating}
          onClick={createSwap}
        >
          {creating ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Reserving deposit…
            </>
          ) : !amountValid ? (
            "Enter an amount"
          ) : !recipientValid || !refundValid ? (
            "Enter your addresses"
          ) : (
            "Get deposit address"
          )}
        </Button>

        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} /> Non-custodial
          </span>
          <span className="flex items-center gap-1">
            <Check size={12} /> No account
          </span>
          <span>Powered by NEAR Intents</span>
        </div>
        {!pricesLive && (
          <p className="mt-2 text-center text-[11px] text-amber-600 dark:text-amber-500">
            Live price feed unavailable — showing reference data.
          </p>
        )}
      </div>
    </div>
  )
}
