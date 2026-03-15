"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WIDGET_META, type WidgetId } from "@/lib/project-widgets";
import { useProjectLayout } from "./project-layout-provider";

type WidgetGalleryProps = {
  onClose: () => void;
  isOpen: boolean;
};

export function WidgetGallery({ onClose, isOpen }: WidgetGalleryProps) {
  const { hiddenWidgetIds, showWidget } = useProjectLayout();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-sm"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="fixed right-0 top-0 z-50 h-full w-full max-w-sm border-l border-zinc-800 bg-zinc-950 shadow-xl"
        role="dialog"
        aria-label="Widget gallery"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-100">Add widget</h2>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg text-zinc-400 hover:text-zinc-200"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
        <div className="p-4 space-y-2">
          {hiddenWidgetIds.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4">
              All widgets are visible. Hide one from the dashboard to add it back here.
            </p>
          ) : (
            hiddenWidgetIds.map((id) => {
              const meta = WIDGET_META[id as WidgetId];
              if (!meta) return null;
              return (
                <button
                  key={id}
                  type="button"
                  className="w-full flex items-center justify-between gap-3 rounded-[12px] border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-left transition-colors hover:border-zinc-700 hover:bg-zinc-800/50"
                  onClick={() => {
                    showWidget(id);
                    onClose();
                  }}
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{meta.label}</p>
                    <p className="text-xs text-zinc-500">{meta.description}</p>
                  </div>
                  <Plus className="h-4 w-4 shrink-0 text-zinc-400" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
