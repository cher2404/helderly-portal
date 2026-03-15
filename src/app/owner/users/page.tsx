import { getOwnerProfilesWithEmails } from "@/lib/supabase/owner-queries";
import type { UserRole, SubscriptionStatus } from "@/lib/database.types";
import { cn } from "@/lib/utils";

const roleLabels: Record<UserRole, string> = {
  admin: "Freelancer",
  client: "Klant",
};

const statusLabels: Record<SubscriptionStatus, string> = {
  active: "Actief",
  trial: "Trial",
  free: "Free",
};

const statusClass: Record<SubscriptionStatus, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  trial: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  free: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export default async function OwnerUsersPage() {
  const profiles = await getOwnerProfilesWithEmails();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-100">Gebruikers</h1>
      <div className="overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-700/50">
                <th className="px-4 py-3 font-medium text-zinc-400">Naam</th>
                <th className="px-4 py-3 font-medium text-zinc-400">E-mail</th>
                <th className="px-4 py-3 font-medium text-zinc-400">User ID</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Rol</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Abonnement</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Trial start</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Aangemaakt</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-zinc-700/30 last:border-0 hover:bg-zinc-500/5"
                >
                  <td className="px-4 py-3 text-zinc-100">
                    {p.full_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {p.email || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                    {p.user_id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
                        p.role === "admin"
                          ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                          : "border-slate-500/30 bg-slate-500/10 text-slate-300"
                      )}
                    >
                      {roleLabels[p.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
                        statusClass[p.subscription_status]
                      )}
                    >
                      {statusLabels[p.subscription_status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {p.trial_starts_at
                      ? new Date(p.trial_starts_at).toLocaleDateString("nl-NL")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(p.created_at).toLocaleDateString("nl-NL")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {profiles.length === 0 && (
        <p className="text-zinc-500">Nog geen gebruikers.</p>
      )}
    </div>
  );
}
