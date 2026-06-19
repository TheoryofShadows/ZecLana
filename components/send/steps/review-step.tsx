"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Shield, Clock } from "lucide-react"
import type { RemittanceData } from "../types"

interface ReviewStepProps {
  data: RemittanceData
  onEdit: (step: "recipient" | "amount") => void
}

export function ReviewStep({ data, onEdit }: ReviewStepProps) {
  const COUNTRIES: Record<string, string> = {
    MX: "Mexico",
    PH: "Philippines",
    IN: "India",
    NG: "Nigeria",
    KE: "Kenya",
    BR: "Brazil",
    VN: "Vietnam",
    PK: "Pakistan",
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review Your Remittance</h2>
        <p className="text-muted-foreground">Please verify all details before sending</p>
      </div>

      <div className="space-y-4">
        {/* Recipient Summary */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">📮 Sending To</h3>
            <Button variant="ghost" size="sm" onClick={() => onEdit("recipient")} className="gap-2">
              <Edit2 size={16} />
              Edit
            </Button>
          </div>
          <div className="space-y-2 ml-6">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="font-medium">{data.recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="font-medium text-sm">{data.recipientEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Country</span>
              <span className="font-medium">{COUNTRIES[data.recipientCountry]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Wallet</span>
              <span className="font-medium font-mono text-xs truncate">{data.recipientWallet.slice(0, 15)}...</span>
            </div>
          </div>
        </Card>

        {/* Amount Summary */}
        <Card className="p-4 border-secondary/30 bg-secondary/5">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">💰 Amount</h3>
            <Button variant="ghost" size="sm" onClick={() => onEdit("amount")} className="gap-2">
              <Edit2 size={16} />
              Edit
            </Button>
          </div>
          <div className="space-y-3 ml-6">
            <div className="flex justify-between items-end">
              <span className="text-sm text-muted-foreground">You Send</span>
              <span className="text-2xl font-bold text-primary">
                {data.amount} {data.currency}
              </span>
            </div>
            <div className="h-px bg-border"></div>
            <div className="flex justify-between items-end">
              <span className="text-sm text-muted-foreground">Recipient Receives</span>
              <span className="text-2xl font-bold text-secondary">
                {data.receiveAmount} {data.currency}
              </span>
            </div>
            <div className="pt-2 text-xs text-muted-foreground">Network Fee: 0.001 SOL (~$0.15)</div>
          </div>
        </Card>

        {/* Security & Timeline */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield size={20} className="text-secondary" />
              <h4 className="font-semibold">Privacy Protected</h4>
            </div>
            <p className="text-xs text-muted-foreground">End-to-end encrypted with Zcash protocol</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={20} className="text-accent" />
              <h4 className="font-semibold">Instant Transfer</h4>
            </div>
            <p className="text-xs text-muted-foreground">Usually completes in 5-10 minutes</p>
          </Card>
        </div>

        {/* Terms Checkbox */}
        <Card className="p-4 bg-accent/5 border-accent/20">
          <div className="flex gap-3">
            <input type="checkbox" id="confirm" required className="rounded mt-1" />
            <label htmlFor="confirm" className="text-sm">
              I confirm this transaction is authorized and I understand the irreversible nature of blockchain
              transactions
            </label>
          </div>
        </Card>
      </div>
    </div>
  )
}
