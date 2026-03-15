"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FolderOpen, FileText, Clock, Inbox, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Project, Asset, Profile, Appointment, Template } from "@/lib/database.types";
import { ProjectBuilderForm } from "./project-builder-form";
import { StatusDot } from "@/components/ui/status-dot";
import { Tooltip } from "@/components/ui/tooltip";

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
          Overzicht van je projecten, acties en recente bestanden.
        </p>
      </div>

      {/* Onboarding: toon korte checklist als nog geen slug of geen projecten */}
      {!profile.slug && (
        <div className="rounded-[12px] border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-3 text-sm">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">Quick start</p>
          <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
            Stel in <Link href={ROUTES.settings} className="text-[var(--primary-accent)] hover:underline">Instellingen</Link> je inloglink voor klanten in, zodat ze bij jou kunnen inloggen.
          </p>
        </div>
      )}
      {(pendingAssetsCount > 0 || meetingsTodayCount > 0) && (
        <div className="flex flex-wrap items-center gap-4 rounded-[12px] border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm">
          {pendingAssetsCount > 0 && (
            <span className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <FileText className="h-4 w-4 shrink-0" />
              <strong>{pendingAssetsCount}</strong> {pendingAssetsCount === 1 ? "bestand" : "bestanden"} wachten op goedkeuring
            </span>
          )}
          {meetingsTodayCount > 0 && (
            <span className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Calendar className="h-4 w-4 shrink-0" />
              <strong>{meetingsTodayCount}</strong> {meetingsTodayCount === 1 ? "afspraak" : "afspraken"} vandaag
            </span>
          )}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tooltip content="Actieve projecten">
          <Card className="rounded-2xl border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.03] hover:border-zinc-300 dark:hover:border-white/[0.1] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Actieve projecten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{activeCount}</p>
            </CardContent>
          </Card>
        </Tooltip>
        <Tooltip content="Files awaiting approval">
          <Card className="rounded-2xl border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.03] hover:border-zinc-300 dark:hover:border-white/[0.1] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Pending approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{pendingFiles}</p>
            </CardContent>
          </Card>
        </Tooltip>
        <Tooltip content="Totaal aantal projecten">
          <Card className="rounded-2xl border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.03] hover:border-zinc-300 dark:hover:border-white/[0.1] transition-colors sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Totaal projecten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{projects.length}</p>
            </CardContent>
          </Card>
        </Tooltip>
      </section>

      <section id="create-project">
        <ProjectBuilderForm templates={initialTemplates} />
      </section>

      <section>
        <Card className="rounded-2xl border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.03]">
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
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
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
                        href={ROUTES.project(project.id)}
                        className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02] p-4 hover:border-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.05] dark:hover:border-white/[0.1] transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <StatusDot status={project.health_status ?? "on_track"} />
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-900 dark:text-zinc-50 group-hover:text-[var(--primary-accent)] truncate">
                              {project.name}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                              <span>{project.progress_percentage}%</span>
                              {nextMeeting && (
                                <>
                                  <span>·</span>
                                  <span className="flex items-center gap-1 truncate">
                                    <Calendar className="h-3 w-3 shrink-0" />
                                    {nextMeeting.title} {nextMeeting.appointment_date}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <FolderOpen className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-[var(--primary-accent)]" />
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
        <Card className="rounded-2xl border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-50">Recent uploads</CardTitle>
            <CardDescription>Latest files across projects.</CardDescription>
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
                    className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02] px-4 py-2.5"
                  >
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{asset.file_name}</span>
                    <a
                      href={asset.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
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
    </div>
  );
}
