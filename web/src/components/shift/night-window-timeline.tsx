import { cn } from "cn"

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
  segments: TimelineSegment[]
}

const CLOCK_KINDS = new Set(["shift", "overlap", "qualifying"])

const KIND_LABEL: Record<
  Exclude<TimelineSegment["kind"], "excluded-break">,
  string
> = {
  shift: "Shift",
  overlap: "Potential overlap",
  qualifying: "Qualifying ND",
}

const BAR_TONE: Record<
  Exclude<TimelineSegment["kind"], "excluded-break">,
  string
> = {
  shift: "bg-[var(--vx-line)]",
  overlap: "bg-[var(--vx-brand-light)]",
  qualifying: "bg-[var(--vx-brand)]",
}

/**
 * Renders already-computed window labels. It does not calculate hours.
 * Excluded break stays off the clock and appears only in the legend.
 */
function NightWindowTimeline({
  windowLabel,
  segments,
}: NightWindowTimelineProps) {
  const clockSegments = segments.filter(
    (
      segment,
    ): segment is TimelineSegment & {
      kind: "shift" | "overlap" | "qualifying"
    } => CLOCK_KINDS.has(segment.kind),
  )
  const excludedBreaks = segments.filter(
    (segment) => segment.kind === "excluded-break",
  )
  const tracks = (["shift", "nd", "potential", "qualifying"] as const).filter((track) =>
    clockSegments.some((segment) => segment.track === track),
  )
  const renderTracks: ("shift" | "nd" | "potential" | "qualifying")[] = tracks.length > 0 ? tracks : ["shift"]

  function trackSegments(track: "shift" | "nd" | "potential" | "qualifying") {
    return clockSegments.filter((segment) =>
      tracks.length === 0 ? true : segment.track === track,
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">
          ND window
        </p>
        <p className="font-mono text-sm tabular-nums text-[var(--vx-ink)]">
          {windowLabel}
        </p>
      </div>

      {tracks.length > 0 ? <p className="text-xs text-[var(--vx-muted)]">Aggregate hours share one scale. These bars do not place the unpaid break on the clock.</p> : null}
      {tracks.length > 0 ? (
        <div className="flex flex-col gap-2" aria-hidden="true">
          {renderTracks.map((track) => {
            const row = trackSegments(track)
            const total = row.reduce((sum, segment) => sum + (segment.hours ?? 1), 0)
            const maxTotal = Math.max(
              ...renderTracks.map((candidate) => trackSegments(candidate).reduce((sum, segment) => sum + (segment.hours ?? 1), 0)),
              1,
            )
            return (
              <div key={track} className="flex items-center gap-2">
                <span className="w-16 shrink-0 font-mono text-[10px] tracking-[0.1em] text-[var(--vx-muted)] uppercase">
                  {{shift:"Shift",nd:"Potential",potential:"Potential",qualifying:"Final ND"}[track]}
                </span>
                <div className="flex h-2.5 min-w-0 flex-1 overflow-hidden rounded-sm bg-[var(--vx-surface-soft)]">
                  <div className="flex h-full min-w-0 overflow-hidden" style={{ width: `${(total / maxTotal) * 100}%` }}>
                    {row.map((segment, index) => (
                      <div
                        key={`${segment.kind}-${segment.startLabel}-${segment.endLabel}-${index}`}
                        className={cn("min-w-0", BAR_TONE[segment.kind])}
                        style={{ flex: `${segment.hours ?? 1} 1 0%` }}
                        title={`${segment.displayLabel ?? KIND_LABEL[segment.kind]} ${segment.displayValue ?? `${segment.startLabel} – ${segment.endLabel}`}`}
                      />
                    ))}
                  </div>
                </div>
                <span className="w-16 shrink-0 text-right font-mono text-[10px] tabular-nums text-[var(--vx-muted)]">
                  {total.toFixed(2)} h
                </span>
              </div>
            )
          })}
        </div>
      ) : null}

      {clockSegments.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {clockSegments.map((segment, index) => (
            <li
              key={`label-${segment.kind}-${segment.startLabel}-${segment.endLabel}-${index}`}
              className="text-sm text-[var(--vx-ink-soft)]"
            >
              <span>{segment.displayLabel ?? KIND_LABEL[segment.kind]}</span>{" "}
              <span className="font-mono tabular-nums text-[var(--vx-ink)]">
                {segment.displayValue ?? `${segment.startLabel} – ${segment.endLabel}`}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-col gap-1 text-xs text-[var(--vx-muted)]">
        {clockSegments.some((segment) => segment.kind === "qualifying") ? (
          <p>
            <span
              aria-hidden="true"
              className="mr-1.5 inline-block size-2 align-middle bg-[var(--vx-brand)]"
            />
            Purple marks qualifying ND.
          </p>
        ) : null}
        {clockSegments.some((segment) => segment.kind === "overlap") ? (
          <p>
            <span
              aria-hidden="true"
              className="mr-1.5 inline-block size-2 align-middle bg-[var(--vx-brand-light)]"
            />
            The lighter mark is potential overlap.
          </p>
        ) : null}
        {excludedBreaks.map((segment, index) => (
          <p
            key={`excluded-${segment.startLabel}-${segment.endLabel}-${index}`}
          >
            Break deduction: {segment.hours?.toFixed(2) ?? "—"} h · exact clock position not recorded.
          </p>
        ))}
      </div>
    </div>
  )
}

export { NightWindowTimeline }
export type { NightWindowTimelineProps, TimelineSegment }
