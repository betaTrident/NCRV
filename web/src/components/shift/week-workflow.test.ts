import { describe, expect, it } from "vitest"

import type { WeekRowCalculation, WeekShiftDraft } from "@/server/shift/week-entry"

import {
  buildWeekRows,
  firstWeekErrorTarget,
  summarizeWeek,
  weekErrorTargets,
  weekRowFieldId,
} from "./week-workflow"

function row(id: string, workDate: string): WeekShiftDraft {
  return {
    id,
    workDate,
    shiftStart: "21:00",
    shiftEnd: "06:00",
    dayClassification: "REGULAR_WORK_DAY",
    breakIncludedInNd: "false",
    scheduleType: "STANDARD",
    scheduledRegularHours: "8.00",
    overtimeApproved: "false",
    included: true,
  }
}

describe("Week workflow helpers", () => {
  it("builds a Monday-first week without changing the selected source date classification", () => {
    const rows = buildWeekRows("2026-10-14", "Asia/Manila")

    expect(rows).toHaveLength(7)
    expect(rows[0]).toMatchObject({
      id: "week-2026-10-12",
      workDate: "2026-10-12",
      dayClassification: "REGULAR_WORK_DAY",
      included: true,
    })
    expect(rows[6]).toMatchObject({ workDate: "2026-10-18", included: false })
  })

  it("summarizes ready, TBD, and invalid included rows without counting excluded rows", () => {
    const rows = [row("ready", "2026-10-12"), row("tbd", "2026-10-13"), row("bad", "2026-10-14"), { ...row("off", "2026-10-15"), included: false }]
    const calculations: WeekRowCalculation[] = [
      {
        id: "ready",
        status: "ready",
        result: {
          ndHours: "7.00",
          lines: [{ status: "estimated", centavos: 14000 }],
          unresolved: [],
        } as never,
      },
      {
        id: "tbd",
        status: "ready",
        result: {
          ndHours: "6.00",
          lines: [{ status: "tbd", reason: "Money formula is not confirmed." }],
          unresolved: ["Money formula is not confirmed."],
        } as never,
      },
      { id: "bad", status: "needs-review", fieldErrors: { shiftStart: "Enter a valid start time." } },
      { id: "off", status: "not-included" },
    ]

    expect(summarizeWeek(rows, calculations)).toEqual({
      includedCount: 3,
      readyCount: 2,
      needsReviewCount: 1,
      tbdCount: 1,
      finalNdHours: "13.00",
      knownEstimateCentavos: 14000,
    })
  })

  it("returns a stable linked target for the first row error", () => {
    const errors = {
      "row-a": { scheduledRegularHours: "Enter scheduled hours." },
      "row-b": { shiftStart: "Enter a start time." },
    }

    expect(firstWeekErrorTarget([row("row-a", "2026-10-12"), row("row-b", "2026-10-13")], errors)).toEqual({
      rowId: "row-a",
      field: "scheduledRegularHours",
      targetId: weekRowFieldId("row-a", "scheduledRegularHours"),
      message: "Enter scheduled hours.",
    })
    expect(weekErrorTargets([row("row-a", "2026-10-12"), row("row-b", "2026-10-13")], errors).map((target) => target.targetId)).toEqual([
      weekRowFieldId("row-a", "scheduledRegularHours"),
      weekRowFieldId("row-b", "shiftStart"),
    ])
  })
})
