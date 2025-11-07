// Stripe webhook for payment confirmations
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error("[v0] Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case "charge.succeeded": {
        const charge = event.data.object as Stripe.Charge
        const remittanceId = charge.metadata?.remittance_id

        if (remittanceId) {
          // Update remittance status to processing
          await supabase.from("remittances").update({ status: "processing" }).eq("id", remittanceId)

          // Log in transaction history
          const { data: remittance } = await supabase
            .from("remittances")
            .select("sender_id")
            .eq("id", remittanceId)
            .single()

          if (remittance) {
            await supabase.from("transactions").insert({
              user_id: remittance.sender_id,
              transaction_type: "payment",
              amount: charge.amount / 100,
              currency: charge.currency.toUpperCase(),
              status: "completed",
              blockchain_hash: charge.id,
              description: `Stripe payment for remittance ${remittanceId}`,
            })
          }
        }
        break
      }

      case "charge.failed": {
        const charge = event.data.object as Stripe.Charge
        const remittanceId = charge.metadata?.remittance_id

        if (remittanceId) {
          await supabase.from("remittances").update({ status: "failed" }).eq("id", remittanceId)

          // Create compliance alert
          const { data: remittance } = await supabase
            .from("remittances")
            .select("sender_id")
            .eq("id", remittanceId)
            .single()

          if (remittance) {
            await supabase.from("compliance_alerts").insert({
              user_id: remittance.sender_id,
              alert_type: "payment_failed",
              severity: "medium",
              description: `Payment failed: ${charge.failure_message}`,
            })
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
