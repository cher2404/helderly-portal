"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, FileText, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

type Props = { projectId: string };

const tabs = [
  { href: (id: string) => ROUTES.project(id), label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: (id: string) => `${ROUTES.timeline}?project=${id}`, label: "Timeline", icon: Calendar, exact: false },
  { href: (id: string) => `${ROUTES.documents}?project=${id}`, label: "Documenten", icon: FileText, exact: false },
  { href: (id: string) => `${ROUTES.messages}?project=${id}`, label: "Feedback", icon: MessageSquare, exact: false },
] as const;

export function ProjectPageTabs({ projectId }: Props) {
  const pathname = usePathname() ?? "";

  return (
    <nav
      role="tablist"
      aria-label="Project tabs"
      className="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-700 pb-3 mb-6"
    >
      {tabs.map((tab) => {
        const href = tab.href(projectId);
        const isDashboard = tab.exact;
        const active = isDashboard
          ? pathname === ROUTES.project(projectId)
          : pathname === href.split("?")[0];
        return (
          <Link
            key={tab.label}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors border",
              active
                ? "nav-active-neon"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-500/10 hover:text-zinc-900 dark:hover:text-zinc-100 border-transparent"
            )}
          >
            <tab.icon className="h-4 w-4 shrink-0" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
