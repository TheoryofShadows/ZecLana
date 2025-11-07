"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, Eye, Lock, Zap, AlertCircle, CheckCircle } from "lucide-react"

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
      title: "Data Minimization",
      description: "We collect only essential information for compliance",
      status: "active",
      icon: Eye,
    },
  ]

  const securityMetrics = [
    { label: "Transaction Security", value: 100 },
    { label: "Data Encryption", value: 100 },
    { label: "Blockchain Privacy", value: 95 },
    { label: "Compliance Status", value: 98 },
  ]

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Privacy Shield Dashboard</h1>
        <p className="text-muted-foreground">Monitor your privacy features and security status</p>
      </div>

      {/* Security Overview */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="text-primary" size={28} />
              Overall Security Score
            </h2>
            <p className="text-muted-foreground mt-1">Your account protection level</p>
          </div>
          <Badge className="bg-secondary text-secondary-foreground">98/100</Badge>
        </div>
        <Progress value={98} className="h-3" />
        <p className="text-sm text-muted-foreground mt-3">Excellent security standing</p>
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
        <h2 className="text-2xl font-bold mb-4">Security Metrics</h2>
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

      {/* Privacy Tips */}
      <Card className="p-6 border-amber-500/20 bg-amber-500/5">
        <div className="flex gap-4">
          <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-semibold mb-2">Privacy Best Practices</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Enable two-factor authentication for added security</li>
              <li>• Keep your seed phrase in a safe place</li>
              <li>• Always verify recipient addresses before sending</li>
              <li>• Use shielded transactions for maximum privacy</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
