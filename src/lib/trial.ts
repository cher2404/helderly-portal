import type { Profile } from "@/lib/database.types";

const TRIAL_DAYS = 30;

/**
 * Trial is active if the user has an active Stripe subscription,
 * OR if trial_starts_at is within the last 30 days.
 */
export function isTrialActive(profile: Profile | null): boolean {
  if (!profile) return false;
  if (profile.subscription_status === "active") return true;
  const startsAt = profile.trial_starts_at ? new Date(profile.trial_starts_at).getTime() : null;
  if (!startsAt) return true; // no trial start set (legacy) → allow access
  const now = Date.now();
  const elapsedDays = (now - startsAt) / (1000 * 60 * 60 * 24);
  return elapsedDays <= TRIAL_DAYS;
}

/**
 * Days remaining in trial. Returns null if user has active subscription or trial not started.
 */
export function trialDaysLeft(profile: Profile | null): number | null {
  if (!profile || profile.subscription_status === "active") return null;
  const startsAt = profile.trial_starts_at ? new Date(profile.trial_starts_at).getTime() : null;
  if (!startsAt) return TRIAL_DAYS;
  const now = Date.now();
  const elapsedDays = (now - startsAt) / (1000 * 60 * 60 * 24);
  const left = Math.ceil(TRIAL_DAYS - elapsedDays);
  return left < 0 ? 0 : left;
}
