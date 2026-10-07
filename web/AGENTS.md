# Voyix Shift web app

Product rules, wage types, calculation, data model, screens, and visual design live at the repository root, not in this folder.

Read `../AGENTS.md` first, then `../DESIGN.md`, `../07-SETUP-PLAN.md`, and `../.superdesign/design-system.md` before changing UI.
Read `../01-BUSINESS-RULES.md` through `../03-CALCULATION-ENGINE.md` before changing `src/engine`.

Do not invent ADP codes, holiday dates, or money formulas. Unresolved rules render as TBD.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
