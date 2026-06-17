"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// 历史记录的 UI 桥接：把「条数 + 抽屉开关」抬到 NavBar 和 Generator 共同的祖先，
// 这样历史触发按钮能放进 NavBar（右上角 GitHub 旁），而历史数据/抽屉仍留在 Generator。
interface HistoryUiValue {
  count: number;
  setCount: (n: number) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}

const HistoryUiContext = createContext<HistoryUiValue>({
  count: 0,
  setCount: () => {},
  open: false,
  setOpen: () => {},
});

export const HistoryUiProvider = ({ children }: { children: ReactNode }) => {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  return (
    <HistoryUiContext.Provider value={{ count, setCount, open, setOpen }}>
      {children}
    </HistoryUiContext.Provider>
  );
};

export const useHistoryUi = (): HistoryUiValue => useContext(HistoryUiContext);
