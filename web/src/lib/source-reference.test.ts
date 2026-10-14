import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import manifest from "./source-reference.json"

const sqlString = (value: string) => `'${value.replaceAll("'", "''")}'`
const migration = readFileSync(resolve(process.cwd(), "../supabase/migrations/20261014175837_source_reference_catalog.sql"), "utf8")

describe("source reference provenance and UI/database parity", () => {
  it("matches the independently reviewed source file hashes", () => {
    for (const [file, digest] of [[manifest.calendarFile, manifest.calendarSha256], [manifest.codeFile, manifest.codeSha256]]) {
      expect(createHash("sha256").update(readFileSync(resolve(process.cwd(), "../docs/resources", file))).digest("hex")).toBe(digest)
    }
  })
  it("keeps every opted-in holiday prompt identical to the source migration", () => {
    expect(manifest.events).toHaveLength(69)
    for (const row of manifest.events) {
      const values = [sqlString(manifest.sourceId), sqlString(row.date), sqlString(row.label), sqlString(row.kind), row.classification ? sqlString(row.classification) : "null"].join(", ")
      expect(migration).toContain(`(${values})`)
    }
  })
  it("keeps non-ND references separate from active calculation rules", () => {
    expect(manifest.referenceCodes).toHaveLength(14)
    expect(migration).not.toMatch(/insert into public\.wage_types/i)
    for (const row of manifest.referenceCodes) {
      expect(row.engineActive).toBe(false)
      expect(row.formula).toBe("TBD")
      const values = [sqlString(manifest.sourceId), sqlString(row.code), sqlString(row.category), sqlString(row.hours), row.percentage, "false", "'TBD'"].join(", ")
      expect(migration).toContain(`(${values})`)
    }
  })
})
