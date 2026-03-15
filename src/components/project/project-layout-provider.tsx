"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ProjectLayoutConfig, WidgetLayoutItem } from "@/lib/database.types";
import {
  getDefaultLayoutConfig,
  normalizeLayoutConfig,
} from "@/lib/project-widgets";
import { updateProjectLayout } from "@/app/actions/projects";

type LayoutState = {
  layoutConfig: ProjectLayoutConfig;
  editMode: boolean;
  isSaving: boolean;
};

type LayoutContextValue = LayoutState & {
  visibleWidgets: WidgetLayoutItem[];
  setEditMode: (v: boolean) => void;
  setLayoutConfig: (config: ProjectLayoutConfig) => void;
  moveWidget: (fromIndex: number, toIndex: number) => void;
  hideWidget: (id: string) => void;
  showWidget: (id: string) => void;
  resetLayout: () => void;
  saveLayout: () => Promise<void>;
  hiddenWidgetIds: string[];
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function useProjectLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useProjectLayout must be used within ProjectLayoutProvider");
  return ctx;
}

type ProjectLayoutProviderProps = {
  projectId: string;
  initialLayoutConfig: ProjectLayoutConfig | null;
  isFreelancer: boolean;
  children: ReactNode;
};

export function ProjectLayoutProvider({
  projectId,
  initialLayoutConfig,
  isFreelancer,
  children,
}: ProjectLayoutProviderProps) {
  const normalized = useMemo(
    () => normalizeLayoutConfig(initialLayoutConfig, isFreelancer),
    [initialLayoutConfig, isFreelancer]
  );

  const [layoutConfig, setLayoutConfigState] = useState<ProjectLayoutConfig>(normalized);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const visibleWidgets = useMemo(
    () =>
      [...layoutConfig.widgets]
        .filter((w) => w.visible)
        .sort((a, b) => a.position - b.position),
    [layoutConfig]
  );

  const hiddenWidgetIds = useMemo(
    () => layoutConfig.widgets.filter((w) => !w.visible).map((w) => w.id),
    [layoutConfig]
  );

  const setLayoutConfig = useCallback((next: ProjectLayoutConfig) => {
    setLayoutConfigState(next);
  }, []);

  const moveWidget = useCallback((fromIndex: number, toIndex: number) => {
    setLayoutConfigState((prev) => {
      const visible = [...prev.widgets].filter((w) => w.visible).sort((a, b) => a.position - b.position);
      const hidden = prev.widgets.filter((w) => !w.visible);
      const [item] = visible.splice(fromIndex, 1);
      if (!item) return prev;
      visible.splice(toIndex, 0, item);
      const widgets = visible.map((w, i) => ({ ...w, position: i }));
      const maxPos = widgets.length;
      hidden.forEach((w, i) => widgets.push({ ...w, position: maxPos + i }));
      return { widgets };
    });
  }, []);

  const hideWidget = useCallback((id: string) => {
    setLayoutConfigState((prev) => {
      const widgets = prev.widgets.map((w) =>
        w.id === id ? { ...w, visible: false } : w
      );
      return { widgets };
    });
  }, []);

  const showWidget = useCallback((id: string) => {
    setLayoutConfigState((prev) => {
      const maxPos = Math.max(0, ...prev.widgets.map((w) => w.position));
      const widgets = prev.widgets.map((w) =>
        w.id === id ? { ...w, visible: true, position: maxPos + 1 } : w
      );
      return { widgets };
    });
  }, []);

  const resetLayout = useCallback(() => {
    setLayoutConfigState(getDefaultLayoutConfig(isFreelancer));
  }, [isFreelancer]);

  const saveLayout = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateProjectLayout(projectId, layoutConfig);
    } finally {
      setIsSaving(false);
    }
  }, [projectId, layoutConfig]);

  const value: LayoutContextValue = useMemo(
    () => ({
      layoutConfig,
      editMode,
      isSaving,
      visibleWidgets,
      setEditMode,
      setLayoutConfig,
      moveWidget,
      hideWidget,
      showWidget,
      resetLayout,
      saveLayout,
      hiddenWidgetIds,
    }),
    [
      layoutConfig,
      editMode,
      isSaving,
      visibleWidgets,
      setLayoutConfig,
      moveWidget,
      hideWidget,
      showWidget,
      resetLayout,
      saveLayout,
      hiddenWidgetIds,
    ]
  );

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}
