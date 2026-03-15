import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { ROUTES } from "@/lib/constants";

const inviteCounts = new Map<string, { count: number; resetAt: number }>();
const INVITE_LIMIT = 10;
const WINDOW_MS = 60_000;

function checkInviteRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = inviteCounts.get(userId);
  if (!entry) {
    inviteCounts.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (now > entry.resetAt) {
    inviteCounts.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= INVITE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!checkInviteRateLimit(user.id)) {
    return NextResponse.json({ error: "Too many invites; try again in a minute" }, { status: 429 });
  }

  const body = await request.json();
  const projectId = body?.projectId as string;
  const email = (body?.email as string)?.trim()?.toLowerCase();
  if (!projectId || !email) return NextResponse.json({ error: "projectId and email required" }, { status: 400 });

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name, owner_id")
    .eq("id", projectId)
    .single();
  if (projectError || !project || project.owner_id !== user.id) {
    return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4000";
  const redirectTo = `${origin}${ROUTES.project(projectId)}`;

  const admin = createAdminClient();
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });
  if (linkError) {
    console.error("Invite generateLink error:", linkError);
    return NextResponse.json({ error: linkError.message }, { status: 500 });
  }
  const magicLinkUrl =
    (linkData as { properties?: { action_link?: string }; action_link?: string })?.properties?.action_link ??
    (linkData as { action_link?: string })?.action_link ??
    null;
  if (!magicLinkUrl) {
    return NextResponse.json({ error: "Could not generate magic link" }, { status: 500 });
  }

  if (resend) {
    const { error: emailError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `You're invited to ${project.name} on Helderly`,
      html: `
        <h1>You're invited</h1>
        <p>You've been invited to collaborate on <strong>${project.name}</strong> on Helderly.</p>
        <p>Click the link below to sign in and view the project (this link expires in 1 hour):</p>
        <p><a href="${magicLinkUrl}">Open project in Helderly</a></p>
        <p>— The Helderly team</p>
      `,
    });
    if (emailError) console.error("Resend invite error:", emailError);
  }

  return NextResponse.json({ ok: true, message: "Invite sent" });
}
