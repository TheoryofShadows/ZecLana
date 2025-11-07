import { SignupForm } from "@/components/auth/signup-form"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Send Privately</h1>
            <p className="text-muted-foreground">Create your PrivacyShield account in 2 minutes</p>
          </div>
          <SignupForm />
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
