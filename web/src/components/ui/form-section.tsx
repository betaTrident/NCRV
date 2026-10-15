import type { ReactNode } from "react"
import { cn } from "cn"

type FormSectionProps = { title: string; description?: string; children: ReactNode; className?: string }

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return <section className={cn("flex flex-col gap-4", className)}><header className="border-b border-[var(--vx-line)] pb-3"><h2 className="text-[length:var(--vx-type-title)] leading-[var(--vx-leading-tight)] font-semibold text-[var(--vx-ink)]">{title}</h2>{description ? <p className="mt-1 text-sm text-[var(--vx-muted)]">{description}</p> : null}</header>{children}</section>
}
