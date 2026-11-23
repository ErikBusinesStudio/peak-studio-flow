import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, differenceInCalendarDays, format, subDays } from "date-fns";
import { MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { api, calendarLink, canaleLabel, categoriaLabel, fmtData, telLink, whatsappLink, type Cliente } from "@/lib/gestionale";
import { BarsV, ChartCard, Donut } from "@/components/app/charts";
import { PageHead, Empty, StatoBadge } from "@/components/app/bits";
import { ContattoRapido } from "@/components/app/ContattoRapido";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/followup")({
  component: Followup,
  head: () => ({ meta: [{ title: "Follow-up — Peak Studio OS" }] }),
});

function Followup() {
  const qc = useQueryClient();
  const clienti = useQuery({ queryKey: ["clienti"], queryFn: api.clienti.list });
  const contatti = useQuery({ queryKey: ["contatti-all"], queryFn: api.contatti.listAll });
  const [registra, setRegistra] = useState<Cliente | null>(null);

  const rimanda = useMutation({
    mutationFn: ({ id, giorni }: { id: string; giorni: number }) =>
      api.clienti.update(id, { prossimo_contatto: format(addDays(new Date(), giorni), "yyyy-MM-dd") }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clienti"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const g = useMemo(() => {
    const oggi = format(new Date(), "yyyy-MM-dd");
    const fra7 = format(addDays(new Date(), 7), "yyyy-MM-dd");
    const attivi = (clienti.data ?? []).filter((c) => c.stato !== "rifiutato" && c.stato !== "pagato");
    const conData = attivi.filter((c) => c.prossimo_contatto);
    const ultimo = new Map<string, string>();
    for (const x of contatti.data ?? []) {
      if (x.data && (!ultimo.get(x.cliente_id) || x.data > ultimo.get(x.cliente_id)!)) ultimo.set(x.cliente_id, x.data);
    }
    const ord = (a: Cliente, b: Cliente) => (a.prossimo_contatto! < b.prossimo_contatto! ? -1 : 1);
    return {
      scaduti: conData.filter((c) => c.prossimo_contatto! < oggi).sort(ord),
      oggi: conData.filter((c) => c.prossimo_contatto === oggi),
      prossimi: conData.filter((c) => c.prossimo_contatto! > oggi && c.prossimo_contatto! <= fra7).sort(ord),
      senzaData: attivi.filter((c) => !c.prossimo_contatto && (c.stato === "contattato" || c.stato === "in_trattativa" || c.stato === "accettato")),
      ultimo,
    };
  }, [clienti.data, contatti.data]);

  const grafGiorni = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const day = format(subDays(new Date(), 13 - i), "yyyy-MM-dd");
    return { name: format(subDays(new Date(), 13 - i), "d/M"), contatti: (contatti.data ?? []).filter((c) => c.data === day).length };
  }), [contatti.data]);
  const grafCanali = useMemo(() => {
    const m = new Map<string, number>();
    (contatti.data ?? []).forEach((c) => m.set(canaleLabel(c.canale), (m.get(canaleLabel(c.canale)) ?? 0) + 1));
    return [...m.entries()].map(([name, value]) => ({ name, value }));
  }, [contatti.data]);

  const riga = (c: Cliente) => {
    const wa = whatsappLink(c.telefono), tel = telLink(c.telefono);
    const last = g.ultimo.get(c.id);
    return (
      <li key={c.id} className="py-3.5">
        <div className="flex items-start justify-between gap-3">
          <Link to="/clienti/$id" params={{ id: c.id }} className="min-w-0">
            <p className="font-semibold">{c.nome}</p>
            <p className="text-xs text-muted-foreground">
              {categoriaLabel(c.categoria)}{c.comune ? ` · ${c.comune}` : ""}
              {last ? ` · ultimo contatto ${differenceInCalendarDays(new Date(), new Date(last))} gg fa` : " · mai registrato"}
            </p>
            {c.prossimo_contatto && <p className="hud mt-1 text-glacier-700">{fmtData(c.prossimo_contatto)}</p>}
          </Link>
          <StatoBadge stato={c.stato} />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {tel && <a href={tel} className="hud inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2"><Phone className="size-3.5" />Chiama</a>}
          {wa && <a href={wa} target="_blank" rel="noreferrer" className="hud inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2"><MessageCircle className="size-3.5" />WhatsApp</a>}
          {c.prossimo_contatto && (
            <a href={calendarLink(`Ricontattare ${c.nome}`, c.prossimo_contatto, `Peak Studio · ${categoriaLabel(c.categoria)}${c.telefono ? ` · ${c.telefono}` : ""}`)}
              target="_blank" rel="noreferrer" className="hud inline-flex items-center rounded-full border border-border px-3 py-2">Calendar</a>
          )}
          <Button size="sm" className="rounded-full" onClick={() => setRegistra(c)}>Fatto</Button>
          {[1, 3, 7].map((n) => (
            <Button key={n} size="sm" variant="ghost" className="rounded-full" onClick={() => rimanda.mutate({ id: c.id, giorni: n })}>+{n}g</Button>
          ))}
        </div>
      </li>
    );
  };

  const blocco = (titolo: string, lista: Cliente[], vuoto: string) => (
    <section className="surface p-5">
      <h2 className="title-md mb-1">{titolo} <span className="text-muted-foreground">({lista.length})</span></h2>
      {lista.length === 0 ? <Empty>{vuoto}</Empty> : <ul className="divide-y divide-border">{lista.map(riga)}</ul>}
    </section>
  );

  return (
    <>
      <PageHead kicker="Chi ricontattare" title="Follow-up" />
      {clienti.error && <Empty>Errore: {(clienti.error as Error).message}</Empty>}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <ChartCard title="Contatti negli ultimi 14 giorni" empty={(contatti.data ?? []).length === 0}>
          <BarsV data={grafGiorni} series={[{ key: "contatti", label: "Contatti", color: "#2f6fb5" }]} height={180} />
        </ChartCard>
        <ChartCard title="Contatti per canale" empty={grafCanali.length === 0}><Donut data={grafCanali} /></ChartCard>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {blocco("Scaduti", g.scaduti, "Nessun follow-up in ritardo.")}
        {blocco("Oggi", g.oggi, "Niente in programma per oggi.")}
        {blocco("Prossimi 7 giorni", g.prossimi, "Nessun follow-up nei prossimi 7 giorni.")}
        {blocco("Senza data", g.senzaData, "Tutti i clienti attivi hanno una data.")}
      </div>
      <ContattoRapido cliente={registra} onClose={() => setRegistra(null)} />
    </>
  );
}
