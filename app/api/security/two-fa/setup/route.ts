// Two-factor authentication setup
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { twoFaMethod } = await request.json()

    if (!["email", "sms", "authenticator"].includes(twoFaMethod)) {
      return NextResponse.json({ error: "Invalid 2FA method" }, { status: 400 })
    }

    // Update profile with 2FA method
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        two_fa_enabled: true,
        two_fa_method: twoFaMethod,
      })
      .eq("id", user.id)

    if (updateError) throw updateError

    // Log security event
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "two_fa_enabled",
      resource_type: "security",
      changes: { method: twoFaMethod },
    })

    return NextResponse.json({
      success: true,
      message: `Two-factor authentication via ${twoFaMethod} has been enabled`,
    })
  } catch (error) {
    console.error("[v0] 2FA setup error:", error)
    return NextResponse.json({ error: "2FA setup failed" }, { status: 500 })
  }
}
