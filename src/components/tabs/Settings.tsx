import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useMutate } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

const COLORS = [
  { hex: "#6366f1", name: "Indigo" },
  { hex: "#8b5cf6", name: "Violet" },
  { hex: "#ec4899", name: "Pink" },
  { hex: "#ef4444", name: "Red" },
  { hex: "#f59e0b", name: "Amber" },
  { hex: "#10b981", name: "Emerald" },
  { hex: "#06b6d4", name: "Cyan" },
  { hex: "#0f172a", name: "Navy" },
];

export default function SettingsTab() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: api.settings.get });
  const update = useMutate(["settings"], (v) => api.settings.update(v as never) as unknown as Promise<unknown>, "Impostazioni salvate");

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [split, setSplit] = useState(50);
  const [color, setColor] = useState("#6366f1");

  useEffect(() => {
    if (!settings) return;
    setName(settings.dashboard_name);
    setGoal(String(settings.savings_goal));
    setDeadline(settings.savings_deadline ?? "");
    setSplit(settings.moto_split);
    setColor(settings.primary_color);
  }, [settings]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Impostazioni</h2>
        <p className="text-sm text-muted-foreground">Personalizza la tua dashboard</p>
      </div>

      <Card><CardContent className="p-4 space-y-4">
        <div className="space-y-1.5">
          <Label>Nome dashboard</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Colore principale</Label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button key={c.hex} onClick={() => setColor(c.hex)}
                className="relative h-10 w-10 rounded-full border-2 transition-all"
                style={{ backgroundColor: c.hex, borderColor: color === c.hex ? "#000" : "transparent" }}
                aria-label={c.name}>
                {color === c.hex && <Check className="h-4 w-4 text-white absolute inset-0 m-auto" />}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Obiettivo risparmi (€)</Label>
          <Input type="number" value={goal} onChange={(e) => setGoal(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Scadenza obiettivo</Label>
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Ripartizione: Moto {split}% · Investimento {100 - split}%</Label>
          <Slider value={[split]} onValueChange={(v) => setSplit(v[0])} min={0} max={100} step={5} />
        </div>

        <Button className="w-full" onClick={() => update.mutate({
          dashboard_name: name,
          primary_color: color,
          savings_goal: Number(goal),
          savings_deadline: deadline || null,
          moto_split: split,
        })}>Salva</Button>
      </CardContent></Card>
    </div>
  );
}
