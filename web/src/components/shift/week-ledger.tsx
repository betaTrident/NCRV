import type { WeekRowCalculation, WeekShiftDraft } from "@/server/shift/week-entry"
import type { ShiftFieldErrors } from "@/server/shift/parse-shift-entry"

import { WeekDayEditor } from "./week-day-editor"
import { WeekDaySummary } from "./week-day-summary"

type WeekLedgerProps = {
  rows: WeekShiftDraft[]
  calculations: WeekRowCalculation[]
  activeRowId: string | null
  errors: Record<string, ShiftFieldErrors>
  sourceLabels: Record<string, string>
  onSelect: (rowId: string) => void
  onToggle: (rowId: string, included: boolean) => void
  onUpdate: (rowId: string, patch: Partial<WeekShiftDraft>) => void
  onDuplicate: (row: WeekShiftDraft) => void
}

function WeekLedger({ rows, calculations, activeRowId, errors, sourceLabels, onSelect, onToggle, onUpdate, onDuplicate }: WeekLedgerProps) {
  return (
    <section aria-label="Week ledger" className="overflow-hidden border-y border-[var(--vx-line-strong)] bg-[var(--vx-surface)]">
      <div className="hidden grid-cols-[auto_minmax(9rem,1fr)_minmax(8rem,1fr)_6rem_7rem_auto] gap-3 border-b border-[var(--vx-line-strong)] px-3 py-2 font-mono text-[10px] font-semibold tracking-[0.08em] text-[var(--vx-muted)] uppercase sm:grid">
        <span className="w-11">Use</span><span>Day / shift</span><span>Classification</span><span>Final ND</span><span>Code</span><span>Status</span>
      </div>
      {rows.map((row) => {
        const calculation = calculations.find((item) => item.id === row.id)
        const selected = activeRowId === row.id
        return (
          <div key={row.id}>
            <WeekDaySummary row={row} calculation={calculation} selected={selected} sourceLabel={sourceLabels[row.workDate]} onSelect={() => onSelect(row.id)} onToggle={(included) => onToggle(row.id, included)} onDuplicate={() => onDuplicate(row)} />
            {selected && row.included ? (
              <div className="hidden border-b border-[var(--vx-line)] bg-[var(--vx-surface-soft)] p-4 md:block">
                <WeekDayEditor row={row} errors={errors[row.id]} onUpdate={(patch) => onUpdate(row.id, patch)} />
              </div>
            ) : null}
          </div>
        )
      })}
    </section>
  )
}

export { WeekLedger }
export type { WeekLedgerProps }
