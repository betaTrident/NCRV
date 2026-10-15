import type { ReactNode } from "react"
import { cn } from "cn"

type NoticeProps = { tone?: "info" | "success" | "warning" | "error"; title?: string; children: ReactNode; className?: string }
const toneClass = { info: "border-[var(--vx-brand)] bg-[var(--vx-brand-tint)]", success: "border-[var(--vx-success)] bg-[var(--vx-success-bg)]", warning: "border-[var(--vx-amber)] bg-[var(--vx-amber-bg)]", error: "border-[var(--vx-rose)] bg-[var(--vx-rose-bg)]" } as const

export function Notice({ tone = "info", title, children, className }: NoticeProps) {
  return <div role={tone === "error" ? "alert" : "status"} className={cn("rounded-[var(--vx-radius-control)] border p-3 text-sm text-[var(--vx-ink)]", toneClass[tone], className)}>{title ? <p className="font-semibold">{title}</p> : null}<div className={title ? "mt-1" : undefined}>{children}</div></div>
}
