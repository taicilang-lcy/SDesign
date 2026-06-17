// 开源版模型清单。两类：
//   订阅版（provider "cli-*"）= 调本机已登录的 CLI，用订阅出片、免 API key（仅本地自托管可用）
//   API 版 = 填自己的 key，走 OpenAI 兼容接口
// 下拉按这两类分组（订阅 / API），各自展开品牌。

export type ProviderId =
  | "deepseek"
  | "silicon"
  | "openai"
  | "minimax"
  | "openrouter"
  | "groq"
  | "together"
  | "mimo"
  | "longcat"
  | "cli-claude"
  | "cli-qwen"
  | "cli-gemini"
  | "cli-deepseek"
  | "cli-codex"
  | "cli-opencode"
  | "cli-cursor"
  | "cli-kimi";

export interface ModelConfig {
  id: string; // 实际传给接口/CLI 的 model 名
  name: string; // 下拉里显示的品牌名
  description: string;
  provider: ProviderId;
  comingSoon?: boolean; // true = 列出但暂不可选（开发中）
}

export const isCliProvider = (p: ProviderId): boolean => p.startsWith("cli-");

export const aiModels: ModelConfig[] = [
  // —— 订阅版（免 API key，调本机已登录的 CLI，命令移植自 OD）——
  {
    id: "claude-code",
    name: "Claude Code",
    description: "用本机 Claude 订阅",
    provider: "cli-claude",
  },
  {
    id: "qwen-code",
    name: "Qwen Code",
    description: "通义 Qwen Code 订阅",
    provider: "cli-qwen",
  },
  {
    id: "gemini-cli",
    name: "Gemini CLI",
    description: "Google Gemini 订阅",
    provider: "cli-gemini",
  },
  {
    id: "deepseek-cli",
    name: "DeepSeek CLI",
    description: "DeepSeek 本机 CLI 订阅",
    provider: "cli-deepseek",
  },
  {
    id: "codex",
    name: "Codex",
    description: "OpenAI Codex 订阅",
    provider: "cli-codex",
    comingSoon: true,
  },
  {
    id: "opencode",
    name: "OpenCode",
    description: "OpenCode 订阅",
    provider: "cli-opencode",
    comingSoon: true,
  },
  {
    id: "cursor-agent",
    name: "Cursor Agent",
    description: "Cursor Agent 订阅",
    provider: "cli-cursor",
    comingSoon: true,
  },
  {
    id: "kimi",
    name: "Kimi",
    description: "Kimi 订阅",
    provider: "cli-kimi",
    comingSoon: true,
  },
  // —— API 版（填自己的 key）——
  {
    id: "deepseek-chat",
    name: "DeepSeek V3",
    description: "DeepSeek 官方 · 性价比高",
    provider: "deepseek",
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek R1",
    description: "DeepSeek 官方 · 推理模型",
    provider: "deepseek",
  },
  {
    id: "deepseek-ai/DeepSeek-V3",
    name: "SiliconFlow · DeepSeek V3",
    description: "硅基流动",
    provider: "silicon",
  },
  {
    id: "gpt-4o",
    name: "OpenAI GPT-4o",
    description: "OpenAI",
    provider: "openai",
  },
  {
    id: "MiniMax-M2",
    name: "MiniMax M2",
    description: "MiniMax 海螺",
    provider: "minimax",
  },
  {
    id: "openai/gpt-4o",
    name: "OpenRouter · GPT-4o",
    description: "OpenRouter 聚合（可改任意模型 id）",
    provider: "openrouter",
  },
  {
    id: "llama-3.3-70b-versatile",
    name: "Groq · Llama 3.3 70B",
    description: "Groq 超快推理",
    provider: "groq",
  },
  {
    id: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    name: "Together · Llama 3.3 70B",
    description: "Together AI",
    provider: "together",
  },
  {
    id: "mimo-v2.5-pro",
    name: "MiMo V2.5 Pro",
    description: "小米 MiMo（需自有网关）",
    provider: "mimo",
  },
];

export const DEFAULT_MODEL_ID = aiModels[0].id;
