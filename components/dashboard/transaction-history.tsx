"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Filter, Search } from "lucide-react"
import { useState } from "react"

export function TransactionHistory() {
  const [searchQuery, setSearchQuery] = useState("")

  const transactions = [
    {
      id: "TXN001",
      recipient: "John Doe",
      country: "Philippines",
      amount: 500,
      currency: "USD",
      receiveAmount: 26500,
      status: "completed",
      date: "2024-11-05",
      time: "2:30 PM",
      type: "sent",
    },
    {
      id: "TXN002",
      recipient: "Maria Santos",
      country: "Mexico",
      amount: 250,
      currency: "USD",
      receiveAmount: 4500,
      status: "completed",
      date: "2024-11-04",
      time: "10:15 AM",
      type: "sent",
    },
    {
      id: "TXN003",
      recipient: "Ahmed Hassan",
      country: "Egypt",
      amount: 1000,
      currency: "USD",
      receiveAmount: 15600,
      status: "processing",
      date: "2024-11-03",
      time: "5:45 PM",
      type: "sent",
    },
    {
      id: "TXN004",
      recipient: "Priya Sharma",
      country: "India",
      amount: 150,
      currency: "USD",
      receiveAmount: 12450,
      status: "completed",
      date: "2024-11-02",
      time: "11:20 AM",
      type: "sent",
    },
    {
      id: "TXN005",
      recipient: "Carlos Rodriguez",
      country: "Brazil",
      amount: 750,
      currency: "USD",
      receiveAmount: 3850,
      status: "completed",
      date: "2024-11-01",
      time: "3:00 PM",
      type: "sent",
    },
  ]

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "processing":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "failed":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Transaction History</h1>
        <p className="text-muted-foreground">View and track all your remittances</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">Total Sent</div>
          <div className="text-3xl font-bold">$2,650</div>
          <div className="text-xs text-muted-foreground mt-2">5 transactions</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">Average Amount</div>
          <div className="text-3xl font-bold">$530</div>
          <div className="text-xs text-muted-foreground mt-2">Per transaction</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">Success Rate</div>
          <div className="text-3xl font-bold">100%</div>
          <div className="text-xs text-muted-foreground mt-2">All completed</div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search by recipient name, country, or transaction ID..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Filter size={18} />
          Filter
        </Button>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download size={18} />
          Export
        </Button>
      </Card>

      {/* Transaction List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-semibold">Transaction ID</th>
                <th className="text-left p-4 font-semibold">Recipient</th>
                <th className="text-left p-4 font-semibold">Country</th>
                <th className="text-right p-4 font-semibold">Amount</th>
                <th className="text-right p-4 font-semibold">Received</th>
                <th className="text-center p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-border hover:bg-muted/50 transition">
                  <td className="p-4 font-mono text-sm">{tx.id}</td>
                  <td className="p-4 font-medium">{tx.recipient}</td>
                  <td className="p-4">{tx.country}</td>
                  <td className="p-4 text-right font-semibold">${tx.amount.toLocaleString()}</td>
                  <td className="p-4 text-right text-secondary font-semibold">
                    {tx.currency === "USD" ? "₦" : "₨"} {tx.receiveAmount.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <Badge className={getStatusColor(tx.status)}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {tx.date} <br /> {tx.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredTransactions.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No transactions found matching your search.</p>
        </Card>
      )}
    </div>
  )
}
