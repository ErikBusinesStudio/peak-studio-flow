import { defineTool } from "@lovable.dev/mcp-js";
import { sb, ok, err } from "../supabase";

export default defineTool({
  name: "list_events",
  title: "List calendar events",
  description: "List scheduled calendar events with date, time, and notes.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { data, error } = await sb().from("events").select("*").order("date", { ascending: true });
    if (error) return err(error.message);
    return ok(data);
  },
});
