import { useQuery } from "@tanstack/react-query";
import { api, fmtDate } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import { useMutate } from "@/lib/hooks";
import { useState } from "react";

export default function CalendarTab() {
  const { data: events = [] } = useQuery({ queryKey: ["events"], queryFn: api.events.list });
  const create = useMutate(["events"], (v) => api.events.create(v as never) as unknown as Promise<unknown>, "Evento aggiunto");
  const remove = useMutate(["events"], (id) => api.events.remove(id as string) as unknown as Promise<unknown>);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const upcoming = (events ?? []).filter((e) => new Date(e.date) >= new Date(new Date().toDateString()));
  const past = (events ?? []).filter((e) => new Date(e.date) < new Date(new Date().toDateString()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Calendario</h2>
          <p className="text-sm text-muted-foreground">Prossimi eventi e scadenze</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Nuovo</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Nuovo evento</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Titolo" value={title} onChange={(e) => setTitle(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <Textarea placeholder="Note" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Button className="w-full" disabled={!title || !date} onClick={() => {
                create.mutate({ title, date, time: time || null, notes: notes || null });
                setTitle(""); setDate(""); setTime(""); setNotes(""); setOpen(false);
              }}>Aggiungi</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">In arrivo</h3>
        <div className="space-y-2">
          {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Nessun evento in programma.</p>}
          {upcoming.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="rounded-lg bg-accent p-2"><CalendarDays className="h-4 w-4 text-primary" /></div>
                <div className="flex-1">
                  <p className="font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{fmtDate(e.date)}{e.time ? ` · ${e.time}` : ""}</p>
                  {e.notes && <p className="text-xs mt-1">{e.notes}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(e.id)}><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Passati</h3>
          <div className="space-y-2 opacity-60">
            {past.map((e) => (
              <Card key={e.id}><CardContent className="p-3 flex items-center justify-between">
                <div><p className="text-sm">{e.title}</p><p className="text-xs text-muted-foreground">{fmtDate(e.date)}</p></div>
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(e.id)}><Trash2 className="h-4 w-4" /></Button>
              </CardContent></Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
