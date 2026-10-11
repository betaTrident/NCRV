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
    <div className="overflow-x-auto">
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
  )
}

export { Ledger }
export type { LedgerColumn, LedgerProps }
