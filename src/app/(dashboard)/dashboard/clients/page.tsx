import { getProfile, getProjects } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { ClientsClient } from "@/components/dashboard/clients-client";

export default async function ClientsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard");

  const projects = await getProjects();
  const clients = projects
    .filter((p) => p.client_email || p.client_id)
    .map((p) => ({
      id: p.client_id ?? p.id,
      email: p.client_email ?? "—",
      projectName: p.name,
      projectId: p.id,
      projectSlug: p.slug ?? null,
    }));

  return <ClientsClient clients={clients} />;
}
