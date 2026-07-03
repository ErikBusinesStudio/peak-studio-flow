import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Todo, type Priority } from "@/lib/db";
import { P, PRIO_COLOR } from "@/lib/theme";
import { Sec, Btn, Field, Card } from "@/components/ui/Sec";
import { useState } from "react";
import { toast } from "sonner";

const PRIOS: Priority[] = ["alta", "media", "bassa"];

export default function Todos() {
  const qc = useQueryClient();
  const { data: todos = [] } = useQuery<Todo[]>({ queryKey: ["todos"], queryFn: api.todos.list });
  const [title, setTitle] = useState(""); const [prio, setPrio] = useState<Priority>("media"); const [note, setNote] = useState("");

  const wrap = async (fn: () => Promise<unknown>, msg: string) => {
    try { await fn(); qc.invalidateQueries({ queryKey: ["todos"] }); toast.success(msg); }
    catch (e) { toast.error((e as Error).message); }
  };

  const grouped = (p: Priority) => todos.filter((t) => t.priority === p);

  return (
    <div>
      <Sec title="Aggiungi task">
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Field placeholder="Titolo" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Field placeholder="Data / nota (opzionale)" value={note} onChange={(e) => setNote(e.target.value)} />
            <select value={prio} onChange={(e) => setPrio(e.target.value as Priority)}
              style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 13 }}>
              {PRIOS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <Btn disabled={!title} onClick={async () => {
              await wrap(() => api.todos.create({ title, priority: prio, date_note: note || null, done: false }), "Aggiunta");
              setTitle(""); setNote(""); setPrio("media");
            }}>Aggiungi</Btn>
          </div>
        </Card>
      </Sec>

      {PRIOS.map((p) => (
        <Sec key={p} title={`Priorità ${p}`} accent={PRIO_COLOR[p]}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {grouped(p).length === 0 && <div style={{ fontSize: 12, color: P.slateL }}>Nessuna.</div>}
            {grouped(p).map((t) => (
              <Card key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, borderLeft: `3px solid ${PRIO_COLOR[p]}`, padding: 12, opacity: t.done ? 0.5 : 1 }}>
                <input type="checkbox" checked={t.done} onChange={() => wrap(() => api.todos.update(t.id, { done: !t.done }), "Aggiornata")} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: P.navy, textDecoration: t.done ? "line-through" : "none" }}>{t.title}</div>
                  {t.date_note && <div style={{ fontSize: 11, color: P.slateL, marginTop: 2 }}>{t.date_note}</div>}
                </div>
                <button onClick={() => wrap(() => api.todos.remove(t.id), "Eliminata")} style={{ background: "transparent", border: 0, color: P.red, cursor: "pointer" }}>×</button>
              </Card>
            ))}
          </div>
        </Sec>
      ))}
    </div>
  );
}
