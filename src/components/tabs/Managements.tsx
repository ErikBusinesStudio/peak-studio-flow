import { useQuery } from "@tanstack/react-query";
import { api, fmtEur } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { useMutate } from "@/lib/hooks";
import { useState } from "react";

export default function Managements() {
  const { data: managements = [] } = useQuery({ queryKey: ["managements"], queryFn: api.managements.list });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });
  const create = useMutate(["managements"], (v) => api.managements.create(v as never) as unknown as Promise<unknown>, "Gestione aggiunta");
  const update = useMutate(["managements"], ({ id, ...v }: { id: string } & Record<string, unknown>) => api.managements.update(id, v as never) as unknown as Promise<unknown>);
  const remove = useMutate(["managements"], (id) => api.managements.remove(id as string) as unknown as Promise<unknown>);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [monthly, setMonthly] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);

  const mrr = (managements ?? []).filter((m) => m.active).reduce((s, m) => s + Number(m.monthly_amount), 0);
  const annual = mrr * 12;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Gestioni</h2>
          <p className="text-sm text-muted-foreground">MRR {fmtEur(mrr)} · Annuo {fmtEur(annual)}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Nuova</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Nuova gestione</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
              <Input type="number" placeholder="€ / mese" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
              <Select value={clientId ?? "none"} onValueChange={(v) => setClientId(v === "none" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Cliente" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessuno</SelectItem>
                  {(clients ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button className="w-full" disabled={!name || !monthly} onClick={() => {
                create.mutate({ name, monthly_amount: Number(monthly), client_id: clientId, active: true });
                setName(""); setMonthly(""); setClientId(null); setOpen(false);
              }}>Aggiungi</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {(managements ?? []).map((m) => {
          const client = (clients ?? []).find((c) => c.id === m.client_id);
          return (
            <Card key={m.id} className={m.active ? "" : "opacity-60"}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{m.name}</p>
                  {client && <p className="text-xs text-muted-foreground">{client.name}</p>}
                  <p className="text-sm font-semibold text-primary mt-1">{fmtEur(Number(m.monthly_amount))}<span className="text-xs text-muted-foreground font-normal"> / mese</span></p>
                </div>
                <Switch checked={m.active} onCheckedChange={(v) => update.mutate({ id: m.id, active: v })} />
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(m.id)}><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
