"use client";
import Link from "next/link";
import { FolderOpen, FileText, Inbox, Calendar, MessageSquare, Gavel, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import type { Project, Asset, Profile, Decision, ProjectStage } from "@/lib/database.types";

type Props = {
  initialProjects: Project[];
  initialRecentAssets: Asset[];
  profile: Profile;
  initialDecisions?: Decision[];
  initialStages?: ProjectStage[];
};

export function CustomerDashboard({
  initialProjects,
  initialRecentAssets,
  profile,
  initialDecisions = [],
  initialStages = [],
}: Props) {
  const project = initialProjects[0];
  const firstName = profile?.full_name?.split(/\s+/)[0];

  const pendingAssets = initialRecentAssets.filter((a) => a.status === "pending");
  const unconfirmedDecisions = initialDecisions.filter((d) => !d.confirmed_by_client);
  const nextStage = initialStages.find((s) => !s.is_completed);
  const hasActions = pendingAssets.length > 0 || unconfirmedDecisions.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {firstName ? `Welkom, ${firstName}` : "Mijn project"}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Hier vind je altijd de laatste stand van zaken.
        </p>
      </div>

      {!project ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-[12px] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-white/[0.04] p-8 mb-4">
            <Inbox className="h-16 w-16 text-zinc-400 dark:text-zinc-500" />
          </div>
          <p className="text-zinc-700 dark:text-zinc-400 font-medium text-lg">Nog geen project</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm">
            Je freelancer nodigt je uit voor een project. Je ziet het hier zodra je bent toegevoegd.
          </p>
        </div>
      ) : (
        <>
          {/* Projectstatus */}
          <section>
            <Card className="rounded-[12px] border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03]">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Huidig project</p>
                <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{project.name}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--primary-accent)] transition-all"
                      style={{ width: `${project.progress_percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 w-8 text-right shrink-0">
                    {project.progress_percentage}%
                  </span>
                </div>
                {nextStage && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                    Huidige stap: <span className="text-zinc-700 dark:text-zinc-300">{nextStage.title}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Openstaande acties */}
          <section>
            {hasActions ? (
              <Card className="rounded-[12px] border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-200">Jouw aandacht gevraagd</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingAssets.length > 0 && (
                    <Link
                      href={ROUTES.documents}
                      className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 hover:underline"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      {pendingAssets.length}{" "}
                      {pendingAssets.length === 1 ? "bestand wacht" : "bestanden wachten"} op jouw goedkeuring
                    </Link>
                  )}
                  {unconfirmedDecisions.length > 0 && (
                    <Link
                      href={ROUTES.project(project.id)}
                      className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 hover:underline"
                    >
                      <Gavel className="h-4 w-4 shrink-0" />
                      {unconfirmedDecisions.length}{" "}
                      {unconfirmedDecisions.length === 1 ? "beslissing wacht" : "beslissingen wachten"} op jouw akkoord
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center gap-3 rounded-[12px] border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-sm text-emerald-700 dark:text-emerald-300">Alles up to date — geen acties nodig.</p>
              </div>
            )}
          </section>

          {/* Snelle links naar project */}
          <section>
            <div className="flex flex-wrap gap-3">
              <Link
                href={ROUTES.project(project.id)}
                className="inline-flex items-center gap-2 rounded-[12px] border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition-colors"
              >
                <FolderOpen className="h-4 w-4" />
                Projectoverzicht
              </Link>
              <Link
                href={ROUTES.timeline}
                className="inline-flex items-center gap-2 rounded-[12px] border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition-colors"
              >
                <Calendar className="h-4 w-4" />
                Timeline
              </Link>
              <Link
                href={ROUTES.documents}
                className="inline-flex items-center gap-2 rounded-[12px] border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition-colors"
              >
                <FileText className="h-4 w-4" />
                Bestanden
              </Link>
              <Link
                href={ROUTES.messages}
                className="inline-flex items-center gap-2 rounded-[12px] border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Feedback
              </Link>
            </div>
          </section>
        </>
      )}

      {/* Powered by — subtiele pill badge */}
      <div className="flex justify-center pt-8 pb-2">
        <a
          href="https://helderly.io?ref=client-dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-4 py-2 text-[11px] text-zinc-600 transition-all hover:border-[#6366f1]/30 hover:text-zinc-400 hover:bg-[#6366f1]/4"
        >
          <div className="w-3.5 h-3.5 bg-[#6366f1] rounded-[3px] flex flex-col justify-center px-[3px] gap-[2px] shrink-0">
            <span className="block h-[1.5px] w-full bg-white rounded-full" />
            <span className="block h-[1.5px] bg-white rounded-full opacity-65" style={{ width: "68%" }} />
            <span className="block h-[1.5px] bg-white rounded-full opacity-35" style={{ width: "83%" }} />
          </div>
          Klantportaal door <span className="font-medium text-zinc-500">Helderly</span>
          <span className="text-zinc-700">·</span>
          <span className="text-[#6366f1]">Zelf ook gratis proberen →</span>
        </a>
      </div>
    </div>
  );
}
