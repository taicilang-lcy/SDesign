// 从模型输出里抠出单文件 HTML 幻灯片。前后端都可用（无依赖）。

/**
 * 优先取 <slide_deck>...</slide_deck>，否则回退到完整 html 文档，
 * 并去掉可能残留的 markdown 代码围栏。
 */
export function extractSlideDeck(text: string): string | null {
  // 取最后一个完整的 <slide_deck> 块：模型有时先输出说明/草稿块再输出正片，
  // 非贪婪只取第一个会误取到说明块。
  const blocks = [...text.matchAll(/<slide_deck>([\s\S]*?)<\/slide_deck>/gi)];
  let html = blocks.length ? (blocks[blocks.length - 1][1]?.trim() ?? null) : null;

  if (!html) {
    const doc =
      text.match(/<!doctype html[\s\S]*?<\/html>/i) ??
      text.match(/<html[\s\S]*?<\/html>/i);
    html = doc?.[0]?.trim() ?? null;
  }

  if (!html) return null;

  html = html
    .replace(/^[`]{3}[a-zA-Z]*\s*/, "")
    .replace(/\s*[`]{3}$/, "")
    .trim();

  return html || null;
}

/** 提取 <task_summary> 内的文本（用作标题/收尾文案） */
export function extractTaskSummary(text: string): string | null {
  const m = text.match(/<task_summary>([\s\S]*?)<\/task_summary>/i);
  return m?.[1]?.trim() || null;
}
