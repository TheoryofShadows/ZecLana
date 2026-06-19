import { NextResponse } from "next/server"
import { getStatus, SwapApiError } from "@/lib/swap/oneclick"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const depositAddress = new URL(request.url).searchParams.get("depositAddress")
  if (!depositAddress) {
    return NextResponse.json({ error: "Missing depositAddress" }, { status: 400 })
  }

  try {
    const status = await getStatus(depositAddress)
    return NextResponse.json({ status })
  } catch (err) {
    const status = err instanceof SwapApiError ? err.status : 502
    const message = err instanceof Error ? err.message : "Failed to fetch status"
    return NextResponse.json({ error: message }, { status })
  }
}
