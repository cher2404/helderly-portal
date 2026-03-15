import { getOwnerStats } from "@/lib/supabase/owner-queries";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";
import { Users, UserCog, CreditCard, TrendingUp, Clock } from "lucide-react";

export default async function OwnerDashboardPage() {
  const stats = await getOwnerStats();

  const cards = [
    {
      label: "Totaal gebruikers",
      value: stats.totalUsers,
      icon: Users,
      href: `${ROUTES.owner}/users`,
    },
    {
      label: "Freelancers",
      value: stats.freelancers,
      icon: UserCog,
    },
    {
      label: "Klanten",
      value: stats.clients,
      icon: Users,
    },
    {
      label: "Actieve abonnementen",
      value: stats.activeSubscriptions,
      icon: CreditCard,
      href: `${ROUTES.owner}/subscriptions`,
    },
    {
      label: "In trial",
      value: stats.trial,
      icon: Clock,
    },
    {
      label: "Free",
      value: stats.free,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-slate-100">Owner-overzicht</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, href }) => {
          const content = (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500/20 text-slate-400">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-xl font-semibold text-slate-100">{value}</p>
              </div>
            </>
          );
          const className =
            "flex items-center gap-4 rounded-xl border border-slate-500/20 bg-slate-900/40 p-5 transition-colors hover:border-slate-500/30";
          if (href) {
            return (
              <Link key={label} href={href} className={className}>
                {content}
              </Link>
            );
          }
          return (
            <div key={label} className={className}>
              {content}
            </div>
          );
        })}
      </div>
      <p className="text-sm text-slate-500">
        Gebruikers en abonnementen beheer je via de navigatie. Voor betalingen en
        facturatie gebruik je het{" "}
        <a
          href="https://dashboard.stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:underline"
        >
          Stripe Dashboard
        </a>
        .
      </p>
    </div>
  );
}
