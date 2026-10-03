import * as React from "react"
import { Panel } from "@/components/shell/panel"

type EmptyStateProps = {
  title: string
  description: string
  action?: React.ReactNode
}

/**
 * Short explanation and one next action. No icon tile above the heading —
 * this is a quiet panel, not a marketing block.
 */
function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Panel className="flex flex-col items-start gap-3 p-8 text-left">
      <h2 className="text-base font-semibold text-[var(--vx-ink)]">{title}</h2>
      <p className="max-w-prose text-sm text-[var(--vx-muted)]">
        {description}
      </p>
      {action ? <div className="pt-1">{action}</div> : null}
    </Panel>
  )
}

export { EmptyState }
export type { EmptyStateProps }
