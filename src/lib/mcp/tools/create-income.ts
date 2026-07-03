import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sb, ok, err } from "../supabase";

export default defineTool({
  name: "create_income",
  title: "Record income",
  description: "Record an income entry (collected or pending).",
  inputSchema: {
    description: z.string().min(1),
    amount: z.number().describe("Amount in EUR"),
    status: z.enum(["incassato", "da_incassare"]),
    category: z.string().optional(),
    date: z.string().optional().describe("YYYY-MM-DD"),
    date_label: z.string().optional(),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ description, amount, status, category, date, date_label }) => {
    const { data, error } = await sb()
      .from("incomes")
      .insert({
        description, amount, status,
        category: category ?? null,
        date: date ?? null,
        date_label: date_label ?? null,
      })
      .select()
      .single();
    if (error) return err(error.message);
    return ok(data);
  },
});
