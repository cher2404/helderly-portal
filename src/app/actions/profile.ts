"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ThemePreference } from "@/lib/database.types";

export async function updateProfileTheme(theme: ThemePreference) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase
    .from("profiles")
    .update({ theme, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function updateProfileAccent(accentColor: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const hex = /^#[0-9A-Fa-f]{6}$/.test(accentColor) ? accentColor : "#3b82f6";
  const { error } = await supabase
    .from("profiles")
    .update({ accent_color: hex, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { error: null };
}

export async function updateProfileLogo(logoUrl: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase
    .from("profiles")
    .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { error: null };
}

/** Slug: lowercase, only a-z0-9 and hyphens */
function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function updateProfileBusinessAndSlug(businessName: string | null, slug: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (profile?.role !== "admin") return { error: "Alleen voor freelancers" };

  const name = businessName?.trim() || null;
  const slugNormalized = slug?.trim() ? normalizeSlug(slug) : null;
  if (slugNormalized && slugNormalized.length < 2) return { error: "Slug moet minstens 2 tekens zijn" };

  if (slugNormalized) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("slug", slugNormalized)
      .single();
    if (existing && existing.user_id !== user.id) {
      return { error: "Deze inlog-URL is al in gebruik. Kies een andere." };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      business_name: name,
      slug: slugNormalized || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { error: null };
}
