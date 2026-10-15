import type { ReactNode } from "react"

export type KeyValueItem = { label: ReactNode; value: ReactNode }

type KeyValueListProps = { items: KeyValueItem[]; className?: string }

export function KeyValueList({ items, className }: KeyValueListProps) {
  return <dl className={`grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,1fr)_auto] ${className ?? ""}`}>
    {items.map((item, index) => <div key={index} className="contents"><dt className="text-sm text-[var(--vx-muted)]">{item.label}</dt><dd className="font-mono text-sm tabular-nums text-[var(--vx-ink)] sm:text-right">{item.value}</dd></div>)}
  </dl>
}
