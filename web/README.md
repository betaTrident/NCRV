# Voyix Workspace

Private employee night-differential shiftbook. Product specs live in `../docs/`. `../AGENTS.md`, `../PRODUCT.md`, and `../DESIGN.md` stay at the repository root. Read `../AGENTS.md` before changing behavior.

## Run

From this folder:

```powershell
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The dev server is http://localhost:3000.

## Source

| Path | Role |
| --- | --- |
| `src/app` | Routes. `(auth)` is signed out. `(app)` is signed in. |
| `src/components/ui` | shadcn primitives. Recolor only through tokens. |
| `src/components/shell` | Chrome shared by signed-in pages. |
| `src/components/forms` | Field wiring. |
| `src/engine` | Calculation only. No React and no Supabase. |
| `src/lib` | Formatters and Supabase clients. |
| `src/server/actions` | Mutations. |
| `src/proxy.ts` | Cookie refresh only. |

`src/components/shift`, `src/components/records`, and `src/server/queries` are the homes for the next screens. Create them when those screens are built.
