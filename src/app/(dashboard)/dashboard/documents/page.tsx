import { getProjects, getProfile } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { DocumentsClient } from "@/components/dashboard/documents-client";

export default async function DocumentsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const projects = await getProjects();

  return (
    <DocumentsClient initialProjects={projects} profile={profile} />
  );
}
