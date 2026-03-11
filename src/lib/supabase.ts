import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Singleton browser client — created lazily on first use
let _browserClient: SupabaseClient | null = null;

/**
 * Get the browser-side Supabase client.
 * Returns null if env vars missing or called during SSR.
 */
export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  if (!_browserClient) {
    _browserClient = createClient(url, key, {
      realtime: { params: { eventsPerSecond: 2 } },
    });
  }
  return _browserClient;
}

/**
 * Legacy export — lazily delegates everything to the singleton client.
 * Components should null-check: `if (!supabase) return;`
 */
export const supabase: SupabaseClient | null =
  typeof window === "undefined"
    ? null
    : (new Proxy(
        {},
        {
          get(_, prop) {
            const client = getSupabase();
            if (!client) return undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const val = (client as any)[prop];
            return typeof val === "function" ? val.bind(client) : val;
          },
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any);

/**
 * Server-side Supabase client with service role key.
 * Use ONLY in API routes / server components.
 */
export function createServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY"
    );
  }
  return createClient(url, key);
}
