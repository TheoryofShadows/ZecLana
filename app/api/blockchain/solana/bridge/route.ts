// Solana bridge endpoint for ZEC to SOL transfers
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
    const { amount, sourceChain, destinationChain, destinationAddress } = body

    if (!amount || !sourceChain || !destinationChain) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Verify user has active wallet on source chain
    const { data: sourceWallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .eq("wallet_type", sourceChain)
      .eq("is_verified", true)
      .single()

    if (!sourceWallet) {
      return NextResponse.json({ error: `No verified ${sourceChain} wallet found` }, { status: 404 })
    }

    // Create bridge transaction record
    const { data: bridgeTransaction, error: bridgeError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        transaction_type: "bridge",
        amount,
        currency: sourceChain === "zcash" ? "ZEC" : sourceChain.toUpperCase(),
        from_wallet: sourceWallet.wallet_address,
        to_wallet: destinationAddress,
        status: "pending",
        description: `Bridge ${amount} from ${sourceChain} to ${destinationChain}`,
        metadata: {
          source_chain: sourceChain,
          destination_chain: destinationChain,
          bridge_type: "zolana",
        },
      })
      .select()
      .single()

    if (bridgeError) throw bridgeError

    // In production, call actual bridge contract or service
    // For now, return transaction ID
    return NextResponse.json({
      transaction_id: bridgeTransaction.id,
      status: "pending",
      message: "Bridge transaction initiated. Waiting for blockchain confirmation.",
    })
  } catch (error) {
    console.error("[v0] Bridge error:", error)
    return NextResponse.json({ error: "Bridge transaction failed" }, { status: 500 })
  }
}
