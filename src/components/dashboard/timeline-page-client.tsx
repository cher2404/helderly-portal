"use client";

import { useRouter } from "next/navigation";
import { TimelineStepper } from "./timeline-stepper";
import { Card, CardContent } from "@/components/ui/card";
import { Inbox } from "lucide-react";
import type { Project, ProjectStage, Profile } from "@/lib/database.types";

type Props = {
  projects: Project[];
  selectedProject: Project | null;
  initialStages: ProjectStage[];
  profile: Profile;
};

export function TimelinePageClient({
  projects,
  selectedProject,
  initialStages,
  profile,
}: Props) {
  const router = useRouter();
  const isFreelancer = profile.role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
          Timeline
        </h1>
        <p className="text-zinc-400 mt-1">
          {isFreelancer ? "Track and complete stages per project." : "View progress for your project."}
        </p>
      </div>

      {isFreelancer && projects.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <label className="text-sm text-zinc-400 self-center">Project:</label>
          <select
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-100"
            value={selectedProject?.id ?? ""}
            onChange={(e) => router.push(`/dashboard/timeline?project=${e.target.value}`)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {!selectedProject ? (
        <Card className="rounded-2xl border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="h-14 w-14 text-zinc-500 mb-4" />
            <p className="text-zinc-400 font-medium">No project selected</p>
            <p className="text-sm text-zinc-500 mt-1">
              {isFreelancer ? "Create a project from the Dashboard first." : "You don’t have a project yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <TimelineStepper
          project={selectedProject}
          initialStages={initialStages}
          profile={profile}
        />
      )}
    </div>
  );
}
