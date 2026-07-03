import { useQuery } from "@tanstack/react-query";
import { api, fmtEur } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";

export default function KpiTab() {
  const { data: incomes = [] } = useQuery({ queryKey: ["incomes"], queryFn: api.incomes.list });
  const { data: costs = [] } = useQuery({ queryKey: ["costs"], queryFn: api.costs.list });
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: api.projects.list });
  const { data: managements = [] } = useQuery({ queryKey: ["managements"], queryFn: api.managements.list });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });
  const { data: savings = [] } = useQuery({ queryKey: ["savings"], queryFn: api.savings.list });

  const totalIn = (incomes ?? []).reduce((s, i) => s + Number(i.amount), 0);
  const totalOut = (costs ?? []).reduce((s, c) => s + Number(c.amount), 0);
  const net = totalIn - totalOut;
  const margin = totalIn > 0 ? Math.round((net / totalIn) * 100) : 0;
  const mrr = (managements ?? []).filter((m) => m.active).reduce((s, m) => s + Number(m.monthly_amount), 0);
  const arr = mrr * 12;
  const pipelineValue = (projects ?? []).filter((p) => p.stage !== "vinto" && p.stage !== "perso").reduce((s, p) => s + Number(p.amount), 0);
  const wonValue = (projects ?? []).filter((p) => p.stage === "vinto").reduce((s, p) => s + Number(p.amount), 0);
  const totalProjects = (projects ?? []).length;
  const wonProjects = (projects ?? []).filter((p) => p.stage === "vinto").length;
  const winRate = totalProjects > 0 ? Math.round((wonProjects / totalProjects) * 100) : 0;
  const activeClients = (clients ?? []).filter((c) => c.status === "acquisito").length;
  const pendingClients = (clients ?? []).filter((c) => c.status === "in_attesa").length;
  const toContact = (clients ?? []).filter((c) => c.status === "da_contattare").length;
  const savingsTotal = (savings ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const arpu = activeClients > 0 ? Math.round(mrr / activeClients) : 0;

  const kpis = [
    { label: "Incassato", value: fmtEur(totalIn) },
    { label: "Costi", value: fmtEur(totalOut) },
    { label: "Netto", value: fmtEur(net) },
    { label: "Margine", value: `${margin}%` },
    { label: "MRR", value: fmtEur(mrr) },
    { label: "ARR", value: fmtEur(arr) },
    { label: "Pipeline attiva", value: fmtEur(pipelineValue) },
    { label: "Vinto", value: fmtEur(wonValue) },
    { label: "Win rate", value: `${winRate}%` },
    { label: "Clienti attivi", value: String(activeClients) },
    { label: "ARPU / mese", value: fmtEur(arpu) },
    { label: "In attesa", value: String(pendingClients) },
    { label: "Da contattare", value: String(toContact) },
    { label: "Risparmi", value: fmtEur(savingsTotal) },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">KPI</h2>
        <p className="text-sm text-muted-foreground">Tutti gli indicatori chiave</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((k) => (
          <Card key={k.label}><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="mt-1 text-xl font-semibold tracking-tight">{k.value}</p>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
