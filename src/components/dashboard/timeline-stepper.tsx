"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, Circle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toggleStageComplete } from "@/app/actions/projects";
import type { Project, ProjectStage, Profile } from "@/lib/database.types";

type Props = {
  project: Project;
  initialStages: ProjectStage[];
  profile: Profile;
};

export function TimelineStepper({ project, initialStages, profile }: Props) {
  const [stages, setStages] = useState(initialStages);
  const supabase = useMemo(() => createClient(), []);
  const isFreelancer = profile.role === "admin";

  useEffect(() => {
    const channel = supabase
      .channel(`stages-${project.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_stages", filter: `project_id=eq.${project.id}` },
        () => {
          supabase
            .from("project_stages")
            .select("*")
            .eq("project_id", project.id)
            .order("sort_order", { ascending: true })
            .then(({ data }) => data && setStages(data as ProjectStage[]));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [project.id, supabase]);

  async function handleToggle(stage: ProjectStage) {
    if (!isFreelancer) return;
    const next = !stage.is_completed;
    await toggleStageComplete(project.id, stage.id, next);
    setStages((prev) =>
      prev.map((s) => (s.id === stage.id ? { ...s, is_completed: next, completed_at: next ? new Date().toISOString() : null } : s))
    );
  }

  return (
    <Card className="rounded-2xl border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>
          {isFreelancer ? "Check off stages as you complete them. Customers see updates in real time." : "Progress and milestones for this project."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="flex flex-col gap-0">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleToggle(stage)}
                    disabled={!isFreelancer}
                    className={`
                      flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-all
                      ${stage.is_completed
                        ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-400"
                        : "border-white/20 bg-white/[0.04] text-zinc-500 hover:border-white/30"
                      }
                      ${isFreelancer ? "cursor-pointer" : "cursor-default"}
                    `}
                  >
                    {stage.is_completed ? <Check className="h-5 w-5" /> : <Circle className="h-4 w-4" />}
                  </button>
                  {index < stages.length - 1 && (
                    <div className="w-0.5 flex-1 min-h-[24px] bg-white/10 my-1" />
                  )}
                </div>
                <div className="pb-6">
                  <p className={`font-medium ${stage.is_completed ? "text-zinc-400 line-through" : "text-zinc-50"}`}>
                    {stage.title}
                  </p>
                  {stage.completed_at && (
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Done {new Date(stage.completed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
