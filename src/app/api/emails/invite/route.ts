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
  const to = body?.to as string;
  const projectName = (body?.projectName ?? "Your project") as string;
  const magicLinkUrl = body?.magicLinkUrl as string;
  if (!to) return NextResponse.json({ error: "Missing to" }, { status: 400 });
  if (!magicLinkUrl) return NextResponse.json({ error: "Missing magicLinkUrl" }, { status: 400 });

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject: `You're invited to ${projectName} on Helderly`,
    html: `
      <h1>You're invited</h1>
      <p>You've been invited to collaborate on <strong>${projectName}</strong> on Helderly.</p>
      <p>Click the link below to sign in and view the project (this link expires after use):</p>
      <p><a href="${magicLinkUrl}">Sign in to Helderly</a></p>
      <p>— The Helderly team</p>
    `,
  });

  if (error) {
    console.error("Resend invite error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
