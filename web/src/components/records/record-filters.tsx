"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Field } from "@/components/forms/field"
import { Button, ButtonLink } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Segmented } from "@/components/ui/segmented"
import { Select } from "@/components/ui/select"

type RecordFiltersProps = { range?: string; from?: string; to?: string; sort?: string }

const OPTIONS = [
  { value: "week", label: "Week" },
  { value: "period", label: "Payroll period" },
  { value: "month", label: "Month" },
  { value: "custom", label: "Custom" },
]

function normalizedRange(range?: string) {
  return range === "period" || range === "month" || range === "custom"
    ? range
    : "week"
}

/** URL-backed presets with an in-place Custom reveal before valid dates exist. */
function RecordFilters({ range, from, to, sort }: RecordFiltersProps) {
  const router = useRouter()
  const [selected, setSelected] = useState(normalizedRange(range))
  const [selectedSort, setSelectedSort] = useState(sort === "oldest" ? "oldest" : "newest")
  const [pending, startTransition] = useTransition()
  const customActive = selected === "custom"

  function selectRange(value: string) {
    setSelected(value)
    const search = new URLSearchParams({ range: value })
    if (selectedSort === "oldest") search.set("sort", "oldest")
    startTransition(() => router.push(`/records?${search.toString()}`))
  }

  function selectSort(value: string) {
    setSelectedSort(value)
    const search = new URLSearchParams({ range: selected })
    if (selected === "custom" && from && to) {
      search.set("from", from)
      search.set("to", to)
    }
    if (value === "oldest") search.set("sort", "oldest")
    startTransition(() => router.push(`/records?${search.toString()}`))
  }

  return (
    <section aria-labelledby="records-range-heading" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3"><h2 id="records-range-heading" className="text-sm font-semibold text-[var(--vx-ink)]">
          Date range
        </h2><ButtonLink href="/records" variant="quiet">Reset range</ButtonLink></div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div aria-busy={pending || undefined} className="max-w-full overflow-x-auto pb-1">
            <Segmented name="records-range" value={selected} options={OPTIONS} onValueChange={selectRange} />
          </div>
          <div className="w-full sm:w-48">
            <label htmlFor="records-sort" className="mb-1.5 block text-xs font-medium text-[var(--vx-muted)]">Order</label>
            <Select id="records-sort" value={selectedSort} onValueChange={selectSort} options={[{ value: "newest", label: "Newest first" }, { value: "oldest", label: "Oldest first" }]} aria-label="Record order" />
          </div>
        </div>
        {pending ? <p role="status" className="text-xs text-[var(--vx-muted)]">Loading range…</p> : null}
      </div>

      {customActive ? (
        <form
          key={`${from ?? ""}:${to ?? ""}`}
          action="/records"
          method="get"
          aria-labelledby="records-custom-range-label"
          className="flex flex-col gap-3 rounded-[var(--vx-radius-panel)] border border-[var(--vx-brand)] bg-[var(--vx-brand-tint)] p-4 sm:p-5"
        >
          <input type="hidden" name="range" value="custom" />
          {selectedSort === "oldest" ? <input type="hidden" name="sort" value="oldest" /> : null}
          <p id="records-custom-range-label" className="text-sm font-semibold text-[var(--vx-ink)]">
            Choose a custom date range
          </p>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,14rem)_minmax(0,14rem)_auto] sm:items-end">
            <Field label="Start date" htmlFor="records-from">
              <Input id="records-from" name="from" type="date" defaultValue={from ?? ""} className="font-mono" required />
            </Field>
            <Field label="End date" htmlFor="records-to">
              <Input id="records-to" name="to" type="date" defaultValue={to ?? ""} className="font-mono" required />
            </Field>
            <Button type="submit">Apply range</Button>
          </div>
        </form>
      ) : null}
    </section>
  )
}

export { RecordFilters }
export type { RecordFiltersProps }
