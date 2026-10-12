import { EstimateNote } from "@/components/shift/estimate-note"
import {
  WageTypeTable,
  type WageTypeTableRow,
} from "@/components/shift/wage-type-table"
import { Panel } from "@/components/shell/panel"

type RecordDetailLine = {
  code: string
  categoryLabel: string
  hoursCategoryLabel: string
  hours: string | null
  percentage: string
  amountStatus: "estimated" | "tbd"
  amountLabel: string
  unresolvedReason: string | null
}

type RecordDetailView = {
  id: string
  workDateLabel: string
  shiftLabel: string
  dayLabel: string
  elapsedHours: string | null
  workedHours: string | null
  regularHours: string | null
  potentialOvertimeHours: string | null
  approvedOvertimeHours: string | null
  unapprovedExtraHours: string | null
  potentialNdHours: string
  breakHours: string
  ndHours: string
  breakIncludedLabel: "Yes" | "No"
  scheduleLabel: string | null
  scheduledRegularHours: string | null
  overtimeApprovedLabel: "Yes" | "No" | null
  ndWindowLabel: string
  timeZone: string
  salaryLabel: string | null
  dailyRateLabel: string | null
  hourlyRateLabel: string | null
  lines: RecordDetailLine[]
}

type RecordDetailProps = {
  detail: RecordDetailView
}

type TraceItemProps = {
  label: string
  value: string
  numeric?: boolean
  wide?: boolean
}

function recorded(value: string | null): string {
  return value ?? "Not recorded"
}

function hoursLabel(value: string | null): string {
  return value == null ? "Not recorded" : `${value} hrs`
}

function toWageRows(lines: RecordDetailLine[]): WageTypeTableRow[] {
  return lines.map((line) => ({
    code: line.code,
    categoryLabel: `${line.categoryLabel} · ${line.hoursCategoryLabel}`,
    hours: line.hours,
    percentage: line.percentage,
    amountStatus: line.amountStatus,
    formattedAmount: line.amountStatus === "tbd" ? null : line.amountLabel,
  }))
}

function TraceItem({ label, value, numeric = false, wide = false }: TraceItemProps) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <dt className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">
        {label}
      </dt>
      <dd
        className={
          numeric
            ? "font-mono text-sm tabular-nums text-[var(--vx-ink)]"
            : "text-sm text-[var(--vx-ink)]"
        }
      >
        {value}
      </dd>
    </div>
  )
}

/**
 * Immutable saved snapshot. Renders stored labels only — it does not recalculate.
 */
function RecordDetail({ detail }: RecordDetailProps) {
  const rows = toWageRows(detail.lines)
  const showEstimate = detail.lines.some((line) => line.amountStatus === "estimated")
  const unresolvedReasons = [
    ...new Set(
      detail.lines
        .map((line) => line.unresolvedReason)
        .filter((reason): reason is string => Boolean(reason)),
    ),
  ]

  return (
    <Panel className="p-6 sm:p-8">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section
          aria-label="Saved calculation trace"
          className="flex flex-col gap-6"
        >
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <TraceItem label="Shift" value={detail.shiftLabel} numeric wide />
            <TraceItem label="Day classification" value={detail.dayLabel} wide />
            <TraceItem
              label="Schedule"
              value={recorded(detail.scheduleLabel)}
              wide
            />
            <TraceItem
              label="Scheduled regular hours"
              value={hoursLabel(detail.scheduledRegularHours)}
              numeric
            />
            <TraceItem
              label="Overtime recorded"
              value={recorded(detail.overtimeApprovedLabel)}
            />
            <TraceItem
              label="Elapsed"
              value={hoursLabel(detail.elapsedHours)}
              numeric
            />
            <TraceItem
              label="Worked after unpaid break"
              value={hoursLabel(detail.workedHours)}
              numeric
            />
            <TraceItem
              label="Regular hours"
              value={hoursLabel(detail.regularHours)}
              numeric
            />
            <TraceItem
              label="Potential overtime"
              value={hoursLabel(detail.potentialOvertimeHours)}
              numeric
            />
            <TraceItem
              label="Approved overtime"
              value={hoursLabel(detail.approvedOvertimeHours)}
              numeric
            />
            <TraceItem
              label="Unapproved extra hours"
              value={hoursLabel(detail.unapprovedExtraHours)}
              numeric
            />
            <TraceItem
              label="Potential ND"
              value={`${detail.potentialNdHours} hrs`}
              numeric
            />
            <TraceItem
              label="Default break"
              value={`${detail.breakHours} hrs`}
              numeric
            />
            <TraceItem
              label="Break included"
              value={detail.breakIncludedLabel}
            />
            <TraceItem
              label="Final ND"
              value={`${detail.ndHours} hrs`}
              numeric
            />
            <TraceItem
              label="ND window"
              value={detail.ndWindowLabel}
              numeric
              wide
            />
            <TraceItem label="Time zone" value={detail.timeZone} numeric />
            <TraceItem
              label="Monthly basic salary"
              value={recorded(detail.salaryLabel)}
              numeric
            />
            <TraceItem
              label="Derived daily rate"
              value={recorded(detail.dailyRateLabel)}
              numeric
            />
            <TraceItem
              label="Derived hourly rate"
              value={recorded(detail.hourlyRateLabel)}
              numeric
            />
          </dl>
        </section>
        <aside
          aria-label="Saved wage type lines"
          className="flex min-w-0 flex-col gap-6"
        >
          <WageTypeTable rows={rows} />
          {showEstimate ? <EstimateNote /> : null}
          {unresolvedReasons.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-amber)] uppercase">
                Unresolved
              </p>
              <ul className="flex flex-col gap-1">
                {unresolvedReasons.map((reason) => (
                  <li key={reason} className="text-sm text-[var(--vx-ink)]">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </Panel>
  )
}

export { RecordDetail }
export type { RecordDetailProps, RecordDetailView }
