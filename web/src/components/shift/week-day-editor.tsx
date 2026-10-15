import type { DayClassification, WorkScheduleType } from "@/engine/types"
import { Field } from "@/components/forms/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { WeekShiftDraft } from "@/server/shift/week-entry"
import type { ShiftFieldErrors } from "@/server/shift/parse-shift-entry"

import { weekRowFieldId } from "./week-workflow"

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

type WeekDayEditorProps = {
  row: WeekShiftDraft
  errors?: ShiftFieldErrors
  onUpdate: (patch: Partial<WeekShiftDraft>) => void
}

function WeekDayEditor({ row, errors = {}, onUpdate }: WeekDayEditorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label={`Edit shift for ${row.workDate}`}>
      <Field label="Work date" htmlFor={weekRowFieldId(row.id, "workDate")} error={errors.workDate}>
        <Input id={weekRowFieldId(row.id, "workDate")} type="date" value={row.workDate} onChange={(event) => onUpdate({ workDate: event.target.value })} className="h-11 font-mono" aria-invalid={errors.workDate ? true : undefined} />
      </Field>
      <Field label="Start" htmlFor={weekRowFieldId(row.id, "shiftStart")} error={errors.shiftStart}>
        <Input id={weekRowFieldId(row.id, "shiftStart")} type="time" value={row.shiftStart} onChange={(event) => onUpdate({ shiftStart: event.target.value })} className="h-11 font-mono" aria-invalid={errors.shiftStart ? true : undefined} />
      </Field>
      <Field label="End" htmlFor={weekRowFieldId(row.id, "shiftEnd")} error={errors.shiftEnd}>
        <Input id={weekRowFieldId(row.id, "shiftEnd")} type="time" value={row.shiftEnd} onChange={(event) => onUpdate({ shiftEnd: event.target.value })} className="h-11 font-mono" aria-invalid={errors.shiftEnd ? true : undefined} />
      </Field>
      <Field label="Classification" htmlFor={weekRowFieldId(row.id, "dayClassification")} error={errors.dayClassification}>
        <Select id={weekRowFieldId(row.id, "dayClassification")} value={row.dayClassification} onValueChange={(value) => onUpdate({ dayClassification: value as DayClassification })} options={CLASSIFICATIONS} aria-invalid={errors.dayClassification ? true : undefined} />
      </Field>
      <Field label="Break included in ND" htmlFor={weekRowFieldId(row.id, "breakIncludedInNd")} error={errors.breakIncludedInNd}>
        <Select id={weekRowFieldId(row.id, "breakIncludedInNd")} name={`${row.id}-break`} value={row.breakIncludedInNd} onValueChange={(value) => onUpdate({ breakIncludedInNd: value })} options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]} aria-invalid={errors.breakIncludedInNd ? true : undefined} />
      </Field>
      <Field label="Schedule type" htmlFor={weekRowFieldId(row.id, "scheduleType")} error={errors.scheduleType}>
        <Select id={weekRowFieldId(row.id, "scheduleType")} name={`${row.id}-schedule`} value={row.scheduleType} onValueChange={(value) => onUpdate({ scheduleType: value as WorkScheduleType, scheduledRegularHours: value === "STANDARD" ? "8.00" : row.scheduledRegularHours })} options={[{ value: "STANDARD", label: "Standard" }, { value: "APPROVED_CWW", label: "Approved CWW" }]} aria-invalid={errors.scheduleType ? true : undefined} />
      </Field>
      <Field label="Scheduled regular hours" htmlFor={weekRowFieldId(row.id, "scheduledRegularHours")} error={errors.scheduledRegularHours}>
        <Input id={weekRowFieldId(row.id, "scheduledRegularHours")} value={row.scheduledRegularHours} readOnly={row.scheduleType === "STANDARD"} inputMode="decimal" onChange={(event) => onUpdate({ scheduledRegularHours: event.target.value })} className="h-11 font-mono" aria-invalid={errors.scheduledRegularHours ? true : undefined} />
      </Field>
      <Field label="Overtime agreed or approved" htmlFor={weekRowFieldId(row.id, "overtimeApproved")} error={errors.overtimeApproved}>
        <Select id={weekRowFieldId(row.id, "overtimeApproved")} name={`${row.id}-ot`} value={row.overtimeApproved} onValueChange={(value) => onUpdate({ overtimeApproved: value })} options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]} aria-invalid={errors.overtimeApproved ? true : undefined} />
      </Field>
    </div>
  )
}

export { WeekDayEditor }
export type { WeekDayEditorProps }
