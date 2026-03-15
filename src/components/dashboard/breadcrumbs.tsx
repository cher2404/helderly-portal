"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useBreadcrumbProjectName } from "@/contexts/breadcrumb-context";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  timeline: "Timeline",
  documents: "Documenten",
  messages: "Feedback",
  clients: "Klanten",
  settings: "Instellingen",
  project: "Project",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function Breadcrumbs() {
  const pathname = usePathname();
  const { projectName } = useBreadcrumbProjectName();
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const dashboardIndex = segments.indexOf("dashboard");
  const relevant = dashboardIndex >= 0 ? segments.slice(dashboardIndex) : segments;

  if (relevant.length <= 1) {
    return (
      <nav aria-label="Breadcrumb" className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
        <Link href={ROUTES.dashboard} className="hover:text-zinc-700 dark:hover:text-zinc-300">
          Dashboard
        </Link>
      </nav>
    );
  }

  const items: { href: string; label: string }[] = [{ href: ROUTES.dashboard, label: "Dashboard" }];
  let href = "/dashboard";
  for (let i = 1; i < relevant.length; i++) {
    const segment = relevant[i];
    if (segment === "project" && relevant[i + 1]) {
      href += `/project/${relevant[i + 1]}`;
      const name = projectName || (UUID_REGEX.test(relevant[i + 1]) ? "Project" : relevant[i + 1]);
      items.push({ href, label: name });
      break;
    }
    href += `/${segment}`;
    const label = LABELS[segment] ?? segment;
    items.push({ href, label });
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 mb-1 flex-wrap">
      {items.map((item, i) => (
        <span key={item.href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />}
          {i === items.length - 1 ? (
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-zinc-700 dark:hover:text-zinc-300">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
