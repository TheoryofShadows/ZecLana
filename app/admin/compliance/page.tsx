// Admin compliance dashboard
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Lock } from "lucide-react"

export default function PrivacyMonitoringDashboard() {
  const supabase = createClient()
  const [alerts, setAlerts] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Check if user is admin
      const { data: adminUser } = await supabase.from("admin_users").select("role").eq("id", user?.id).single()

      if (!adminUser) {
        window.location.href = "/dashboard"
        return
      }

      // Get privacy alerts
      const { data: privacyAlerts } = await supabase
        .from("privacy_alerts")
        .select("description")
        .order("created_at", { ascending: false })
        .limit(100)

      setAlerts(privacyAlerts || [])

      // Get system stats
      const { data: systemStats } = await supabase
        .from("system_stats")
        .select("total_transactions, anonymous_count")
        .single()

      setStats(systemStats || {})
    } catch (error) {
      console.error("[v0] Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Privacy Monitoring Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor system health and privacy preservation (no user identity data collected)
        </p>
      </div>

      <Alert className="border-emerald-200 bg-emerald-50">
        <Lock className="h-4 w-4 text-emerald-600" />
        <AlertDescription className="text-emerald-800">
          Zolana operates with zero identity data collection. All monitoring is based on behavioral patterns only.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total_transactions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Privacy Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{alerts?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Anonymous Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">{stats?.anonymous_count || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Behavioral Flags
          </CardTitle>
          <CardDescription>Transaction patterns that warrant monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts?.map((alert) => (
              <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{alert.description}</p>
                  <p className="text-sm text-muted-foreground mt-1">User remains fully anonymous</p>
                </div>
                <Badge variant="outline">Pattern Flagged</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
