"use client"

import { useEffect, useMemo, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QRCodeSVG } from "qrcode.react"
import { chainMeta, chainLabel } from "@/lib/swap/chains"
import { buildPayLink } from "@/lib/swap/payment-link"
import type { SwapAsset } from "@/lib/swap/types"
import { Check, Copy, Link2, Receipt, ShieldCheck } from "lucide-react"

const ZEC_NATIVE = "nep141:zec.omft.near"

export default function RequestPage() {
  const [assets, setAssets] = useState<SwapAsset[]>([])
  const [assetId, setAssetId] = useState(ZEC_NATIVE)
  const [address, setAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [label, setLabel] = useState("")
  const [origin] = useState(() => (typeof window !== "undefined" ? window.location.origin : ""))
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch("/api/swap/tokens")
      .then((r) => r.json())
      .then((d) => Array.isArray(d.assets) && setAssets(d.assets))
      .catch(() => {})
  }, [])

  const asset = useMemo(() => assets.find((a) => a.assetId === assetId), [assets, assetId])
  const chain = asset?.chain ?? "zec"
  const addressValid = chainMeta(chain).isValidAddress(address)

  const link = useMemo(() => {
    if (!addressValid || !origin) return ""
    return buildPayLink(origin, {
      v: 1,
      destAssetId: assetId,
      recipient: address.trim(),
      amount: amount.trim() || undefined,
      label: label.trim() || undefined,
    })
  }, [addressValid, origin, assetId, address, amount, label])

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navigation />
      <section className="px-4 pt-20 pb-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
              <Receipt size={16} className="text-primary" />
              <span className="text-sm text-primary">No-account payment request</span>
            </div>
            <h1 className="mb-3 text-4xl font-bold">Get paid in private ZEC</h1>
            <p className="text-muted-foreground">
              Share a link. Whoever opens it can pay from any chain — and the funds settle to your address. No accounts,
              no KYC, on either side.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <label className="mb-1 block text-sm font-medium">Receive</label>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger className="mb-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assets.map((a) => (
                  <SelectItem key={a.assetId} value={a.assetId}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <label className="mb-1 block text-sm font-medium">
              Your {chainLabel(chain)} address <span className="text-muted-foreground">(where you get paid)</span>
            </label>
            <div className="relative mb-4">
              <Input
                placeholder={chainMeta(chain).addressHint}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pr-9"
              />
              {addressValid && <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary" />}
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Amount (optional)</label>
                <Input type="number" min="0" step="any" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Label (optional)</label>
                <Input placeholder="Invoice #123" value={label} onChange={(e) => setLabel(e.target.value)} />
              </div>
            </div>

            {link ? (
              <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-4">
                <div className="mb-3 flex flex-col items-center gap-3">
                  <div className="rounded-xl border border-border bg-white p-3">
                    <QRCodeSVG value={link} size={150} marginSize={1} />
                  </div>
                </div>
                <div className="mb-3 break-all rounded-lg border border-border bg-card p-2 font-mono text-xs">{link}</div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => {
                      navigator.clipboard?.writeText(link)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1500)
                    }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied" : "Copy link"}
                  </Button>
                  <Button variant="outline" asChild className="gap-2">
                    <a href={link} target="_blank" rel="noreferrer">
                      <Link2 size={16} /> Open
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                Enter a valid {chainLabel(chain)} address to generate your shareable link.
              </p>
            )}

            <p className="mt-4 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
              <ShieldCheck size={12} /> The request lives in the link itself — nothing is stored on a server.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
