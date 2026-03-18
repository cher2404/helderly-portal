"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type Toast = { id: number; message: string; type: "success" | "error" | "info" };

let listeners: ((toast: Toast) => void)[] = [];
let counter = 0;

export function showToast(message: string, type: Toast["type"] = "success") {
  const toast: Toast = { id: ++counter, message, type };
  listeners.forEach((l) => l(toast));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3500);
    };
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-3 rounded-[12px] border px-4 py-3 text-sm font-medium shadow-lg pointer-events-auto transition-all",
            "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700",
            t.type === "success" && "border-l-4 border-l-[var(--primary-accent)]",
            t.type === "error" && "border-l-4 border-l-red-500",
            t.type === "info" && "border-l-4 border-l-amber-400"
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

