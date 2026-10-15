import { DateTime } from "luxon"

import { Button } from "@/components/ui/button"
import type { WeekRowCalculation, WeekShiftDraft } from "@/server/shift/week-entry"

type WeekDaySummaryProps = {
  row: WeekShiftDraft
  calculation?: WeekRowCalculation
  selected: boolean
  sourceLabel?: string
  onSelect: () => void
  onToggle: (included: boolean) => void
  onDuplicate: () => void
}

function statusFor(calculation?: WeekRowCalculation): "Ready" | "TBD" | "Needs review" | "Not included" {
  if (!calculation || calculation.status === "needs-review") return "Needs review"
  if (calculation.status === "not-included") return "Not included"
  if (calculation.result?.lines.some((line) => line.status === "tbd") || calculation.result?.unresolved.length) return "TBD"
  return "Ready"
}

function WeekDaySummary({ row, calculation, selected, sourceLabel, onSelect, onToggle, onDuplicate }: WeekDaySummaryProps) {
  const status = statusFor(calculation)
  const code = calculation?.result?.lines.map((line) => line.code).join(", ") || "—"

  return (
    <article className={`border-b border-[var(--vx-line)] ${selected ? "bg-[var(--vx-brand-tint)]" : "bg-transparent"}`}>
      <div className="grid min-h-16 grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2 sm:grid-cols-[auto_minmax(9rem,1fr)_minmax(8rem,1fr)_6rem_7rem_auto]">
        <label className="flex size-11 items-center justify-center" aria-label={`Include ${row.workDate}`}>
          <input type="checkbox" checked={row.included} onChange={(event) => onToggle(event.target.checked)} className="size-5 accent-[var(--vx-brand)]" />
        </label>
        <button type="button" onClick={onSelect} aria-expanded={selected} className="min-h-11 min-w-0 text-left">
          <span className="block text-sm font-semibold text-[var(--vx-ink)]">{DateTime.fromISO(row.workDate).toFormat("ccc, MMM d")}</span>
          <span className="block font-mono text-xs tabular-nums text-[var(--vx-muted)]">{row.shiftStart}–{row.shiftEnd}</span>
        </button>
        <span className="hidden text-sm text-[var(--vx-ink-soft)] sm:block">{row.dayClassification.replaceAll("_", " ").toLowerCase()}</span>
        <span className="hidden font-mono text-sm tabular-nums sm:block">{calculation?.result ? `${calculation.result.ndHours} h` : "—"}</span>
        <span className="hidden font-mono text-xs sm:block">{code}</span>
        <span className="justify-self-end text-xs font-semibold text-[var(--vx-ink-soft)]">{status}</span>
      </div>
      {sourceLabel ? <p className="px-14 pb-2 text-xs text-[var(--vx-amber-ink)]">Cebu 2026 source · {sourceLabel}. Review classification.</p> : null}
      {row.included && selected ? <div className="flex justify-end px-3 pb-3"><Button type="button" variant="quiet" onClick={onDuplicate}>Add another shift</Button></div> : null}
    </article>
  )
}

export { WeekDaySummary, statusFor }
export type { WeekDaySummaryProps }
