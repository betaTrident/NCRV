export type DayClassification =
  | "REGULAR_WORK_DAY"
  | "REST_DAY"
  | "SPECIAL_PUBLIC_HOLIDAY"
  | "SPECIAL_PUBLIC_HOLIDAY_REST_DAY"
  | "REGULAR_PUBLIC_HOLIDAY"
  | "REGULAR_PUBLIC_HOLIDAY_REST_DAY"
  | "DOUBLE_REGULAR_HOLIDAY"
  | "DOUBLE_REGULAR_HOLIDAY_REST_DAY"

export type HoursCategory = "FIRST_8" | "EXCESS"

export type WorkScheduleType = "STANDARD" | "APPROVED_CWW"

export type ShiftInput = {
  workDate: string
  shiftStart: string
  shiftEnd: string
  dayClassification: DayClassification
  monthlyBasicSalary: string | null
  timeZone: string
  ndStart: string
  ndEnd: string
  breakHours: string
  breakIncludedInNd: boolean
  scheduleType: WorkScheduleType
  scheduledRegularHours: string
  overtimeApproved: boolean
}

export type WageTypeRule = {
  id: string
  code: string
  category: DayClassification
  hoursCategory: HoursCategory
  percentage: string
  isNd: boolean
  description: string
}

export type RateBasis = {
  monthlyBasicSalary: string
  annualMonths: "12"
  workdaysFactor: "261"
  rateHoursPerDay: "8"
  dailyRate: string
  hourlyRate: string
}

export type AmountLine =
  | {
      status: "estimated"
      code: string
      hours: string
      percentage: string
      centavos: number
      formula: "ordinary_nd_10_percent"
    }
  | {
      status: "tbd"
      code: string
      hours: string | null
      percentage: string
      reason: string
    }

export type NdResult = {
  rateBasis: RateBasis | null
  elapsedHours: string
  workedHours: string
  scheduledRegularHours: string
  regularHours: string
  potentialOvertimeHours: string
  approvedOvertimeHours: string
  unapprovedExtraHours: string
  potentialNdHours: string
  breakHours: string
  breakIncludedInNd: boolean
  ndHours: string
  dayClassification: DayClassification
  hoursCategories: HoursCategory[]
  lines: AmountLine[]
  unresolved: string[]
}
