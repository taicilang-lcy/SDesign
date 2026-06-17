<p align="center">
  <img src="public/sdesign-s.png" alt="SDesign" width="76" height="76">
</p>

<h1 align="center">SDesign</h1>

<p align="center">
  <b>给中文创作者的开源 AI PPT 生成器</b><br/>
  The open-source AI deck generator that runs on the subscription you already have
</p>

<p align="center">
  一句话 → 可直接演示、可导出的中文 PPT。<b>🔑 免 API key</b>，用你本机已登录的 Claude Code 等订阅出片。<br/>
  <sub>One sentence → a ready-to-present, exportable Chinese deck. No API key — powered by the coding-agent CLIs already on your laptop.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/no_API_key-✓-ff5a1f?style=flat-square" alt="No API key">
  <img src="https://img.shields.io/badge/no_database-✓-22c55e?style=flat-square" alt="No database">
  <img src="https://img.shields.io/badge/quickstart-3_commands-green?style=flat-square" alt="Quickstart">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License">
</p>

<p align="center">
  🌐 <a href="#english">English</a> · <a href="#简体中文">简体中文</a>
</p>

<p align="center">
  🔑 0 API key (subscription mode) &nbsp;·&nbsp; 🤖 4 subscription CLIs + 8 API providers &nbsp;·&nbsp; 🎨 21 templates &nbsp;·&nbsp; 📄 PDF/Word/txt/md → deck &nbsp;·&nbsp; ⚡ streaming &nbsp;·&nbsp; 📦 HTML / PDF export &nbsp;·&nbsp; 🚫 no database
</p>

<p align="center">
  <img src="screenshots/home.png" alt="SDesign home" width="100%" style="border-radius: 10px;">
</p>

---

## 🖼️ Demo

<table>
<tr>
<td width="33%" valign="top">
<img src="screenshots/models.png" alt="Models" /><br/>
<sub><b>订阅 / API 两类多模型</b> — Subscription / API models, two-level menu.</sub>
</td>
<td width="33%" valign="top">
<img src="screenshots/templates.png" alt="Templates" /><br/>
<sub><b>模板库 · 真套风格</b> — feeds the template's real CSS to the model.</sub>
</td>
<td width="33%" valign="top">
<img src="screenshots/output.png" alt="Output" /><br/>
<sub><b>一句话生成的成片</b> — a deck generated from one sentence.</sub>
</td>
</tr>
</table>

---

## 🤖 Supported models / 支持的模型

**订阅 Subscription** — calls a locally logged-in CLI, **no API key**, generates with your own subscription _(local self-host only)_.

| Model | Status |
|---|:---:|
| Claude Code | ✅ Available |
| Qwen Code · Gemini CLI · DeepSeek CLI | ✅ Available |
| Codex · OpenCode · Cursor Agent · Kimi | 🚧 Coming soon |

**API** — bring your own key, any OpenAI-compatible endpoint:

`DeepSeek` · `SiliconFlow` · `OpenAI` · `Xiaomi MiMo` · `MiniMax` · `OpenRouter` · `Groq` · `Together`

> Default base URLs are built in — you only fill the key. See [`.env.example`](.env.example).

---

## ⚖️ Why SDesign / 为什么

| | 常见 AI PPT · Typical AI deck tools | SDesign |
|---|---|---|
| **门槛 · Barrier** | 先买 API key / 订阅 | 装了 Claude Code 就能用 · **0 key** |
| **模型 · Models** | 绑死自家一个 | 订阅 4 + API 8，随便切 |
| **素材 · Data** | 凭模型记忆瞎编 | 传文档，照你的数据来 |
| **风格 · Style** | 一句话风格提示 | 喂模板**真实设计代码** |
| **导出 · Export** | 截图发糊 | 矢量 PDF，中文完美 |
| **形态 · Form** | 闭源云服务 | **MIT 开源**，本地自托管 |

---

## 🚀 Quick start / 快速开始

> Requires **Node.js 24**.

```bash
# 1. 克隆 + 安装 / clone + install
git clone <your-fork-url> sdesign && cd sdesign
npm install

# 2. 配置 / configure — 二选一 / either:
#    a) 本机装了 Claude Code 等 CLI → 直接走订阅，无需填 key
#       have a CLI like Claude Code installed → use your subscription, no key
#    b) 填一个模型 key（如 DEEPSEEK_API_KEY）/ fill one model key
cp .env.example .env

# 3. 启动 / run  →  http://localhost:3000
npm run dev
```

**无需数据库、无需登录、无需后台队列。** No database, no login, no queue.

---

<h2 id="简体中文">简体中文</h2>

### ✨ 这是什么

**SDesign** 是一个开源的 AI 幻灯片生成器：一句话、一份文档或选个模板，就生成可直接演示、可导出的中文 PPT（单文件 HTML 幻灯片）。

最大的特点——**用你已有的订阅出片，免 API key**：本机装了 Claude Code 等 CLI，SDesign 直接调用它、用你的订阅生成，不用另外掏 API 费；没有订阅也行，填一个你自己的模型 key 即可。**无数据库、无登录、浏览器打开即用。**

- **🔑 订阅接入，免 key** — 调本机已登录的 CLI，用你的订阅出片，0 额外费用
- **🧩 订阅 / API 多模型** — 不绑死一家，手边有什么用什么
- **📄 传文档 → 出片** — PDF / Word / txt / md 丢进去，数据照你的来，不瞎编
- **🎨 选模板「真套风格」** — 把模板真实设计代码喂给 AI，不是又一张「AI 味」幻灯
- **⚡ 流式生成** — 字数实时增长，全程可见
- **📦 导出 HTML / PDF** — 矢量打印，中文字体完美

### 🔧 工作原理

1. **输入** — 打字 / 传文档 / 选模板，三选一即可，可随意组合
2. **组装** — 后台把文字 + 文档内容 + 模板真实 CSS 拼成提示词
3. **生成** — 订阅模型走本机 CLI（`spawn`）、API 模型走 OpenAI 兼容接口，**流式**返回
4. **预览** — 抠出 `<slide_deck>` 用 iframe 直接放映
5. **导出** — 一键导出单文件 HTML 或矢量 PDF

### 📁 项目结构

```
src/
├── app/api/generate/route.ts   生成入口：订阅→spawn CLI / API→fetch，流式
├── app/api/extract/route.ts    文档解析（unpdf / mammoth）
├── lib/cli-runtime.ts          订阅 CLI：检测 + spawn + 流式
├── lib/model-config.ts         API provider → baseURL + key（.env）
├── lib/ai-models.ts            模型清单（订阅 / API）
├── lib/template-style.ts       「真套风格」：读模板 CSS + 组装
├── prompt.ts                   系统提示词（产出单文件 HTML 幻灯片）
└── modules/home/ui/            首页 UI（生成器 / 模型选择 / 模板库 / 历史）
```

### 📄 开源协议

MIT，fork 自 [Evoke](https://github.com/cheeseburgertony/evoke)（同为 MIT），保留原作者 cheeseburgertony 版权。

---

<h2 id="english">English</h2>

### What is SDesign

**SDesign** is an open-source AI slide generator: from one sentence, a document, or a template, it produces ready-to-present, exportable Chinese decks (self-contained single-file HTML).

The headline feature — **generate with your existing subscription, no API key**: if a CLI like Claude Code is installed locally, SDesign calls it and uses your subscription, so you pay nothing extra for API usage. No subscription? Fill in your own model API key. **No database, no login — open it in a browser and go.**

- **🔑 Subscription access, no API key** — call a locally logged-in CLI, generate with your own subscription
- **🧩 Subscription / API multi-model** — not locked to one vendor
- **📄 Document → deck** — drop in PDF / Word / txt / md; data follows your file, no hallucination
- **🎨 Real template styling** — feeds the template's actual CSS to the model
- **⚡ Streaming generation** — live character count, no black box
- **📦 Export HTML / PDF** — vector print, perfect CJK fonts

### How it works

1. **Input** — type, upload a doc, or pick a template; any one works, combine freely.
2. **Assemble** — the backend composes prompt text + document content + the template's real CSS.
3. **Generate** — subscription models run via a local CLI (`spawn`); API models via an OpenAI-compatible endpoint; streamed back.
4. **Preview** — the `<slide_deck>` HTML is extracted and rendered in an iframe.
5. **Export** — one click to a single-file HTML or a vector PDF.

### Project structure

See the file map above (中文 section) — entry points are `src/app/api/generate/route.ts` (generation), `src/lib/cli-runtime.ts` (subscription CLIs), and `src/lib/model-config.ts` (API providers).

### License

MIT. Forked from [Evoke](https://github.com/cheeseburgertony/evoke) (also MIT); original copyright retained for cheeseburgertony.

---

<p align="center">
  <a href="CONTRIBUTING.md">Contributing</a> · <a href="SECURITY.md">Security</a> · <a href="LICENSE">License</a>
</p>

<p align="center">
  Made with ❤️ · Simon Lin &nbsp;·&nbsp; 抖音 <b>Simon林</b> &nbsp;·&nbsp; 公众号 <b>硅基世纪</b>
</p>
