"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderOpen, FileText, Inbox } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES, projectSegment } from "@/lib/constants";
import type { Project, Asset, Profile } from "@/lib/database.types";

type Props = {
  initialProjects: Project[];
  initialRecentAssets: Asset[];
  profile: Profile;
};

export function CustomerDashboard({
  initialProjects,
  initialRecentAssets,
  profile,
}: Props) {
  const [projects] = useState(initialProjects);
  const [recentAssets] = useState(initialRecentAssets);
  const firstName = profile?.full_name?.split(/\s+/)[0];
  const totalFiles = recentAssets.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {firstName ? `Welkom, ${firstName}` : "Mijn project"}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Bekijk de timeline, download bestanden en geef feedback.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-[12px] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-white/[0.04] p-8 mb-4">
            <Inbox className="h-16 w-16 text-zinc-400 dark:text-zinc-500" />
          </div>
          <p className="text-zinc-700 dark:text-zinc-400 font-medium text-lg">Nog geen project</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm">
            Je freelancer nodigt je uit voor een project. Je ziet het hier zodra je bent toegevoegd.
          </p>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-[12px] border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] backdrop-blur-xl hover:border-zinc-300 dark:hover:border-white/[0.1] transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Projecten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{projects.length}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {projects.length === 1 ? "project" : "projecten"}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-[12px] border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] backdrop-blur-xl hover:border-zinc-300 dark:hover:border-white/[0.1] transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Bestanden
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{totalFiles}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">beschikbaar om te downloaden</p>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="rounded-[12px] border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-zinc-900 dark:text-zinc-50">Projecten</CardTitle>
                <CardDescription>Open een project om bestanden te bekijken en feedback te geven.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {projects.map((project) => (
                    <li key={project.id}>
                      <Link
                        href={ROUTES.project(projectSegment(project))}
                        className="flex items-center justify-between gap-4 rounded-[12px] border border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02] p-4 hover:border-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.05] dark:hover:border-white/[0.1] transition-all group"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-900 dark:text-zinc-50 group-hover:text-[var(--primary-accent)] truncate">
                            {project.name}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {project.progress_percentage}% · {project.status}
                          </p>
                        </div>
                        <FolderOpen className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-[var(--primary-accent)]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
