import { createAdminClient } from "@/lib/supabase/admin";

export type PublicProfileBranding = {
  business_name: string | null;
  logo_url: string | null;
  slug: string;
};

/**
 * Fetch freelancer branding by slug for the public client login page.
 * Uses service role so unauthenticated visitors can see the branded login.
 */
export async function getPublicProfileBySlug(
  slug: string
): Promise<PublicProfileBranding | null> {
  if (!slug || typeof slug !== "string") return null;
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("business_name, logo_url, slug")
    .eq("slug", normalized)
    .eq("role", "admin")
    .single();

  if (error || !data) return null;
  return data as PublicProfileBranding;
}
