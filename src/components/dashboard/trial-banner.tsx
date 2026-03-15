"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { trialDaysLeft } from "@/lib/trial";
import type { Profile } from "@/lib/database.types";

type Props = { profile: Profile };

export function TrialBanner({ profile }: Props) {
  const daysLeft = trialDaysLeft(profile);
  if (daysLeft === null || profile.role !== "admin") return null;

  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 transition-colors"
      role="banner"
    >
      <Sparkles className="h-4 w-4 shrink-0 text-[var(--primary-accent)]" />
      <span>
        You have{" "}
        <strong className="font-medium text-zinc-900 dark:text-zinc-100">
          {daysLeft} {daysLeft === 1 ? "day" : "days"}
        </strong>{" "}
        left in your trial.
      </span>
      <Link
        href={ROUTES.pricing}
        className="ml-2 inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium transition-colors bg-[var(--primary-accent)] text-white hover:opacity-90"
      >
        Upgrade to Pro
      </Link>
    </div>
  );
}
