import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is niet geconfigureerd. Maak een bestand .env.local in de projectmap met NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY. Start daarna de dev server opnieuw (npm run dev)."
    );
  }
  return createBrowserClient(url, key);
}
