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
  const type = body?.type as "proposed" | "approved";
  const projectName = (body?.projectName ?? "Project") as string;
  const milestoneTitle = (body?.milestoneTitle ?? "A milestone") as string;
  if (!to || !type) return NextResponse.json({ error: "Missing to or type" }, { status: 400 });

  const subject =
    type === "proposed"
      ? `New milestone proposed: ${milestoneTitle}`
      : `Milestone approved: ${milestoneTitle}`;
  const message =
    type === "proposed"
      ? `A client has proposed a new milestone "<strong>${milestoneTitle}</strong>" for <strong>${projectName}</strong>. Approve or edit it in the dashboard.`
      : `The milestone "<strong>${milestoneTitle}</strong>" for <strong>${projectName}</strong> has been approved.`;

  const origin = request.headers.get("origin") ?? "https://helderly.app";
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject,
    html: `
      <h1>${type === "proposed" ? "Milestone proposed" : "Milestone approved"}</h1>
      <p>${message}</p>
      <p><a href="${origin}/dashboard">Open dashboard</a></p>
      <p>— Helderly</p>
    `,
  });

  if (error) {
    console.error("Resend milestone email error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
