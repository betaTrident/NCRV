import type { ReactNode } from "react"

import { cn } from "cn"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type LedgerColumn<T> = {
  id: string
  header: string
  numeric?: boolean
  cell: (row: T) => ReactNode
}

type LedgerProps<T extends { id: string }> = {
  caption: string
  columns: LedgerColumn<T>[]
  rows: T[]
  empty: string
}

const HEADER_CLASS =
  "h-10 font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase"

/**
 * Responsive ledger table. Empty rows render the supplied sentence, not a
 * placeholder row of zeros.
 */
function Ledger<T extends { id: string }>({
  caption,
  columns,
  rows,
  empty,
}: LedgerProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[var(--vx-muted)]">{caption}</p>
        <p className="text-sm text-[var(--vx-ink-soft)]">{empty}</p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-3 text-sm text-[var(--vx-muted)] sm:hidden">{caption}</p>
      <ul className="divide-y divide-[var(--vx-line)] border-y border-[var(--vx-line)] sm:hidden">
        {rows.map((row) => (
          <li key={row.id} className="py-4">
            <dl className="grid grid-cols-[minmax(6rem,0.4fr)_minmax(0,1fr)] gap-x-4 gap-y-2">
              {columns.map((column) => (
                <div key={column.id} className="contents">
                  <dt className="font-mono text-[10px] font-medium tracking-[0.1em] text-[var(--vx-muted)] uppercase">
                    {column.header}
                  </dt>
                  <dd className={cn("min-w-0 text-sm text-[var(--vx-ink-soft)]", column.numeric && "font-mono tabular-nums text-[var(--vx-ink)]")}>
                    {column.cell(row)}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto sm:block">
        <Table className="caption-top">
          <TableCaption className="mt-0 mb-3 text-left text-sm text-[var(--vx-muted)]">
            {caption}
          </TableCaption>
          <TableHeader>
            <TableRow className="border-[var(--vx-line)] hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  scope="col"
                  className={cn(
                    HEADER_CLASS,
                    column.numeric && "text-right font-mono tabular-nums",
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-[var(--vx-line)] hover:bg-transparent"
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={
                      column.numeric
                        ? "text-right font-mono tabular-nums text-[var(--vx-ink)]"
                        : "text-[var(--vx-ink-soft)]"
                    }
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export { Ledger }
export type { LedgerColumn, LedgerProps }
