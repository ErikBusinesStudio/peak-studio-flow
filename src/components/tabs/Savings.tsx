import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, fmtEur, type Saving, type Settings, type SavingsTarget } from "@/lib/db";
import { P } from "@/lib/theme";
import { Sec, Btn, Field, Card } from "@/components/ui/Sec";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const PRIMARY = "#6366f1";
const AMBER = "#f59e0b";
const RED = "#ef4444";
const GREEN = "#22c55e";
const BASE = 1000; // già messo prima del ladder

const DEADLINE_FIRMA = "2026-11-30";

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.ceil(ms / 86400000));
}

function isoWeekRange(d: Date): [Date, Date] {
  const day = d.getDay() || 7;
  const mon = new Date(d);
  mon.setDate(d.getDate() - (day - 1));
  mon.setHours(0, 0, 0, 0);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 7);
  return [mon, sun];
}

function monthKey(iso: string) {
  return iso.slice(0, 7); // YYYY-MM
}

export default function Savings() {
  const qc = useQueryClient();
  const { data: savings = [] } = useQuery<Saving[]>({ queryKey: ["savings"], queryFn: api.savings.list });
  const { data: settings } = useQuery<Settings | null>({ queryKey: ["settings"], queryFn: api.settings.get });
  const { data: targets = [] } = useQuery<SavingsTarget[]>({ queryKey: ["savings_targets"], queryFn: api.savingsTargets.list });

  const goal = settings?.savings_goal ?? 10000;
  const total = savings.reduce((s, x) => s + Number(x.amount), 0);
  const pct = Math.min(100, Math.round((total / goal) * 100));
  const missing = Math.max(0, goal - total);

  const today = new Date();
  const deadlineYear = settings?.savings_deadline ? new Date(settings.savings_deadline) : new Date("2026-12-31");
  const daysToEnd = daysBetween(today, deadlineYear);
  const daysToSign = daysBetween(today, new Date(DEADLINE_FIRMA));

  // Ladder rows: cumulative
  const ladder = useMemo(() => {
    let cumTarget = BASE;
    return targets.map((t) => {
      const key = monthKey(t.month);
      const put = savings
        .filter((s) => monthKey(s.date) === key)
        .reduce((a, b) => a + Number(b.amount), 0);
      const save = Number(t.save_target ?? 0);
      cumTarget += save;
      const cumReal = BASE + savings
        .filter((s) => s.date <= t.month.slice(0, 8) + "31")
        .filter((s) => monthKey(s.date) <= key)
        .reduce((a, b) => a + Number(b.amount), 0);
      let light: "green" | "amber" | "red" = "green";
      if (cumReal < cumTarget * 0.8) light = "red";
      else if (cumReal < cumTarget) light = "amber";
      return { ...t, key, put, save, cumTarget, cumReal, light };
    });
  }, [targets, savings]);

  const currentMonthKey = today.toISOString().slice(0, 7);
  const currentTarget = targets.find((t) => monthKey(t.month) === currentMonthKey) ?? null;

  // Weekly rhythm
  const [wkStart, wkEnd] = isoWeekRange(today);
  const putThisWeek = savings
    .filter((s) => {
      const d = new Date(s.date);
      return d >= wkStart && d < wkEnd;
    })
    .reduce((a, b) => a + Number(b.amount), 0);
  const weeklyTarget = currentTarget?.save_target ? Math.round(Number(currentTarget.save_target) / 4.3) : 0;
  const wkPct = weeklyTarget > 0 ? Math.min(100, Math.round((putThisWeek / weeklyTarget) * 100)) : 0;

  // Current month "messo"
  const putThisMonth = savings
    .filter((s) => monthKey(s.date) === currentMonthKey)
    .reduce((a, b) => a + Number(b.amount), 0);
  const saveTargetMonth = Number(currentTarget?.save_target ?? 0);
  const closeTargetMonth = Number(currentTarget?.close_target ?? 0);
  const mPct = saveTargetMonth > 0 ? Math.min(100, Math.round((putThisMonth / saveTargetMonth) * 100)) : 0;

  const [amt, setAmt] = useState("");
  const [note, setNote] = useState("");
  const [dateVal, setDateVal] = useState(today.toISOString().slice(0, 10));

  const wrap = async (fn: () => Promise<unknown>, msg: string) => {
    try {
      await fn();
      qc.invalidateQueries({ queryKey: ["savings"] });
      toast.success(msg);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const lightColor = (l: string) => (l === "green" ? GREEN : l === "amber" ? AMBER : RED);

  return (
    <div>
      {/* HERO Montagna */}
      <Sec title="Vetta 10k">
        <Card style={{ background: `linear-gradient(180deg, ${P.card} 0%, ${P.navyMid} 100%)`, padding: 18 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
            {/* Mountain fill */}
            <div style={{ position: "relative", width: 90, minHeight: 190, flexShrink: 0 }}>
              <svg viewBox="0 0 100 200" width="90" height="190" style={{ display: "block" }}>
                <defs>
                  <clipPath id="mtn">
                    <polygon points="50,10 95,190 5,190" />
                  </clipPath>
                  <linearGradient id="fillGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor={PRIMARY} />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <polygon points="50,10 95,190 5,190" fill="none" stroke={P.slateL} strokeWidth="1.5" />
                <rect x="0" y={200 - (pct / 100) * 180 - 10} width="100" height={(pct / 100) * 180 + 10} fill="url(#fillGrad)" clipPath="url(#mtn)" />
                {/* Snow cap line */}
                <polygon points="50,10 65,40 35,40" fill={pct >= 85 ? "#ffffff" : "transparent"} opacity="0.9" />
              </svg>
              <div style={{ position: "absolute", top: -4, right: -4, background: PRIMARY, color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 7px", borderRadius: 999 }}>{pct}%</div>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, color: P.slateL, textTransform: "uppercase", letterSpacing: "0.12em" }}>Totale in vetta</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: P.navy, marginTop: 2, lineHeight: 1.1 }}>{fmtEur(total)}</div>
                <div style={{ fontSize: 12, color: P.slate, marginTop: 2 }}>di {fmtEur(goal)} · mancano <b style={{ color: PRIMARY }}>{fmtEur(missing)}</b></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                <div style={{ background: P.navyMid, borderRadius: 10, padding: "8px 10px", border: `1px solid ${P.border}` }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: P.navy }}>{daysToEnd}</div>
                  <div style={{ fontSize: 9, color: P.slateL, textTransform: "uppercase", letterSpacing: "0.08em" }}>gg a fine anno</div>
                </div>
                <div style={{ background: P.navyMid, borderRadius: 10, padding: "8px 10px", border: `1px solid ${P.border}` }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: AMBER }}>{daysToSign}</div>
                  <div style={{ fontSize: 9, color: P.slateL, textTransform: "uppercase", letterSpacing: "0.08em" }}>gg utili firme</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Sec>

      {/* LADDER */}
      <Sec title="Ladder mensile">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ladder.map((r) => (
            <Card key={r.key} style={{ padding: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 999, background: lightColor(r.light), flexShrink: 0, boxShadow: `0 0 8px ${lightColor(r.light)}88` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: P.navy, textTransform: "uppercase", letterSpacing: "0.06em" }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: P.slateL }}>cum. obiettivo <b style={{ color: P.navy }}>{fmtEur(r.cumTarget)}</b></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: P.slate, marginTop: 2 }}>
                    <span>da mettere <b style={{ color: P.navy }}>{fmtEur(r.save)}</b></span>
                    <span>messo <b style={{ color: lightColor(r.light) }}>{fmtEur(r.put)}</b></span>
                  </div>
                  <div style={{ height: 4, background: P.navyMid, borderRadius: 999, marginTop: 6, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, r.save > 0 ? (r.put / r.save) * 100 : 0)}%`, height: "100%", background: lightColor(r.light), transition: "width 0.4s" }} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Sec>

      {/* WEEKLY */}
      <Sec title="Ritmo settimanale">
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <div style={{ fontSize: 12, color: P.slateL, textTransform: "uppercase", letterSpacing: "0.08em" }}>Questa settimana</div>
            <div style={{ fontSize: 11, color: P.slate }}>target <b style={{ color: P.navy }}>{fmtEur(weeklyTarget)}</b></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: P.navy }}>{fmtEur(putThisWeek)}</div>
            <div style={{ fontSize: 12, color: PRIMARY, fontWeight: 800 }}>{wkPct}%</div>
          </div>
          <div style={{ height: 8, background: P.navyMid, borderRadius: 999, overflow: "hidden", marginTop: 6 }}>
            <div style={{ width: `${wkPct}%`, height: "100%", background: `linear-gradient(90deg, ${PRIMARY}, #a855f7)`, transition: "width 0.4s" }} />
          </div>
        </Card>
      </Sec>

      {/* DOPPIO BINARIO */}
      <Sec title={`Mese corrente${currentTarget?.label ? " · " + currentTarget.label : ""}`}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Card style={{ padding: 12 }}>
            <div style={{ fontSize: 10, color: P.slateL, textTransform: "uppercase", letterSpacing: "0.08em" }}>Da chiudere</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: AMBER, marginTop: 4 }}>{fmtEur(closeTargetMonth)}</div>
            <div style={{ fontSize: 10, color: P.slateL, marginTop: 6, lineHeight: 1.35 }}>Le firme di oggi diventano cassa tra ~1 mese.</div>
          </Card>
          <Card style={{ padding: 12 }}>
            <div style={{ fontSize: 10, color: P.slateL, textTransform: "uppercase", letterSpacing: "0.08em" }}>Da risparmiare</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: PRIMARY, marginTop: 4 }}>{fmtEur(saveTargetMonth)}</div>
            <div style={{ fontSize: 10, color: P.slate, marginTop: 6 }}>messo <b style={{ color: P.navy }}>{fmtEur(putThisMonth)}</b> · {mPct}%</div>
            <div style={{ height: 4, background: P.navyMid, borderRadius: 999, marginTop: 6, overflow: "hidden" }}>
              <div style={{ width: `${mPct}%`, height: "100%", background: PRIMARY }} />
            </div>
          </Card>
        </div>
      </Sec>

      {/* LEDGER */}
      <Sec title="Depositi">
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Field placeholder="Importo €" type="number" value={amt} onChange={(e) => setAmt(e.target.value)} />
            <Field placeholder="Nota (opzionale)" value={note} onChange={(e) => setNote(e.target.value)} />
            <Field type="date" value={dateVal} onChange={(e) => setDateVal(e.target.value)} />
            <Btn disabled={!amt} onClick={async () => {
              await wrap(() => api.savings.create({ amount: Number(amt), note: note || null, date: dateVal }), "Deposito aggiunto");
              setAmt(""); setNote(""); setDateVal(new Date().toISOString().slice(0, 10));
            }}>+ Aggiungi risparmio</Btn>
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {savings.map((s) => (
            <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.note || "Versamento"}</div>
                <div style={{ fontSize: 10, color: P.slateL }}>{new Date(s.date).toLocaleDateString("it-IT")}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: PRIMARY }}>+{fmtEur(Number(s.amount))}</div>
                <button onClick={() => wrap(() => api.savings.remove(s.id), "Eliminato")} style={{ background: "transparent", border: 0, color: P.red, cursor: "pointer", fontSize: 18 }}>×</button>
              </div>
            </Card>
          ))}
        </div>
      </Sec>

      {/* REGOLE */}
      <Sec title="Protocollo Vetta 10k">
        <Card style={{ background: P.navyMid, borderLeft: `3px solid ${PRIMARY}` }}>
          <ul style={{ margin: 0, paddingLeft: 18, color: P.slate, fontSize: 12, lineHeight: 1.7 }}>
            <li>Di ogni incasso, il <b style={{ color: P.navy }}>massimo possibile</b> va in Vetta 10k.</li>
            <li><b style={{ color: P.navy }}>1 firma a settimana</b> minimo.</li>
            <li>Deadline firme utili: <b style={{ color: AMBER }}>30 novembre</b>.</li>
            <li>Ogni <b style={{ color: P.navy }}>domenica</b> aggiorna il deposito e controlla il semaforo.</li>
          </ul>
        </Card>
      </Sec>
    </div>
  );
}
