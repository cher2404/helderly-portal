"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ProfileWithEmail } from "@/lib/supabase/owner-queries";
import type { UserRole, SubscriptionStatus } from "@/lib/database.types";
import { TRIAL_DAYS } from "@/lib/constants";

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

function trialDaysLeft(profile: ProfileWithEmail): number | null {
  if (profile.subscription_status !== "trial" || !profile.trial_starts_at) return null;
  const elapsed =
    (Date.now() - new Date(profile.trial_starts_at).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(TRIAL_DAYS - elapsed));
}

export function UsersTable({
  profiles,
}: {
  profiles: ProfileWithEmail[];
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | SubscriptionStatus>("all");

  const filtered = useMemo(
    () =>
      profiles.filter((p) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          p.full_name?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q);
        const matchRole = roleFilter === "all" || p.role === roleFilter;
        const matchStatus =
          statusFilter === "all" || p.subscription_status === statusFilter;
        return matchSearch && matchRole && matchStatus;
      }),
    [profiles, search, roleFilter, statusFilter]
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Zoek op naam of e-mail…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-[10px] border border-zinc-700/50 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#6366f1]/50 w-56"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
          className="rounded-[10px] border border-zinc-700/50 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none"
        >
          <option value="all">Alle rollen</option>
          <option value="admin">Freelancers</option>
          <option value="client">Klanten</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-[10px] border border-zinc-700/50 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none"
        >
          <option value="all">Alle statussen</option>
          <option value="active">Actief</option>
          <option value="trial">Trial</option>
          <option value="free">Free</option>
        </select>
        <span className="text-xs text-zinc-500 ml-auto">
          {filtered.length} van {profiles.length}
        </span>
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-[12px] border border-zinc-800 bg-zinc-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {[
                  "Naam",
                  "E-mail",
                  "Rol",
                  "Abonnement",
                  "Resterend",
                  "Aangemaakt",
                  "Stripe",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const days = trialDaysLeft(p);
                return (
                  <tr
                    key={p.id}
                    className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-100">
                      {p.full_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {p.email || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
                          p.role === "admin"
                            ? "border-[#6366f1]/30 bg-[#6366f1]/10 text-[#818cf8]"
                            : "border-zinc-700 bg-zinc-800 text-zinc-400"
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
                    <td className="px-4 py-3">
                      {days !== null ? (
                        <span
                          className={cn(
                            "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
                            days <= 3
                              ? "border-red-500/30 bg-red-500/10 text-red-400"
                              : days <= 7
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                                : "border-zinc-700 bg-zinc-800 text-zinc-400"
                          )}
                        >
                          {days}d
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 text-xs">
                      {new Date(p.created_at).toLocaleDateString("nl-NL")}
                    </td>
                    <td className="px-4 py-3">
                      {p.stripe_customer_id ? (
                        <a
                          href={`https://dashboard.stripe.com/customers/${p.stripe_customer_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#6366f1] hover:underline"
                        >
                          Open in Stripe ↗
                        </a>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            Geen gebruikers gevonden.
          </p>
        )}
      </div>
    </div>
  );
}

