import { beforeEach, describe, expect, it, vi } from "vitest"

import { revalidatePath } from "next/cache"
import { createClient, getRequestClaims } from "@/lib/supabase/server"
import { loadSettings } from "../queries/settings"
import { updateComputation, updateProfile, type SettingsActionState } from "./settings"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  getRequestClaims: vi.fn(),
}))

vi.mock("@/server/settings/display-rate", async () => await import("../settings/display-rate"))
vi.mock("@/server/settings/parse-settings", async () => await import("../settings/parse-settings"))

const ownerId = "11111111-1111-4111-8111-111111111111"
const attackerId = "22222222-2222-4222-8222-222222222222"
const emptyState: SettingsActionState = { fieldErrors: {} }

function mockClaims(sub: string | null) {
  vi.mocked(getRequestClaims).mockResolvedValue(
    (sub
      ? { data: { claims: { sub } }, error: null }
      : { data: null, error: null }) as Awaited<ReturnType<typeof getRequestClaims>>,
  )
}

function profileForm(overrides: Record<string, string> = {}) {
  const formData = new FormData()
  const fields = {
    name: "Ada",
    monthlyBasicSalary: "34800",
    workScheduleType: "STANDARD",
    scheduledRegularHours: "8",
    id: attackerId,
    email: "attacker@example.com",
    legacy_hourly_rate: "999",
    ...overrides,
  }
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value)
  }
  return formData
}

function computationForm(overrides: Record<string, string> = {}) {
  const formData = new FormData()
  const fields = {
    ndStart: "22:00",
    ndEnd: "06:00",
    breakHours: "1",
    id: attackerId,
    ...overrides,
  }
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value)
  }
  return formData
}

function mockUpdateClient(error: { message: string } | null = null) {
  const eq = vi.fn().mockResolvedValue({ error })
  const update = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ update }))
  vi.mocked(createClient).mockResolvedValue(
    { from } as unknown as Awaited<ReturnType<typeof createClient>>,
  )
  return { from, update, eq }
}

function thenable<T>(result: T) {
  return {
    then(
      onFulfilled: (value: T) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) {
      return Promise.resolve(result).then(onFulfilled, onRejected)
    },
  }
}

function mockLoadClient(options: {
  employee: { data: unknown; error: { message: string } | null }
  wages: { data: unknown; error: { message: string } | null }
}) {
  const employeeSelect = vi.fn()
  const employeeEq = vi.fn()
  const maybeSingle = vi.fn().mockResolvedValue(options.employee)
  employeeEq.mockReturnValue({ maybeSingle })
  employeeSelect.mockReturnValue({ eq: employeeEq })

  const wageSelect = vi.fn()
  const order = vi.fn()
  const wageBuilder = {
    select: wageSelect,
    order,
    then: thenable(options.wages).then,
  }
  wageSelect.mockReturnValue(wageBuilder)
  order.mockReturnValue(wageBuilder)

  const from = vi.fn((table: string) => {
    if (table === "employees") {
      return { select: employeeSelect }
    }
    return wageBuilder
  })

  vi.mocked(createClient).mockResolvedValue(
    { from } as unknown as Awaited<ReturnType<typeof createClient>>,
  )
  return { from, employeeSelect, employeeEq }
}

const employeeRow = {
  name: "Ada",
  email: "ada@example.com",
  monthly_basic_salary: "34800",
  work_schedule_type: "STANDARD",
  scheduled_regular_hours: "8",
  nd_start: "22:00:00",
  nd_end: "06:00:00",
  break_hours: "1",
}

const wageRows = [
  {
    id: "wt-2211",
    code: "2211",
    category: "REGULAR_WORK_DAY",
    hours_category: "FIRST_8",
    percentage: 10,
    description: "Ordinary day, night shift, first 8 hours",
    active: true,
    is_nd: true,
  },
  {
    id: "wt-2252",
    code: "2252",
    category: "REGULAR_WORK_DAY",
    hours_category: "EXCESS",
    percentage: 138,
    description: "Ordinary day, night shift, excess of the first 8 hours",
    active: true,
    is_nd: true,
  },
]

describe("updateProfile and updateComputation", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset()
    vi.mocked(getRequestClaims).mockReset()
    vi.mocked(revalidatePath).mockReset()
  })

  it("does not call from() when signed out", async () => {
    mockClaims(null)
    const client = mockUpdateClient()

    const profile = await updateProfile(emptyState, profileForm())
    const computation = await updateComputation(emptyState, computationForm())

    expect(profile).toEqual({
      fieldErrors: {},
      formError: "Sign in to save this.",
    })
    expect(computation).toEqual({
      fieldErrors: {},
      formError: "Sign in to save this.",
    })
    expect(client.from).not.toHaveBeenCalled()
  })

  it("updates only the claims sub row and never writes legacy_hourly_rate, email, or id", async () => {
    mockClaims(ownerId)
    const client = mockUpdateClient()

    const result = await updateProfile(emptyState, profileForm())

    expect(result).toEqual({ fieldErrors: {}, formNotice: "Saved." })
    expect(client.from).toHaveBeenCalledWith("employees")
    expect(client.update).toHaveBeenCalledWith({
      name: "Ada",
      monthly_basic_salary: "34800.00",
      work_schedule_type: "STANDARD",
      scheduled_regular_hours: "8.00",
    })
    expect(client.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ legacy_hourly_rate: expect.anything() }),
    )
    expect(client.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ email: expect.anything() }),
    )
    expect(client.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ id: expect.anything() }),
    )
    expect(client.eq).toHaveBeenCalledWith("id", ownerId)
    expect(client.eq).not.toHaveBeenCalledWith("id", attackerId)
    expect(revalidatePath).toHaveBeenCalledWith("/settings")
    expect(revalidatePath).toHaveBeenCalledWith("/shift/new")
  })

  it("sends only ND window and break hours for a computation update", async () => {
    mockClaims(ownerId)
    const client = mockUpdateClient()

    const result = await updateComputation(emptyState, computationForm())

    expect(result).toEqual({ fieldErrors: {}, formNotice: "Saved." })
    expect(client.update).toHaveBeenCalledWith({
      nd_start: "22:00",
      nd_end: "06:00",
      break_hours: "1.00",
    })
    expect(client.eq).toHaveBeenCalledWith("id", ownerId)
  })

  it("returns a generic save error when the database write fails", async () => {
    mockClaims(ownerId)
    mockUpdateClient({ message: "permission denied" })

    const result = await updateProfile(emptyState, profileForm())

    expect(result).toEqual({
      fieldErrors: {},
      formError: "Could not save your settings. Try again.",
    })
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe("loadSettings", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset()
    vi.mocked(getRequestClaims).mockReset()
  })

  it("does not select legacy_hourly_rate on the employee row", async () => {
    mockClaims(ownerId)
    const client = mockLoadClient({
      employee: { data: employeeRow, error: null },
      wages: { data: wageRows, error: null },
    })

    await loadSettings()

    const selectArg = String(client.employeeSelect.mock.calls[0]?.[0] ?? "")
    expect(selectArg).not.toContain("legacy_hourly_rate")
    expect(selectArg).toBe(
      "name, email, monthly_basic_salary, work_schedule_type, scheduled_regular_hours, nd_start, nd_end, break_hours",
    )
    expect(client.employeeEq).toHaveBeenCalledWith("id", ownerId)
  })

  it("marks 2211 confirmed and 2252 Formula TBD while keeping 2252's percentage", async () => {
    mockClaims(ownerId)
    mockLoadClient({
      employee: { data: employeeRow, error: null },
      wages: { data: wageRows, error: null },
    })

    const result = await loadSettings()
    expect(result.status).toBe("ready")
    if (result.status !== "ready") {
      return
    }

    const ordinary = result.wages.find((row) => row.code === "2211")
    const excess = result.wages.find((row) => row.code === "2252")
    expect(ordinary?.formulaLabel).toBe("Confirmed 10% estimate")
    expect(excess?.formulaLabel).toBe("Formula TBD")
    expect(excess?.percentage).toBe("138.00")
    expect(result.profile.displayedHourlyRate).toBe("200.00000000")
  })
})
