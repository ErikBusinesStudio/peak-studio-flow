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
  const [detailId, setDetailId] = useState<string | null>(null);
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

  const detail = clients.find((c) => c.id === detailId) ?? null;

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
              <Card key={c.id} style={{ opacity: rifiutato ? 0.55 : 1, padding: 14, cursor: "pointer" }}>
                <div onClick={() => setDetailId(c.id)} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
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
                    <div style={{ fontSize: 10, color: P.slateL, marginTop: 6, fontStyle: "italic" }}>Tocca per dettagli →</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Sec>

      <Modal open={!!detail} onClose={() => setDetailId(null)} title={detail?.name ?? ""}>
        {detail && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 999, background: STATO_CFG[detail.status].dot }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: STATO_CFG[detail.status].color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{STATO_CFG[detail.status].label}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <InfoBox label="Zona" value={detail.zona || "—"} />
              <InfoBox label="Telefono" value={detail.phone || "—"} />
              <InfoBox label="Valore" value={detail.value != null ? `${detail.value}€` : "—"} />
              <InfoBox label="Incassato" value={`${detail.collected}€`} />
            </div>

            {detail.contact && <InfoBox label="Contatto" value={detail.contact} />}
            {detail.notes && (
              <div>
                <div style={{ fontSize: 10, textTransform: "uppercase", color: P.slateL, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>Note</div>
                <div style={{ fontSize: 13, color: P.navy, background: P.navyMid, padding: 10, borderRadius: 8, border: `1px solid ${P.border}`, whiteSpace: "pre-wrap" }}>{detail.notes}</div>
              </div>
            )}

            {detail.hours && (
              <div>
                <div style={{ fontSize: 10, textTransform: "uppercase", color: P.slateL, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>Orari settimana</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, background: P.navyMid, padding: 10, borderRadius: 8, border: `1px solid ${P.border}` }}>
                  {Object.entries(detail.hours).map(([d, h]) => (
                    <div key={d} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: P.slate }}>{d}</div>
                      <div style={{ fontSize: 11, color: P.navy, marginTop: 2 }}>{h}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: 10, textTransform: "uppercase", color: P.slateL, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>Cambia stato</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {STATUS_LIST.map((st) => (
                  <button key={st} onClick={() => wrap(() => api.clients.update(detail.id, { status: st }), "Aggiornato")}
                    style={{ fontSize: 11, padding: "6px 12px", borderRadius: 999, border: `1px solid ${detail.status === st ? STATO_CFG[st].dot : P.border}`, background: detail.status === st ? STATO_CFG[st].dot : P.navyMid, color: detail.status === st ? "#fff" : P.slate, cursor: "pointer", fontWeight: 700 }}>
                    {STATO_CFG[st].label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => { if (confirm("Eliminare?")) { wrap(() => api.clients.remove(detail.id), "Eliminato"); setDetailId(null); } }}
              style={{ marginTop: 4, padding: "10px 12px", background: "transparent", border: `1px solid ${P.red}`, borderRadius: 8, color: P.red, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>
              Elimina cliente
            </button>
          </div>
        )}
      </Modal>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuovo cliente">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Field placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <Field placeholder="Zona" value={zona} onChange={(e) => setZona(e.target.value)} />
          <Field placeholder="Telefono" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value as ClientStatus)}
            style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 13, background: P.navyMid, color: P.navy }}>
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

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: P.navyMid, border: `1px solid ${P.border}`, borderRadius: 8, padding: "8px 10px" }}>
      <div style={{ fontSize: 9, textTransform: "uppercase", color: P.slateL, fontWeight: 700, letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontSize: 13, color: P.navy, marginTop: 2, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button onClick={onClick}
      style={{ padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, border: `1px solid ${active ? (color || P.accent) : P.border}`, background: active ? (color || P.accent) : P.navyMid, color: active ? "#fff" : P.slate, cursor: "pointer" }}>
      {label}
    </button>
  );
}
