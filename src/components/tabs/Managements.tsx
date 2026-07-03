import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, fmtEur, type Management } from "@/lib/db";
import { P } from "@/lib/theme";
import { Sec, Btn, Field, Area, Modal, Card } from "@/components/ui/Sec";
import { useState } from "react";
import { toast } from "sonner";

export default function Managements() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery<Management[]>({ queryKey: ["managements"], queryFn: api.managements.list });
  const acquisiti = rows.filter((r) => r.category === "acquisito");
  const pipeline = rows.filter((r) => r.category === "pipeline");
  const totActive = acquisiti.reduce((s, r) => s + Number(r.monthly_amount ?? 0), 0);
  const totPip = pipeline.reduce((s, r) => s + Number(r.monthly_amount ?? 0), 0);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(""); const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<"acquisito" | "pipeline">("acquisito");
  const [notes, setNotes] = useState("");

  const wrap = async (fn: () => Promise<unknown>, msg: string) => {
    try { await fn(); qc.invalidateQueries({ queryKey: ["managements"] }); toast.success(msg); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div>
      <Sec title={`Acquisiti · ${fmtEur(totActive)}/m`} accent={P.green} action={<Btn color={P.green} onClick={() => { setCategory("acquisito"); setOpen(true); }}>+ Aggiungi</Btn>}>
        <List rows={acquisiti} color={P.green} onRemove={(id) => confirm("Eliminare?") && wrap(() => api.managements.remove(id), "Eliminata")} />
      </Sec>

      <Sec title={`Pipeline future · ${fmtEur(totPip)}/m potenziali`} accent={P.purple} action={<Btn color={P.purple} onClick={() => { setCategory("pipeline"); setOpen(true); }}>+ Aggiungi</Btn>}>
        <List rows={pipeline} color={P.purple} onRemove={(id) => confirm("Eliminare?") && wrap(() => api.managements.remove(id), "Eliminata")} />
      </Sec>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuova gestione">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Field placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <Field placeholder="€/mese" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <select value={category} onChange={(e) => setCategory(e.target.value as "acquisito" | "pipeline")}
            style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 13 }}>
            <option value="acquisito">Acquisito</option>
            <option value="pipeline">Pipeline</option>
          </select>
          <Area placeholder="Note" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          <Btn disabled={!name} onClick={async () => {
            await wrap(() => api.managements.create({ name, monthly_amount: amount ? Number(amount) : null, category, notes: notes || null, active: category === "acquisito" }), "Aggiunta");
            setName(""); setAmount(""); setNotes(""); setOpen(false);
          }}>Salva</Btn>
        </div>
      </Modal>
    </div>
  );
}

function List({ rows, color, onRemove }: { rows: Management[]; color: string; onRemove: (id: string) => void }) {
  if (rows.length === 0) return <div style={{ fontSize: 12, color: P.slateL }}>Nessuna.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((r) => (
        <Card key={r.id} style={{ borderLeft: `4px solid ${color}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, color: P.navy, fontSize: 13 }}>{r.name}</div>
            {r.notes && <div style={{ fontSize: 11, color: P.slate, marginTop: 2 }}>{r.notes}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color }}>{r.monthly_amount != null ? `${fmtEur(Number(r.monthly_amount))}/m` : "—"}</div>
            <button onClick={() => onRemove(r.id)} style={{ background: "transparent", border: 0, color: P.red, cursor: "pointer", fontSize: 12 }}>×</button>
          </div>
        </Card>
      ))}
    </div>
  );
}
