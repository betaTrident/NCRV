# AI workspace

Team-facing home for Voyix Shift agent assets. Runtime skills stay in `.agents/skills/` so Cursor, Codex, and Gemini all discover them.

## Layout

- `agents/` — human-maintained agent prompts (Codex/Gemini; Cursor mirrors the Voyix set under `.cursor/agents/`)
- `rules/` — reusable guidance by stack. Voyix overrides live at the top of web/testing/design files.
- `baseline/` — product context for this repo (not the plugin's sample app)

## This product

Voyix Shift is a TypeScript Next.js + Supabase employee shiftbook. Do not apply the plugin's Python, SEO, 80% coverage, or REST-repository defaults.

See root `AGENTS.md` for the cross-tool map and `.agents/README.md` for which skills to load.
