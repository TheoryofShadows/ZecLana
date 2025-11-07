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
    const { recipientEmail, amount, currencySent, currencyReceived, sourceWalletId, destinationType, bankDetails } =
      body

    // Validate input
    if (!recipientEmail || !amount || !currencySent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if sender has verified wallets
    const { data: wallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("id", sourceWalletId)
      .eq("user_id", user.id)
      .single()

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found or not authorized" }, { status: 404 })
    }

    // Create remittance record
    const { data: remittance, error: remittanceError } = await supabase
      .from("remittances")
      .insert({
        sender_id: user.id,
        recipient_email: recipientEmail,
        amount_sent: amount,
        currency_sent: currencySent,
        currency_received: currencyReceived,
        source_wallet_id: sourceWalletId,
        destination_type: destinationType,
        bank_details: bankDetails,
        status: "pending",
        fee_amount: amount * 0.002, // 0.2% fee
      })
      .select()
      .single()

    if (remittanceError) throw remittanceError

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "remittance_initiated",
      resource_type: "remittance",
      resource_id: remittance.id,
      changes: { amount, recipient: recipientEmail },
    })

    return NextResponse.json(remittance, { status: 201 })
  } catch (error) {
    console.error("[v0] Remittance API error:", error)
    return NextResponse.json({ error: "Failed to process remittance" }, { status: 500 })
  }
}
