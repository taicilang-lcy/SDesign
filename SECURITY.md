# Security Policy / 安全说明

## Threat model / 威胁模型

SDesign is designed to be **self-hosted and run by a single trusted user (you)** — on your own machine, with your own subscription CLI and/or API keys. Read this before exposing it to anyone else.

SDesign 的设计前提是**自托管、单一可信用户（你自己）**——跑在你自己的机器上，用你自己的订阅 CLI 和/或 API key。在把它暴露给别人之前，请先读这一段。

Under that model, the following are **by design**, not vulnerabilities:

- **Subscription mode spawns a local CLI** (`src/lib/cli-runtime.ts`) with *your* prompt as input. It runs *your* `claude` / `qwen` / etc. under *your* account. Commands are passed as an argv array (no shell), and the prompt goes via stdin / a positional arg — but the CLI it drives is yours, with your privileges.
- **API mode `fetch`es the base URL from your `.env`** (`src/lib/model-config.ts`). The base URL and keys come from your own config, not from web input.
- **No multi-tenancy, no auth, no database.** There is no notion of "other users" to protect against.

在这个前提下，以下是**设计如此**，不是漏洞：订阅模式用你自己的 prompt 调你自己的本机 CLI；API 模式请求的是你自己 `.env` 里的 baseURL/key；没有多租户、没有登录、没有数据库，也就没有"其他用户"需要防。

## ⚠️ If you expose it beyond yourself / 如果你把它对外暴露

If you put SDesign behind a public URL or share it with untrusted users, **you become responsible for the added attack surface**, including:

- **SSRF** — the API base URL is not restricted to public hosts. If untrusted input could ever reach it, an attacker could target internal addresses (`169.254.169.254`, `localhost`, RFC1918). Don't let untrusted users control the base URL; add an allow-list / egress controls at your edge.
- **Local command execution** — subscription mode runs local CLIs. Never expose subscription mode to untrusted users.
- **Document parsing** — uploaded PDF/Word files are parsed by `unpdf` / `mammoth`; treat untrusted uploads with the usual care.

把它放到公网或给不信任的人用，多出来的攻击面由你负责：API baseURL 未限制（潜在 SSRF，别让外部输入控制 baseURL）；订阅模式会执行本机命令（绝不要对外开放）；上传文档由解析库处理（按常规对待不可信上传）。

## Reporting a vulnerability / 报告漏洞

If you find a security issue that affects the **intended self-host single-user model**, please open a private report via GitHub Security Advisories, or open an Issue marked `[security]`. Please don't include working exploits in public issues.

如果发现影响**预期自托管单用户模型**的安全问题，请通过 GitHub Security Advisories 私下报告，或开一个标 `[security]` 的 Issue。公开 issue 里请不要附可用的 exploit。
