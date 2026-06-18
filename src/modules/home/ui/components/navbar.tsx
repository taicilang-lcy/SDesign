"use client";

import Image from "next/image";
import Link from "next/link";
import { HistoryIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScroll } from "@/hooks/use-scroll";
import { useHistoryUi } from "@/modules/home/ui/history-ui-context";
import { LanguageSwitcher } from "@/modules/home/ui/components/language-switcher";
import { cn } from "@/lib/utils";

export const NavBar = () => {
  const isScrolled = useScroll();
  const { count, setOpen } = useHistoryUi();
  const t = useTranslations("Navbar");

  return (
    <nav
      className={cn(
        "p-4 fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-lg shadow-black/5"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/sdesign-s.png" alt="SDesign" width={30} height={40} priority />
          <span className="font-semibold text-lg tracking-tight">Design</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="#gallery"
            className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t("templates")}
          </Link>
          {count > 0 && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              title={t("history", { count })}
              className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <HistoryIcon className="size-4" />
              {t("history", { count })}
            </button>
          )}
          <a
            href="https://github.com/simonlin1212"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t("github")}
          </a>
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
};
