import { NextResponse } from "next/server";

/**
 * Optional: track anonymous events (e.g. "create_project", "checkout_started").
 * Set ANALYTICS_SECRET in env and send it in the request to avoid abuse.
 * For production, consider Vercel Analytics or Plausible instead.
 */
export async function POST(request: Request) {
  const secret = process.env.ANALYTICS_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const body = await request.json();
    const event = body?.event as string;
    const props = body?.props as Record<string, unknown> | undefined;
    if (!event) return NextResponse.json({ error: "event required" }, { status: 400 });
    // Log or send to your analytics provider
    if (process.env.NODE_ENV === "development") {
      console.log("[analytics]", event, props ?? {});
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}
