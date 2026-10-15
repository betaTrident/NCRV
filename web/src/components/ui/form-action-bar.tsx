import type { ReactNode } from "react"
import { cn } from "cn"

type FormActionBarProps = { children: ReactNode; className?: string }

export function FormActionBar({ children, className }: FormActionBarProps) {
  return <div className={cn("flex flex-wrap items-center gap-3 border-t border-[var(--vx-line)] pt-4", className)}>{children}</div>
}
