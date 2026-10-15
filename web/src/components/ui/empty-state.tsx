import type { ReactNode } from "react"
import { Surface } from "./surface"

type EmptyStateProps = { title: string; description: string; action?: ReactNode; className?: string }

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return <Surface className={className}><div className="flex flex-col items-start gap-3"><h2 className="text-[length:var(--vx-type-title)] leading-[var(--vx-leading-tight)] font-semibold text-[var(--vx-ink)]">{title}</h2><p className="max-w-prose text-sm text-[var(--vx-muted)]">{description}</p>{action ? <div className="pt-1">{action}</div> : null}</div></Surface>
}
