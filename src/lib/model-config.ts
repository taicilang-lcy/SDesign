import { aiModels, type ProviderId } from "./ai-models";

// 把选中的 modelId 解析成"接口地址 + key + 模型名"。
// key/baseURL 都从 .env 读；常见 provider 给了默认 baseURL，用户只需配 KEY。

interface ResolvedModel {
  ok: true;
  baseURL: string;
  apiKey: string;
  model: string;
  name: string;
}
interface ResolveError {
  ok: false;
  error: string;
}

// 各 provider 的默认接口地址（OpenAI 兼容 /chat/completions）。命中清单照搬自 OD。
const DEFAULT_BASE: Partial<Record<ProviderId, string | undefined>> = {
  deepseek: "https://api.deepseek.com",
  silicon: "https://api.siliconflow.cn/v1",
  openai: "https://api.openai.com/v1",
  minimax: "https://api.minimaxi.com/v1",
  openrouter: "https://openrouter.ai/api/v1",
  groq: "https://api.groq.com/openai/v1",
  together: "https://api.together.xyz/v1",
  mimo: undefined, // 私有网关，必须自配 MIMO_BASE_URL
  longcat: undefined,
  tencent: "https://api.lkeap.cloud.tencent.com/coding/v3", // 腾讯云 Coding Plan（OpenAI 兼容）
};

const ENV_BASE: Partial<Record<ProviderId, string | undefined>> = {
  deepseek: process.env.DEEPSEEK_BASE_URL,
  silicon: process.env.SILICON_BASE_URL,
  openai: process.env.OPENAI_BASE_URL,
  minimax: process.env.MINIMAX_BASE_URL,
  openrouter: process.env.OPENROUTER_BASE_URL,
  groq: process.env.GROQ_BASE_URL,
  together: process.env.TOGETHER_BASE_URL,
  mimo: process.env.MIMO_BASE_URL,
  longcat: process.env.LONG_CAT_BASE_URL,
  tencent: process.env.TENCENT_BASE_URL,
};

const ENV_KEY: Partial<Record<ProviderId, string | undefined>> = {
  deepseek: process.env.DEEPSEEK_API_KEY,
  silicon: process.env.SILICON_API_KEY,
  openai: process.env.OPENAI_API_KEY,
  minimax: process.env.MINIMAX_API_KEY,
  openrouter: process.env.OPENROUTER_API_KEY,
  groq: process.env.GROQ_API_KEY,
  together: process.env.TOGETHER_API_KEY,
  mimo: process.env.MIMO_API_KEY,
  longcat: process.env.LONG_CAT_API_KEY,
  tencent: process.env.TENCENT_API_KEY,
};

export function resolveModel(modelId: string): ResolvedModel | ResolveError {
  // 不静默回退到第一个模型：传错 modelId 必须报错，否则用户选了 A 却偷偷用了 B（数据正确性）
  const m = aiModels.find((x) => x.id === modelId);
  if (!m) return { ok: false, error: `未知的模型「${modelId}」` };

  const baseURL = ENV_BASE[m.provider] ?? DEFAULT_BASE[m.provider];
  const apiKey = ENV_KEY[m.provider];
  const ENV = m.provider.toUpperCase();

  if (!baseURL)
    return { ok: false, error: `模型「${m.name}」缺少 ${ENV}_BASE_URL，请在 .env 配置` };
  if (!apiKey)
    return { ok: false, error: `模型「${m.name}」缺少 ${ENV}_API_KEY，请在 .env 配置` };

  return {
    ok: true,
    baseURL: baseURL.replace(/\/+$/, ""),
    apiKey,
    model: m.id,
    name: m.name,
  };
}
