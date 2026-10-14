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
