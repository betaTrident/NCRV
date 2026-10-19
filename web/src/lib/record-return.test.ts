import { expect, it } from "vitest"
import { recordReturn } from "./record-return"
it("preserves local records and calendar context only", () => {
  expect(recordReturn("/records?range=month&page=2")).toBe("/records?range=month&page=2")
  expect(recordReturn("/calendar?day=2026-10-19")).toBe("/calendar?day=2026-10-19")
  for (const value of ["https://evil.test", "//evil.test", "/records/other", "/calendar\\evil", "/records?x=\n"]) expect(recordReturn(value)).toBe("/records")
})
