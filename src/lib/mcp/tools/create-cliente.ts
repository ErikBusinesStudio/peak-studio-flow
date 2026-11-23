import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sb, ok, err } from "../supabase";

export default defineTool({
  name: "create_cliente",
  title: "Nuovo cliente",
  description: "Aggiunge un cliente o lead al gestionale.",
  inputSchema: {
    nome: z.string().min(1),
    stato: z.enum(["da_contattare", "contattato", "in_trattativa", "accettato", "pagato", "rifiutato"]).default("da_contattare"),
    categoria: z.string().optional().describe("Es. ristorazione, auto_officine, altro"),
    comune: z.string().optional(),
    telefono: z.string().optional(),
    referente: z.string().optional(),
    note: z.string().optional(),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ nome, stato, categoria, comune, telefono, referente, note }, ctx) => {
    const { data, error } = await sb(ctx).from("clienti")
      .insert({ nome, stato, categoria: categoria ?? "altro", comune: comune ?? null, telefono: telefono ?? null, referente: referente ?? null, note: note ?? null })
      .select().single();
    if (error) return err(error.message);
    return ok(data);
  },
});
