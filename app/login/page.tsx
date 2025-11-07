import { LoginForm } from "@/components/auth/login-form"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to access your privacy vault</p>
          </div>
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
