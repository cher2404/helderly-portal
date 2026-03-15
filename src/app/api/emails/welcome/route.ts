import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resend, FROM_EMAIL } from "@/lib/resend";

export async function POST(request: Request) {
  if (!resend) {
    return NextResponse.json({ error: "Resend not configured" }, { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const to = (body?.to ?? user.email) as string;
  const name = (body?.name ?? "there") as string;
  if (!to) return NextResponse.json({ error: "Missing to" }, { status: 400 });

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject: "Welcome to Helderly",
    html: `
      <h1>Welcome to Helderly, ${name}!</h1>
      <p>You're all set. Create projects, add milestones, and collaborate with your clients in one place.</p>
      <p><a href="${request.headers.get("origin") ?? "https://helderly.app"}/dashboard">Go to Dashboard</a></p>
      <p>— The Helderly team</p>
    `,
  });

  if (error) {
    console.error("Resend welcome error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
