import { afterEach, expect, it, vi } from "vitest"
import { loadOverview } from "./overview"
import { createClient, getRequestClaims } from "@/lib/supabase/server"

vi.mock("@/lib/format", async () => import("../../lib/format"))
vi.mock("@/lib/record-summary", async () => import("../../lib/record-summary"))
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(), getRequestClaims: vi.fn() }))
afterEach(() => vi.useRealTimers())

it.each(["none", "overlap", "current", "error", "shift-error", "all-tbd"])("loads an honest dashboard when period resolution is %s", async (state) => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date("2026-10-19T00:00:00Z"))
  vi.mocked(getRequestClaims).mockResolvedValue({ data: { claims: { sub: "employee" } } } as Awaited<ReturnType<typeof getRequestClaims>>)
  const shifts = {
    select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(), lte: vi.fn().mockResolvedValue({ data: [{
      work_date: "2026-10-18", shift_start: "2026-10-18T22:00:00+08:00",
      shift_end: "2026-10-19T06:00:00+08:00", day_classification: "REGULAR_WORK_DAY",
      nd_records: [{ id: "record", nd_hours: "8.00", nd_wage_type_lines: [
        { wage_type_code: "2211", amount_status: state === "all-tbd" ? "tbd" : "estimated", calculated_amount_centavos: state === "all-tbd" ? null : 10000 },
        { wage_type_code: "unresolved", amount_status: "tbd", calculated_amount_centavos: 99999 },
      ] }],
    }], error: state === "shift-error" ? { message: "request failed" } : null }),
  }
  const periods = { select: vi.fn().mockReturnThis(), eq: vi.fn() }
  const period = { id: "period", active: true, period_start: "2026-10-01", period_end: "2026-10-31", pay_date: null, cutoff_date: null, cutoff_time: null }
  periods.eq.mockReturnValueOnce(periods).mockResolvedValueOnce({
    data: state === "current" ? [period] : state === "overlap" ? [period, { ...period, id: "other" }] : [],
    error: state === "error" ? { message: "unavailable" } : null,
  })
  vi.mocked(createClient).mockResolvedValue({ from: (table: string) => table === "shifts" ? shifts : periods } as unknown as Awaited<ReturnType<typeof createClient>>)
  const result = await loadOverview()
  if (state === "error") {
    expect(result).toEqual({ status: "error" })
    expect(shifts.select).not.toHaveBeenCalled()
    return
  }
  if (state === "shift-error") { expect(result).toEqual({ status: "error" }); return }
  expect(result.status).toBe("ready")
  if (result.status !== "ready") throw new Error("Expected a usable dashboard")
  expect(result.scope).toBe(state === "current" ? "period" : "month")
  expect(result.periodNotice).toBe(state === "current" ? null : state === "all-tbd" ? "none" : state)
  expect(result.period).toEqual({ periodStart: "2026-10-01", periodEnd: "2026-10-31", cutoffLabel: null })
  expect(shifts.eq).toHaveBeenCalledWith("employee_id", "employee")
  expect(shifts.gte).toHaveBeenCalledWith("work_date", "2026-10-01")
  expect(shifts.lte).toHaveBeenCalledWith("work_date", "2026-10-31")
  expect(result.summary).toMatchObject({ totalNdHours: "8.00", estimatedCentavos: state === "all-tbd" ? 0 : 10000, tbdLineCount: state === "all-tbd" ? 2 : 1 })
  expect(result.hasKnownAmount).toBe(state !== "all-tbd")
  expect(result.rows).toHaveLength(1)
  expect(result.activity).toEqual([{ date: "2026-10-18", hours: "8.00" }])
})
