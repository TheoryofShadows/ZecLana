// Admin compliance dashboard
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function ComplianceDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: adminUser } = await supabase.from("admin_users").select("role").eq("id", user.id).single()

  if (!adminUser) {
    redirect("/dashboard")
  }

  // Get compliance alerts
  const { data: alerts } = await supabase
    .from("compliance_alerts")
    .select("*, profiles(email, first_name, last_name)")
    .order("created_at", { ascending: false })
    .limit(100)

  // Get KYC documents pending review
  const { data: pendingKYC } = await supabase
    .from("kyc_documents")
    .select("*, profiles(email)")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Compliance Dashboard</h1>
        <p className="text-muted-foreground">Monitor AML alerts and pending KYC documents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Open Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {alerts?.filter((a) => a.resolution_status === "open").length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingKYC?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {alerts?.filter((a) => a.severity === "critical").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Alerts</CardTitle>
          <CardDescription>Recent AML and suspicious activity alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts?.map((alert) => (
              <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{alert.description}</p>
                  <p className="text-sm text-muted-foreground mt-1">User: {alert.profiles?.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant={
                      alert.severity === "critical"
                        ? "destructive"
                        : alert.severity === "high"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {alert.severity}
                  </Badge>
                  <Badge variant={alert.resolution_status === "open" ? "outline" : "secondary"}>
                    {alert.resolution_status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
