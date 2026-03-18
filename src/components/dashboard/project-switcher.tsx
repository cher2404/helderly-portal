"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, FolderOpen, Check } from "lucide-react";
import { ROUTES, projectSegment } from "@/lib/constants";
import type { Project } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/ui/status-dot";

type Props = {
  projects: Project[];
  currentProjectId: string | null;
  className?: string;
};

export function ProjectSwitcher({ projects, currentProjectId, className }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const resolvedCurrentId = currentProjectId;
  const currentProject = resolvedCurrentId
    ? projects.find((p) => p.id === resolvedCurrentId || projectSegment(p) === resolvedCurrentId) ?? null
    : null;
  const filtered =
    query.trim() === ""
      ? projects
      : projects.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.client_email ?? "").toLowerCase().includes(query.toLowerCase())
        );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayLabel = currentProject ? currentProject.name : "All projects";

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-2 rounded-[12px] border px-3 py-2.5 text-left text-sm font-medium transition-colors",
          "border-zinc-200 bg-zinc-50 text-zinc-900 hover:border-zinc-300 hover:bg-zinc-100",
          "dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
        )}
      >
        <FolderOpen className="h-4 w-4 shrink-0 text-zinc-400" />
        <span className="flex-1 truncate">{displayLabel}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-zinc-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-[12px] border shadow-xl",
            "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          )}
        >
          <div className="border-b border-zinc-800 p-2 dark:border-zinc-800 light:border-zinc-200">
            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 dark:border-zinc-700 dark:bg-zinc-950">
              <Search className="h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search projects…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-500 outline-none dark:text-zinc-100"
              />
            </div>
          </div>
          <ul className="max-h-64 overflow-auto p-1">
            <li>
              <button
                type="button"
                onClick={() => {
                  router.push(ROUTES.dashboard);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm",
                  !resolvedCurrentId
                    ? "bg-[var(--primary-accent)]/15 text-[var(--primary-accent)]"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
                )}
              >
                <FolderOpen className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">All projects</span>
                {!resolvedCurrentId && <Check className="h-4 w-4 shrink-0" />}
              </button>
            </li>
            {filtered.map((project) => {
              const isActive = resolvedCurrentId === projectSegment(project);
              return (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => {
                      router.push(ROUTES.project(projectSegment(project)));
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-[var(--primary-accent)]/15 text-[var(--primary-accent)]"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
                    )}
                  >
                    <StatusDot status={project.health_status ?? "on_track"} />
                    <span className="flex-1 truncate">{project.name}</span>
                    <span className="text-xs text-zinc-500">{project.progress_percentage}%</span>
                    {isActive && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-2.5 py-4 text-center text-sm text-zinc-500">No projects found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
