import { getProfile } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { Inbox } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import type { IntakeSubmission } from "@/lib/database.types";

async function getIntakeSubmissions(userId: string): Promise<IntakeSubmission[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("intake_submissions")
    .select("*")
    .eq("freelancer_id", userId)
    .order("created_at", { ascending: false });
  return (data as IntakeSubmission[]) ?? [];
}

export default async function IntakeDashboardPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const submissions = await getIntakeSubmissions(profile.user_id);
  const newCount = submissions.filter((s) => s.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Aanvragen
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Projectaanvragen via jouw intake-pagina.
            {profile.slug && (
              <>
                {" "}
                Jouw link:{" "}
                <a
                  href={ROUTES.intake(profile.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6366f1] hover:underline"
                >
                  helderly.io/intake/{profile.slug}
                </a>
              </>
            )}
          </p>
        </div>
        {newCount > 0 && (
          <span className="text-xs font-medium bg-[#6366f1]/10 text-[#818cf8] border border-[#6366f1]/20 px-3 py-1.5 rounded-full">
            {newCount} nieuw
          </span>
        )}
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-[14px] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
          <Inbox className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Nog geen aanvragen
          </p>
          {profile.slug && (
            <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-2">
              Deel jouw link:{" "}
              <a
                href={ROUTES.intake(profile.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6366f1] hover:underline"
              >
                helderly.io/intake/{profile.slug}
              </a>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <div
              key={s.id}
              className={`rounded-[12px] border p-5 transition-colors ${
                s.status === "new"
                  ? "border-[#6366f1]/25 bg-[#6366f1]/4 dark:bg-[#6366f1]/4"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {s.name}
                    </p>
                    {s.status === "new" && (
                      <span className="text-[10px] font-medium bg-[#6366f1]/10 text-[#818cf8] border border-[#6366f1]/20 px-2 py-0.5 rounded-full">
                        Nieuw
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    {s.email}
                    {s.budget && <> · {s.budget}</>}
                    {s.timeline && <> · {s.timeline}</>}
                  </p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
                    {s.description}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-zinc-400 dark:text-zinc-600">
                    {formatDistanceToNow(new Date(s.created_at), { addSuffix: true, locale: nl })}
                  </p>
                  <a
                    href={`mailto:${encodeURIComponent(s.email)}?subject=${encodeURIComponent("Re: jouw projectaanvraag")}&body=${encodeURIComponent(`Hoi ${s.name},\n\nBedankt voor je aanvraag!`)}`}
                    className="mt-2 inline-block text-xs font-medium text-[#6366f1] hover:underline"
                  >
                    Reageren →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
