import { cache } from "react";
import type { Project, Asset, Profile, ProjectStage, ProjectMessage, Appointment, ContactLog, Decision, ProjectFaq, InternalNote, Template, TemplateStage, TemplateFaq, Notification } from "@/lib/database.types";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/utils";

export type { Project, Asset, Profile, ProjectStage, ProjectMessage, Appointment, ContactLog, Decision, ProjectFaq, InternalNote, Template, TemplateStage, TemplateFaq, Notification };

/**
 * Get the current user's profile (role: admin | client). Returns null if not found.
 * Cached per request so layout + page share the same result.
 */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;
  return data as Profile;
});

/**
 * Get projects for the current user. RLS ensures:
 * - Admins see projects they own (owner_id = user).
 * - Clients see projects where they are the client (client_id = user).
 * Cached per request so layout + page share the same result.
 */
export const getProjects = cache(async (): Promise<Project[]> => {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as Project[];
});

/**
 * Get assets for a project. RLS ensures the current user is either owner or client of the project.
 */
export async function getAssets(projectId: string): Promise<Asset[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as Asset[];
}

/**
 * Get assets for all projects the current user has access to (for dashboard "Recent Uploads").
 */
export async function getRecentAssets(limit = 10): Promise<Asset[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .order("updated_at", { ascending: false });
  if (!projects?.length) return [];

  const projectIds = projects.map((p) => p.id);
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .in("project_id", projectIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Asset[];
}

export async function getProjectStages(projectId: string): Promise<ProjectStage[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("project_stages")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []) as ProjectStage[];
}

export async function getProjectMessages(projectId: string): Promise<ProjectMessage[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("project_messages")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as ProjectMessage[];
}

/** Get project by id (UUID) or slug. RLS limits to projects the user owns or is client of. */
export async function getProject(idOrSlug: string): Promise<Project | null> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const byId = isUuid(idOrSlug);
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq(byId ? "id" : "slug", idOrSlug)
    .single();
  if (error || !data) return null;
  return data as Project;
}

export async function getAppointments(projectId: string): Promise<Appointment[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("project_id", projectId)
    .order("appointment_date", { ascending: true });
  if (error) return [];
  return (data ?? []) as Appointment[];
}

/** Upcoming appointments for multiple projects (for dashboard summary cards). */
export async function getUpcomingAppointmentsForProjects(projectIds: string[]): Promise<Appointment[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || projectIds.length === 0) return [];
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .in("project_id", projectIds)
    .eq("status", "upcoming")
    .gte("appointment_date", today)
    .order("appointment_date", { ascending: true });
  if (error) return [];
  return (data ?? []) as Appointment[];
}

export async function getContactLogs(projectId: string): Promise<ContactLog[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("contact_logs")
    .select("*")
    .eq("project_id", projectId)
    .order("log_date", { ascending: false });
  if (error) return [];
  return (data ?? []) as ContactLog[];
}

export async function getDecisions(projectId: string): Promise<Decision[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("project_id", projectId)
    .order("decision_date", { ascending: false });
  if (error) return [];
  return (data ?? []) as Decision[];
}

export async function getProjectFaqs(projectId: string): Promise<ProjectFaq[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("project_faqs")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []) as ProjectFaq[];
}

/** Only call for project owner; RLS ensures clients never see internal notes. */
export async function getInternalNotes(projectId: string): Promise<InternalNote | null> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("internal_notes")
    .select("*")
    .eq("project_id", projectId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (error || !data) return null;
  return data as InternalNote;
}

export async function getTemplates(): Promise<Template[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as Template[];
}

export async function getTemplateStages(templateId: string): Promise<TemplateStage[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("template_stages")
    .select("*")
    .eq("template_id", templateId)
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []) as TemplateStage[];
}

export async function getTemplateFaqs(templateId: string): Promise<TemplateFaq[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("template_faqs")
    .select("*")
    .eq("template_id", templateId)
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []) as TemplateFaq[];
}

/** Count assets with status pending or needs_changes (waiting for client approval). */
export async function getPendingAssetsCount(projectIds: string[]): Promise<number> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || projectIds.length === 0) return 0;
  const { count, error } = await supabase
    .from("assets")
    .select("*", { count: "exact", head: true })
    .in("project_id", projectIds)
    .in("status", ["pending", "needs_changes"]);
  if (error) return 0;
  return count ?? 0;
}

/** Count upcoming meetings today across projects. */
export async function getMeetingsTodayCount(projectIds: string[]): Promise<number> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || projectIds.length === 0) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const { count, error } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .in("project_id", projectIds)
    .eq("status", "upcoming")
    .eq("appointment_date", today);
  if (error) return 0;
  return count ?? 0;
}

export async function getNotifications(limit = 30): Promise<Notification[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as Notification[];
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);
  if (error) return 0;
  return count ?? 0;
}
