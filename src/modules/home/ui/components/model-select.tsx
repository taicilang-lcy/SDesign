"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, SparklesIcon, KeyIcon, CheckIcon } from "lucide-react";
import { aiModels, isCliProvider, type ModelConfig } from "@/lib/ai-models";
import { cn } from "@/lib/utils";

interface ModelSelectProps {
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

export const ModelSelect = ({ value, onChange, disabled }: ModelSelectProps) => {
  const current = aiModels.find((m) => m.id === value) ?? aiModels[0];
  const subs = aiModels.filter((m) => isCliProvider(m.provider));
  const apis = aiModels.filter((m) => !isCliProvider(m.provider));

  const renderItem = (m: ModelConfig) => (
    <DropdownMenuItem
      key={m.id}
      disabled={m.comingSoon}
      onSelect={() => onChange(m.id)}
      className="flex items-start gap-2"
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium flex items-center gap-1.5">
          {m.name}
          {m.comingSoon && (
            <span className="text-[10px] text-muted-foreground border rounded px-1 leading-tight">
              即将支持
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {m.description}
        </div>
      </div>
      {value === m.id && <CheckIcon className="size-4 shrink-0 mt-0.5" />}
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium",
            "border border-white/40 dark:border-white/10 bg-white/40 dark:bg-slate-800/40",
            "hover:bg-white/70 dark:hover:bg-slate-700/60 transition-colors disabled:opacity-50"
          )}
        >
          <span className="text-muted-foreground">
            {isCliProvider(current.provider) ? "订阅" : "API"}
          </span>
          <span className="opacity-40">·</span>
          <span>{current.name}</span>
          <ChevronDownIcon className="size-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <SparklesIcon className="size-4 text-blue-500" />
            <span className="flex-1">订阅</span>
            <span className="text-[10px] text-muted-foreground">免 API key</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-60">
            {subs.map(renderItem)}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <KeyIcon className="size-4 text-amber-500" />
            <span className="flex-1">API</span>
            <span className="text-[10px] text-muted-foreground">填自己的 key</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-60">
            {apis.map(renderItem)}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
