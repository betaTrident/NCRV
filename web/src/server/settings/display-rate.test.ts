import Decimal from "decimal.js"
import { describe, expect, it } from "vitest"

import { displayedHourlyRate } from "./display-rate"

describe("displayedHourlyRate", () => {
  it("returns 200.00000000 for 34800 using factor 261, not 365", () => {
    expect(displayedHourlyRate("34800")).toBe("200.00000000")
    expect(displayedHourlyRate("34800.00")).toBe("200.00000000")

    const with365 = new Decimal("34800")
      .times(12)
      .div(365)
      .div(8)
      .toDecimalPlaces(8, Decimal.ROUND_HALF_UP)
      .toFixed(8)
    expect(with365).not.toBe("200.00000000")
  })

  it("returns null for a blank or missing salary", () => {
    expect(displayedHourlyRate("")).toBeNull()
    expect(displayedHourlyRate(null)).toBeNull()
  })

  it("matches the deriveRateBasis Decimal path for 35000", () => {
    const expected = new Decimal(35000)
      .times(12)
      .div(261)
      .div(8)
      .toDecimalPlaces(8, Decimal.ROUND_HALF_UP)
      .toFixed(8)

    expect(displayedHourlyRate("35000")).toBe(expected)
  })
})
