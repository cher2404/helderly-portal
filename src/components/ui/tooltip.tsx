"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TooltipProps = {
  children: React.ReactNode;
  content: string;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
};

export function Tooltip({ children, content, side = "top", className }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  };

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          className={cn(
            "absolute z-50 px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap",
            "bg-zinc-200 text-zinc-900 border border-zinc-300",
            "dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700",
            sideClasses[side]
          )}
          role="tooltip"
        >
          {content}
        </span>
      )}
    </span>
  );
}
