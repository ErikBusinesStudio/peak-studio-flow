import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sb, ok, err } from "../supabase";

export default defineTool({
  name: "add_pagamento",
  title: "Registra pagamento",
  description: "Registra un pagamento di un cliente (importo lordo, trattenuta % opzionale; il netto è calcolato dal database).",
  inputSchema: {
    cliente_id: z.string().uuid(),
    descrizione: z.string().min(1),
    importo_lordo: z.number(),
    trattenuta_pct: z.number().min(0).max(100).default(0),
    periodo: z.enum(["prima", "dopo"]).default("dopo"),
    stato: z.enum(["incassato", "da_incassare"]).default("da_incassare"),
    data: z.string().optional().describe("YYYY-MM-DD"),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (i, ctx) => {
    const { data, error } = await sb(ctx).from("pagamenti").insert({ ...i, data: i.data ?? null }).select().single();
    if (error) return err(error.message);
    return ok(data);
  },
});
