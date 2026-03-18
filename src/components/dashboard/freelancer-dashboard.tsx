"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FolderOpen, FileText, Clock, Inbox, Calendar, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES, projectSegment } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Project, Asset, Profile, Appointment, Template } from "@/lib/database.types";
import { ProjectBuilderForm } from "./project-builder-form";
import { GlassModal } from "@/components/ui/glass-modal";
import { OnboardingChecklist } from "./onboarding-checklist";
import { StatusDot } from "@/components/ui/status-dot";
import { getSignedUrlFromAsset } from "@/lib/supabase/storage";

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(new Date(dateStr));
}

type Props = {
  initialProjects: Project[];
  initialRecentAssets: Asset[];
  initialUpcomingAppointments: Appointment[];
  pendingAssetsCount: number;
  meetingsTodayCount: number;
  initialTemplates: Template[];
  profile: Profile;
};

export function FreelancerDashboard({
  initialProjects,
  initialRecentAssets,
  initialUpcomingAppointments = [],
  pendingAssetsCount = 0,
  meetingsTodayCount = 0,
  initialTemplates = [],
  profile,
}: Props) {
  const [projects] = useState(initialProjects);
  const [recentAssets] = useState(initialRecentAssets);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const filteredProjects =
    statusFilter === "all"
      ? projects
      : statusFilter === "active"
        ? projects.filter((p) => p.status === "active")
        : projects.filter((p) => p.status === "completed");

  const nextByProject = useMemo(() => {
    const map = new Map<string, Appointment>();
    for (const apt of initialUpcomingAppointments) {
      if (!map.has(apt.project_id)) map.set(apt.project_id, apt);
    }
    return map;
  }, [initialUpcomingAppointments]);

  const activeCount = projects.filter((p) => p.status === "active").length;
  const pendingFiles = recentAssets.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Overzicht van alle lopende projecten, acties en recente bestanden.
        </p>
      </div>

      <OnboardingChecklist profile={profile} projects={projects} />
      {(pendingAssetsCount > 0 || meetingsTodayCount > 0) && (
        <div
          className="flex flex-wrap items-center gap-4 rounded-[12px] border border-amber-500/20 bg-amber-500/6 px-4 py-3 text-sm"
          style={{ animation: "slideInLeft 0.4s ease-out 0.1s both" }}
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"
              style={{ animation: "dotPing 1.5s ease-in-out infinite" }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
          </span>
          {pendingAssetsCount > 0 && (
            <span className="flex items-center gap-2 text-amber-200 dark:text-amber-200">
              <FileText className="h-4 w-4 shrink-0" />
              <strong>{pendingAssetsCount}</strong>{" "}
              {pendingAssetsCount === 1 ? "bestand wacht" : "bestanden wachten"} op goedkeuring
            </span>
          )}
          {meetingsTodayCount > 0 && (
            <span className="flex items-center gap-2 text-amber-200 dark:text-amber-200">
              <Calendar className="h-4 w-4 shrink-0" />
              <strong>{meetingsTodayCount}</strong>{" "}
              {meetingsTodayCount === 1 ? "afspraak" : "afspraken"} vandaag
            </span>
          )}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Actieve projecten */}
        <Link
          href={ROUTES.dashboard}
          className="group relative overflow-hidden rounded-[14px] border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--primary-accent)]/30 hover:shadow-lg"
          style={{ animation: "kpiCardIn 0.4s ease-out 0.05s both" }}
        >
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--primary-accent)]/15">
            <FolderOpen className="h-4 w-4 text-[var(--primary-accent)]" />
          </div>
          <p
            className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            style={{ animation: "kpiNumPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.3s both" }}
          >
            {activeCount}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Actieve projecten
          </p>
          <span className="absolute right-4 top-4 text-zinc-300 dark:text-zinc-700 transition-all group-hover:text-[var(--primary-accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-sm">
            ↗
          </span>
        </Link>

        {/* Wacht op goedkeuring */}
        <Link
          href={ROUTES.documents}
          className="group relative overflow-hidden rounded-[14px] border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-5 transition-all hover:-translate-y-0.5 hover:border-amber-500/30 hover:shadow-lg"
          style={{ animation: "kpiCardIn 0.4s ease-out 0.12s both" }}
        >
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[8px] bg-amber-500/10">
            <FileText className="h-4 w-4 text-amber-500" />
          </div>
          <p
            className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            style={{ animation: "kpiNumPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.4s both" }}
          >
            {pendingFiles}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Wacht op goedkeuring
          </p>
          <span className="absolute right-4 top-4 text-zinc-300 dark:text-zinc-700 transition-all group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-sm">
            ↗
          </span>
        </Link>

        {/* Totaal */}
        <div
          className="relative overflow-hidden rounded-[14px] border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-5 sm:col-span-2 lg:col-span-1"
          style={{ animation: "kpiCardIn 0.4s ease-out 0.19s both" }}
        >
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[8px] bg-emerald-500/10">
            <Clock className="h-4 w-4 text-emerald-500" />
          </div>
          <p
            className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            style={{ animation: "kpiNumPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.5s both" }}
          >
            {projects.length}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Totaal projecten
          </p>
        </div>
      </section>

      <div id="create-project" className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-[12px] px-4 py-2.5 text-sm font-medium text-white bg-[var(--primary-accent)] hover:opacity-90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nieuw project
        </button>
      </div>

      <section>
        <Card className="rounded-[12px] border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-50">Jouw projecten</CardTitle>
            <CardDescription>Status, voortgang en volgende afspraak per project.</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {(["all", "active", "completed"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatusFilter(key)}
                    className={cn(
                      "rounded-[12px] px-3 py-1.5 text-xs font-medium transition-colors",
                      statusFilter === key
                        ? "bg-[var(--primary-accent)] text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    )}
                  >
                    {key === "all" ? "Alle" : key === "active" ? "Actief" : "Voltooid"}
                  </button>
                ))}
              </div>
            )}
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-[12px] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-white/[0.04] p-8 mb-4">
                  <Inbox className="h-14 w-14 text-zinc-400 dark:text-zinc-500 mx-auto" />
                </div>
                <p className="text-zinc-900 dark:text-zinc-100 font-semibold">Nog geen projecten</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                  Maak je eerste project aan. Voeg een klant-e-mail en deadline toe.
                </p>
                <a
                  href="#create-project"
                  className="mt-6 inline-flex items-center gap-2 rounded-[12px] px-4 py-2.5 text-sm font-medium text-white transition-colors bg-[var(--primary-accent)] hover:opacity-90"
                >
                  <FolderOpen className="h-4 w-4" />
                  Eerste project aanmaken
                </a>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredProjects.map((project) => {
                  const nextMeeting = nextByProject.get(project.id);
                  return (
                    <li key={project.id}>
                      <Link
                        href={ROUTES.project(projectSegment(project))}
                        className="flex items-center justify-between gap-4 rounded-[12px] border border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02] p-4 hover:border-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.05] dark:hover:border-white/[0.1] transition-all group hover:translate-x-1 hover:border-[var(--primary-accent)]/20"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <StatusDot status={project.health_status ?? "on_track"} />
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-900 dark:text-zinc-50 group-hover:text-[var(--primary-accent)] truncate">
                              {project.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[var(--primary-accent)] transition-all"
                                  style={{ width: `${project.progress_percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0 w-8 text-right">
                                {project.progress_percentage}%
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-1">
                              {nextMeeting && (
                                <>
                                  <span>·</span>
                                  <span className="flex items-center gap-1 truncate">
                                    <Calendar className="h-3 w-3 shrink-0" />
                                    {nextMeeting.title} {formatDate(nextMeeting.appointment_date)}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <FolderOpen className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-[var(--primary-accent)]" />
                          <span className="shrink-0 text-zinc-700 opacity-0 transition-all group-hover:opacity-100 group-hover:text-[var(--primary-accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                            ↗
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="rounded-[12px] border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-50">Recente uploads</CardTitle>
            <CardDescription>Laatste bestanden over alle projecten.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-2" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Nog geen bestanden geüpload. Upload via Documenten per project.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {recentAssets.slice(0, 5).map((asset) => (
                  <li
                    key={asset.id}
                    className="flex items-center justify-between rounded-[12px] border border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02] px-4 py-2.5"
                  >
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{asset.file_name}</span>
                    <a
                      href="#"
                      onClick={async (ev) => {
                        ev.preventDefault();
                        const signedUrl = await getSignedUrlFromAsset(asset);
                        if (!signedUrl) return;
                        window.open(signedUrl, "_blank", "noopener,noreferrer");
                      }}
                      className="text-sm text-[var(--primary-accent)] hover:underline"
                    >
                      Downloaden
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {showCreateModal && (
        <GlassModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Nieuw project aanmaken"
        >
          <ProjectBuilderForm
            templates={initialTemplates}
            onSuccess={() => setShowCreateModal(false)}
          />
        </GlassModal>
      )}
    </div>
  );
}

