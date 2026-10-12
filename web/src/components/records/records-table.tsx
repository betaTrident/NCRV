import Link from "next/link"

import { Ledger, type LedgerColumn } from "@/components/records/ledger"
import type { RecordListRow } from "@/server/queries/records"

type RecordsTableProps = {
  rows: RecordListRow[]
}

const COLUMNS: LedgerColumn<RecordListRow>[] = [
  {
    id: "workDate",
    header: "Date",
    cell: (row) => (
      <Link
        href={`/records/${row.id}`}
        className="font-medium text-[var(--vx-brand)] underline-offset-2 hover:underline"
      >
        {row.workDateLabel}
      </Link>
    ),
  },
  {
    id: "shift",
    header: "Shift",
    cell: (row) => row.shiftLabel,
  },
  {
    id: "day",
    header: "Day type",
    cell: (row) => row.dayLabel,
  },
  {
    id: "ndHours",
    header: "ND hours",
    numeric: true,
    cell: (row) => row.ndHours,
  },
  {
    id: "wageTypes",
    header: "Wage types",
    cell: (row) => row.wageCodes,
  },
  {
    id: "amount",
    header: "Amount",
    numeric: true,
    cell: (row) => row.amountLabel,
  },
]

/**
 * Compact saved-shift ledger. Overflow stays horizontal so no column is dropped.
 */
function RecordsTable({ rows }: RecordsTableProps) {
  return (
    <Ledger
      caption="Saved shifts"
      columns={COLUMNS}
      rows={rows}
      empty="No shifts in this range."
    />
  )
}

export { RecordsTable }
export type { RecordsTableProps }
