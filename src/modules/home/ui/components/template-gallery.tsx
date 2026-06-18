"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { usePromptDraft } from "@/modules/home/ui/prompt-draft";
import {
  TEMPLATE_CATEGORIES,
  type TemplateInfo,
} from "@/data/templates";

export const TemplateGallery = () => {
  const { selectTemplate } = usePromptDraft();
  const t = useTranslations("TemplateGallery");
  const isEn = useLocale() === "en-US";

  const useTemplate = (tpl: TemplateInfo) => {
    // 不直接生成、也不往输入框塞文字：只记下选中的风格，回到顶部补主题/传文档后再发送。
    // 真正的"套风格"在后台用该模板的真实设计代码完成。
    selectTemplate({ slug: tpl.slug, name: isEn ? tpl.nameEn : tpl.name });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section id="gallery" className="w-full pb-24 pt-4">
      <div className="text-center mb-2">
        <h2 className="text-2xl md:text-3xl font-bold">{t("title")}</h2>
        <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
      </div>

      {TEMPLATE_CATEGORIES.map((cat) => (
        <div key={cat.id} className="mt-10">
          <div className="flex items-baseline gap-3 mb-4 pb-2 border-b border-black/5 dark:border-white/10">
            <span className="text-xl">{cat.icon}</span>
            <span className="text-lg font-semibold">
              {isEn ? cat.nameEn : cat.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {isEn ? cat.tipEn : cat.tip}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cat.templates.map((tpl) => (
              <button
                key={tpl.slug}
                onClick={() => useTemplate(tpl)}
                className="group text-left bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-black/5 dark:border-white/10">
                  <Image
                    src={`/thumbs/${tpl.slug}.png`}
                    alt={isEn ? tpl.nameEn : tpl.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 100vw, 320px"
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-sm font-medium">
                    {isEn ? tpl.nameEn : tpl.name}
                  </span>
                  <span className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/15 px-2.5 py-1 rounded-md group-hover:bg-blue-100 dark:group-hover:bg-blue-500/25 transition-colors">
                    {t("useThis")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      <p className="text-center text-xs text-muted-foreground mt-12">
        {t("more")}
      </p>
    </section>
  );
};
