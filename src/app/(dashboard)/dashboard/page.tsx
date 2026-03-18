import {
  getProjects,
  getProfile,
  getRecentAssets,
  getUpcomingAppointmentsForProjects,
  getPendingAssetsCount,
  getMeetingsTodayCount,
  getTemplates,
  getProjectStages,
  getDecisions,
} from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

const FreelancerDashboard = dynamic(
  () => import("@/components/dashboard/freelancer-dashboard").then((m) => ({ default: m.FreelancerDashboard })),
  { loading: () => <DashboardSkeleton /> }
);
const CustomerDashboard = dynamic(
  () => import("@/components/dashboard/customer-dashboard").then((m) => ({ default: m.CustomerDashboard })),
  { loading: () => <DashboardSkeleton /> }
);

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const projects = await getProjects();
  const projectIds = projects.map((p) => p.id);
  const isFreelancer = profile.role === "admin";

  const [recentAssets, upcomingAppointments, pendingAssetsCount, meetingsTodayCount, templates] = await Promise.all([
    getRecentAssets(10),
    isFreelancer && projectIds.length > 0 ? getUpcomingAppointmentsForProjects(projectIds) : Promise.resolve([]),
    isFreelancer && projectIds.length > 0 ? getPendingAssetsCount(projectIds) : Promise.resolve(0),
    isFreelancer && projectIds.length > 0 ? getMeetingsTodayCount(projectIds) : Promise.resolve(0),
    isFreelancer ? getTemplates() : Promise.resolve([]),
  ]);

  const firstProjectId = projectIds[0];
  const [decisions, stages] = await Promise.all([
    !isFreelancer && firstProjectId ? getDecisions(firstProjectId) : Promise.resolve([]),
    !isFreelancer && firstProjectId ? getProjectStages(firstProjectId) : Promise.resolve([]),
  ]);

  return isFreelancer ? (
    <FreelancerDashboard
      initialProjects={projects}
      initialRecentAssets={recentAssets}
      initialUpcomingAppointments={upcomingAppointments}
      pendingAssetsCount={pendingAssetsCount}
      meetingsTodayCount={meetingsTodayCount}
      initialTemplates={templates}
      profile={profile}
    />
  ) : (
    <CustomerDashboard
      initialProjects={projects}
      initialRecentAssets={recentAssets}
      profile={profile}
      initialDecisions={decisions}
      initialStages={stages}
    />
  );
}
