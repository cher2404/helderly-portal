import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  const stripe = new Stripe(stripeKey);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? null;
      if (!userId) {
        console.warn("Webhook: no client_reference_id on checkout.session.completed");
        break;
      }
      const customerId = typeof session.customer === "string"
        ? session.customer
        : session.customer?.id ?? null;

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_status: "active",
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Webhook: failed to update profile", error);
        return NextResponse.json(
          { error: "Failed to update profile" },
          { status: 500 }
        );
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const status = subscription.status === "active" ? "active" : "free";

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId);

      if (error) {
        console.error("Webhook: failed to update profile from subscription", error);
      }
      break;
    }

    default:
      // Unhandled event type
      break;
  }

  return NextResponse.json({ received: true });
}
