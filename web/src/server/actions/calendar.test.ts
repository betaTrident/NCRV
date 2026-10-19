import { beforeEach, describe, expect, it, vi } from "vitest"

import { revalidatePath } from "next/cache"

import { createClient, getRequestClaims } from "@/lib/supabase/server"
import { addHoliday, addPayrollPeriod, updatePayrollPeriod, type CalendarActionState } from "./calendar"

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  getRequestClaims: vi.fn(),
}))

vi.mock("@/server/calendar/parse-calendar", async () => await import("../calendar/parse-calendar"))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

const ownerId = "11111111-1111-4111-8111-111111111111"
const otherId = "22222222-2222-4222-8222-222222222222"
const emptyState: CalendarActionState = { fieldErrors: {} }

function mockClaims(sub: string | null) {
  vi.mocked(getRequestClaims).mockResolvedValue(
    (sub
      ? { data: { claims: { sub } }, error: null }
      : { data: null, error: null }) as Awaited<ReturnType<typeof getRequestClaims>>,
  )
}

function mockInsert(result: { error: { message: string } | null }) {
  const insert = vi.fn().mockResolvedValue(result)
  const from = vi.fn(() => ({ insert }))
  vi.mocked(createClient).mockResolvedValue(
    { from } as unknown as Awaited<ReturnType<typeof createClient>>,
  )
  return { from, insert }
}

function holidayForm(overrides: Record<string, string> = {}) {
  const formData = new FormData()
  const fields = {
    holidayDate: "2026-10-03",
    name: "Weekend special",
    holidayType: "SPECIAL_PUBLIC_HOLIDAY",
    ...overrides,
  }
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value)
  }
  return formData
}

function periodForm(overrides: Record<string, string> = {}) {
  const formData = new FormData()
  const fields = {
    periodStart: "2026-10-01",
    periodEnd: "2026-10-15",
    payDate: "",
    cutoffDate: "",
    cutoffTime: "",
    ...overrides,
  }
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value)
  }
  return formData
}

describe("calendar actions", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset()
    vi.mocked(getRequestClaims).mockReset()
    vi.mocked(revalidatePath).mockReset()
  })

  it("returns a sign-in error and never calls from() when addHoliday is signed out", async () => {
    mockClaims(null)
    const { from } = mockInsert({ error: null })

    const result = await addHoliday(emptyState, holidayForm())

    expect(result).toEqual({
      fieldErrors: {},
      formError: "Sign in to save this.",
    })
    expect(from).not.toHaveBeenCalled()
  })

  it("returns a sign-in error and never calls from() when addPayrollPeriod is signed out", async () => {
    mockClaims(null)
    const { from } = mockInsert({ error: null })

    const result = await addPayrollPeriod(emptyState, periodForm())

    expect(result).toEqual({
      fieldErrors: {},
      formError: "Sign in to save this.",
    })
    expect(from).not.toHaveBeenCalled()
  })

  it("inserts a holiday with owner_id from claims.sub even if FormData has another owner_id", async () => {
    mockClaims(ownerId)
    const { insert } = mockInsert({ error: null })

    const result = await addHoliday(
      emptyState,
      holidayForm({ owner_id: otherId }),
    )

    expect(result).toEqual({ fieldErrors: {}, formNotice: "Saved." })
    expect(insert).toHaveBeenCalledWith({
      owner_id: ownerId,
      holiday_date: "2026-10-03",
      name: "Weekend special",
      holiday_type: "SPECIAL_PUBLIC_HOLIDAY",
      year: 2026,
      active: true,
    })
  })

  it("inserts a payroll period with owner_id from claims.sub even if FormData has another owner_id", async () => {
    mockClaims(ownerId)
    const { insert } = mockInsert({ error: null })

    const result = await addPayrollPeriod(
      emptyState,
      periodForm({ owner_id: otherId }),
    )

    expect(result).toEqual({ fieldErrors: {}, formNotice: "Saved." })
    expect(insert).toHaveBeenCalledWith({
      owner_id: ownerId,
      period_start: "2026-10-01",
      period_end: "2026-10-15",
      pay_date: null,
      cutoff_date: null,
      cutoff_time: null,
      active: true,
    })
  })

  it("returns a database formError when holiday insert fails", async () => {
    mockClaims(ownerId)
    mockInsert({ error: { message: "insert failed" } })

    const result = await addHoliday(emptyState, holidayForm())

    expect(result).toEqual({
      fieldErrors: {},
      formError: "Could not save this. Try again.",
    })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it("stores the submitted weekend holiday type instead of REST_DAY", async () => {
    mockClaims(ownerId)
    const { insert } = mockInsert({ error: null })

    await addHoliday(
      emptyState,
      holidayForm({
        holidayDate: "2026-10-03",
        holidayType: "SPECIAL_PUBLIC_HOLIDAY",
      }),
    )

    expect(insert).toHaveBeenCalledOnce()
    const payload = insert.mock.calls[0]?.[0] as { holiday_type: string }
    expect(payload.holiday_type).toBe("SPECIAL_PUBLIC_HOLIDAY")
    expect(payload.holiday_type).not.toBe("REST_DAY")
  })

  it("revalidates /calendar, /, and /records after a successful holiday insert", async () => {
    mockClaims(ownerId)
    mockInsert({ error: null })

    await addHoliday(emptyState, holidayForm())

    expect(revalidatePath).toHaveBeenCalledWith("/calendar")
    expect(revalidatePath).toHaveBeenCalledWith("/")
    expect(revalidatePath).toHaveBeenCalledWith("/records")
    expect(revalidatePath).toHaveBeenCalledTimes(3)
  })

  it("revalidates /calendar, /, and /records after a successful period insert", async () => {
    mockClaims(ownerId)
    mockInsert({ error: null })

    await addPayrollPeriod(emptyState, periodForm())

    expect(revalidatePath).toHaveBeenCalledWith("/calendar")
    expect(revalidatePath).toHaveBeenCalledWith("/")
    expect(revalidatePath).toHaveBeenCalledWith("/records")
    expect(revalidatePath).toHaveBeenCalledTimes(3)
  })
})


describe("updatePayrollPeriod ownership", () => {
  it("uses claims owner, validates id, and reports an inaccessible period", async () => {
    mockClaims(ownerId)
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    const select = vi.fn(() => ({ maybeSingle }))
    const eq = vi.fn(() => ({ eq, select }))
    const update = vi.fn(() => ({ eq }))
    vi.mocked(createClient).mockResolvedValue({ from: () => ({ update }) } as unknown as Awaited<ReturnType<typeof createClient>>)
    const result = await updatePayrollPeriod(emptyState, periodForm({ id: otherId, owner_id: otherId }))
    expect(eq).toHaveBeenCalledWith("owner_id", ownerId)
    expect(eq).toHaveBeenCalledWith("id", otherId)
    expect(result.formError).toBeTruthy()
    update.mockClear()
    await updatePayrollPeriod(emptyState, periodForm({ id: "invalid" }))
    expect(update).not.toHaveBeenCalled()
  })
})
