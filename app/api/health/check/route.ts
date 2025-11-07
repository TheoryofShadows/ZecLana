// Health check endpoint for monitoring
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check database connection
    const { data, error: dbError } = await supabase.from("profiles").select("count").limit(1)

    if (dbError) throw dbError

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    })
  } catch (error) {
    console.error("[v0] Health check failed:", error)
    return NextResponse.json({ status: "unhealthy", error: "Database connection failed" }, { status: 503 })
  }
}
