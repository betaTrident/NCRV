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
  const passwordBox = await page.getByLabel("Password", {exact:true}).boundingBox()
  const revealBox = await page.getByRole("button",{name:"Show password"}).boundingBox()
  expect(Math.abs(passwordBox!.y-revealBox!.y)).toBeLessThanOrEqual(1)
  expect(revealBox!.x + revealBox!.width).toBeLessThanOrEqual(passwordBox!.x + passwordBox!.width + 1)

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
  await expect(page.getByText("Engine active · Confirmed 10% estimate", {exact:true})).toBeVisible()
  await expect(page.getByText("Formula TBD").first()).toBeVisible()
})

test("empty sign in shows enter your email", async ({ page }) => {
  await page.goto("/login")
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page.getByText("Enter your email.")).toBeVisible()
})

 test("redesign reflows and legal reading preserves the draft", async ({ page }) => {
  for (const width of [320, 375, 768, 900, 1440]) {
    await page.setViewportSize({width, height: 900})
    await page.goto("/signup")
    await page.getByLabel("Full name").fill("Mika Santos")
    await page.getByLabel("Email").fill("mika@example.com")
    await page.getByLabel("Password", {exact:true}).fill("private-draft-password")
    const trigger = page.getByRole("button", {name:"Read Terms of Use"})
    await trigger.click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    const box = await dialog.boundingBox()
    expect(box!.width).toBeLessThanOrEqual(width)
    await expectNoSeriousAxe(page)
    await expect(page.locator("#legal-terms-title")).toBeFocused()
    for (let i=0; i<8; i++) {
      await page.keyboard.press("Tab")
      await expect.poll(() => dialog.evaluate(node => node.contains(document.activeElement))).toBe(true)
    }
    await page.keyboard.press("Escape")
    await expect(trigger).toBeFocused()
    await expect(page.getByLabel("Full name")).toHaveValue("Mika Santos")
    await expect(page.getByLabel("Password", {exact:true})).toHaveValue("private-draft-password")
    await expect(page.getByRole("checkbox")).not.toBeChecked()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.screenshot({path:`test-results/signup-${width}.png`,fullPage:true})
  }
 })

 test("settings explorer and computation reflow with honest code status", async ({page}) => {
   await signUpAxeEmployee(page,"settings-redesign")
   await page.goto("/settings")
   await page.getByLabel("Find a code or category").fill("2251")
   await expect(page.getByText("Reference only · Formula TBD",{exact:true})).toBeVisible()
   await page.getByLabel("Find a code or category").fill("")
   for (const width of [320,375,768,900,1440]) {
     await page.setViewportSize({width,height:900})
     await expectNoSeriousAxe(page)
     expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
   }
 })

test("populated surfaces reflow at the required widths and 200/400 percent equivalents", async ({page}) => {
  test.setTimeout(180_000)
  await signUpAxeEmployee(page,"reflow-matrix")
  await page.goto("/calendar?view=references")
  await page.getByLabel("Period start").fill("2026-10-01")
  await page.getByLabel("Period end").fill("2026-10-31")
  await page.getByRole("button",{name:"Add payroll period"}).click()
  await expect(page.getByRole("status").filter({hasText:"in your calendar"})).toBeVisible()
  await page.goto("/shift/new")
  await page.getByLabel("Work date").fill("2026-10-01")
  await page.getByLabel("Shift start").fill("21:00")
  await page.getByLabel("Shift end").fill("06:00")
  await page.getByRole("button",{name:"Calculate shift"}).click()
  await page.getByRole("button",{name:"Save entry"}).click()
  await expect(page.getByRole("status").filter({hasText:"in your shiftbook"})).toBeVisible()
  await page.goto("/records?range=custom&from=2026-10-01&to=2026-10-31")
  const recordHref = await page.getByRole("link",{name:"Open record for October 1, 2026"}).getAttribute("href")
  for (const width of [320,375,768,900,1440,720,360]) {
    await page.setViewportSize({width,height:900})
    for (const route of ["/", "/shift/new", "/records?range=custom&from=2026-10-01&to=2026-10-31", recordHref!, "/calendar?date=2026-10-01&source=cebu2026", "/settings"]) {
      await page.goto(route)
      await expect(page.locator("h1")).toBeVisible()
      await expectNoSeriousAxe(page)
      expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth),`${route} at ${width}px`).toBe(true)
      if ((width===375 || width===1440) && !route.includes("shift/new")) await page.screenshot({path:`test-results/surface-${route.split('?')[0].replaceAll('/','-') || 'overview'}-${width}.png`,fullPage:true})
    }
    await page.goto("/shift/new")
    await page.getByRole("button",{name:"Week",exact:true}).click()
    await expect(page.getByRole("heading",{name:"Choose shifts for this week"})).toBeVisible()
    await expectNoSeriousAxe(page)
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth),`Week at ${width}px`).toBe(true)
  }
})
