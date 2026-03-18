import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get("q") ?? "").trim().toLowerCase();
  if (raw.length < 2) return NextResponse.json({ projects: [], stages: [], decisions: [], faqs: [] });
  const q = raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");

  const [projectsRes, stagesRes, decisionsRes, faqsRes] = await Promise.all([
    supabase.from("projects").select("id, name, slug").or(`name.ilike.%${q}%,client_email.ilike.%${q}%`),
    supabase.from("project_stages").select("id, project_id, title, projects(slug)").ilike("title", `%${q}%`),
    supabase.from("decisions").select("id, project_id, title, projects(slug)").ilike("title", `%${q}%`),
    supabase.from("project_faqs").select("id, project_id, question, projects(slug)").or(`question.ilike.%${q}%,answer.ilike.%${q}%`),
  ]);

  const projects = (projectsRes.data ?? []).map((p) => ({ ...p, href: ROUTES.project(p.slug ?? p.id), type: "project" }));
  const stages = (stagesRes.data ?? []).map((s) => ({ ...s, href: ROUTES.project((s.projects as { slug?: string } | null)?.slug ?? s.project_id), type: "stage" }));
  const decisions = (decisionsRes.data ?? []).map((d) => ({ ...d, href: ROUTES.project((d.projects as { slug?: string } | null)?.slug ?? d.project_id), type: "decision" }));
  const faqs = (faqsRes.data ?? []).map((f) => ({ ...f, href: ROUTES.project((f.projects as { slug?: string } | null)?.slug ?? f.project_id), type: "faq" }));

  return NextResponse.json({ projects, stages, decisions, faqs });
}
