import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client (singleton).
 * Safe to import everywhere — returns null during SSR.
 */
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;

  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn("[PROPLAB] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
      return null;
    }

    _client = createClient(url, key);
    console.log("[PROPLAB] Supabase client initialized:", url);
  }

  return _client;
}

// Legacy export — components import this.
// Uses a getter so the client is only created when actually accessed.
export const supabase = typeof window === "undefined" ? null : getSupabase();

/**
 * Server-side Supabase client (service role).
 * Use ONLY in API routes.
 */
export function createServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY");
  }
  return createClient(url, key);
}
