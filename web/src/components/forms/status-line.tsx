import type { ReactNode } from "react"
import { CircleCheck, CircleX, Clock, TriangleAlert } from "lucide-react"
import { cn } from "cn"

type StatusLineTone = "estimate" | "pending" | "saved" | "error"

type StatusLineProps = {
  tone: StatusLineTone
  children: ReactNode
}

const TONE_COPY: Record<StatusLineTone, string> = {
  estimate: "ESTIMATE ONLY",
  pending: "Saving",
  saved: "Saved privately",
  error: "Could not save",
}

const TONE_ICON = {
  estimate: TriangleAlert,
  pending: Clock,
  saved: CircleCheck,
  error: CircleX,
} as const

const TONE_CLASS: Record<StatusLineTone, string> = {
  estimate: "bg-[var(--vx-amber-bg)] text-[var(--vx-amber)]",
  pending: "bg-[var(--vx-surface-soft)] text-[var(--vx-muted)]",
  saved: "bg-[var(--vx-success-bg)] text-[var(--vx-success)]",
  error: "bg-[var(--vx-rose-bg)] text-[var(--vx-rose)]",
}

/**
 * Status words plus an icon. Color never carries the meaning alone.
 */
function StatusLine({ tone, children }: StatusLineProps) {
  const Icon = TONE_ICON[tone]
  const words = TONE_COPY[tone]

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-[var(--vx-radius-control)] px-3 py-2 text-sm font-medium",
        TONE_CLASS[tone],
      )}
    >
      <Icon size={16} aria-hidden="true" />
      <span>{words}</span>
      {children}
    </p>
  )
}

export { StatusLine }
export type { StatusLineProps, StatusLineTone }
