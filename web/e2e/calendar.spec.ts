import { AxeBuilder } from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"
import { signUpEmployee, uniqueEmail } from "./support/account"

async function expectNoSeriousAxe(page: Page) {
  await page.evaluate(async () => { await Promise.all(document.getAnimations().filter(a => a.effect instanceof KeyframeEffect && a.effect.getTiming().iterations !== Infinity).map(a => a.finished)) })
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations.filter((item) => item.impact === "serious" || item.impact === "critical")).toEqual([])
}

test("source day drawer closes by keyboard and retains the opted-in source", async ({ page }) => {
  await signUpEmployee(page, { name: "Employee", email: uniqueEmail("calendar-source") })
  await page.goto("/calendar?view=month&date=2026-01-01&source=cebu2026")
  const day = page.getByRole("button", { name: "Open details for 2026-01-01" }).first()
  await day.click()
  await expect(page.getByRole("dialog")).toContainText("New Year's Day")
  await expect(page.getByRole("dialog")).toContainText("never set a day type")
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toBeHidden()
  await expect(page).toHaveURL(/source=cebu2026/)
  await expect(day).toBeFocused()
})

test("saved shifts overlay the calendar while source markers stay contextual", async ({ page }) => {
  await signUpEmployee(page, { name: "Employee", email: uniqueEmail("calendar-saved"), monthlyBasicSalary: "34800" })
  await page.goto("/shift/new")
  await page.getByLabel("Work date").fill("2026-10-01")
  await page.getByLabel("Shift start").fill("21:00")
  await page.getByLabel("Shift end").fill("06:00")
  await page.getByRole("button", { name: "Calculate shift" }).click()
  await page.getByRole("button", { name: "Save entry" }).click()
  await expect(page.getByRole("status").filter({ hasText: "Saved privately" })).toBeVisible()
  await page.goto("/calendar?view=month&date=2026-10-01&source=cebu2026")
  const day = page.getByRole("button", { name: "Open details for 2026-10-01" }).first()
  await expect(day).toContainText("saved shift")
  await day.click()
  await expect(page.getByRole("dialog")).toContainText("Saved shift")
  await expect(page.getByRole("dialog")).toContainText("Add shift")
})

test.describe("Calendar accessibility", () => {
  for (const project of ["desktop", "mobile"]) {
    test(`${project} has no serious or critical axe violations`, async ({ page }) => {
      await signUpEmployee(page, { name: "Employee", email: uniqueEmail("calendar-axe-" + project) })
      await page.goto("/calendar?view=month&date=2026-01-01&source=cebu2026")
      await expect(page.getByRole("heading", { name: "Calendar" })).toBeVisible()
      await expectNoSeriousAxe(page)
    })
  }
})

test("source holiday handoff prefills only the date", async ({page}) => {
  await signUpEmployee(page,{name:"Employee",email:uniqueEmail("source-handoff"),monthlyBasicSalary:"34800"})
  await page.goto("/calendar?date=2026-01-01&source=cebu2026&day=2026-01-01")
  await page.getByRole("dialog").getByRole("link",{name:"Add shift"}).click()
  await expect(page.getByLabel("Work date")).toHaveValue("2026-01-01")
  await expect(page.getByText(/Source reference.*New Year's Day/)).toBeVisible()
  await page.getByLabel("Shift start").fill("21:00")
  await page.getByLabel("Shift end").fill("06:00")
  await page.getByRole("button",{name:"Calculate shift"}).click()
  const preview=page.getByRole("region",{name:"Calculation preview"})
  await expect(preview).toContainText("Regular Work Day")
  await expect(preview).toContainText("2211")
})
