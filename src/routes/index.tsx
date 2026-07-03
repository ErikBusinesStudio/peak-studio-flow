import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/db";
import { P } from "@/lib/theme";
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
  { id: "overview", label: "Overview", icon: "⛰" },
  { id: "diary", label: "Diario", icon: "📖" },
  { id: "calendar", label: "Calendario", icon: "📅" },
  { id: "pipeline", label: "Pipeline", icon: "🎯" },
  { id: "managements", label: "Gestioni", icon: "🔄" },
  { id: "clients", label: "Clienti", icon: "👥" },
  { id: "finances", label: "Finanze", icon: "💰" },
  { id: "savings", label: "Risparmi", icon: "🏦" },
  { id: "todos", label: "To-Do", icon: "✅" },
  { id: "kpi", label: "KPI", icon: "📊" },
  { id: "settings", label: "Impostazioni", icon: "⚙️" },
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

  const accent = settings?.primary_color ?? P.accent;
  const name = settings?.dashboard_name ?? "Basecamp";

  return (
    <div style={{ minHeight: "100vh", background: P.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#0f172a", padding: "14px 0" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⛰</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 15, lineHeight: 1 }}>{name}</div>
            <div style={{ color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>Peak Studio · gestione</div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav style={{ background: P.navyMid, borderBottom: `1px solid ${P.navyLt}` }}>
        <div ref={scrollerRef} className="no-scrollbar" style={{ maxWidth: 960, margin: "0 auto", display: "flex", overflowX: "auto" }}>
          {TABS.map((t) => {
            const isActive = tab === t.id;
            return (
              <button key={t.id} data-tab={t.id} onClick={() => setTab(t.id)}
                style={{
                  flexShrink: 0, padding: "11px 13px", fontSize: 12,
                  color: isActive ? accent : P.slate,
                  fontWeight: isActive ? 800 : 500,
                  borderBottom: `2px solid ${isActive ? accent : "transparent"}`,
                  background: "transparent", border: 0, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  borderTop: 0, borderLeft: 0, borderRight: 0,
                }}>
                <span style={{ fontSize: 13 }}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "20px 16px" }}>
        {tab === "overview" && <Overview />}
        {tab === "diary" && <Diary />}
        {tab === "calendar" && <Calendar />}
        {tab === "pipeline" && <Pipeline />}
        {tab === "managements" && <Managements />}
        {tab === "clients" && <Clients />}
        {tab === "finances" && <Finances />}
        {tab === "savings" && <Savings />}
        {tab === "todos" && <Todos />}
        {tab === "kpi" && <Kpi />}
        {tab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}
