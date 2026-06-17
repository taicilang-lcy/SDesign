# CLAUDE.md

This file guides Claude Code (claude.ai/code) when working in this repository.

## Project Overview

**SDesign** is an open-source AI slide generator for Chinese creators. From one sentence, a document, or a template, it generates a ready-to-present, exportable Chinese slide deck as a self-contained single-file HTML.

Its headline feature: **generate with the user's existing subscription, no API key** — it can call a locally installed CLI (Claude Code, etc.) and use the user's subscription; or use a user-supplied OpenAI-compatible API key.

**No database, no login, no background queue.** Forked from [Evoke](https://github.com/cheeseburgertony/evoke) (MIT) and stripped down to a no-DB, slide-generation tool.

## Development Commands

```bash
npm run dev      # Next.js dev server (webpack) on http://localhost:3000
npm run build    # production build (webpack)
npm run lint     # ESLint
```

- **Requires Node.js 24.**
- `package.json` pins `next dev/build --webpack` on purpose: Turbopack panics on non-ASCII project paths.
- No database / Prisma / Inngest / E2B / Clerk — those were removed from the upstream Evoke fork.

## Architecture

### Core flow

1. User provides any of: typed prompt, uploaded document, selected template (any one is enough).
2. `POST /api/generate` assembles **prompt text + document content + the template's real CSS** into the model input (`buildGenInput`).
3. Provider routing:
   - **Subscription** (provider `cli-*`) → `child_process.spawn` the local CLI (Claude Code, etc.), stream stdout back. Local self-host only.
   - **API** (everything else) → native streaming `fetch` to an OpenAI-compatible `/chat/completions`.
4. The frontend accumulates the stream and extracts the `<slide_deck>` HTML, rendered in an `<iframe srcDoc>`.
5. Result is saved to browser `localStorage` history; can be exported as HTML or vector PDF.

### Key files

- `src/app/api/generate/route.ts` — generation entry; provider split (subscription spawn / API fetch), streaming.
- `src/app/api/extract/route.ts` — document parsing (unpdf for PDF, mammoth for Word).
- `src/lib/cli-runtime.ts` — subscription CLIs: detect on PATH + spawn + stream. Three prompt-delivery modes (`system-file` for Claude, `stdin` for Qwen/Gemini, `arg` for DeepSeek).
- `src/lib/model-config.ts` — API providers → baseURL + key resolved from `.env`.
- `src/lib/ai-models.ts` — the model catalog (`cli-*` = subscription, others = API; `comingSoon` flag).
- `src/lib/slide-extract.ts` — pulls `<slide_deck>` out of model output (dependency-free).
- `src/lib/template-style.ts` — "real template styling": reads `src/data/template-examples/<slug>.html` CSS and assembles the gen input (server-only).
- `src/lib/deck-print.ts` — injects `@media print` CSS for vector PDF export.
- `src/prompt.ts` — system prompt; instructs the model to emit a single-file HTML deck inside `<slide_deck>`.
- `src/data/template-examples/*.html` — the real template HTML used for styling.
- `src/data/templates.ts` — slug → display name (shared front/back).
- `src/modules/home/ui/components/generator.tsx` — main component: input + streaming + preview + export + history (data & drawer).
- `src/modules/home/ui/history-ui-context.tsx` — tiny context bridging history count + drawer open, so the trigger button can live in the NavBar.
- `src/modules/home/ui/components/navbar.tsx` — top bar: Templates · History(N) · GitHub.
- `src/modules/home/ui/components/model-select.tsx` — two-level Subscription / API menu.

### Adding a model

- **API provider**: add a `ProviderId` + entry to `aiModels` in `ai-models.ts`, and its baseURL/env-key in `model-config.ts`. `.env` supplies the key. OpenAI-compatible only.
- **Subscription CLI**: add a `CliDef` in `cli-runtime.ts` (bin + prompt-delivery mode) and an entry in `ai-models.ts` with provider `cli-<kind>` (the route derives `kind` from `provider.slice(4)`). Only CLIs with plain-text one-shot output fit the current simple runtime; JSON-event / ACP CLIs need a parser first.

## Environment Variables

All optional — supply at least one model's key, **or** have a subscription CLI installed. See `.env.example`. No database or auth env needed.

## Conventions

- Shadcn/UI components are pre-installed under `src/components/ui/*`; import directly.
- Import `cn` from `@/lib/utils`.
- All styling is Tailwind; no separate CSS files.
- Keep it dependency-light and no-DB — that is the point of this fork.
