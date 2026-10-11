import { cn } from "cn"

type TimelineSegment = {
  startLabel: string
  endLabel: string
  kind: "shift" | "overlap" | "qualifying" | "excluded-break"
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

      {clockSegments.length > 0 ? (
        <div
          className="flex h-2.5 overflow-hidden rounded-sm"
          aria-hidden="true"
        >
          {clockSegments.map((segment, index) => (
            <div
              key={`${segment.kind}-${segment.startLabel}-${segment.endLabel}-${index}`}
              className={cn("min-w-0 flex-1", BAR_TONE[segment.kind])}
            />
          ))}
        </div>
      ) : null}

      {clockSegments.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {clockSegments.map((segment, index) => (
            <li
              key={`label-${segment.kind}-${segment.startLabel}-${segment.endLabel}-${index}`}
              className="text-sm text-[var(--vx-ink-soft)]"
            >
              <span>{KIND_LABEL[segment.kind]}</span>{" "}
              <span className="font-mono tabular-nums text-[var(--vx-ink)]">
                {segment.startLabel} – {segment.endLabel}
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
            {segment.startLabel} {segment.endLabel}
          </p>
        ))}
      </div>
    </div>
  )
}

export { NightWindowTimeline }
export type { NightWindowTimelineProps, TimelineSegment }
