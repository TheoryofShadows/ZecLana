"use client"

import type { PrivacyAssessment } from "@/lib/swap/privacy"
import { ShieldCheck, ShieldAlert, ShieldQuestion, Check, AlertTriangle, ExternalLink } from "lucide-react"

const STYLES = {
  high: {
    bar: "bg-secondary",
    text: "text-secondary",
    ring: "border-secondary/30 bg-secondary/5",
    Icon: ShieldCheck,
    label: "Strong privacy",
  },
  medium: {
    bar: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-500",
    ring: "border-amber-500/30 bg-amber-500/5",
    Icon: ShieldQuestion,
    label: "Partial privacy",
  },
  low: {
    bar: "bg-destructive",
    text: "text-destructive",
    ring: "border-destructive/30 bg-destructive/5",
    Icon: ShieldAlert,
    label: "Privacy leak risk",
  },
} as const

export function PrivacyMeter({ assessment }: { assessment: PrivacyAssessment }) {
  const s = STYLES[assessment.level]
  const Icon = s.Icon
  const showShieldHandoff = assessment.warnings.some((w) => w.includes("transparent"))

  return (
    <div className={`mt-4 rounded-xl border p-3 ${s.ring}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className={`flex items-center gap-1.5 text-sm font-semibold ${s.text}`}>
          <Icon size={16} /> {s.label}
        </span>
        <span className="text-xs text-muted-foreground">Privacy {assessment.score}/100</span>
      </div>

      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all ${s.bar}`} style={{ width: `${assessment.score}%` }} />
      </div>

      <ul className="space-y-1.5 text-xs">
        {assessment.warnings.map((w) => (
          <li key={w} className="flex items-start gap-1.5 text-muted-foreground">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-500" />
            <span>{w}</span>
          </li>
        ))}
        {assessment.good.map((g) => (
          <li key={g} className="flex items-start gap-1.5 text-muted-foreground">
            <Check size={13} className="mt-0.5 shrink-0 text-secondary" />
            <span>{g}</span>
          </li>
        ))}
      </ul>

      {showShieldHandoff && (
        <a
          href="https://z.cash"
          target="_blank"
          rel="noreferrer"
          className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Use a shielded Zcash address <ExternalLink size={12} />
        </a>
      )}
    </div>
  )
}
