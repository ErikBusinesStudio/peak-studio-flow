import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { api, categoriaLabel, mapsLink, type Cliente } from "@/lib/gestionale";
import { PageHead, Empty } from "@/components/app/bits";
import { BarsH, ChartCard } from "@/components/app/charts";
import { ContattoRapido } from "@/components/app/ContattoRapido";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/visite")({
  component: Visite,
  head: () => ({ meta: [{ title: "Giro visite — Peak Studio OS" }] }),
});

function Visite() {
  const clienti = useQuery({ queryKey: ["clienti"], queryFn: api.clienti.list });
  const [visita, setVisita] = useState<Cliente | null>(null);

  const gruppi = useMemo(() => {
    const m = new Map<string, Cliente[]>();
    (clienti.data ?? []).filter((c) => c.stato === "da_contattare").forEach((c) => {
      const k = c.comune ?? "Comune da definire";
      m.set(k, [...(m.get(k) ?? []), c]);
    });
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [clienti.data]);

  return (
    <>
      <PageHead kicker="Da contattare, per zona" title="Giro visite" />
      {clienti.error && <Empty>Errore: {(clienti.error as Error).message}</Empty>}
      <div className="mb-6">
        <ChartCard title="Attività da visitare per comune" empty={gruppi.length === 0}>
          <BarsH data={gruppi.map(([name, l]) => ({ name, value: l.length }))} />
        </ChartCard>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {gruppi.map(([comune, lista]) => (
          <section key={comune} className="surface p-5">
            <h2 className="title-md mb-2">{comune} <span className="text-muted-foreground">({lista.length})</span></h2>
            <ul className="divide-y divide-border">
              {lista.map((c) => {
                const mappa = mapsLink(c.indirizzo, c.comune);
                return (
                  <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                    <Link to="/clienti/$id" params={{ id: c.id }} className="min-w-0">
                      <p className="font-semibold">{c.nome}</p>
                      <p className="text-xs text-muted-foreground">{categoriaLabel(c.categoria)}{c.indirizzo ? ` · ${c.indirizzo}` : ""}</p>
                    </Link>
                    <div className="flex shrink-0 items-center gap-2">
                      {mappa && <a href={mappa} target="_blank" rel="noreferrer" aria-label="Apri in Maps" className="grid size-10 place-items-center rounded-full border border-border"><MapPin className="size-4" /></a>}
                      <Button size="sm" className="rounded-full" onClick={() => setVisita(c)}>Visitato</Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      {gruppi.length === 0 && !clienti.isLoading && <Empty>Nessuna attività da contattare.</Empty>}
      <ContattoRapido cliente={visita} onClose={() => setVisita(null)} canaleIniziale="di_persona" />
    </>
  );
}
