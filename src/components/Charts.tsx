import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { P } from "@/lib/theme";
import type { Income, Cost } from "@/lib/db";

const MONTHS = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

function monthKey(d: string | null | undefined): string | null {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return null;
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

export function IncomeVsCostsChart({ incomes, costs, height = 260 }: { incomes: Income[]; costs: Cost[]; height?: number }) {
  const map = new Map<string, { key: string; label: string; entrate: number; costi: number }>();
  const push = (k: string | null, field: "entrate" | "costi", amount: number) => {
    if (!k) return;
    if (!map.has(k)) {
      const [y, m] = k.split("-");
      map.set(k, { key: k, label: `${MONTHS[Number(m) - 1]} ${y.slice(2)}`, entrate: 0, costi: 0 });
    }
    map.get(k)![field] += amount;
  };
  incomes.filter((i) => i.status === "incassato").forEach((i) => push(monthKey(i.date), "entrate", Number(i.amount)));
  costs.forEach((c) => push(monthKey(c.date), "costi", Number(c.amount)));

  const data = [...map.values()].sort((a, b) => a.key.localeCompare(b.key));

  if (data.length === 0) {
    return <div style={{ fontSize: 12, color: P.slateL, padding: 16, textAlign: "center" }}>Nessun dato temporale disponibile.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 6, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid stroke={P.border} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" stroke={P.slateL} tick={{ fontSize: 10, fill: P.slateL }} />
        <YAxis stroke={P.slateL} tick={{ fontSize: 10, fill: P.slateL }} />
        <Tooltip
          contentStyle={{ background: P.navyMid, border: `1px solid ${P.border}`, borderRadius: 8, color: P.navy, fontSize: 12 }}
          labelStyle={{ color: P.navy }}
          formatter={(v: number, n: string) => [`€${v.toLocaleString("it-IT")}`, n === "entrate" ? "Entrate" : "Costi"]}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: P.slate }} />
        <Line type="monotone" dataKey="entrate" name="Entrate" stroke={P.green} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="costi" name="Costi" stroke={P.red} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
