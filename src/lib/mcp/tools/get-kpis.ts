import { defineTool } from "@lovable.dev/mcp-js";
import { sb, ok, err } from "../supabase";

export default defineTool({
  name: "get_kpis",
  title: "KPI",
  description: "Indicatori principali: clienti per stato, incassato netto dopo la data zero, da incassare, storico, obiettivo e quanto manca.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_i, ctx) => {
    const s = sb(ctx);
    const [c, p, i] = await Promise.all([
      s.from("clienti").select("stato"), s.from("pagamenti").select("importo_lordo,importo_netto,periodo,stato"),
      s.from("impostazioni").select("*").eq("id", 1).maybeSingle(),
    ]);
    const e = c.error ?? p.error ?? i.error;
    if (e) return err(e.message);
    const sum = (r: { importo_netto?: number; importo_lordo?: number }[], k: "importo_netto" | "importo_lordo") => r.reduce((a, x) => a + Number(x[k] ?? 0), 0);
    const pg = p.data ?? [];
    const dopoInc = pg.filter((x) => x.periodo === "dopo" && x.stato === "incassato");
    const prima = pg.filter((x) => x.periodo === "prima" && x.stato === "incassato");
    const perStato: Record<string, number> = {};
    (c.data ?? []).forEach((x) => { perStato[x.stato] = (perStato[x.stato] ?? 0) + 1; });
    const obiettivo = Number(i.data?.obiettivo ?? 10000);
    const incassatoDopo = sum(dopoInc, "importo_netto");
    return ok({
      clientiPerStato: perStato, incassatoNettoDopoDataZero: incassatoDopo,
      daIncassareNetto: sum(pg.filter((x) => x.periodo === "dopo" && x.stato === "da_incassare"), "importo_netto"),
      storicoLordo: sum(prima, "importo_lordo"), storicoNetto: sum(prima, "importo_netto"),
      obiettivo, scadenza: i.data?.scadenza ?? null, dataZero: i.data?.data_zero ?? null, mancano: Math.max(0, obiettivo - incassatoDopo),
    });
  },
});
