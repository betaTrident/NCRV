# Agent orchestration

Prompts live in `contexts/agents/`. Cursor copies of the Voyix set live in `.cursor/agents/`.

## Use on Voyix Shift

| Agent | Purpose | When |
| --- | --- | --- |
| planner | Implementation planning | Complex features, new screens, refactors |
| tdd-guide | Test-driven development | Engine and other named RED/GREEN tests |
| code-reviewer | Spec + quality review | After writing or modifying code |
| typescript-reviewer | TypeScript review | `.ts` / `.tsx` changes |
| security-reviewer | Auth, RLS, secrets | Auth, schema, env, Server Actions |
| build-error-resolver | Typecheck/build failures | `pnpm --dir web typecheck` or `next build` fails |
| code-explorer | Codebase mapping | Unfamiliar area, read-only |
| silent-failure-hunter | Swallowed errors | Reliability pass |
| doc-updater | Docs | Only when the user asked for docs |
| impeccable-* | Design pipeline | Impeccable passes only |

## Do not use here

| Agent | Why |
| --- | --- |
| python-reviewer | No Python application code |
| seo-specialist | Signed-in private app; no marketing site |
| architect / code-architect | Use planner unless the user asks for an architecture review |

## Immediate routing

- Complex feature → **planner**
- Named test in the plan → **tdd-guide**
- Code just written → **code-reviewer** (and **typescript-reviewer** for TS)
- Auth / RLS / env → **security-reviewer**
- Build red → **build-error-resolver**

Independent reviews may run in parallel. Do not run two writers on the same files.
