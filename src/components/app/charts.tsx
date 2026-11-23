import type { ReactNode } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { fmtEur } from "@/lib/gestionale";

export const PALETTE = ["#0a2048", "#2f6fb5", "#38d9ff", "#8fb8e8", "#f2b84b", "#2e9e6b", "#c9606b", "#5b7aa8"];
export const STATO_COLOR: Record<string, string> = {
  da_contattare: "#8fb8e8", contattato: "#2f6fb5", in_trattativa: "#f2b84b",
  accettato: "#38d9ff", pagato: "#2e9e6b", rifiutato: "#c9606b",
};

const axis = { fontSize: 11, fill: "#5b6b86" };
const tip = { borderRadius: 12, border: "1px solid #d5e2f3", fontSize: 12 };

export function ChartCard({ title, hint, children, empty }: { title: string; hint?: string; children: ReactNode; empty?: boolean }) {
  return (
    <section className="surface p-5">
      <h3 className="hud text-muted-foreground">{title}</h3>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-3">
        {empty ? <p className="py-10 text-center text-sm text-muted-foreground">Nessun dato da mostrare.</p> : children}
      </div>
    </section>
  );
}

type Pt = { name: string; value: number; color?: string };
const fmt = (money?: boolean) => (v: number) => (money ? fmtEur(v) : String(v));

/** Barre orizzontali: ottime per categorie e nomi lunghi. */
export function BarsH({ data, money, height }: { data: Pt[]; money?: boolean; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height ?? Math.max(140, data.length * 34 + 20)}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 24, top: 0, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={120} tick={axis} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: "rgba(143,184,232,.15)" }} contentStyle={tip} formatter={(v: number) => fmt(money)(v)} />
        <Bar dataKey="value" radius={[0, 8, 8, 0]} label={{ position: "right", fontSize: 11, fill: "#0a2048", formatter: fmt(money) }}>
          {data.map((d, i) => <Cell key={d.name} fill={d.color ?? PALETTE[i % PALETTE.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Barre verticali, anche impilate (più serie). */
export function BarsV({ data, series, money, height = 220 }: {
  data: Record<string, string | number>[]; series: { key: string; label: string; color: string }[]; money?: boolean; height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3ecf7" />
        <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} />
        <YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip cursor={{ fill: "rgba(143,184,232,.15)" }} contentStyle={tip} formatter={(v: number) => fmt(money)(v)} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} stackId="a" radius={i === series.length - 1 ? [6, 6, 0, 0] : 0} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Lines({ data, series, goal, money, height = 240 }: {
  data: Record<string, string | number>[]; series: { key: string; label: string; color: string; dashed?: boolean }[];
  goal?: { value: number; label: string }; money?: boolean; height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: -4, right: 12, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3ecf7" />
        <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} />
        <YAxis tick={axis} tickLine={false} axisLine={false} tickFormatter={(v) => (money ? `${Math.round(v / 1000)}k` : String(v))} />
        <Tooltip contentStyle={tip} formatter={(v: number) => fmt(money)(v)} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {goal && <ReferenceLine y={goal.value} stroke="#c9606b" strokeDasharray="5 4" label={{ value: goal.label, fontSize: 11, fill: "#c9606b", position: "insideTopLeft" }} />}
        {series.map((s) => (
          <Line key={s.key} dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2.5} dot={false} strokeDasharray={s.dashed ? "5 4" : undefined} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data, money }: { data: Pt[]; money?: boolean }) {
  const tot = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2} stroke="none">
              {data.map((d, i) => <Cell key={d.name} fill={d.color ?? PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip contentStyle={tip} formatter={(v: number) => fmt(money)(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="min-w-0 flex-1 space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 truncate"><span className="size-2.5 shrink-0 rounded-full" style={{ background: d.color ?? PALETTE[i % PALETTE.length] }} />{d.name}</span>
            <span className="text-muted-foreground">{fmt(money)(d.value)}{tot ? ` · ${Math.round((d.value / tot) * 100)}%` : ""}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
