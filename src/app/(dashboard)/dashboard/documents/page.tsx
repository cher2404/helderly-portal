import { getProjects, getProfile } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { DocumentsClient } from "@/components/dashboard/documents-client";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const projects = await getProjects();
  const params = await searchParams;
  const initialProjectId = params.project ?? projects[0]?.id ?? null;

  return (
    <DocumentsClient
      initialProjects={projects}
      profile={profile}
      initialProjectId={initialProjectId}
    />
  );
}
