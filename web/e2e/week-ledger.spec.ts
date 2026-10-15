import { expect, test } from "@playwright/test"

import { signUpEmployee, uniqueEmail } from "./support/account"

test("Week ledger edits one row at a time and moves through a distinct review step", async ({ page }) => {
  await signUpEmployee(page, {
    name: "Employee",
    email: uniqueEmail("week-ledger"),
    monthlyBasicSalary: "34800",
  })

  await page.goto("/shift/new")
  await page.getByRole("radio", { name: "Week", exact: true }).click()
  await expect(page.getByRole("region", { name: "Week ledger" })).toBeVisible()
  await expect(page.getByLabel("Week totals")).toContainText("5")

  const dayButtons = page.getByRole("region", { name: "Week ledger" }).locator("button[aria-expanded]")
  await dayButtons.nth(0).click()
  await expect(page.getByLabel(/Edit shift for/)).toHaveCount(1)
  await dayButtons.nth(1).click()
  await expect(page.getByLabel(/Edit shift for/)).toHaveCount(1)

  await page.getByRole("button", { name: "Review week" }).click()
  await expect(page.getByRole("heading", { name: "Check this week before saving" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Save reviewed entries" })).toBeEnabled()
  await expect(page.getByText("Every included shift will be recalculated together on the server.")).toBeVisible()

  await page.getByRole("button", { name: "Change" }).first().click()
  await expect(page.getByRole("button", { name: "Return to review" })).toBeVisible()
  await expect(page.getByLabel("Start", { exact: true })).toBeFocused()
})

test("Week ledger links validation errors and keeps same-date shifts distinct", async ({ page }) => {
  await signUpEmployee(page, {
    name: "Employee",
    email: uniqueEmail("week-errors"),
    monthlyBasicSalary: "34800",
  })

  await page.goto("/shift/new")
  await page.getByRole("radio", { name: "Week", exact: true }).click()
  const dayButtons = page.getByRole("region", { name: "Week ledger" }).locator("button[aria-expanded]")
  await dayButtons.first().click()
  await page.getByRole("button", { name: "Add another shift" }).click()
  await expect(page.getByLabel("Week totals")).toContainText("6")

  await page.getByLabel("Start", { exact: true }).fill("")
  await page.getByRole("button", { name: "Review week" }).click()
  const errorLink = page.getByRole("alert").getByRole("link")
  await expect(errorLink).toContainText("valid time")
  await errorLink.click()
  await expect(page.getByLabel("Start", { exact: true })).toBeFocused()
})

test("Week ledger uses a day editor drawer on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 820 })
  await signUpEmployee(page, {
    name: "Employee",
    email: uniqueEmail("week-drawer"),
    monthlyBasicSalary: "34800",
  })

  await page.goto("/shift/new")
  await page.getByRole("radio", { name: "Week", exact: true }).click()
  await page.getByRole("region", { name: "Week ledger" }).locator("button[aria-expanded]").first().click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await expect(page.getByLabel(/Edit shift for/)).toBeVisible()
})
