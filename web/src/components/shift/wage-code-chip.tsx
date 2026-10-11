import { cn } from "cn"

type WageCodeChipProps = {
  code: string
  tbd?: boolean
}

/**
 * Mono wage code. Unresolved chips include the visible word TBD.
 */
function WageCodeChip({ code, tbd = false }: WageCodeChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs font-medium tabular-nums",
        tbd
          ? "bg-[var(--vx-amber-bg)] text-[var(--vx-amber)]"
          : "bg-[var(--vx-brand-tint)] text-[var(--vx-brand)]",
      )}
    >
      {code}
      {tbd ? <span>TBD</span> : null}
    </span>
  )
}

export { WageCodeChip }
export type { WageCodeChipProps }
