import { DateTime } from "luxon"

import type { NdClockIntervals } from "@/engine/types"
import { buildTimeRulerModel, type TimeRulerRowKind } from "./time-ruler-model"

type TimelineSegment = {
  startLabel: string
  endLabel: string
  kind: "shift" | "overlap" | "qualifying" | "excluded-break"
  hours?: number
  track?: "shift" | "nd" | "potential" | "qualifying"
  displayLabel?: string
  displayValue?: string
}

type NightWindowTimelineProps = {
  windowLabel: string
  /** Legacy scalar evidence; it renders as text only until clock intervals are supplied. */
  segments?: TimelineSegment[]
  clockIntervals?: NdClockIntervals
  breakHours?: string
  breakIncludedInNd?: boolean
}

const ROW_TONE: Record<TimeRulerRowKind, string> = {
  shift: "bg-[var(--vx-line-strong)]",
  window: "bg-[var(--vx-brand-light)]/65",
  potential: "bg-[var(--vx-brand-light)]",
  final: "bg-[var(--vx-brand)]",
}

function clockLabel(value: string): string {
  const date = DateTime.fromISO(value, { setZone: true })
  return date.isValid ? date.toFormat("h:mm a") : value
}

function durationLabel(start: string, end: string): string {
  const duration = Date.parse(end) - Date.parse(start)
  return Number.isFinite(duration) ? `${(duration / 3_600_000).toFixed(2)} h` : ""
}

function tickLabel(value: number, axisStart: string): string {
  const start = DateTime.fromISO(axisStart, { setZone: true })
  const tick = DateTime.fromMillis(value, { zone: start.zoneName ?? "UTC" })
  const dayChanged = tick.toISODate() !== start.toISODate()
  return dayChanged && tick.hour === 0 ? `${tick.toFormat("h a")} · next day` : tick.toFormat("h a")
}

function LegacyEvidence({ segments }: { segments: TimelineSegment[] }) {
  const clockSegments = segments.filter((segment) => segment.kind !== "excluded-break")
  return (
    <ul className="flex flex-col gap-1 text-sm text-[var(--vx-ink-soft)]">
      {clockSegments.map((segment, index) => (
        <li key={`${segment.kind}-${segment.startLabel}-${segment.endLabel}-${index}`}>
          <span>{segment.displayLabel ?? (segment.kind === "shift" ? "Shift" : segment.kind === "overlap" ? "Potential overlap" : "Qualifying ND")}</span>{" "}
          <span className="font-mono tabular-nums text-[var(--vx-ink)]">{segment.displayValue ?? `${segment.startLabel} – ${segment.endLabel}`}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * A truthful, shared time ruler. Every plotted row uses the shift's one clock
 * axis; duration-only breaks are disclosed below the ruler, never positioned.
 */
function NightWindowTimeline({
  windowLabel,
  segments = [],
  clockIntervals,
  breakHours,
  breakIncludedInNd = false,
}: NightWindowTimelineProps) {
  const deduction = breakIncludedInNd ? null : breakHours ?? segments.find((segment) => segment.kind === "excluded-break")?.hours?.toFixed(2)
  const model = clockIntervals
    ? buildTimeRulerModel(clockIntervals, breakIncludedInNd)
    : null

  return (
    <section aria-labelledby="night-time-ruler-heading" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p id="night-time-ruler-heading" className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">Night time ruler</p>
        <p className="font-mono text-sm tabular-nums text-[var(--vx-ink)]">Configured ND window · {windowLabel}</p>
      </div>

      {model ? (
        <div className="flex flex-col gap-3" role="img" aria-label="Night time ruler with clock-aligned night differential evidence">
          <div className="flex justify-between font-mono text-[11px] tabular-nums text-[var(--vx-muted)]" aria-hidden="true">
            <span>{clockLabel(model.axis.start)}</span>
            <span>{clockLabel(model.axis.end)}</span>
          </div>
          <div className="relative h-5" aria-hidden="true">
            {model.ticks.map((tick) => (
              <span key={tick.value} className="absolute -translate-x-1/2 font-mono text-[9px] tabular-nums text-[var(--vx-muted)]" style={{ left: `${tick.percent}%` }}>
                {tickLabel(tick.value, model.axis.start)}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {model.rows.map((row) => (
              <div key={row.kind} className="grid grid-cols-[5.75rem_minmax(0,1fr)] items-center gap-3">
                <span className="font-mono text-[10px] tracking-[0.1em] text-[var(--vx-muted)] uppercase">{row.label}</span>
                <div className="relative h-3 overflow-hidden rounded-sm bg-[var(--vx-surface-soft)]">
                  {row.intervals.map((interval) => (
                    <span
                      key={`${row.kind}-${interval.start}-${interval.end}`}
                      className={`absolute inset-y-0 ${ROW_TONE[row.kind]}`}
                      style={{ left: `${interval.startPercent}%`, width: `${interval.widthPercent}%` }}
                      title={`${row.label}: ${clockLabel(interval.start)} – ${clockLabel(interval.end)} (${durationLabel(interval.start, interval.end)})`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <dl className="sr-only">
            <div><dt>Clock axis</dt><dd>{clockLabel(model.axis.start)} to {clockLabel(model.axis.end)}</dd></div>
            {model.rows.map((row) => row.intervals.map((interval) => <div key={`text-${row.kind}-${interval.start}`}><dt>{row.label}</dt><dd>{clockLabel(interval.start)} to {clockLabel(interval.end)}, {durationLabel(interval.start, interval.end)}</dd></div>))}
          </dl>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-[var(--vx-muted)]">Exact clock intervals are unavailable for this calculation. The saved scalar evidence is shown below.</p>
          <LegacyEvidence segments={segments} />
        </div>
      )}

      <div className="flex flex-col gap-1 text-xs text-[var(--vx-muted)]">
        <p><span aria-hidden="true" className="mr-1.5 inline-block size-2 bg-[var(--vx-brand-light)]" />Lighter purple marks the configured and potential ND intervals.</p>
        {breakIncludedInNd ? <p><span aria-hidden="true" className="mr-1.5 inline-block size-2 bg-[var(--vx-brand)]" />Purple marks final ND when the break is included and the interval is fully known.</p> : null}
        {deduction ? <p>Break deduction: −{deduction} h · exact clock position not recorded.</p> : null}
        {!breakIncludedInNd ? <p>Final ND is a scalar result below because the excluded break has no recorded clock position.</p> : null}
      </div>
    </section>
  )
}

export { NightWindowTimeline }
export type { NightWindowTimelineProps, TimelineSegment }
