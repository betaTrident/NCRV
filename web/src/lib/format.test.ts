import { describe, expect, it } from "vitest"

import { formatPhp } from "./format"

describe("formatPhp", () => {
  it("formats integer centavos as Philippine pesos", () => {
    expect(formatPhp(14000)).toBe("₱140.00")
  })

  it("rejects fractional centavos", () => {
    expect(() => formatPhp(14000.5)).toThrow("Centavos must be a safe integer.")
  })
})
