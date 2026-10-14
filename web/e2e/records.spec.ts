import {
  expect,
  test,
  type Browser,
  type Page,
  type TestInfo,
} from "@playwright/test"

import { signUpEmployee, uniqueEmail } from "./support/account"

const CUSTOM_RECORDS_URL =
  "/records?range=custom&from=2026-10-01&to=2026-10-03"
const LOCKED_SALARY = "34800"
const EMPLOYEE_NAME = "Employee"
const RECORD_HREF = /\/records\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function addLockedShift(page: Page, workDate: string) {
  await page.goto("/shift/new")
  await page.getByLabel("Work date").fill(workDate)
  await page.getByLabel("Shift start").fill("21:00")
  await page.getByLabel("Shift end").fill("06:00")
  await page.getByRole("button", { name: "Calculate shift" }).click()
  await expect(page.getByText("7.00 hrs", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Save entry" }).click()
  await expect(
    page.getByRole("status").filter({ hasText: "Saved privately" }),
  ).toBeVisible()
}

function trackPageErrors(page: Page): Error[] {
  const pageErrors: Error[] = []
  page.on("pageerror", (error) => {
    pageErrors.push(error)
  })
  return pageErrors
}

async function openIsolatedPage(browser: Browser, testInfo: TestInfo) {
  const context = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    viewport: testInfo.project.use.viewport,
  })
  const page = await context.newPage()
  return { context, page, pageErrors: trackPageErrors(page) }
}

test("second user cannot open the first user's record URL", async ({
  browser,
}, testInfo) => {
  const userA = await openIsolatedPage(browser, testInfo)
  const userB = await openIsolatedPage(browser, testInfo)

  try {
    await signUpEmployee(userA.page, {
      name: EMPLOYEE_NAME,
      email: uniqueEmail("records-owner"),
      monthlyBasicSalary: LOCKED_SALARY,
    })
    await addLockedShift(userA.page, "2026-10-01")

    await userA.page.goto(CUSTOM_RECORDS_URL)
    const ownerRecord = userA.page.getByRole("link", {
      name: "Oct 1",
      exact: true,
    })
    await expect(ownerRecord).toBeVisible()
    const href = await ownerRecord.getAttribute("href")
    expect(href).toMatch(RECORD_HREF)

    await signUpEmployee(userB.page, {
      name: EMPLOYEE_NAME,
      email: uniqueEmail("records-other"),
      monthlyBasicSalary: LOCKED_SALARY,
    })
    await userB.page.goto(href!)
    await expect(
      userB.page.getByText("This record isn't available"),
    ).toBeVisible()
    await expect(userB.page.locator("body")).not.toContainText("₱140.00")

    await userB.page.goto(CUSTOM_RECORDS_URL)
    await expect(
      userB.page.getByRole("link", { name: "Oct 1", exact: true }),
    ).toHaveCount(0)

    expect(userA.pageErrors).toEqual([])
    expect(userB.pageErrors).toEqual([])
  } finally {
    await userB.context.close()
    await userA.context.close()
  }
})

test("Saturday saved as Regular Work Day never renders as Rest Day", async ({
  browser,
}, testInfo) => {
  // 2026-10-03 is a Saturday. Do not create a holiday row or pick Rest Day.
  const session = await openIsolatedPage(browser, testInfo)

  try {
    await signUpEmployee(session.page, {
      name: EMPLOYEE_NAME,
      email: uniqueEmail("records-saturday"),
      monthlyBasicSalary: LOCKED_SALARY,
    })
    await addLockedShift(session.page, "2026-10-03")

    await session.page.goto(CUSTOM_RECORDS_URL)
    const saturdayRow = session.page.locator("tr").filter({
      has: session.page.getByRole("link", { name: "Oct 3", exact: true }),
    })
    await expect(saturdayRow).toContainText("Regular Work Day")
    await expect(saturdayRow).not.toContainText("Rest Day")

    await session.page.getByRole("link", { name: "Oct 3", exact: true }).click()
    await expect(
      session.page.getByRole("heading", { name: "October 3, 2026" }),
    ).toBeVisible()
    await expect(session.page.getByText("Regular Work Day").first()).toBeVisible()
    await expect(session.page.locator("body")).not.toContainText("Rest Day")

    expect(session.pageErrors).toEqual([])
  } finally {
    await session.context.close()
  }
})

test("table usable at 375 px", async ({ browser }, testInfo) => {
  const session = await openIsolatedPage(browser, testInfo)

  try {
    await signUpEmployee(session.page, {
      name: EMPLOYEE_NAME,
      email: uniqueEmail("records-375"),
      monthlyBasicSalary: LOCKED_SALARY,
    })
    await addLockedShift(session.page, "2026-10-03")

    await session.page.setViewportSize({ width: 375, height: 812 })
    await session.page.goto(CUSTOM_RECORDS_URL)

    const oct3 = session.page.getByRole("link", { name: "Oct 3", exact: true })
    await expect(oct3).toBeVisible()

    const overflowParent = session.page
      .locator(".overflow-x-auto")
      .filter({ has: oct3 })
    const box = await oct3.boundingBox()
    const hasOverflowParent = (await overflowParent.count()) > 0
    const boxInViewport = box !== null && box.x >= 0 && box.width > 0
    expect(hasOverflowParent || boxInViewport).toBeTruthy()

    expect(session.pageErrors).toEqual([])
  } finally {
    await session.context.close()
  }
})
