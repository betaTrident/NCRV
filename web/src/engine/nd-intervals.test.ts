import { describe, expect, it } from "vitest"

import { buildNdIntervals } from "./nd-intervals"

describe("buildNdIntervals", () => {
  it("returns ISO intervals for the normalized shift, configured window, and their exact overlap", () => {
    const result = buildNdIntervals({
      shiftStart: "2026-10-01T21:00:00",
      shiftEnd: "2026-10-01T06:00:00",
      ndStart: "22:00",
      ndEnd: "06:00",
      timeZone: "Asia/Manila",
    })

    expect(result.shift).toEqual({
      start: "2026-10-01T21:00:00.000+08:00",
      end: "2026-10-02T06:00:00.000+08:00",
    })
    expect(result.windows).toEqual([
      {
        start: "2026-10-01T22:00:00.000+08:00",
        end: "2026-10-02T06:00:00.000+08:00",
      },
    ])
    expect(result.overlaps).toEqual(result.windows)
  })

  it("keeps a partial overlap at its true clock position", () => {
    const result = buildNdIntervals({
      shiftStart: "2026-10-01T23:00:00",
      shiftEnd: "2026-10-02T07:00:00",
      ndStart: "22:00",
      ndEnd: "06:00",
      timeZone: "Asia/Manila",
    })

    expect(result.overlaps).toEqual([
      {
        start: "2026-10-01T23:00:00.000+08:00",
        end: "2026-10-02T06:00:00.000+08:00",
      },
    ])
  })

  it("uses the previous night's window for an early-morning shift", () => {
    const result = buildNdIntervals({
      shiftStart: "2026-10-01T02:00:00",
      shiftEnd: "2026-10-01T06:00:00",
      ndStart: "22:00",
      ndEnd: "06:00",
      timeZone: "Asia/Manila",
    })

    expect(result.overlaps).toEqual([
      {
        start: "2026-10-01T02:00:00.000+08:00",
        end: "2026-10-01T06:00:00.000+08:00",
      },
    ])
  })

  it("keeps the nearest configured window visible when a daytime shift has no overlap", () => {
    const result = buildNdIntervals({
      shiftStart: "2026-10-01T09:00:00",
      shiftEnd: "2026-10-01T17:00:00",
      ndStart: "22:00",
      ndEnd: "06:00",
      timeZone: "Asia/Manila",
    })

    expect(result.overlaps).toEqual([])
    expect(result.windows).toHaveLength(1)
    expect(result.windows[0]?.end).toBe("2026-10-01T06:00:00.000+08:00")
  })
})
