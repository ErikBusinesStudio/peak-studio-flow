import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, CATEGORIE, STATI, type Categoria, type Cliente, type Stato } from "@/lib/gestionale";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Form = {
  nome: string; referente: string; telefono: string; email: string; sito_web: string; social: string;
  indirizzo: string; comune: string; categoria: Categoria; stato: Stato; storico: boolean; fonte: string;
  ha_sito: "ignoto" | "si" | "no"; motivo_rifiuto: string; prossimo_contatto: string; note: string;
};

const vuoto: Form = {
  nome: "", referente: "", telefono: "", email: "", sito_web: "", social: "", indirizzo: "", comune: "",
  categoria: "altro", stato: "da_contattare", storico: false, fonte: "", ha_sito: "ignoto",
  motivo_rifiuto: "", prossimo_contatto: "", note: "",
};

const daCliente = (c: Cliente): Form => ({
  nome: c.nome, referente: c.referente ?? "", telefono: c.telefono ?? "", email: c.email ?? "",
  sito_web: c.sito_web ?? "", social: c.social ?? "", indirizzo: c.indirizzo ?? "", comune: c.comune ?? "",
  categoria: c.categoria, stato: c.stato, storico: c.storico, fonte: c.fonte ?? "",
  ha_sito: c.ha_sito === null ? "ignoto" : c.ha_sito ? "si" : "no",
  motivo_rifiuto: c.motivo_rifiuto ?? "", prossimo_contatto: c.prossimo_contatto ?? "", note: c.note ?? "",
});

const nullable = (s: string) => (s.trim() === "" ? null : s.trim());

export function ClienteForm({ open, onOpenChange, cliente, comuni, onSaved }: {
  open: boolean; onOpenChange: (o: boolean) => void; cliente?: Cliente | null; comuni: string[]; onSaved?: (id: string) => void;
}) {
  const qc = useQueryClient();
  const [f, setF] = useState<Form>(vuoto);
  useEffect(() => { if (open) setF(cliente ? daCliente(cliente) : vuoto); }, [open, cliente]);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  const save = useMutation({
    mutationFn: async () => {
      const payload: Partial<Cliente> = {
        nome: f.nome.trim(), referente: nullable(f.referente), telefono: nullable(f.telefono), email: nullable(f.email),
        sito_web: nullable(f.sito_web), social: nullable(f.social), indirizzo: nullable(f.indirizzo), comune: nullable(f.comune),
        categoria: f.categoria, stato: f.stato, storico: f.storico, fonte: nullable(f.fonte),
        ha_sito: f.ha_sito === "ignoto" ? null : f.ha_sito === "si",
        motivo_rifiuto: nullable(f.motivo_rifiuto), prossimo_contatto: nullable(f.prossimo_contatto), note: nullable(f.note),
      };
      if (cliente) { await api.clienti.update(cliente.id, payload); return cliente.id; }
      return api.clienti.create(payload);
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["clienti"] });
      qc.invalidateQueries({ queryKey: ["cliente", id] });
      toast.success(cliente ? "Cliente aggiornato" : "Cliente aggiunto");
      onOpenChange(false);
      onSaved?.(id);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!f.nome.trim()) return toast.error("Il nome è obbligatorio");
    save.mutate();
  }

  const field = (label: string, node: React.ReactNode, wide = false) => (
    <div className={wide ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}><Label>{label}</Label>{node}</div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle className="title-md">{cliente ? "Modifica cliente" : "Nuovo cliente"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          {field("Nome *", <Input value={f.nome} onChange={(e) => set("nome", e.target.value)} />, true)}
          {field("Stato", (
            <Select value={f.stato} onValueChange={(v) => set("stato", v as Stato)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATI.map((s) => <SelectItem key={s.id} value={s.id}>{s.short}</SelectItem>)}</SelectContent>
            </Select>
          ))}
          {field("Tipo di attività", (
            <Select value={f.categoria} onValueChange={(v) => set("categoria", v as Categoria)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIE.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          ))}
          {field("Comune della sede", (
            <>
              <Input list="comuni-list" value={f.comune} onChange={(e) => set("comune", e.target.value)} placeholder="Es. Cuveglio" />
              <datalist id="comuni-list">{comuni.map((c) => <option key={c} value={c} />)}</datalist>
            </>
          ))}
          {field("Indirizzo", <Input value={f.indirizzo} onChange={(e) => set("indirizzo", e.target.value)} />)}
          {field("Referente", <Input value={f.referente} onChange={(e) => set("referente", e.target.value)} />)}
          {field("Telefono", <Input value={f.telefono} onChange={(e) => set("telefono", e.target.value)} />)}
          {field("Email", <Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} />)}
          {field("Sito web", <Input value={f.sito_web} onChange={(e) => set("sito_web", e.target.value)} placeholder="https://" />)}
          {field("Social", <Input value={f.social} onChange={(e) => set("social", e.target.value)} />)}
          {field("Ha già un sito?", (
            <Select value={f.ha_sito} onValueChange={(v) => set("ha_sito", v as Form["ha_sito"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ignoto">Non so</SelectItem>
                <SelectItem value="si">Sì</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          ))}
          {field("Come l'ho trovato", <Input value={f.fonte} onChange={(e) => set("fonte", e.target.value)} placeholder="Visita, referral, Instagram…" />)}
          {field("Prossimo contatto", <Input type="date" value={f.prossimo_contatto} onChange={(e) => set("prossimo_contatto", e.target.value)} />)}
          {f.stato === "rifiutato" && field("Motivo del rifiuto", <Input value={f.motivo_rifiuto} onChange={(e) => set("motivo_rifiuto", e.target.value)} />, true)}
          {field("Note", <Textarea rows={4} value={f.note} onChange={(e) => set("note", e.target.value)} />, true)}
          <label className="flex items-center gap-3 sm:col-span-2">
            <Switch checked={f.storico} onCheckedChange={(v) => set("storico", v)} />
            <span className="text-sm">Pratica dello storico (chiusa prima della data zero)</span>
          </label>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Annulla</Button>
            <Button type="submit" disabled={save.isPending} className="rounded-full px-7">{save.isPending ? "Salvo…" : "Salva"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
