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
    <div className="relative flex min-h-dvh flex-col lg:flex-row">
      <a href="#auth-content" className="vx-sr-only vx-skip-link">
        Skip to content
      </a>
      <div className="flex flex-col justify-between gap-4 bg-[var(--vx-brand-deep)] px-6 py-6 sm:px-10 sm:py-10 lg:w-[36%] lg:px-12 lg:py-14">
        <Wordmark />
        <div className="flex max-w-sm flex-col gap-3">
          <p className="text-lg font-semibold text-[var(--vx-on-deep)] sm:text-2xl">
            {title}
          </p>
          <p className="text-sm text-[var(--vx-brand-light)]">{description}</p>
        </div>
        <p className="text-xs text-[var(--vx-brand-light)]/80">
          A private record, not a payroll system.
        </p>
      </div>
      <main id="auth-content" tabIndex={-1} className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  )
}

export { AuthSplit }
export type { AuthSplitProps }
