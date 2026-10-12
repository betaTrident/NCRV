import { beforeEach, describe, expect, it, vi } from "vitest"

import { formatPhp } from "../../lib/format"
import { createClient, getRequestClaims } from "@/lib/supabase/server"
import {
  loadRecordDetail,
  mapRecordDetail,
  mapRecordListRows,
  type RecordListRow,
} from "./records"

vi.mock("@/lib/format", async () => await import("../../lib/format"))
vi.mock("@/lib/record-filters", async () => await import("../../lib/record-filters"))
vi.mock("@/lib/record-summary", async () => await import("../../lib/record-summary"))
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  getRequestClaims: vi.fn(),
}))

const saturday = "2026-10-03"
const shiftStart = "2026-10-03T21:00:00.000+08:00"
const shiftEnd = "2026-10-04T06:00:00.000+08:00"

function estimatedLine(code: string, centavos: number) {
  return {
    wage_type_code: code,
    amount_status: "estimated",
    calculated_amount_centavos: centavos,
  }
}

function tbdLine(code: string, centavos: number | null = 99999) {
  return {
    wage_type_code: code,
    amount_status: "tbd",
    calculated_amount_centavos: centavos,
  }
}

function shiftRow(
  overrides: Record<string, unknown> = {},
  lines: unknown[] = [estimatedLine("2211", 14000), tbdLine("2252")],
) {
  return {
    id: "shift-saturday",
    work_date: saturday,
    shift_start: shiftStart,
    shift_end: shiftEnd,
    day_classification: "REGULAR_WORK_DAY",
    nd_records: {
      id: "nd-saturday",
      nd_hours: "7.00",
      nd_wage_type_lines: lines,
    },
    ...overrides,
  }
}

describe("mapRecordListRows", () => {
  it("maps two wage lines on one Saturday record to a single Regular Work Day row", () => {
    const rows = mapRecordListRows([shiftRow()])

    expect(rows).toEqual<RecordListRow[]>([
      {
        id: "nd-saturday",
        workDate: saturday,
        workDateLabel: "Oct 3",
        shiftLabel: "9:00 PM–6:00 AM",
        dayLabel: "Regular Work Day",
        ndHours: "7.00",
        wageCodes: "2211, 2252",
        amountLabel: `${formatPhp(14000)} · TBD`,
      },
    ])
  })

  it("formats estimated centavos with formatPhp and excludes tbd amounts", () => {
    const estimatedOnly = mapRecordListRows([
      shiftRow({}, [estimatedLine("2211", 14000)]),
    ])
    const tbdOnly = mapRecordListRows([shiftRow({}, [tbdLine("2252")])])

    expect(estimatedOnly?.[0]?.amountLabel).toBe(formatPhp(14000))
    expect(tbdOnly?.[0]?.amountLabel).toBe("TBD")
  })

  it("labels empty wage lines with an em dash", () => {
    const rows = mapRecordListRows([shiftRow({}, [])])

    expect(rows?.[0]?.wageCodes).toBe("—")
    expect(rows?.[0]?.amountLabel).toBe("—")
  })

  it("returns null for a malformed embed", () => {
    expect(
      mapRecordListRows([
        shiftRow({
          nd_records: { error: "could not embed nd_records" },
        }),
      ]),
    ).toBeNull()
  })

  it("maps an empty shift array to an empty list", () => {
    expect(mapRecordListRows([])).toEqual([])
  })

  it("returns null when an estimated line has non-integer centavos", () => {
    expect(
      mapRecordListRows([shiftRow({}, [estimatedLine("2211", 14000.5)])]),
    ).toBeNull()
  })
})

describe("mapRecordDetail", () => {
  it("renders saved salary, rates, schedule, duty hours, ND window, and wage lines without recalculating", () => {
    const detail = mapRecordDetail({
      id: "nd-locked",
      potential_nd_hours: "8.00",
      break_hours: "1.00",
      break_included_in_nd: false,
      nd_hours: "7.00",
      nd_start: "22:00:00",
      nd_end: "06:00:00",
      time_zone: "Asia/Manila",
      calculation_version: 2,
      monthly_basic_salary: "34800.00",
      annual_months: "12",
      workdays_factor: "261",
      rate_hours_per_day: "8",
      derived_daily_rate: "1600.00000000",
      derived_hourly_rate: "200.00000000",
      work_schedule_type: "STANDARD",
      scheduled_regular_hours: "8.00",
      elapsed_hours: "9.00",
      worked_hours: "8.00",
      regular_hours: "8.00",
      potential_overtime_hours: "0.00",
      approved_overtime_hours: "0.00",
      unapproved_extra_hours: "0.00",
      overtime_approved: false,
      shifts: {
        employee_id: "employee-1",
        work_date: "2026-10-01",
        shift_start: "2026-10-01T21:00:00.000+08:00",
        shift_end: "2026-10-02T06:00:00.000+08:00",
        day_classification: "REGULAR_WORK_DAY",
      },
      nd_wage_type_lines: [
        {
          wage_type_code: "2211",
          category: "REGULAR_WORK_DAY",
          hours_category: "FIRST_8",
          applicable_hours: "7.00",
          percentage: "10",
          amount_status: "estimated",
          calculated_amount_centavos: 14000,
          unresolved_reason: null,
        },
        {
          wage_type_code: "2252",
          category: "REGULAR_WORK_DAY",
          hours_category: "EXCESS",
          applicable_hours: null,
          percentage: "138",
          amount_status: "tbd",
          calculated_amount_centavos: null,
          unresolved_reason:
            "Money formula is not confirmed for this wage type.",
        },
      ],
    })

    expect(detail).not.toBeNull()
    expect(detail?.id).toBe("nd-locked")
    expect(detail?.workDateLabel).toBe("October 1, 2026")
    expect(detail?.shiftLabel).toBe("9:00 PM – 6:00 AM")
    expect(detail?.dayLabel).toBe("Regular Work Day")
    expect(detail?.elapsedHours).toBe("9.00")
    expect(detail?.workedHours).toBe("8.00")
    expect(detail?.regularHours).toBe("8.00")
    expect(detail?.potentialOvertimeHours).toBe("0.00")
    expect(detail?.approvedOvertimeHours).toBe("0.00")
    expect(detail?.unapprovedExtraHours).toBe("0.00")
    expect(detail?.potentialNdHours).toBe("8.00")
    expect(detail?.breakHours).toBe("1.00")
    expect(detail?.breakIncludedLabel).toBe("No")
    expect(detail?.ndHours).toBe("7.00")
    expect(detail?.scheduleLabel).toBe("Standard")
    expect(detail?.scheduledRegularHours).toBe("8.00")
    expect(detail?.overtimeApprovedLabel).toBe("No")
    expect(detail?.ndWindowLabel).toBe("10:00 PM – 6:00 AM")
    expect(detail?.timeZone).toBe("Asia/Manila")
    expect(detail?.salaryLabel).toBe(
      new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
      }).format(34800),
    )
    expect(detail?.dailyRateLabel).toBe(
      new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      }).format(1600),
    )
    expect(detail?.hourlyRateLabel).toBe(
      new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      }).format(200),
    )
    expect(detail?.lines).toEqual([
      {
        code: "2211",
        categoryLabel: "Regular Work Day",
        hoursCategoryLabel: "First 8 Hours",
        hours: "7.00",
        percentage: "10%",
        amountStatus: "estimated",
        amountLabel: formatPhp(14000),
        unresolvedReason: null,
      },
      {
        code: "2252",
        categoryLabel: "Regular Work Day",
        hoursCategoryLabel: "Excess",
        hours: null,
        percentage: "138%",
        amountStatus: "tbd",
        amountLabel: "TBD",
        unresolvedReason: "Money formula is not confirmed for this wage type.",
      },
    ])
  })

  it("returns null for a non-object", () => {
    expect(mapRecordDetail(null)).toBeNull()
    expect(mapRecordDetail("nd-locked")).toBeNull()
  })
})

describe("records module", () => {
  it("does not export calculateNd", async () => {
    const records = await import("./records")
    expect(records).not.toHaveProperty("calculateNd")
  })
})

const ownerId = "11111111-1111-4111-8111-111111111111"
const otherId = "22222222-2222-4222-8222-222222222222"
const recordId = "33333333-3333-4333-8333-333333333333"

function mockClaims(sub: string | null) {
  vi.mocked(getRequestClaims).mockResolvedValue(
    (sub
      ? { data: { claims: { sub } }, error: null }
      : { data: null, error: null }) as Awaited<ReturnType<typeof getRequestClaims>>,
  )
}

function mockDetailQuery(result: { data: unknown; error: { message: string } | null }) {
  const maybeSingle = vi.fn().mockResolvedValue(result)
  const eqOwner = vi.fn(() => ({ maybeSingle }))
  const eqId = vi.fn(() => ({ eq: eqOwner }))
  const select = vi.fn(() => ({ eq: eqId }))
  const from = vi.fn(() => ({ select }))
  vi.mocked(createClient).mockResolvedValue(
    { from } as unknown as Awaited<ReturnType<typeof createClient>>,
  )
  return { from, eqId, eqOwner }
}

describe("loadRecordDetail isolation", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset()
    vi.mocked(getRequestClaims).mockReset()
  })

  it("treats a missing id and another employee's record as unavailable", async () => {
    mockClaims(ownerId)

    await expect(loadRecordDetail("not-a-record")).resolves.toEqual({
      status: "unavailable",
    })

    const missing = mockDetailQuery({ data: null, error: null })
    await expect(loadRecordDetail(recordId)).resolves.toEqual({
      status: "unavailable",
    })
    expect(missing.eqId).toHaveBeenCalledWith("id", recordId)
    expect(missing.eqOwner).toHaveBeenCalledWith("shifts.employee_id", ownerId)

    mockDetailQuery({
      data: { shifts: { employee_id: otherId } },
      error: null,
    })
    await expect(loadRecordDetail(recordId)).resolves.toEqual({
      status: "unavailable",
    })
  })
})
