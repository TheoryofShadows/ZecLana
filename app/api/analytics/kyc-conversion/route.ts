// Analytics for KYC conversion rates
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  try {
    // Get KYC completion rates
    const { data: profiles } = await supabase.from("profiles").select("kyc_status").limit(1000)

    const stats = {
      total_users: profiles?.length || 0,
      kyc_pending: profiles?.filter((p) => p.kyc_status === "pending").length || 0,
      kyc_verified: profiles?.filter((p) => p.kyc_status === "verified").length || 0,
      kyc_rejected: profiles?.filter((p) => p.kyc_status === "rejected").length || 0,
      conversion_rate: profiles
        ? ((profiles.filter((p) => p.kyc_status === "verified").length / profiles.length) * 100).toFixed(2)
        : 0,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
