import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Client, type ClientStatus } from "@/lib/db";
import { P, STATO_CFG, STATO_ORDER, DIST } from "@/lib/theme";
import { Sec, Btn, Field, Area, Modal, Card } from "@/components/ui/Sec";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_LIST: ClientStatus[] = ["acquisito", "in_attesa", "da_contattare", "rifiutato"];

export default function Clients() {
  const qc = useQueryClient();
  const { data: clients = [] } = useQuery<Client[]>({ queryKey: ["clients"], queryFn: api.clients.list });
  const [filter, setFilter] = useState<ClientStatus | "all">("all");
  const [order, setOrder] = useState<"stato" | "zona">("stato");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [zona, setZona] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ClientStatus>("da_contattare");

  const refresh = () => qc.invalidateQueries({ queryKey: ["clients"] });
  const wrap = async (fn: () => Promise<unknown>, msg: string) => {
    try { await fn(); refresh(); toast.success(msg); }
    catch (e) { toast.error((e as Error).message); }
  };

  const filtered = clients.filter((c) => filter === "all" || c.status === filter);
  const sorted = [...filtered].sort((a, b) => {
    if (order === "zona") return (DIST[a.zona ?? ""] ?? 999) - (DIST[b.zona ?? ""] ?? 999);
    return STATO_ORDER.indexOf(a.status) - STATO_ORDER.indexOf(b.status);
  });

  return (
    <div>
      <Sec title={`Clienti · ${clients.length}`} action={<Btn onClick={() => setOpen(true)}>+ Nuovo</Btn>}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <FilterChip label="Tutti" active={filter === "all"} onClick={() => setFilter("all")} />
          {STATUS_LIST.map((s) => (
            <FilterChip key={s} label={STATO_CFG[s].label} active={filter === s} onClick={() => setFilter(s)} color={STATO_CFG[s].dot} />
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <FilterChip label="Per stato" active={order === "stato"} onClick={() => setOrder("stato")} />
            <FilterChip label="Per zona" active={order === "zona"} onClick={() => setOrder("zona")} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map((c) => {
            const s = STATO_CFG[c.status];
            const rifiutato = c.status === "rifiutato";
            return (
              <Card key={c.id} style={{ opacity: rifiutato ? 0.55 : 1, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 8, height: 8, background: s.dot, borderRadius: 999, marginTop: 6 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ fontWeight: 800, color: P.navy, fontSize: 14 }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: s.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                    </div>
                    <div style={{ fontSize: 11, color: P.slateL, marginTop: 2 }}>
                      {c.zona || "—"}{c.phone ? ` · ${c.phone}` : ""}
                      {c.value != null ? ` · valore ${c.value}€` : ""}
                      {c.collected > 0 ? ` · incassato ${c.collected}€` : ""}
                    </div>
                    {c.notes && <div style={{ fontSize: 12, color: P.slate, marginTop: 6 }}>{c.notes}</div>}
                    {c.hours && (
                      <div style={{ fontSize: 10, color: P.slateL, marginTop: 6, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                        {Object.entries(c.hours).map(([d, h]) => (
                          <div key={d} style={{ textAlign: "center" }}>
                            <div style={{ fontWeight: 700, color: P.slate }}>{d}</div>
                            <div>{h}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {STATUS_LIST.map((st) => (
                        <button key={st} onClick={() => wrap(() => api.clients.update(c.id, { status: st }), "Aggiornato")}
                          style={{ fontSize: 10, padding: "3px 8px", borderRadius: 999, border: `1px solid ${c.status === st ? STATO_CFG[st].dot : P.border}`, background: c.status === st ? STATO_CFG[st].dot : "#fff", color: c.status === st ? "#fff" : P.slate, cursor: "pointer", fontWeight: 600 }}>
                          {STATO_CFG[st].label}
                        </button>
                      ))}
                      <button onClick={() => confirm("Eliminare?") && wrap(() => api.clients.remove(c.id), "Eliminato")}
                        style={{ marginLeft: "auto", fontSize: 10, padding: "3px 8px", borderRadius: 999, border: `1px solid ${P.border}`, background: "#fff", color: P.red, cursor: "pointer" }}>Elimina</button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Sec>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuovo cliente">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Field placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <Field placeholder="Zona" value={zona} onChange={(e) => setZona(e.target.value)} />
          <Field placeholder="Telefono" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value as ClientStatus)}
            style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 13 }}>
            {STATUS_LIST.map((s) => <option key={s} value={s}>{STATO_CFG[s].label}</option>)}
          </select>
          <Area placeholder="Note" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          <Btn disabled={!name} onClick={async () => {
            await wrap(() => api.clients.create({ name, zona: zona || null, phone: phone || null, notes: notes || null, status }), "Cliente aggiunto");
            setName(""); setZona(""); setPhone(""); setNotes(""); setStatus("da_contattare"); setOpen(false);
          }}>Aggiungi</Btn>
        </div>
      </Modal>
    </div>
  );
}

function FilterChip({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button onClick={onClick}
      style={{ padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, border: `1px solid ${active ? (color || P.accent) : P.border}`, background: active ? (color || P.accent) : "#fff", color: active ? "#fff" : P.slate, cursor: "pointer" }}>
      {label}
    </button>
  );
}
