import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { differenceInCalendarDays, format, startOfMonth, addMonths } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { api, fmtData, fmtEur, STATI, categoriaLabel } from "@/lib/gestionale";
import { PageHead, Stat, Empty, StatoBadge } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({ meta: [{ title: "Home — Peak Studio OS" }] }),
});

function Home() {
  const qc = useQueryClient();
  const clienti = useQuery({ queryKey: ["clienti"], queryFn: api.clienti.list });
  const pagamenti = useQuery({ queryKey: ["pagamenti-all"], queryFn: api.pagamenti.listAll });
  const manutenzioni = useQuery({ queryKey: ["manutenzioni-all"], queryFn: api.manutenzioni.listAll });
  const impostazioni = useQuery({ queryKey: ["impostazioni"], queryFn: api.impostazioni.get });

  const [zero, setZero] = useState("");
  const saveZero = useMutation({
    mutationFn: (d: string | null) => api.impostazioni.update({ data_zero: d }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["impostazioni"] }); toast.success("Data zero salvata"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const d = useMemo(() => {
    const cl = clienti.data ?? [];
    const pg = pagamenti.data ?? [];
    const mn = manutenzioni.data ?? [];
    const imp = impostazioni.data;
    const oggi = new Date();
    const oggiIso = format(oggi, "yyyy-MM-dd");

    const perStato = Object.fromEntries(STATI.map((s) => [s.id, cl.filter((c) => c.stato === s.id).length]));
    const dopo = pg.filter((p) => p.periodo === "dopo" && p.stato === "incassato");
    const prima = pg.filter((p) => p.periodo === "prima" && p.stato === "incassato");
    const incassatoDopo = dopo.reduce((s, p) => s + Number(p.importo_netto), 0);
    const primaLordo = prima.reduce((s, p) => s + Number(p.importo_lordo), 0);
    const primaNetto = prima.reduce((s, p) => s + Number(p.importo_netto), 0);

    const obiettivo = Number(imp?.obiettivo ?? 10000);
    const scadenza = imp?.scadenza ?? "2027-06-08";
    const giorni = Math.max(0, differenceInCalendarDays(new Date(scadenza), oggi));
    const settimane = Math.max(giorni / 7, 1 / 7);
    const mancano = Math.max(0, obiettivo - incassatoDopo);
    const aSettimana = giorni === 0 ? mancano : mancano / settimane;

    const prossimoPrimo = startOfMonth(addMonths(oggi, 1));
    const prossimoPrimoIso = format(prossimoPrimo, "yyyy-MM-dd");
    const attive = mn.filter((m) => m.attiva);
    const mensileNetto = attive
      .filter((m) => !m.attiva_dal || m.attiva_dal <= prossimoPrimoIso)
      .reduce((s, m) => s + Number(m.importo_netto), 0);

    const followup = cl
      .filter((c) => c.prossimo_contatto && c.prossimo_contatto <= oggiIso && !["rifiutato", "pagato"].includes(c.stato))
      .sort((a, b) => (a.prossimo_contatto! < b.prossimo_contatto! ? -1 : 1));
    const daRicontattare = cl.filter((c) => c.stato === "contattato" || c.stato === "in_trattativa");

    return { perStato, total: cl.length, incassatoDopo, primaLordo, primaNetto, obiettivo, scadenza, giorni, mancano, aSettimana,
      prossimoPrimo, mensileNetto, nManut: attive.length, followup, daRicontattare, dataZero: imp?.data_zero ?? null };
  }, [clienti.data, pagamenti.data, manutenzioni.data, impostazioni.data]);

  const loading = clienti.isLoading || pagamenti.isLoading;
  const errore = clienti.error ?? pagamenti.error ?? manutenzioni.error ?? impostazioni.error;
  const pct = d.obiettivo > 0 ? Math.min(100, (d.incassatoDopo / d.obiettivo) * 100) : 0;

  return (
    <>
      <PageHead kicker="Campo base" title="Home" />

      {errore && (
        <div className="surface mb-6 border-destructive/40 p-5 text-sm">
          <p className="font-semibold text-destructive">Impossibile leggere i dati: {(errore as Error).message}</p>
          <p className="mt-1 text-muted-foreground">Se è la prima volta, controlla che la migrazione del database v2 sia stata applicata e di aver effettuato l&apos;accesso.</p>
        </div>
      )}

      {/* Obiettivo */}
      <section className="surface-deep mb-6 p-6 md:p-8">
        <p className="hud text-white/70">Obiettivo · {fmtEur(d.obiettivo)} entro {fmtData(d.scadenza)}</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <p className="font-display text-5xl font-extrabold leading-none tracking-tight md:text-7xl">{loading ? "…" : fmtEur(d.incassatoDopo)}</p>
          <p className="hud text-white/70">{d.giorni} giorni · {Math.round(d.giorni / 7)} settimane</p>
        </div>
        <Progress value={pct} className="mt-5 h-3 bg-white/15 [&>div]:bg-[hsl(191_100%_68%)]" />
        <div className="mt-4 grid gap-3 text-sm text-white/80 sm:grid-cols-3">
          <p>Mancano <strong className="text-white">{fmtEur(d.mancano)}</strong></p>
          <p>Servono <strong className="text-white">{fmtEur(Math.ceil(d.aSettimana))}</strong> a settimana</p>
          <p>Conta solo l&apos;incassato <strong className="text-white">netto</strong> dopo la data zero</p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/15 pt-5">
          <span className="hud text-white/70">Data zero</span>
          {d.dataZero ? (
            <>
              <strong>{fmtData(d.dataZero)}</strong>
              <Button size="sm" variant="secondary" className="rounded-full" onClick={() => saveZero.mutate(null)}>Azzera</Button>
            </>
          ) : (
            <>
              <span className="text-sm text-white/80">non impostata: parte con la prima vendita dopo il 17/11/2026</span>
              <Input type="date" value={zero} onChange={(e) => setZero(e.target.value)} className="h-9 w-40 border-white/30 bg-white/10 text-white" />
              <Button size="sm" disabled={!zero} className="rounded-full" onClick={() => saveZero.mutate(zero)}>Imposta</Button>
            </>
          )}
        </div>
      </section>

      {/* Funnel clienti */}
      <section className="mb-6">
        <p className="kicker mb-3">Clienti · {d.total} schede</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {STATI.map((s) => (
            <Link key={s.id} to="/clienti" search={{ stato: s.id }} className="surface block p-4 transition-transform hover:-translate-y-0.5">
              <p className="hud text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-display text-4xl font-extrabold leading-none">{d.perStato[s.id] ?? 0}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Numeri */}
      <section className="mb-6 grid gap-3 md:grid-cols-3">
        <Stat label="Storico · incassato lordo" value={fmtEur(d.primaLordo)} hint={`Netto ${fmtEur(d.primaNetto)} · periodo "prima", non conta per i 10.000 €`} />
        <Stat label="Manutenzioni attive" value={`${d.nManut}`} hint={`${fmtEur(d.mensileNetto)} netti dal ${format(d.prossimoPrimo, "d MMMM", { locale: it })}`} />
        <Stat label="Follow-up scaduti" value={`${d.followup.length}`} hint={d.followup.length ? "Contatti con scadenza oggi o passata" : "Nessun follow-up in ritardo"} />
      </section>

      {/* Azioni */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="surface p-5">
          <h2 className="title-md mb-4">Da ricontattare</h2>
          {d.daRicontattare.length === 0 ? <Empty>Nessuno al momento.</Empty> : (
            <ul className="divide-y divide-border">
              {d.daRicontattare.map((c) => (
                <li key={c.id}>
                  <Link to="/clienti/$id" params={{ id: c.id }} className="flex items-center justify-between gap-3 py-3">
                    <span>
                      <span className="block font-semibold">{c.nome}</span>
                      <span className="text-sm text-muted-foreground">{categoriaLabel(c.categoria)}{c.comune ? ` · ${c.comune}` : ""}</span>
                    </span>
                    <StatoBadge stato={c.stato} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="surface p-5">
          <h2 className="title-md mb-4">Follow-up scaduti <Link to="/followup" className="hud ml-2 text-glacier-700 underline">Vedi tutti</Link></h2>
          {d.followup.length === 0 ? <Empty>Nessun follow-up in ritardo. Imposta &quot;Prossimo contatto&quot; nelle schede per vederli qui.</Empty> : (
            <ul className="divide-y divide-border">
              {d.followup.map((c) => (
                <li key={c.id}>
                  <Link to="/clienti/$id" params={{ id: c.id }} className="flex items-center justify-between gap-3 py-3">
                    <span className="font-semibold">{c.nome}</span>
                    <span className="hud text-muted-foreground">{fmtData(c.prossimo_contatto)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
