import "server-only";
import fs from "fs";
import path from "path";
import { TEMPLATE_BY_SLUG, isValidTemplateSlug } from "@/data/templates";

// "真套风格"核心：把模板 example.html 里的真实设计代码（字体 + CSS）当风格种子喂给 AI。
// 这些代码只在后台组装，绝不暴露到前台输入框。

const TEMPLATE_DIR = path.join(process.cwd(), "src/data/template-examples");
const MAX_STYLE_CHARS = 42000; // 控制喂给模型的 token，超出截断（<style> 在 <head>，截断不影响主体样式）

export interface TemplateStyle {
  slug: string;
  name: string;
  css: string;
}

// 读取某模板的真实设计代码（Google Fonts <link> + 所有 <style> 块）
export function getTemplateStyle(slug: string): TemplateStyle | null {
  if (!isValidTemplateSlug(slug)) return null;
  try {
    const html = fs.readFileSync(path.join(TEMPLATE_DIR, `${slug}.html`), "utf8");

    const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
      .map((m) => m[1].trim())
      .filter(Boolean)
      .join("\n\n");

    const fontLinks = [
      ...html.matchAll(/<link[^>]+href="[^"]*fonts\.googleapis[^"]*"[^>]*>/gi),
    ]
      .map((m) => m[0])
      .join("\n");

    if (!styleBlocks) return null;

    let css = `${fontLinks}\n<style>\n${styleBlocks}\n</style>`.trim();
    if (css.length > MAX_STYLE_CHARS) css = css.slice(0, MAX_STYLE_CHARS);

    return { slug, name: TEMPLATE_BY_SLUG[slug]?.name ?? slug, css };
  } catch {
    return null;
  }
}

interface GenInputParts {
  userText?: string;
  docText?: string;
  style?: TemplateStyle | null;
}

// 把"客户文字 + 上传文档 + 模板真实代码"三者组装成最终喂给 AI 的内容。
// 三者都可选，凑出什么就给 AI 什么。
export function buildGenInput({ userText, docText, style }: GenInputParts): string {
  const parts: string[] = [];

  const trimmedUser = userText?.trim();
  if (trimmedUser) parts.push(trimmedUser);

  const trimmedDoc = docText?.trim();
  if (trimmedDoc) {
    parts.push(
      `【用户提供的资料】请严格基于以下真实内容来组织 PPT，所有数字、名称、结论都要忠于原文，不要自行编造：\n${trimmedDoc}`
    );
  }

  if (style?.css) {
    parts.push(
      `【风格参考：${style.name}】请严格沿用下面这套设计的视觉风格——配色、字体（含相同的 Google Fonts）、版式、间距、动画都要与之保持一致，让成品看起来像出自同一套模板。只把内容替换成上面要求的内容，不要另起炉灶换风格：\n${style.css}`
    );
  }

  if (parts.length === 0) return "做一份好看、专业的 PPT。";
  return parts.join("\n\n---\n\n");
}
