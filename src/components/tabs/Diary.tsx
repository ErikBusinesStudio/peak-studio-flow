import { useState } from "react";
import { P, DIARY_CATS } from "@/lib/theme";
import { Sec, Btn, Area, Card } from "@/components/ui/Sec";
import { api, fmtDate, type DiaryEntry } from "@/lib/db";
import { useServerFn } from "@tanstack/react-start";
import { analyzeDiary, type DiaryAnalysis, type DiaryAction, type DiaryCategory } from "@/lib/diary-ai.functions";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function actionLabel(a: DiaryAction): string {
  switch (a.type) {
    case "cliente": return `Aggiungere cliente "${a.name}"${a.status ? ` (${a.status.replace("_", " ")})` : ""}?`;
    case "entrata": return `Registrare entrata "${a.description}" da €${a.amount}?`;
    case "task": return `Aggiungere task "${a.title}"${a.priority ? ` (priorità ${a.priority})` : ""}?`;
    case "evento": return `Aggiungere evento "${a.title}" il ${a.date}${a.time ? ` alle ${a.time}` : ""}?`;
  }
}

export default function Diary() {
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [pending, setPending] = useState<{ content: string; analysis: DiaryAnalysis } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});
  const [skipped, setSkipped] = useState<Record<number, boolean>>({});
  const [confirmed, setConfirmed] = useState<Record<number, boolean>>({});

  const { data: entries = [] } = useQuery<DiaryEntry[]>({ queryKey: ["diary"], queryFn: api.diary.list });
  const analyze = useServerFn(analyzeDiary);
  const qc = useQueryClient();

  async function runAnalyze() {
    if (!text.trim()) return;
    setError(null); setAnalyzing(true);
    try {
      const res = await analyze({ data: { content: text } });
      setPending({ content: text, analysis: res });
      setSkipped({}); setConfirmed({});
    } catch (e) {
      setError((e as Error).message || "Errore imprevisto");
    } finally { setAnalyzing(false); }
  }

  async function confirmAction(idx: number, a: DiaryAction) {
    try {
      if (a.type === "cliente") {
        const status = ["acquisito", "in_attesa", "da_contattare", "rifiutato"].includes(a.status || "") ? a.status : "da_contattare";
        await api.clients.create({ name: a.name, status: status as never, notes: a.notes ?? null });
        qc.invalidateQueries({ queryKey: ["clients"] });
      } else if (a.type === "entrata") {
        await api.incomes.create({ description: a.description, amount: a.amount, date_label: a.date || new Date().toLocaleDateString("it-IT"), status: "incassato" });
        qc.invalidateQueries({ queryKey: ["incomes"] });
      } else if (a.type === "task") {
        await api.todos.create({ title: a.title, priority: (a.priority as never) || "media", done: false });
        qc.invalidateQueries({ queryKey: ["todos"] });
      } else if (a.type === "evento") {
        await api.events.create({ title: a.title, date: a.date, time: a.time ?? null, notes: a.notes ?? null });
        qc.invalidateQueries({ queryKey: ["events"] });
      }
      setConfirmed((s) => ({ ...s, [idx]: true }));
      toast.success("Azione confermata");
    } catch (e) { toast.error((e as Error).message); }
  }

  async function saveEntry() {
    if (!pending) return;
    try {
      await api.diary.create({ content: pending.content, date: new Date().toISOString().slice(0, 10), ai_analysis: JSON.stringify(pending.analysis) });
      qc.invalidateQueries({ queryKey: ["diary"] });
      setPending(null); setText("");
      toast.success("Voce salvata");
    } catch (e) { toast.error((e as Error).message); }
  }

  const parse = (e: DiaryEntry): DiaryAnalysis | null => {
    if (!e.ai_analysis) return null;
    try { return JSON.parse(e.ai_analysis) as DiaryAnalysis; } catch { return null; }
  };

  return (
    <div>
      <Sec title="Diario AI · scrivi o detta">
        <Card>
          <Area rows={6} placeholder="Racconta la giornata..." value={text} onChange={(e) => setText(e.target.value)} disabled={analyzing || !!pending} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <div style={{ fontSize: 11, color: P.slateL }}>{text.length} caratteri</div>
            <Btn onClick={runAnalyze} disabled={analyzing || !text.trim() || !!pending}>
              {analyzing ? "Analizzo..." : "✨ Analizza"}
            </Btn>
          </div>
          {error && <div style={{ marginTop: 10, padding: 10, background: "#fee2e2", color: P.red, borderRadius: 8, fontSize: 12 }}>{error}</div>}
        </Card>
      </Sec>

      {pending && (
        <Sec title="Anteprima AI" accent={P.accent}>
          <Card style={{ borderLeft: `4px solid ${P.accent}` }}>
            {pending.analysis.summary && (
              <div style={{ fontSize: 13, fontStyle: "italic", color: P.navy, borderLeft: `2px solid ${P.accent}`, paddingLeft: 10, marginBottom: 12 }}>{pending.analysis.summary}</div>
            )}
            {DIARY_CATS.map((c) => {
              const items = pending.analysis.categories[c.id as DiaryCategory] || [];
              if (items.length === 0) return null;
              return (
                <div key={c.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: c.color + "22", color: c.color, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{c.icon} {c.id}</div>
                  <ul style={{ margin: "4px 0 0 20px", padding: 0, fontSize: 13, color: P.navy }}>
                    {items.map((it, i) => <li key={i}>{it}</li>)}
                  </ul>
                </div>
              );
            })}
            {pending.analysis.actions.length > 0 && (
              <div style={{ borderTop: `1px solid ${P.border}`, paddingTop: 10, marginTop: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: P.slate, marginBottom: 8 }}>Azioni suggerite</div>
                {pending.analysis.actions.map((a, idx) => (
                  <div key={idx} style={{ background: P.bg, borderRadius: 8, padding: 10, marginBottom: 6 }}>
                    <div style={{ fontSize: 12, color: P.navy, marginBottom: 6 }}>{actionLabel(a)}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {confirmed[idx] ? (
                        <span style={{ fontSize: 11, color: P.green, fontWeight: 700 }}>✓ Aggiunto</span>
                      ) : skipped[idx] ? (
                        <span style={{ fontSize: 11, color: P.slate }}>Saltato</span>
                      ) : (
                        <>
                          <Btn color={P.green} onClick={() => confirmAction(idx, a)} style={{ padding: "6px 12px", fontSize: 12 }}>Conferma</Btn>
                          <Btn color={P.slate} onClick={() => setSkipped((s) => ({ ...s, [idx]: true }))} style={{ padding: "6px 12px", fontSize: 12 }}>Salta</Btn>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 12 }}>
              <Btn color={P.slate} onClick={() => setPending(null)}>Annulla</Btn>
              <Btn onClick={saveEntry}>Salva nel diario</Btn>
            </div>
          </Card>
        </Sec>
      )}

      <Sec title="Storico" accent={P.slateL}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.length === 0 && <div style={{ fontSize: 12, color: P.slateL }}>Nessuna voce salvata.</div>}
          {entries.map((e) => {
            const a = parse(e);
            const open = openIds[e.id];
            return (
              <Card key={e.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 11, color: P.slateL, fontWeight: 700 }}>{fmtDate(e.date)}</div>
                  <button onClick={() => { void api.diary.remove(e.id).then(() => qc.invalidateQueries({ queryKey: ["diary"] })); }} style={{ background: "transparent", border: 0, color: P.red, cursor: "pointer" }}>×</button>
                </div>
                {a?.summary && <div style={{ fontSize: 13, fontWeight: 600, color: P.navy, marginBottom: 8 }}>{a.summary}</div>}
                {a && DIARY_CATS.map((c) => {
                  const items = a.categories[c.id as DiaryCategory] || [];
                  if (items.length === 0) return null;
                  return (
                    <div key={c.id} style={{ marginBottom: 8 }}>
                      <div style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, background: c.color + "22", color: c.color, fontSize: 10, fontWeight: 700 }}>{c.icon} {c.id}</div>
                      <ul style={{ margin: "4px 0 0 20px", padding: 0, fontSize: 12, color: P.slate }}>
                        {items.map((it, i) => <li key={i}>{it}</li>)}
                      </ul>
                    </div>
                  );
                })}
                <button onClick={() => setOpenIds((s) => ({ ...s, [e.id]: !s[e.id] }))}
                  style={{ background: "transparent", border: 0, color: P.slateL, fontSize: 11, cursor: "pointer", padding: 0, marginTop: 4 }}>
                  {open ? "▼ Nascondi" : "▶ Mostra"} testo originale
                </button>
                {open && <div style={{ marginTop: 6, padding: 10, background: P.bg, borderRadius: 8, fontSize: 12, color: P.slate, whiteSpace: "pre-wrap" }}>{e.content}</div>}
              </Card>
            );
          })}
        </div>
      </Sec>
    </div>
  );
}
