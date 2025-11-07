import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PrivacyShieldDashboard } from "@/components/dashboard/privacy-shield-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile and check KYC status
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/callback")
  }

  return <PrivacyShieldDashboard profile={profile} />
}
