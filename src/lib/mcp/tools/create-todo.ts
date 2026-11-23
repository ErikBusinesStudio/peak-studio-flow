import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sb, ok, err } from "../supabase";

export default defineTool({
  name: "create_todo",
  title: "Create to-do",
  description: "Add a new to-do item with a title and priority.",
  inputSchema: {
    title: z.string().min(1).describe("To-do title"),
    priority: z.enum(["alta", "media", "bassa"]).describe("Priority level"),
    date_note: z.string().optional().describe("Optional date/time note"),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ title, priority, date_note }, ctx) => {
    const { data, error } = await sb(ctx)
      .from("todos")
      .insert({ title, priority, done: false, date_note: date_note ?? null })
      .select()
      .single();
    if (error) return err(error.message);
    return ok(data);
  },
});
