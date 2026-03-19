import { getOwnerStats } from "@/lib/supabase/owner-queries";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";
import { Users, UserCog, CreditCard, TrendingUp, Clock } from "lucide-react";

export default async function OwnerDashboardPage() {
  const stats = await getOwnerStats();

  return (
    <div className="min-h-screen space-y-8 bg-zinc-950 text-zinc-100">
      {/* Platform status banner */}
      <div className="flex items-center justify-between rounded-[12px] border border-zinc-800 bg-zinc-900/30 px-5 py-4">
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
            Platform status
          </p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-zinc-200">
              Operationeel
            </span>
          </div>
        </div>
        <a
          href="https://vercel.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#6366f1] hover:underline"
        >
          Vercel ↗
        </a>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50 mb-6">
          Owner overzicht
        </h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Totaal gebruikers",
              value: stats.totalUsers,
              icon: Users,
              color: "bg-[#6366f1]/15 text-[#6366f1]",
              href: `${ROUTES.owner}/users`,
            },
            {
              label: "Freelancers",
              value: stats.freelancers,
              icon: UserCog,
              color: "bg-sky-500/10 text-sky-400",
            },
            {
              label: "Klanten",
              value: stats.clients,
              icon: Users,
              color: "bg-violet-500/10 text-violet-400",
            },
            {
              label: "Actieve abonnementen",
              value: stats.activeSubscriptions,
              icon: CreditCard,
              color: "bg-emerald-500/10 text-emerald-400",
              href: `${ROUTES.owner}/subscriptions`,
            },
            { label: "In trial", value: stats.trial, icon: Clock, color: "bg-amber-500/10 text-amber-400" },
            { label: "Free", value: stats.free, icon: TrendingUp, color: "bg-zinc-500/10 text-zinc-400" },
          ].map(({ label, value, icon: Icon, color, href }) => {
            const content = (
              <>
                <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-[8px] ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-3xl font-bold tracking-tight text-zinc-50">
                  {value}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {label}
                </p>
              </>
            );

            const cls =
              "group relative overflow-hidden rounded-[14px] border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:-translate-y-0.5 hover:border-[#6366f1]/25 hover:shadow-lg";

            return href ? (
              <Link key={label} href={href} className={cls}>
                {content}
                <span className="absolute right-4 top-4 text-xs text-zinc-700 transition-all group-hover:text-[#6366f1] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </Link>
            ) : (
              <div key={label} className={cls}>
                {content}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-zinc-600">
        Betalingen en facturatie beheer je via het{" "}
        <a
          href="https://dashboard.stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6366f1] hover:underline"
        >
          Stripe Dashboard ↗
        </a>
      </p>
    </div>
  );
}
