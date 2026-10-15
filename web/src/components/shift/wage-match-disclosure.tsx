import type { WageTypeTableRow } from "./wage-type-table"

type WageMatchDisclosureProps = {
  rows: WageTypeTableRow[]
}

/** Explains configured matches without claiming TBD formulas are settled. */
function WageMatchDisclosure({ rows }: WageMatchDisclosureProps) {
  if (rows.length === 0) return null

  return (
    <section aria-labelledby="wage-match-heading" className="border-t border-[var(--vx-line)] pt-4">
      <h3 id="wage-match-heading" className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">Why these codes</h3>
      <div className="mt-3 flex flex-col divide-y divide-[var(--vx-line)]">
        {rows.map((row, index) => (
          <details key={`${row.code}-${row.categoryLabel}-${index}`} className="py-3">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--vx-brand)]">{row.code} · why this code?</summary>
            <p className="mt-2 text-sm text-[var(--vx-ink-soft)]">
              This configured ND rule matches {row.categoryLabel}. Applicable hours: {row.hours ?? "TBD"}. Rate reference: {row.percentage.endsWith("%") ? row.percentage : `${row.percentage}%`}.
            </p>
            <p className="mt-1 text-sm text-[var(--vx-muted)]">
              {row.amountStatus === "estimated" ? "2211 is shown as an estimate from its confirmed 10% ordinary-day formula." : "The mapping or money formula remains TBD; Voyix does not turn this reference percentage into a payroll amount."}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}

export { WageMatchDisclosure }
export type { WageMatchDisclosureProps }
