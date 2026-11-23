import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addMonths, format, startOfMonth } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { api, fmtData, fmtEur, tipoServizioLabel, type Pagamento } from "@/lib/gestionale";
import { BarsH, BarsV, ChartCard, Donut, Lines } from "@/components/app/charts";
import { PageHead, Stat, Empty } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/finanze")({
  component: Finanze,
  head: () => ({ meta: [{ title: "Finanze — Peak Studio OS" }] }),
});

const sum = (a: number[]) => a.reduce((s, x) => s + x, 0);

function Finanze() {
  const qc = useQueryClient();
  const clienti = useQuery({ queryKey: ["clienti"], queryFn: api.clienti.list });
  const pagamenti = useQuery({ queryKey: ["pagamenti-all"], queryFn: api.pagamenti.listAll });
  const manut = useQuery({ queryKey: ["manutenzioni-all"], queryFn: api.manutenzioni.listAll });
  const servizi = useQuery({ queryKey: ["servizi-all"], queryFn: api.servizi.listAll });
  const imp = useQuery({ queryKey: ["impostazioni"], queryFn: api.impostazioni.get });

  const nome = useMemo(() => new Map((clienti.data ?? []).map((c) => [c.id, c.nome])), [clienti.data]);
  const [filtro, setFiltro] = useState<"tutti" | "dopo" | "prima" | "da_incassare">("tutti");

  const refresh = () => { qc.invalidateQueries({ queryKey: ["pagamenti-all"] }); qc.invalidateQueries({ queryKey: ["manutenzioni-all"] }); };
  const onError = (e: Error) => toast.error(e.message);
  const toggle = useMutation({
    mutationFn: (p: Pagamento) => api.pagamenti.update(p.id, { stato: p.stato === "incassato" ? "da_incassare" : "incassato" }),
    onSuccess: refresh, onError,
  });
  const toggleManut = useMutation({
    mutationFn: ({ id, attiva }: { id: string; attiva: boolean }) => api.manutenzioni.update(id, { attiva }),
    onSuccess: refresh, onError,
  });

  const d = useMemo(() => {
    const pg = pagamenti.data ?? [];
    const mn = (manut.data ?? []).filter((m) => m.attiva);
    const obiettivo = Number(imp.data?.obiettivo ?? 10000);
    const scadenza = imp.data?.scadenza ?? "2027-06-08";
    const dopoInc = sum(pg.filter((p) => p.periodo === "dopo" && p.stato === "incassato").map((p) => Number(p.importo_netto)));
    const dopoDa = sum(pg.filter((p) => p.periodo === "dopo" && p.stato === "da_incassare").map((p) => Number(p.importo_netto)));
    const prima = pg.filter((p) => p.periodo === "prima" && p.stato === "incassato");
    const primaLordo = sum(prima.map((p) => Number(p.importo_lordo)));
    const primaNetto = sum(prima.map((p) => Number(p.importo_netto)));

    // proiezione manutenzioni: incasso il 1° di ogni mese, da domani fino alla scadenza
    const mesi: { data: string; label: string; netto: number }[] = [];
    for (let m = startOfMonth(addMonths(new Date(), 1)); format(m, "yyyy-MM-dd") <= scadenza; m = addMonths(m, 1)) {
      const iso = format(m, "yyyy-MM-dd");
      const netto = sum(mn.filter((x) => !x.attiva_dal || x.attiva_dal <= iso).map((x) => Number(x.importo_netto)));
      mesi.push({ data: iso, label: format(m, "MMM yyyy", { locale: it }), netto });
    }
    const manutProiez = sum(mesi.map((x) => x.netto));
    const previsto = dopoInc + dopoDa + manutProiez;
    const gap = Math.max(0, obiettivo - previsto);

    // ticket medio: netto per cliente pagato nello storico (esclude le manutenzioni ricorrenti, indicativo)
    const primaPerCliente = new Map<string, number>();
    prima.forEach((p) => primaPerCliente.set(p.cliente_id, (primaPerCliente.get(p.cliente_id) ?? 0) + Number(p.importo_netto)));
    const ticket = primaPerCliente.size ? sum([...primaPerCliente.values()]) / primaPerCliente.size : 0;
    const venditeNecessarie = ticket > 0 ? Math.ceil(gap / ticket) : null;

    // cumulato previsto: incassato + da incassare, poi +manutenzioni ogni 1° del mese
    let cum = dopoInc + dopoDa;
    const cumulato = [{ name: "Oggi", previsto: Math.round(cum) }, ...mesi.map((m) => { cum += m.netto; return { name: m.label, previsto: Math.round(cum) }; })];

    const perMese = new Map<string, { name: string; storico: number; dopo: number; k: string }>();
    pg.filter((p) => p.stato === "incassato" && p.data).forEach((p) => {
      const k = p.data!.slice(0, 7);
      const r = perMese.get(k) ?? { name: format(new Date(p.data!), "MMM yy", { locale: it }), storico: 0, dopo: 0, k };
      if (p.periodo === "prima") r.storico += Number(p.importo_netto); else r.dopo += Number(p.importo_netto);
      perMese.set(k, r);
    });
    const incassiMese = [...perMese.values()].sort((a, b) => (a.k < b.k ? -1 : 1));
    const perCli = new Map<string, number>();
    pg.filter((p) => p.stato === "incassato").forEach((p) => perCli.set(p.cliente_id, (perCli.get(p.cliente_id) ?? 0) + Number(p.importo_netto)));
    const perCliente = [...perCli.entries()].map(([id, value]) => ({ id, value })).sort((a, b) => b.value - a.value);

    return { cumulato, incassiMese, perCliente, obiettivo, dopoInc, dopoDa, primaLordo, primaNetto, mesi, manutProiez, previsto, gap, ticket, venditeNecessarie, nManut: mn.length };
  }, [pagamenti.data, manut.data, imp.data]);

  const lista = (pagamenti.data ?? [])
    .filter((p) => filtro === "tutti" || (filtro === "da_incassare" ? p.stato === "da_incassare" : p.periodo === filtro))
    .sort((a, b) => ((b.data ?? "") > (a.data ?? "") ? 1 : -1));

  return (
    <>
      <PageHead kicker="Soldi" title="Finanze" />
      {(pagamenti.error || manut.error) && <Empty>Errore: {((pagamenti.error ?? manut.error) as Error).message}</Empty>}

      <section className="mb-6 grid gap-3 md:grid-cols-4">
        <Stat label="Incassato dopo data zero (netto)" value={fmtEur(d.dopoInc)} tone="deep" hint={`Obiettivo ${fmtEur(d.obiettivo)}`} />
        <Stat label="Da incassare (netto)" value={fmtEur(d.dopoDa)} />
        <Stat label="Manutenzioni attive" value={`${d.nManut}`} hint={`${fmtEur(d.mesi[0]?.netto ?? 0)} netti al prossimo 1°`} />
        <Stat label="Storico incassato" value={fmtEur(d.primaLordo)} hint={`Netto ${fmtEur(d.primaNetto)} · non conta per l'obiettivo`} />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2">
        <ChartCard title="Verso l'obiettivo" hint="Incassato + da incassare + manutenzioni attive, mese per mese (netto)">
          <Lines data={d.cumulato} series={[{ key: "previsto", label: "Previsto", color: "#2f6fb5" }]} goal={{ value: d.obiettivo, label: `Obiettivo ${fmtEur(d.obiettivo)}` }} money />
        </ChartCard>
        <ChartCard title="Incassi per mese (netto)" hint="Solo pagamenti incassati con data" empty={d.incassiMese.length === 0}>
          <BarsV data={d.incassiMese} money series={[{ key: "storico", label: "Storico", color: "#8fb8e8" }, { key: "dopo", label: "Dopo data zero", color: "#0a2048" }]} />
        </ChartCard>
        <ChartCard title="Netto incassato per cliente" empty={d.perCliente.length === 0}>
          <BarsH money data={d.perCliente.map((x) => ({ name: nome.get(x.id) ?? "—", value: x.value }))} />
        </ChartCard>
        <ChartCard title="Servizi venduti per tipo" hint="Valore dei servizi registrati" empty={(servizi.data ?? []).length === 0}>
          <Donut money data={(() => {
            const m = new Map<string, number>();
            (servizi.data ?? []).forEach((x) => m.set(tipoServizioLabel(x.tipo), (m.get(tipoServizioLabel(x.tipo)) ?? 0) + Number(x.importo)));
            return [...m.entries()].map(([name, value]) => ({ name, value }));
          })()} />
        </ChartCard>
      </section>

      <section className="surface mb-6 p-5">
        <h2 className="title-md mb-3">Proiezione verso l&apos;obiettivo</h2>
        <div className="grid gap-3 text-sm sm:grid-cols-4">
          <p>Incassato + da incassare<br /><strong className="text-lg">{fmtEur(d.dopoInc + d.dopoDa)}</strong></p>
          <p>Manutenzioni fino alla scadenza<br /><strong className="text-lg">{fmtEur(d.manutProiez)}</strong></p>
          <p>Previsto totale<br /><strong className="text-lg">{fmtEur(d.previsto)}</strong></p>
          <p>Ancora da trovare<br /><strong className="text-lg">{fmtEur(d.gap)}</strong></p>
        </div>
        {d.venditeNecessarie !== null && d.gap > 0 && (
          <p className="mt-4 rounded-xl bg-ice-100 px-4 py-3 text-sm">
            Con il ricavo medio per cliente dello storico ({fmtEur(Math.round(d.ticket))} netti) servono circa <strong>{d.venditeNecessarie} nuove vendite</strong> per chiudere il gap.
            Stima indicativa: il ricavo medio dipende dal tipo di lavoro venduto.
          </p>
        )}
        {d.nManut === 0 && <p className="mt-3 text-sm text-muted-foreground">Nessuna manutenzione attiva: dal 1° dicembre parte E-Riutility, attivala dalla sezione sotto quando serve.</p>}
        <details className="mt-4">
          <summary className="hud cursor-pointer text-muted-foreground">Incassi mensili da manutenzione ({d.mesi.length} mesi)</summary>
          <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2 md:grid-cols-4">
            {d.mesi.map((m) => <li key={m.data} className="flex justify-between border-b border-border/60 py-1.5"><span className="capitalize">{m.label}</span><span>{fmtEur(m.netto)}</span></li>)}
          </ul>
        </details>
      </section>

      <section className="surface mb-6 p-5">
        <h2 className="title-md mb-3">Manutenzioni</h2>
        {(manut.data ?? []).length === 0 ? <Empty>Nessuna manutenzione registrata.</Empty> : (
          <ul className="divide-y divide-border">
            {manut.data!.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <Link to="/clienti/$id" params={{ id: m.cliente_id }} className="min-w-0">
                  <p className="font-semibold">{nome.get(m.cliente_id) ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmtEur(Number(m.importo_netto))} netti/mese{Number(m.trattenuta_pct) > 0 ? ` (lordo ${fmtEur(Number(m.importo_lordo))}, trattenuta ${Number(m.trattenuta_pct)}%)` : ""}
                    {m.attiva_dal ? ` · dal ${fmtData(m.attiva_dal)}` : ""}{m.mesi_storico ? ` · ${m.mesi_storico} mesi in storico` : ""}
                  </p>
                </Link>
                <label className="flex items-center gap-2"><span className="hud">{m.attiva ? "Attiva" : "Non attiva"}</span>
                  <Switch checked={m.attiva} onCheckedChange={(v) => toggleManut.mutate({ id: m.id, attiva: v })} /></label>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="title-md">Pagamenti</h2>
          <Select value={filtro} onValueChange={(v) => setFiltro(v as typeof filtro)}>
            <SelectTrigger className="h-10 w-48" aria-label="Filtro"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tutti">Tutti</SelectItem><SelectItem value="dopo">Dopo data zero</SelectItem>
              <SelectItem value="prima">Storico</SelectItem><SelectItem value="da_incassare">Da incassare</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {lista.length === 0 ? <Empty>Nessun pagamento.</Empty> : (
          <ul className="divide-y divide-border">
            {lista.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <Link to="/clienti/$id" params={{ id: p.cliente_id }} className="min-w-0">
                  <p className="font-semibold">{nome.get(p.cliente_id) ?? "—"} <span className="font-normal text-muted-foreground">· {p.descrizione}</span></p>
                  <p className="hud text-muted-foreground">{p.periodo === "prima" ? "Storico" : "Dopo"} · {p.data ? fmtData(p.data) : p.data_label ?? "senza data"}</p>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="text-right"><p className="font-display text-lg font-bold leading-none">{fmtEur(Number(p.importo_netto))}</p>
                    {Number(p.trattenuta_pct) > 0 && <p className="text-xs text-muted-foreground">lordo {fmtEur(Number(p.importo_lordo))}</p>}</div>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => toggle.mutate(p)}>{p.stato === "incassato" ? "Incassato" : "Da incassare"}</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted-foreground">Per aggiungere un pagamento apri la scheda del cliente, sezione &quot;Servizi e pagamenti&quot;.</p>
      </section>
    </>
  );
}
