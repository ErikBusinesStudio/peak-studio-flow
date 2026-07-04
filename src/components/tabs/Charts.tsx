import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area } from "recharts";
import { api, type Client, type Income, type Cost, type Saving } from "@/lib/db";
import { P, STATO_CFG } from "@/lib/theme";
import { Sec, Card } from "@/components/ui/Sec";
import { IncomeVsCostsChart } from "@/components/Charts";

export default function Charts() {
  const { data: incomes = [] } = useQuery<Income[]>({ queryKey: ["incomes"], queryFn: api.incomes.list });
  const { data: costs = [] } = useQuery<Cost[]>({ queryKey: ["costs"], queryFn: api.costs.list });
  const { data: clients = [] } = useQuery<Client[]>({ queryKey: ["clients"], queryFn: api.clients.list });
  const { data: savings = [] } = useQuery<Saving[]>({ queryKey: ["savings"], queryFn: api.savings.list });

  // Clients per status
  const statusData = (["acquisito", "in_attesa", "da_contattare", "rifiutato"] as const).map((s) => ({
    name: STATO_CFG[s].label,
    value: clients.filter((c) => c.status === s).length,
    color: STATO_CFG[s].dot,
  })).filter((x) => x.value > 0);

  // Top clients by collected
  const topClients = [...clients]
    .filter((c) => Number(c.collected) > 0)
    .sort((a, b) => Number(b.collected) - Number(a.collected))
    .slice(0, 8)
    .map((c) => ({ name: c.name.length > 14 ? c.name.slice(0, 12) + "…" : c.name, valore: Number(c.collected) }));

  // Savings cumulative
  const savingsSorted = [...savings].sort((a, b) => a.date.localeCompare(b.date));
  let cum = 0;
  const savingsData = savingsSorted.map((s) => {
    cum += Number(s.amount);
    return { date: new Date(s.date).toLocaleDateString("it-IT", { day: "2-digit", month: "short" }), totale: cum };
  });

  return (
    <div>
      <Sec title="Entrate vs Costi (timeline)" accent={P.accent}>
        <Card>
          <IncomeVsCostsChart incomes={incomes} costs={costs} height={280} />
        </Card>
      </Sec>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }} className="ch-grid">
        <Sec title="Distribuzione clienti" accent={P.blue}>
          <Card>
            {statusData.length === 0 ? (
              <div style={{ fontSize: 12, color: P.slateL, textAlign: "center", padding: 16 }}>Nessun cliente.</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                    {statusData.map((e, i) => <Cell key={i} fill={e.color} stroke={P.card} strokeWidth={2} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: P.navyMid, border: `1px solid ${P.border}`, borderRadius: 8, color: P.navy, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: P.slate }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Sec>

        <Sec title="Top clienti per incasso" accent={P.green}>
          <Card>
            {topClients.length === 0 ? (
              <div style={{ fontSize: 12, color: P.slateL, textAlign: "center", padding: 16 }}>Nessun incasso registrato.</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topClients} margin={{ top: 6, right: 12, left: -8, bottom: 30 }}>
                  <CartesianGrid stroke={P.border} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke={P.slateL} tick={{ fontSize: 10, fill: P.slateL }} angle={-30} textAnchor="end" interval={0} height={50} />
                  <YAxis stroke={P.slateL} tick={{ fontSize: 10, fill: P.slateL }} />
                  <Tooltip contentStyle={{ background: P.navyMid, border: `1px solid ${P.border}`, borderRadius: 8, color: P.navy, fontSize: 12 }} formatter={(v: number) => [`€${v.toLocaleString("it-IT")}`, "Incassato"]} />
                  <Bar dataKey="valore" fill={P.green} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Sec>
      </div>

      <Sec title="Crescita risparmi (cumulativo)" accent={P.purple}>
        <Card>
          {savingsData.length === 0 ? (
            <div style={{ fontSize: 12, color: P.slateL, textAlign: "center", padding: 16 }}>Nessun versamento.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={savingsData} margin={{ top: 6, right: 12, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="sav" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={P.accent} stopOpacity={0.7} />
                    <stop offset="100%" stopColor={P.purple} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={P.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke={P.slateL} tick={{ fontSize: 10, fill: P.slateL }} />
                <YAxis stroke={P.slateL} tick={{ fontSize: 10, fill: P.slateL }} />
                <Tooltip contentStyle={{ background: P.navyMid, border: `1px solid ${P.border}`, borderRadius: 8, color: P.navy, fontSize: 12 }} formatter={(v: number) => [`€${v.toLocaleString("it-IT")}`, "Totale"]} />
                <Area type="monotone" dataKey="totale" stroke={P.accent} strokeWidth={2.5} fill="url(#sav)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
      </Sec>
      <style>{`@media (min-width: 720px){ .ch-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  );
}
