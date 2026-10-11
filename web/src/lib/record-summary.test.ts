import { describe, expect, it } from "vitest"

import {
  recordAmount,
  resolveCurrentPeriod,
  summarizeRecords,
  type PeriodCandidate,
  type SummaryLine,
  type SummaryRecord,
} from "./record-summary"

const today = "2026-10-01"

function period(
  overrides: Partial<PeriodCandidate> & Pick<PeriodCandidate, "id">,
): PeriodCandidate {
  return {
    periodStart: today,
    periodEnd: today,
    payDate: null,
    cutoffDate: null,
    cutoffTime: null,
    active: true,
    ...overrides,
  }
}

function estimated(centavos: number | null): SummaryLine {
  return { amountStatus: "estimated", centavos }
}

function tbd(centavos: number | null = null): SummaryLine {
  return { amountStatus: "tbd", centavos }
}

function record(
  id: string,
  ndHours: string,
  lines: SummaryLine[],
): SummaryRecord {
  return { id, ndHours, lines }
}

describe("resolveCurrentPeriod", () => {
  it("returns none when no period is configured or the covering period is inactive", () => {
    expect(resolveCurrentPeriod([], today)).toEqual({ status: "none" })
    expect(
      resolveCurrentPeriod(
        [period({ id: "inactive-covering", active: false })],
        today,
      ),
    ).toEqual({ status: "none" })
  })

  it("resolves a single active period covering today", () => {
    const current = period({ id: "current-period" })

    expect(resolveCurrentPeriod([current], today)).toEqual({
      status: "current",
      period: current,
    })
  })

  it("returns overlap when multiple active periods contain today", () => {
    expect(
      resolveCurrentPeriod(
        [period({ id: "first" }), period({ id: "second" })],
        today,
      ),
    ).toEqual({ status: "overlap" })
  })
})

describe("summarizeRecords", () => {
  it("returns zeros when there are no saved shifts", () => {
    expect(summarizeRecords([])).toEqual({
      totalNdHours: "0.00",
      estimatedCentavos: 0,
      entryCount: 0,
      tbdLineCount: 0,
    })
  })

  it("sums total ND hours across records without multiplying by wage lines", () => {
    const twoLines = [estimated(14000), estimated(16000)]

    expect(
      summarizeRecords([
        record("shift-a", "7.00", twoLines),
        record("shift-b", "8.00", twoLines),
      ]).totalNdHours,
    ).toBe("15.00")
  })

  it("sums known estimated centavos", () => {
    const records = [
      record("shift-a", "7.00", [estimated(14000)]),
      record("shift-b", "8.00", [estimated(16000)]),
    ]

    expect(summarizeRecords(records).estimatedCentavos).toBe(30000)
    expect(recordAmount(records[0]!)).toEqual({
      estimatedCentavos: 14000,
      hasTbd: false,
    })
  })

  it("counts unique record ids once", () => {
    const extraLines = [estimated(14000), estimated(16000)]

    expect(
      summarizeRecords([
        record("shift-a", "7.00", extraLines),
        record("shift-b", "8.00", extraLines),
      ]).entryCount,
    ).toBe(2)

    expect(
      summarizeRecords([
        record("shift-a", "7.00", extraLines),
        record("shift-a", "7.00", extraLines),
      ]).entryCount,
    ).toBe(1)
  })

  it("does not double-count a shift's ND hours or entry count across wage lines", () => {
    expect(
      summarizeRecords([
        record("shift-a", "7.00", [estimated(14000), estimated(16000)]),
      ]),
    ).toEqual({
      totalNdHours: "7.00",
      estimatedCentavos: 30000,
      entryCount: 1,
      tbdLineCount: 0,
    })
  })

  it("excludes TBD lines from estimatedCentavos and increases tbdLineCount", () => {
    const records = [
      record("shift-a", "7.00", [estimated(14000), tbd(), estimated(null)]),
    ]

    expect(summarizeRecords(records)).toEqual({
      totalNdHours: "7.00",
      estimatedCentavos: 14000,
      entryCount: 1,
      tbdLineCount: 1,
    })
    expect(recordAmount(records[0]!)).toEqual({
      estimatedCentavos: 14000,
      hasTbd: true,
    })
  })
})
