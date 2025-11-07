"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, Lock, Zap, AlertCircle, CheckCircle, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function PrivacyShieldDashboard() {
  const privacyFeatures = [
    {
      title: "End-to-End Encryption",
      description: "All transactions encrypted with military-grade AES-256",
      status: "active",
      icon: Lock,
    },
    {
      title: "Zcash Integration",
      description: "Completely shielded transactions with zero-knowledge proofs",
      status: "active",
      icon: Shield,
    },
    {
      title: "Privacy Mixing",
      description: "Transaction amounts hidden from the blockchain",
      status: "active",
      icon: Zap,
    },
    {
      title: "Zero KYC",
      description: "Send money without revealing your identity",
      status: "active",
      icon: EyeOff,
    },
  ]

  const securityMetrics = [
    { label: "Transaction Privacy", value: 100 },
    { label: "Data Encryption", value: 100 },
    { label: "Blockchain Shielding", value: 100 },
    { label: "Anonymity Level", value: 100 },
  ]

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Privacy Shield Dashboard</h1>
        <p className="text-muted-foreground">100% private. No identity required. Ever.</p>
      </div>

      <Alert className="border-teal-200 bg-teal-50">
        <Shield className="h-4 w-4 text-teal-600" />
        <AlertDescription className="text-teal-800">
          Zolana is 100% anonymous. Your transactions, sender, receiver, and amounts are completely hidden using Zcash's
          zk-SNARKs. No identity verification required.
        </AlertDescription>
      </Alert>

      {/* Security Overview */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="text-primary" size={28} />
              Privacy Score
            </h2>
            <p className="text-muted-foreground mt-1">Your anonymity protection level</p>
          </div>
          <Badge className="bg-secondary text-secondary-foreground">100/100</Badge>
        </div>
        <Progress value={100} className="h-3" />
        <p className="text-sm text-muted-foreground mt-3">Maximum privacy achieved</p>
      </Card>

      {/* Privacy Features */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Active Privacy Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {privacyFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="p-5 hover:border-secondary/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <Icon className="text-secondary" size={24} />
                  {feature.status === "active" && <CheckCircle className="text-green-500" size={20} />}
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Security Metrics */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Privacy Metrics</h2>
        <Card className="p-6">
          <div className="space-y-6">
            {securityMetrics.map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{metric.label}</span>
                  <span className="text-secondary font-semibold">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 border-emerald-500/20 bg-emerald-500/5">
        <div className="flex gap-4">
          <AlertCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-semibold mb-2">Privacy Best Practices</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Enable two-factor authentication for account security</li>
              <li>• Keep your seed phrase in a safe place</li>
              <li>• Always verify recipient wallet addresses</li>
              <li>• Use shielded transactions for maximum privacy</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
