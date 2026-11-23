import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, categoriaLabel, fmtData, STATI, type Cliente, type Stato } from "@/lib/gestionale";
import { BarsH, ChartCard, STATO_COLOR } from "@/components/app/charts";
import { PageHead, Empty } from "@/components/app/bits";
import { ContattoRapido } from "@/components/app/ContattoRapido";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pipeline")({
  component: Pipeline,
  head: () => ({ meta: [{ title: "Pipeline — Peak Studio OS" }] }),
});

function Pipeline() {
  const qc = useQueryClient();
  const clienti = useQuery({ queryKey: ["clienti"], queryFn: api.clienti.list });
  const [contatto, setContatto] = useState<Cliente | null>(null);
  const [mostraRifiutati, setMostraRifiutati] = useState(false);

  const sposta = useMutation({
    mutationFn: ({ id, stato }: { id: string; stato: Stato }) => api.clienti.update(id, { stato }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clienti"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  // ordine funnel: da contattare → pagato, rifiutati in fondo
  const colonne = useMemo(() => {
    const ordine: Stato[] = ["da_contattare", "contattato", "in_trattativa", "accettato", "pagato", "rifiutato"];
    return ordine.map((id) => ({ ...STATI.find((s) => s.id === id)!, items: (clienti.data ?? []).filter((c) => c.stato === id) }));
  }, [clienti.data]);

  return (
    <>
      <PageHead kicker="Dal primo contatto al pagamento" title="Pipeline">
        <Button variant="outline" className="rounded-full" onClick={() => setMostraRifiutati((v) => !v)}>
          {mostraRifiutati ? "Nascondi rifiutati" : "Mostra rifiutati"}
        </Button>
      </PageHead>
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <ChartCard title="Imbuto commerciale" hint="Quanti clienti per fase" empty={(clienti.data ?? []).length === 0}>
          <BarsH data={colonne.map((c) => ({ name: c.short, value: c.items.length, color: STATO_COLOR[c.id] }))} />
        </ChartCard>
        <ChartCard title="Tassi di avanzamento" hint="Sul totale dei clienti già contattati (esclusi i da contattare)">
          {(() => {
            const n = (id: Stato) => colonne.find((c) => c.id === id)!.items.length;
            const contattati = (clienti.data ?? []).length - n("da_contattare");
            const pct = (x: number) => (contattati ? Math.round((x / contattati) * 100) : 0);
            const righe = [
              { l: "Accettati o pagati", v: n("accettato") + n("pagato") },
              { l: "In trattativa", v: n("in_trattativa") },
              { l: "Rifiutati", v: n("rifiutato") },
            ];
            return (
              <ul className="space-y-3 text-sm">
                {righe.map((r) => (
                  <li key={r.l}>
                    <div className="mb-1 flex justify-between"><span>{r.l}</span><strong>{pct(r.v)}% <span className="font-normal text-muted-foreground">({r.v}/{contattati})</span></strong></div>
                    <div className="h-2 rounded-full bg-ice-100"><div className="h-2 rounded-full bg-glacier-500" style={{ width: `${pct(r.v)}%` }} /></div>
                  </li>
                ))}
              </ul>
            );
          })()}
        </ChartCard>
      </div>

      {clienti.error && <Empty>Errore: {(clienti.error as Error).message}</Empty>}
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
        {colonne.filter((c) => mostraRifiutati || c.id !== "rifiutato").map((col) => (
          <section key={col.id} className="w-[290px] shrink-0 snap-start">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="hud">{col.label}</h2>
              <span className="hud rounded-full bg-ice-100 px-2.5 py-1 text-[10px]">{col.items.length}</span>
            </div>
            <ul className="space-y-3">
              {col.items.length === 0 && <li className="surface p-4 text-sm text-muted-foreground">Vuoto</li>}
              {col.items.map((c) => (
                <li key={c.id} className="surface p-3.5">
                  <Link to="/clienti/$id" params={{ id: c.id }} className="block">
                    <p className="font-display text-lg font-bold leading-tight">{c.nome}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{categoriaLabel(c.categoria)}{c.comune ? ` · ${c.comune}` : ""}</p>
                    {c.prossimo_contatto && <p className="hud mt-2 text-glacier-700">Follow-up {fmtData(c.prossimo_contatto)}</p>}
                  </Link>
                  <div className="mt-3 flex items-center gap-2">
                    <Select value={c.stato} onValueChange={(v) => sposta.mutate({ id: c.id, stato: v as Stato })}>
                      <SelectTrigger className="h-9 flex-1 text-xs" aria-label="Sposta in"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATI.map((s) => <SelectItem key={s.id} value={s.id}>{s.short}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" className="h-9 rounded-full" onClick={() => setContatto(c)}>Contatto</Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <ContattoRapido cliente={contatto} onClose={() => setContatto(null)} />
    </>
  );
}
