"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpIcon,
  Loader2Icon,
  PaperclipIcon,
  FileTextIcon,
  LayoutTemplateIcon,
  XIcon,
  DownloadIcon,
  FileDownIcon,
  ExternalLinkIcon,
  RotateCcwIcon,
  HistoryIcon,
  ClockIcon,
  Trash2Icon,
} from "lucide-react";
import TextareaAutoSize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { extractSlideDeck } from "@/lib/slide-extract";
import { buildPrintableDeck } from "@/lib/deck-print";
import { DEFAULT_MODEL_ID } from "@/lib/ai-models";
import { usePromptDraft } from "@/modules/home/ui/prompt-draft";
import { useHistoryUi } from "@/modules/home/ui/history-ui-context";
import { ModelSelect } from "@/modules/home/ui/components/model-select";

interface Attachment {
  name: string;
  text: string;
}

interface HistoryEntry {
  id: string;
  title: string;
  html: string;
  createdAt: number;
}

const HISTORY_KEY = "sdesign-oss-history";
const HISTORY_CAP = 30;

function deckTitle(html: string, fallback: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const t = m?.[1]?.replace(/\s+/g, " ").trim();
  const out = t && t.length > 0 ? t : fallback;
  return out.slice(0, 40) || "未命名 PPT";
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "刚刚";
  if (s < 3600) return `${Math.floor(s / 60)} 分钟前`;
  if (s < 86400) return `${Math.floor(s / 3600)} 小时前`;
  return `${Math.floor(s / 86400)} 天前`;
}

export const Generator = () => {
  const { selectedTemplate, clearTemplate } = usePromptDraft();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [value, setValue] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [uploading, setUploading] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [streamedChars, setStreamedChars] = useState(0);
  const [html, setHtml] = useState<string | null>(null);
  const [fragmentKey, setFragmentKey] = useState(0);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  // 历史抽屉开关 + 条数抬到共享 context，让触发按钮能放进 NavBar（右上角 GitHub 旁）
  const { open: historyOpen, setOpen: setHistoryOpen, setCount } = useHistoryUi();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // 忽略损坏的本地数据
    }
  }, []);

  // 把历史条数同步给 NavBar 的按钮
  useEffect(() => {
    setCount(history.length);
  }, [history.length, setCount]);

  // 写历史；localStorage 超额时丢掉最旧的几条再试，返回真正存下的列表（让内存状态与之对齐）。
  // 不再静默吞掉 QuotaExceededError——否则用户以为存上了其实没存、刷新后丢失。
  const saveHistory = (list: HistoryEntry[]): HistoryEntry[] => {
    let cur = list;
    while (cur.length > 0) {
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(cur));
        return cur;
      } catch {
        cur = cur.slice(0, -1); // 丢最旧一条再试
      }
    }
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // 忽略
    }
    toast.error("浏览器本地空间不足，历史未能保存");
    return [];
  };

  const hasInput = !!value.trim() || !!attachment || !!selectedTemplate;

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "文档解析失败");
        return;
      }
      setAttachment({ name: data.name, text: data.text });
      toast.success(
        `已读取「${data.name}」${data.truncated ? "（内容较长，已截取前部分）" : ""}`
      );
    } catch {
      toast.error("上传失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  const onGenerate = async () => {
    if (!hasInput || generating) return;
    setGenerating(true);
    setStreamedChars(0);
    setHtml(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: value.trim() || undefined,
          attachment: attachment?.text,
          templateSlug: selectedTemplate?.slug,
          modelId,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || `请求失败 (${res.status})`);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        acc += decoder.decode(chunk, { stream: true });
        setStreamedChars(acc.length);
      }

      if (acc.includes("[[STREAM_ERROR]]")) {
        toast.error("生成中断：" + acc.split("[[STREAM_ERROR]]")[1]?.slice(0, 120));
        return;
      }

      const deck = extractSlideDeck(acc);
      if (!deck) {
        toast.error("没解析出有效的幻灯片，换个模型或重试。");
        return;
      }
      setHtml(deck);

      // 存历史（localStorage）
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        title: deckTitle(deck, value.trim() || selectedTemplate?.name || "未命名 PPT"),
        html: deck,
        createdAt: Date.now(),
      };
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, HISTORY_CAP);
        return saveHistory(next);
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "生成失败");
    } finally {
      setGenerating(false);
    }
  };

  const openHistoryItem = (entry: HistoryEntry) => {
    setHtml(entry.html);
    setHistoryOpen(false);
    setFragmentKey((k) => k + 1);
  };

  const deleteEntry = (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id);
      return saveHistory(next);
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // 忽略
    }
  };

  const openInNewTab = () => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const download = () => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sdesign-slides.html";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  // 导出 PDF：新标签打开"打印就绪"版本，自动调起浏览器打印 → 另存为 PDF（矢量、中文完美）
  const exportPdf = () => {
    if (!html) return;
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("弹窗被拦截，请允许本站弹窗后重试");
      return;
    }
    win.document.open();
    win.document.write(buildPrintableDeck(html));
    win.document.close();
    toast.info("已打开打印窗口，在弹出的对话框里选「另存为 PDF」即可");
  };

  const reset = () => {
    setHtml(null);
    setStreamedChars(0);
  };

  // —— 左上角历史记录（两个视图都常驻）——
  const historyUI = (
    <>
      {/* 触发按钮已移到 NavBar（右上角 GitHub 旁），这里只留抽屉 */}
      {historyOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setHistoryOpen(false)}
          />
          <aside className="fixed top-0 left-0 z-50 h-full w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-white/40 dark:border-white/10 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/40 dark:border-white/10">
              <span className="font-semibold flex items-center gap-2">
                <HistoryIcon className="size-4" /> 历史记录
              </span>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center mt-10 px-4 leading-relaxed">
                  暂无历史
                  <br />
                  生成的 PPT 会自动保存在这里
                </p>
              ) : (
                history.map((e) => (
                  <div
                    key={e.id}
                    className="group flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <button
                      type="button"
                      onClick={() => openHistoryItem(e)}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="text-sm font-medium truncate">
                        {e.title}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <ClockIcon className="size-3" />
                        {timeAgo(e.createdAt)}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteEntry(e.id)}
                      title="删除"
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity"
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
            {history.length > 0 && (
              <div className="p-3 border-t border-white/40 dark:border-white/10">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={clearHistory}
                >
                  清空历史
                </Button>
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );

  // —— 结果预览态 ——
  if (html) {
    return (
      <>
        {historyUI}
        <div className="w-full">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcwIcon className="size-4" /> 再做一份
            </Button>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFragmentKey((k) => k + 1)}
            >
              刷新
            </Button>
            <Button variant="outline" size="sm" onClick={openInNewTab}>
              <ExternalLinkIcon className="size-4" /> 新标签打开
            </Button>
            <Button variant="outline" size="sm" onClick={download}>
              <DownloadIcon className="size-4" /> 导出 HTML
            </Button>
            <Button size="sm" onClick={exportPdf}>
              <FileDownIcon className="size-4" /> 导出 PDF
            </Button>
          </div>
          <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/40 dark:border-white/10 shadow-xl bg-black">
            <iframe
              key={fragmentKey}
              className="h-full w-full"
              sandbox="allow-scripts allow-same-origin allow-popups"
              srcDoc={html}
            />
          </div>
        </div>
      </>
    );
  }

  // —— 输入态 ——
  return (
    <>
      {historyUI}
      <div
        className={cn(
          "relative p-4 pt-3 rounded-2xl transition-all duration-300",
          "bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl",
          "border border-white/40 dark:border-white/10 shadow-xl shadow-black/5"
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <ModelSelect
            value={modelId}
            onChange={setModelId}
            disabled={generating}
          />
          {generating && (
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Loader2Icon className="size-3.5 animate-spin" />
              生成中 · 已接收 {streamedChars} 字（慢模型可能要几分钟）
            </span>
          )}
        </div>

        <TextareaAutoSize
          value={value}
          disabled={generating}
          onChange={(e) => setValue(e.target.value)}
          minRows={2}
          maxRows={8}
          placeholder="描述你要做的 PPT 主题，或上传文档 / 选个模板风格…"
          className="resize-none border-none w-full outline-none bg-transparent"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              onGenerate();
            }
          }}
        />

        {(selectedTemplate || attachment) && (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {selectedTemplate && (
              <div className="inline-flex items-center gap-2 text-sm bg-blue-600/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-600/20">
                <LayoutTemplateIcon className="size-4 shrink-0" />
                <span className="max-w-[220px] truncate">
                  风格：{selectedTemplate.name}
                </span>
                <button
                  type="button"
                  onClick={clearTemplate}
                  className="hover:text-blue-900 dark:hover:text-white"
                  aria-label="取消模板"
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
            )}
            {attachment && (
              <div className="inline-flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg">
                <FileTextIcon className="size-4 shrink-0" />
                <span className="max-w-[200px] truncate">{attachment.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="hover:text-blue-900 dark:hover:text-white"
                  aria-label="移除附件"
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-x-2 items-end justify-between pt-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || generating}
            title="上传文档（PDF / Word / txt / md），作为生成参考"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-sm font-medium text-[#4a86d4] border border-[#4a86d4]/35 bg-[#4a86d4]/10 hover:bg-[#4a86d4]/20 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <PaperclipIcon className="size-4" />
            )}
            参考附件
            <span className="opacity-70">（可选）</span>
          </button>

          <Button
            onClick={onGenerate}
            className={cn("size-8 rounded-full", {
              "bg-muted-foreground border": generating || !hasInput,
            })}
            disabled={generating || uploading || !hasInput}
          >
            {generating ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <ArrowUpIcon />
            )}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,.markdown"
          className="hidden"
          onChange={onPickFile}
        />
      </div>
    </>
  );
};
