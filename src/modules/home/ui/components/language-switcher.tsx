"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { GlobeIcon } from "lucide-react";
import { setUserLocale } from "@/i18n/locale";

/**
 * 语言切换：中文 ⇄ English。
 * 点击 → 写 locale cookie（setUserLocale 服务端动作）→ Next 自动用新语言重渲染。
 */
export const LanguageSwitcher = () => {
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  const isZh = locale === "zh-CN";
  const next = isZh ? "en-US" : "zh-CN";
  const label = isZh ? "EN" : "中文";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setUserLocale(next);
        })
      }
      title={isZh ? "Switch to English" : "切换到中文"}
      aria-label={isZh ? "Switch to English" : "切换到中文"}
      className="inline-flex items-center gap-1 rounded-md border border-slate-300/70 dark:border-white/15 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
    >
      <GlobeIcon className="size-3.5" />
      {label}
    </button>
  );
};
