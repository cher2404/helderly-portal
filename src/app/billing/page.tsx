import { getProfile } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, ArrowLeft } from "lucide-react";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect(ROUTES.login);

  if (profile.subscription_status === "active") {
    const next = (await searchParams).next;
    redirect(next && next.startsWith(ROUTES.dashboard) ? next : ROUTES.dashboard);
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <header className="border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between">
        <Link href={ROUTES.home} className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#6366f1] rounded-[7px] flex flex-col justify-center px-1.5 gap-1 shrink-0">
            <span className="block h-[2.5px] w-full bg-white rounded-full" />
            <span className="block h-[2.5px] bg-white rounded-full" style={{ width: "68%", opacity: 0.65 }} />
            <span className="block h-[2.5px] bg-white rounded-full" style={{ width: "83%", opacity: 0.35 }} />
          </div>
          <span className="text-sm font-semibold text-zinc-100">Helderly</span>
        </Link>
        <Link href={ROUTES.home} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Terug naar home
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[14px] border border-zinc-800 bg-zinc-900/50 p-8 shadow-xl text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 mx-auto">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-50">
            Proefperiode afgelopen
          </h1>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            Je proefperiode van 30 dagen is afgelopen. Upgrade naar Pro om je dashboard en alle functies te blijven gebruiken.
          </p>
          <Link href={ROUTES.pricing} className="mt-6 block">
            <Button size="lg" className="w-full gap-2 bg-[#6366f1] hover:opacity-90 text-white transition-opacity">
              <Sparkles className="h-4 w-4" />
              Upgraden naar Pro — €19/maand
            </Button>
          </Link>
          <p className="mt-3 text-xs text-zinc-600">
            Op elk moment opzegbaar. Veilig betalen via Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}
