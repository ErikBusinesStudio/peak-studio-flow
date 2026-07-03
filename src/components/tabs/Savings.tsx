import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, fmtEur, type Saving, type Settings } from "@/lib/db";
import { P } from "@/lib/theme";
import { Sec, Btn, Field, Card } from "@/components/ui/Sec";
import { useState } from "react";
import { toast } from "sonner";

export default function Savings() {
  const qc = useQueryClient();
  const { data: savings = [] } = useQuery<Saving[]>({ queryKey: ["savings"], queryFn: api.savings.list });
  const { data: settings } = useQuery<Settings | null>({ queryKey: ["settings"], queryFn: api.settings.get });

  const goal = settings?.savings_goal ?? 10000;
  const motoSplit = settings?.moto_split ?? 60;
  const total = savings.reduce((s, x) => s + Number(x.amount), 0);
  const pct = Math.min(100, Math.round((total / goal) * 100));
  const moto = total * (motoSplit / 100);
  const inv = total - moto;

  const [amt, setAmt] = useState(""); const [note, setNote] = useState("");

  const wrap = async (fn: () => Promise<unknown>, msg: string) => {
    try { await fn(); qc.invalidateQueries({ queryKey: ["savings"] }); toast.success(msg); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div>
      <Sec title={`Road to ${fmtEur(goal)}`}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: P.navy }}>{fmtEur(total)}</div>
            <div style={{ fontSize: 12, color: P.slate, fontWeight: 700 }}>{pct}%</div>
          </div>
          <div style={{ height: 12, background: P.border, borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${P.accent}, ${P.purple})`, transition: "width 0.4s" }} />
          </div>
          {settings?.savings_deadline && (
            <div style={{ fontSize: 11, color: P.slateL, marginTop: 8 }}>Deadline: {new Date(settings.savings_deadline).toLocaleDateString("it-IT")}</div>
          )}
        </Card>
      </Sec>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        <Card style={{ borderTop: `3px solid ${P.amber}` }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", color: P.slateL, fontWeight: 700 }}>Moto · {motoSplit}%</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: P.amber, marginTop: 4 }}>{fmtEur(moto)}</div>
        </Card>
        <Card style={{ borderTop: `3px solid ${P.accent}` }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", color: P.slateL, fontWeight: 700 }}>Investimento · {100 - motoSplit}%</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: P.accent, marginTop: 4 }}>{fmtEur(inv)}</div>
        </Card>
      </div>

      <Sec title="Aggiungi versamento">
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Field placeholder="Importo €" type="number" value={amt} onChange={(e) => setAmt(e.target.value)} />
            <Field placeholder="Nota (opzionale)" value={note} onChange={(e) => setNote(e.target.value)} />
            <Btn disabled={!amt} onClick={async () => {
              await wrap(() => api.savings.create({ amount: Number(amt), note: note || null, date: new Date().toISOString().slice(0, 10) }), "Aggiunto");
              setAmt(""); setNote("");
            }}>Versa</Btn>
          </div>
        </Card>
      </Sec>

      <Sec title="Storico">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {savings.map((s) => (
            <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.navy }}>{s.note || "Versamento"}</div>
                <div style={{ fontSize: 11, color: P.slateL }}>{new Date(s.date).toLocaleDateString("it-IT")}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: P.accent }}>+{fmtEur(Number(s.amount))}</div>
                <button onClick={() => wrap(() => api.savings.remove(s.id), "Eliminato")} style={{ background: "transparent", border: 0, color: P.red, cursor: "pointer" }}>×</button>
              </div>
            </Card>
          ))}
        </div>
      </Sec>
    </div>
  );
}
