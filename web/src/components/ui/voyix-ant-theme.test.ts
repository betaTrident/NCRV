import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { voyixTokens } from "./voyix-ant-theme"
describe("Ant token convergence", () => {
  const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8")
  it("matches the authoritative CSS palette", () => {
    const mappings = { colorPrimary: "brand", colorPrimaryHover: "brand-hover", colorLink: "brand", colorText: "ink", colorTextSecondary: "ink-soft", colorTextDescription: "muted", colorBgLayout: "paper", colorBgContainer: "surface", colorFillAlter: "surface-soft", colorBorder: "line-strong", colorBorderSecondary: "line", colorSuccess: "success", colorWarning: "amber", colorError: "rose" } as const
    for (const [key, token] of Object.entries(mappings)) expect(css).toContain(`--vx-${token}: ${voyixTokens[key as keyof typeof mappings]};`)
  })
  it("uses 44px controls and CSS-only brief motion", () => { expect(voyixTokens.controlHeight).toBe(44); expect(voyixTokens.borderRadius).toBe(8); expect(voyixTokens.motionDurationMid).toBe("0.18s") })
})
