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
  revalidatePath("/dashboard/settings");
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
