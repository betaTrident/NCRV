import type {
  AmountLine,
  DayClassification,
  HoursCategory,
  NdResult,
  ShiftInput,
  WorkScheduleType,
} from "./types"

export type ShiftSnapshotLine = {
  wageTypeId: string
  wageTypeCode: string
  category: DayClassification
  hoursCategory: HoursCategory
  applicableHours: string | null
  percentage: string
  amountStatus: "estimated" | "tbd"
  calculatedAmountCentavos: number | null
  unresolvedReason: string | null
}

export type ShiftSnapshot = {
  workDate: string
  shiftStart: string
  shiftEnd: string
  dayClassification: DayClassification
  breakIncludedInNd: boolean
  workScheduleType: WorkScheduleType
  scheduledRegularHours: string
  overtimeApproved: boolean
  potentialNdHours: string
  breakHours: string
  ndHours: string
  ndStart: string
  ndEnd: string
  timeZone: string
  calculationVersion: 2
  monthlyBasicSalary: string | null
  annualMonths: "12" | null
  workdaysFactor: "261" | null
  rateHoursPerDay: "8" | null
  derivedDailyRate: string | null
  derivedHourlyRate: string | null
  elapsedHours: string
  workedHours: string
  regularHours: string
  potentialOvertimeHours: string
  approvedOvertimeHours: string
  unapprovedExtraHours: string
  lines: ShiftSnapshotLine[]
}

function mapLine(line: AmountLine): ShiftSnapshotLine {
  if (line.status === "estimated") {
    return {
      wageTypeId: line.wageTypeId,
      wageTypeCode: line.code,
      category: line.category,
      hoursCategory: line.hoursCategory,
      applicableHours: line.hours,
      percentage: line.percentage,
      amountStatus: "estimated",
      calculatedAmountCentavos: line.centavos,
      unresolvedReason: null,
    }
  }

  return {
    wageTypeId: line.wageTypeId,
    wageTypeCode: line.code,
    category: line.category,
    hoursCategory: line.hoursCategory,
    applicableHours: line.hours,
    percentage: line.percentage,
    amountStatus: "tbd",
    calculatedAmountCentavos: null,
    unresolvedReason: line.reason,
  }
}

export function toShiftSnapshot(input: ShiftInput, result: NdResult): ShiftSnapshot {
  const rates = result.rateBasis

  return {
    workDate: input.workDate,
    shiftStart: result.normalizedShiftStart,
    shiftEnd: result.normalizedShiftEnd,
    dayClassification: result.dayClassification,
    breakIncludedInNd: result.breakIncludedInNd,
    workScheduleType: input.scheduleType,
    scheduledRegularHours: result.scheduledRegularHours,
    overtimeApproved: input.overtimeApproved,
    potentialNdHours: result.potentialNdHours,
    breakHours: result.breakHours,
    ndHours: result.ndHours,
    ndStart: input.ndStart,
    ndEnd: input.ndEnd,
    timeZone: input.timeZone,
    calculationVersion: 2,
    monthlyBasicSalary: rates?.monthlyBasicSalary ?? null,
    annualMonths: rates?.annualMonths ?? null,
    workdaysFactor: rates?.workdaysFactor ?? null,
    rateHoursPerDay: rates?.rateHoursPerDay ?? null,
    derivedDailyRate: rates?.dailyRate ?? null,
    derivedHourlyRate: rates?.hourlyRate ?? null,
    elapsedHours: result.elapsedHours,
    workedHours: result.workedHours,
    regularHours: result.regularHours,
    potentialOvertimeHours: result.potentialOvertimeHours,
    approvedOvertimeHours: result.approvedOvertimeHours,
    unapprovedExtraHours: result.unapprovedExtraHours,
    lines: result.lines.map(mapLine),
  }
}
