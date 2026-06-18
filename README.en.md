<p align="center">
  <img src="public/sdesign-s.png" alt="SDesign" width="76" height="76">
</p>

<h1 align="center">SDesign</h1>

<p align="center">
  <b>The open-source AI deck generator that runs on the subscription you already have</b><br/>
  One sentence → a ready-to-present, exportable deck. <b>🔑 No API key</b> — powered by the coding-agent CLIs already on your laptop.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/no_API_key-✓-ff5a1f?style=flat-square" alt="No API key">
  <img src="https://img.shields.io/badge/no_database-✓-22c55e?style=flat-square" alt="No database">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License">
</p>

<p align="center">
  🔗 <b>Official website</b>: <a href="https://sdesign.one/">https://sdesign.one</a>
</p>

<p align="center">
  🌐 <a href="README.md">简体中文</a> &nbsp;·&nbsp; <b>English</b>
</p>

<p align="center">
  🔑 0 API key (subscription mode) &nbsp;·&nbsp; 🤖 4 subscription CLIs + 8 API providers &nbsp;·&nbsp; 🎨 21 templates &nbsp;·&nbsp; 📄 PDF/Word/txt/md → deck &nbsp;·&nbsp; ⚡ streaming &nbsp;·&nbsp; 📦 HTML / PDF export &nbsp;·&nbsp; 🚫 no database
</p>

<p align="center">
  <img src="screenshots/home.png" alt="SDesign home" width="100%" style="border-radius: 10px;">
</p>

---

## ✨ What is SDesign

**SDesign** is an open-source AI slide generator: from one sentence, a document, or a template, it produces ready-to-present, exportable decks (self-contained single-file HTML).

The headline feature — **generate with your existing subscription, no API key**: if a CLI like Claude Code is installed locally, SDesign calls it and uses your subscription, so you pay nothing extra for API usage. No subscription? Just fill in your own model API key. **No database, no login — open it in a browser and go.**

- **🔑 Subscription access, no API key** — call a locally logged-in CLI, generate with your own subscription, zero extra cost
- **🧩 Subscription / API multi-model** — not locked to one vendor; use whatever you have
- **📄 Document → deck** — drop in PDF / Word / txt / md; the data follows your file, no hallucination
- **🎨 Real template styling** — feeds the template's actual design CSS to the model, not just another "AI-looking" deck
- **⚡ Streaming generation** — live character count, no black box
- **📦 Export HTML / PDF** — vector print, perfect CJK fonts
- **🌐 Bilingual UI (中 / EN)** — one-click switch in the top-right

---

## 🖼️ Demo

<table>
<tr>
<td width="33%" valign="top">
<img src="screenshots/models.png" alt="Models" /><br/>
<sub><b>Subscription / API models</b> · two-level menu</sub>
</td>
<td width="33%" valign="top">
<img src="screenshots/templates.png" alt="Templates" /><br/>
<sub><b>Template gallery · real styling</b> · feeds the template's real CSS</sub>
</td>
<td width="33%" valign="top">
<img src="screenshots/output.png" alt="Output" /><br/>
<sub><b>A deck generated from one sentence</b></sub>
</td>
</tr>
</table>

---

## 🤖 Supported models

**Subscription** — calls a locally logged-in CLI, **no API key**, generates with your own subscription _(local self-host only)_.

| Model | Status |
|---|:---:|
| Claude Code | ✅ Available |
| Qwen Code · Gemini CLI · DeepSeek CLI | ✅ Available |
| Codex · OpenCode · Cursor Agent · Kimi | 🚧 Coming soon |

**API** — bring your own key, any OpenAI-compatible endpoint:

`DeepSeek` · `SiliconFlow` · `OpenAI` · `Xiaomi MiMo` · `MiniMax` · `OpenRouter` · `Groq` · `Together`

> Default base URLs are built in — you only fill the key. See [`.env.example`](.env.example).

---

## ⚖️ Why SDesign

| | Typical AI deck tools | SDesign |
|---|---|---|
| **Barrier** | Buy an API key / subscription first | Works once Claude Code is installed · **0 key** |
| **Models** | Locked to one in-house model | 4 subscription + 8 API, switch freely |
| **Data** | Hallucinated from model memory | Upload a document, follows your data |
| **Style** | A one-line style prompt | Feeds the template's **real design code** |
| **Export** | Blurry screenshots | Vector PDF, perfect CJK |
| **Form** | Closed-source cloud service | **MIT open-source**, self-host locally |

---

## 🚀 Quick start

> Requires **Node.js 24**.

```bash
# 1. clone + install
git clone <your-fork-url> sdesign && cd sdesign
npm install

# 2. configure — either:
#    a) have a CLI like Claude Code installed → use your subscription, no key
#    b) fill one model key (e.g. DEEPSEEK_API_KEY)
cp .env.example .env

# 3. run  →  http://localhost:3000
npm run dev
```

**No database, no login, no background queue.**

---

## 🔧 How it works

1. **Input** — type, upload a doc, or pick a template; any one works, combine freely.
2. **Assemble** — the backend composes prompt text + document content + the template's real CSS.
3. **Generate** — subscription models run via a local CLI (`spawn`); API models via an OpenAI-compatible endpoint; streamed back.
4. **Preview** — the `<slide_deck>` HTML is extracted and rendered in an iframe.
5. **Export** — one click to a single-file HTML or a vector PDF.

---

## 📁 Project structure

```
src/
├── app/api/generate/route.ts   generation entry: subscription→spawn CLI / API→fetch, streaming
├── app/api/extract/route.ts    document parsing (unpdf / mammoth)
├── lib/cli-runtime.ts          subscription CLIs: detect + spawn + stream
├── lib/model-config.ts         API provider → baseURL + key (.env)
├── lib/ai-models.ts            model catalog (subscription / API)
├── lib/template-style.ts       "real template styling": read template CSS + assemble
├── i18n/                       bilingual zh-CN / en-US (next-intl, cookie switch)
├── prompt.ts                   system prompt (emits a single-file HTML deck)
└── modules/home/ui/            home UI (generator / model select / template gallery / history)
```

---

## 📄 License

MIT, forked from [Evoke](https://github.com/cheeseburgertony/evoke). See [LICENSE](LICENSE).
Built-in templates are adapted from MIT-licensed projects — see [TEMPLATE-CREDITS.md](TEMPLATE-CREDITS.md).

---

<p align="center">
  <a href="CONTRIBUTING.md">Contributing</a> &nbsp;·&nbsp; <a href="SECURITY.md">Security</a> &nbsp;·&nbsp; <a href="LICENSE">License</a> &nbsp;·&nbsp; <a href="README.md">简体中文</a>
</p>

<p align="center">
  Made with ❤️ · Simon Lin &nbsp;·&nbsp; Douyin <b>Simon林</b> &nbsp;·&nbsp; Business 🌏 <b>simonlin1212</b> (please note your purpose)
</p>
