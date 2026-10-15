import { expect, test } from "@playwright/test"

import { signUpEmployee, uniqueEmail } from "./support/account"

test.describe("Night Ledger day entry", () => {
  test.beforeEach(async ({ page }) => {
    await signUpEmployee(page, {
      name: "Mika Santos",
      email: uniqueEmail("night-ledger-day"),
      monthlyBasicSalary: "34800",
    })
    await page.goto("/shift/new")
  })

  test("keeps mode switching available and progressively reveals CWW hours", async ({
    page,
  }) => {
    const mode = page.getByRole("radiogroup", { name: "Entry mode" })
    await expect(mode).toBeVisible()
    await expect(page.getByLabel("Scheduled regular hours")).toHaveCount(0)

    await page.getByLabel("Schedule type").click()
    await page.getByRole("option", { name: "Approved compressed workweek" }).click()
    await expect(page.getByLabel("Scheduled regular hours")).toBeVisible()

    await page.getByRole("radio", { name: "Week" }).click()
    await expect(mode).toBeVisible()
    await page.getByRole("radio", { name: "Day" }).click()
    await expect(page.getByRole("heading", { name: "Shift facts", exact: true })).toBeVisible()
  })

  test("shows no save action before calculation and invalidates a changed receipt", async ({
    page,
  }) => {
    await expect(page.getByRole("button", { name: "Save entry" })).toHaveCount(0)

    await page.getByLabel("Work date").fill("2026-10-01")
    await page.getByLabel("Shift start").fill("21:00")
    await page.getByLabel("Shift end").fill("06:00")
    await page.getByRole("button", { name: "Calculate shift" }).click()

    const receipt = page.getByRole("region", { name: "Calculation receipt" })
    await expect(receipt).toContainText("Final ND")
    await expect(receipt).toContainText("7.00")
    await expect(receipt).toContainText("2211")
    await expect(receipt.getByRole("button", { name: /Why this code/i })).toBeVisible()
    await expect(page.getByRole("button", { name: "Save entry" })).toBeEnabled()

    await page.getByLabel("Shift start").fill("20:00")
    await expect(page.getByText(/Needs recalculation/i)).toBeVisible()
    await expect(page.getByRole("button", { name: "Save entry" })).toBeDisabled()
  })

  test("keeps the truthful ruler and result action usable at phone width", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.getByLabel("Work date").fill("2026-10-01")
    await page.getByLabel("Shift start").fill("21:00")
    await page.getByLabel("Shift end").fill("06:00")
    await page.getByRole("button", { name: "Calculate shift" }).click()

    await expect(page.getByRole("img", { name: /Night time ruler/i })).toBeVisible()
    await expect(page.getByText(/Break deduction: −1\.00 h/)).toBeVisible()
    await expect(page.getByRole("button", { name: "Save entry" })).toBeInViewport()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
  })
})
