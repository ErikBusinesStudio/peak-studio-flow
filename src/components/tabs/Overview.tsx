import { Card, CardContent } from "@/components/ui/card";
import { fmtEur } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/db";
import { TrendingUp, TrendingDown, PiggyBank, Clock, Zap, Repeat } from "lucide-react";

const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

function Kpi({ label, value, icon: Icon, tone = "default" }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; tone?: "default" | "good" | "bad" }) {
  const toneCls = tone === "good" ? "text-success" : tone === "bad" ? "text-destructive" : "text-primary";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{label}</p>
          <Icon className={`h-4 w-4 ${toneCls}`} />
        </div>
        <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function Overview() {
  const { data: incomes = [] } = useQuery({ queryKey: ["incomes"], queryFn: api.incomes.list });
  const { data: costs = [] } = useQuery({ queryKey: ["costs"], queryFn: api.costs.list });
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: api.projects.list });
  const { data: managements = [] } = useQuery({ queryKey: ["managements"], queryFn: api.managements.list });
  const { data: savings = [] } = useQuery({ queryKey: ["savings"], queryFn: api.savings.list });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: api.settings.get });

  const totalIncome = (incomes ?? []).reduce((s, i) => s + Number(i.amount), 0);
  const totalCost = (costs ?? []).reduce((s, c) => s + Number(c.amount), 0);
  const pipelineOneShot = (projects ?? []).filter((p) => p.stage !== "vinto" && p.stage !== "perso").reduce((s, p) => s + Number(p.amount), 0);
  const monthlyRecurring = (managements ?? []).filter((m) => m.active).reduce((s, m) => s + Number(m.monthly_amount), 0);
  const toCollect = pipelineOneShot;
  const savingsTotal = (savings ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const monthIncome = (incomes ?? []).filter((i) => { const d = new Date(i.date); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; }).reduce((s, i) => s + Number(i.amount), 0);

  const goal = Number(settings?.savings_goal ?? 10000);
  const pct = Math.min(100, Math.round((savingsTotal / goal) * 100));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Panoramica</h2>
        <p className="text-sm text-muted-foreground">Snapshot rapido dell'agenzia</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Kpi label="Incassato totale" value={fmtEur(totalIncome)} icon={TrendingUp} tone="good" />
        <Kpi label="Da incassare" value={fmtEur(toCollect)} icon={Clock} />
        <Kpi label="Pipeline una tantum" value={fmtEur(pipelineOneShot)} icon={Zap} />
        <Kpi label="MRR (gestioni)" value={fmtEur(monthlyRecurring)} icon={Repeat} />
        <Kpi label="Costi totali" value={fmtEur(totalCost)} icon={TrendingDown} tone="bad" />
        <Kpi label="Questo mese" value={fmtEur(monthIncome)} icon={TrendingUp} />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Road to {fmtEur(goal)}</p>
            <p className="text-sm text-primary font-semibold">{pct}%</p>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><PiggyBank className="h-3 w-3" /> {fmtEur(savingsTotal)}</span>
            <span>Obiettivo: {fmtEur(goal)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
