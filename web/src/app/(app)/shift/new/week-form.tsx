"use client"

import { DateTime } from "luxon"
import { useActionState, useEffect, useMemo, useReducer, useState } from "react"

import { StatusLine } from "@/components/forms/status-line"
import { Panel } from "@/components/shell/panel"
import { WeekDayEditorDrawer } from "@/components/shift/week-day-editor-drawer"
import { WeekLedger } from "@/components/shift/week-ledger"
import { WeekReview } from "@/components/shift/week-review"
import {
  buildWeekRows,
  firstWeekErrorTarget,
  summarizeWeek,
  weekErrorTargets,
  weekRowFieldId,
  type ShiftField,
} from "@/components/shift/week-workflow"
import { Button, ButtonLink } from "@/components/ui/button"
import type { WageTypeRule } from "@/engine/types"
import { formatPhp } from "@/lib/format"
import { saveWeekAction } from "@/server/actions/week"
import { calculateWeekRows, type WeekShiftDraft } from "@/server/shift/week-entry"
import type { ShiftFieldErrors, ShiftProfile } from "@/server/shift/parse-shift-entry"

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

type DraftState = {
  rows: WeekShiftDraft[]
  idempotencyKey: string
  hydrated: boolean
  recovered: boolean
  dirty: boolean
}

type DraftAction =
  | { type: "hydrate"; rows: WeekShiftDraft[]; idempotencyKey: string }
  | { type: "ready" }
  | { type: "rows"; rows: WeekShiftDraft[]; dirty?: boolean }
  | { type: "key"; idempotencyKey: string }

function draftReducer(state: DraftState, action: DraftAction): DraftState {
  if (action.type === "hydrate") return { rows: action.rows, idempotencyKey: action.idempotencyKey, hydrated: true, recovered: true, dirty: true }
  if (action.type === "ready") return { ...state, hydrated: true }
  if (action.type === "rows") return { ...state, rows: action.rows, dirty: action.dirty ?? true }
  return { ...state, idempotencyKey: action.idempotencyKey }
}

function focusField(rowId: string, field: ShiftField) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => document.getElementById(weekRowFieldId(rowId, field))?.focus())
  })
}

function WeekForm({ profile, rules, employeeKey, sourceEvents, onBack }: WeekFormProps) {
  const [draft, dispatchDraft] = useReducer(draftReducer, undefined, () => {
    const today = DateTime.now().setZone(profile.timeZone).toISODate() ?? ""
    return { rows: buildWeekRows(today, profile.timeZone), idempotencyKey: crypto.randomUUID(), hydrated: false, recovered: false, dirty: false }
  })
  const { rows, idempotencyKey, hydrated, recovered, dirty: draftDirty } = draft
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [view, setView] = useState<"edit" | "review">("edit")
  const [attemptedReview, setAttemptedReview] = useState(false)
  const [returnToReview, setReturnToReview] = useState(false)
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
          const savedDraft = parsed as { rows?: unknown; idempotencyKey?: unknown }
          if (Array.isArray(savedDraft.rows) && typeof savedDraft.idempotencyKey === "string" && savedDraft.rows.every((row) => row && typeof row === "object")) {
            dispatchDraft({ type: "hydrate", rows: savedDraft.rows as WeekShiftDraft[], idempotencyKey: savedDraft.idempotencyKey })
            recoveredDraft = true
          }
        }
      }
    } catch {
      // Draft recovery is best effort and never blocks entry.
    } finally {
      if (!recoveredDraft) dispatchDraft({ type: "ready" })
    }
  }, [draftStorageKey])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.sessionStorage.setItem(draftStorageKey, JSON.stringify({ idempotencyKey, rows }))
    } catch {
      // A blocked session store must not prevent calculation or saving.
    }
  }, [draftStorageKey, hydrated, idempotencyKey, rows])

  useEffect(() => {
    if (!state.savedIds) return
    try {
      window.sessionStorage.removeItem(draftStorageKey)
    } catch {
      // Cleanup is best effort.
    }
  }, [draftStorageKey, state.savedIds])

  const calculations = useMemo(() => calculateWeekRows(rows, profile, rules), [rows, profile, rules])
  const clientErrors = useMemo(() => {
    const errors: Record<string, ShiftFieldErrors> = {}
    if (!attemptedReview) return errors
    for (const calculation of calculations) {
      if (calculation.status === "needs-review" && calculation.fieldErrors) errors[calculation.id] = calculation.fieldErrors
    }
    return errors
  }, [attemptedReview, calculations])
  const allErrors = useMemo(() => ({ ...clientErrors, ...state.fieldErrors }), [clientErrors, state.fieldErrors])
  const summary = useMemo(() => summarizeWeek(rows, calculations), [rows, calculations])
  const serverError = firstWeekErrorTarget(rows, state.fieldErrors)
  const displayView = serverError ? "edit" : view
  const resolvedActiveRowId = serverError?.rowId ?? (rows.some((row) => row.id === activeRowId) ? activeRowId : null)
  const activeRow = rows.find((row) => row.id === resolvedActiveRowId) ?? null
  const firstError = firstWeekErrorTarget(rows, allErrors)
  const errorTargets = weekErrorTargets(rows, allErrors)
  const canSave = displayView === "review" && summary.includedCount > 0 && summary.needsReviewCount === 0
  const rangeStart = DateTime.fromISO(rows[0]?.workDate ?? "", { zone: profile.timeZone })
  const rangeEnd = DateTime.fromISO(rows.at(-1)?.workDate ?? "", { zone: profile.timeZone })
  const rangeLabel = rangeStart.isValid && rangeEnd.isValid ? `${rangeStart.toFormat("MMM d")}–${rangeEnd.toFormat("MMM d, yyyy")}` : "Selected week"
  const sourceLabels = Object.fromEntries(sourceEvents.map((event) => [event.date, event.label]))

  function markEdited() {
    if (state.savedIds && !editedAfterSave) {
      setEditedAfterSave(true)
      dispatchDraft({ type: "key", idempotencyKey: crypto.randomUUID() })
    }
  }

  function updateRow(id: string, patch: Partial<WeekShiftDraft>) {
    markEdited()
    dispatchDraft({ type: "rows", rows: rows.map((row) => row.id === id ? { ...row, ...patch } : row) })
    setAttemptedReview(false)
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
    setAttemptedReview(false)
  }

  function addAnotherShift(source: WeekShiftDraft) {
    markEdited()
    const duplicate = { ...source, id: `${source.id}-${crypto.randomUUID()}` }
    const index = rows.findIndex((row) => row.id === source.id)
    dispatchDraft({ type: "rows", rows: index < 0 ? [...rows, duplicate] : [...rows.slice(0, index + 1), duplicate, ...rows.slice(index + 1)] })
    setActiveRowId(duplicate.id)
    setAttemptedReview(false)
  }

  function replaceWeek(referenceDate: string) {
    const nextRows = buildWeekRows(referenceDate, profile.timeZone)
    dispatchDraft({ type: "rows", rows: nextRows, dirty: false })
    dispatchDraft({ type: "key", idempotencyKey: crypto.randomUUID() })
    setActiveRowId(null)
    setView("edit")
    setAttemptedReview(false)
    setReturnToReview(false)
    setEditedAfterSave(Boolean(state.savedIds))
  }

  function navigateWeek(days: number) {
    const hasUnsavedChanges = draftDirty && (!state.savedIds || editedAfterSave)
    if (hasUnsavedChanges && !window.confirm("Move to another week? Unsaved changes in this week will be discarded.")) return
    const firstDate = rows[0]?.workDate
    const reference = firstDate ? DateTime.fromISO(firstDate, { zone: profile.timeZone }).plus({ days }).toISODate() : null
    if (reference) replaceWeek(reference)
  }

  function requestReview() {
    setAttemptedReview(true)
    const calculatedErrors: Record<string, ShiftFieldErrors> = {}
    for (const calculation of calculations) {
      if (calculation.status === "needs-review" && calculation.fieldErrors) calculatedErrors[calculation.id] = calculation.fieldErrors
    }
    const target = firstWeekErrorTarget(rows, calculatedErrors)
    if (target) {
      setView("edit")
      setActiveRowId(target.rowId)
      focusField(target.rowId, target.field)
      return
    }
    if (summary.includedCount === 0) return
    setReturnToReview(false)
    setView("review")
  }

  function changeFromReview(rowId: string, field: ShiftField) {
    setView("edit")
    setReturnToReview(true)
    setActiveRowId(rowId)
    focusField(rowId, field)
  }

  function confirmDiscard() {
    if (!window.confirm("Discard this week draft?")) return
    try { window.sessionStorage.removeItem(draftStorageKey) } catch { /* best effort */ }
    onBack()
  }

  const today = DateTime.now().setZone(profile.timeZone).toISODate() ?? ""

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-[0.12em] text-[var(--vx-muted)] uppercase">Week ledger · private draft</p>
          <p className="mt-1 font-mono text-sm tabular-nums text-[var(--vx-ink)]">{rangeLabel}</p>
        </div>
        <Button type="button" variant="outline" onClick={confirmDiscard}>Day entry</Button>
      </div>

      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-5 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--vx-ink)]">{displayView === "review" ? "Review this week" : "Choose shifts for this week"}</h2>
              <p className="mt-1 text-sm text-[var(--vx-muted)]">{displayView === "review" ? "Check every included shift before one atomic save." : "Open one day at a time. Source dates never change classification automatically."}</p>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Week navigation">
              <Button type="button" variant="quiet" onClick={() => navigateWeek(-7)}>Previous week</Button>
              <Button type="button" variant="outline" onClick={() => replaceWeek(today)}>This week</Button>
              <Button type="button" variant="quiet" onClick={() => navigateWeek(7)}>Next week</Button>
            </div>
          </div>

          {recovered ? <p role="status" className="text-sm text-[var(--vx-ink-soft)]">Recovered an unsaved draft from this device.</p> : null}
          {firstError ? (
            <aside role="alert" aria-labelledby="week-errors-title" className="border-l-4 border-[var(--vx-rose)] bg-[var(--vx-rose-bg)] p-4">
              <h3 id="week-errors-title" className="text-sm font-semibold">Review the highlighted shift</h3>
              <ul className="mt-1">
                {errorTargets.map((target) => <li key={`${target.rowId}-${target.field}`}><a href={`#${target.targetId}`} onClick={(event) => { event.preventDefault(); setView("edit"); setActiveRowId(target.rowId); focusField(target.rowId, target.field) }} className="inline-block min-h-11 py-2 text-sm font-medium text-[var(--vx-brand)] underline">{target.message}</a></li>)}
              </ul>
            </aside>
          ) : null}

          {displayView === "edit" ? (
            <>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={applyTemplate}>Apply first shift template</Button>
                {returnToReview ? <Button type="button" onClick={requestReview}>Return to review</Button> : null}
                <Button type="button" variant="quiet" onClick={confirmDiscard}>Clear draft</Button>
              </div>
              <WeekLedger rows={rows} calculations={calculations} activeRowId={resolvedActiveRowId} errors={allErrors} sourceLabels={sourceLabels} onSelect={(rowId) => setActiveRowId((current) => current === rowId ? null : rowId)} onToggle={(rowId, included) => updateRow(rowId, { included })} onUpdate={updateRow} onDuplicate={addAnotherShift} />
              <WeekDayEditorDrawer row={activeRow?.included ? activeRow : null} errors={activeRow ? allErrors[activeRow.id] : undefined} onClose={() => setActiveRowId(null)} onUpdate={(patch) => activeRow && updateRow(activeRow.id, patch)} />
            </>
          ) : <WeekReview rows={rows} calculations={calculations} sourceLabels={sourceLabels} onChange={changeFromReview} />}

          {pending ? <StatusLine tone="pending">this week</StatusLine> : null}
          {!pending && state.formError ? <StatusLine tone="error">{state.formError}</StatusLine> : null}
          {!pending && state.savedIds && !editedAfterSave ? (
            <div className="flex flex-col gap-3">
              <StatusLine tone="saved">{state.savedIds.length} entries saved privately for {rangeLabel}</StatusLine>
              <div className="flex flex-wrap gap-3"><ButtonLink href="/records" variant="outline">Open records</ButtonLink><Button type="button" variant="quiet" onClick={() => navigateWeek(7)}>Add another week</Button></div>
            </div>
          ) : null}

          <form action={formAction} className="flex flex-wrap gap-3">
            <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
            <input type="hidden" name="rows" value={JSON.stringify(rows)} readOnly />
            {displayView === "edit" ? <Button type="button" onClick={requestReview} disabled={summary.includedCount === 0}>Review week</Button> : <Button type="button" variant="quiet" onClick={() => setView("edit")}>Back to editing</Button>}
            <Button type="submit" variant="outline" disabled={!canSave || pending} aria-disabled={!canSave || pending}>Save reviewed entries</Button>
          </form>
        </div>
      </Panel>

      <aside aria-label="Week totals" className="sticky bottom-[calc(var(--vx-bottom-nav)+env(safe-area-inset-bottom))] z-10 grid grid-cols-2 gap-3 border border-[var(--vx-line-strong)] bg-[var(--vx-brand-deep)] px-4 py-3 text-[var(--vx-on-deep)] shadow-lg sm:bottom-4 sm:grid-cols-5">
        <p><span className="block text-xs text-[var(--vx-brand-light)]">Selected</span><strong className="font-mono tabular-nums">{summary.includedCount}</strong></p>
        <p><span className="block text-xs text-[var(--vx-brand-light)]">Final ND</span><strong className="font-mono tabular-nums">{summary.finalNdHours} h</strong></p>
        <p><span className="block text-xs text-[var(--vx-brand-light)]">Known estimate</span><strong className="font-mono tabular-nums">{formatPhp(summary.knownEstimateCentavos)}</strong></p>
        <p><span className="block text-xs text-[var(--vx-brand-light)]">TBD</span><strong className="font-mono tabular-nums">{summary.tbdCount}</strong></p>
        <p><span className="block text-xs text-[var(--vx-brand-light)]">Needs review</span><strong className="font-mono tabular-nums">{summary.needsReviewCount}</strong></p>
      </aside>
    </div>
  )
}

export { WeekForm }
export type { WeekFormProps }
