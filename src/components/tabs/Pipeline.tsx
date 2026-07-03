import { useQuery } from "@tanstack/react-query";
import { api, fmtEur, fmtDate, type ProjectStage } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useMutate } from "@/lib/hooks";
import { useState } from "react";

const STAGES: { id: ProjectStage; label: string; color: string }[] = [
  { id: "lead", label: "Lead", color: "bg-slate-500" },
  { id: "proposta", label: "Proposta", color: "bg-blue-500" },
  { id: "trattativa", label: "Trattativa", color: "bg-amber-500" },
  { id: "vinto", label: "Vinto", color: "bg-emerald-500" },
  { id: "perso", label: "Perso", color: "bg-rose-500" },
];

export default function Pipeline() {
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: api.projects.list });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: api.clients.list });
  const create = useMutate(["projects"], (v) => api.projects.create(v as never) as unknown as Promise<unknown>, "Progetto aggiunto");
  const update = useMutate(["projects"], ({ id, ...v }: { id: string } & Record<string, unknown>) => api.projects.update(id, v as never) as unknown as Promise<unknown>);
  const remove = useMutate(["projects"], (id) => api.projects.remove(id as string) as unknown as Promise<unknown>);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [stage, setStage] = useState<ProjectStage>("lead");
  const [clientId, setClientId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");

  const total = (projects ?? []).filter((p) => p.stage !== "perso" && p.stage !== "vinto").reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Pipeline</h2>
          <p className="text-sm text-muted-foreground">Progetti una tantum · {fmtEur(total)} attivi</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Nuovo</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Nuovo progetto</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome progetto" value={name} onChange={(e) => setName(e.target.value)} />
              <Input type="number" placeholder="Importo €" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Select value={stage} onValueChange={(v) => setStage(v as ProjectStage)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={clientId ?? "none"} onValueChange={(v) => setClientId(v === "none" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Cliente" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessuno</SelectItem>
                  {(clients ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <Button className="w-full" disabled={!name || !amount} onClick={() => {
                create.mutate({ name, amount: Number(amount), stage, client_id: clientId, due_date: dueDate || null });
                setName(""); setAmount(""); setStage("lead"); setClientId(null); setDueDate(""); setOpen(false);
              }}>Aggiungi</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {(projects ?? []).map((p) => {
          const s = STAGES.find((x) => x.id === p.stage)!;
          const client = (clients ?? []).find((c) => c.id === p.client_id);
          return (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    {client && <p className="text-xs text-muted-foreground">{client.name}</p>}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <Badge className={`${s.color} text-white hover:${s.color}`}>{s.label}</Badge>
                      <span className="text-sm font-semibold text-primary">{fmtEur(Number(p.amount))}</span>
                      {p.due_date && <span className="text-xs text-muted-foreground">· {fmtDate(p.due_date)}</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div className="mt-3 flex gap-1 flex-wrap">
                  {STAGES.map((st) => (
                    <button key={st.id} onClick={() => update.mutate({ id: p.id, stage: st.id })}
                      className={`text-[10px] px-2 py-1 rounded-full border ${p.stage === st.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
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
