import { defineTool } from "@lovable.dev/mcp-js";
import { sb, ok, err } from "../supabase";

export default defineTool({
  name: "get_kpis",
  title: "Get KPIs",
  description: "Compute headline KPIs: total collected, pending to collect, total costs, net, savings total.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const s = sb(ctx);
    const [{ data: incomes, error: e1 }, { data: costs, error: e2 }, { data: savings, error: e3 }] = await Promise.all([
      s.from("incomes").select("amount,status"),
      s.from("costs").select("amount"),
      s.from("savings").select("amount"),
    ]);
    if (e1 || e2 || e3) return err((e1 || e2 || e3)!.message);
    const sum = (r: { amount: number | null }[]) => r.reduce((a, x) => a + (Number(x.amount) || 0), 0);
    const collected = sum((incomes || []).filter((i) => i.status === "incassato"));
    const pending = sum((incomes || []).filter((i) => i.status === "da_incassare"));
    const totalCosts = sum(costs || []);
    const savingsTotal = sum(savings || []);
    return ok({ collected, pending, totalCosts, net: collected - totalCosts, savingsTotal });
  },
});
