import { getProjects, getProfile, getProjectMessages } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { FeedbackThreadClient } from "@/components/dashboard/feedback-thread-client";

export default async function MessagesPage({
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
  const messages = project ? await getProjectMessages(project.id) : [];

  return (
    <FeedbackThreadClient
      projects={projects}
      selectedProject={project}
      initialMessages={messages}
      profile={profile}
    />
  );
}
