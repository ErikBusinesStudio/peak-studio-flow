import { useQuery } from "@tanstack/react-query";
import { api, fmtEur, type Income, type Project, type Client, type Cost, type Saving, type Settings } from "@/lib/db";
import { P } from "@/lib/theme";
import { Sec, Card } from "@/components/ui/Sec";

export default function Kpi() {
  const { data: incomes = [] } = useQuery<Income[]>({ queryKey: ["incomes"], queryFn: api.incomes.list });
  const { data: costs = [] } = useQuery<Cost[]>({ queryKey: ["costs"], queryFn: api.costs.list });
  const { data: projects = [] } = useQuery<Project[]>({ queryKey: ["projects"], queryFn: api.projects.list });
  const { data: clients = [] } = useQuery<Client[]>({ queryKey: ["clients"], queryFn: api.clients.list });
  const { data: savings = [] } = useQuery<Saving[]>({ queryKey: ["savings"], queryFn: api.savings.list });
  const { data: settings } = useQuery<Settings | null>({ queryKey: ["settings"], queryFn: api.settings.get });

  const inc = incomes.filter((i) => i.status === "incassato").reduce((s, i) => s + Number(i.amount), 0);
  const daInc = incomes.filter((i) => i.status === "da_incassare").reduce((s, i) => s + Number(i.amount), 0);
  const cTot = costs.reduce((s, c) => s + Number(c.amount), 0);
  const netto = inc - cTot;
  const pipOnce = projects.reduce((s, p) => s + p.services_one_off.reduce((a, x) => a + Number(x.i), 0), 0);
  const pipMon = projects.reduce((s, p) => s + p.services_monthly.reduce((a, x) => a + Number(x.i), 0), 0);
  const acq = clients.filter((c) => c.status === "acquisito").length;
  const daContact = clients.filter((c) => c.status === "da_contattare").length;
  const lavorati = clients.length - daContact;
  const conv = lavorati ? Math.round((acq / lavorati) * 100) : 0;
  const totSav = savings.reduce((s, x) => s + Number(x.amount), 0);
  const goal = settings?.savings_goal ?? 10000;
  const progresso = Math.round((totSav / goal) * 100);

  const items = [
    { label: "Incassato", value: fmtEur(inc), color: P.green },
    { label: "Da incassare", value: fmtEur(daInc), color: P.amber },
    { label: "Costi totali", value: fmtEur(cTot), color: P.red },
    { label: "Netto", value: fmtEur(netto), color: netto >= 0 ? P.green : P.red },
    { label: "Pipeline una tantum", value: fmtEur(pipOnce), color: P.blue },
    { label: "Pipeline mensile", value: `${fmtEur(pipMon)}/m`, color: P.purple },
    { label: "Clienti acquisiti", value: String(acq), color: P.green },
    { label: "Da contattare", value: String(daContact), color: P.blue },
    { label: "Conversione", value: `${conv}%`, color: P.accent },
    { label: "Risparmi", value: fmtEur(totSav), color: P.accent },
    { label: "Obiettivo", value: fmtEur(goal), color: P.slate },
    { label: "Progresso", value: `${progresso}%`, color: P.purple },
  ];

  return (
    <div>
      <Sec title="Indicatori chiave">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(145px,1fr))", gap: 10 }}>
          {items.map((it) => (
            <Card key={it.label} style={{ borderTop: `3px solid ${it.color}`, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", color: P.slateL, fontWeight: 700, letterSpacing: "0.05em" }}>{it.label}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: it.color, marginTop: 4 }}>{it.value}</div>
            </Card>
          ))}
        </div>
      </Sec>
    </div>
  );
}
