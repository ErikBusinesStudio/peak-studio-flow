import { useQuery } from "@tanstack/react-query";
import { api, fmtEur, type Income, type Cost, type Project, type Saving, type Todo, type Settings } from "@/lib/db";
import { P } from "@/lib/theme";
import { Sec, Card } from "@/components/ui/Sec";
import { IncomeVsCostsChart } from "@/components/Charts";

function Kpi({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{ background: P.card, border: `1px solid ${P.border}`, borderTop: `3px solid ${color}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", color: P.slateL, fontWeight: 700, letterSpacing: "0.08em" }}>{label}</div>
      <div className="display-font" style={{ fontSize: 26, fontWeight: 400, color, marginTop: 6, letterSpacing: "0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: P.slateL, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function Overview() {
  const { data: incomes = [] } = useQuery<Income[]>({ queryKey: ["incomes"], queryFn: api.incomes.list });
  const { data: costs = [] } = useQuery<Cost[]>({ queryKey: ["costs"], queryFn: api.costs.list });
  const { data: projects = [] } = useQuery<Project[]>({ queryKey: ["projects"], queryFn: api.projects.list });
  const { data: savings = [] } = useQuery<Saving[]>({ queryKey: ["savings"], queryFn: api.savings.list });
  const { data: todos = [] } = useQuery<Todo[]>({ queryKey: ["todos"], queryFn: api.todos.list });
  const { data: settings } = useQuery<Settings | null>({ queryKey: ["settings"], queryFn: api.settings.get });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });

  const accent = settings?.primary_color ?? P.accent;
  const goal = settings?.savings_goal ?? 10000;

  const incassato = incomes.filter((i) => i.status === "incassato").reduce((s, i) => s + Number(i.amount), 0);
  const daIncassare = incomes.filter((i) => i.status === "da_incassare").reduce((s, i) => s + Number(i.amount), 0);
  const pipUnaTantum = projects.reduce((s, p) => s + (p.services_one_off || []).reduce((a, x) => a + Number(x.i), 0), 0);
  const pipMensile = projects.reduce((s, p) => s + (p.services_monthly || []).reduce((a, x) => a + Number(x.i), 0), 0);
  const totRisparmi = savings.reduce((s, x) => s + Number(x.amount), 0);
  const acquisiti = clients.filter((c) => c.status === "acquisito").length;
  const lavorati = clients.filter((c) => c.status !== "da_contattare").length;
  const conv = lavorati ? Math.round((acquisiti / lavorati) * 100) : 0;

  const urgenti = todos.filter((t) => !t.done && t.priority === "alta");

  return (
    <div>
      <Sec title="Entrate vs Costi" accent={accent}>
        <Card>
          <IncomeVsCostsChart incomes={incomes} costs={costs} height={240} />
        </Card>
      </Sec>

      <Sec title="KPI">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10 }}>
          <Kpi label="Incassato" value={fmtEur(incassato)} sub="aggiornato" color={P.green} />
          <Kpi label="Da incassare" value={fmtEur(daIncassare)} sub="confermati" color={P.amber} />
          <Kpi label="Pipeline una tantum" value={fmtEur(pipUnaTantum)} sub="se chiudi tutti" color={P.blue} />
          <Kpi label="Pipeline mensile" value={`${fmtEur(pipMensile)}/m`} sub="se chiudi tutti" color={P.purple} />
          <Kpi label="Risparmi" value={fmtEur(totRisparmi)} sub={`obiettivo ${fmtEur(goal)}`} color={accent} />
          <Kpi label="Conversione" value={`${conv}%`} sub="su lavorati" color={P.rose} />
        </div>
      </Sec>

      <Sec title="Azioni urgenti" accent={P.red}>
        <Card>
          {urgenti.length === 0 && <div style={{ fontSize: 12, color: P.slateL }}>Nessuna urgenza.</div>}
          {urgenti.map((t) => (
            <div key={t.id} style={{ fontSize: 12, padding: "8px 0", borderBottom: `1px solid ${P.border}` }}>
              <div style={{ color: P.navy, fontWeight: 600 }}>{t.title}</div>
              {t.date_note && <div style={{ color: P.slateL, fontSize: 10, marginTop: 2 }}>{t.date_note}</div>}
            </div>
          ))}
        </Card>
      </Sec>
    </div>
  );
}
