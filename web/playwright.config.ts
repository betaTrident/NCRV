import { defineConfig, devices } from "@playwright/test"

function readLocalSupabaseEnv(): { url: string; publishableKey: string } {
  const url = process.env.E2E_SUPABASE_URL
  const publishableKey = process.env.E2E_SUPABASE_PUBLISHABLE_KEY
  if (!url || !publishableKey) {
    throw new Error(
      "E2E_SUPABASE_URL and E2E_SUPABASE_PUBLISHABLE_KEY are required. Run via pnpm test:e2e.",
    )
  }

  let hostname: string
  try {
    hostname = new URL(url).hostname
  } catch {
    throw new Error("Playwright refuses a non-local Supabase URL.")
  }

  if (hostname !== "127.0.0.1" && hostname !== "localhost") {
    throw new Error(
      `Playwright refuses a non-local Supabase URL (hostname: ${hostname}).`,
    )
  }

  return { url, publishableKey }
}

const localSupabase = readLocalSupabaseEnv()

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  fullyParallel: false,
  timeout: 90_000,
  expect: {
    timeout: 20_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm exec next build && pnpm exec next start --port 3100",
    url: "http://127.0.0.1:3100/login",
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: localSupabase.url,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: localSupabase.publishableKey,
    },
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 375, height: 812 },
      },
    },
  ],
})
