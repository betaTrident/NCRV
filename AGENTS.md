# AGENTS.md

Voyix Shift is a private employee night-differential shiftbook. It is not employer payroll. There are no manager or admin accounts.

This file is the operating contract for **Cursor**, **Codex**, and **Gemini**. `GEMINI.md`, `CLAUDE.md`, and `web/AGENTS.md` point here.

## Product

- Runtime is `web/`. Product specs stay at the repository root. Vercel root directory is `web`.
- Stack: Next.js 16 App Router (`src/`), React 19, TypeScript strict, Tailwind 4, shadcn/ui on Radix, Supabase Auth + Postgres + RLS, Server Actions. No separate API service. No Edge Functions in v1.
- `web/src/proxy.ts` refreshes cookies only. Layouts, Server Actions, and RLS authorize.
- Brand purple is `#5F249F`. Deep structural purple is `#341A4B`. Type is Manrope + IBM Plex Mono. Light paper canvas. No dark-mode palette in v1.
- Motion is CSS only: about 180 ms for controls, one 280 ms page entrance. Honor `prefers-reduced-motion`. No GSAP, Framer Motion, or looping animation.

| Surface | Read first |
| --- | --- |
| Any work | `PRODUCT.md`, this file, `.agents/skills/voyix-shift-workflow/SKILL.md` |
| UI | `DESIGN.md`, `07-SETUP-PLAN.md`, `.superdesign/design-system.md`, `05-USER-INTERFACE.md` |
| Engine | `01-BUSINESS-RULES.md` through `03-CALCULATION-ENGINE.md` |
| Schema / Auth | `04-DATA-MODEL.md`, `07-SETUP-PLAN.md` (Supabase data model) |

## Hard constraints

- Do not invent ADP codes, holiday dates, or money formulas. Unresolved rules render as TBD.
- Only ordinary-day 10% (code 2211) has a confirmed money formula.
- Never authorize from `user_metadata`. `employees.id` equals `auth.users.id`. Policies use `(select auth.uid())`.
- No `anon` grants on app tables. No `security definer` functions in `public`.
- Do not commit `.env`, `.env.local`, or secrets.
- Do not run `impeccable init` (it would rewrite `DESIGN.md`).
- In this workspace, every `supabase` CLI call needs `--agent no` so the CLI does not enter JSON mode.

## Cross-tool map

| Tool | Instructions | Skills | Agents |
| --- | --- | --- | --- |
| Cursor | This file + `.cursor/rules/` | `.agents/skills/` and `.cursor/skills/impeccable` | `.cursor/agents/` |
| Codex | This file | `.agents/skills/` (scanned to repo root) | `contexts/agents/` plus skill `agents/openai.yaml` |
| Gemini CLI | `GEMINI.md` → this file | `.agents/skills/` (Gemini's workspace alias) | `contexts/agents/` |

Do not duplicate the skill tree under `.gemini/skills` or extra `.cursor/skills` copies. Impeccable stays where its installer put it.

## Workflow

Load `voyix-shift-workflow` for feature work. Default loop:

1. Identify the surface. Read the matching docs.
2. Load only the skills listed for that surface in `.agents/README.md`.
3. Multi-file or ambiguous work: planner agent.
4. If the plan names a test, write the failing test first. There is no 80% coverage gate.
5. Implement the smallest change that matches existing contracts. No REST envelope, repository layer, or admin role.
6. Review spec, then quality. Security-review auth, RLS, env, and Server Actions.
7. Verify: `pnpm --dir web typecheck` for TypeScript; focused tests for the engine; browser at 1440 and 375 for UI, including empty and error states.
8. Commit only when asked. Do not push unless asked. Do not update git config.

## Default skills

- UI: `design-taste-frontend`, `minimalist-ui`, `shadcn`, `apple-design`, `accessibility`, `browser-qa`
- Schema / Auth: `supabase`, `supabase-postgres-best-practices`, `security-review`
- Engine: `tdd-workflow`, `verification-loop`
- Next.js 16: `nextjs-turbopack`
- Design pass: `impeccable` only when running that pipeline

Apple Design on this product means press-down feedback, spatial consistency, restraint, and reduced-motion — not spring libraries or gesture demos.

**Parked** unless the user names them: `python-*`, `seo`, `brutalist-skill`, `soft-skill`, `imagegen-frontend-mobile`, duplicate taste packs (`taste-skill`, `taste-skill-v1`, `gpt-tasteskill`, `minimalist-skill`), and `backend-patterns` / `api-design` when they push a public API.

## Agents

| Agent | When |
| --- | --- |
| `voyix-planner` / `planner` | Complex features, new screens, refactors |
| `voyix-tdd` / `tdd-guide` | Engine and other named RED/GREEN tests |
| `voyix-reviewer` / `code-reviewer` + `typescript-reviewer` | After code changes |
| `voyix-security` / `security-reviewer` | Auth, RLS, env, Server Actions |
| `voyix-build-fixer` / `build-error-resolver` | Typecheck or build failures |
| `impeccable-*` | Impeccable design pipeline only |

Do not use `python-reviewer` or `seo-specialist` on this repo.

## Git

Do not skip hooks. Do not commit secrets. Leave `package-lock.json` at the repo root untracked unless the user asks to add it.
