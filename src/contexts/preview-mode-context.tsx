"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type PreviewModeContextValue = {
  isPreviewMode: boolean;
  setPreviewMode: (value: boolean) => void;
  togglePreviewMode: () => void;
};

const PreviewModeContext = createContext<PreviewModeContextValue | null>(null);

export function usePreviewMode(): PreviewModeContextValue {
  const ctx = useContext(PreviewModeContext);
  if (!ctx) {
    return {
      isPreviewMode: false,
      setPreviewMode: () => {},
      togglePreviewMode: () => {},
    };
  }
  return ctx;
}

export function PreviewModeProvider({ children }: { children: ReactNode }) {
  const [isPreviewMode, setPreviewModeState] = useState(false);
  const setPreviewMode = useCallback((value: boolean) => setPreviewModeState(value), []);
  const togglePreviewMode = useCallback(() => setPreviewModeState((v) => !v), []);

  const value: PreviewModeContextValue = {
    isPreviewMode,
    setPreviewMode,
    togglePreviewMode,
  };

  return (
    <PreviewModeContext.Provider value={value}>
      {children}
    </PreviewModeContext.Provider>
  );
}
