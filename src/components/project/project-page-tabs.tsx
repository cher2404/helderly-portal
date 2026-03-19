"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  MessageSquare,
  Target,
  Gavel,
  Clock,
  TrendingUp,
  HelpCircle,
  Phone,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const PROJECT_TAB_IDS = [
  "milestones",
  "decisions",
  "meetings",
  "budget",
  "faq",
  "contact",
  "scratchpad",
  "documents",
  "feedback",
  "timeline",
] as const;

type Props = { projectSegment: string; isFreelancer: boolean };

const tabConfig: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; samePage: boolean }
> = {
  dashboard: { label: "Dashboard", icon: LayoutDashboard, samePage: true },
  milestones: { label: "Mijlpalen", icon: Target, samePage: true },
  decisions: { label: "Beslissingen", icon: Gavel, samePage: true },
  meetings: { label: "Afspraken", icon: Clock, samePage: true },
  budget: { label: "Budget", icon: TrendingUp, samePage: true },
  faq: { label: "FAQ", icon: HelpCircle, samePage: true },
  contact: { label: "Contact", icon: Phone, samePage: true },
  scratchpad: { label: "Notities", icon: StickyNote, samePage: true },
  documents: { label: "Documenten", icon: FileText, samePage: true },
  timeline: { label: "Timeline", icon: Calendar, samePage: true },
  feedback: { label: "Feedback", icon: MessageSquare, samePage: true },
};

export function ProjectPageTabs({ projectSegment, isFreelancer }: Props) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab") ?? "dashboard";
  const isProjectPage = pathname === ROUTES.project(projectSegment);

  const primaryTabs = ["dashboard", "milestones", "documents", "feedback"] as const;
  const freelancerSecondaryTabs = [
    "decisions",
    "meetings",
    "budget",
    "faq",
    "contact",
    "scratchpad",
    "timeline",
  ] as const;
  const clientSecondaryTabs: string[] = [];
  const secondaryTabs = isFreelancer ? freelancerSecondaryTabs : clientSecondaryTabs;

  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const buildHref = (key: string) => {
    if (key === "dashboard") return ROUTES.project(projectSegment);
    return `${ROUTES.project(projectSegment)}?tab=${key}`;
  };

  const isActive = (key: string) => {
    if (key === "dashboard") return isProjectPage && (!searchParams?.get("tab") || tab === "dashboard");
    return isProjectPage && tab === key;
  };

  const isSecondaryActive = secondaryTabs.some((key) => isActive(key));

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    if (moreOpen) document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, [moreOpen]);

  return (
    <nav
      role="tablist"
      aria-label="Project tabs"
      className="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-700 pb-3 mb-6 relative"
    >
      {primaryTabs.map((key) => {
        const config = tabConfig[key];
        if (!config) return null;
        const href = buildHref(key);
        const active = isActive(key);
        const Icon = config.icon;
        return (
          <Link
            key={key}
            href={href}
            onClick={() => setMoreOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors border",
              active
                ? "nav-active-neon"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-500/10 hover:text-zinc-900 dark:hover:text-zinc-100 border-transparent"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {config.label}
          </Link>
        );
      })}

      {secondaryTabs.length > 0 && (
        <div ref={moreRef} className="relative">
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors border",
              isSecondaryActive || moreOpen
                ? "nav-active-neon"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-500/10 hover:text-zinc-900 dark:hover:text-zinc-100 border-transparent"
            )}
          >
            {(() => { const activeKey = secondaryTabs.find((k) => isActive(k)); return activeKey ? `${tabConfig[activeKey]?.label} ●` : "Meer ▾"; })()}
          </button>

          {moreOpen && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-[12px] shadow-lg py-1 min-w-[160px]">
              {secondaryTabs.map((key) => {
                const config = tabConfig[key];
                if (!config) return null;
                const href = buildHref(key);
                const active = isActive(key);
                const Icon = config.icon;
                return (
                  <Link
                    key={key}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-colors",
                      active
                        ? "text-[var(--primary-accent)] bg-[var(--primary-accent)]/5"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {config.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export function getProjectTab(searchParams: URLSearchParams | null): string {
  const tab = searchParams?.get("tab") ?? "dashboard";
  if (PROJECT_TAB_IDS.includes(tab as (typeof PROJECT_TAB_IDS)[number])) return tab;
  if (tab === "dashboard") return "dashboard";
  return "dashboard";
}
