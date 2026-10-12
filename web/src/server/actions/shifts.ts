"use server"

import { revalidatePath } from "next/cache"

import { calculateNd } from "@/engine/calculate-nd"
import { toShiftSnapshot } from "@/engine/snapshot"
import { createClient, getRequestClaims } from "@/lib/supabase/server"
import { loadShiftConfiguration } from "@/server/queries/shift-configuration"
import { saveShift, type SaveShiftResult } from "@/server/shift/save-shift"

type ShiftActionState = SaveShiftResult

function snapshotRpcArgs(snapshot: ReturnType<typeof toShiftSnapshot>) {
  return {
    p_work_date: snapshot.workDate,
    p_shift_start: snapshot.shiftStart,
    p_shift_end: snapshot.shiftEnd,
    p_day_classification: snapshot.dayClassification,
    p_break_included_in_nd: snapshot.breakIncludedInNd,
    p_work_schedule_type: snapshot.workScheduleType,
    p_scheduled_regular_hours: snapshot.scheduledRegularHours,
    p_overtime_approved: snapshot.overtimeApproved,
    p_potential_nd_hours: snapshot.potentialNdHours,
    p_break_hours: snapshot.breakHours,
    p_nd_hours: snapshot.ndHours,
    p_nd_start: snapshot.ndStart,
    p_nd_end: snapshot.ndEnd,
    p_time_zone: snapshot.timeZone,
    p_calculation_version: snapshot.calculationVersion,
    p_monthly_basic_salary: snapshot.monthlyBasicSalary,
    p_annual_months: snapshot.annualMonths,
    p_workdays_factor: snapshot.workdaysFactor,
    p_rate_hours_per_day: snapshot.rateHoursPerDay,
    p_derived_daily_rate: snapshot.derivedDailyRate,
    p_derived_hourly_rate: snapshot.derivedHourlyRate,
    p_elapsed_hours: snapshot.elapsedHours,
    p_worked_hours: snapshot.workedHours,
    p_regular_hours: snapshot.regularHours,
    p_potential_overtime_hours: snapshot.potentialOvertimeHours,
    p_approved_overtime_hours: snapshot.approvedOvertimeHours,
    p_unapproved_extra_hours: snapshot.unapprovedExtraHours,
    p_lines: snapshot.lines.map((line) => ({
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

function readSavedId(data: unknown): string | null {
  if (typeof data === "string" && data.length > 0) {
    return data
  }
  if (data && typeof data === "object" && "id" in data) {
    const id = data.id
    if (typeof id === "string" && id.length > 0) {
      return id
    }
  }
  return null
}

async function saveShiftAction(
  _prev: ShiftActionState,
  formData: FormData,
): Promise<ShiftActionState> {
  const supabase = await createClient()
  const { data: claimData } = await getRequestClaims()
  const sub = claimData?.claims?.sub
  const claims = typeof sub === "string" && sub.length > 0 ? { sub } : null
  const profile = await loadShiftConfiguration()

  const result = await saveShift(
    {
      claims,
      profile,
      calculate: calculateNd,
      persist: async (snapshot) => {
        const { data, error } = await supabase.rpc(
          "save_shift_snapshot",
          snapshotRpcArgs(snapshot),
        )
        if (error) {
          return { error: true }
        }
        const id = readSavedId(data)
        if (!id) {
          return { error: true }
        }
        return { id }
      },
    },
    formData,
  )

  if (!result.savedId) {
    return result
  }

  revalidatePath("/")
  revalidatePath("/shift/new")
  return result
}

export { saveShiftAction }
