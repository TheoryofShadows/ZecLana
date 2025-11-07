// KYC verification page
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { KYCForm } from "@/components/kyc/kyc-form"

export default async function KYCPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Identity Verification (KYC)</h1>
        <p className="text-muted-foreground">Complete verification to unlock full remittance capabilities</p>
      </div>

      {profile?.kyc_status === "verified" ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-900 mb-2">Verified</h2>
          <p className="text-green-800">Your identity has been verified. You can now send and receive remittances.</p>
        </div>
      ) : (
        <KYCForm profile={profile} />
      )}
    </div>
  )
}
