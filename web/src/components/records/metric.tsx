import { Panel } from "@/components/shell/panel"

type MetricProps = {
  label: string
  value: string
  detail?: string
}

/**
 * One visible label and one tabular figure. Optional detail is a sentence,
 * not a color-only cue.
 */
function Metric({ label, value, detail }: MetricProps) {
  return (
    <Panel className="flex flex-col gap-2 p-5">
      <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">
        {label}
      </p>
      <p className="font-mono text-2xl leading-tight font-bold tabular-nums text-[var(--vx-ink)]">
        {value}
      </p>
      {detail ? (
        <p className="text-sm text-[var(--vx-ink-soft)]">{detail}</p>
      ) : null}
    </Panel>
  )
}

export { Metric }
export type { MetricProps }
