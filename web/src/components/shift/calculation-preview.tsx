import type { ReactNode } from "react"
import { StatusLine } from "@/components/forms/status-line"
import { EstimateNote } from "@/components/shift/estimate-note"
import {
  NightWindowTimeline,
  type TimelineSegment,
} from "@/components/shift/night-window-timeline"
import { NumberStrip } from "@/components/shift/number-strip"
import {
  WageTypeTable,
  type WageTypeTableRow,
} from "@/components/shift/wage-type-table"
import { Panel } from "@/components/shell/panel"
import type { NdClockIntervals } from "@/engine/types"
import { WageMatchDisclosure } from "./wage-match-disclosure"

type CalculationPreviewProps = {
  windowLabel: string
  segments: TimelineSegment[]
  clockIntervals?: NdClockIntervals
  shiftLabel: string
  dayClassificationLabel: string
  elapsedHours: string
  workedHours: string
  scheduledRegularHours: string
  regularHours: string
  potentialOvertimeHours: string
  approvedOvertimeHours: string
  unapprovedExtraHours: string
  overtimeApprovedLabel: string
  potentialNdHours: string
  breakHours: string
  breakIncludedInNd: boolean
  ndHours: string
  rows: WageTypeTableRow[]
  unresolved: string[]
  actions?: ReactNode
  stale?: boolean
}

/**
 * Live calculation region. Composes the trace; does not format TBD as money.
 */
function CalculationPreview({
  windowLabel,
  segments,
  clockIntervals,
  shiftLabel,
  dayClassificationLabel,
  elapsedHours,
  workedHours,
  scheduledRegularHours,
  regularHours,
  potentialOvertimeHours,
  approvedOvertimeHours,
  unapprovedExtraHours,
  overtimeApprovedLabel,
  potentialNdHours,
  breakHours,
  breakIncludedInNd,
  ndHours,
  rows,
  unresolved,
  stale = false,
  actions,
}: CalculationPreviewProps) {
  const showEstimate = rows.some((row) => row.amountStatus === "estimated")

  return (
    <Panel className="p-6 sm:p-8">
      <section
        aria-live="polite"
        aria-label="Calculation receipt"
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2 border-b border-[var(--vx-line)] pb-5">
          <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">Calculation receipt</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--vx-ink)]">Final night differential</h2>
              <p className="mt-1 text-sm text-[var(--vx-muted)]">Your recorded shift, shown as an estimate rather than payroll confirmation.</p>
            </div>
            <p className="font-mono text-3xl font-bold tabular-nums text-[var(--vx-ink)]">{ndHours} <span className="text-base font-medium">hrs</span></p>
          </div>
        </div>
        {stale ? (
          <StatusLine tone="pending">
            Needs recalculation — the form changed after this preview.
          </StatusLine>
        ) : null}
        {showEstimate ? (
          <StatusLine tone="estimate">Confirm the payroll rule before relying on this amount.</StatusLine>
        ) : null}
        <section aria-labelledby="wage-result-heading" className="flex flex-col gap-4 border-b border-[var(--vx-line)] pb-5">
          <div>
            <h3 id="wage-result-heading" className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">Matched code and amount state</h3>
            <p className="mt-1 text-sm text-[var(--vx-muted)]">Each matching code remains independently qualified.</p>
          </div>
          <WageTypeTable rows={rows} />
          <EstimateNote />
        </section>
        <NightWindowTimeline windowLabel={windowLabel} segments={segments} clockIntervals={clockIntervals} breakHours={breakHours} breakIncludedInNd={breakIncludedInNd} />
        <NumberStrip
          potentialNdHours={potentialNdHours}
          breakHours={breakHours}
          breakIncludedInNd={breakIncludedInNd}
          ndHours={ndHours}
        />
        <section aria-labelledby="duty-trace-heading" className="border-t border-[var(--vx-line)] pt-5">
          <h3 id="duty-trace-heading" className="mb-4 font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">Arithmetic trace</h3>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="col-span-2">
            <dt className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">
              Shift
            </dt>
            <dd className="font-mono text-sm tabular-nums text-[var(--vx-ink)]">
              {shiftLabel}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">
              Day classification
            </dt>
            <dd className="text-sm text-[var(--vx-ink)]">{dayClassificationLabel}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">
              Elapsed
            </dt>
            <dd className="font-mono text-sm tabular-nums text-[var(--vx-ink)]">
              {elapsedHours} hrs
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">
              Worked after unpaid break
            </dt>
            <dd className="font-mono text-sm tabular-nums text-[var(--vx-ink)]">
              {workedHours} hrs
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">
              Scheduled regular hours
            </dt>
            <dd className="font-mono text-sm tabular-nums text-[var(--vx-ink)]">
              {scheduledRegularHours} hrs
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">
              Regular
            </dt>
            <dd className="font-mono text-sm tabular-nums text-[var(--vx-ink)]">
              {regularHours} hrs
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">
              Potential overtime
            </dt>
            <dd className="font-mono text-sm tabular-nums text-[var(--vx-ink)]">
              {potentialOvertimeHours} hrs
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">
              Approved overtime
            </dt>
            <dd className="font-mono text-sm tabular-nums text-[var(--vx-ink)]">
              {approvedOvertimeHours} hrs
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">
              Unapproved extra
            </dt>
            <dd className="font-mono text-sm tabular-nums text-[var(--vx-ink)]">
              {unapprovedExtraHours} hrs
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">
              Overtime recorded as approved
            </dt>
            <dd className="text-sm text-[var(--vx-ink)]">{overtimeApprovedLabel}</dd>
          </div>
          </dl>
        </section>
        <WageMatchDisclosure rows={rows} />
        {unresolved.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-amber-ink)] uppercase">
              Unresolved
            </p>
            <ul className="flex flex-col gap-1">
              {unresolved.map((reason, index) => (
                <li
                  key={`${reason}-${index}`}
                  className="text-sm text-[var(--vx-ink)]"
                >
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {actions}
      </section>
    </Panel>
  )
}

export { CalculationPreview }
export type { CalculationPreviewProps }
