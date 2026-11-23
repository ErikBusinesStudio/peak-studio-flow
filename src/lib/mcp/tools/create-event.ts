import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sb, ok, err } from "../supabase";

export default defineTool({
  name: "create_event",
  title: "Create calendar event",
  description: "Add a new calendar event.",
  inputSchema: {
    title: z.string().min(1),
    date: z.string().describe("Date in YYYY-MM-DD"),
    time: z.string().optional().describe("Time in HH:MM"),
    notes: z.string().optional(),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ title, date, time, notes }, ctx) => {
    const { data, error } = await sb(ctx)
      .from("events")
      .insert({ title, date, time: time ?? null, notes: notes ?? null })
      .select()
      .single();
    if (error) return err(error.message);
    return ok(data);
  },
});
