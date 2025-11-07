"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Shield, History, Wallet, Zap, LogOut, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Privacy Shield", icon: Shield },
    { href: "/dashboard/privacy-settings", label: "Privacy Settings", icon: Lock },
    { href: "/dashboard/transactions", label: "Transactions", icon: History },
    { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
    { href: "/dashboard/defi", label: "DeFi Opportunities", icon: Zap },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col w-64 bg-card border-r border-border transition-all duration-300 pt-4",
          !open && "w-20",
        )}
      >
        <div className="px-4 mb-8 flex items-center justify-between">
          {open && <h2 className="font-bold text-lg">Dashboard</h2>}
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(!open)} className="h-8 w-8">
            <ChevronLeft className={cn("transition-transform", !open && "rotate-180")} />
          </Button>
        </div>

        <nav className="flex-1 space-y-2 px-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant={pathname === href ? "default" : "ghost"}
                className={cn("w-full justify-start gap-3", !open && "px-2")}
              >
                <Icon size={20} />
                {open && <span>{label}</span>}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="px-2 py-4 border-t border-border">
          <Button variant="ghost" className={cn("w-full justify-start gap-3 text-destructive", !open && "px-2")}>
            <LogOut size={20} />
            {open && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {open && (
        <aside className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur">
          <div className="w-64 h-full bg-card border-r border-border flex flex-col pt-4">
            <div className="px-4 mb-8">
              <h2 className="font-bold text-lg">Dashboard</h2>
            </div>

            <nav className="flex-1 space-y-2 px-2">
              {links.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => onOpenChange(false)}>
                  <Button variant={pathname === href ? "default" : "ghost"} className="w-full justify-start gap-3">
                    <Icon size={20} />
                    <span>{label}</span>
                  </Button>
                </Link>
              ))}
            </nav>

            <div className="px-2 py-4 border-t border-border">
              <Button variant="ghost" className="w-full justify-start gap-3 text-destructive">
                <LogOut size={20} />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </aside>
      )}
    </>
  )
}
