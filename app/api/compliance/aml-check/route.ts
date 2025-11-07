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
    const { firstName, lastName, country } = body

    // Get user profile for compliance check
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Check sanctions lists (mock implementation - integrate with real API)
    const sanctions_risk = await checkSanctionsLists(firstName, lastName, country)

    // Check transaction patterns
    const { data: recentTransactions } = await supabase
      .from("transactions")
      .select("amount, created_at")
      .eq("user_id", user.id)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(10)

    const suspiciousPatterns = detectSuspiciousActivity(recentTransactions || [])

    // Create alert if risks detected
    if (sanctions_risk.is_match || suspiciousPatterns.length > 0) {
      await supabase.from("compliance_alerts").insert({
        user_id: user.id,
        alert_type: sanctions_risk.is_match ? "sanctions_match" : "suspicious_activity",
        severity: sanctions_risk.is_match ? "critical" : "medium",
        description: sanctions_risk.is_match
          ? `Sanctions watchlist match: ${sanctions_risk.reason}`
          : `Suspicious activity detected: ${suspiciousPatterns.join(", ")}`,
      })
    }

    return NextResponse.json({
      aml_pass: !sanctions_risk.is_match && suspiciousPatterns.length === 0,
      sanctions_risk,
      suspicious_patterns: suspiciousPatterns,
    })
  } catch (error) {
    console.error("[v0] AML check error:", error)
    return NextResponse.json({ error: "AML check failed" }, { status: 500 })
  }
}

async function checkSanctionsLists(firstName: string, lastName: string, country: string) {
  // Mock implementation - in production, call actual OFAC or sanctions API
  const mockWatchlist = ["bin laden", "terrorist", "sanctions"]
  const fullName = `${firstName} ${lastName}`.toLowerCase()

  for (const term of mockWatchlist) {
    if (fullName.includes(term)) {
      return { is_match: true, reason: "Name matches sanctions watchlist" }
    }
  }

  return { is_match: false, reason: null }
}

function detectSuspiciousActivity(transactions: any[]) {
  const patterns = []

  if (transactions.length === 0) return patterns

  // Check for high transaction frequency
  if (transactions.length > 5) {
    patterns.push("High transaction frequency")
  }

  // Check for large amounts
  const largeTransactions = transactions.filter((t) => t.amount > 50000)
  if (largeTransactions.length > 0) {
    patterns.push("Large transaction detected")
  }

  // Check for rapid succession
  if (transactions.length >= 3) {
    const timeDiff = new Date(transactions[0].created_at).getTime() - new Date(transactions[2].created_at).getTime()
    if (timeDiff < 3600000) {
      // Within 1 hour
      patterns.push("Rapid transaction succession")
    }
  }

  return patterns
}
