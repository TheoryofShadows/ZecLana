"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navigation />
      <div className="flex pt-16">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
