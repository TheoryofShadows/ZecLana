"use client"

import { Navigation } from "@/components/navigation"
import { SendRemittanceForm } from "@/components/send/send-remittance-form"

export default function SendPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
        <SendRemittanceForm />
      </div>
    </main>
  )
}
