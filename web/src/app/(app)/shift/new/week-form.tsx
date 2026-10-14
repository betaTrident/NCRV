"use client"

import { DateTime } from "luxon"
import { useActionState, useEffect, useMemo, useReducer, useState } from "react"

import { formatPhp } from "@/lib/format"
import { WageTypeTable } from "@/components/shift/wage-type-table"
import { Field } from "@/components/forms/field"
import { StatusLine } from "@/components/forms/status-line"
import { Panel } from "@/components/shell/panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { calculateWeekRows, type WeekShiftDraft } from "@/server/shift/week-entry"
import { saveWeekAction } from "@/server/actions/week"
import type { ShiftProfile } from "@/server/shift/parse-shift-entry"
import type { DayClassification, WageTypeRule } from "@/engine/types"

const CLASSIFICATIONS: { value: DayClassification; label: string }[] = [
  { value: "REGULAR_WORK_DAY", label: "Regular work day" },
  { value: "REST_DAY", label: "Rest day" },
  { value: "SPECIAL_PUBLIC_HOLIDAY", label: "Special public holiday" },
  { value: "SPECIAL_PUBLIC_HOLIDAY_REST_DAY", label: "Special public holiday + rest day" },
  { value: "REGULAR_PUBLIC_HOLIDAY", label: "Regular/public holiday" },
  { value: "REGULAR_PUBLIC_HOLIDAY_REST_DAY", label: "Regular/public holiday + rest day" },
  { value: "DOUBLE_REGULAR_HOLIDAY", label: "Double regular holiday" },
  { value: "DOUBLE_REGULAR_HOLIDAY_REST_DAY", label: "Double regular holiday + rest day" },
]

type WeekFormProps = {
  profile: ShiftProfile
  rules: WageTypeRule[]
  employeeKey: string
  sourceEvents: SourceEvent[]
  onBack: () => void
}

type SourceEvent = {
  date: string
  label: string
  kind: string
  classification: string | null
}

function initialRows(timeZone: string): WeekShiftDraft[] {
  const monday = DateTime.now().setZone(timeZone).startOf("week")
  return Array.from({ length: 7 }, (_, index) => {
    const date = monday.plus({ days: index }).toISODate() ?? ""
    return {
      id: `week-${date}`,
      workDate: date,
      shiftStart: "21:00",
      shiftEnd: "06:00",
      dayClassification: "REGULAR_WORK_DAY",
      breakIncludedInNd: "false",
      scheduleType: "STANDARD",
      scheduledRegularHours: "8.00",
      overtimeApproved: "false",
      included: index < 5,
    }
  })
}

type DraftState = {
  rows: WeekShiftDraft[]
  idempotencyKey: string
  hydrated: boolean
  recovered: boolean
}

type DraftAction =
  | { type: "hydrate"; rows: WeekShiftDraft[]; idempotencyKey: string }
  | { type: "ready" }
  | { type: "rows"; rows: WeekShiftDraft[] }
  | { type: "key"; idempotencyKey: string }

function draftReducer(state: DraftState, action: DraftAction): DraftState {
  if (action.type === "hydrate") return { rows: action.rows, idempotencyKey: action.idempotencyKey, hydrated: true, recovered: true }
  if (action.type === "ready") return { ...state, hydrated: true }
  if (action.type === "rows") return { ...state, rows: action.rows }
  return { ...state, idempotencyKey: action.idempotencyKey }
}

function WeekForm({ profile, rules, employeeKey, sourceEvents, onBack }: WeekFormProps) {
  const [draft, dispatchDraft] = useReducer(draftReducer, undefined, () => ({
    rows: initialRows(profile.timeZone),
    idempotencyKey: crypto.randomUUID(),
    hydrated: false,
    recovered: false,
  }))
  const { rows, idempotencyKey, hydrated, recovered } = draft
  const [reviewed, setReviewed] = useState(false)
  const [editedAfterSave, setEditedAfterSave] = useState(false)
  const [state, formAction, pending] = useActionState(saveWeekAction, { fieldErrors: {} })
  const draftStorageKey = `voyix-week-draft:${employeeKey}`

  useEffect(() => {
    let recoveredDraft = false
    try {
      const saved = window.sessionStorage.getItem(draftStorageKey)
      if (saved) {
        const parsed = JSON.parse(saved) as unknown
        if (parsed && typeof parsed === "object" && "rows" in parsed && "idempotencyKey" in parsed) {
          const draft = parsed as { rows?: unknown; idempotencyKey?: unknown }
          if (Array.isArray(draft.rows) && typeof draft.idempotencyKey === "string" && draft.rows.every((row) => row && typeof row === "object")) {
            dispatchDraft({ type: "hydrate", rows: draft.rows as WeekShiftDraft[], idempotencyKey: draft.idempotencyKey })
            recoveredDraft = true
          }
        }
      }
    } catch {
      // A blocked or malformed session draft should not prevent entry.
    } finally {
      if (!recoveredDraft) dispatchDraft({ type: "ready" })
    }
  }, [draftStorageKey])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.sessionStorage.setItem(draftStorageKey, JSON.stringify({ idempotencyKey, rows }))
    } catch {
      // Draft recovery is best effort and never blocks calculation.
    }
  }, [draftStorageKey, hydrated, idempotencyKey, rows])

  useEffect(() => {
    if (!state.savedIds) return
    try {
      window.sessionStorage.removeItem(draftStorageKey)
    } catch {
      // Best effort cleanup.
    }
  }, [draftStorageKey, state.savedIds])
  const calculations = useMemo(
    () => calculateWeekRows(rows, profile, rules),
    [rows, profile, rules],
  )
  const includedCount = rows.filter((row) => row.included).length
  const readyRows = calculations.filter((row) => row.status === "ready")
  const canSave = reviewed && includedCount > 0 && readyRows.length === includedCount

  function markEdited() {
    if (state.savedIds) {
      setEditedAfterSave(true)
      dispatchDraft({ type: "key", idempotencyKey: crypto.randomUUID() })
    }
  }

  function updateRow(id: string, patch: Partial<WeekShiftDraft>) {
    markEdited()
    dispatchDraft({ type: "rows", rows: rows.map((row) => (row.id === id ? { ...row, ...patch } : row)) })
    setReviewed(false)
  }

  function applyTemplate() {
    const template = rows.find((row) => row.included) ?? rows[0]
    if (!template) return
    markEdited()
    dispatchDraft({ type: "rows", rows: rows.map((row) => row.included ? {
      ...row,
      shiftStart: template.shiftStart,
      shiftEnd: template.shiftEnd,
      breakIncludedInNd: template.breakIncludedInNd,
      scheduleType: template.scheduleType,
      scheduledRegularHours: template.scheduledRegularHours,
      overtimeApproved: template.overtimeApproved,
    } : row) })
    setReviewed(false)
  }

  function addAnotherShift(source: WeekShiftDraft) {
    markEdited()
    const duplicate: WeekShiftDraft = { ...source, id: `${source.id}-${crypto.randomUUID()}` }
    const index = rows.findIndex((row) => row.id === source.id)
    dispatchDraft({ type: "rows", rows: index < 0 ? [...rows, duplicate] : [...rows.slice(0, index + 1), duplicate, ...rows.slice(index + 1)] })
    setReviewed(false)
  }

  function confirmDiscard() {
    if (window.confirm("Discard this week draft?")) {
      try { window.sessionStorage.removeItem(draftStorageKey) } catch { /* best effort */ }
      onBack()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs tracking-[0.12em] text-[var(--vx-muted)] uppercase">
          Week composer · private draft
        </p>
        <Button type="button" variant="outline" onClick={confirmDiscard}>Day entry</Button>
      </div>
      <Panel className="p-6 sm:p-8">
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="text-[15px] font-semibold text-[var(--vx-ink)]">Choose shifts for this week</h2>
            <p className="mt-1 text-sm text-[var(--vx-muted)]">Apply your usual times, then review every included day before saving.</p>
          </div>
          {recovered ? <p role="status" className="text-sm text-[var(--vx-ink-soft)]">Recovered an unsaved draft from this device.</p> : null}
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={applyTemplate}>Apply first shift template</Button>
            <Button type="button" variant="quiet" onClick={confirmDiscard}>Clear draft</Button>
          </div>
          <div className="flex flex-col gap-4">
            {rows.map((row, index) => {
              const calculation = calculations[index]
              return (
                <div key={row.id} className="rounded-[var(--vx-radius-panel)] border border-[var(--vx-line)] p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={row.included}
                        onChange={(event) => updateRow(row.id, { included: event.target.checked })}
                        className="size-4 accent-[var(--vx-brand)]"
                      />
                      {DateTime.fromISO(row.workDate).toFormat("ccc, MMM d")}
                    </label>
                    <span className="text-xs text-[var(--vx-muted)]">
                      {calculation?.status === "ready" ? `${calculation.result?.ndHours} h · ${calculation.result?.lines.map((line) => line.code).join(", ") || "No code"}` : calculation?.status === "not-included" ? "Not included" : "Needs review"}
                    </span>
                    {sourceEvents.some((event) => event.date === row.workDate) ? (
                      <span className="text-xs text-[var(--vx-amber-ink)]">Cebu 2026 source holiday · review classification</span>
                    ) : null}
                    {row.included ? (
                      <Button type="button" variant="quiet" onClick={() => addAnotherShift(row)}>
                        Add another shift
                      </Button>
                    ) : null}
                  </div>
                  {row.included ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <Field label="Work date" htmlFor={`${row.id}-date`} error={state.fieldErrors[row.id]?.workDate ?? (reviewed ? calculation?.fieldErrors?.workDate : undefined)}>
                        <Input id={`${row.id}-date`} type="date" value={row.workDate} onChange={(event) => updateRow(row.id, { workDate: event.target.value })} className="h-11 font-mono" />
                      </Field>
                      <Field label="Start" htmlFor={`${row.id}-start`} error={state.fieldErrors[row.id]?.shiftStart ?? (reviewed ? calculation?.fieldErrors?.shiftStart : undefined)}>
                        <Input id={`${row.id}-start`} type="time" value={row.shiftStart} onChange={(event) => updateRow(row.id, { shiftStart: event.target.value })} className="h-11 font-mono" />
                      </Field>
                      <Field label="End" htmlFor={`${row.id}-end`} error={state.fieldErrors[row.id]?.shiftEnd ?? (reviewed ? calculation?.fieldErrors?.shiftEnd : undefined)}>
                        <Input id={`${row.id}-end`} type="time" value={row.shiftEnd} onChange={(event) => updateRow(row.id, { shiftEnd: event.target.value })} className="h-11 font-mono" />
                      </Field>
                      <Field label="Classification" htmlFor={`${row.id}-classification`} error={state.fieldErrors[row.id]?.dayClassification ?? (reviewed ? calculation?.fieldErrors?.dayClassification : undefined)}>
                        <Select id={`${row.id}-classification`} value={row.dayClassification} onValueChange={(value) => updateRow(row.id, { dayClassification: value })} options={CLASSIFICATIONS} aria-invalid={state.fieldErrors[row.id]?.dayClassification ? true : undefined} />
                      </Field>
                      <Field label="Break included in ND" htmlFor={`${row.id}-break`} error={state.fieldErrors[row.id]?.breakIncludedInNd ?? (reviewed ? calculation?.fieldErrors?.breakIncludedInNd : undefined)}>
                        <Select id={`${row.id}-break`} name={`${row.id}-break`} value={row.breakIncludedInNd} onValueChange={(value) => updateRow(row.id, { breakIncludedInNd: value })} options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]} />
                      </Field>
                      <Field label="Schedule type" htmlFor={`${row.id}-schedule`} error={state.fieldErrors[row.id]?.scheduleType ?? (reviewed ? calculation?.fieldErrors?.scheduleType : undefined)}>
                        <Select id={`${row.id}-schedule`} name={`${row.id}-schedule`} value={row.scheduleType} onValueChange={(value) => updateRow(row.id, { scheduleType: value, scheduledRegularHours: value === "STANDARD" ? "8.00" : row.scheduledRegularHours })} options={[{ value: "STANDARD", label: "Standard" }, { value: "APPROVED_CWW", label: "Approved CWW" }]} />
                      </Field>
                      <Field label="Scheduled regular hours" htmlFor={`${row.id}-hours`} error={state.fieldErrors[row.id]?.scheduledRegularHours ?? (reviewed ? calculation?.fieldErrors?.scheduledRegularHours : undefined)}>
                        <Input id={`${row.id}-hours`} value={row.scheduledRegularHours} readOnly={row.scheduleType === "STANDARD"} onChange={(event) => updateRow(row.id, { scheduledRegularHours: event.target.value })} className="h-11 font-mono" />
                      </Field>
                      <Field label="Overtime agreed or approved" htmlFor={`${row.id}-ot`} error={state.fieldErrors[row.id]?.overtimeApproved ?? (reviewed ? calculation?.fieldErrors?.overtimeApproved : undefined)}>
                        <Select id={`${row.id}-ot`} name={`${row.id}-ot`} value={row.overtimeApproved} onValueChange={(value) => updateRow(row.id, { overtimeApproved: value })} options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]} />
                      </Field>
                    </div>
                  ) : null}
                  {calculation?.status === "ready" && calculation.result ? (
                    <details className="mt-3 border-t border-[var(--vx-line)] pt-3">
                      <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold text-[var(--vx-brand)]">Review calculation · {calculation.result.ndHours} ND hours</summary>
                      <dl className="grid grid-cols-2 gap-3 py-3 text-xs">
                        {[['Elapsed', calculation.result.elapsedHours], ['Worked', calculation.result.workedHours], ['Regular', calculation.result.regularHours], ['Potential overtime', calculation.result.potentialOvertimeHours], ['Approved overtime', calculation.result.approvedOvertimeHours], ['Unapproved extra', calculation.result.unapprovedExtraHours], ['Potential ND', calculation.result.potentialNdHours], ['Break', calculation.result.breakHours], ['Final ND', calculation.result.ndHours]].map(([label,value]) => <div key={label}><dt className="text-[var(--vx-muted)]">{label}</dt><dd className="font-mono">{value} h</dd></div>)}
                      </dl>
                      <p className="mb-3 text-xs text-[var(--vx-ink-soft)]">Break {calculation.result.breakIncludedInNd ? 'included in ND' : 'excluded from ND'}; its clock position is unknown. Hourly rate: <span className="font-mono">{calculation.result.rateBasis?.hourlyRate ?? 'TBD'}</span>. Basis: monthly basic salary × 12 ÷ 261 ÷ 8.</p>
                      <WageTypeTable rows={calculation.result.lines.map(line => ({code:line.code, categoryLabel:line.description,hours:line.hours,percentage:line.percentage,amountStatus:line.status,formattedAmount:line.status === 'estimated' ? formatPhp(line.centavos) : null}))} />
                      <p className="mt-2 text-xs text-[var(--vx-amber-ink)]">Estimate only. Unresolved money and allocation remain TBD.</p>
                      {calculation.result.unresolved.map(reason => <p key={reason} className="mt-2 text-xs">{reason}</p>)}
                    </details>
                  ) : null}
                </div>
              )
            })}
          </div>
          {pending ? <StatusLine tone="pending">this week</StatusLine> : null}
          {!pending && state.formError ? <StatusLine tone="error">{state.formError}</StatusLine> : null}
          {!pending && state.savedIds && !editedAfterSave ? <StatusLine tone="saved">{state.savedIds.length} entries saved privately</StatusLine> : null}
          <form action={formAction} className="flex flex-wrap gap-3">
            <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
            <input type="hidden" name="rows" value={JSON.stringify(rows)} readOnly />
            <Button type="button" onClick={() => setReviewed(true)} disabled={includedCount === 0}>
              Calculate selected days
            </Button>
            <Button type="submit" variant="outline" disabled={!canSave || pending} aria-disabled={!canSave || pending}>
              Save reviewed entries
            </Button>
          </form>
          {reviewed ? <p className="text-sm text-[var(--vx-ink-soft)]">Review: {includedCount} shifts · {readyRows.reduce((sum, row) => sum + Number(row.result?.ndHours ?? 0), 0).toFixed(2)} final ND hours. Each day is recalculated on the server before save.</p> : null}
        </div>
      </Panel>
    </div>
  )
}

export { WeekForm }
