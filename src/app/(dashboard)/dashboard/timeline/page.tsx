import { getProjects, getProfile, getProjectStages } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { TimelinePageClient } from "@/components/dashboard/timeline-page-client";

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const projects = await getProjects();
  const params = await searchParams;
  const projectId = params.project ?? projects[0]?.id;
  const project = projectId ? projects.find((p) => p.id === projectId) ?? projects[0] : null;
  const stages = project ? await getProjectStages(project.id) : [];

  return (
    <TimelinePageClient
      projects={projects}
      selectedProject={project}
      initialStages={stages}
      profile={profile}
    />
  );
}
