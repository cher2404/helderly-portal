import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, PRICE_MONTHLY, PRICE_YEARLY } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const interval = body?.interval === "yearly" ? "yearly" : "monthly";
    const priceId = interval === "yearly" ? PRICE_YEARLY : PRICE_MONTHLY;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.headers.get("origin")}/dashboard?subscription=success`,
      cancel_url: `${request.headers.get("origin")}/pricing`,
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      subscription_data: {
        metadata: { user_id: user.id },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
