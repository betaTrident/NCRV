import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const source = (name: string) => readFileSync(resolve(process.cwd(), `src/components/ui/${name}`), "utf8")

describe("Voyix interaction adapters", () => {
  it("keeps required adapters and their accessible contracts", () => {
    expect(source("button.tsx")).toContain("loading")
    expect(source("button.tsx")).toContain("function IconButton")
    expect(source("select.tsx")).toContain("minHeight: 44")
    expect(source("segmented.tsx")).toContain("minHeight: 44")
    expect(source("drawer.tsx")).toContain("aria-label={closeLabel}")
    expect(source("modal.tsx")).toContain("focusTriggerAfterClose")
    expect(source("radio-group.tsx")).toContain("role=\"radiogroup\"")
    expect(source("checkbox-row.tsx")).toContain("type=\"checkbox\"")
    expect(source("disclosure.tsx")).toContain("aria-expanded")
    expect(source("key-value-list.tsx")).toContain("<dl")
    expect(source("empty-state.tsx")).toContain("function EmptyState")
    expect(source("route-skeleton.tsx")).toContain('aria-busy="true"')
  })
})
