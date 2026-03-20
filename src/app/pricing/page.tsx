"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHLY_PRICE = 19;
const YEARLY_PRICE = 15;
const YEARLY_SAVE = Math.round((1 - (YEARLY_PRICE * 12) / (MONTHLY_PRICE * 12)) * 100);

const PRO_FEATURES = [
  "Onbeperkt projecten & klanten",
  "Grote uploads (tot 100MB)",
  "Visuele tijdlijn & voortgang",
  "Bestanden delen & goedkeuren",
  "Klantportaal in jouw huisstijl",
  "Prioriteitsondersteuning",
];

function PricingContent() {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const trialExpired = searchParams.get("trial") === "expired";

  async function handleSubscribe() {
    setLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error ?? "Checkout mislukt");
      }
    } catch (e) {
      console.error(e);
      setCheckoutError(
        e instanceof Error ? e.message : "Er ging iets mis. Probeer het opnieuw."
      );
      setLoading(false);
    }
  }

  const price = interval === "monthly" ? MONTHLY_PRICE : YEARLY_PRICE;
  const label = interval === "monthly" ? "per maand" : "per maand, jaarlijks";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {trialExpired && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm border-b border-amber-500/30 bg-amber-500/10 text-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Je proefperiode van 30 dagen is afgelopen. Upgrade naar Pro om het dashboard te blijven gebruiken.</span>
        </div>
      )}
      <header className="border-b border-zinc-800/80 px-6 h-14 flex items-center justify-between">
        <Link href={ROUTES.home} className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#6366f1] rounded-[7px] flex flex-col justify-center px-1.5 gap-1 shrink-0">
            <span className="block h-[2.5px] w-full bg-white rounded-full" />
            <span className="block h-[2.5px] bg-white rounded-full" style={{ width: "68%", opacity: 0.65 }} />
            <span className="block h-[2.5px] bg-white rounded-full" style={{ width: "83%", opacity: 0.35 }} />
          </div>
          <span className="text-sm font-semibold text-zinc-100">Helderly</span>
        </Link>
        <Link href={ROUTES.login} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          Inloggen →
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6"><div className="w-full max-w-lg py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
            Eenvoudige prijzen
          </h1>
          <p className="mt-2 text-zinc-400">
            Één abonnement. Alles wat je nodig hebt om professioneel over te komen.
          </p>
        </div>

        <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/50 p-1 mb-8">
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
              interval === "monthly" ? "bg-[#6366f1] text-white" : "text-zinc-400 hover:text-zinc-100"
            )}
          >
            Maandelijks
          </button>
          <button
            type="button"
            onClick={() => setInterval("yearly")}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2",
              interval === "yearly" ? "bg-[#6366f1] text-white" : "text-zinc-400 hover:text-zinc-100"
            )}
          >
            Jaarlijks
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
              {YEARLY_SAVE}% korting
            </span>
          </button>
        </div>

        <div className="rounded-[14px] border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-semibold text-zinc-50">€{price}</span>
            <span className="text-zinc-400">{label}</span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Pro — volledige toegang tot alle functies
          </p>
          <ul className="mt-6 space-y-3">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-zinc-300">
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>
          {checkoutError && (
            <p className="mt-6 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-[8px] px-3 py-2 text-center">
              {checkoutError}
            </p>
          )}
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full mt-4 h-11 bg-[#6366f1] hover:opacity-90 text-white"
          >
            {loading ? "Doorsturen…" : "Start gratis proefperiode"}
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Op elk moment opzegbaar. Veilig betalen via Stripe. Betaal met iDEAL, creditcard of Bancontact.
        </p>
      </div></main>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <PricingContent />
    </Suspense>
  );
}
