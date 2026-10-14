import { randomBytes } from "node:crypto"
import { expect, type Page } from "@playwright/test"

export const LOCAL_PASSWORD = "local-phase6-password"

export function uniqueEmail(label: string): string {
  return `${label}-${Date.now()}-${randomBytes(6).toString("hex")}@example.com`
}

type SignUpEmployeeInput = {
  name: string
  email: string
  monthlyBasicSalary?: string
}

export async function signUpEmployee(
  page: Page,
  { name, email, monthlyBasicSalary }: SignUpEmployeeInput,
): Promise<void> {
  await page.goto("/signup")
  await page.getByLabel("Full name").fill(name)
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password", { exact: true }).fill(LOCAL_PASSWORD)
  await page.getByRole("checkbox", { name: /I agree to the Terms/ }).check()
  if (monthlyBasicSalary) {
    await page.getByLabel("Monthly basic salary").fill(monthlyBasicSalary)
  }
  await page.getByRole("button", { name: "Create profile" }).click()
  await page.waitForURL((url) => url.pathname === "/")
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible()
}

export async function signOut(page: Page): Promise<void> {
  await page.goto("/settings")
  await page.getByRole("button", { name: "Sign out" }).click()
  await page.waitForURL((url) => url.pathname === "/login")
}
