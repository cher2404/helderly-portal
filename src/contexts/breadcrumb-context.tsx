"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

const BreadcrumbContext = createContext<{
  projectName: string | null;
  setProjectName: (name: string | null) => void;
}>({ projectName: null, setProjectName: () => {} });

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [projectName, setProjectName] = useState<string | null>(null);
  const setter = useCallback((name: string | null) => setProjectName(name), []);
  return (
    <BreadcrumbContext.Provider value={{ projectName, setProjectName: setter }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbProjectName() {
  return useContext(BreadcrumbContext);
}
