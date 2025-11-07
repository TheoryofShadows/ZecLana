import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const remittanceId = request.nextUrl.searchParams.get("id")
  if (!remittanceId) {
    return NextResponse.json({ error: "Missing remittance ID" }, { status: 400 })
  }

  try {
    const { data: remittance } = await supabase
      .from("remittances")
      .select("*")
      .eq("id", remittanceId)
      .eq("sender_id", user.id)
      .single()

    if (!remittance) {
      return NextResponse.json({ error: "Remittance not found" }, { status: 404 })
    }

    return NextResponse.json(remittance)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch remittance status" }, { status: 500 })
  }
}
