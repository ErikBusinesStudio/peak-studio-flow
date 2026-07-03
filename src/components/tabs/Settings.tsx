import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Settings } from "@/lib/db";
import { P } from "@/lib/theme";
import { Sec, Btn, Field, Card } from "@/components/ui/Sec";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f59e0b", "#10b981", "#06b6d4", "#0f172a"];

export default function SettingsTab() {
  const qc = useQueryClient();
  const { data: settings } = useQuery<Settings | null>({ queryKey: ["settings"], queryFn: api.settings.get });
  const [name, setName] = useState(""); const [goal, setGoal] = useState(""); const [deadline, setDeadline] = useState("");
  const [split, setSplit] = useState(60); const [color, setColor] = useState<string>(P.accent);

  useEffect(() => {
    if (!settings) return;
    setName(settings.dashboard_name); setGoal(String(settings.savings_goal));
    setDeadline(settings.savings_deadline ?? ""); setSplit(settings.moto_split); setColor(settings.primary_color);
  }, [settings]);

  return (
    <div>
      <Sec title="Impostazioni">
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Row label="Nome dashboard"><Field value={name} onChange={(e) => setName(e.target.value)} /></Row>
            <Row label="Colore principale">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setColor(c)}
                    style={{ width: 36, height: 36, borderRadius: 999, background: c, border: color === c ? `3px solid ${P.navy}` : `1px solid ${P.border}`, cursor: "pointer" }} />
                ))}
              </div>
            </Row>
            <Row label="Obiettivo risparmi (€)"><Field type="number" value={goal} onChange={(e) => setGoal(e.target.value)} /></Row>
            <Row label="Deadline"><Field type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></Row>
            <Row label={`Moto ${split}% · Investimento ${100 - split}%`}>
              <input type="range" min={0} max={100} step={5} value={split} onChange={(e) => setSplit(Number(e.target.value))} style={{ width: "100%" }} />
            </Row>
            <Btn onClick={async () => {
              try {
                await api.settings.update({ dashboard_name: name, primary_color: color, savings_goal: Number(goal), savings_deadline: deadline || null, moto_split: split });
                qc.invalidateQueries({ queryKey: ["settings"] });
                toast.success("Salvato");
              } catch (e) { toast.error((e as Error).message); }
            }}>Salva</Btn>
          </div>
        </Card>
      </Sec>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: P.slate, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}
