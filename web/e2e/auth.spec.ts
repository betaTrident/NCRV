import { expect, test, type Page } from "@playwright/test"

import { signUpEmployee, uniqueEmail } from "./support/account"

function expectVisibleWords(page: Page, text: string) {
  const alert = page.getByRole("alert").filter({ hasText: text })
  const words = page.getByText(text, { exact: true })
  return expect(alert.or(words).first()).toBeVisible()
}

test("empty login shows email and password errors as words", async ({
  page,
}) => {
  await page.goto("/login")
  await page.getByRole("button", { name: "Sign in" }).click()

  await expectVisibleWords(page, "Enter your email.")
  await expectVisibleWords(page, "Enter your password.")
})

test("signup exposes required semantics and keeps consent separate from legal documents", async ({
  page,
}) => {
  await page.goto("/signup")

  await expect(page.getByLabel("Full name")).toHaveAttribute("required", "")
  await expect(page.getByLabel("Email")).toHaveAttribute("required", "")
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("required", "")
  const consent = page.getByRole("checkbox", { name: /I agree/i })
  await expect(consent).toHaveAttribute("required", "")
  await page.getByRole("button", { name: "Read Terms of Use" }).click()

  await expect(page.getByRole("dialog")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Terms of Use" })).toBeVisible()
  await expect(consent).not.toBeChecked()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Read Terms of Use" })).toBeFocused()
  await expect(consent).not.toBeChecked()
})

test("standalone legal pages accept only the signup return path", async ({ page }) => {
  await page.goto("/terms?returnTo=/signup")
  await expect(page.getByRole("link", { name: "Back to create profile" })).toHaveAttribute("href", "/signup")

  await page.goto("/privacy?returnTo=https://example.com")
  await expect(page.getByRole("link", { name: "Back to sign in" })).toHaveAttribute("href", "/login")
})

test("signup rejects a password shorter than 12 characters", async ({
  page,
}) => {
  await page.goto("/signup")
  await page.getByLabel("Full name").fill("Employee")
  await page.getByLabel("Email").fill(uniqueEmail("short-password"))
  await page.getByLabel("Password", { exact: true }).fill("short-pass")
  await page.getByRole("checkbox").check()
  await page.getByRole("button", { name: "Create profile" }).click()

  await expect(
    page.getByRole("alert").filter({ hasText: "Use at least 12 characters." }),
  ).toBeVisible()
  await expect(page).toHaveURL(/\/signup/)
  await expect(page.getByRole("heading", { name: "Overview" })).toHaveCount(0)
})

test("successful signup with no salary shows the empty overview", async ({
  page,
}) => {
  const pageErrors: string[] = []
  const consoleErrors: string[] = []

  page.on("pageerror", (error) => {
    pageErrors.push(error.message)
  })
  page.on("console", (message) => {
    if (message.type() !== "error") {
      return
    }
    const text = message.text()
    if (text.toLowerCase().includes("favicon")) {
      return
    }
    consoleErrors.push(text)
  })

  await signUpEmployee(page, {
    name: "Employee",
    email: uniqueEmail("no-salary"),
  })

  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "No payroll period yet" }),
  ).toBeVisible()

  expect(pageErrors).toEqual([])
  expect(consoleErrors).toEqual([])
})
