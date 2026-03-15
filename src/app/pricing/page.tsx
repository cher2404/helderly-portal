"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHLY_PRICE = 19;
const YEARLY_PRICE = 15;
const YEARLY_SAVE = Math.round((1 - (YEARLY_PRICE * 12) / (MONTHLY_PRICE * 12)) * 100);

const PRO_FEATURES = [
  "Unlimited projects & clients",
  "Large file uploads (up to 100MB)",
  "Visual timelines & progress",
  "Document sharing & approval",
  "Priority support",
];

function PricingContent() {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const trialExpired = searchParams.get("trial") === "expired";

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error ?? "Checkout failed");
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  const price = interval === "monthly" ? MONTHLY_PRICE : YEARLY_PRICE;
  const label = interval === "monthly" ? "per month" : "per month (billed yearly)";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {trialExpired && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm border-b border-amber-500/30 bg-amber-500/10 text-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Your 30-day trial has ended. Upgrade to Pro to continue using the dashboard.</span>
        </div>
      )}
      <header className="border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href={ROUTES.home} className="font-semibold text-zinc-50">
            Helderly
          </Link>
          <Link
            href={ROUTES.login}
            className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
            Simple pricing
          </h1>
          <p className="mt-2 text-zinc-400">
            One plan. Everything you need to look pro.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex rounded-xl border border-zinc-800 bg-zinc-900/50 p-1 mb-8"
        >
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
              interval === "monthly"
                ? "bg-zinc-700 text-zinc-50"
                : "text-zinc-400 hover:text-zinc-100"
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setInterval("yearly")}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2",
              interval === "yearly"
                ? "bg-zinc-700 text-zinc-50"
                : "text-zinc-400 hover:text-zinc-100"
            )}
          >
            Yearly
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
              Save {YEARLY_SAVE}%
            </span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-2xl p-6 sm:p-8"
        >
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-semibold text-zinc-50">${price}</span>
            <span className="text-zinc-400">{label}</span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Pro — full access to all features
          </p>
          <ul className="mt-6 space-y-3">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-zinc-300">
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full mt-8 h-11"
          >
            {loading ? "Redirecting…" : "Get Early Access"}
          </Button>
        </motion.div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Cancel anytime. Secure payment via Stripe.
        </p>
      </main>
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
