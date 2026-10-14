import { EstimateNote } from "@/components/shift/estimate-note"
import { NightWindowTimeline, type TimelineSegment } from "@/components/shift/night-window-timeline"
import { NumberStrip } from "@/components/shift/number-strip"
import { WageTypeTable, type WageTypeTableRow } from "@/components/shift/wage-type-table"
import { Panel } from "@/components/shell/panel"
import type { RecordDetailView } from "@/server/queries/records"

type RecordDetailProps = { detail: RecordDetailView }
type EvidenceItemProps = { label: string; value: string; numeric?: boolean }

function recorded(value: string | null): string { return value ?? "Not recorded" }
function hoursLabel(value: string | null): string { return value == null ? "Not recorded" : `${value} hrs` }

function EvidenceItem({ label, value, numeric = false }: EvidenceItemProps) {
  return <div><dt className="text-xs text-[var(--vx-muted)]">{label}</dt><dd className={numeric ? "font-mono text-sm tabular-nums text-[var(--vx-ink)]" : "text-sm text-[var(--vx-ink)]"}>{value}</dd></div>
}

function SectionHeading({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return <div className="flex flex-col gap-1"><p className="font-mono text-[10px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">{eyebrow}</p><h2 id={id} className="text-base font-semibold text-[var(--vx-ink)]">{title}</h2></div>
}

function wageRows(detail: RecordDetailView): WageTypeTableRow[] {
  return detail.lines.map((line) => ({
    code: line.code,
    categoryLabel: `${line.categoryLabel} · ${line.hoursCategoryLabel}`,
    hours: line.hours,
    percentage: line.percentage,
    amountStatus: line.amountStatus,
    formattedAmount: line.amountStatus === "tbd" ? null : line.amountLabel,
  }))
}

/** Immutable saved snapshot grouped as evidence; this component never recalculates. */
function RecordDetail({ detail }: RecordDetailProps) {
  const rows = wageRows(detail)
  const showEstimate = detail.lines.some((line) => line.amountStatus === "estimated")
  const unresolved = [...new Set(detail.lines.map((line) => line.unresolvedReason).filter((reason): reason is string => Boolean(reason)))]
  const ndSegments: TimelineSegment[] = [
    { startLabel: detail.shiftStartLabel, endLabel: detail.shiftEndLabel, kind: "shift", ...(detail.elapsedHours !== null ? { track: "shift" as const, hours: Number(detail.elapsedHours) } : {}) },
  ]
  if (detail.potentialNdHours !== null) {
    ndSegments.push({
      startLabel: "Saved scalar",
      endLabel: `${detail.potentialNdHours} h`,
      kind: "overlap",
      track: "potential",
      hours: Number(detail.potentialNdHours),
      displayLabel: "Potential ND",
      displayValue: `${detail.potentialNdHours} h`,
    })
  }
  if (detail.ndHours !== null) {
    ndSegments.push({
      startLabel: "Saved scalar",
      endLabel: `${detail.ndHours} h`,
      kind: "qualifying",
      track: "qualifying",
      hours: Number(detail.ndHours),
      displayLabel: "Qualifying ND",
      displayValue: `${detail.ndHours} h`,
    })
  }
  if (detail.breakHours !== null && detail.breakIncludedLabel === "No") {
    ndSegments.push({
      startLabel: "Not recorded",
      endLabel: "Not recorded",
      kind: "excluded-break",
      hours: Number(detail.breakHours),
      displayLabel: "Break deduction",
    })
  }
  const completeNdStrip = detail.potentialNdHours !== null && detail.breakHours !== null && detail.breakIncludedLabel !== null && detail.ndHours !== null
    ? { potential: detail.potentialNdHours, breakHours: detail.breakHours, breakIncluded: detail.breakIncludedLabel === "Yes", final: detail.ndHours }
    : null

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
      <div className="flex flex-col gap-6">
        <Panel className="p-5 sm:p-7">
          <section aria-labelledby="saved-shift-heading" className="flex flex-col gap-5">
            <SectionHeading id="saved-shift-heading" eyebrow="SAVED SHIFT" title="What you recorded" />
            <dl className="grid gap-4 sm:grid-cols-2">
              <EvidenceItem label="Shift" value={detail.shiftLabel} numeric />
              <EvidenceItem label="Day classification" value={detail.dayLabel} />
              <EvidenceItem label="Schedule" value={recorded(detail.scheduleLabel)} />
              <EvidenceItem label="Scheduled regular hours" value={hoursLabel(detail.scheduledRegularHours)} numeric />
              <EvidenceItem label="Overtime recorded as approved" value={recorded(detail.overtimeApprovedLabel)} />
              <EvidenceItem label="Time zone" value={detail.timeZone} numeric />
            </dl>
          </section>
        </Panel>

        <Panel className="p-5 sm:p-7">
          <section aria-labelledby="duty-allocation-heading" className="flex flex-col gap-5">
            <SectionHeading id="duty-allocation-heading" eyebrow="DUTY ALLOCATION" title="How the hours were divided" />
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <EvidenceItem label="Elapsed" value={hoursLabel(detail.elapsedHours)} numeric />
              <EvidenceItem label="Worked" value={hoursLabel(detail.workedHours)} numeric />
              <EvidenceItem label="Regular" value={hoursLabel(detail.regularHours)} numeric />
              <EvidenceItem label="Potential overtime" value={hoursLabel(detail.potentialOvertimeHours)} numeric />
              <EvidenceItem label="Approved overtime" value={hoursLabel(detail.approvedOvertimeHours)} numeric />
              <EvidenceItem label="Unapproved extra" value={hoursLabel(detail.unapprovedExtraHours)} numeric />
            </dl>
          </section>
        </Panel>

        <Panel className="p-5 sm:p-7">
          <section aria-labelledby="night-evidence-heading" className="flex flex-col gap-6">
            <SectionHeading id="night-evidence-heading" eyebrow="NIGHT WINDOW" title="How final ND was reached" />
            <NightWindowTimeline windowLabel={detail.ndWindowLabel} segments={ndSegments} />
            {completeNdStrip ? (
              <NumberStrip potentialNdHours={completeNdStrip.potential} breakHours={completeNdStrip.breakHours} breakIncludedInNd={completeNdStrip.breakIncluded} ndHours={completeNdStrip.final} />
            ) : (
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <EvidenceItem label="Potential ND" value={hoursLabel(detail.potentialNdHours)} numeric />
                <EvidenceItem label="Break" value={hoursLabel(detail.breakHours)} numeric />
                <EvidenceItem label="Break included in ND" value={recorded(detail.breakIncludedLabel)} />
                <EvidenceItem label="Final ND" value={hoursLabel(detail.ndHours)} numeric />
              </dl>
            )}
          </section>
        </Panel>
      </div>

      <Panel className="p-5 sm:p-7 lg:sticky lg:top-[calc(var(--vx-topbar)+1.5rem)]">
        <aside aria-labelledby="rate-evidence-heading" className="flex min-w-0 flex-col gap-6">
          <SectionHeading id="rate-evidence-heading" eyebrow="RATE & CODES" title="Saved calculation basis" />
          <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <EvidenceItem label="Monthly basic salary" value={recorded(detail.salaryLabel)} numeric />
            <EvidenceItem label="Derived daily rate" value={recorded(detail.dailyRateLabel)} numeric />
            <EvidenceItem label="Derived hourly rate" value={recorded(detail.hourlyRateLabel)} numeric />
          </dl>
          <WageTypeTable rows={rows} />
          {showEstimate ? <EstimateNote /> : null}
          {unresolved.length > 0 ? <div className="rounded-[var(--vx-radius-control)] bg-[var(--vx-amber-bg)] p-3"><p className="mb-2 text-sm font-semibold text-[var(--vx-amber-ink)]">Unresolved</p><ul className="list-disc space-y-1 pl-5 text-sm text-[var(--vx-ink)]">{unresolved.map((reason) => <li key={reason}>{reason}</li>)}</ul></div> : null}
        </aside>
      </Panel>
    </div>
  )
}

export { RecordDetail }
export type { RecordDetailProps }
export type { RecordDetailView } from "@/server/queries/records"
