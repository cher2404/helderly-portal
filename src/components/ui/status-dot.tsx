"use client";

import { cn } from "@/lib/utils";
import type { ProjectHealthStatus } from "@/lib/database.types";

const statusConfig: Record<ProjectHealthStatus, { label: string; className: string }> = {
  on_track: {
    label: "Op schema",
    className: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
  },
  needs_attention: {
    label: "Aandacht nodig",
    className: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
  },
  blocked: {
    label: "Geblokkeerd",
    className: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]",
  },
};

type StatusDotProps = {
  status: ProjectHealthStatus | null | undefined;
  showLabel?: boolean;
  className?: string;
};

export function StatusDot({ status, showLabel = false, className }: StatusDotProps) {
  const effective = status ?? "on_track";
  const config = statusConfig[effective];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full", config.className)}
        title={config.label}
        aria-hidden
      />
      {showLabel && (
        <span className="text-xs text-zinc-400">{config.label}</span>
      )}
    </span>
  );
}
