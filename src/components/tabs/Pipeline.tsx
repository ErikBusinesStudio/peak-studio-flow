import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, fmtEur, type Project, type ServiceItem } from "@/lib/db";
import { P } from "@/lib/theme";
import { Sec, Btn, Field, Area, Modal, Card } from "@/components/ui/Sec";
import { useState } from "react";
import { toast } from "sonner";

export default function Pipeline() {
  const qc = useQueryClient();
  const { data: projects = [] } = useQuery<Project[]>({ queryKey: ["projects"], queryFn: api.projects.list });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [notes, setNotes] = useState("");

  const totOnce = projects.reduce((s, p) => s + p.services_one_off.reduce((a, x) => a + Number(x.i), 0), 0);
  const totMon = projects.reduce((s, p) => s + p.services_monthly.reduce((a, x) => a + Number(x.i), 0), 0);

  const wrap = async (fn: () => Promise<unknown>, msg: string) => {
    try { await fn(); qc.invalidateQueries({ queryKey: ["projects"] }); toast.success(msg); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div>
      <Sec title={`Pipeline · ${fmtEur(totOnce)} una tantum · ${fmtEur(totMon)}/mese`}
        action={<Btn onClick={() => setOpen(true)}>+ Nuovo</Btn>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onUpdate={(row) => wrap(() => api.projects.update(p.id, row), "Aggiornato")} onRemove={() => confirm("Eliminare?") && wrap(() => api.projects.remove(p.id), "Eliminato")} />
          ))}
        </div>
      </Sec>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuovo progetto pipeline">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Field placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <label style={{ fontSize: 11, color: P.slate }}>Colore</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 60, height: 32 }} />
          <Area placeholder="Note" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          <Btn disabled={!name} onClick={async () => {
            await wrap(() => api.projects.create({ name, color, notes: notes || null, services_one_off: [], services_monthly: [] }), "Aggiunto");
            setName(""); setNotes(""); setOpen(false);
          }}>Crea</Btn>
        </div>
      </Modal>
    </div>
  );
}

function ProjectCard({ project, onUpdate, onRemove }: { project: Project; onUpdate: (r: Partial<Project>) => void; onRemove: () => void }) {
  const [openOnce, setOpenOnce] = useState(false);
  const [openMon, setOpenMon] = useState(false);
  const [v, setV] = useState(""); const [i, setI] = useState("");
  const c = project.color || P.blue;

  const totOnce = project.services_one_off.reduce((s, x) => s + Number(x.i), 0);
  const totMon = project.services_monthly.reduce((s, x) => s + Number(x.i), 0);

  const addService = (kind: "one" | "mon") => {
    if (!v || !i) return;
    const key = kind === "one" ? "services_one_off" : "services_monthly";
    const arr: ServiceItem[] = [...project[key], { v, i: Number(i) }];
    onUpdate({ [key]: arr } as Partial<Project>);
    setV(""); setI("");
    if (kind === "one") setOpenOnce(false); else setOpenMon(false);
  };
  const removeService = (kind: "one" | "mon", idx: number) => {
    const key = kind === "one" ? "services_one_off" : "services_monthly";
    onUpdate({ [key]: project[key].filter((_, k) => k !== idx) } as Partial<Project>);
  };

  return (
    <Card style={{ borderLeft: `4px solid ${c}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontWeight: 800, color: P.navy, fontSize: 14 }}>{project.name}</div>
        <button onClick={onRemove} style={{ fontSize: 11, color: P.red, background: "transparent", border: 0, cursor: "pointer" }}>Elimina</button>
      </div>
      {project.notes && <div style={{ fontSize: 11, color: P.slate, marginBottom: 8 }}>{project.notes}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <ServiceList title="Una tantum" total={totOnce} color={P.blue} items={project.services_one_off} onRemove={(idx) => removeService("one", idx)} onAdd={() => setOpenOnce(true)} />
        <ServiceList title="Mensile" total={totMon} color={P.purple} items={project.services_monthly} onRemove={(idx) => removeService("mon", idx)} suffix="/m" onAdd={() => setOpenMon(true)} />
      </div>

      <Modal open={openOnce} onClose={() => setOpenOnce(false)} title="Aggiungi servizio una tantum">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Field placeholder="Descrizione" value={v} onChange={(e) => setV(e.target.value)} />
          <Field placeholder="Importo €" type="number" value={i} onChange={(e) => setI(e.target.value)} />
          <Btn onClick={() => addService("one")}>Aggiungi</Btn>
        </div>
      </Modal>
      <Modal open={openMon} onClose={() => setOpenMon(false)} title="Aggiungi servizio mensile">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Field placeholder="Descrizione" value={v} onChange={(e) => setV(e.target.value)} />
          <Field placeholder="€/mese" type="number" value={i} onChange={(e) => setI(e.target.value)} />
          <Btn onClick={() => addService("mon")}>Aggiungi</Btn>
        </div>
      </Modal>
    </Card>
  );
}

function ServiceList({ title, total, color, items, suffix = "", onRemove, onAdd }: { title: string; total: number; color: string; items: ServiceItem[]; suffix?: string; onRemove: (i: number) => void; onAdd: () => void }) {
  return (
    <div style={{ background: P.bg, borderRadius: 8, padding: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color }}>{title}</div>
        <div style={{ fontSize: 12, fontWeight: 800, color }}>{fmtEur(total)}{suffix}</div>
      </div>
      {items.map((it, idx) => (
        <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0", color: P.slate }}>
          <span>{it.v}</span>
          <span style={{ display: "flex", gap: 6 }}>
            <span style={{ fontWeight: 700, color: P.navy }}>{it.i}€{suffix}</span>
            <button onClick={() => onRemove(idx)} style={{ background: "transparent", border: 0, color: P.red, cursor: "pointer", fontSize: 11 }}>×</button>
          </span>
        </div>
      ))}
      <button onClick={onAdd} style={{ marginTop: 6, fontSize: 11, color, background: "transparent", border: `1px dashed ${color}`, borderRadius: 6, padding: "4px 8px", width: "100%", cursor: "pointer" }}>+ aggiungi</button>
    </div>
  );
}
