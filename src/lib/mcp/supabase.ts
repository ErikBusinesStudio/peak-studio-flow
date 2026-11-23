import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

/** Client Supabase con il token OAuth del chiamante: RLS applicata come quell'utente. */
export function sb(ctx: ToolContext): SupabaseClient {
  const token = ctx.getToken();
  if (!token) throw new Error("Token OAuth verificato mancante");
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase env not configured");
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }], structuredContent: { data } };
}

export function err(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}
