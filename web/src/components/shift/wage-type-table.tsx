import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { WageCodeChip } from "@/components/shift/wage-code-chip"

type WageTypeTableRow = {
  code: string
  categoryLabel: string
  hours: string | null
  percentage: string
  amountStatus: "estimated" | "tbd"
  formattedAmount: string | null
}

type WageTypeTableProps = {
  rows: WageTypeTableRow[]
}

const HEADER_CLASS =
  "h-10 font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase"

/**
 * Wage type lines. TBD stays the word TBD; it is never formatted as money.
 */
function WageTypeTable({ rows }: WageTypeTableProps) {
  return (
    <Table className="caption-top">
      <TableCaption className="mt-0 mb-3 text-left text-sm text-[var(--vx-muted)]">
        Wage type lines
      </TableCaption>
      <TableHeader>
        <TableRow className="border-[var(--vx-line)] hover:bg-transparent">
          <TableHead scope="col" className={HEADER_CLASS}>
            Code
          </TableHead>
          <TableHead scope="col" className={HEADER_CLASS}>
            Category
          </TableHead>
          <TableHead scope="col" className={`${HEADER_CLASS} text-right`}>
            Hours
          </TableHead>
          <TableHead scope="col" className={`${HEADER_CLASS} text-right`}>
            Rate
          </TableHead>
          <TableHead scope="col" className={`${HEADER_CLASS} text-right`}>
            Amount
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => {
          const amount =
            row.amountStatus === "tbd" ? "TBD" : (row.formattedAmount ?? "—")

          return (
            <TableRow
              key={`${row.code}-${row.categoryLabel}-${index}`}
              className="border-[var(--vx-line)] hover:bg-transparent"
            >
              <TableCell>
                <WageCodeChip
                  code={row.code}
                  tbd={row.amountStatus === "tbd"}
                />
              </TableCell>
              <TableCell className="text-[var(--vx-ink-soft)]">
                {row.categoryLabel}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums text-[var(--vx-ink)]">
                {row.hours ?? "—"}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums text-[var(--vx-ink)]">
                {row.percentage.endsWith("%")
                  ? row.percentage
                  : `${row.percentage}%`}
              </TableCell>
              <TableCell
                className={
                  row.amountStatus === "tbd"
                    ? "text-right font-mono font-medium tabular-nums text-[var(--vx-amber)]"
                    : "text-right font-mono tabular-nums text-[var(--vx-ink)]"
                }
              >
                {amount}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export { WageTypeTable }
export type { WageTypeTableProps, WageTypeTableRow }
