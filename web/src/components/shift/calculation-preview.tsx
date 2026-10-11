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

type CalculationPreviewProps = {
  windowLabel: string
  segments: TimelineSegment[]
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
}

/**
 * Live calculation region. Composes the trace; does not format TBD as money.
 */
function CalculationPreview({
  windowLabel,
  segments,
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
}: CalculationPreviewProps) {
  const showEstimate = rows.some((row) => row.amountStatus === "estimated")

  return (
    <Panel className="p-6 sm:p-8">
      <section
        aria-live="polite"
        aria-label="Calculation preview"
        className="flex flex-col gap-6"
      >
        <h2 className="text-[15px] font-semibold text-[var(--vx-ink)]">
          Night differential result
        </h2>
        {showEstimate ? (
          <StatusLine tone="estimate">Confirm the payroll rule before relying on this amount.</StatusLine>
        ) : null}
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
        <NightWindowTimeline windowLabel={windowLabel} segments={segments} />
        <NumberStrip
          potentialNdHours={potentialNdHours}
          breakHours={breakHours}
          breakIncludedInNd={breakIncludedInNd}
          ndHours={ndHours}
        />
        <WageTypeTable rows={rows} />
        <EstimateNote />
        {unresolved.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-amber)] uppercase">
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
      </section>
    </Panel>
  )
}

export { CalculationPreview }
export type { CalculationPreviewProps }
