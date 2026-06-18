// 模板库数据：前台画廊 + 后台"真套风格"共用（DRY）。
// slug 必须与 src/data/template-examples/<slug>.html 和 public/thumbs/<slug>.png 对应。
// name/tip = 中文（后台生成 + 中文 UI）；nameEn/tipEn = 英文 UI（gallery 按 locale 取）。

export interface TemplateInfo {
  slug: string;
  name: string;
  nameEn: string;
}

export interface TemplateCategory {
  id: string;
  icon: string;
  name: string;
  nameEn: string;
  tip: string;
  tipEn: string;
  templates: TemplateInfo[];
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: "data",
    icon: "📊",
    name: "行业数据报告",
    nameEn: "Industry Data Report",
    tip: "数据 · 图表 · 权威",
    tipEn: "Data · Charts · Authority",
    templates: [
      { slug: "zhangzara-monochrome", name: "极简黑白报告", nameEn: "Minimal B&W Report" },
      { slug: "zhangzara-vellum", name: "深蓝学术", nameEn: "Deep-Blue Academic" },
      { slug: "zhangzara-cobalt-grid", name: "钴蓝格纸", nameEn: "Cobalt Grid Paper" },
    ],
  },
  {
    id: "reading",
    icon: "📖",
    name: "读书笔记",
    nameEn: "Book Notes",
    tip: "书卷 · 衬线 · 内容向",
    tipEn: "Bookish · Serif · Content-first",
    templates: [
      { slug: "taste-editorial", name: "暖纸杂志风", nameEn: "Warm Editorial" },
      { slug: "zhangzara-soft-editorial", name: "文学衬线", nameEn: "Literary Serif" },
      { slug: "zhangzara-pin-and-paper", name: "手账图钉", nameEn: "Journal & Pins" },
    ],
  },
  {
    id: "product",
    icon: "💡",
    name: "产品介绍",
    nameEn: "Product Intro",
    tip: "功能 · 卖点 · 说服力",
    tipEn: "Features · Selling points · Persuasion",
    templates: [
      { slug: "product-launch", name: "产品发布", nameEn: "Product Launch" },
      { slug: "zhangzara-blue-professional", name: "钴蓝商务", nameEn: "Cobalt Business" },
      { slug: "zhangzara-neo-grid-bold", name: "大字爆点", nameEn: "Bold Type" },
    ],
  },
  {
    id: "knowledge",
    icon: "🎓",
    name: "知识科普",
    nameEn: "Explainer",
    tip: "图解 · 清晰 · 教学向",
    tipEn: "Diagrams · Clear · Teaching",
    templates: [
      { slug: "graphify-dark-graph", name: "知识图谱（暗）", nameEn: "Knowledge Graph (Dark)" },
      { slug: "knowledge-arch-blueprint", name: "架构蓝图", nameEn: "Architecture Blueprint" },
      { slug: "dir-key-nav-minimal", name: "每页一概念", nameEn: "One Idea per Slide" },
    ],
  },
  {
    id: "pitch",
    icon: "🚀",
    name: "路演融资",
    nameEn: "Pitch Deck",
    tip: "投资人 · 数字 · 机构感",
    tipEn: "Investors · Numbers · Institutional",
    templates: [
      { slug: "pitch-deck", name: "投资人路演", nameEn: "Investor Pitch" },
      { slug: "zhangzara-signal", name: "深蓝金机构", nameEn: "Navy & Gold" },
      { slug: "zhangzara-cartesian", name: "古典叙事", nameEn: "Classic Narrative" },
    ],
  },
  {
    id: "review",
    icon: "🔁",
    name: "工作 / 项目复盘",
    nameEn: "Work / Project Retrospective",
    tip: "周报 · 总结 · 汇报",
    tipEn: "Weekly · Summary · Report",
    templates: [
      { slug: "weekly-report", name: "周报 / 复盘", nameEn: "Weekly Report" },
      { slug: "testing-safety-alert", name: "事故复盘（暗）", nameEn: "Incident Review (Dark)" },
      { slug: "zhangzara-mat", name: "哑光商务", nameEn: "Matte Business" },
    ],
  },
  {
    id: "course",
    icon: "🧑‍🏫",
    name: "课程培训 / 教学课件",
    nameEn: "Training / Courseware",
    tip: "课件 · 培训 · 自测",
    tipEn: "Slides · Training · Self-check",
    templates: [
      { slug: "course-module", name: "教学模块", nameEn: "Teaching Module" },
      { slug: "tech-sharing", name: "技术分享", nameEn: "Tech Talk" },
      { slug: "obsidian-claude-gradient", name: "开发教程", nameEn: "Dev Tutorial" },
    ],
  },
];

export interface TemplateMeta {
  name: string;
  category: string;
}

export const TEMPLATE_BY_SLUG: Record<string, TemplateMeta> =
  TEMPLATE_CATEGORIES.reduce<Record<string, TemplateMeta>>((acc, cat) => {
    for (const tpl of cat.templates) {
      acc[tpl.slug] = { name: tpl.name, category: cat.name };
    }
    return acc;
  }, {});

export const isValidTemplateSlug = (slug: string): boolean =>
  Object.prototype.hasOwnProperty.call(TEMPLATE_BY_SLUG, slug);
