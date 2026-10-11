import { cn } from "cn"

type NumberStripProps = {
  potentialNdHours: string
  breakHours: string
  breakIncludedInNd: boolean
  ndHours: string
}

function StripFigure({
  label,
  emphasize = false,
  children,
}: {
  label: string
  emphasize?: boolean
  children: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">
        {label}
      </p>
      <p
        className={cn(
          "font-mono tabular-nums text-[var(--vx-ink)]",
          emphasize
            ? "text-2xl leading-tight font-bold"
            : "text-sm font-medium text-[var(--vx-ink-soft)]",
        )}
      >
        {children}
      </p>
    </div>
  )
}

/**
 * Potential ND, break treatment, and final ND. Final stays text, only larger.
 */
function NumberStrip({
  potentialNdHours,
  breakHours,
  breakIncludedInNd,
  ndHours,
}: NumberStripProps) {
  const breakFigure = breakIncludedInNd
    ? `${breakHours} hr included`
    : `${breakHours} hr excluded — break time not collected`

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StripFigure label="Potential ND">{`${potentialNdHours} hrs`}</StripFigure>
      <StripFigure label="Break treatment">{breakFigure}</StripFigure>
      <StripFigure label="Final ND" emphasize>
        {`${ndHours} hrs`}
      </StripFigure>
    </div>
  )
}

export { NumberStrip }
export type { NumberStripProps }
