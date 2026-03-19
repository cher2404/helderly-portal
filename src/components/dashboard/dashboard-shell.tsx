"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  Menu,
  X,
  FolderKanban,
  Inbox,
  Users,
  Sun,
  Moon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import type { Profile, Project, ThemePreference } from "@/lib/database.types";
import { updateProfileTheme } from "@/app/actions/profile";
import { CommandPalette } from "./command-palette";
import { TrialBanner } from "./trial-banner";
import { PaywallOverlay } from "./paywall-overlay";
import { NotificationsBell } from "./notifications-bell";
import { WelcomeModal } from "./welcome-modal";
import { Breadcrumbs } from "./breadcrumbs";
import { Tooltip } from "@/components/ui/tooltip";
import { isTrialActive } from "@/lib/trial";
import type { Notification } from "@/lib/database.types";
import { PreviewModeProvider, usePreviewMode } from "@/contexts/preview-mode-context";

/** Freelancer: alle secties als eigen tab (Dashboard = alle projecten, rest eigen tabbladen) */
const freelancerNav = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.clients, label: "Klanten", icon: Users },
];

const freelancerOverviewNav = [
  { href: ROUTES.documents, label: "Alle bestanden", icon: FileText },
  { href: ROUTES.messages, label: "Alle feedback", icon: MessageSquare },
];

const freelancerBottomNav = [{ href: ROUTES.settings, label: "Instellingen", icon: Settings }];

const customerNav = [
  { href: ROUTES.dashboard, label: "Mijn project", icon: Inbox },
  { href: ROUTES.timeline, label: "Timeline", icon: Calendar },
  { href: ROUTES.documents, label: "Bestanden", icon: FileText },
  { href: ROUTES.messages, label: "Feedback", icon: MessageSquare },
  { href: ROUTES.settings, label: "Instellingen", icon: Settings },
];

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";
  const next: ThemePreference = isDark ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => {
        setTheme(next);
        void updateProfileTheme(next);
      }}
      className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    </button>
  );
}

type Props = {
  profile: Profile;
  initialProjects: Project[];
  initialNotifications: Notification[];
  unreadNotificationCount: number;
  children: React.ReactNode;
};

export function DashboardShell({ profile, initialProjects, initialNotifications, unreadNotificationCount, children }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isFreelancer = profile.role === "admin";
  const isProjectPage = pathname.startsWith("/dashboard/project/");
  const currentProjectId = isProjectPage ? pathname.split("/").pop() ?? null : null;

  const navSections = isFreelancer ? [] : [{ title: null, items: customerNav }];

  const isActive = (href: string) => {
    if (href === ROUTES.dashboard) return pathname === href || isProjectPage;
    return pathname === href || (href !== ROUTES.dashboard && pathname.startsWith(href));
  };

  return (
    <PreviewModeProvider>
      <DashboardShellInner
        profile={profile}
        initialProjects={initialProjects}
        initialNotifications={initialNotifications}
        unreadNotificationCount={unreadNotificationCount}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        isFreelancer={isFreelancer}
        currentProjectId={currentProjectId}
        navSections={navSections}
        isActive={isActive}
      >
        {children}
      </DashboardShellInner>
    </PreviewModeProvider>
  );
}

function DashboardShellInner({
  profile,
  initialProjects,
  initialNotifications,
  unreadNotificationCount,
  mobileOpen,
  setMobileOpen,
  isFreelancer,
  currentProjectId,
  navSections,
  isActive,
  children,
}: {
  profile: Profile;
  initialProjects: Project[];
  initialNotifications: Notification[];
  unreadNotificationCount: number;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  isFreelancer: boolean;
  currentProjectId: string | null;
  navSections: { title: string | null; items: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }> }> }[];
  isActive: (href: string) => boolean;
  children: React.ReactNode;
}) {
  const { isPreviewMode } = usePreviewMode();
  const pathname = usePathname();
  const [spinKey, setSpinKey] = useState(0);

  function getNavHref(navHref: string, projectId: string | null): string {
    if (!projectId) return navHref;
    if (navHref === ROUTES.documents) return `${ROUTES.documents}?project=${projectId}`;
    if (navHref === ROUTES.messages) return `${ROUTES.messages}?project=${projectId}`;
    return navHref;
  }

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  useEffect(() => {
    setSpinKey((k) => k + 1);
  }, [pathname]);

  return (
    <>
      <PaywallOverlay show={!isTrialActive(profile)} />
      <WelcomeModal profile={profile} />
      <div className="lg:hidden fixed top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-none">
        <Button
          variant="ghost"
          size="icon"
          className="pointer-events-auto border border-zinc-200 bg-white/80 dark:border-white/10 dark:bg-zinc-900/80 backdrop-blur-xl rounded-xl"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="pointer-events-auto">
          <NotificationsBell initialNotifications={initialNotifications} unreadCount={unreadNotificationCount} />
        </div>
      </div>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-56 flex flex-col transition-transform duration-200 ease-out",
          "border-r border-zinc-200/80 bg-white/90 dark:border-zinc-600/20 dark:bg-zinc-900/50 backdrop-blur-xl",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-200/80 dark:border-zinc-600/20">
          {profile.logo_url ? (
            <Link href={ROUTES.dashboard} className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={spinKey}
                src={profile.logo_url}
                alt="Logo"
                className="h-8 max-w-[140px] object-contain object-left animate-helderly-spin"
              />
            </Link>
          ) : (
            <Link
              href={ROUTES.dashboard}
              className="font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight flex items-center gap-2 text-sm"
            >
              <FolderKanban key={spinKey} className="h-4 w-4 text-[var(--primary-accent)] animate-helderly-spin" />
              Helderly
            </Link>
          )}
          <div className="flex items-center gap-1">
            <NotificationsBell initialNotifications={initialNotifications} unreadCount={unreadNotificationCount} />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isFreelancer && (
          <div className="p-3 border-b border-zinc-200/80 dark:border-white/10 space-y-2">
            <Link
              href="/dashboard#create-project"
              className="flex items-center justify-center gap-2 rounded-[12px] px-3 py-2.5 text-sm font-medium text-white bg-[var(--primary-accent)] hover:opacity-90 transition-colors"
            >
              <FolderKanban className="h-4 w-4 shrink-0" />
              Nieuw project
            </Link>
            {initialProjects.length === 0 && (
              <Link
                href={ROUTES.dashboard}
                className="flex items-center justify-center gap-2 rounded-[12px] border border-slate-300 dark:border-slate-500/20 border-dashed px-3 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-[var(--primary-accent)]/40 hover:text-[var(--primary-accent)] hover:bg-[var(--primary-accent)]/5 transition-colors"
              >
                <FolderKanban className="h-4 w-4 shrink-0" />
                Eerste project aanmaken
              </Link>
            )}
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1 overflow-auto">
          {isFreelancer ? (
            <>
              {/* Hoofdnavigatie */}
              <div className="space-y-0.5">
                {freelancerNav.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Tooltip key={href} content={label} side="right">
                      <Link
                        href={getNavHref(href, currentProjectId)}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-[12px] px-3 py-2 text-sm font-medium tracking-tight transition-colors border",
                          active
                            ? "nav-active-neon"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-500/10 hover:text-zinc-900 dark:hover:text-zinc-100 border-transparent"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </Link>
                    </Tooltip>
                  );
                })}
              </div>

              {/* Separator met label */}
              <div className="mt-4 mb-1">
                <p className="px-3 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                  Overzicht
                </p>
              </div>

              {/* Overzichtnavigatie */}
              <div className="space-y-0.5">
                {freelancerOverviewNav.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Tooltip key={href} content={label} side="right">
                      <Link
                        href={getNavHref(href, currentProjectId)}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-[12px] px-3 py-2 text-sm font-medium tracking-tight transition-colors border",
                          active
                            ? "nav-active-neon"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-500/10 hover:text-zinc-900 dark:hover:text-zinc-100 border-transparent"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </Link>
                    </Tooltip>
                  );
                })}
              </div>

              {/* Bottom navigatie */}
              <div className="mt-4 pt-3 border-t border-zinc-200/70 dark:border-zinc-600/20">
                <div className="space-y-0.5">
                  {freelancerBottomNav.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                      <Tooltip key={href} content={label} side="right">
                        <Link
                          href={getNavHref(href, currentProjectId)}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-2.5 rounded-[12px] px-3 py-2 text-sm font-medium tracking-tight transition-colors border",
                            active
                              ? "nav-active-neon"
                              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-500/10 hover:text-zinc-900 dark:hover:text-zinc-100 border-transparent"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {label}
                        </Link>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            navSections.map(({ title, items }) => (
              <div key={title ?? "main"}>
                {title && (
                  <p className="px-3 pt-3 pb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {title}
                  </p>
                )}
                {items.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Tooltip key={href} content={label} side="right">
                      <Link
                        href={getNavHref(href, currentProjectId)}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-[12px] px-3 py-2 text-sm font-medium tracking-tight transition-colors border",
                          active
                            ? "nav-active-neon"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-500/10 hover:text-zinc-900 dark:hover:text-zinc-100 border-transparent"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </Link>
                    </Tooltip>
                  );
                })}
              </div>
            ))
          )}
        </nav>
        <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-600/20 space-y-2">
          {isFreelancer && profile.slug && (
            <Link
              href={ROUTES.settings}
              className="flex items-center gap-2 rounded-[12px] px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-500/10 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <span className="truncate">Inloglink voor klanten</span>
            </Link>
          )}
          {!isFreelancer && (
            <a
              href="https://helderly.io?ref=portal"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-[8px] px-2 py-1.5 transition-colors hover:bg-[#6366f1]/5 group"
            >
              <div className="w-4 h-4 bg-[#6366f1] rounded-[4px] flex flex-col justify-center px-[3px] gap-[2.5px] shrink-0">
                <span className="block h-[1.5px] w-full bg-white rounded-full" />
                <span className="block h-[1.5px] bg-white rounded-full opacity-65" style={{ width: "68%" }} />
                <span className="block h-[1.5px] bg-white rounded-full opacity-35" style={{ width: "83%" }} />
              </div>
              <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-colors">
                Gemaakt met <span className="font-medium text-zinc-500">Helderly</span>
              </span>
            </a>
          )}
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {isPreviewMode ? "Klantweergave" : isFreelancer ? "Freelancer" : "Klant"}
            </p>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-zinc-950/70 dark:bg-zinc-950/70 backdrop-blur-sm lg:hidden"
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="lg:pl-56 min-h-screen pt-14 lg:pt-0 flex flex-col">
        <TrialBanner profile={profile} />
        <div className="flex-1 p-5 sm:p-6 lg:p-8 max-w-6xl">
          <Breadcrumbs />
          {children}
        </div>
      </main>

      {isFreelancer && <CommandPalette projects={initialProjects} />}
    </>
  );
}
