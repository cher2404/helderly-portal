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
  dotColor,
  icon: Icon,
}: {
  href: string;
  label: string;
  value: string | number;
  sub?: string;
  dotColor: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[12px] border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--primary-accent)]/25 hover:shadow-md"
    >
      <div className={`mb-3 flex h-7 w-7 items-center justify-center rounded-[7px] ${dotColor}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{value}</p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      {sub && (
        <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-600 truncate">{sub}</p>
      )}
      <span className="absolute right-3 top-3 text-xs text-zinc-300 dark:text-zinc-700 transition-all group-hover:text-[var(--primary-accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        ↗
      </span>
    </Link>
  );
}

function SecLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-[8px] border border-zinc-200 dark:border-white/[0.06] bg-transparent px-3 py-1.5 text-xs font-medium text-zinc-500 transition-all hover:-translate-y-px hover:border-[var(--primary-accent)]/30 hover:text-[var(--primary-accent)]"
    >
      <Icon className="h-3 w-3 shrink-0" />
      {label}
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
      <div className="relative overflow-hidden rounded-[14px] border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-5">
        {/* Animerende top-lijn */}
        <div
          className="absolute inset-x-0 top-0 h-[2px] rounded-t-[14px]"
          style={{
            background: "linear-gradient(90deg,#6366f1,#8b5cf6,#a78bfa,#6366f1)",
            backgroundSize: "300%",
            animation: "gradientSlide 4s linear infinite",
          }}
        />

        <div className="flex items-baseline justify-between mb-4">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Voortgang</span>
          <span
            className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            style={{
              animation: "kpiNumPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both",
            }}
          >
            {pct}%
          </span>
        </div>

        {/* Balk */}
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
              width: "0%",
              animation: `barFillTo${pct} 1.6s cubic-bezier(0.25,0.46,0.45,0.94) 0.3s forwards`,
            }}
          />
        </div>

        {/* Milestone stipjes */}
        {stages.length > 0 && (
          <div className="mb-3 flex gap-1">
            {stages.map((s, i) => (
              <div
                key={s.id}
                className="h-1 flex-1 rounded-full"
                style={{
                  background: s.is_completed
                    ? "var(--primary-accent)"
                    : i === completedStages
                      ? "#818cf8"
                      : "#e4e4e7",
                  animation: i === completedStages ? "stagePulse 2s ease-in-out infinite 1s" : "none",
                }}
              />
            ))}
          </div>
        )}

        <div className="flex justify-between text-xs">
          {nextStage ? (
            <span className="font-medium text-[var(--primary-accent)]">↳ {nextStage.title}</span>
          ) : (
            <span className="font-medium text-emerald-500">✓ Alle mijlpalen voltooid</span>
          )}
          <span className="text-zinc-400 dark:text-zinc-600">
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
          dotColor="bg-[var(--primary-accent)]/15 text-[var(--primary-accent)]"
          icon={CheckCircle2}
        />
        <KpiCard
          href={`${ROUTES.documents}?project=${projectId}`}
          label="Documenten"
          value={assets.length}
          sub={assets.length > 0 ? assets[0]?.file_name : "Geen bestanden"}
          dotColor="bg-emerald-500/10 text-emerald-500"
          icon={FileText}
        />
        <KpiCard
          href={projectHref("decisions")}
          label="Beslissingen"
          value={decisions.length}
          sub={`${decisions.filter((d) => d.confirmed_by_client).length} bevestigd`}
          dotColor="bg-amber-500/10 text-amber-500"
          icon={Gavel}
        />
      </div>

      {/* ── Secundaire links (alleen freelancer) ── */}
      {isFreelancer && (
        <div className="flex flex-wrap gap-2">
          <SecLink href={projectHref("meetings")} label={`Afspraken · ${appointments.length}`} icon={Calendar} />
          <SecLink href={projectHref("budget")} label={`Budget · €${spentEur} / €${estimatedEur}`} icon={TrendingUp} />
          <SecLink href={projectHref("faq")} label={`FAQ · ${faqs.length}`} icon={HelpCircle} />
          <SecLink href={projectHref("contact")} label={`Contact · ${contactLogs.length}`} icon={Phone} />
          <SecLink href={projectHref("scratchpad")} label="Notities" icon={MessageCircle} />
        </div>
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes gradientSlide {
          0% { background-position: 0%; }
          100% { background-position: 300%; }
        }
        @keyframes stagePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes barFillTo${pct} {
          from { width: 0%; }
          to { width: ${pct}%; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

