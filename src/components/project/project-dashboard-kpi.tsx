"use client";

import Link from "next/link";
import {
  Calendar,
  FileText,
  MessageCircle,
  Gavel,
  Phone,
  TrendingUp,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import type { Project, ProjectStage, Appointment, ContactLog, Asset, Decision, ProjectFaq } from "@/lib/database.types";
import { cn } from "@/lib/utils";

const HOURLY_RATE = 80;

type Props = {
  projectId: string;
  project: Project;
  stages: ProjectStage[];
  appointments: Appointment[];
  contactLogs: ContactLog[];
  assets: Asset[];
  decisions: Decision[];
  faqs: ProjectFaq[];
  isFreelancer: boolean;
};

function KpiCard({
  href,
  label,
  value,
  sub,
  icon: Icon,
  className,
}: {
  href: string;
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 p-4 transition-colors hover:border-[var(--primary-accent)]/30 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-start justify-between gap-3",
        className
      )}
    >
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">{value}</p>
        {sub != null && sub !== "" && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{sub}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0 text-zinc-400">
        <Icon className="h-4 w-4" />
        <ChevronRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

export function ProjectDashboardKpi({
  projectId,
  project,
  stages,
  appointments,
  contactLogs,
  assets,
  decisions,
  faqs,
  isFreelancer,
}: Props) {
  const completedStages = stages.filter((s) => s.is_completed).length;
  const nextMeeting = appointments
    .filter((a) => a.status === "upcoming" && a.appointment_date)
    .sort((a, b) => (a.appointment_date ?? "").localeCompare(b.appointment_date ?? ""))[0];
  const lastContact = contactLogs.length > 0 ? contactLogs[0] : null;
  const estimated = project.estimated_hours ?? 0;
  const actual = project.actual_hours ?? 0;
  const estimatedEur = estimated * HOURLY_RATE;
  const spentEur = actual * HOURLY_RATE;

  const projectHref = (tab: string) => `${ROUTES.project(projectId)}?tab=${tab}`;

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Overzicht en KPI’s. Beheer en invullingen staan in de tabbladen.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          href={projectHref("milestones")}
          label="Milestones"
          value={`${completedStages} / ${stages.length}`}
          sub={stages.length > 0 ? stages.find((s) => !s.is_completed)?.title ?? "Alle voltooid" : "Geen"}
          icon={CheckCircle2}
        />
        <KpiCard
          href={ROUTES.documents + `?project=${projectId}`}
          label="Documenten"
          value={assets.length}
          sub={assets.length > 0 ? assets[assets.length - 1]?.file_name : "Geen bestanden"}
          icon={FileText}
        />
        <KpiCard
          href={projectHref("decisions")}
          label="Beslissingen"
          value={decisions.length}
          sub={decisions.filter((d) => d.confirmed_by_client).length + " bevestigd door klant"}
          icon={Gavel}
        />
        <KpiCard
          href={projectHref("meetings")}
          label="Afspraken"
          value={appointments.length}
          sub={nextMeeting ? `Volgende: ${nextMeeting.appointment_date} – ${nextMeeting.title}` : "Geen gepland"}
          icon={Calendar}
        />
        <KpiCard
          href={projectHref("budget")}
          label="Budget"
          value={`€${spentEur} / €${estimatedEur}`}
          sub={`${actual}h / ${estimated}h geschat`}
          icon={TrendingUp}
        />
        <KpiCard
          href={projectHref("faq")}
          label="FAQ"
          value={faqs.length}
          sub={faqs.length === 0 ? "Nog geen vragen" : "Vraag en antwoord"}
          icon={HelpCircle}
        />
        <KpiCard
          href={projectHref("contact")}
          label="Contact"
          value={contactLogs.length}
          sub={lastContact ? `${lastContact.log_date} – ${lastContact.channel}` : "Nog geen contact gelogd"}
          icon={Phone}
        />
        {isFreelancer && (
          <KpiCard
            href={projectHref("scratchpad")}
            label="Notities"
            value="—"
            sub="Privé notities en ideeën"
            icon={MessageCircle}
          />
        )}
      </div>
    </div>
  );
}
