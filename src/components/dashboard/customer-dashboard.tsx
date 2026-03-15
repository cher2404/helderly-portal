"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderOpen, FileText, Calendar, Inbox } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import type { Project, Asset, Profile } from "@/lib/database.types";

type Props = {
  initialProjects: Project[];
  initialRecentAssets: Asset[];
  profile: Profile;
};

export function CustomerDashboard({
  initialProjects,
  initialRecentAssets,
}: Props) {
  const [projects] = useState(initialProjects);
  const [recentAssets] = useState(initialRecentAssets);
  const project = projects[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
          My project
        </h1>
        <p className="text-zinc-400 mt-1">
          View timeline, download files, and leave feedback.
        </p>
      </div>

      {!project ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-2xl bg-white/[0.04] p-8 mb-4">
            <Inbox className="h-16 w-16 text-zinc-500" />
          </div>
          <p className="text-zinc-400 font-medium text-lg">No project yet</p>
          <p className="text-sm text-zinc-500 mt-2 max-w-sm">
            Your freelancer will invite you to a project. You’ll see it here once they add you.
          </p>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-2xl border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/[0.1] transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-zinc-50">{project.name}</p>
                <p className="text-sm text-zinc-500 capitalize mt-0.5">{project.status} · {project.progress_percentage}%</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/[0.1] transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-zinc-50">{recentAssets.length}</p>
                <p className="text-sm text-zinc-500 mt-0.5">available to download</p>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="rounded-2xl border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Quick links</CardTitle>
                <CardDescription>Jump to timeline, files, or feedback.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Link
                  href={ROUTES.project(project.id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/[0.08] hover:border-white/[0.12] transition-colors"
                >
                  <FolderOpen className="h-4 w-4" />
                  Project overview
                </Link>
                <Link
                  href={ROUTES.timeline}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/[0.08] hover:border-white/[0.12] transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  Timeline
                </Link>
                <Link
                  href={ROUTES.documents}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/[0.08] hover:border-white/[0.12] transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Files
                </Link>
                <Link
                  href={ROUTES.messages}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/[0.08] hover:border-white/[0.12] transition-colors"
                >
                  Feedback
                </Link>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
