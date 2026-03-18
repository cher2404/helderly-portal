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
  CheckCircle2,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import type { CSSProperties } from "react";
import type {
  Project,
  ProjectStage,
  Appointment,
  ContactLog,
  Asset,
  Decision,
  ProjectFaq,
} from "@/lib/database.types";

const HOURLY_RATE = 80;

type Props = {
  projectSegment: string;
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
  colorClass,
  iconClass,
  icon: Icon,
}: {
  href: string;
  label: string;
  value: string | number;
  sub?: string;
  colorClass: string;
  iconClass: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="animate-kpi-card group relative overflow-hidden rounded-[12px] border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--primary-accent)]/25 dark:border-white/[0.06] dark:bg-white/[0.03]"
    >
      <div className={`mb-3 flex h-7 w-7 items-center justify-center rounded-[7px] ${colorClass}`}>
        <Icon className={`h-3.5 w-3.5 ${iconClass}`} />
      </div>
      <p className="animate-kpi-num text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{value}</p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{label}</p>
      {sub && <p className="mt-1 text-[10px] text-zinc-600 dark:text-zinc-600 truncate">{sub}</p>}
      <span className="absolute right-3 top-3 text-[11px] text-zinc-700 transition-all group-hover:text-[var(--primary-accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        ↗
      </span>
    </Link>
  );
}

function SecLink({
  href,
  label,
  value,
  icon: Icon,
}: {
  href: string;
  label: string;
  value?: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-[8px] border border-zinc-800 bg-transparent px-3 py-1.5 text-xs font-medium text-zinc-500 transition-all hover:-translate-y-px hover:border-[var(--primary-accent)]/30 hover:text-[var(--primary-accent)] dark:border-white/[0.06]"
    >
      <Icon className="h-3 w-3 shrink-0" />
      {label}
      {value !== undefined ? ` · ${value}` : ""}
    </Link>
  );
}

export function ProjectDashboardKpi({
  projectSegment,
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
  const nextStage = stages.find((s) => !s.is_completed);
  const estimated = project.estimated_hours ?? 0;
  const actual = project.actual_hours ?? 0;
  const estimatedEur = estimated * HOURLY_RATE;
  const spentEur = actual * HOURLY_RATE;
  const pct = project.progress_percentage ?? 0;

  const projectHref = (tab: string) => `${ROUTES.project(projectSegment)}?tab=${tab}`;

  return (
    <div className="space-y-5">
      {/* ── Voortgangsbalk hero ── */}
      <div className="relative overflow-hidden rounded-[14px] border border-zinc-800 bg-zinc-900/50 p-5 dark:border-white/[0.06] dark:bg-white/[0.03]">
        {/* Animerende top-lijn */}
        <div
          className="absolute inset-x-0 top-0 h-[2px] rounded-t-[14px]"
          style={{
            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa, #6366f1)",
            backgroundSize: "300%",
            animation: "gradient-slide 4s linear infinite",
          }}
        />

        <div className="flex items-baseline justify-between mb-4">
          <span className="text-xs font-medium text-zinc-500">Voortgang</span>
          <span
            className="animate-kpi-num text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            style={{ animationDelay: "0.2s" }}
          >
            {pct}%
          </span>
        </div>

        {/* Balk */}
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              width: "0%",
              animation: `bar-fill-anim 1.6s cubic-bezier(0.25,0.46,0.45,0.94) 0.3s forwards`,
              ["--target-width"]: `${pct}%`,
            } as CSSProperties & Record<string, string>}
          />
        </div>

        {/* Milestone stipjes */}
        {stages.length > 0 && (
          <div className="mb-3 flex gap-1">
            {stages.map((s, i) => (
              <div
                key={s.id}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s.is_completed
                    ? "bg-[var(--primary-accent)]"
                    : i === completedStages
                      ? "animate-[stagePulse_2s_ease-in-out_infinite] bg-[#818cf8]"
                      : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
        )}

        <div className="flex justify-between text-xs">
          {nextStage ? (
            <span className="font-medium text-[var(--primary-accent)]">↳ {nextStage.title}</span>
          ) : (
            <span className="text-emerald-400 font-medium">✓ Alle mijlpalen voltooid</span>
          )}
          <span className="text-zinc-600">
            {completedStages} / {stages.length} mijlpalen
          </span>
        </div>
      </div>

      {/* ── Primaire KPI's ── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          href={projectHref("milestones")}
          label="Mijlpalen"
          value={`${completedStages} / ${stages.length}`}
          sub={nextStage?.title ?? "Alle voltooid"}
          colorClass="bg-[var(--primary-accent)]/15"
          iconClass="text-[var(--primary-accent)]"
          icon={CheckCircle2}
        />
        <KpiCard
          href={`${ROUTES.documents}?project=${projectId}`}
          label="Documenten"
          value={assets.length}
          sub={assets.length > 0 ? assets[0]?.file_name : "Geen bestanden"}
          colorClass="bg-emerald-500/12"
          iconClass="text-emerald-400"
          icon={FileText}
        />
        <KpiCard
          href={projectHref("decisions")}
          label="Beslissingen"
          value={decisions.length}
          sub={`${decisions.filter((d) => d.confirmed_by_client).length} bevestigd`}
          colorClass="bg-amber-500/10"
          iconClass="text-amber-400"
          icon={Gavel}
        />
      </div>

      {/* ── Secundaire links (alleen freelancer) ── */}
      {isFreelancer && (
        <div className="flex flex-wrap gap-2">
          <SecLink href={projectHref("meetings")} label="Afspraken" value={appointments.length} icon={Calendar} />
          <SecLink
            href={projectHref("budget")}
            label={`Budget · €${spentEur} / €${estimatedEur}`}
            icon={TrendingUp}
          />
          <SecLink href={projectHref("faq")} label="FAQ" value={faqs.length} icon={HelpCircle} />
          <SecLink href={projectHref("contact")} label="Contact" value={contactLogs.length} icon={Phone} />
          <SecLink href={projectHref("scratchpad")} label="Notities" icon={MessageCircle} />
        </div>
      )}
    </div>
  );
}
