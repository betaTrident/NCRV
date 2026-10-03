import * as React from "react"
import { Wordmark } from "@/components/shell/wordmark"

type AuthSplitProps = {
  title: string
  description: string
  children: React.ReactNode
}

/**
 * Deep-purple story column, form column, stacked on small screens. The
 * story column carries the brand voice; `children` is the form column and
 * owns the page's single `h1`.
 */
function AuthSplit({ title, description, children }: AuthSplitProps) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <div className="flex flex-col justify-between gap-10 bg-[var(--vx-brand-deep)] px-6 py-10 sm:px-10 lg:w-[42%] lg:px-14 lg:py-16">
        <Wordmark />
        <div className="flex max-w-sm flex-col gap-3">
          <p className="text-xl font-semibold text-[var(--vx-on-deep)] sm:text-2xl">
            {title}
          </p>
          <p className="text-sm text-[var(--vx-brand-light)]">{description}</p>
        </div>
        <p className="text-xs text-[var(--vx-brand-light)]/80">
          A private record, not a payroll system.
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}

export { AuthSplit }
export type { AuthSplitProps }
