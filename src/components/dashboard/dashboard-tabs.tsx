"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Calendar,
  Settings,
  Users,
  FolderKanban,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

type TabItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const freelancerMainTabs: TabItem[] = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.clients, label: "Klanten", icon: Users },
  { href: ROUTES.documents, label: "Documenten", icon: FileText },
  { href: ROUTES.timeline, label: "Timeline", icon: Calendar },
  { href: ROUTES.messages, label: "Feedback", icon: MessageSquare },
  { href: ROUTES.settings, label: "Instellingen", icon: Settings },
];

const customerMainTabs: TabItem[] = [
  { href: ROUTES.dashboard, label: "Mijn project", icon: Inbox },
  { href: ROUTES.timeline, label: "Timeline", icon: Calendar },
  { href: ROUTES.documents, label: "Bestanden", icon: FileText },
  { href: ROUTES.messages, label: "Feedback", icon: MessageSquare },
  { href: ROUTES.settings, label: "Instellingen", icon: Settings },
];

function TabLink({
  href,
  label,
  icon: Icon,
  active,
}: TabItem & { active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors border",
        active
          ? "nav-active-neon"
          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-500/10 hover:text-zinc-900 dark:hover:text-zinc-100 border-transparent"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

type Props = { isFreelancer: boolean };

export function DashboardTabs({ isFreelancer }: Props) {
  const pathname = usePathname() ?? "";
  const isProjectPage = pathname.startsWith("/dashboard/project/");
  const projectId = isProjectPage ? pathname.split("/").pop() ?? null : null;

  if (isProjectPage && projectId) {
    const projectTabs: TabItem[] = [
      { href: ROUTES.project(projectId), label: "Overzicht", icon: FolderKanban },
      { href: `${ROUTES.timeline}?project=${projectId}`, label: "Timeline", icon: Calendar },
      { href: `${ROUTES.documents}?project=${projectId}`, label: "Documenten", icon: FileText },
      { href: `${ROUTES.messages}?project=${projectId}`, label: "Feedback", icon: MessageSquare },
    ];
    return (
      <nav
        role="tablist"
        aria-label="Project tabs"
        className="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-700 pb-3 mb-4"
      >
        {projectTabs.map((tab) => {
          const isOverview = tab.href === ROUTES.project(projectId);
          const active = isOverview ? pathname === tab.href : pathname === tab.href.split("?")[0];
          return (
            <TabLink
              key={tab.href}
              href={tab.href}
              label={tab.label}
              icon={tab.icon}
              active={!!active}
            />
          );
        })}
      </nav>
    );
  }

  const tabs = isFreelancer ? freelancerMainTabs : customerMainTabs;

  return (
    <nav
      role="tablist"
      aria-label="Dashboard tabs"
      className="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-700 pb-3 mb-4"
    >
      {tabs.map((tab) => {
        const active =
          tab.href === ROUTES.dashboard
            ? pathname === ROUTES.dashboard
            : pathname === tab.href || (tab.href !== ROUTES.dashboard && pathname.startsWith(tab.href));
        return (
          <TabLink
            key={tab.href}
            href={tab.href}
            label={tab.label}
            icon={tab.icon}
            active={!!active}
          />
        );
      })}
    </nav>
  );
}
