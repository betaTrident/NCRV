"use client"

import { useState } from "react"
import { WageCodeChip } from "@/components/shift/wage-code-chip"
import { Panel } from "@/components/shell/panel"
import { Input } from "@/components/ui/input"
import { Segmented } from "@/components/ui/segmented"
import type { WageCatalogRow, CodeSource } from "@/server/queries/settings"

type WageCatalogProps = { wages: WageCatalogRow[]; source: CodeSource | null }
const categoryLabels: Record<string, string> = { REGULAR_WORK_DAY: "Ordinary day", REST_DAY: "Rest day", SPECIAL_PUBLIC_HOLIDAY: "Special public holiday", SPECIAL_PUBLIC_HOLIDAY_REST_DAY: "Special public holiday + rest day", REGULAR_PUBLIC_HOLIDAY: "Regular/public holiday", REGULAR_PUBLIC_HOLIDAY_REST_DAY: "Regular/public holiday + rest day", DOUBLE_REGULAR_HOLIDAY: "Double regular holiday", DOUBLE_REGULAR_HOLIDAY_REST_DAY: "Double regular holiday + rest day" }

export function WageCatalog({wages, source}: WageCatalogProps) {
  const [search, setSearch] = useState("")
  const [group, setGroup] = useState("all")
  const rows = [...wages.map(w => ({code:w.code, category:categoryLabels[w.category] ?? w.category, hours:w.hoursCategory === "FIRST_8" ? "First 8 hours" : "Excess hours", percentage:w.percentage, active:w.active, formula:w.formulaLabel, group:w.isNd ? "nd" : "reference"})), ...(source?.rows ?? []).map(w => ({...w, active:false, formula:"Formula TBD", group:"reference"}))]
  const filtered = rows.filter(w => (group === "all" || w.group === group) && `${w.code} ${w.category} ${w.hours}`.toLowerCase().includes(search.trim().toLowerCase()))
  return <Panel className="p-6 sm:p-8"><div className="flex flex-col gap-5">
    <div><p className="mb-2 font-mono text-xs uppercase tracking-widest text-[var(--vx-muted)]">Understand your codes</p><h2 className="text-lg font-semibold">ADP code explorer</h2></div>
    <p className="max-w-prose text-sm text-[var(--vx-ink-soft)]">Read-only reference. Source percentages are labelled “TOTAL % to be added”; they do not establish a money formula. Only ordinary-day 2211 has a confirmed 10% estimate.</p>
    <p className="text-xs text-[var(--vx-muted)]">Source: {source?.file ?? "New Hire — Setting of Expectations"}, page {source?.page ?? "3"}. Non-ND codes are reference only and never enter calculations.</p>
    {!source ? <p role="status" className="text-sm text-[var(--vx-amber-ink)]">The sourced reference catalog is unavailable. Configured ND codes remain visible.</p> : null}
    <div className="flex flex-wrap items-end gap-4"><div className="min-w-0 flex-1"><label htmlFor="code-search" className="mb-1.5 block text-sm font-medium">Find a code or category</label><Input id="code-search" type="search" value={search} onChange={e => setSearch(e.target.value)} /></div><div className="max-w-full overflow-x-auto"><Segmented name="code-group" value={group} options={[{value:"all",label:"All"},{value:"nd",label:"Night differential"},{value:"reference",label:"Reference only"}]} onValueChange={setGroup} /></div></div>
    <p role="status" className="font-mono text-xs text-[var(--vx-muted)]">{filtered.length} codes</p>
    <ul className="divide-y divide-[var(--vx-line)]">
      {filtered.map(w => <li key={`${w.group}-${w.code}`} className="grid gap-3 py-4 sm:grid-cols-[80px_1fr_160px]">
        <div><WageCodeChip code={w.code} tbd={w.formula === "Formula TBD"} /></div>
        <div><h3 className="text-sm font-semibold">{w.category}</h3><p className="mt-1 text-sm text-[var(--vx-ink-soft)]">{w.hours}</p><p className="mt-1 text-xs text-[var(--vx-muted)]">{w.active ? "Engine active" : "Reference only"} · {w.formula}</p></div>
        <div><p className="font-mono text-base tabular-nums">{w.percentage}%</p><p className="text-xs text-[var(--vx-muted)]">TOTAL % to be added</p><p className="mt-1 text-xs text-[var(--vx-muted)]">Applicable hours appear only after calculation.</p></div>
      </li>)}
    </ul>
    {filtered.length === 0 ? <p className="text-sm">No codes match. Try a code number or category.</p> : null}
  </div></Panel>
}
export type { WageCatalogProps }
