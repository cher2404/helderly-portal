import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROUTES } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, name, email, description, budget, timeline } = body;

    if (!slug || !name || !email || !description) {
      return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Zoek de freelancer op basis van slug
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, business_name")
      .eq("slug", String(slug).trim().toLowerCase())
      .eq("role", "admin")
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Freelancer niet gevonden" }, { status: 404 });
    }

    // Sla de intake op
    const { error: insertError } = await supabase.from("intake_submissions").insert({
      freelancer_id: profile.user_id,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      description: String(description).trim(),
      budget: budget ? String(budget) : null,
      timeline: timeline ? String(timeline) : null,
      status: "new",
    });

    if (insertError) {
      console.error("Intake insert error:", insertError);
      return NextResponse.json({ error: "Kon aanvraag niet opslaan" }, { status: 500 });
    }

    const desc = String(description).trim();
    // Stuur notificatie naar de freelancer
    await supabase.from("notifications").insert({
      user_id: profile.user_id,
      type: "intake_submission",
      title: `Nieuwe aanvraag van ${String(name).trim()}`,
      body: desc.slice(0, 120) + (desc.length > 120 ? "…" : ""),
      link: ROUTES.intakeSubmissions,
      read_at: null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Intake API error:", err);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}
