"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
] as const;

type Props = { projectSegment: string; projectId: string; isFreelancer: boolean };

const tabConfig: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; samePage: boolean }
> = {
  dashboard: { label: "Dashboard", icon: LayoutDashboard, samePage: true },
  milestones: { label: "Milestones", icon: Target, samePage: true },
  decisions: { label: "Beslissingen", icon: Gavel, samePage: true },
  meetings: { label: "Afspraken", icon: Clock, samePage: true },
  budget: { label: "Budget", icon: TrendingUp, samePage: true },
  faq: { label: "FAQ", icon: HelpCircle, samePage: true },
  contact: { label: "Contact", icon: Phone, samePage: true },
  scratchpad: { label: "Notities", icon: StickyNote, samePage: true },
  documents: { label: "Documenten", icon: FileText, samePage: false },
  timeline: { label: "Timeline", icon: Calendar, samePage: false },
  feedback: { label: "Feedback", icon: MessageSquare, samePage: false },
};

export function ProjectPageTabs({ projectSegment, projectId, isFreelancer }: Props) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab") ?? "dashboard";
  const isProjectPage = pathname === ROUTES.project(projectSegment);

  const buildHref = (key: string) => {
    const c = tabConfig[key];
    if (!c) return ROUTES.project(projectSegment);
    if (c.samePage) {
      if (key === "dashboard") return ROUTES.project(projectSegment);
      return `${ROUTES.project(projectSegment)}?tab=${key}`;
    }
    if (key === "documents") return `${ROUTES.documents}?project=${projectId}`;
    if (key === "timeline") return `${ROUTES.timeline}?project=${projectId}`;
    if (key === "feedback") return `${ROUTES.messages}?project=${projectId}`;
    return ROUTES.project(projectSegment);
  };

  const isActive = (key: string) => {
    if (key === "dashboard") return isProjectPage && (tab === "dashboard" || !searchParams?.get("tab"));
    if (tabConfig[key]?.samePage) return isProjectPage && tab === key;
    if (key === "documents") return pathname === ROUTES.documents;
    if (key === "timeline") return pathname === ROUTES.timeline;
    if (key === "feedback") return pathname === ROUTES.messages;
    return false;
  };

  const tabsToShow: string[] = [
    "dashboard",
    "milestones",
    "documents",
    "decisions",
    "meetings",
    "budget",
    "faq",
    "contact",
    ...(isFreelancer ? (["scratchpad"] as const) : []),
    "timeline",
    "feedback",
  ];

  return (
    <nav
      role="tablist"
      aria-label="Project tabs"
      className="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-700 pb-3 mb-6"
    >
      {tabsToShow.map((key) => {
        const config = tabConfig[key];
        if (!config) return null;
        const href = buildHref(key);
        const active = isActive(key);
        const Icon = config.icon;
        return (
          <Link
            key={key}
            href={href}
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
    </nav>
  );
}

export function getProjectTab(searchParams: URLSearchParams | null): string {
  const tab = searchParams?.get("tab") ?? "dashboard";
  if (PROJECT_TAB_IDS.includes(tab as (typeof PROJECT_TAB_IDS)[number])) return tab;
  if (tab === "dashboard") return "dashboard";
  return "dashboard";
}
