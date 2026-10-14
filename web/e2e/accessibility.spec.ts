import { AxeBuilder } from "@axe-core/playwright"
import { expect, test, type Locator, type Page } from "@playwright/test"

import { signUpEmployee, uniqueEmail } from "./support/account"

async function expectNoSeriousAxe(page: Page) {
  await page.evaluate(async () => {
    const pending = document.getAnimations().filter((animation) => {
      const effect = animation.effect
      if (!(effect instanceof KeyframeEffect)) {
        return false
      }
      const timing = effect.getTiming()
      return timing.iterations !== Infinity && animation.playState !== "finished"
    })
    await Promise.all(pending.map((animation) => animation.finished))
  })
  const results = await new AxeBuilder({ page }).analyze()
  const blocking = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  )
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
}

async function expectMinHeight(locator: Locator, minHeight = 44) {
  const box = await locator.boundingBox()
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(minHeight)
}

async function signUpAxeEmployee(page: Page, label: string) {
  await signUpEmployee(page, {
    name: "Employee",
    email: uniqueEmail(label),
    monthlyBasicSalary: "34800",
  })
}

test("login has no serious or critical axe violations while signed out", async ({
  page,
}) => {
  await page.goto("/login")
  await expect(
    page.getByRole("heading", { name: "Employee sign in" }),
  ).toBeVisible()
  await expectNoSeriousAxe(page)
})

test("overview, add shift, and records have no serious or critical axe violations", async ({
  page,
}) => {
  const pageErrors: string[] = []
  page.on("pageerror", (error) => {
    pageErrors.push(error.message)
  })

  await signUpAxeEmployee(page, "axe-signed-in")
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible()
  await expectNoSeriousAxe(page)

  await page.goto("/shift/new")
  await expect(
    page.getByRole("heading", { name: "Calculate this shift" }),
  ).toBeVisible()
  await expectNoSeriousAxe(page)

  await page.goto("/records")
  await expect(page.getByRole("heading", { name: "My records" })).toBeVisible()
  await expectNoSeriousAxe(page)

  expect(pageErrors).toEqual([])
})

test("overview skip link is first in tab order and moves focus to main", async ({
  page,
}) => {
  await signUpAxeEmployee(page, "a11y-skip")
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible()

  await page.evaluate(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement) {
      active.blur()
    }
  })

  await page.keyboard.press("Tab")
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused()

  await page.keyboard.press("Enter")
  await expect(page.locator("#content")).toBeFocused()

  await expect(async () => {
    await page.keyboard.press("Tab")
    await expect(page.locator(":focus")).toHaveText(/Add shift|Open calendar/)
  }).toPass()
})

test("login and add shift keep persistent visible labels", async ({ page }) => {
  await page.goto("/login")
  await expect(page.getByLabel("Email")).toBeVisible()
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible()

  await signUpAxeEmployee(page, "a11y-labels")
  await page.goto("/shift/new")
  await expect(page.getByLabel("Work date")).toBeVisible()
  await expect(page.getByLabel("Shift start")).toBeVisible()
  await expect(page.getByLabel("Shift end")).toBeVisible()
})

test("main actions are at least 44px tall", async ({ page }) => {
  await page.goto("/login")
  await expectMinHeight(page.getByRole("button", { name: "Sign in" }))

  await signUpAxeEmployee(page, "a11y-targets")
  await expectMinHeight(page.getByRole("link", { name: "Add shift" }).first())

  await page.goto("/shift/new")
  await expectMinHeight(page.getByRole("button", { name: "Calculate shift" }))
  await expectMinHeight(page.getByRole("button", { name: "Save entry" }))
})

test("prefers-reduced-motion disables the page entrance animation", async ({
  page,
}) => {
  await signUpAxeEmployee(page, "a11y-motion")
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")

  const header = page.locator("header.vx-page-enter")
  await expect(header).toBeVisible()
  const animationName = await header.evaluate(
    (element) => getComputedStyle(element).animationName,
  )
  expect(animationName).toBe("none")
})

test("settings shows confirmed 2211 and formula TBD", async ({ page }) => {
  await signUpAxeEmployee(page, "a11y-tbd")
  await page.goto("/settings")

  await expect(page.getByText("2211", { exact: true }).first()).toBeVisible()
  await expect(page.getByText("Confirmed 10% estimate")).toBeVisible()
  await expect(page.getByText("Formula TBD").first()).toBeVisible()
})

test("empty sign in shows enter your email", async ({ page }) => {
  await page.goto("/login")
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page.getByText("Enter your email.")).toBeVisible()
})
