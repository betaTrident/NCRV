"use server"

import { revalidatePath } from "next/cache"

import { calculateNd } from "@/engine/calculate-nd"
import { createClient, getRequestClaims } from "@/lib/supabase/server"
import { loadShiftConfiguration } from "@/server/queries/shift-configuration"
import { saveWeek, type SaveWeekResult } from "@/server/shift/save-week"
import type { ShiftSnapshot } from "@/engine/snapshot"

function snapshotRpcArgs(snapshot: ShiftSnapshot) {
  return {
    work_date: snapshot.workDate,
    shift_start: snapshot.shiftStart,
    shift_end: snapshot.shiftEnd,
    day_classification: snapshot.dayClassification,
    break_included_in_nd: snapshot.breakIncludedInNd,
    work_schedule_type: snapshot.workScheduleType,
    scheduled_regular_hours: snapshot.scheduledRegularHours,
    overtime_approved: snapshot.overtimeApproved,
    potential_nd_hours: snapshot.potentialNdHours,
    break_hours: snapshot.breakHours,
    nd_hours: snapshot.ndHours,
    nd_start: snapshot.ndStart,
    nd_end: snapshot.ndEnd,
    time_zone: snapshot.timeZone,
    calculation_version: snapshot.calculationVersion,
    monthly_basic_salary: snapshot.monthlyBasicSalary,
    annual_months: snapshot.annualMonths,
    workdays_factor: snapshot.workdaysFactor,
    rate_hours_per_day: snapshot.rateHoursPerDay,
    derived_daily_rate: snapshot.derivedDailyRate,
    derived_hourly_rate: snapshot.derivedHourlyRate,
    elapsed_hours: snapshot.elapsedHours,
    worked_hours: snapshot.workedHours,
    regular_hours: snapshot.regularHours,
    potential_overtime_hours: snapshot.potentialOvertimeHours,
    approved_overtime_hours: snapshot.approvedOvertimeHours,
    unapproved_extra_hours: snapshot.unapprovedExtraHours,
    lines: snapshot.lines.map((line) => ({
      wage_type_id: line.wageTypeId,
      wage_type_code: line.wageTypeCode,
      category: line.category,
      hours_category: line.hoursCategory,
      applicable_hours: line.applicableHours,
      percentage: line.percentage,
      amount_status: line.amountStatus,
      calculated_amount_centavos: line.calculatedAmountCentavos,
      unresolved_reason: line.unresolvedReason,
    })),
  }
}

function readIds(data: unknown): string[] | null {
  if (!data || typeof data !== "object" || !("ids" in data)) return null
  const ids = data.ids
  return Array.isArray(ids) && ids.every((id) => typeof id === "string") ? ids : null
}

async function saveWeekAction(
  _previous: SaveWeekResult,
  formData: FormData,
): Promise<SaveWeekResult> {
  const supabase = await createClient()
  const { data: claimData } = await getRequestClaims()
  const sub = claimData?.claims?.sub
  const profile = await loadShiftConfiguration()

  const result = await saveWeek(
    {
      claims: typeof sub === "string" && sub.length > 0 ? { sub } : null,
      profile,
      calculate: calculateNd,
      persist: async (idempotencyKey, snapshots, inputRows) => {
        const { data, error } = await supabase.rpc("save_week_snapshot_batch", {
          p_idempotency_key: idempotencyKey,
          p_input_rows: inputRows,
          p_snapshots: snapshots.map(snapshotRpcArgs),
        })
        if (error) return { error: true }
        const ids = readIds(data)
        return ids ? { ids } : { error: true }
      },
    },
    formData,
  )

  if (result.savedIds) {
    revalidatePath("/")
    revalidatePath("/shift/new")
    revalidatePath("/records")
    revalidatePath("/calendar")
  }
  return result
}

export { saveWeekAction }
