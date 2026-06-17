# Contributing to SDesign / 贡献指南

Thanks for your interest! SDesign is a small, focused, **no-database** tool — contributions that keep it lean are very welcome.

感谢关注！SDesign 是一个小而专、**无数据库**的工具——欢迎在保持轻量的前提下贡献。

## Dev setup / 开发环境

> Requires **Node.js 24**.

```bash
git clone <your-fork-url> sdesign && cd sdesign
npm install
cp .env.example .env     # fill one model key, or have a CLI like Claude Code installed
npm run dev              # http://localhost:3000
```

- **No database, no login, no queue** — there is nothing else to set up.
- The dev/build scripts pin `--webpack` on purpose: Turbopack panics on non-ASCII project paths.
- Type-check with `npx tsc --noEmit`; lint with `npm run lint`.

## Where things live / 代码在哪

| What | File |
|---|---|
| Generation entry (provider routing, streaming) | `src/app/api/generate/route.ts` |
| Subscription CLIs (detect + spawn + stream) | `src/lib/cli-runtime.ts` |
| API providers (baseURL + key) | `src/lib/model-config.ts` |
| Model catalog | `src/lib/ai-models.ts` |
| System prompt | `src/prompt.ts` |

See [`CLAUDE.md`](CLAUDE.md) for the full architecture map.

## Adding a model / 加一个模型

- **API provider** — add an entry to `aiModels` (`ai-models.ts`) and its baseURL/env-key in `model-config.ts`. OpenAI-compatible endpoints only.
- **Subscription CLI** — add a `CliDef` in `cli-runtime.ts` (binary + prompt-delivery mode) plus an `ai-models.ts` entry with provider `cli-<kind>`. Only CLIs with plain-text one-shot output fit the current runtime; JSON-event / ACP CLIs need a parser first.

## Pull requests / 提 PR

1. Fork and create a branch (`git checkout -b feature/your-thing`).
2. Keep the diff focused; don't re-add database / auth / queue dependencies — that's against the project's whole point.
3. Make sure `npx tsc --noEmit` passes.
4. Use conventional commit messages (`feat:`, `fix:`, `docs:`, `refactor:` …).
5. Open the PR with a clear description of what changed and why.

## Reporting bugs / 报 bug

Open an Issue with: what you did, what you expected, what happened, your OS + Node version, and which model (subscription / API) you used.

## License

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).
