"use client"

import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft, TrendingUp } from "lucide-react"
import { useEffect } from "react"
import type { RemittanceData } from "../types"

interface AmountStepProps {
  data: RemittanceData
  onChange: (updates: Partial<RemittanceData>) => void
}

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
]

// Mock exchange rates (in production, fetch from API)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  MXN: 17.5,
  PHP: 56.5,
  INR: 83.2,
}

export function AmountStep({ data, onChange }: AmountStepProps) {
  // Derive conversion values from the current input rather than mirroring them in state.
  const exchangeRate = EXCHANGE_RATES[data.currency] || 1
  const receiveAmount = data.amount ? (Number.parseFloat(data.amount) * exchangeRate).toFixed(2) : ""

  // Sync the derived values up to the parent so the review step can display them.
  useEffect(() => {
    if (data.amount) {
      onChange({ exchangeRate, receiveAmount })
    }
  }, [data.amount, exchangeRate, receiveAmount, onChange])

  const handleAmountChange = (value: string) => {
    onChange({ amount: value })
  }

  const handleCurrencyChange = (currency: string) => {
    onChange({ currency })
  }

  const currentCurrency = CURRENCIES.find((c) => c.code === data.currency)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">How Much to Send?</h2>
        <p className="text-muted-foreground">Enter the amount you want to send</p>
      </div>

      <div className="space-y-4">
        {/* Send Amount */}
        <div>
          <label className="block text-sm font-medium mb-2">Amount to Send</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-semibold">
              {currentCurrency?.symbol}
            </span>
            <Input
              type="number"
              placeholder="0.00"
              value={data.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="pl-10 text-lg"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Currency Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Currency</label>
          <Select value={data.currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Exchange Rate Info */}
        {data.amount && (
          <Card className="p-4 bg-muted/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Exchange Rate</span>
                <span className="font-semibold flex items-center gap-2">
                  1 SOL = {exchangeRate.toFixed(2)} {data.currency}
                  <TrendingUp size={16} className="text-secondary" />
                </span>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">You send</span>
                  <span className="font-bold text-lg">
                    {currentCurrency?.symbol}
                    {data.amount}
                  </span>
                </div>
                <div className="flex items-center justify-center my-2">
                  <ArrowRightLeft size={20} className="text-secondary rotate-90" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recipient receives</span>
                  <span className="font-bold text-lg text-secondary">
                    {receiveAmount} {data.currency}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Fee Info */}
        <Card className="p-4 bg-accent/5 border-accent/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Network Fee (estimated)</span>
            <span className="font-semibold text-accent">0.001 SOL (~$0.15)</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
