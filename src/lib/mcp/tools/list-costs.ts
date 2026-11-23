import { defineTool } from "@lovable.dev/mcp-js";
import { sb, ok, err } from "../supabase";

export default defineTool({
  name: "list_costs",
  title: "List costs",
  description: "List all recorded costs / expenses.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const { data, error } = await sb(ctx).from("costs").select("*").order("created_at", { ascending: true });
    if (error) return err(error.message);
    return ok(data);
  },
});
