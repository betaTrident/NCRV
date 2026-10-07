---
name: voyix-shift-workflow
description: Use when implementing, reviewing, or planning Voyix Shift work across UI, auth, Supabase, or the night-differential engine. Use at the start of a feature slice, when choosing which skills or agents to load, or when a generic plugin workflow (80% coverage, REST APIs, Python, SEO) would fight this product.
---

# Voyix Shift workflow

One product loop for Cursor, Codex, and Gemini. Specs at the repo root. Runtime in `web/`.

## 1. Pick the surface

| If the work touches | Surface |
| --- | --- |
| `web/src/app`, `web/src/components`, `globals.css` | UI |
| `web/src/engine` | Engine |
| `supabase/`, RLS, wage seed | Schema |
| Auth clients, `proxy.ts`, `(auth)`, server actions | Auth |
| CI, Vercel, env names | Ship |

Read [references/surfaces.md](references/surfaces.md) for the doc and skill list of that surface.

## 2. Load only what this slice needs

Always: root `AGENTS.md`, `PRODUCT.md`.

Then load skills from the surface table. Do not load parked skills (`python-*`, `seo`, `brutalist-skill`, duplicate taste packs) unless the user names them.

Apple Design on Voyix: press-down feedback, 44 px targets, spatial enter/exit, reduced-motion, restraint. Do **not** add Framer Motion, GSAP, bounce springs, or gesture theaters. Motion stays CSS, ≤280 ms.

## 3. Plan if the slice is multi-file or ambiguous

Use planner (`contexts/agents/planner.md` or Cursor `voyix-planner`). Plans must not invent ADP codes, holiday dates, or money formulas. TBD stays TBD.

Follow `07-SETUP-PLAN.md` / `06-IMPLEMENTATION-PLAN.md` when the work is still on those tasks. Do not restart a task the SDD ledger already marked complete.

## 4. Implement

- Match existing files and contracts. Do not add a REST envelope, repository layer, or admin role.
- TDD when the plan names a characterization or contract test (engine, tokens). There is no 80% coverage gate.
- UI: tokens only in `globals.css`. Compose product components. Verify in the browser at 1440 and 375, including empty/error states, not a single screenshot.
- Schema: `supabase migration new`; `supabase --agent no …`; policies use `(select auth.uid())`.
- Auth: `getClaims()` in layouts and actions; proxy refreshes cookies only; never `user_metadata`.

## 5. Review and stop conditions

After the slice: spec check against the plan/docs, then quality. Security review for auth, RLS, env, and Server Actions.

Stop and ask if a rule is missing from the PDFs, if two interpretations change payroll math, or if a hosted credential is required.

## 6. Git

Commit only when asked. Do not push unless asked. Do not commit `.env` or secrets. Do not update git config.
