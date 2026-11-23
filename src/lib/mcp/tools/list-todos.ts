import { defineTool } from "@lovable.dev/mcp-js";
import { sb, ok, err } from "../supabase";

export default defineTool({
  name: "list_todos",
  title: "List to-dos",
  description: "List all to-do items with priority and completion status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const { data, error } = await sb(ctx).from("todos").select("*").order("created_at", { ascending: true });
    if (error) return err(error.message);
    return ok(data);
  },
});
