import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { api, CANALI, STATI, type Canale, type Cliente, type Stato } from "@/lib/gestionale";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const KEEP = "keep";

/** Registra un contatto, imposta il prossimo follow-up e (opzionale) cambia stato. */
export function ContattoRapido({ cliente, onClose, canaleIniziale = "whatsapp" }: { cliente: Cliente | null; onClose: () => void; canaleIniziale?: Canale }) {
  const qc = useQueryClient();
  const [canale, setCanale] = useState<Canale>("whatsapp");
  const [esito, setEsito] = useState("");
  const [note, setNote] = useState("");
  const [followup, setFollowup] = useState("");
  const [stato, setStato] = useState<string>(KEEP);

  useEffect(() => { if (cliente) { setCanale(canaleIniziale); setEsito(""); setNote(""); setFollowup(""); setStato(KEEP); } }, [cliente, canaleIniziale]);

  const save = useMutation({
    mutationFn: async () => {
      if (!cliente) return;
      await api.contatti.create({
        cliente_id: cliente.id, data: format(new Date(), "yyyy-MM-dd"), canale,
        esito: esito.trim() || null, note: note.trim() || null, prossimo_followup: followup || null,
      });
      const patch: Partial<Cliente> = { prossimo_contatto: followup || null };
      if (stato !== KEEP) patch.stato = stato as Stato;
      else if (cliente.stato === "da_contattare") patch.stato = "contattato";
      await api.clienti.update(cliente.id, patch);
    },
    onSuccess: () => {
      ["clienti", "contatti-all", "cliente", "contatti"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      toast.success("Contatto registrato");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={!!cliente} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="title-md">Contatto · {cliente?.nome}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Canale</Label>
            <Select value={canale} onValueChange={(v) => setCanale(v as Canale)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CANALI.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Esito</Label><Input value={esito} onChange={(e) => setEsito(e.target.value)} placeholder="Es. nessuna risposta, chiede preventivo…" /></div>
          <div className="space-y-1.5"><Label>Note</Label><Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Prossimo follow-up</Label><Input type="date" value={followup} onChange={(e) => setFollowup(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Nuovo stato</Label>
              <Select value={stato} onValueChange={setStato}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={KEEP}>Invariato</SelectItem>
                  {STATI.map((s) => <SelectItem key={s.id} value={s.id}>{s.short}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annulla</Button>
          <Button disabled={save.isPending} onClick={() => save.mutate()} className="rounded-full px-7">Registra</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
