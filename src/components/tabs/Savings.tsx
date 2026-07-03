import { useQuery } from "@tanstack/react-query";
import { api, fmtEur, fmtDate } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, PiggyBank, Bike, TrendingUp } from "lucide-react";
import { useMutate } from "@/lib/hooks";
import { useState } from "react";

export default function Savings() {
  const { data: savings = [] } = useQuery({ queryKey: ["savings"], queryFn: api.savings.list });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: api.settings.get });
  const create = useMutate(["savings"], (v) => api.savings.create(v as never) as unknown as Promise<unknown>, "Versamento aggiunto");
  const remove = useMutate(["savings"], (id) => api.savings.remove(id as string) as unknown as Promise<unknown>);
  const updateSettings = useMutate(["settings"], (v) => api.settings.update(v as never) as unknown as Promise<unknown>);

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const total = (savings ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const goal = Number(settings?.savings_goal ?? 10000);
  const pct = Math.min(100, Math.round((total / goal) * 100));
  const split = settings?.moto_split ?? 50;
  const motoAmount = (total * split) / 100;
  const investAmount = total - motoAmount;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Risparmi</h2>
          <p className="text-sm text-muted-foreground">Road to {fmtEur(goal)}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Versa</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Nuovo versamento</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input type="number" placeholder="Importo €" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input placeholder="Nota (opzionale)" value={note} onChange={(e) => setNote(e.target.value)} />
              <Button className="w-full" disabled={!amount} onClick={() => {
                create.mutate({ amount: Number(amount), date, note: note || null });
                setAmount(""); setNote(""); setOpen(false);
              }}>Aggiungi</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3"><PiggyBank className="h-6 w-6 text-primary" /></div>
            <div className="flex-1">
              <p className="text-3xl font-bold">{fmtEur(total)}</p>
              <p className="text-sm text-muted-foreground">{pct}% dell'obiettivo</p>
            </div>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium">Ripartizione: Moto {split}% · Investimento {100 - split}%</p>
          <Slider value={[split]} onValueChange={(v) => updateSettings.mutate({ moto_split: v[0] })} min={0} max={100} step={5} />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="rounded-lg bg-accent p-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground"><Bike className="h-3 w-3" /> Moto</div>
              <p className="text-lg font-semibold">{fmtEur(motoAmount)}</p>
            </div>
            <div className="rounded-lg bg-accent p-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground"><TrendingUp className="h-3 w-3" /> Investimento</div>
              <p className="text-lg font-semibold">{fmtEur(investAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Storico versamenti</h3>
        <div className="space-y-2">
          {(savings ?? []).map((r) => (
            <Card key={r.id}><CardContent className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{r.note ?? "Versamento"}</p>
                <p className="text-xs text-muted-foreground">{fmtDate(r.date)}</p>
              </div>
              <p className="text-sm font-semibold text-primary">+{fmtEur(Number(r.amount))}</p>
              <Button variant="ghost" size="icon" onClick={() => remove.mutate(r.id)}><Trash2 className="h-4 w-4" /></Button>
            </CardContent></Card>
          ))}
        </div>
      </div>
    </div>
  );
}
