import Stripe from "stripe";

/** Lazy Stripe instance so build succeeds when env vars are unset */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { typescript: true });
}

/** Stripe Price IDs: create a €19/month product in Stripe Dashboard and set these in .env */
export const PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY ?? "";
export const PRICE_YEARLY = process.env.STRIPE_PRICE_YEARLY ?? "";
