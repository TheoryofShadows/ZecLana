// GDPR data export endpoint
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Collect all user data
    const [profileRes, walletsRes, remittancesRes, transactionsRes, auditRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("wallets").select("*").eq("user_id", user.id),
      supabase.from("remittances").select("*").eq("sender_id", user.id),
      supabase.from("transactions").select("*").eq("user_id", user.id),
      supabase.from("audit_logs").select("*").eq("user_id", user.id),
    ])

    const userData = {
      profile: profileRes.data,
      wallets: walletsRes.data,
      remittances: remittancesRes.data,
      transactions: transactionsRes.data,
      audit_logs: auditRes.data,
      export_date: new Date().toISOString(),
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("[v0] Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
