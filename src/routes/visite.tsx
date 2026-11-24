import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, MapPin, MessageCircle, Phone } from "lucide-react";
import {
  api, categoriaLabel, distanzaLabel, mapsLink, modalitaCfg, orarioOggi, telLink, whatsappLink,
  type Cliente,
} from "@/lib/gestionale";
import { PageHead, Empty } from "@/components/app/bits";
import { BarsH, ChartCard } from "@/components/app/charts";
import { ContattoRapido } from "@/components/app/ContattoRapido";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/visite")({
  component: Visite,
  head: () => ({ meta: [{ title: "Giro visite — Peak Studio OS" }] }),
});

/* I giri raggruppano le zone vicine tra loro: un solo viaggio per ogni gruppo. */
const GIRI: { id: string; titolo: string; descr: string; zone: string[] }[] = [
  { id: "g1", titolo: "Giro 1 · Casalzuigno, Cuveglio, Cuvio", descr: "Entro 5 km da casa: un pomeriggio, tutto a pochi minuti", zone: ["Casalzuigno", "Cuveglio", "Cuvio", "Cuveglio est"] },
  { id: "g2", titolo: "Giro 2 · Brenta, Cittiglio, Caravate", descr: "Verso ovest lungo la valle, 3–11 km da casa (Laveno a 4–5 km da Cittiglio)", zone: ["Brenta", "Cittiglio", "Caravate", "Laveno-Mombello"] },
  { id: "g3", titolo: "Giro 3 · Cocquio, Besozzo e Gavirate", descr: "Verso sud: Cocquio ~10 min, Gavirate ~14 km (20–25 min). Un solo viaggio", zone: ["Cocquio-Trevisago", "Besozzo", "Gavirate"] },
];
const PRIORITA_RICONTATTO = 8; // le prime 8 posizioni sono i già contattati senza esito

function Visite() {
  const clienti = useQuery({ queryKey: ["clienti"], queryFn: api.clienti.list });
  const [visita, setVisita] = useState<{ c: Cliente; canale: "di_persona" | "telefono" } | null>(null);

  const daContattare = useMemo(
    () => (clienti.data ?? []).filter((c) => c.stato === "da_contattare")
      .sort((a, b) => (a.priorita ?? 999) - (b.priorita ?? 999) || a.nome.localeCompare(b.nome, "it")),
    [clienti.data],
  );

  const sezioni = useMemo(() => {
    const ricontatti = daContattare.filter((c) => (c.priorita ?? 999) <= PRIORITA_RICONTATTO);
    const resto = daContattare.filter((c) => (c.priorita ?? 999) > PRIORITA_RICONTATTO);
    const giri = GIRI.map((g) => ({ ...g, lista: resto.filter((c) => g.zone.includes(c.zona ?? "")) }));
    const usati = new Set(giri.flatMap((g) => g.lista.map((c) => c.id)));
    const altri = resto.filter((c) => !usati.has(c.id));
    return { ricontatti, giri, altri };
  }, [daContattare]);

  const conteggi = useMemo(() => {
    const m = new Map<string, number>();
    daContattare.forEach((c) => { const k = c.comune ?? "Sede da definire"; m.set(k, (m.get(k) ?? 0) + 1); });
    return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [daContattare]);

  const dalVivo = daContattare.filter((c) => c.modalita_contatto === "di_persona").length;
  const alTelefono = daContattare.filter((c) => c.modalita_contatto === "telefono").length;

  return (
    <>
      <PageHead kicker={`${daContattare.length} da contattare · ${dalVivo} di persona · ${alTelefono} per telefono`} title="Giro visite" />
      {clienti.error && <Empty>Errore: {(clienti.error as Error).message}</Empty>}
      <p className="mb-6 text-sm text-muted-foreground">
        Distanze e tempi sono stime da Casalzuigno (coordinate + strade della valle), non da navigatore. Prima i già contattati senza esito, poi i giri per zona.
      </p>

      <div className="mb-8">
        <ChartCard title="Attività da contattare per comune" empty={conteggi.length === 0}>
          <BarsH data={conteggi} />
        </ChartCard>
      </div>

      <div className="space-y-10">
        <Sezione titolo="Già contattati: ricontatto" descr="WhatsApp o visita senza esito. Vanno per primi." lista={sezioni.ricontatti} onAzione={(c, canale) => setVisita({ c, canale })} />
        {sezioni.giri.map((g) => (
          <Sezione key={g.id} titolo={g.titolo} descr={g.descr} lista={g.lista} onAzione={(c, canale) => setVisita({ c, canale })} />
        ))}
        {sezioni.altri.length > 0 && (
          <Sezione titolo="Altre attività" descr="Senza zona assegnata" lista={sezioni.altri} onAzione={(c, canale) => setVisita({ c, canale })} />
        )}
      </div>
      {daContattare.length === 0 && !clienti.isLoading && <Empty>Nessuna attività da contattare.</Empty>}
      <ContattoRapido cliente={visita?.c ?? null} onClose={() => setVisita(null)} canaleIniziale={visita?.canale ?? "di_persona"} />
    </>
  );
}

function Sezione({ titolo, descr, lista, onAzione }: {
  titolo: string; descr: string; lista: Cliente[]; onAzione: (c: Cliente, canale: "di_persona" | "telefono") => void;
}) {
  if (lista.length === 0) return null;
  return (
    <section>
      <div className="mb-3 border-b-2 border-deep-900 pb-2">
        <h2 className="font-display text-2xl font-extrabold tracking-tight">{titolo} <span className="text-muted-foreground">({lista.length})</span></h2>
        <p className="text-sm text-muted-foreground">{descr}</p>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {lista.map((c) => <Voce key={c.id} c={c} onAzione={onAzione} />)}
      </ul>
    </section>
  );
}

function Voce({ c, onAzione }: { c: Cliente; onAzione: (c: Cliente, canale: "di_persona" | "telefono") => void }) {
  const mod = modalitaCfg(c.modalita_contatto);
  const mappa = mapsLink(c.indirizzo, c.comune);
  const tel = telLink(c.telefono);
  const wa = whatsappLink(c.telefono);
  const dist = distanzaLabel(c);
  const oggi = orarioOggi(c);
  return (
    <li className="surface p-4">
      <div className="flex items-start justify-between gap-3">
        <Link to="/clienti/$id" params={{ id: c.id }} className="min-w-0">
          <p className="font-display text-lg font-bold leading-tight">
            {c.priorita && <span className="mr-2 text-muted-foreground">#{c.priorita}</span>}{c.nome}
          </p>
          <p className="mt-1 flex items-start gap-1.5 text-sm font-semibold">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span>{[c.indirizzo, c.comune].filter(Boolean).join(", ") || "sede da definire"}</span>
          </p>
          <p className="text-xs text-muted-foreground">{categoriaLabel(c.categoria)}{dist ? ` · ${dist}` : ""}</p>
        </Link>
        {mod && <span className={cn("hud shrink-0 rounded-full border px-2.5 py-1 text-[10px]", mod.cls)}>{mod.label}</span>}
      </div>
      {c.motivo_modalita && <p className="mt-2 text-sm">{c.motivo_modalita}</p>}
      {oggi && <p className="hud mt-2 text-muted-foreground">Oggi: {oggi}</p>}
      {c.da_confermare && (
        <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />{c.da_confermare}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {mappa && <a href={mappa} target="_blank" rel="noreferrer" aria-label="Apri in Maps" className="grid size-10 place-items-center rounded-full border border-border"><MapPin className="size-4" /></a>}
        {tel && <a href={tel} aria-label="Chiama" className="grid size-10 place-items-center rounded-full border border-border"><Phone className="size-4" /></a>}
        {wa && <a href={wa} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="grid size-10 place-items-center rounded-full border border-border"><MessageCircle className="size-4" /></a>}
        <Button size="sm" className="ml-auto rounded-full" onClick={() => onAzione(c, c.modalita_contatto === "telefono" ? "telefono" : "di_persona")}>
          {c.modalita_contatto === "telefono" ? "Chiamato" : "Visitato"}
        </Button>
      </div>
    </li>
  );
}
