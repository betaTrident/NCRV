import Link from "next/link"
import { cn } from "cn"

import { Field } from "@/components/forms/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type RecordFiltersProps = {
  range?: string
  from?: string
  to?: string
}

const PRESETS = [
  { href: "/records?range=week", range: "week", label: "This Week" },
  { href: "/records?range=period", range: "period", label: "This Payroll Period" },
  { href: "/records?range=month", range: "month", label: "This Month" },
] as const

function isWeekRange(range?: string) {
  return range === undefined || range === "" || range === "week"
}

/**
 * URL-only range filters: three shareable links and a GET form for custom dates.
 */
function RecordFilters({ range, from, to }: RecordFiltersProps) {
  const customActive = range === "custom"

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Record range" className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const isActive =
            preset.range === "week" ? isWeekRange(range) : range === preset.range

          return (
            <Button
              key={preset.range}
              asChild
              variant="outline"
              className={
                isActive
                  ? "border-[var(--vx-brand)] bg-[var(--vx-brand-tint)] text-[var(--vx-brand)]"
                  : undefined
              }
            >
              <Link
                href={preset.href}
                aria-current={isActive ? "page" : undefined}
              >
                {preset.label}
              </Link>
            </Button>
          )
        })}
      </nav>
      <form
        key={`${range ?? ""}:${from ?? ""}:${to ?? ""}`}
        action="/records"
        method="get"
        aria-labelledby="records-custom-range-label"
        className={cn(
          "flex flex-col gap-3 rounded-[var(--vx-radius-control)] border border-[var(--vx-line)] bg-[var(--vx-surface)] p-4",
          customActive && "border-[var(--vx-brand)] bg-[var(--vx-brand-tint)]",
        )}
      >
        <input type="hidden" name="range" value="custom" />
        <p
          id="records-custom-range-label"
          aria-current={customActive ? "page" : undefined}
          className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase"
        >
          Custom range
        </p>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,14rem)_minmax(0,14rem)_auto] sm:items-end">
          <Field label="Start date" htmlFor="records-from">
            <Input
              id="records-from"
              name="from"
              type="date"
              defaultValue={from ?? ""}
              className="h-11 font-mono"
            />
          </Field>
          <Field label="End date" htmlFor="records-to">
            <Input
              id="records-to"
              name="to"
              type="date"
              defaultValue={to ?? ""}
              className="h-11 font-mono"
            />
          </Field>
          <Button type="submit">Apply range</Button>
        </div>
      </form>
    </div>
  )
}

export { RecordFilters }
export type { RecordFiltersProps }
