"use client"

import { useCallback, useEffect, useState } from "react"
import { listSwaps, clearSwaps, updateSwapStatus, type SwapRecord } from "@/lib/swap/history"
import { fetchStatus } from "@/lib/swap/client"
import { chainMeta } from "@/lib/swap/chains"
import { History, Trash2, ExternalLink, Loader2, Check, AlertTriangle } from "lucide-react"

const TERMINAL = new Set(["SUCCESS", "REFUNDED", "FAILED", "EXPIRED"])

function StatusPill({ status }: { status: string }) {
  if (status === "SUCCESS")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2 py-0.5 text-[11px] font-medium text-secondary">
        <Check size={11} /> Delivered
      </span>
    )
  if (TERMINAL.has(status))
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
        <AlertTriangle size={11} /> {status.toLowerCase()}
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      <Loader2 size={11} className="animate-spin" /> Pending
    </span>
  )
}

export function SwapHistory() {
  const [records, setRecords] = useState<SwapRecord[]>([])

  const refresh = useCallback(() => setRecords(listSwaps()), [])

  useEffect(() => {
    queueMicrotask(refresh)
    window.addEventListener("zolana-history", refresh)
    return () => window.removeEventListener("zolana-history", refresh)
  }, [refresh])

  // Re-poll live status for any non-terminal swaps.
  useEffect(() => {
    const pending = records.filter((r) => !TERMINAL.has(r.status))
    if (pending.length === 0) return
    let active = true
    const poll = async () => {
      await Promise.all(
        pending.map(async (r) => {
          try {
            const data = await fetchStatus(r.depositAddress)
            if (active && data.status?.status) updateSwapStatus(r.id, data.status.status)
          } catch {
            /* transient */
          }
        }),
      )
    }
    poll()
    const interval = setInterval(poll, 12000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [records])

  if (records.length === 0) return null

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <History size={16} className="text-primary" /> Your swaps
          <span className="text-xs font-normal text-muted-foreground">(stored only on this device)</span>
        </h3>
        <button
          type="button"
          onClick={() => {
            clearSwaps()
            refresh()
          }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 size={13} /> Clear
        </button>
      </div>

      <ul className="space-y-2">
        {records.map((r) => {
          const meta = chainMeta(r.toChain)
          return (
            <li key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm">
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-medium">
                  <span className="truncate">
                    {r.amountInFormatted} {r.fromSymbol} → {r.amountOutFormatted} {r.toSymbol}
                  </span>
                </div>
                <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                  {new Date(r.createdAt).toLocaleString()} · to {r.recipient.slice(0, 10)}…
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusPill status={r.status} />
                <a
                  href={meta.explorerTx(r.recipient)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-primary"
                  title="View recipient on explorer"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
