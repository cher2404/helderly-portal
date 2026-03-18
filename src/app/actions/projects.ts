"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProjectStatus, StageStatus, AppointmentStatus, ProjectHealthStatus, AssetStatus, ProjectLayoutConfig, MilestoneStatus } from "@/lib/database.types";
import { createNotification } from "@/app/actions/notifications";
import { slugify } from "@/lib/utils";

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const name = formData.get("name") as string;
  const clientEmail = (formData.get("client_email") as string)?.trim() || null;
  const clientId = (formData.get("client_id") as string)?.trim() || null;
  const deadlineRaw = formData.get("deadline") as string;
  const deadline = deadlineRaw || null;
  const status = (formData.get("status") as ProjectStatus) ?? "active";
  const templateId = (formData.get("template_id") as string)?.trim() || null;

  if (!name?.trim()) {
    return { error: "Project name is required" };
  }
  if (!clientEmail && !clientId) {
    return { error: "Client email or client ID is required" };
  }

  let slug = slugify(name.trim());
  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("owner_id", user.id)
    .eq("slug", slug)
    .limit(1);
  if (existing?.length) {
    let n = 2;
    while (true) {
      const { data: dup } = await supabase.from("projects").select("id").eq("owner_id", user.id).eq("slug", `${slug}-${n}`).limit(1);
      if (!dup?.length) {
        slug = `${slug}-${n}`;
        break;
      }
      n++;
    }
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      name: name.trim(),
      slug,
      client_id: clientId || null,
      client_email: clientEmail,
      owner_id: user.id,
      status,
      progress_percentage: 0,
      deadline: deadline || null,
    })
    .select("id, slug")
    .single();

  if (error) return { error: error.message };

  let stagesInserted = false;
  if (templateId) {
    const { data: tStages } = await supabase.from("template_stages").select("title, sort_order").eq("template_id", templateId).order("sort_order", { ascending: true });
    const { data: tFaqs } = await supabase.from("template_faqs").select("question, answer, sort_order").eq("template_id", templateId).order("sort_order", { ascending: true });
    if (tStages?.length) {
      await supabase.from("project_stages").insert(
        tStages.map((s, i) => ({ project_id: project.id, title: s.title, sort_order: s.sort_order ?? i }))
      );
      stagesInserted = true;
    }
    if (tFaqs?.length) {
      await supabase.from("project_faqs").insert(
        tFaqs.map((f, i) => ({ project_id: project.id, question: f.question, answer: f.answer, sort_order: f.sort_order ?? i }))
      );
    }
  }
  if (!stagesInserted) {
    const defaultStages = [
      { project_id: project.id, title: "Concept", sort_order: 0 },
      { project_id: project.id, title: "Feedback", sort_order: 1 },
      { project_id: project.id, title: "Final Delivery", sort_order: 2 },
    ];
    await supabase.from("project_stages").insert(defaultStages);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/timeline");
  return { error: null };
}

export async function updateAssetStatus(assetId: string, status: AssetStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase.from("assets").update({ status }).eq("id", assetId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function createTemplateFromProject(projectId: string, templateName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: project } = await supabase.from("projects").select("id").eq("id", projectId).eq("owner_id", user.id).single();
  if (!project) return { error: "Project not found" };

  const { data: template, error: tErr } = await supabase.from("templates").insert({ owner_id: user.id, name: templateName.trim() }).select("id").single();
  if (tErr || !template) return { error: tErr?.message ?? "Failed to create template" };

  const { data: stages } = await supabase.from("project_stages").select("title, sort_order").eq("project_id", projectId).order("sort_order", { ascending: true });
  const { data: faqs } = await supabase.from("project_faqs").select("question, answer, sort_order").eq("project_id", projectId).order("sort_order", { ascending: true });

  if (stages?.length) {
    await supabase.from("template_stages").insert(stages.map((s, i) => ({ template_id: template.id, title: s.title, sort_order: s.sort_order ?? i })));
  }
  if (faqs?.length) {
    await supabase.from("template_faqs").insert(faqs.map((f, i) => ({ template_id: template.id, question: f.question, answer: f.answer, sort_order: f.sort_order ?? i })));
  }
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateProjectProgress(
  projectId: string,
  progress: number,
  status?: ProjectStatus
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const updates: { progress_percentage: number; status?: ProjectStatus; updated_at?: string } = {
    progress_percentage: Math.min(100, Math.max(0, progress)),
    updated_at: new Date().toISOString(),
  };
  if (status) updates.status = status;

  const { error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/timeline");
  return { error: null };
}

export async function toggleStageComplete(projectId: string, stageId: string, isCompleted: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("project_stages")
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq("id", stageId)
    .eq("project_id", projectId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/timeline");
  return { error: null };
}

export async function addProjectMessage(projectId: string, message: string, assetId?: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  if (!message?.trim()) return { error: "Message is required" };

  const { error } = await supabase.from("project_messages").insert({
    project_id: projectId,
    user_id: user.id,
    asset_id: assetId || null,
    message: message.trim(),
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/messages");
  return { error: null };
}

export async function createStageMilestone(projectId: string, title: string, isFreelancer: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: maxOrder } = await supabase.from("project_stages").select("sort_order").eq("project_id", projectId).order("sort_order", { ascending: false }).limit(1).single();
  const sortOrder = (maxOrder?.sort_order ?? -1) + 1;
  const status: MilestoneStatus = isFreelancer ? "active" : "pending_approval";
  const { data: stage, error } = await supabase
    .from("project_stages")
    .insert({
      project_id: projectId,
      title: title.trim(),
      sort_order: sortOrder,
      created_by: user.id,
      status,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  if (status === "pending_approval") {
    const { data: project } = await supabase.from("projects").select("name, owner_id").eq("id", projectId).single();
    if (project?.name && project?.owner_id) {
      await createNotification({
        user_id: project.owner_id,
        type: "milestone_proposed",
        title: "New milestone proposed",
        body: `"${title.trim()}" for ${project.name}`,
        link: `/dashboard/project/${projectId}`,
      });
    }
  }
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/project/${projectId}`);
  return { error: null, stage };
}

export async function updateStageMilestone(
  projectId: string,
  stageId: string,
  updates: { due_date?: string | null; stage_status?: StageStatus; status?: MilestoneStatus; title?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  if (updates.status === "active") {
    const { data: project } = await supabase.from("projects").select("name, client_id").eq("id", projectId).single();
    const { data: stage } = await supabase.from("project_stages").select("title").eq("id", stageId).single();
    if (project?.client_id && stage?.title) {
      await createNotification({
        user_id: project.client_id,
        type: "milestone_approved",
        title: "Milestone approved",
        body: `"${stage.title}" for ${project.name}`,
        link: `/dashboard/project/${projectId}`,
      });
    }
  }
  const { error } = await supabase
    .from("project_stages")
    .update(updates)
    .eq("id", stageId)
    .eq("project_id", projectId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/project/${projectId}`);
  return { error: null };
}

export async function createAppointment(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const title = (formData.get("title") as string)?.trim();
  const appointment_date = formData.get("appointment_date") as string;
  const appointment_time = (formData.get("appointment_time") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;
  if (!title || !appointment_date) return { error: "Title and date required" };
  const { error } = await supabase.from("appointments").insert({
    project_id: projectId,
    title,
    appointment_date,
    appointment_time,
    location,
    status: "upcoming",
  });
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/project/${projectId}`);
  return { error: null };
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase
    .from("appointments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", appointmentId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { error: null };
}

export async function addContactLog(
  projectId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const log_date = formData.get("log_date") as string;
  const channel = (formData.get("channel") as string)?.trim() || "call";
  const summary = (formData.get("summary") as string)?.trim();
  if (!log_date || !summary) return { error: "Date and summary required" };
  const { error } = await supabase.from("contact_logs").insert({
    project_id: projectId,
    user_id: user.id,
    log_date,
    channel,
    summary,
  });
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/project/${projectId}`);
  return { error: null };
}

export async function createDecision(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const title = (formData.get("title") as string)?.trim();
  const decision_date = formData.get("decision_date") as string;
  const rationale = (formData.get("rationale") as string)?.trim() || null;
  if (!title || !decision_date) return { error: "Title and date required" };
  const { error } = await supabase.from("decisions").insert({
    project_id: projectId,
    title,
    decision_date,
    rationale,
    confirmed_by_client: false,
  });
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/project/${projectId}`);
  return { error: null };
}

export async function setDecisionConfirmed(decisionId: string, confirmed: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase
    .from("decisions")
    .update({ confirmed_by_client: confirmed, updated_at: new Date().toISOString() })
    .eq("id", decisionId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function createFaq(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const question = (formData.get("question") as string)?.trim();
  const answer = (formData.get("answer") as string)?.trim();
  if (!question || !answer) return { error: "Question and answer required" };
  const { data: max } = await supabase.from("project_faqs").select("sort_order").eq("project_id", projectId).order("sort_order", { ascending: false }).limit(1).single();
  const sort_order = (max?.sort_order ?? -1) + 1;
  const { error } = await supabase.from("project_faqs").insert({
    project_id: projectId,
    question,
    answer,
    sort_order,
  });
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/project/${projectId}`);
  return { error: null };
}

export async function updateFaq(faqId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const question = (formData.get("question") as string)?.trim();
  const answer = (formData.get("answer") as string)?.trim();
  if (!question || !answer) return { error: "Question and answer required" };
  const { error } = await supabase.from("project_faqs").update({ question, answer, updated_at: new Date().toISOString() }).eq("id", faqId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteFaq(faqId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase.from("project_faqs").delete().eq("id", faqId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { error: null };
}

export async function saveInternalNote(projectId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase.from("internal_notes").upsert(
    { project_id: projectId, owner_id: user.id, content: content ?? "", updated_at: new Date().toISOString() },
    { onConflict: "project_id,owner_id" }
  );
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/project/${projectId}`);
  return { error: null };
}

export async function updateProjectHours(
  projectId: string,
  estimatedHours?: number | null,
  actualHours?: number | null
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const updates: { estimated_hours?: number | null; actual_hours?: number; updated_at: string } = {
    updated_at: new Date().toISOString(),
  };
  if (estimatedHours !== undefined) updates.estimated_hours = estimatedHours;
  if (actualHours !== undefined) updates.actual_hours = Math.max(0, actualHours ?? 0);
  const { error } = await supabase.from("projects").update(updates).eq("id", projectId).eq("owner_id", user.id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/project/${projectId}`);
  return { error: null };
}

export async function updateProjectHealth(projectId: string, healthStatus: ProjectHealthStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase.from("projects").update({ health_status: healthStatus, updated_at: new Date().toISOString() }).eq("id", projectId).eq("owner_id", user.id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/project/${projectId}`);
  return { error: null };
}

export async function updateProjectLayout(projectId: string, layoutConfig: ProjectLayoutConfig) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase
    .from("projects")
    .update({ layout_config: layoutConfig, updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("owner_id", user.id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/project/${projectId}`);
  return { error: null };
}
