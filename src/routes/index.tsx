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
import Charts from "@/components/tabs/Charts";
import logoAsset from "@/assets/peak-logo.png.asset.json";
import bgAsset from "@/assets/peak-bg.png.asset.json";

export const Route = createFileRoute("/")({ component: Home });

const TABS = [
  { id: "overview", label: "Overview", icon: "⛰" },
  { id: "charts", label: "Grafici", icon: "📈" },
  { id: "diary", label: "Diario", icon: "📖" },
  { id: "calendar", label: "Calendario", icon: "📅" },
  { id: "pipeline", label: "Pipeline", icon: "🎯" },
  { id: "managements", label: "Gestioni", icon: "🔄" },
  { id: "clients", label: "Clienti", icon: "👥" },
  { id: "finances", label: "Finanze", icon: "💰" },
  { id: "savings", label: "Vetta 10k", icon: "⛰" },
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
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(180deg, rgba(26,8,16,0.88) 0%, rgba(26,8,16,0.94) 100%), url(${bgAsset.url}) center/cover fixed`,
      backgroundColor: P.bg,
    }}>
      {/* Header */}
      <header style={{
        background: `linear-gradient(180deg, rgba(20,6,12,0.85) 0%, rgba(26,8,16,0.4) 100%)`,
        borderBottom: `1px solid ${P.navyLt}`,
        padding: "14px 0",
        backdropFilter: "blur(6px)",
      }}>
        <div className="app-header-inner" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <img src={logoAsset.url} alt="Peak Studio" style={{ height: 44, width: "auto", flexShrink: 0, filter: `drop-shadow(0 4px 14px ${accent}66)` }} />
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
      <nav style={{ background: "rgba(20,6,12,0.9)", backdropFilter: "blur(6px)", borderBottom: `1px solid ${P.navyLt}`, position: "sticky", top: 0, zIndex: 20 }}>
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
        {tab === "charts" && <Charts />}
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
