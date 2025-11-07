import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AuthCallbackPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Confirming your email...</h1>
        <p className="text-muted-foreground mt-2">Please wait while we set up your account.</p>
      </div>
    </div>
  )
}
