import { getOwnerProfiles } from "@/lib/supabase/owner-queries";
import { ExternalLink, CreditCard } from "lucide-react";

export default async function OwnerSubscriptionsPage() {
  const profiles = await getOwnerProfiles();
  const withSubscription = profiles.filter((p) => p.subscription_status === "active");
  const trial = profiles.filter((p) => p.subscription_status === "trial");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-zinc-100">Abonnementen</h1>
        <a
          href="https://dashboard.stripe.com/customers"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-300 transition-colors hover:bg-sky-500/20"
        >
          <CreditCard className="h-4 w-4" />
          Stripe Dashboard
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-300">Actieve abonnementen ({withSubscription.length})</h2>
        <p className="text-sm text-slate-500">
          Gebruikers met subscription_status = active. Wijzigingen (annuleren, plan wijzigen) doe je in Stripe.
        </p>
        <div className="overflow-hidden rounded-xl border border-zinc-700/50 bg-slate-900/40">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-700/50">
                <th className="px-4 py-3 font-medium text-zinc-400">Naam</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Stripe Customer ID</th>
              </tr>
            </thead>
            <tbody>
              {withSubscription.map((p) => (
                <tr key={p.id} className="border-b border-slate-500/10 last:border-0">
                  <td className="px-4 py-3 text-zinc-100">{p.full_name || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                    {p.stripe_customer_id || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {withSubscription.length === 0 && (
          <p className="text-slate-500">Nog geen actieve abonnementen.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-300">In trial ({trial.length})</h2>
        <p className="text-sm text-slate-500">
          Gebruikers die nog in de 30-dagen trial zitten. Na betaling worden ze automatisch op &quot;active&quot; gezet via de Stripe webhook.
        </p>
        <div className="overflow-hidden rounded-xl border border-zinc-700/50 bg-slate-900/40">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-700/50">
                <th className="px-4 py-3 font-medium text-zinc-400">Naam</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Trial start</th>
              </tr>
            </thead>
            <tbody>
              {trial.map((p) => (
                <tr key={p.id} className="border-b border-slate-500/10 last:border-0">
                  <td className="px-4 py-3 text-zinc-100">{p.full_name || "—"}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {p.trial_starts_at
                      ? new Date(p.trial_starts_at).toLocaleDateString("nl-NL")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {trial.length === 0 && <p className="text-slate-500">Niemand in trial.</p>}
      </section>

      <p className="text-sm text-slate-500">
        Webhook <code className="rounded bg-zinc-800 px-1">checkout.session.completed</code> en{" "}
        <code className="rounded bg-zinc-800 px-1">customer.subscription.updated/deleted</code> zorgen voor sync tussen Stripe en de profiles tabel.
      </p>
    </div>
  );
}
