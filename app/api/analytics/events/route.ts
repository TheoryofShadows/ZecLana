// Analytics event tracking
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  try {
    const body = await request.json()
    const { event_type, event_data, page_url } = body

    // Log event to audit table
    if (user) {
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: event_type,
        resource_type: "analytics",
        changes: {
          event_data,
          page_url,
          timestamp: new Date().toISOString(),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Analytics error:", error)
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 })
  }
}
