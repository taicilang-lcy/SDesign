// 模板库数据：前台画廊 + 后台"真套风格"共用（DRY）。
// slug 必须与 src/data/template-examples/<slug>.html 和 public/thumbs/<slug>.png 对应。

export interface TemplateInfo {
  slug: string;
  name: string;
}

export interface TemplateCategory {
  id: string;
  icon: string;
  name: string;
  tip: string;
  templates: TemplateInfo[];
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: "data",
    icon: "📊",
    name: "行业数据报告",
    tip: "数据 · 图表 · 权威",
    templates: [
      { slug: "zhangzara-monochrome", name: "极简黑白报告" },
      { slug: "zhangzara-vellum", name: "深蓝学术" },
      { slug: "zhangzara-cobalt-grid", name: "钴蓝格纸" },
    ],
  },
  {
    id: "reading",
    icon: "📖",
    name: "读书笔记",
    tip: "书卷 · 衬线 · 内容向",
    templates: [
      { slug: "taste-editorial", name: "暖纸杂志风" },
      { slug: "zhangzara-soft-editorial", name: "文学衬线" },
      { slug: "zhangzara-pin-and-paper", name: "手账图钉" },
    ],
  },
  {
    id: "product",
    icon: "💡",
    name: "产品介绍",
    tip: "功能 · 卖点 · 说服力",
    templates: [
      { slug: "product-launch", name: "产品发布" },
      { slug: "zhangzara-blue-professional", name: "钴蓝商务" },
      { slug: "zhangzara-neo-grid-bold", name: "大字爆点" },
    ],
  },
  {
    id: "knowledge",
    icon: "🎓",
    name: "知识科普",
    tip: "图解 · 清晰 · 教学向",
    templates: [
      { slug: "graphify-dark-graph", name: "知识图谱（暗）" },
      { slug: "knowledge-arch-blueprint", name: "架构蓝图" },
      { slug: "dir-key-nav-minimal", name: "每页一概念" },
    ],
  },
  {
    id: "pitch",
    icon: "🚀",
    name: "路演融资",
    tip: "投资人 · 数字 · 机构感",
    templates: [
      { slug: "pitch-deck", name: "投资人路演" },
      { slug: "zhangzara-signal", name: "深蓝金机构" },
      { slug: "zhangzara-cartesian", name: "古典叙事" },
    ],
  },
  {
    id: "review",
    icon: "🔁",
    name: "工作 / 项目复盘",
    tip: "周报 · 总结 · 汇报",
    templates: [
      { slug: "weekly-report", name: "周报 / 复盘" },
      { slug: "testing-safety-alert", name: "事故复盘（暗）" },
      { slug: "zhangzara-mat", name: "哑光商务" },
    ],
  },
  {
    id: "course",
    icon: "🧑‍🏫",
    name: "课程培训 / 教学课件",
    tip: "课件 · 培训 · 自测",
    templates: [
      { slug: "course-module", name: "教学模块" },
      { slug: "tech-sharing", name: "技术分享" },
      { slug: "obsidian-claude-gradient", name: "开发教程" },
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
