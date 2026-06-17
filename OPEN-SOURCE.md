# SDesign · 开源版（Open-Source Edition）

这是 **SDesign** 的开源版本——一个把「文字 / 上传文档 / 模板风格」三者组合、用 AI 生成单文件 HTML 幻灯片（PPT）的工具。

**特点：无需数据库、无需登录、自带多模型选择。** 部署后浏览器打开、填上自己的模型 key 即可用。

- 基于 [Evoke](https://github.com/)（MIT）改造而来。
- 包含：生成引擎 + 模型下拉（DeepSeek / SiliconFlow / OpenAI 等，OpenAI 兼容接口）+ 公域 MIT 示例模板（`src/data/template-examples/`）+ 文档解析（PDF/Word/txt/md）。

## 许可证

**MIT** —— 完全开放，可自由使用、修改、商用。详见根目录 `LICENSE`。
（底座 Evoke 同为 MIT，已保留原作者版权声明。）

## 本地运行

无需数据库、无需登录。只要 Node 24 + 至少一个 OpenAI 兼容模型的 key。

```bash
cp .env.example .env     # 至少填一个模型 KEY（如 DEEPSEEK_API_KEY）
npm install
npm run dev              # 打开 http://localhost:3000
```

打开后：顶部下拉**选模型** → 打字 / 上传文档 / 选模板风格（任一即可）→ 生成 → 预览、导出 HTML / PDF。

## 用订阅版模型（免 API key）✨

本机装了 **Claude Code** 并登录（Claude Pro/Max 订阅）的话，模型下拉里选 **「Claude Code（订阅）」** 就行——SDesign 会调用你本机的 `claude` 命令，**用你的订阅出片，不需要 API key**。

- 前提：SDesign 跑在你自己机器上（本地/自托管），且 `claude` 在 PATH 里。
- ⚠️ **云端部署用不了**这个（服务器读不到你本机的 CLI）——云端请用 API key 模型。
- 后续会支持更多订阅 CLI（Codex / Kimi 等）。

## 加自己的模型

模型列表在 `src/lib/ai-models.ts`，每条 = `{ id, name, description, provider }`。
provider 的接口地址/密钥映射在 `src/lib/model-config.ts`（从 `.env` 读）。
只要是 OpenAI 兼容的 `/chat/completions` 接口，加一条即可。
