import { DateTime } from "luxon"

import { Button } from "@/components/ui/button"
import { formatPhp } from "@/lib/format"
import type { WeekRowCalculation, WeekShiftDraft } from "@/server/shift/week-entry"

import type { ShiftField } from "./week-workflow"

type WeekReviewProps = {
  rows: WeekShiftDraft[]
  calculations: WeekRowCalculation[]
  sourceLabels: Record<string, string>
  onChange: (rowId: string, field: ShiftField) => void
}

function WeekReview({ rows, calculations, sourceLabels, onChange }: WeekReviewProps) {
  const included = rows.filter((row) => row.included)
  return (
    <section aria-labelledby="week-review-title" className="border-y border-[var(--vx-line-strong)] bg-[var(--vx-surface)]">
      <div className="px-4 py-5 sm:px-6">
        <h2 id="week-review-title" className="text-lg font-semibold text-[var(--vx-ink)]">Check this week before saving</h2>
        <p className="mt-1 text-sm text-[var(--vx-muted)]">Every included shift will be recalculated together on the server.</p>
      </div>
      <div className="divide-y divide-[var(--vx-line)]">
        {included.map((row) => {
          const calculation = calculations.find((item) => item.id === row.id)
          const result = calculation?.result
          const estimated = result?.lines.filter((line) => line.status === "estimated").reduce((sum, line) => sum + line.centavos, 0) ?? 0
          const tbd = result?.lines.some((line) => line.status === "tbd") || Boolean(result?.unresolved.length)
          return (
            <article key={row.id} className="grid gap-3 px-4 py-5 sm:grid-cols-[minmax(10rem,1fr)_repeat(3,minmax(6rem,auto))_auto] sm:items-center sm:px-6">
              <div>
                <h3 className="text-sm font-semibold">{DateTime.fromISO(row.workDate).toFormat("cccc, MMM d")}</h3>
                <p className="font-mono text-xs tabular-nums text-[var(--vx-muted)]">{row.shiftStart}–{row.shiftEnd}</p>
              </div>
              <p className="text-sm"><span className="text-[var(--vx-muted)] sm:hidden">Final ND: </span><span className="font-mono tabular-nums">{result?.ndHours ?? "—"} h</span></p>
              <p className="text-sm"><span className="text-[var(--vx-muted)] sm:hidden">Code: </span><span className="font-mono">{result?.lines.map((line) => line.code).join(", ") || "—"}</span></p>
              <p className="text-sm">{tbd ? "TBD" : estimated > 0 ? formatPhp(estimated) : "No amount"}</p>
              <Button type="button" variant="quiet" onClick={() => onChange(row.id, tbd ? "dayClassification" : "shiftStart")}>Change</Button>
              {sourceLabels[row.workDate] ? <p className="text-xs text-[var(--vx-amber-ink)] sm:col-span-5">Cebu 2026 source · {sourceLabels[row.workDate]}. Review classification before saving.</p> : null}
              {result?.unresolved.length ? <ul className="text-xs text-[var(--vx-amber-ink)] sm:col-span-5">{result.unresolved.map((reason) => <li key={reason}>{reason}</li>)}</ul> : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export { WeekReview }
export type { WeekReviewProps }
