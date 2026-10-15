import { describe, expect, it } from "vitest"

import { buildTimeRulerModel } from "./time-ruler-model"

const intervals = {
  shift: {
    start: "2026-10-01T21:00:00.000+08:00",
    end: "2026-10-02T06:00:00.000+08:00",
  },
  windows: [
    {
      start: "2026-10-01T22:00:00.000+08:00",
      end: "2026-10-02T06:00:00.000+08:00",
    },
  ],
  overlaps: [
    {
      start: "2026-10-01T22:00:00.000+08:00",
      end: "2026-10-02T06:00:00.000+08:00",
    },
  ],
}

describe("buildTimeRulerModel", () => {
  it("uses one clock axis for shift, window, and overlap", () => {
    const model = buildTimeRulerModel(intervals, false)

    expect(model.axis).toEqual(intervals.shift)
    expect(model.ticks.length).toBeGreaterThan(0)
    expect(model.rows.map((row) => row.kind)).toEqual([
      "shift",
      "window",
      "potential",
    ])
    expect(model.rows[1]?.intervals[0]).toMatchObject({
      startPercent: 11.111,
      widthPercent: 88.889,
    })
  })

  it("plots final ND only when the known overlap is fully qualifying", () => {
    expect(buildTimeRulerModel(intervals, false).rows.some((row) => row.kind === "final")).toBe(false)
    expect(buildTimeRulerModel(intervals, true).rows.at(-1)?.kind).toBe("final")
  })
})
