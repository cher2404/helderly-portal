import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { isOwnerEmail } from "@/lib/owner";
import Link from "next/link";
import { Shield, Users, CreditCard, LayoutDashboard } from "lucide-react";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);
  if (!isOwnerEmail(user.email)) redirect(ROUTES.dashboard);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-700/50 bg-zinc-900/50 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link
            href={ROUTES.owner}
            className="flex items-center gap-2 font-semibold text-zinc-100"
          >
            <Shield className="h-5 w-5 text-amber-400" />
            Owner
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href={ROUTES.owner}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-500/10 hover:text-zinc-100"
            >
              <LayoutDashboard className="h-4 w-4" />
              Overzicht
            </Link>
            <Link
              href={`${ROUTES.owner}/users`}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-500/10 hover:text-zinc-100"
            >
              <Users className="h-4 w-4" />
              Gebruikers
            </Link>
            <Link
              href={`${ROUTES.owner}/subscriptions`}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-500/10 hover:text-zinc-100"
            >
              <CreditCard className="h-4 w-4" />
              Abonnementen
            </Link>
          </nav>
          <Link
            href={ROUTES.dashboard}
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
