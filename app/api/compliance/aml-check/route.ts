// AML (Anti-Money Laundering) check endpoint
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

const SANCTIONS_WATCHLIST_API = "https://api.ofac-checker.com/v1/check"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { transaction_amount, recipient_country } = body

    // Check transaction patterns WITHOUT requiring identity
    const { data: recentTransactions } = await supabase
      .from("remittances")
      .select("amount, created_at")
      .eq("sender_id", user.id)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(10)

    const suspiciousPatterns = detectSuspiciousActivity([
      ...(recentTransactions || []),
      { amount: transaction_amount, created_at: new Date().toISOString() },
    ])

    // If high-risk patterns detected, create audit log (still anonymous)
    if (suspiciousPatterns.length > 0) {
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "suspicious_pattern_detected",
        description: suspiciousPatterns.join("; "),
        status: "flagged_anonymous",
      })
    }

    return NextResponse.json({
      aml_pass: true, // Allow transaction - no KYC = no blocking
      suspicious_patterns: suspiciousPatterns,
      note: "User remains fully anonymous. Behavioral monitoring active.",
    })
  } catch (error) {
    console.error("[v0] AML check error:", error)
    return NextResponse.json({ error: "AML check failed" }, { status: 500 })
  }
}

function detectSuspiciousActivity(transactions: any[]) {
  const patterns = []

  // Only flag extreme behavioral anomalies (not blocking)
  if (transactions.length > 20 && transactions.length < 60 * 60 * 1000) {
    patterns.push("High transaction frequency noted")
  }

  const total = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
  if (total > 1000000) {
    patterns.push("High volume detected")
  }

  return patterns
}
