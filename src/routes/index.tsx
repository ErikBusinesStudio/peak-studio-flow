import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/db";
import { cn } from "@/lib/utils";
import Overview from "@/components/tabs/Overview";
import Calendar from "@/components/tabs/Calendar";
import Pipeline from "@/components/tabs/Pipeline";
import Managements from "@/components/tabs/Managements";
import Clients from "@/components/tabs/Clients";
import Finances from "@/components/tabs/Finances";
import Savings from "@/components/tabs/Savings";
import Todos from "@/components/tabs/Todos";
import Kpi from "@/components/tabs/Kpi";
import SettingsTab from "@/components/tabs/Settings";
import Diary from "@/components/tabs/Diary";

export const Route = createFileRoute("/")({ component: Home });

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "calendar", label: "Calendario" },
  { id: "pipeline", label: "Pipeline" },
  { id: "managements", label: "Gestioni" },
  { id: "clients", label: "Clienti" },
  { id: "finances", label: "Finanze" },
  { id: "diary", label: "Diario" },
  { id: "savings", label: "Risparmi" },
  { id: "todos", label: "To-Do" },
  { id: "kpi", label: "KPI" },
  { id: "settings", label: "Impostazioni" },
] as const;

type TabId = typeof TABS[number]["id"];

function Home() {
  const [tab, setTab] = useState<TabId>("overview");
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: api.settings.get });
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current?.querySelector<HTMLButtonElement>(`[data-tab="${tab}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [tab]);

  const primary = settings?.primary_color ?? "#6366f1";

  return (
    <div className="min-h-screen bg-background pb-16" style={{ ["--user-primary" as string]: primary }}>
      <header className="sticky top-0 z-40 bg-navy text-navy-foreground shadow-sm">
        <div className="mx-auto max-w-3xl px-4 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-white/50">Peak Studio</p>
              <h1 className="text-xl font-semibold">{settings?.dashboard_name ?? "Peak Studio OS"}</h1>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-widest text-white/50">Founder</p>
              <p className="text-sm font-medium">Erik</p>
            </div>
          </div>
        </div>
        <div ref={scrollerRef} className="no-scrollbar flex overflow-x-auto gap-1 px-3 pb-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-tab={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-white text-navy"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        {tab === "overview" && <Overview />}
        {tab === "calendar" && <Calendar />}
        {tab === "pipeline" && <Pipeline />}
        {tab === "managements" && <Managements />}
        {tab === "clients" && <Clients />}
        {tab === "finances" && <Finances />}
        {tab === "diary" && <Diary />}
        {tab === "savings" && <Savings />}
        {tab === "todos" && <Todos />}
        {tab === "kpi" && <Kpi />}
        {tab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}
