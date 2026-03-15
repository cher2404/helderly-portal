"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import {
  getProfile,
  getProjects,
  getProjectStages,
  getProjectMessages,
  getDecisions,
  getProjectFaqs,
  getAppointments,
  getContactLogs,
  getAssets,
} from "@/lib/supabase/queries";

export type ExportResult = { error: string } | { data: string };

/** Export current user's profile and all accessible projects + related data as JSON. */
export async function exportMyData(): Promise<ExportResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Niet ingelogd" };

  const profile = await getProfile();
  if (!profile) return { error: "Profiel niet gevonden" };

  const projects = await getProjects();
  const exportData: Record<string, unknown> = {
    exported_at: new Date().toISOString(),
    profile: {
      ...profile,
      // omit sensitive if you prefer; for AVG export we include what we store
    },
    projects: [],
  };

  for (const project of projects) {
    const [stages, messages, decisions, faqs, appointments, contactLogs, assets] =
      await Promise.all([
        getProjectStages(project.id),
        getProjectMessages(project.id),
        getDecisions(project.id),
        getProjectFaqs(project.id),
        getAppointments(project.id),
        getContactLogs(project.id),
        getAssets(project.id),
      ]);
    (exportData.projects as unknown[]).push({
      ...project,
      stages,
      messages,
      decisions,
      faqs,
      appointments,
      contact_logs: contactLogs,
      assets: assets.map((a) => ({ ...a, file_url: a.file_url ? "[URL]" : null })), // metadata only
    });
  }

  return { data: JSON.stringify(exportData, null, 2) };
}

export type DeleteAccountResult = { error: string } | { ok: true };

/** Cancel Stripe subscriptions for a customer, then delete user and cascade data. */
export async function deleteAccount(): Promise<DeleteAccountResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Niet ingelogd" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  const customerId = profile?.stripe_customer_id;
  if (customerId) {
    try {
      const stripe = getStripe();
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
      });
      for (const sub of subs.data) {
        await stripe.subscriptions.cancel(sub.id);
      }
    } catch (e) {
      console.error("Stripe cancel subscription error:", e);
      // continue with account deletion
    }
  }

  const admin = createAdminClient();
  // So projects where this user is client are not cascade-deleted (freelancer keeps project)
  await admin
    .from("projects")
    .update({ client_id: null, client_email: null, updated_at: new Date().toISOString() })
    .eq("client_id", user.id);

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) return { error: deleteError.message };
  return { ok: true };
}
