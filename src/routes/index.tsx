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
  const name = (settings?.dashboard_name ?? "Peak Studio").toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: P.bg }}>
      {/* Header */}
      <header style={{
        background: `linear-gradient(180deg, ${P.navyMid} 0%, ${P.bg} 100%)`,
        borderBottom: `1px solid ${P.navyLt}`,
        padding: "14px 0",
      }}>
        <div className="app-header-inner" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `linear-gradient(135deg, ${accent}, #7c1d3f)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: `0 4px 20px ${accent}55`, flexShrink: 0,
          }}>⛰</div>
          <div style={{ minWidth: 0 }}>
            <div className="display-font app-header-title" style={{ color: P.navy, fontWeight: 400, fontSize: 18, lineHeight: 1, letterSpacing: "0.14em" }}>{name}</div>
            <div className="app-header-sub" style={{ color: P.slateL, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 4 }}>Dashboard · Peak Studio</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 999, background: P.green, boxShadow: `0 0 8px ${P.green}` }} />
            <div style={{ color: P.slateL, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em" }}>Live</div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav style={{ background: P.navyMid, borderBottom: `1px solid ${P.navyLt}`, position: "sticky", top: 0, zIndex: 20 }}>
        <div ref={scrollerRef} className="no-scrollbar" style={{ maxWidth: 1080, margin: "0 auto", display: "flex", overflowX: "auto" }}>
          {TABS.map((t) => {
            const isActive = tab === t.id;
            return (
              <button key={t.id} data-tab={t.id} onClick={() => setTab(t.id)}
                className="app-tab-btn"
                style={{
                  flexShrink: 0, padding: "12px 16px", fontSize: 12,
                  color: isActive ? P.navy : P.slateL,
                  fontWeight: isActive ? 700 : 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  borderBottom: `2px solid ${isActive ? accent : "transparent"}`,
                  background: "transparent", border: 0, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 7,
                  borderTop: 0, borderLeft: 0, borderRight: 0,
                  borderBottomWidth: 2, borderBottomStyle: "solid", borderBottomColor: isActive ? accent : "transparent",
                  transition: "color 0.15s",
                }}>
                <span style={{ fontSize: 14 }}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="app-main" style={{ maxWidth: 1080, margin: "0 auto", padding: "22px 20px" }}>
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
      </main>
    </div>
  );
}
