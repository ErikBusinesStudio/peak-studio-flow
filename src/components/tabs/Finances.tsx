import { useQuery } from "@tanstack/react-query";
import { api, fmtEur, fmtDate } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useMutate } from "@/lib/hooks";
import { useState } from "react";

export default function Finances() {
  const { data: incomes = [] } = useQuery({ queryKey: ["incomes"], queryFn: api.incomes.list });
  const { data: costs = [] } = useQuery({ queryKey: ["costs"], queryFn: api.costs.list });
  const addIncome = useMutate(["incomes"], (v) => api.incomes.create(v as never) as unknown as Promise<unknown>, "Entrata aggiunta");
  const addCost = useMutate(["costs"], (v) => api.costs.create(v as never) as unknown as Promise<unknown>, "Costo aggiunto");
  const rmIncome = useMutate(["incomes"], (id) => api.incomes.remove(id as string) as unknown as Promise<unknown>);
  const rmCost = useMutate(["costs"], (id) => api.costs.remove(id as string) as unknown as Promise<unknown>);

  const [tab, setTab] = useState<"in" | "out">("in");
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [cat, setCat] = useState("");

  const totalIn = (incomes ?? []).reduce((s, i) => s + Number(i.amount), 0);
  const totalOut = (costs ?? []).reduce((s, c) => s + Number(c.amount), 0);
  const net = totalIn - totalOut;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Finanze</h2>
          <p className="text-sm text-muted-foreground">Netto: <span className={net >= 0 ? "text-success font-semibold" : "text-destructive font-semibold"}>{fmtEur(net)}</span></p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Nuovo</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>{tab === "in" ? "Nuova entrata" : "Nuovo costo"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Descrizione" value={desc} onChange={(e) => setDesc(e.target.value)} />
              <Input type="number" placeholder="Importo €" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input placeholder="Categoria (opzionale)" value={cat} onChange={(e) => setCat(e.target.value)} />
              <Button className="w-full" disabled={!desc || !amount} onClick={() => {
                const payload = { description: desc, amount: Number(amount), date, category: cat || null };
                if (tab === "in") addIncome.mutate(payload); else addCost.mutate(payload);
                setDesc(""); setAmount(""); setCat(""); setOpen(false);
              }}>Aggiungi</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setTab("in")} className={`rounded-lg p-3 text-left ${tab === "in" ? "bg-primary text-primary-foreground" : "bg-card border"}`}>
          <p className="text-xs opacity-80">Entrate</p>
          <p className="text-lg font-semibold">{fmtEur(totalIn)}</p>
        </button>
        <button onClick={() => setTab("out")} className={`rounded-lg p-3 text-left ${tab === "out" ? "bg-primary text-primary-foreground" : "bg-card border"}`}>
          <p className="text-xs opacity-80">Costi</p>
          <p className="text-lg font-semibold">{fmtEur(totalOut)}</p>
        </button>
      </div>

      <div className="space-y-2">
        {tab === "in" && (incomes ?? []).map((i) => (
          <Card key={i.id}><CardContent className="p-3 flex items-center gap-3">
            <ArrowDownCircle className="h-5 w-5 text-success shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{i.description}</p>
              <p className="text-xs text-muted-foreground">{fmtDate(i.date)}{i.category ? ` · ${i.category}` : ""}</p>
            </div>
            <p className="text-sm font-semibold text-success">+{fmtEur(Number(i.amount))}</p>
            <Button variant="ghost" size="icon" onClick={() => rmIncome.mutate(i.id)}><Trash2 className="h-4 w-4" /></Button>
          </CardContent></Card>
        ))}
        {tab === "out" && (costs ?? []).map((c) => (
          <Card key={c.id}><CardContent className="p-3 flex items-center gap-3">
            <ArrowUpCircle className="h-5 w-5 text-destructive shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{c.description}</p>
              <p className="text-xs text-muted-foreground">{fmtDate(c.date)}{c.category ? ` · ${c.category}` : ""}{c.recurring ? " · ricorrente" : ""}</p>
            </div>
            <p className="text-sm font-semibold text-destructive">-{fmtEur(Number(c.amount))}</p>
            <Button variant="ghost" size="icon" onClick={() => rmCost.mutate(c.id)}><Trash2 className="h-4 w-4" /></Button>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
