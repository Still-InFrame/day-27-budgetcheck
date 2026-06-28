import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the publishable key. The `leads` table has
 * RLS with an insert-only policy, so this key can write leads but cannot read
 * them back — safe for a public lead magnet.
 */
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
