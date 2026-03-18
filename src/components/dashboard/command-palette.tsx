"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FolderOpen, LayoutDashboard, Settings, ListTodo, Gavel, HelpCircle } from "lucide-react";
import { ROUTES, projectSegment } from "@/lib/constants";
import type { Project } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/ui/status-dot";

type Props = { projects: Project[] };

type SearchResult = {
  projects: { id: string; name: string; href: string }[];
  stages: { id: string; project_id: string; title: string; href: string }[];
  decisions: { id: string; project_id: string; title: string; href: string }[];
  faqs: { id: string; project_id: string; question: string; href: string }[];
};

export function CommandPalette({ projects }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
        setSearchResults(null);
        if (!open) setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        } else setSearchResults(null);
      } catch {
        setSearchResults(null);
      } finally {
        setSearching(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  const filteredProjects =
    query.trim() === ""
      ? projects
      : query.trim().length < 2
        ? projects.filter(
            (p) =>
              p.name.toLowerCase().includes(query.toLowerCase()) ||
              (p.client_email ?? "").toLowerCase().includes(query.toLowerCase())
          )
        : searchResults?.projects ?? [];
  const useGlobalSearch = query.trim().length >= 2 && searchResults;

  const go = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-zinc-950/60 dark:bg-zinc-950/80 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-[12px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 px-3 py-2">
          <Search className="h-4 w-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search projects, milestones, decisions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-sm outline-none py-1.5"
          />
          <kbd className="hidden sm:inline text-xs text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5">
            Esc
          </kbd>
        </div>
        <ul className="max-h-[60vh] overflow-auto py-1">
          <li>
            <button
              type="button"
              onClick={() => go(ROUTES.dashboard)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              Dashboard
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => go(ROUTES.settings)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Settings className="h-4 w-4 shrink-0" />
              Settings
            </button>
          </li>
          {useGlobalSearch && searchResults && (
            <>
              {searchResults.stages.length > 0 && (
                <li className="px-3 pt-2 pb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">Milestones</li>
              )}
              {searchResults.stages.slice(0, 5).map((s) => (
                <li key={`s-${s.id}`}>
                  <button type="button" onClick={() => go(s.href)} className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                    <ListTodo className="h-4 w-4 shrink-0 text-zinc-400" />
                    <span className="flex-1 truncate">{s.title}</span>
                  </button>
                </li>
              ))}
              {searchResults.decisions.length > 0 && (
                <li className="px-3 pt-2 pb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">Decisions</li>
              )}
              {searchResults.decisions.slice(0, 5).map((d) => (
                <li key={`d-${d.id}`}>
                  <button type="button" onClick={() => go(d.href)} className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                    <Gavel className="h-4 w-4 shrink-0 text-zinc-400" />
                    <span className="flex-1 truncate">{d.title}</span>
                  </button>
                </li>
              ))}
              {searchResults.faqs.length > 0 && (
                <li className="px-3 pt-2 pb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">FAQ</li>
              )}
              {searchResults.faqs.slice(0, 5).map((f) => (
                <li key={`f-${f.id}`}>
                  <button type="button" onClick={() => go(f.href)} className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                    <HelpCircle className="h-4 w-4 shrink-0 text-zinc-400" />
                    <span className="flex-1 truncate">{f.question}</span>
                  </button>
                </li>
              ))}
            </>
          )}
          <li className="px-3 pt-2 pb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">Projects</li>
          {filteredProjects.map((project) => (
            <li key={project.id}>
              <button
                type="button"
                onClick={() => go("href" in project ? project.href : ROUTES.project(projectSegment(project)))}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  "text-zinc-900 dark:text-zinc-100"
                )}
              >
                <StatusDot status={"health_status" in project ? (project.health_status ?? "on_track") : "on_track"} />
                <FolderOpen className="h-4 w-4 shrink-0 text-zinc-400" />
                <span className="flex-1 truncate">{project.name}</span>
                {"progress_percentage" in project && (
                  <span className="text-xs text-zinc-500">{project.progress_percentage}%</span>
                )}
              </button>
            </li>
          ))}
          {searching && <li className="px-3 py-4 text-center text-sm text-zinc-500">Searching…</li>}
          {!searching && filteredProjects.length === 0 && query.trim() !== "" && (
            <li className="px-3 py-6 text-center text-sm text-zinc-500">No results found</li>
          )}
        </ul>
      </div>
    </div>
  );
}
