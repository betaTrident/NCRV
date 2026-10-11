type PeriodBannerProps = {
  periodStart: string
  periodEnd: string
  cutoffLabel: string | null
}

/**
 * Deep-purple payroll-period summary. Cutoff copy is supplied by the
 * caller; a missing cutoff stays “Cutoff not recorded”.
 */
function PeriodBanner({
  periodStart,
  periodEnd,
  cutoffLabel,
}: PeriodBannerProps) {
  const cutoffText = cutoffLabel ?? "Cutoff not recorded"

  return (
    <section className="rounded-[var(--vx-radius-panel)] bg-[var(--vx-brand-deep)] px-5 py-5 text-[var(--vx-on-deep)] sm:px-6">
      <p className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
        PAYROLL PERIOD
      </p>
      <p className="mt-2 font-mono text-xl leading-tight font-semibold tabular-nums sm:text-2xl">
        {periodStart} - {periodEnd}
      </p>
      <p className="mt-2 text-sm">{cutoffText}</p>
    </section>
  )
}

export { PeriodBanner }
export type { PeriodBannerProps }
