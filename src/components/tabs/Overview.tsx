import { useQuery } from "@tanstack/react-query";
import { api, fmtEur, type Income, type Project, type Saving, type Todo, type Update, type Settings } from "@/lib/db";
import { P } from "@/lib/theme";
import { Sec } from "@/components/ui/Sec";

function Kpi({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${P.border}`, borderTop: `3px solid ${color}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", color: P.slateL, fontWeight: 700, letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 900, color, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: P.slateL, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function Overview() {
  const { data: incomes = [] } = useQuery<Income[]>({ queryKey: ["incomes"], queryFn: api.incomes.list });
  const { data: projects = [] } = useQuery<Project[]>({ queryKey: ["projects"], queryFn: api.projects.list });
  const { data: savings = [] } = useQuery<Saving[]>({ queryKey: ["savings"], queryFn: api.savings.list });
  const { data: todos = [] } = useQuery<Todo[]>({ queryKey: ["todos"], queryFn: api.todos.list });
  const { data: updates = [] } = useQuery<Update[]>({ queryKey: ["updates"], queryFn: api.updates.list });
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
  const recenti = updates.slice(0, 5);

  return (
    <div>
      <Sec title="KPI">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(145px,1fr))", gap: 10 }}>
          <Kpi label="Incassato" value={fmtEur(incassato)} sub="aggiornato" color={P.green} />
          <Kpi label="Da incassare" value={fmtEur(daIncassare)} sub="confermati" color={P.amber} />
          <Kpi label="Pipeline una tantum" value={fmtEur(pipUnaTantum)} sub="se chiudi tutti" color={P.blue} />
          <Kpi label="Pipeline mensile" value={`${fmtEur(pipMensile)}/mese`} sub="se chiudi tutti" color={P.purple} />
          <Kpi label="Risparmi" value={fmtEur(totRisparmi)} sub={`obiettivo ${fmtEur(goal)}`} color={accent} />
          <Kpi label="Conversione" value={`${conv}%`} sub="su lavorati" color={P.blue} />
        </div>
      </Sec>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Sec title="Azioni urgenti" accent={P.red}>
          <div style={{ background: "#fff", border: `1px solid ${P.border}`, borderRadius: 12, padding: 12 }}>
            {urgenti.length === 0 && <div style={{ fontSize: 12, color: P.slateL }}>Nessuna urgenza.</div>}
            {urgenti.map((t) => (
              <div key={t.id} style={{ fontSize: 12, padding: "6px 0", borderBottom: `1px solid ${P.border}` }}>
                <div style={{ color: P.navy, fontWeight: 600 }}>{t.title}</div>
                {t.date_note && <div style={{ color: P.slateL, fontSize: 10, marginTop: 2 }}>{t.date_note}</div>}
              </div>
            ))}
          </div>
        </Sec>
        <Sec title="Aggiornamenti recenti" accent={P.slateL}>
          <div style={{ background: "#fff", border: `1px solid ${P.border}`, borderRadius: 12, padding: 12 }}>
            {recenti.length === 0 && <div style={{ fontSize: 12, color: P.slateL }}>Nessun aggiornamento.</div>}
            {recenti.map((u) => (
              <div key={u.id} style={{ fontSize: 12, padding: "6px 0", borderBottom: `1px solid ${P.border}` }}>
                <div style={{ color: P.slateL, fontSize: 10 }}>{new Date(u.date).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}</div>
                <div style={{ color: P.navy }}>{u.event}</div>
              </div>
            ))}
          </div>
        </Sec>
      </div>
    </div>
  );
}
