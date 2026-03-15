import { getProfile } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#16171a] text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-500/20 bg-slate-900/50 p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-semibold text-slate-100">
            Trial ended — upgrade to continue
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Your 30-day trial has ended. Upgrade to Pro to access the dashboard again.
          </p>
          <Link href={ROUTES.pricing} className="mt-6 w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full gap-2 bg-sky-500 text-white hover:bg-sky-600 sm:w-auto"
            >
              <Sparkles className="h-4 w-4" />
              Upgrade to Pro — €19/month
            </Button>
          </Link>
          <p className="mt-4 text-xs text-slate-500">
            You will be able to return to the dashboard after subscribing.
          </p>
          <Link
            href={ROUTES.dashboard}
            className="mt-4 text-sm text-slate-400 hover:text-slate-200"
          >
            Back to dashboard (access may be restricted)
          </Link>
        </div>
      </div>
    </div>
  );
}
