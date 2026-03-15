import {
  getProject,
  getProfile,
  getProjectStages,
  getAppointments,
  getContactLogs,
  getAssets,
  getDecisions,
  getProjectFaqs,
  getInternalNotes,
} from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Calendar,
  FileText,
  MessageCircle,
  Gavel,
  Phone,
  DollarSign,
  HelpCircle,
  StickyNote,
} from "lucide-react";

const ProjectDetailView = dynamic(
  () => import("@/components/project/project-detail-view").then((m) => ({ default: m.ProjectDetailView })),
  { loading: () => <ProjectPageSkeleton /> }
);

const SKELETON_ICONS = [
  Calendar,
  MessageCircle,
  FileText,
  Gavel,
  Phone,
  DollarSign,
  HelpCircle,
  StickyNote,
];

function ProjectPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-zinc-200 dark:bg-zinc-500/10 animate-pulse" />
          <div className="space-y-1">
            <div className="h-5 w-48 rounded bg-slate-500/20 animate-pulse" />
            <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-500/10 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SKELETON_ICONS.slice(0, 6).map((Icon, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-[12px] border border-slate-500/20 bg-slate-900/30 backdrop-blur-xl animate-pulse"
          >
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-600 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-500/20 text-zinc-500 dark:text-zinc-400">
                <Icon className="h-4 w-4" />
              </div>
              <div className="h-4 flex-1 max-w-[120px] rounded bg-slate-500/20" />
            </div>
            <div className="p-4 space-y-3">
              <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-500/10" />
              <div className="h-3 w-4/5 rounded bg-zinc-200 dark:bg-zinc-500/10" />
              <div className="h-3 w-2/3 rounded bg-zinc-200 dark:bg-zinc-500/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const { id } = await params;
  const [
    project,
    stages,
    appointments,
    contactLogs,
    assets,
    decisions,
    faqs,
    internalNotes,
  ] = await Promise.all([
    getProject(id),
    getProjectStages(id),
    getAppointments(id),
    getContactLogs(id),
    getAssets(id),
    getDecisions(id),
    getProjectFaqs(id),
    profile.role === "admin" ? getInternalNotes(id) : Promise.resolve(null),
  ]);

  if (!project) redirect("/dashboard");

  return (
    <ProjectDetailView
      project={project}
      initialStages={stages}
      initialAppointments={appointments}
      initialContactLogs={contactLogs}
      initialAssets={assets}
      initialDecisions={decisions}
      initialFaqs={faqs}
      initialInternalNotes={internalNotes}
      profile={profile}
    />
  );
}
