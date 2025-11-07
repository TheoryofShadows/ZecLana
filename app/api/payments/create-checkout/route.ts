// Create Stripe checkout session
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { remittanceId, amount, currency } = await request.json()

    // Verify remittance belongs to user
    const { data: remittance } = await supabase
      .from("remittances")
      .select("*")
      .eq("id", remittanceId)
      .eq("sender_id", user.id)
      .single()

    if (!remittance) {
      return NextResponse.json({ error: "Remittance not found" }, { status: 404 })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Remittance to ${remittance.recipient_email}`,
              description: `Send ${remittance.amount_sent} ${remittance.currency_sent}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || "http://localhost:3000"}/dashboard/transactions?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || "http://localhost:3000"}/send?id=${remittanceId}`,
      customer_email: user.email,
      metadata: {
        remittance_id: remittanceId,
        user_id: user.id,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("[v0] Checkout creation error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
