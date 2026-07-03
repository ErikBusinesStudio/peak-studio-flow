import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, X, ChevronDown, ChevronRight, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { useList, useMutate } from "@/lib/hooks";
import { api, fmtDate, type DiaryEntry } from "@/lib/db";
import { useServerFn } from "@tanstack/react-start";
import { analyzeDiary, type DiaryAnalysis, type DiaryAction, type DiaryCategory } from "@/lib/diary-ai.functions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const CATS: DiaryCategory[] = ["Peak Studio", "Scuola", "Personale", "Idee", "Task"];

function actionLabel(a: DiaryAction): string {
  switch (a.type) {
    case "cliente": return `Aggiungere cliente "${a.name}"${a.status ? ` (${a.status.replace("_", " ")})` : ""}?`;
    case "entrata": return `Registrare entrata "${a.description}" da €${a.amount}?`;
    case "task": return `Aggiungere task "${a.title}"${a.priority ? ` (priorità ${a.priority})` : ""}?`;
    case "evento": return `Aggiungere evento "${a.title}" il ${a.date}${a.time ? ` alle ${a.time}` : ""}?`;
  }
}

export default function Diary() {
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [pending, setPending] = useState<{ content: string; analysis: DiaryAnalysis } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});
  const [skipped, setSkipped] = useState<Record<number, boolean>>({});
  const [confirmed, setConfirmed] = useState<Record<number, boolean>>({});

  const { data: entries } = useList("diary");
  const analyze = useServerFn(analyzeDiary);
  const qc = useQueryClient();

  const removeEntry = useMutate<string>(["diary"], (id) => api.diary.remove(id) as unknown as Promise<unknown>, "Voce eliminata");

  async function runAnalyze() {
    if (!text.trim()) return;
    setError(null);
    setAnalyzing(true);
    try {
      const res = await analyze({ data: { content: text } });
      setPending({ content: text, analysis: res });
      setSkipped({});
      setConfirmed({});
    } catch (e) {
      setError((e as Error).message || "Errore imprevisto");
    } finally {
      setAnalyzing(false);
    }
  }

  async function confirmAction(idx: number, a: DiaryAction) {
    try {
      if (a.type === "cliente") {
        const status = ["acquisito", "in_attesa", "da_contattare", "rifiutato"].includes(a.status || "")
          ? a.status : "da_contattare";
        await api.clients.create({ name: a.name, status: status as never, notes: a.notes ?? null, contact: null });
        qc.invalidateQueries({ queryKey: ["clients"] });
      } else if (a.type === "entrata") {
        await api.incomes.create({
          description: a.description,
          amount: a.amount,
          category: a.category ?? null,
          date: a.date || new Date().toISOString().slice(0, 10),
          client_id: null,
        });
        qc.invalidateQueries({ queryKey: ["incomes"] });
      } else if (a.type === "task") {
        await api.todos.create({ title: a.title, priority: (a.priority as never) || "media", done: false });
        qc.invalidateQueries({ queryKey: ["todos"] });
      } else if (a.type === "evento") {
        await api.events.create({ title: a.title, date: a.date, time: a.time ?? null, notes: a.notes ?? null });
        qc.invalidateQueries({ queryKey: ["events"] });
      }
      setConfirmed((s) => ({ ...s, [idx]: true }));
      toast.success("Azione confermata");
    } catch (e) {
      toast.error((e as Error).message || "Errore nel salvataggio");
    }
  }

  async function saveEntry() {
    if (!pending) return;
    try {
      await api.diary.create({
        content: pending.content,
        date: new Date().toISOString().slice(0, 10),
        ai_analysis: JSON.stringify(pending.analysis),
      });
      qc.invalidateQueries({ queryKey: ["diary"] });
      setPending(null);
      setText("");
      toast.success("Voce salvata");
    } catch (e) {
      toast.error((e as Error).message || "Errore nel salvataggio");
    }
  }

  function parseAnalysis(entry: DiaryEntry): DiaryAnalysis | null {
    if (!entry.ai_analysis) return null;
    try { return JSON.parse(entry.ai_analysis) as DiaryAnalysis; } catch { return null; }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Diario</h2>
        <p className="text-sm text-muted-foreground">Scrivi (o detta) la tua giornata. L'AI la organizza e propone azioni.</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <Textarea
            placeholder="Racconta la giornata: cosa è successo con Peak Studio, scuola, idee, task, nuovi contatti, entrate, eventi..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="resize-y"
            disabled={analyzing || !!pending}
          />
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs text-muted-foreground">{text.length} caratteri</span>
            <Button onClick={runAnalyze} disabled={analyzing || !text.trim() || !!pending}>
              {analyzing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analizzo...</> : <><Sparkles className="h-4 w-4 mr-2" /> Analizza</>}
            </Button>
          </div>
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {pending && (
        <Card className="border-primary/50">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-primary">Analisi AI</h3>
              <Button size="sm" variant="ghost" onClick={() => setPending(null)}>Annulla</Button>
            </div>

            {pending.analysis.summary && (
              <p className="text-sm italic border-l-2 border-primary pl-3">{pending.analysis.summary}</p>
            )}

            <div className="space-y-3">
              {CATS.map((c) => {
                const items = pending.analysis.categories[c] || [];
                if (items.length === 0) return null;
                return (
                  <div key={c}>
                    <Badge variant="secondary" className="mb-1">{c}</Badge>
                    <ul className="list-disc list-inside text-sm space-y-0.5 ml-1">
                      {items.map((it, i) => <li key={i}>{it}</li>)}
                    </ul>
                  </div>
                );
              })}
            </div>

            {pending.analysis.actions.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-sm font-medium">Azioni suggerite</p>
                {pending.analysis.actions.map((a, idx) => (
                  <div key={idx} className="border rounded-md p-3 space-y-2 bg-muted/30">
                    <p className="text-sm">{actionLabel(a)}</p>
                    <div className="flex gap-2">
                      {confirmed[idx] ? (
                        <Badge variant="default" className="bg-green-600"><Check className="h-3 w-3 mr-1" /> Aggiunto</Badge>
                      ) : skipped[idx] ? (
                        <Badge variant="outline">Saltato</Badge>
                      ) : (
                        <>
                          <Button size="sm" onClick={() => confirmAction(idx, a)}>
                            <Check className="h-4 w-4 mr-1" /> Conferma
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setSkipped((s) => ({ ...s, [idx]: true }))}>
                            <X className="h-4 w-4 mr-1" /> Salta
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t">
              <Button onClick={saveEntry}>Salva voce nel diario</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Storico</h3>
        {(!entries || entries.length === 0) && (
          <p className="text-sm text-muted-foreground">Nessuna voce salvata ancora.</p>
        )}
        {entries?.map((e) => {
          const a = parseAnalysis(e);
          const open = openIds[e.id];
          return (
            <Card key={e.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{fmtDate(e.date)}</span>
                  <Button size="icon" variant="ghost" onClick={() => removeEntry.mutate(e.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {a?.summary && <p className="text-sm font-medium">{a.summary}</p>}
                {a && (
                  <div className="space-y-2">
                    {CATS.map((c) => {
                      const items = a.categories[c] || [];
                      if (items.length === 0) return null;
                      return (
                        <div key={c}>
                          <Badge variant="secondary" className="mb-1 text-xs">{c}</Badge>
                          <ul className="list-disc list-inside text-sm space-y-0.5 ml-1">
                            {items.map((it, i) => <li key={i}>{it}</li>)}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button
                  className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setOpenIds((s) => ({ ...s, [e.id]: !s[e.id] }))}
                >
                  {open ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                  {open ? "Nascondi" : "Mostra"} testo originale
                </button>
                {open && (
                  <p className="text-sm whitespace-pre-wrap bg-muted/40 p-3 rounded-md">{e.content}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
