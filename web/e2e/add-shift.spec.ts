import { expect, test, type Page } from "@playwright/test"

import { signUpEmployee, uniqueEmail } from "./support/account"

async function ensureSelectOption(
  page: Page,
  label: string,
  optionName: string,
) {
  const trigger = page.getByLabel(label)
  await expect(trigger).toBeVisible()
  if ((await trigger.innerText()).includes(optionName)) {
    return
  }
  await trigger.click()
  await page.getByRole("option", { name: optionName }).click()
}

test("locked overnight sample estimates 2211 at ₱140.00 and saves privately", async ({
  page,
}) => {
  const pageErrors: string[] = []
  const failedRequests: {
    url: string
    resourceType: string
    errorText: string
  }[] = []

  page.on("pageerror", (error) => {
    pageErrors.push(error.message)
  })
  page.on("requestfailed", (request) => {
    failedRequests.push({
      url: request.url(),
      resourceType: request.resourceType(),
      errorText: request.failure()?.errorText ?? "",
    })
  })

  // 34800 monthly basic salary derives an hourly rate of 200.00000000.
  await signUpEmployee(page, {
    name: "Employee",
    email: uniqueEmail("locked-sample"),
    monthlyBasicSalary: "34800",
  })

  await page.goto("/shift/new")
  await expect(
    page.getByRole("heading", { name: "Calculate this shift" }),
  ).toBeVisible()

  await page.getByLabel("Work date").fill("2026-10-01")
  await page.getByLabel("Shift start").fill("21:00")
  await page.getByLabel("Shift end").fill("06:00")

  await ensureSelectOption(page, "Day classification", "Regular Work Day")
  await ensureSelectOption(page, "Break included in night differential", "No")
  await ensureSelectOption(page, "Schedule type", "Standard")
  const scheduledHours = page.getByLabel("Scheduled regular hours")
  if ((await scheduledHours.inputValue()) !== "8.00") {
    await scheduledHours.fill("8.00")
  }
  await ensureSelectOption(page, "Overtime agreed or approved", "No")

  await page.getByRole("button", { name: "Calculate shift" }).click()

  const preview = page.getByRole("region", { name: "Calculation preview" })
  await expect(preview).toBeVisible()
  await expect(preview).toHaveAttribute("aria-live", "polite")
  await expect(preview).toContainText("7.00 hrs")
  await expect(preview).toContainText("2211")
  await expect(preview).toContainText("₱140.00")
  await expect(preview).toContainText("ESTIMATE ONLY")
  await expect(preview).toContainText(
    "Estimate only — confirm your payroll rule before relying on this amount.",
  )

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.getByRole("button", { name: "Save entry" }).click()
  await expect(
    page.getByRole("status").filter({ hasText: "Saved privately" }),
  ).toBeVisible()

  const appOrigin = new URL(page.url()).origin
  const failedAppRequests = failedRequests.filter((request) => {
    let requestOrigin = ""
    try {
      requestOrigin = new URL(request.url).origin
    } catch {
      return false
    }
    if (requestOrigin !== appOrigin) {
      return false
    }
    if (
      request.resourceType !== "document" &&
      request.resourceType !== "xhr" &&
      request.resourceType !== "fetch"
    ) {
      return false
    }
    if (request.url.toLowerCase().includes("favicon")) {
      return false
    }
    if (/abort/i.test(request.errorText)) {
      return false
    }
    return true
  })

  expect(pageErrors).toEqual([])
  expect(failedAppRequests).toEqual([])
})

test("save waits for a current preview and Week mode reviews selected days", async ({ page }) => {
  await signUpEmployee(page, {
    name: "Employee",
    email: uniqueEmail("week-entry"),
    monthlyBasicSalary: "34800",
  })

  await page.goto("/shift/new")
  const save = page.getByRole("button", { name: "Save entry" })
  await expect(save).toBeDisabled()

  await page.getByLabel("Work date").fill("2026-10-01")
  await page.getByLabel("Shift start").fill("21:00")
  await page.getByLabel("Shift end").fill("06:00")
  await page.getByRole("button", { name: "Calculate shift" }).click()
  await expect(save).toBeEnabled()

  await page.getByLabel("Shift start").fill("20:00")
  await expect(save).toBeDisabled()
  await expect(page.getByText(/Needs recalculation/)).toBeVisible()

  await page.getByRole("button", { name: "Week" }).click()
  await expect(page.getByRole("heading", { name: "Choose shifts for this week" })).toBeVisible()
  await page.getByRole("button", { name: "Calculate selected days" }).click()
  await expect(page.getByText(/Review: 5 shifts/)).toBeVisible()
  const saveWeek = page.getByRole("button", { name: "Save reviewed entries" })
  await expect(saveWeek).toBeEnabled()
  await saveWeek.click()
  await expect(page.getByRole("status").filter({ hasText: "5 entries saved privately" })).toBeVisible()
  await saveWeek.click()
  await expect(page.getByRole("status").filter({ hasText: "5 entries saved privately" })).toBeVisible()
})

test("Week entry keeps multiple shifts on one date as distinct rows", async ({ page }) => {
  await signUpEmployee(page, {
    name: "Employee",
    email: uniqueEmail("week-multiple"),
    monthlyBasicSalary: "34800",
  })

  await page.goto("/shift/new")
  await page.getByRole("button", { name: "Week" }).click()
  await page.getByRole("button", { name: "Add another shift" }).first().click()
  await page.getByRole("button", { name: "Calculate selected days" }).click()
  await expect(page.getByText(/Review: 6 shifts/)).toBeVisible()
})

test("Week draft recovery keeps reviewed input identity without saving a draft", async ({page}) => {
  await signUpEmployee(page,{name:"Employee",email:uniqueEmail("draft-recovery"),monthlyBasicSalary:"34800"})
  await page.goto("/shift/new")
  await page.getByRole("button",{name:"Week",exact:true}).click()
  await page.getByLabel("Start",{exact:true}).first().fill("20:30")
  const priorKey=await page.locator('input[name="idempotencyKey"]').inputValue()
  await page.reload()
  await page.getByRole("button",{name:"Week",exact:true}).click()
  await expect(page.getByRole("status").filter({hasText:"Recovered an unsaved draft"})).toBeVisible()
  await expect(page.getByLabel("Start",{exact:true}).first()).toHaveValue("20:30")
  await expect(page.locator('input[name="idempotencyKey"]')).toHaveValue(priorKey)
  await expect(page.getByRole("button",{name:"Save reviewed entries"})).toBeDisabled()
})

test("keyboard traversal reaches classification, Calculate, and Save at every required width", async ({page}) => {
  test.setTimeout(120_000)
  await signUpEmployee(page,{name:"Employee",email:uniqueEmail("keyboard-entry"),monthlyBasicSalary:"34800"})
  async function tabTo(target: ReturnType<Page['getByRole']>) {
    for(let i=0;i<40;i++) {
      if(await target.evaluate(element=>element === document.activeElement)) return
      await page.keyboard.press("Tab")
    }
    throw new Error("Keyboard traversal did not reach the intended control")
  }
  for(const width of [320,375,768,900,1440]) {
    await page.setViewportSize({width,height:900})
    await page.goto("/shift/new")
    await page.getByLabel("Work date").fill("2026-10-01")
    await page.getByLabel("Shift start").fill("21:00")
    await page.getByLabel("Shift end").fill("06:00")
    const classification=page.getByRole("combobox",{name:"Day classification"})
    await tabTo(classification)
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Home")
    await page.keyboard.press("Enter")
    const calculate=page.getByRole("button",{name:"Calculate shift"})
    await tabTo(calculate)
    await page.keyboard.press("Enter")
    await expect(page.getByRole("region",{name:"Calculation preview"})).toContainText("2211")
    const save=page.getByRole("button",{name:"Save entry"})
    await tabTo(save)
    await page.keyboard.press("Enter")
    await expect(page.getByRole("status").filter({hasText:"in your shiftbook"})).toBeVisible()
  }
})
