import { execFileSync, spawn } from "node:child_process"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const repoRoot = resolve(webRoot, "..")

const SECRET_ENV_KEYS = [
  "SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SECRET_KEY",
  "SUPABASE_SECRET_KEY",
]

function parseStatusEnv(stdout) {
  const values = new Map()
  for (const rawLine of stdout.split(/\r?\n/)) {
    const line = rawLine.trim().replace(/^export\s+/, "")
    if (!line || line.startsWith("#")) {
      continue
    }
    const separator = line.indexOf("=")
    if (separator <= 0) {
      continue
    }
    const key = line.slice(0, separator)
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      continue
    }
    let value = line.slice(separator + 1)
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/\\"/g, '"')
    }
    values.set(key, value)
  }
  return values
}

function localHostname(value) {
  try {
    return new URL(value).hostname
  } catch {
    return null
  }
}

function readLocalSupabase() {
  let stdout = ""
  try {
    stdout = execFileSync("supabase", ["--agent", "no", "status", "-o", "env"], {
      cwd: repoRoot,
      encoding: "utf8",
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
    })
  } catch {
    console.error("Could not read local supabase status.")
    process.exit(1)
  }

  const values = parseStatusEnv(stdout)
  const apiUrl = values.get("API_URL")
  const publishableKey =
    values.get("PUBLISHABLE_KEY") ?? values.get("ANON_KEY")

  if (!apiUrl) {
    console.error("supabase status did not provide API_URL.")
    process.exit(1)
  }
  if (!publishableKey) {
    console.error("supabase status did not provide a publishable key.")
    process.exit(1)
  }

  const hostname = localHostname(apiUrl)
  if (hostname !== "127.0.0.1" && hostname !== "localhost") {
    const seen = hostname ?? "unparseable"
    console.error(
      `Playwright refuses a non-local Supabase URL (hostname: ${seen}).`,
    )
    process.exit(1)
  }

  return { apiUrl, publishableKey }
}

const { apiUrl, publishableKey } = readLocalSupabase()

const childEnv = { ...process.env }
for (const key of SECRET_ENV_KEYS) {
  delete childEnv[key]
}
childEnv.E2E_SUPABASE_URL = apiUrl
childEnv.E2E_SUPABASE_PUBLISHABLE_KEY = publishableKey

const extraArgs = process.argv.slice(2)
const child = spawn("pnpm", ["exec", "playwright", "test", ...extraArgs], {
  cwd: webRoot,
  env: childEnv,
  stdio: "inherit",
  shell: process.platform === "win32",
})

child.on("error", (error) => {
  console.error(error.message)
  process.exit(1)
})

child.on("exit", (code, signal) => {
  if (signal) {
    process.exit(1)
  }
  process.exit(code ?? 1)
})
