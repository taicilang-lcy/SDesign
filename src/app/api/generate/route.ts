import { NextRequest } from "next/server";
import { z } from "zod";
import { PROMPT } from "@/prompt";
import { buildGenInput, getTemplateStyle } from "@/lib/template-style";
import { resolveModel } from "@/lib/model-config";
import { aiModels, isCliProvider } from "@/lib/ai-models";
import { detectCli, runCliStream } from "@/lib/cli-runtime";

export const runtime = "nodejs";
export const maxDuration = 800; // 给慢的推理模型留时间
// 上游 fetch 兜底超时（与 CLI 一致）：防上游卡死把整个请求挂满 maxDuration，可用 env 覆盖
const STREAM_TIMEOUT_MS = Number(process.env.SDESIGN_API_TIMEOUT_MS) || 600_000;

const bodySchema = z.object({
  value: z.string().max(10000).optional(),
  attachment: z.string().max(60000).optional(),
  templateSlug: z.string().max(100).optional(),
  modelId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return Response.json({ error: "参数错误" }, { status: 400 });
  }

  if (!body.value?.trim() && !body.attachment && !body.templateSlug) {
    return Response.json(
      { error: "请至少输入内容、上传文档或选择一个模板" },
      { status: 400 }
    );
  }

  // 后台组装"文字 + 文档内容 + 模板真实 CSS"
  const style = body.templateSlug ? getTemplateStyle(body.templateSlug) : null;
  const genInput = buildGenInput({
    userText: body.value,
    docText: body.attachment,
    style,
  });

  const model = aiModels.find((m) => m.id === body.modelId);
  if (!model) {
    return Response.json(
      { error: `未知的模型「${body.modelId}」` },
      { status: 400 }
    );
  }

  // —— 订阅版 CLI 路径：调本机已登录的 CLI（Claude Code 等），用订阅出片、免 key ——
  if (isCliProvider(model.provider)) {
    const kind = model.provider.slice(4); // "claude" / "codex"
    if (!detectCli(kind)) {
      return Response.json(
        {
          error: `未检测到「${model.name}」对应的本机命令（${kind}）。请先安装并登录该 CLI，或改选一个 API 模型。`,
        },
        { status: 400 }
      );
    }
    try {
      const cliStream = runCliStream(kind, PROMPT, genInput);
      return new Response(cliStream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
        },
      });
    } catch (e) {
      return Response.json(
        { error: e instanceof Error ? e.message : "CLI 启动失败" },
        { status: 500 }
      );
    }
  }

  // —— API key 路径（OpenAI 兼容 /chat/completions）——
  const resolved = resolveModel(body.modelId);
  if (!resolved.ok) {
    return Response.json({ error: resolved.error }, { status: 400 });
  }

  // 流式调上游
  // GLM-5 等推理模型默认疯狂思考（reasoning runaway）：一次 PPT 能产出几 MB 思考、慢到超时还狂耗额度。
  // 订阅模式（cli-runtime.ts）靠 --thinking disabled 压住；API 模式这里给 tencent 端点传同样的 disabled。
  // 实测腾讯云 Coding Plan /coding/v3 认 thinking:{type:"disabled"}（enable_thinking:false 无效）。
  const reqBody: Record<string, unknown> = {
    model: resolved.model,
    stream: true,
    temperature: 0.3,
    messages: [
      { role: "system", content: PROMPT },
      { role: "user", content: genInput },
    ],
  };
  if (model.provider === "tencent") {
    reqBody.thinking = { type: "disabled" };
  }
  let upstream: Response;
  try {
    upstream = await fetch(`${resolved.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resolved.apiKey}`,
      },
      body: JSON.stringify(reqBody),
      // 客户端断开 / 超时都中止上游——避免请求挂死、上游继续算 token 计费
      signal: AbortSignal.any([req.signal, AbortSignal.timeout(STREAM_TIMEOUT_MS)]),
    });
  } catch (e) {
    return Response.json(
      { error: "连接模型失败：" + (e instanceof Error ? e.message : "未知错误") },
      { status: 502 }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return Response.json(
      { error: `模型返回错误 ${upstream.status}：${detail.slice(0, 300)}` },
      { status: 502 }
    );
  }

  // 解析上游 SSE，把 delta.content 转成纯文本流吐给前端（前端累积后抽取 HTML）
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const delta: string = json.choices?.[0]?.delta?.content ?? "";
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // 跨 chunk 的半行，丢弃即可（buffer 已留尾）
            }
          }
        }
      } catch (e) {
        try {
          controller.enqueue(
            encoder.encode(
              `\n[[STREAM_ERROR]] ${e instanceof Error ? e.message : "stream error"}`
            )
          );
        } catch {
          // 流已被取消，无需上报
        }
      } finally {
        try {
          controller.close();
        } catch {
          // 已关闭
        }
      }
    },
    cancel() {
      // 客户端断开：取消上游读取，停止继续拉（上游不再继续计费）
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
