import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client with service role. Use only in API routes or
 * trusted server code (e.g. generating magic links for invites).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin env not set");
  return createClient(url, key);
}
