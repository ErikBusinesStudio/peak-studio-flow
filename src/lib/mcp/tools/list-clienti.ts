import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sb, ok, err } from "../supabase";

export default defineTool({
  name: "list_clienti",
  title: "Elenco clienti",
  description: "Elenca i clienti di Peak Studio (stato, categoria, comune, prossimo contatto). Filtro opzionale per stato.",
  inputSchema: { stato: z.enum(["da_contattare", "contattato", "in_trattativa", "accettato", "pagato", "rifiutato"]).optional() },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ stato }, ctx) => {
    let q = sb(ctx).from("clienti").select("*").order("nome", { ascending: true });
    if (stato) q = q.eq("stato", stato);
    const { data, error } = await q;
    if (error) return err(error.message);
    return ok(data);
  },
});
