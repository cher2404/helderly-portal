"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FolderOpen, FileText, Clock, Inbox, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
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
}: Props) {
  const [projects] = useState(initialProjects);
  const [recentAssets] = useState(initialRecentAssets);

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
      {(pendingAssetsCount > 0 || meetingsTodayCount > 0) && (
        <div className="flex flex-wrap items-center gap-4 rounded-[12px] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-3 text-sm">
          {pendingAssetsCount > 0 && (
            <span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <FileText className="h-4 w-4 text-[var(--primary-accent)]" />
              <strong>{pendingAssetsCount}</strong> {pendingAssetsCount === 1 ? "asset" : "assets"} waiting for approval
            </span>
          )}
          {meetingsTodayCount > 0 && (
            <span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Calendar className="h-4 w-4 text-[var(--primary-accent)]" />
              <strong>{meetingsTodayCount}</strong> {meetingsTodayCount === 1 ? "meeting" : "meetings"} today
            </span>
          )}
        </div>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Manage projects and keep clients in the loop.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tooltip content="Active projects">
          <Card className="rounded-2xl border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.03] hover:border-zinc-300 dark:hover:border-white/[0.1] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Active Projects
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
        <Tooltip content="Total project count">
          <Card className="rounded-2xl border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.03] hover:border-zinc-300 dark:hover:border-white/[0.1] transition-colors sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Total projects
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
            <CardTitle className="text-zinc-900 dark:text-zinc-50">Projects</CardTitle>
            <CardDescription>Status, progress, and next meeting.</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-[12px] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-white/[0.04] p-8 mb-4">
                  <Inbox className="h-14 w-14 text-zinc-400 dark:text-zinc-500 mx-auto" />
                </div>
                <p className="text-zinc-900 dark:text-zinc-100 font-semibold">No projects yet</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                  Create your first project to get started. Add a client email and deadline.
                </p>
                <a
                  href="#create-project"
                  className="mt-6 inline-flex items-center gap-2 rounded-[12px] px-4 py-2.5 text-sm font-medium text-white transition-colors bg-[var(--primary-accent)] hover:opacity-90"
                >
                  <FolderOpen className="h-4 w-4" />
                  Create your first project
                </a>
              </div>
            ) : (
              <ul className="space-y-2">
                {projects.map((project) => {
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
                <p className="text-sm text-zinc-500">No files uploaded yet.</p>
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
                      Download
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
