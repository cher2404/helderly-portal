"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project, Asset, Profile } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

type Props = {
  initialProjects: Project[];
  initialRecentAssets: Asset[];
  profile: Profile | null;
};

export function DashboardClient({
  initialProjects,
  initialRecentAssets,
  profile,
}: Props) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [recentAssets] = useState<Asset[]>(initialRecentAssets);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("projects-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => {
          supabase
            .from("projects")
            .select("*")
            .order("updated_at", { ascending: false })
            .then(({ data }) => {
              if (data) setProjects(data as Project[]);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isAdmin = profile?.role === "admin";
  const primaryProject = projects[0];
  const nextAction = primaryProject
    ? primaryProject.status === "completed"
      ? "Project completed"
      : `Continue: ${primaryProject.name} (${primaryProject.progress_percentage}%)`
    : isAdmin
      ? "Create a project and add a client"
      : "No active projects yet";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Dashboard</h1>
        <p className="text-zinc-400 mt-1">
          {isAdmin
            ? "Manage projects and keep clients in the loop."
            : "Overview of your projects and recent files."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {primaryProject ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">{primaryProject.name}</span>
                  <span className="text-zinc-300">
                    {primaryProject.progress_percentage}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-zinc-100 transition-all duration-500"
                    style={{
                      width: `${primaryProject.progress_percentage}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-zinc-500 capitalize">
                  Status: {primaryProject.status}
                </p>
              </>
            ) : (
              <p className="text-sm text-zinc-400">
                No projects yet. {isAdmin && "Create one from the timeline."}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Action</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-300">{nextAction}</p>
            {primaryProject && (
              <Link href={ROUTES.timeline} className="inline-block mt-3">
                <Button variant="outline" size="sm">
                  View timeline
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardContent className="pt-0">
            {recentAssets.length === 0 ? (
              <p className="text-sm text-zinc-400">No files yet.</p>
            ) : (
              <ul className="space-y-2">
                {recentAssets.map((asset) => (
                  <li
                    key={asset.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2"
                  >
                    <span className="flex items-center gap-2 text-sm text-zinc-300 truncate">
                      <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
                      {asset.file_name}
                    </span>
                    <a
                      href={asset.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-zinc-50"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
}
