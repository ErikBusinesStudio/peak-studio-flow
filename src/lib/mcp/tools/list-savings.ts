import { defineTool } from "@lovable.dev/mcp-js";
import { sb, ok, err } from "../supabase";

export default defineTool({
  name: "list_savings",
  title: "List savings deposits",
  description: "List all savings deposits with amount, note, and date.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { data, error } = await sb().from("savings").select("*").order("date", { ascending: false });
    if (error) return err(error.message);
    return ok(data);
  },
});
