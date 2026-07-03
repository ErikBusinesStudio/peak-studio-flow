import { useQuery } from "@tanstack/react-query";
import { api, type ClientStatus } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useMutate } from "@/lib/hooks";
import { useState } from "react";

const STATUSES: { id: ClientStatus; label: string; color: string }[] = [
  { id: "acquisito", label: "Acquisito", color: "bg-emerald-500" },
  { id: "in_attesa", label: "In attesa", color: "bg-amber-500" },
  { id: "da_contattare", label: "Da contattare", color: "bg-blue-500" },
  { id: "rifiutato", label: "Rifiutato", color: "bg-rose-500" },
];

export default function Clients() {
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });
  const create = useMutate(["clients"], (v) => api.clients.create(v as never) as unknown as Promise<unknown>, "Cliente aggiunto");
  const update = useMutate(["clients"], ({ id, ...v }: { id: string } & Record<string, unknown>) => api.clients.update(id, v as never) as unknown as Promise<unknown>);
  const remove = useMutate(["clients"], (id) => api.clients.remove(id as string) as unknown as Promise<unknown>);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ClientStatus>("da_contattare");
  const [filter, setFilter] = useState<ClientStatus | "all">("all");

  const filtered = (clients ?? []).filter((c) => filter === "all" || c.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Clienti</h2>
          <p className="text-sm text-muted-foreground">{(clients ?? []).length} totali</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Nuovo</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Nuovo cliente</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome / azienda" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Contatto (email / tel)" value={contact} onChange={(e) => setContact(e.target.value)} />
              <Select value={status} onValueChange={(v) => setStatus(v as ClientStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
              <Textarea placeholder="Note" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Button className="w-full" disabled={!name} onClick={() => {
                create.mutate({ name, contact: contact || null, notes: notes || null, status });
                setName(""); setContact(""); setNotes(""); setStatus("da_contattare"); setOpen(false);
              }}>Aggiungi</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <button onClick={() => setFilter("all")} className={`shrink-0 rounded-full px-3 py-1 text-xs ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>Tutti</button>
        {STATUSES.map((s) => (
          <button key={s.id} onClick={() => setFilter(s.id)} className={`shrink-0 rounded-full px-3 py-1 text-xs ${filter === s.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{s.label}</button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((c) => {
          const s = STATUSES.find((x) => x.id === c.status)!;
          return (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{c.name}</p>
                    {c.contact && <p className="text-xs text-muted-foreground truncate">{c.contact}</p>}
                    {c.notes && <p className="text-xs mt-1 text-muted-foreground line-clamp-2">{c.notes}</p>}
                    <Badge className={`${s.color} text-white hover:${s.color} mt-2`}>{s.label}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(c.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div className="mt-3 flex gap-1 flex-wrap">
                  {STATUSES.map((st) => (
                    <button key={st.id} onClick={() => update.mutate({ id: c.id, status: st.id })}
                      className={`text-[10px] px-2 py-1 rounded-full border ${c.status === st.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
                      {st.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
