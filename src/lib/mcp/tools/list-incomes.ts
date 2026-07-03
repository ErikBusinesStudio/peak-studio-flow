import { defineTool } from "@lovable.dev/mcp-js";
import { sb, ok, err } from "../supabase";

export default defineTool({
  name: "list_incomes",
  title: "List incomes",
  description: "List all income entries (collected and pending) with amounts and status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { data, error } = await sb().from("incomes").select("*").order("created_at", { ascending: true });
    if (error) return err(error.message);
    return ok(data);
  },
});
