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
    const body = await request.json()
    const { walletType, walletAddress, publicKey } = body

    if (!walletType || !walletAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create wallet record
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .insert({
        user_id: user.id,
        wallet_type: walletType,
        wallet_address: walletAddress,
        public_key: publicKey,
        is_verified: false,
      })
      .select()
      .single()

    if (walletError) throw walletError

    // Log in audit trail
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "wallet_connected",
      resource_type: "wallet",
      resource_id: wallet.id,
      changes: { wallet_type: walletType },
    })

    return NextResponse.json(wallet, { status: 201 })
  } catch (error) {
    console.error("[v0] Wallet API error:", error)
    return NextResponse.json({ error: "Failed to connect wallet" }, { status: 500 })
  }
}
