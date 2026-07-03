import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sb, ok, err } from "../supabase";

export default defineTool({
  name: "create_client",
  title: "Create client",
  description: "Add a new client to Basecamp.",
  inputSchema: {
    name: z.string().min(1),
    status: z.enum(["acquisito", "in_attesa", "da_contattare", "rifiutato"]),
    zona: z.string().optional(),
    value: z.number().optional().describe("Contract value in EUR"),
    phone: z.string().optional(),
    contact: z.string().optional(),
    notes: z.string().optional(),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ name, status, zona, value, phone, contact, notes }) => {
    const { data, error } = await sb()
      .from("clients")
      .insert({
        name, status,
        zona: zona ?? null,
        value: value ?? null,
        collected: 0,
        phone: phone ?? null,
        contact: contact ?? null,
        notes: notes ?? null,
      })
      .select()
      .single();
    if (error) return err(error.message);
    return ok(data);
  },
});
