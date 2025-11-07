"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Copy, Eye, EyeOff, Plus, Trash2, Lock, Wallet } from "lucide-react"
import { useState } from "react"

export function WalletSettings() {
  const [showSeedPhrase, setShowSeedPhrase] = useState(false)
  const [copied, setCopied] = useState(false)

  const wallets = [
    {
      id: "sol_001",
      name: "Solana Wallet",
      address: "9B5X...K7mQ",
      balance: 2.5,
      type: "solana",
      status: "active",
    },
    {
      id: "zec_001",
      name: "Zcash Wallet",
      address: "t1SkC...DQmL",
      balance: 15.3,
      type: "zcash",
      status: "active",
    },
  ]

  const seedPhrase = "abandon ability able about above absent absorb abstract abundance access accident account"

  const handleCopy = () => {
    navigator.clipboard.writeText(seedPhrase)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Wallet & Account Settings</h1>
        <p className="text-muted-foreground">Manage your wallets and account security</p>
      </div>

      {/* Account Overview */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Account Status</div>
            <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Verified</Badge>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Security Level</div>
            <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400">High</Badge>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Total Balance</div>
            <div className="text-2xl font-bold">$18,456.50</div>
          </div>
        </div>
      </Card>

      {/* Connected Wallets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Connected Wallets</h2>
          <Button className="gap-2">
            <Plus size={18} />
            Add Wallet
          </Button>
        </div>

        <div className="space-y-3">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Wallet className="text-secondary" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{wallet.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">{wallet.address}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {wallet.type.toUpperCase()}
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 text-xs">
                        {wallet.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{wallet.balance}</div>
                  <p className="text-xs text-muted-foreground">{wallet.type.toUpperCase()}</p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Copy size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Security Settings</h2>

        {/* Seed Phrase */}
        <Card className="p-6 border-amber-500/20 bg-amber-500/5 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <Lock className="text-amber-600 mt-1" size={24} />
              <div>
                <h3 className="font-semibold">Backup Seed Phrase</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Keep this phrase safe. Anyone with this phrase can access your wallet.
                </p>
              </div>
            </div>
          </div>

          <Card className="p-4 bg-background mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground">12-WORD PHRASE</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                className="h-6 w-6"
              >
                {showSeedPhrase ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
            {showSeedPhrase ? (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {seedPhrase.split(" ").map((word, idx) => (
                  <div key={idx} className="p-2 bg-muted rounded text-sm font-mono">
                    <span className="text-xs text-muted-foreground">{idx + 1}. </span>
                    {word}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-muted rounded text-center">
                <p className="text-muted-foreground">Click the eye icon to reveal</p>
              </div>
            )}
          </Card>

          <Button onClick={handleCopy} className="gap-2">
            <Copy size={18} />
            {copied ? "Copied!" : "Copy Phrase"}
          </Button>
        </Card>

        {/* Two-Factor Authentication */}
        <Card className="p-6 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Enabled</Badge>
          </div>
        </Card>

        {/* Change Password */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" placeholder="••••••••" />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" placeholder="••••••••" />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" placeholder="••••••••" />
            </div>
            <Button>Update Password</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
