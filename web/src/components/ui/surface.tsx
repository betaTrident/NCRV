import type { ComponentProps } from "react"
import { cn } from "cn"

type SurfaceProps = ComponentProps<"section"> & { tone?: "default" | "inset" }

export function Surface({ tone = "default", className, ...props }: SurfaceProps) {
  return <section {...props} className={cn("rounded-[var(--vx-radius-panel)] border border-[var(--vx-line)] p-4 sm:p-6", tone === "default" ? "bg-[var(--vx-surface-raised)]" : "bg-[var(--vx-surface-inset)]", className)} />
}
