import { useQuery } from "@tanstack/react-query";
import { api, type Priority } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useMutate } from "@/lib/hooks";
import { useState } from "react";

const PRIORITY_COLORS: Record<Priority, string> = {
  alta: "bg-rose-500",
  media: "bg-amber-500",
  bassa: "bg-slate-400",
};

export default function Todos() {
  const { data: todos = [] } = useQuery({ queryKey: ["todos"], queryFn: api.todos.list });
  const create = useMutate(["todos"], (v) => api.todos.create(v as never) as unknown as Promise<unknown>, "Task aggiunto");
  const update = useMutate(["todos"], ({ id, ...v }: { id: string } & Record<string, unknown>) => api.todos.update(id, v as never) as unknown as Promise<unknown>);
  const remove = useMutate(["todos"], (id) => api.todos.remove(id as string) as unknown as Promise<unknown>);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("media");

  const sorted = [...(todos ?? [])].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const order = { alta: 0, media: 1, bassa: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">To-Do</h2>
          <p className="text-sm text-muted-foreground">{(todos ?? []).filter((t) => !t.done).length} attivi</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Nuovo</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Nuovo task</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Cosa devi fare?" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="bassa">Bassa</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full" disabled={!title} onClick={() => {
                create.mutate({ title, priority, done: false });
                setTitle(""); setPriority("media"); setOpen(false);
              }}>Aggiungi</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {sorted.map((t) => (
          <Card key={t.id} className={t.done ? "opacity-50" : ""}>
            <CardContent className="p-3 flex items-center gap-3">
              <Checkbox checked={t.done} onCheckedChange={(v) => update.mutate({ id: t.id, done: !!v })} />
              <span className={`h-2 w-2 rounded-full ${PRIORITY_COLORS[t.priority]}`} />
              <p className={`flex-1 text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
              <Button variant="ghost" size="icon" onClick={() => remove.mutate(t.id)}><Trash2 className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
