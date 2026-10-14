import Link from "next/link"

import { WageCodeChip } from "@/components/shift/wage-code-chip"
import { ButtonLink } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { RecordListRow } from "@/server/queries/records"

type RecordsTableProps = { rows: RecordListRow[] }

const AMOUNT_STATE: Record<RecordListRow["amountState"], string> = {
  estimated: "Estimated",
  "partial-tbd": "Known estimate, partial TBD",
  tbd: "Amount TBD",
  none: "No amount",
}

function Codes({ row }: { row: RecordListRow }) {
  return row.wageCodeItems.length > 0 ? (
    <div className="flex flex-wrap gap-1.5">
      {row.wageCodeItems.map((item, index) => (
        <WageCodeChip key={`${item.code}-${index}`} code={item.code} tbd={item.tbd} />
      ))}
    </div>
  ) : <span>None</span>
}

function MobileRecord({ row }: { row: RecordListRow }) {
  return (
    <li className="rounded-[var(--vx-radius-panel)] border border-[var(--vx-line)] bg-[var(--vx-surface)] p-4">
      <article className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/records/${row.id}`} aria-label={`View record for ${row.workDateLongLabel}`} className="font-semibold text-[var(--vx-brand)] underline-offset-2 hover:underline">
              {row.workDateLabel}
            </Link>
            <p className="text-xs text-[var(--vx-muted)]">{row.weekdayLabel}</p>
          </div>
          <p className="font-mono text-lg font-semibold tabular-nums text-[var(--vx-ink)]">{row.ndHours} h</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div><dt className="text-xs text-[var(--vx-muted)]">Shift</dt><dd className="font-mono tabular-nums text-[var(--vx-ink)]">{row.shiftLabel}</dd></div>
          <div><dt className="text-xs text-[var(--vx-muted)]">Day type</dt><dd className="text-[var(--vx-ink)]">{row.dayLabel}</dd></div>
          <div className="col-span-2"><dt className="mb-1 text-xs text-[var(--vx-muted)]">Wage codes</dt><dd><Codes row={row} /></dd></div>
          <div className="col-span-2"><dt className="text-xs text-[var(--vx-muted)]">Known estimate</dt><dd className="font-mono tabular-nums text-[var(--vx-ink)]">{row.amountLabel}</dd><dd className="text-xs text-[var(--vx-muted)]">{AMOUNT_STATE[row.amountState]}</dd></div>
        </dl>
        <ButtonLink href={`/records/${row.id}`} variant="outline" aria-label={`Open record for ${row.workDateLongLabel}`} className="w-full">Open record</ButtonLink>
      </article>
    </li>
  )
}

/** Complete desktop ledger plus an information-equivalent narrow-screen list. */
function RecordsTable({ rows }: RecordsTableProps) {
  return (
    <div>
      <div className="hidden overflow-x-auto sm:block">
        <Table className="caption-top">
          <TableCaption className="mt-0 mb-3 text-left text-sm text-[var(--vx-muted)]">Saved shifts</TableCaption>
          <TableHeader><TableRow>
            {['Date','Shift','Day type','Final ND','Wage codes','Known estimate','Open record'].map((label) => <TableHead key={label} scope="col" className="h-10 font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">{label}</TableHead>)}
          </TableRow></TableHeader>
          <TableBody>{rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell><Link href={`/records/${row.id}`} aria-label={`View record for ${row.workDateLongLabel}`} className="font-medium text-[var(--vx-brand)] underline-offset-2 hover:underline">{row.workDateLabel}</Link><span className="mt-0.5 block text-xs text-[var(--vx-muted)]">{row.weekdayLabel}</span></TableCell>
              <TableCell className="font-mono tabular-nums">{row.shiftLabel}</TableCell>
              <TableCell>{row.dayLabel}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{row.ndHours} h</TableCell>
              <TableCell><Codes row={row} /></TableCell>
              <TableCell className="text-right"><span className="block font-mono tabular-nums text-[var(--vx-ink)]">{row.amountLabel}</span><span className="block text-xs text-[var(--vx-muted)]">{AMOUNT_STATE[row.amountState]}</span></TableCell>
              <TableCell><ButtonLink href={`/records/${row.id}`} variant="quiet" aria-label={`Open record for ${row.workDateLongLabel}`}>Open record</ButtonLink></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </div>
      <ul aria-label="Saved shifts" className="flex flex-col gap-3 sm:hidden">{rows.map((row) => <MobileRecord key={row.id} row={row} />)}</ul>
    </div>
  )
}

export { RecordsTable }
export type { RecordsTableProps }
