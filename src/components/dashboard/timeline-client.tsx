"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project, Profile } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProject, updateProjectProgress } from "@/app/actions/projects";
import type { ProjectStatus } from "@/lib/database.types";

type Props = {
  initialProjects: Project[];
  profile: Profile | null;
};

const STATUS_OPTIONS: ProjectStatus[] = ["active", "on_hold", "completed", "draft"];

export function TimelineClient({ initialProjects, profile }: Props) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    const channel = supabase
      .channel("timeline-realtime")
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
  }, [supabase]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Project Timeline</h1>
        <p className="text-zinc-400 mt-1">
          {isAdmin
            ? "Create projects and update progress. Clients see updates in real time."
            : "Steps to completion for your projects."}
        </p>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create project</CardTitle>
            <p className="text-sm text-zinc-400">
              Client ID is the Supabase Auth user UUID of the client (from Authentication → Users).
            </p>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData) => {
                setCreateError(null);
                const result = await createProject(formData);
                if (result.error) setCreateError(result.error);
              }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Project name</Label>
                <Input id="name" name="name" placeholder="Website redesign" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_id">Client user ID (UUID)</Label>
                <Input
                  id="client_id"
                  name="client_id"
                  placeholder="uuid-from-supabase-auth"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="progress">Progress %</Label>
                <Input
                  id="progress"
                  name="progress"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={0}
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <Button type="submit">Create project</Button>
              </div>
            </form>
            {createError && (
              <p className="mt-2 text-sm text-red-400">{createError}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-sm text-zinc-400">No projects yet.</p>
          ) : (
            <ul className="space-y-4">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-zinc-800 p-4"
                >
                  <div>
                    <p className="font-medium text-zinc-50">{project.name}</p>
                    <p className="text-sm text-zinc-500 capitalize">{project.status}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-400">Progress</span>
                      <span className="text-zinc-50">{project.progress_percentage}%</span>
                    </div>
                    {isAdmin && (
                      <ProgressForm
                        projectId={project.id}
                        currentProgress={project.progress_percentage}
                        currentStatus={project.status}
                        onError={(err) => setUpdateError(err)}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {updateError && (
            <p className="mt-2 text-sm text-red-400">{updateError}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProgressForm({
  projectId,
  currentProgress,
  currentStatus,
  onError,
}: {
  projectId: string;
  currentProgress: number;
  currentStatus: ProjectStatus;
  onError: (s: string | null) => void;
}) {
  const [progress, setProgress] = useState(currentProgress);
  const [status, setStatus] = useState(currentStatus);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        onError(null);
        setPending(true);
        const result = await updateProjectProgress(projectId, progress, status);
        setPending(false);
        if (result.error) onError(result.error);
      }}
    >
      <input
        type="number"
        min={0}
        max={100}
        value={progress}
        onChange={(e) => setProgress(Number(e.target.value))}
        className="w-16 rounded border border-zinc-700 bg-zinc-900/50 px-2 py-1 text-sm text-zinc-100"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as ProjectStatus)}
        className="rounded border border-zinc-700 bg-zinc-900/50 px-2 py-1 text-sm text-zinc-100"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <Button type="submit" size="sm" disabled={pending}>
        Update
      </Button>
    </form>
  );
}

