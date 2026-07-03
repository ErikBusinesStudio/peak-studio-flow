import { defineTool } from "@lovable.dev/mcp-js";
import { sb, ok, err } from "../supabase";

export default defineTool({
  name: "list_clients",
  title: "List clients",
  description: "List all clients in Basecamp with status, zone, contract value, and amount collected.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { data, error } = await sb().from("clients").select("*").order("created_at", { ascending: true });
    if (error) return err(error.message);
    return ok(data);
  },
});
