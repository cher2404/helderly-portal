"use client";

import { useRouter } from "next/navigation";
import { TimelineStepper } from "./timeline-stepper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
          <label className="text-sm text-zinc-500 dark:text-zinc-400 self-center">Project:</label>
          <select
            className="rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800/50 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
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
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/30 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="h-14 w-14 text-zinc-500 dark:text-zinc-600 mb-4" />
            <p className="text-zinc-700 dark:text-zinc-400 font-medium">Geen project geselecteerd</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1 max-w-sm">
              {isFreelancer ? "Maak een project aan via het dashboard. Daarna kun je mijlpalen en voortgang bijhouden." : "You don’t have a project yet."}
            </p>
            {isFreelancer && (
              <Link href="/dashboard" className="mt-4">
                <Button size="sm" variant="outline" className="rounded-xl border-zinc-600 text-zinc-300 hover:bg-zinc-800">
                  Naar Dashboard
                </Button>
              </Link>
            )}
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
