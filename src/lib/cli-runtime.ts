import "server-only";
import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

// 订阅版接入：调用本机已安装、已登录的 AI CLI（Claude Code / Qwen Code / Gemini CLI /
// DeepSeek CLI 等），用用户自己的订阅出片，免 API key。命令移植自 OD（open-design）
// 的 runtime 适配器，取其"纯文本输出"模式（OD 用结构化 JSON/ACP 流，这里只要纯文本，
// 前端再抠 <slide_deck>）。
// ⚠️ 只在 SDesign 跑在用户本地（自托管 Node）时可用；云端部署读不到用户本机 CLI。

// 提示词投递方式（不同 CLI 接口不一样）：
//   "system-file" —— 系统提示词写临时文件、用 flag 传入，用户提示词走 stdin（Claude）
//   "stdin"       —— 系统 + 用户提示词合并成一份，整体走 stdin（Qwen / Gemini）
//   "arg"         —— 系统 + 用户提示词合并成一份，作为最后一个位置参数（DeepSeek）
type PromptDelivery = "system-file" | "stdin" | "arg";

interface CliDef {
  bin: string;
  fallbackBins?: string[];
  // 额外环境变量（如 Gemini 需要 GEMINI_CLI_TRUST_WORKSPACE 跳过信任确认）
  env?: Record<string, string>;
  delivery: PromptDelivery;
  // 基础参数。"system-file" 模式下用 sysFile 拼系统提示词文件路径；其余模式 sysFile 为 null。
  buildArgs: (sysFile: string | null) => string[];
}

const CLI_DEFS: Record<string, CliDef> = {
  // Claude Code：系统提示词走文件，用户提示词走 stdin，纯文本输出。
  claude: {
    bin: "claude",
    fallbackBins: ["openclaude"],
    delivery: "system-file",
    buildArgs: (sysFile) => [
      "-p",
      "--output-format",
      "text",
      "--system-prompt-file",
      sysFile as string,
      // 禁掉所有工具：它只该把文字变成 HTML，不该读文件/搜代码/执行/联网/起子任务。
      // 漏禁 Read/Glob/Grep 会让 Claude Code 试图读本地文件来"理解意图"，产生意外行为。
      "--disallowedTools",
      "Read",
      "Write",
      "Edit",
      "Glob",
      "Grep",
      "Bash",
      "NotebookEdit",
      "WebFetch",
      "WebSearch",
      "TodoWrite",
      "Task",
    ],
  },
  // Qwen Code（Gemini CLI 的 fork）：--yolo 非交互，提示词走 stdin，纯文本输出。
  qwen: {
    bin: "qwen",
    delivery: "stdin",
    buildArgs: () => ["--yolo"],
  },
  // Gemini CLI：省略 -p 时从管道 stdin 读提示词；不传 --output-format 即默认纯文本输出。
  // --yolo 跳过交互审批；GEMINI_CLI_TRUST_WORKSPACE 跳过工作区信任确认。
  gemini: {
    bin: "gemini",
    env: { GEMINI_CLI_TRUST_WORKSPACE: "true" },
    delivery: "stdin",
    buildArgs: () => ["--yolo"],
  },
  // DeepSeek CLI：exec --auto <prompt>，提示词作为位置参数，纯文本流式输出（不加 --json）。
  // 上游 CodeWhale 改名后同款分发为 codewhale，作为 fallback。
  deepseek: {
    bin: "deepseek",
    fallbackBins: ["codewhale"],
    delivery: "arg",
    buildArgs: () => ["exec", "--auto"],
  },
  // codex / opencode / cursor / kimi：输出是结构化 JSON / ACP 协议，简版 runtime 暂不接，
  // 在 ai-models.ts 里标「即将支持」。
};

// 位置参数投递的提示词字节上限（保守值）。macOS/Linux 单个 argv 上限约 128KB，
// 留足余量；超了给友好报错而不是让 spawn 抛 E2BIG。借鉴 OD deepseek 的 maxPromptArgBytes。
const MAX_ARG_PROMPT_BYTES = 110_000;

// 子进程兜底超时：慢的推理模型 8 页可能要 ~390s，给 10min 余量；超了强杀，防 CLI 卡死把会话挂住。
// 可用 SDESIGN_CLI_TIMEOUT_MS 覆盖。
const CLI_TIMEOUT_MS = Number(process.env.SDESIGN_CLI_TIMEOUT_MS) || 600_000;
// stdout 输出上限：一份 deck 也就几十~一两百 KB，12MB 远超之，防 CLI 输出失控撑爆内存。
const MAX_OUTPUT_BYTES = 12 * 1024 * 1024;
// stderr 上限：CLI 刷屏（如 warning 洪水）也不至于把 stderr 累加到 OOM。
const MAX_STDERR_BYTES = 64 * 1024;
// SIGTERM 后宽限多久升 SIGKILL（有的 CLI 会 trap/忽略 SIGTERM 不退出）。
const KILL_GRACE_MS = 5_000;

const EXTRA_PATH_DIRS = [
  "/opt/homebrew/bin",
  "/usr/local/bin",
  "/usr/bin",
  "/usr/local/lib/node_modules/.bin",
  path.join(os.homedir(), ".local/bin"),
  path.join(os.homedir(), ".npm-global/bin"), // npm prefix 自定义
  path.join(os.homedir(), ".bun/bin"), // bun 全局
  path.join(os.homedir(), ".deno/bin"), // deno
  path.join(os.homedir(), "Library/pnpm"), // pnpm（macOS）
  path.join(os.homedir(), ".local/share/pnpm"), // pnpm（Linux）
  path.join(os.homedir(), ".yarn/bin"), // yarn 全局
];

function findOnPath(bin: string): string | null {
  const dirs = (process.env.PATH || "")
    .split(path.delimiter)
    .concat(EXTRA_PATH_DIRS);
  for (const d of dirs) {
    if (!d) continue;
    const p = path.join(d, bin);
    try {
      fs.accessSync(p, fs.constants.X_OK);
      return p;
    } catch {
      // 继续找
    }
  }
  return null;
}

/** 检测某个订阅 CLI 是否装在本机；返回可执行路径或 null */
export function detectCli(kind: string): string | null {
  const def = CLI_DEFS[kind];
  if (!def) return null;
  for (const b of [def.bin, ...(def.fallbackBins ?? [])]) {
    const found = findOnPath(b);
    if (found) return found;
  }
  return null;
}

/** 起 CLI 子进程，按各 CLI 的投递方式喂提示词，stdout 以纯文本流返回 */
export function runCliStream(
  kind: string,
  systemPrompt: string,
  userPrompt: string
): ReadableStream<Uint8Array> {
  const def = CLI_DEFS[kind];
  const binPath = detectCli(kind);
  if (!def || !binPath) {
    throw new Error(`未检测到 ${kind} CLI`);
  }

  // 隔离临时目录：系统提示词写这里，cwd 也设这里（万一 CLI 想建文件也不污染项目）
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sdesign-cli-"));
  const combined = `${systemPrompt}\n\n${userPrompt}`;

  let args: string[];
  let stdinPayload: string | null;

  if (def.delivery === "system-file") {
    const sysFile = path.join(tmpDir, "system.txt");
    fs.writeFileSync(sysFile, systemPrompt, "utf8");
    args = def.buildArgs(sysFile);
    stdinPayload = userPrompt;
  } else if (def.delivery === "stdin") {
    args = def.buildArgs(null);
    stdinPayload = combined;
  } else {
    // "arg"：合并提示词作为位置参数
    if (Buffer.byteLength(combined, "utf8") > MAX_ARG_PROMPT_BYTES) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      throw new Error(
        `提示词过长（含模板/文档内容），超过 ${kind} 的命令行参数上限，请精简内容或改选 Claude Code / Qwen 等 stdin 投递的订阅。`
      );
    }
    args = [...def.buildArgs(null), combined];
    stdinPayload = null;
  }

  const child = spawn(binPath, args, {
    env: { ...process.env, ...(def.env ?? {}) },
    cwd: tmpDir,
    stdio: ["pipe", "pipe", "pipe"],
  });

  // CLI 提前退出会让 stdin 写入抛 EPIPE；监听 error 吞掉，避免未捕获异常崩进程。
  child.stdin.on("error", () => {});
  // 投递提示词
  if (stdinPayload !== null) {
    child.stdin.write(stdinPayload);
  }
  child.stdin.end();

  let stderr = "";
  child.stderr.on("data", (d: Buffer) => {
    if (stderr.length < MAX_STDERR_BYTES) stderr += d.toString();
  });

  const encoder = new TextEncoder();
  let closed = false;
  let outBytes = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let killTimer: ReturnType<typeof setTimeout> | null = null;

  const cleanup = () => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // 忽略
    }
  };
  // 先发 SIGTERM；有的 CLI（如 Claude Code）会 trap/忽略 SIGTERM 不退出 →
  // 宽限 KILL_GRACE_MS 后强发 SIGKILL 兜底，避免子进程僵死把 HTTP 连接挂住。
  const safeKill = () => {
    try {
      child.kill("SIGTERM");
    } catch {
      // ESRCH：已退出
    }
    if (!killTimer) {
      killTimer = setTimeout(() => {
        killTimer = null;
        try {
          child.kill("SIGKILL");
        } catch {
          // 已退出
        }
      }, KILL_GRACE_MS);
    }
  };

  return new ReadableStream<Uint8Array>({
    start(controller) {
      const finish = (errMsg?: string) => {
        if (closed) return;
        closed = true;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        if (errMsg) controller.enqueue(encoder.encode(`\n[[STREAM_ERROR]] ${errMsg}`));
        cleanup();
        try {
          controller.close();
        } catch {
          // 已关闭
        }
      };

      // 兜底超时：CLI 卡死/不退出时强杀，避免会话永远挂着
      timer = setTimeout(() => {
        safeKill();
        finish(`生成超时（超过 ${Math.round(CLI_TIMEOUT_MS / 1000)}s），已终止`);
      }, CLI_TIMEOUT_MS);

      child.stdout.on("data", (chunk: Buffer) => {
        if (closed) return;
        outBytes += chunk.length;
        if (outBytes > MAX_OUTPUT_BYTES) {
          safeKill();
          finish("CLI 输出超出上限，已终止");
          return;
        }
        controller.enqueue(new Uint8Array(chunk));
      });
      child.on("error", (err) => {
        finish(`启动 ${kind} 失败：${err.message}`);
      });
      child.on("close", (code) => {
        // 子进程已退出：清掉还没发的 SIGKILL 兜底
        if (killTimer) {
          clearTimeout(killTimer);
          killTimer = null;
        }
        finish(
          code === 0
            ? undefined
            : `${kind} 退出码 ${code}${stderr ? "：" + stderr.slice(0, 200) : ""}`
        );
      });
    },
    cancel() {
      // 客户端断开/取消：清超时、杀子进程（含 SIGKILL 兜底）、清理临时目录
      closed = true;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      safeKill();
      cleanup();
    },
  });
}
