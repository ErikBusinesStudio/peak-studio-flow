import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type EventItem, type Update } from "@/lib/db";
import { P } from "@/lib/theme";
import { Sec, Btn, Field, Modal, Card } from "@/components/ui/Sec";
import { useState } from "react";
import { toast } from "sonner";

export default function Calendar() {
  const qc = useQueryClient();
  const { data: events = [] } = useQuery<EventItem[]>({ queryKey: ["events"], queryFn: api.events.list });
  const { data: updates = [] } = useQuery<Update[]>({ queryKey: ["updates"], queryFn: api.updates.list });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(""); const [date, setDate] = useState(""); const [time, setTime] = useState(""); const [notes, setNotes] = useState("");

  const wrap = async (fn: () => Promise<unknown>, msg: string) => {
    try { await fn(); qc.invalidateQueries({ queryKey: ["events"] }); toast.success(msg); }
    catch (e) { toast.error((e as Error).message); }
  };

  const upcoming = events.filter((e) => new Date(e.date) >= new Date(new Date().toDateString()));

  return (
    <div>
      <Sec title="Prossimi eventi" action={<Btn onClick={() => setOpen(true)}>+ Nuovo</Btn>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {upcoming.length === 0 && <div style={{ fontSize: 12, color: P.slateL }}>Nessun evento programmato.</div>}
          {upcoming.map((e) => (
            <Card key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, borderLeft: `3px solid ${P.blue}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.navy }}>{e.title}</div>
                <div style={{ fontSize: 11, color: P.slateL }}>{new Date(e.date).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}{e.time ? ` · ${e.time}` : ""}</div>
                {e.notes && <div style={{ fontSize: 12, color: P.slate, marginTop: 4 }}>{e.notes}</div>}
              </div>
              <button onClick={() => wrap(() => api.events.remove(e.id), "Eliminato")} style={{ background: "transparent", border: 0, color: P.red, cursor: "pointer" }}>×</button>
            </Card>
          ))}
        </div>
      </Sec>

      <Sec title="Crono aggiornamenti" accent={P.slateL}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {updates.map((u) => (
            <Card key={u.id} style={{ padding: 12, display: "flex", gap: 10 }}>
              <div style={{ fontSize: 10, color: P.slateL, minWidth: 60, fontWeight: 700 }}>
                {new Date(u.date).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}
              </div>
              <div>
                <div style={{ fontSize: 13, color: P.navy }}>{u.event}</div>
                <div style={{ fontSize: 10, color: P.slateL, marginTop: 2 }}>{u.category}</div>
              </div>
            </Card>
          ))}
        </div>
      </Sec>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuovo evento">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Field placeholder="Titolo" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Field type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Field type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          <Field placeholder="Note" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Btn disabled={!title || !date} onClick={async () => {
            await wrap(() => api.events.create({ title, date, time: time || null, notes: notes || null }), "Aggiunto");
            setTitle(""); setDate(""); setTime(""); setNotes(""); setOpen(false);
          }}>Salva</Btn>
        </div>
      </Modal>
    </div>
  );
}
