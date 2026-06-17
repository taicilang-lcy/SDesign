"use client";

import { createContext, useContext, useState } from "react";

export interface SelectedTemplate {
  slug: string;
  name: string;
}

interface PromptDraftCtx {
  // 当前选中的模板（风格）。点选模板不再往输入框塞文字，改为后台用它的真实代码套风格。
  selectedTemplate: SelectedTemplate | null;
  selectTemplate: (tpl: SelectedTemplate) => void;
  clearTemplate: () => void;
}

const Ctx = createContext<PromptDraftCtx>({
  selectedTemplate: null,
  selectTemplate: () => {},
  clearTemplate: () => {},
});

export function PromptDraftProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<SelectedTemplate | null>(null);

  const selectTemplate = (tpl: SelectedTemplate) => setSelectedTemplate(tpl);
  const clearTemplate = () => setSelectedTemplate(null);

  return (
    <Ctx.Provider value={{ selectedTemplate, selectTemplate, clearTemplate }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePromptDraft() {
  return useContext(Ctx);
}
