import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sb, ok, err } from "../supabase";

export default defineTool({
  name: "add_contatto",
  title: "Registra contatto",
  description: "Registra un contatto con un cliente e aggiorna il prossimo follow-up.",
  inputSchema: {
    cliente_id: z.string().uuid(),
    canale: z.enum(["whatsapp", "telefono", "di_persona", "email", "social", "altro"]),
    esito: z.string().optional(),
    note: z.string().optional(),
    data: z.string().optional().describe("YYYY-MM-DD, default oggi"),
    prossimo_followup: z.string().optional().describe("YYYY-MM-DD"),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ cliente_id, canale, esito, note, data, prossimo_followup }, ctx) => {
    const s = sb(ctx);
    const { data: row, error } = await s.from("contatti_log")
      .insert({ cliente_id, canale, esito: esito ?? null, note: note ?? null, data: data ?? new Date().toISOString().slice(0, 10), prossimo_followup: prossimo_followup ?? null })
      .select().single();
    if (error) return err(error.message);
    if (prossimo_followup) await s.from("clienti").update({ prossimo_contatto: prossimo_followup }).eq("id", cliente_id);
    return ok(row);
  },
});
