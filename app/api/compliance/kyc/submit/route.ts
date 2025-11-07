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
    const formData = await request.formData()
    const documentType = formData.get("documentType") as string
    const file = formData.get("file") as File

    if (!documentType || !file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Upload file to Supabase Storage
    const fileName = `${user.id}/${documentType}-${Date.now()}`
    const { data: uploadData, error: uploadError } = await supabase.storage.from("kyc-documents").upload(fileName, file)

    if (uploadError) throw uploadError

    // Create KYC document record
    const { data: kycDoc, error: kycError } = await supabase
      .from("kyc_documents")
      .insert({
        user_id: user.id,
        document_type: documentType,
        document_url: uploadData.path,
        verification_status: "pending",
      })
      .select()
      .single()

    if (kycError) throw kycError

    // Create compliance alert for review
    await supabase.from("compliance_alerts").insert({
      user_id: user.id,
      alert_type: "kyc_submitted",
      severity: "low",
      description: `KYC document submitted: ${documentType}`,
    })

    // Update profile KYC status
    await supabase.from("profiles").update({ kyc_status: "pending" }).eq("id", user.id)

    return NextResponse.json(kycDoc, { status: 201 })
  } catch (error) {
    console.error("[v0] KYC API error:", error)
    return NextResponse.json({ error: "Failed to submit KYC document" }, { status: 500 })
  }
}
