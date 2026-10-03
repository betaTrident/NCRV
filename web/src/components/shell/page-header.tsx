import * as React from "react"

type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  action?: React.ReactNode
}

/**
 * Eyebrow, one `h1`, one sentence, optional action. This is the single `h1`
 * for the page it appears on.
 */
function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="vx-page-enter flex flex-col gap-3 border-b border-[var(--vx-line)] pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-brand)] uppercase">
          {eyebrow}
        </p>
        <h1 className="text-[31px] leading-tight font-bold text-[var(--vx-ink)] sm:text-[32px]">
          {title}
        </h1>
        <p className="max-w-prose text-sm text-[var(--vx-muted)]">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}

export { PageHeader }
export type { PageHeaderProps }
