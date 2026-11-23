import { defineTool } from "@lovable.dev/mcp-js";
import { sb, ok, err } from "../supabase";

export default defineTool({
  name: "list_pagamenti",
  title: "Elenco pagamenti",
  description: "Elenca i pagamenti (lordo, trattenuta, netto, periodo prima/dopo la data zero, incassato/da incassare).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_i, ctx) => {
    const { data, error } = await sb(ctx).from("pagamenti").select("*").order("created_at", { ascending: true });
    if (error) return err(error.message);
    return ok(data);
  },
});
