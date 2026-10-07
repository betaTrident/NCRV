# Rules

Canonical operating instructions: [AGENTS.md](./AGENTS.md). Product voice: [PRODUCT.md](./PRODUCT.md). Visual system: [DESIGN.md](./DESIGN.md).

## Must always

- Treat Voyix Shift as a private employee shiftbook, not employer payroll.
- Read the docs for the surface you are changing before editing.
- Keep unresolved wage rules as TBD. Do not invent ADP codes, holiday dates, or money formulas.
- Authorize with `employees.id = auth.users.id` and `(select auth.uid())`. Never use `user_metadata`.
- Put hex, fonts, and radii only in `web/src/app/globals.css`.
- Use `supabase --agent no` in this workspace.
- Verify UI in the browser when you change it.

## Must never

- Add manager/admin accounts, approval workflows, or a public REST API.
- Commit `.env`, `.env.local`, or secrets.
- Run `impeccable init`.
- Load parked skills (Python, SEO, brutalist, duplicate taste packs) unless the user asks.
- Claim a UI change is done from a single screenshot.
