"use client"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, User, Mail, Globe, Wallet } from "lucide-react"

interface RecipientStepProps {
  data: any
  onChange: (updates: any) => void
}

const COUNTRIES = [
  { code: "MX", name: "Mexico" },
  { code: "PH", name: "Philippines" },
  { code: "IN", name: "India" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "BR", name: "Brazil" },
  { code: "VN", name: "Vietnam" },
  { code: "PK", name: "Pakistan" },
]

export function RecipientStep({ data, onChange }: RecipientStepProps) {
  const handleFieldChange = (field: string, value: string) => {
    onChange({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Send to Recipient</h2>
        <p className="text-muted-foreground">Enter the recipient's details to get started</p>
      </div>

      <div className="space-y-4">
        {/* Recipient Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Recipient Name</label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Full name"
              value={data.recipientName}
              onChange={(e) => handleFieldChange("recipientName", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Recipient Email */}
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={data.recipientEmail}
              onChange={(e) => handleFieldChange("recipientEmail", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Recipient Country */}
        <div>
          <label className="block text-sm font-medium mb-2">Country</label>
          <Select value={data.recipientCountry} onValueChange={(value) => handleFieldChange("recipientCountry", value)}>
            <SelectTrigger className="w-full">
              <Globe size={18} className="mr-2" />
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Wallet Address */}
        <div>
          <label className="block text-sm font-medium mb-2">Recipient Wallet Address</label>
          <div className="relative">
            <Wallet size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Solana or Zcash wallet address"
              value={data.recipientWallet}
              onChange={(e) => handleFieldChange("recipientWallet", e.target.value)}
              className="pl-10 font-mono text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">We'll verify this address before sending</p>
        </div>
      </div>

      {/* Privacy Notice */}
      <Card className="p-4 bg-secondary/10 border-secondary/20">
        <div className="flex gap-3">
          <AlertCircle size={18} className="text-secondary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Your privacy is protected</p>
            <p className="text-xs text-muted-foreground mt-1">
              All transaction details are encrypted end-to-end using Zcash privacy protocols
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
