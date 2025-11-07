"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, AlertCircle, Star, ArrowRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function DeFiOpportunitiesDashboard() {
  const opportunities = [
    {
      id: 1,
      name: "Solana Yield Farming",
      platform: "Raydium",
      apy: 45.2,
      risk: "Medium",
      tvl: "$250M",
      description: "Liquidity provider rewards on SOL-USDC pair",
      stars: 4.5,
    },
    {
      id: 2,
      name: "Zcash Staking",
      platform: "ZCash Foundation",
      apy: 12.5,
      risk: "Low",
      tvl: "$500M",
      description: "Earn rewards by staking ZEC tokens",
      stars: 4.8,
    },
    {
      id: 3,
      name: "Wrapped SOL Lending",
      platform: "Anchor Protocol",
      apy: 8.3,
      risk: "Low",
      tvl: "$1.2B",
      description: "Lend wSOL and earn stable yield",
      stars: 4.6,
    },
    {
      id: 4,
      name: "Multi-Chain Bridge Rewards",
      platform: "Wormhole",
      apy: 25.0,
      risk: "High",
      tvl: "$150M",
      description: "Liquidity provision on cross-chain bridges",
      stars: 4.2,
    },
  ]

  const userPortfolio = [
    { name: "Solana Yield Farming", allocation: 40, value: 8000 },
    { name: "Zcash Staking", allocation: 35, value: 7000 },
    { name: "Wrapped SOL Lending", allocation: 25, value: 5000 },
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "Medium":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      case "High":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">DeFi Opportunities</h1>
        <p className="text-muted-foreground">Grow your wealth with vetted DeFi protocols</p>
      </div>

      {/* Portfolio Summary */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Total Invested</div>
            <div className="text-3xl font-bold">$20,000</div>
            <div className="text-xs text-muted-foreground mt-2">Across 3 opportunities</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Average APY</div>
            <div className="text-3xl font-bold text-secondary">22.0%</div>
            <div className="text-xs text-muted-foreground mt-2">Weighted average</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Estimated Annual Yield</div>
            <div className="text-3xl font-bold text-green-600">$4,400</div>
            <div className="text-xs text-muted-foreground mt-2">Based on current APY</div>
          </div>
        </div>
      </Card>

      {/* Risk Warning */}
      <Card className="p-4 border-red-500/20 bg-red-500/5 flex gap-3">
        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-semibold text-sm mb-1">DeFi Risk Disclosure</p>
          <p className="text-sm text-muted-foreground">
            DeFi protocols carry significant risks including smart contract vulnerabilities, market volatility, and
            impermanent loss. Only invest amounts you can afford to lose.
          </p>
        </div>
      </Card>

      {/* Your Portfolio */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Active Investments</h2>
        <Card className="p-6">
          <div className="space-y-6">
            {userPortfolio.map((investment) => (
              <div key={investment.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{investment.name}</span>
                  <span className="font-semibold">${investment.value.toLocaleString()}</span>
                </div>
                <Progress value={investment.allocation} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">{investment.allocation}% allocation</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Available Opportunities */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Featured Opportunities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
            <Card key={opp.id} className="p-5 hover:border-secondary/50 transition flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{opp.name}</h3>
                  <p className="text-xs text-muted-foreground">{opp.platform}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-yellow-500 text-yellow-500" />
                  <span className="text-xs font-semibold">{opp.stars}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 flex-1">{opp.description}</p>

              <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-border">
                <div>
                  <div className="text-xs text-muted-foreground">APY</div>
                  <div className="text-lg font-bold text-secondary">{opp.apy}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Risk</div>
                  <Badge className={getRiskColor(opp.risk)} variant="outline">
                    {opp.risk}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">TVL</div>
                  <div className="text-sm font-semibold">{opp.tvl}</div>
                </div>
              </div>

              <Button className="w-full gap-2">
                <TrendingUp size={18} />
                Invest Now
                <ArrowRight size={16} />
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Educational Resources */}
      <Card className="p-6 bg-secondary/5 border-secondary/20">
        <h3 className="font-semibold mb-3">Learning Resources</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>• Yield Farming 101:</strong> Learn how to maximize returns while managing risk
          </p>
          <p>
            <strong>• Staking Guide:</strong> Understand different staking mechanisms and rewards
          </p>
          <p>
            <strong>• Smart Contract Audits:</strong> Review security audits for each protocol
          </p>
          <Button variant="link" className="p-0 mt-2">
            View All Resources →
          </Button>
        </div>
      </Card>
    </div>
  )
}
