import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function Diary() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Diario</h2>
        <p className="text-sm text-muted-foreground">Riflessioni giornaliere con analisi AI</p>
      </div>
      <Card>
        <CardContent className="p-6 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-accent flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <p className="font-medium">Diario AI in arrivo (Fase 2)</p>
          <p className="text-sm text-muted-foreground">
            Nella prossima fase attivo l'inserimento delle voci di diario con analisi automatica via Gemini
            (mood, temi ricorrenti, suggerimenti). La tabella è già pronta nel database.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
