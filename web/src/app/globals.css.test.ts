import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

describe("Voyix tokens", () => {
  const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8")

  it("keeps the authoritative brand purple", () => {
    expect(css).toMatch(/--vx-brand:\s*#5f249f/i)
    expect(css).toMatch(/--vx-brand-deep:\s*#341a4b/i)
  })

  it("does not use the text muted color as a surface", () => {
    expect(css).toMatch(/--muted:\s*var\(--vx-surface-soft\)/)
    expect(css).toMatch(/--muted-foreground:\s*var\(--vx-muted\)/)
  })
})
