import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, MessageCircle, Pencil, Phone, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  api, CANALI, canaleLabel, categoriaLabel, fmtData, fmtEur, GIORNI, normalizeUrl, STATI, telLink,
  tipoServizioLabel, TIPI_SERVIZIO, whatsappLink,
  type Canale, type Cliente, type Pagamento, type Stato, type TipoServizio,
} from "@/lib/gestionale";
import { StatoBadge, Empty, Stat } from "@/components/app/bits";
import { ClienteForm } from "@/components/app/ClienteForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/clienti/$id")({
  component: SchedaCliente,
  head: () => ({ meta: [{ title: "Scheda cliente — Peak Studio OS" }] }),
});

const oggi = () => format(new Date(), "yyyy-MM-dd");
const nul = (s: string) => (s.trim() === "" ? null : s.trim());

function SchedaCliente() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [modifica, setModifica] = useState(false);

  const cliente = useQuery({ queryKey: ["cliente", id], queryFn: () => api.clienti.get(id) });
  const tutti = useQuery({ queryKey: ["clienti"], queryFn: api.clienti.list });
  const comuni = [...new Set((tutti.data ?? []).map((c) => c.comune).filter((x): x is string => !!x))].sort();

  const cambiaStato = useMutation({
    mutationFn: (s: Stato) => api.clienti.update(id, { stato: s }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cliente", id] }); qc.invalidateQueries({ queryKey: ["clienti"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const elimina = useMutation({
    mutationFn: () => api.clienti.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clienti"] }); toast.success("Cliente eliminato"); navigate({ to: "/clienti" }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (cliente.isLoading) return <Empty>Caricamento…</Empty>;
  if (cliente.error) return <Empty>Errore: {(cliente.error as Error).message}</Empty>;
  const c = cliente.data;
  if (!c) return <Empty>Cliente non trovato. <Link to="/clienti" className="underline">Torna all&apos;elenco</Link></Empty>;

  const wa = whatsappLink(c.telefono);
  const tel = telLink(c.telefono);
  const sito = normalizeUrl(c.sito_web);

  return (
    <>
      <Link to="/clienti" className="hud mb-5 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Clienti</Link>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="kicker">{categoriaLabel(c.categoria)}{c.comune ? ` · ${c.comune}` : ""}</p>
          <h1 className="title-xl mt-3 break-words">{c.nome}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatoBadge stato={c.stato} />
            {c.storico && <span className="hud rounded-full border border-border bg-ice-100 px-2.5 py-1 text-[10px]">Storico</span>}
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Select value={c.stato} onValueChange={(v) => cambiaStato.mutate(v as Stato)}>
            <SelectTrigger className="h-11 w-44 bg-white/70" aria-label="Cambia stato"><SelectValue /></SelectTrigger>
            <SelectContent>{STATI.map((s) => <SelectItem key={s.id} value={s.id}>{s.short}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" className="h-11 rounded-full" onClick={() => setModifica(true)}><Pencil className="size-4" />Modifica</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="size-11 rounded-full text-destructive" aria-label="Elimina cliente"><Trash2 className="size-4" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminare {c.nome}?</AlertDialogTitle>
                <AlertDialogDescription>Verranno eliminati anche contatti, servizi, pagamenti e manutenzioni collegati. L&apos;azione non si può annullare.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction onClick={() => elimina.mutate()}>Elimina</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {(tel || wa || sito) && (
        <div className="mb-6 flex flex-wrap gap-2">
          {tel && <a href={tel} className="hud inline-flex items-center gap-2 rounded-full bg-deep-900 px-4 py-3 text-white"><Phone className="size-4" />{c.telefono}</a>}
          {wa && <a href={wa} target="_blank" rel="noreferrer" className="hud inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-3"><MessageCircle className="size-4" />WhatsApp</a>}
          {sito && <a href={sito} target="_blank" rel="noreferrer" className="hud inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-3"><ExternalLink className="size-4" />Sito</a>}
        </div>
      )}

      <Tabs defaultValue="info">
        <TabsList className="no-scrollbar mb-5 h-auto w-full justify-start gap-1 overflow-x-auto rounded-full bg-white/70 p-1.5">
          {[["info", "Info"], ["contatti", "Contatti"], ["soldi", "Servizi e pagamenti"], ["manutenzione", "Manutenzione"]].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="hud shrink-0 rounded-full px-4 py-2.5 data-[state=active]:bg-deep-900 data-[state=active]:text-white">{l}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="info"><TabInfo c={c} /></TabsContent>
        <TabsContent value="contatti"><TabContatti c={c} /></TabsContent>
        <TabsContent value="soldi"><TabSoldi c={c} /></TabsContent>
        <TabsContent value="manutenzione"><TabManutenzione c={c} /></TabsContent>
      </Tabs>

      <ClienteForm open={modifica} onOpenChange={setModifica} cliente={c} comuni={comuni} />
    </>
  );
}

/* ---------------- Info ---------------- */
function Riga({ label, children }: { label: string; children: ReactNode }) {
  if (children === null || children === undefined || children === "") return null;
  return (
    <div className="grid gap-1 border-b border-border/70 py-3 sm:grid-cols-[160px_1fr]">
      <dt className="hud text-muted-foreground">{label}</dt>
      <dd className="break-words">{children}</dd>
    </div>
  );
}

function TabInfo({ c }: { c: Cliente }) {
  const sito = normalizeUrl(c.sito_web);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <dl className="surface p-5">
        <Riga label="Referente">{c.referente}</Riga>
        <Riga label="Telefono">{c.telefono}</Riga>
        <Riga label="Email">{c.email && <a className="underline underline-offset-4" href={`mailto:${c.email}`}>{c.email}</a>}</Riga>
        <Riga label="Sito web">{sito && <a className="underline underline-offset-4" href={sito} target="_blank" rel="noreferrer">{c.sito_web}</a>}</Riga>
        <Riga label="Social">{c.social}</Riga>
        <Riga label="Indirizzo">{c.indirizzo}</Riga>
        <Riga label="Comune">{c.comune}</Riga>
        <Riga label="Ha già un sito">{c.ha_sito === null ? null : c.ha_sito ? "Sì" : "No"}</Riga>
        <Riga label="Come l'ho trovato">{c.fonte}</Riga>
        <Riga label="Prossimo contatto">{c.prossimo_contatto ? fmtData(c.prossimo_contatto) : null}</Riga>
        {c.stato === "rifiutato" && <Riga label="Motivo rifiuto">{c.motivo_rifiuto}</Riga>}
        <Riga label="Note"><span className="whitespace-pre-wrap">{c.note}</span></Riga>
      </dl>
      <aside className="surface h-fit p-5">
        <h2 className="title-md mb-3">Orari</h2>
        {c.orari ? (
          <ul className="text-sm">
            {GIORNI.map((g) => (
              <li key={g} className="flex justify-between gap-4 border-b border-border/60 py-2 last:border-0">
                <span className="hud text-muted-foreground">{g}</span><span>{c.orari?.[g] ?? "—"}</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted-foreground">Orari non registrati.</p>}
      </aside>
    </div>
  );
}

/* ---------------- Contatti ---------------- */
function TabContatti({ c }: { c: Cliente }) {
  const qc = useQueryClient();
  const lista = useQuery({ queryKey: ["contatti", c.id], queryFn: () => api.contatti.list(c.id) });
  const [data, setData] = useState(oggi());
  const [canale, setCanale] = useState<Canale>("whatsapp");
  const [esito, setEsito] = useState("");
  const [note, setNote] = useState("");
  const [followup, setFollowup] = useState("");

  const aggiungi = useMutation({
    mutationFn: async () => {
      await api.contatti.create({ cliente_id: c.id, data: nul(data), canale, esito: nul(esito), note: nul(note), prossimo_followup: nul(followup) });
      if (followup) await api.clienti.update(c.id, { prossimo_contatto: followup });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contatti", c.id] });
      qc.invalidateQueries({ queryKey: ["cliente", c.id] });
      qc.invalidateQueries({ queryKey: ["clienti"] });
      setEsito(""); setNote(""); setFollowup("");
      toast.success("Contatto registrato");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const rimuovi = useMutation({
    mutationFn: (rid: string) => api.contatti.remove(rid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contatti", c.id] }),
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: FormEvent) { e.preventDefault(); aggiungi.mutate(); }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form onSubmit={submit} className="surface h-fit space-y-3 p-5">
        <h2 className="title-md">Nuovo contatto</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Data</Label><Input type="date" value={data} onChange={(e) => setData(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Canale</Label>
            <Select value={canale} onValueChange={(v) => setCanale(v as Canale)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CANALI.map((x) => <SelectItem key={x.id} value={x.id}>{x.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5"><Label>Esito</Label><Input value={esito} onChange={(e) => setEsito(e.target.value)} placeholder="Es. nessuna risposta, interessato…" /></div>
        <div className="space-y-1.5"><Label>Note</Label><Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Prossimo follow-up</Label><Input type="date" value={followup} onChange={(e) => setFollowup(e.target.value)} /></div>
        <Button type="submit" disabled={aggiungi.isPending} className="h-11 w-full rounded-full">Registra</Button>
      </form>

      <div className="surface p-5">
        <h2 className="title-md mb-4">Cronologia</h2>
        {lista.isLoading ? <Empty>Caricamento…</Empty> : (lista.data ?? []).length === 0 ? <Empty>Nessun contatto registrato.</Empty> : (
          <ul className="divide-y divide-border">
            {lista.data!.map((x) => (
              <li key={x.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="hud text-muted-foreground">{x.data ? fmtData(x.data) : "Data non nota"} · {canaleLabel(x.canale)}</p>
                  {x.esito && <p className="mt-1 font-semibold">{x.esito}</p>}
                  {x.note && <p className="mt-1 text-sm">{x.note}</p>}
                  {x.prossimo_followup && <p className="hud mt-1 text-glacier-700">Follow-up {fmtData(x.prossimo_followup)}</p>}
                </div>
                <Button variant="ghost" size="icon" aria-label="Elimina contatto" onClick={() => rimuovi.mutate(x.id)}><Trash2 className="size-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------- Servizi e pagamenti ---------------- */
function TabSoldi({ c }: { c: Cliente }) {
  const qc = useQueryClient();
  const servizi = useQuery({ queryKey: ["servizi", c.id], queryFn: () => api.servizi.list(c.id) });
  const pagamenti = useQuery({ queryKey: ["pagamenti", c.id], queryFn: () => api.pagamenti.list(c.id) });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["servizi", c.id] });
    qc.invalidateQueries({ queryKey: ["pagamenti", c.id] });
    qc.invalidateQueries({ queryKey: ["pagamenti-all"] });
  };
  const onError = (e: Error) => toast.error(e.message);

  const [sTipo, setSTipo] = useState<TipoServizio>("sito");
  const [sDesc, setSDesc] = useState("");
  const [sImporto, setSImporto] = useState("");
  const addServizio = useMutation({
    mutationFn: () => api.servizi.create({ cliente_id: c.id, tipo: sTipo, descrizione: nul(sDesc), importo: Number(sImporto || 0), stato: "proposto" }),
    onSuccess: () => { refresh(); setSDesc(""); setSImporto(""); toast.success("Servizio aggiunto"); },
    onError,
  });
  const delServizio = useMutation({ mutationFn: (i: string) => api.servizi.remove(i), onSuccess: refresh, onError });

  const [pDesc, setPDesc] = useState("");
  const [pLordo, setPLordo] = useState("");
  const [pTratt, setPTratt] = useState("0");
  const [pPeriodo, setPPeriodo] = useState<"prima" | "dopo">("dopo");
  const [pStato, setPStato] = useState<"incassato" | "da_incassare">("da_incassare");
  const [pData, setPData] = useState("");
  const addPagamento = useMutation({
    mutationFn: () => api.pagamenti.create({
      cliente_id: c.id, descrizione: pDesc.trim(), importo_lordo: Number(pLordo), trattenuta_pct: Number(pTratt || 0),
      periodo: pPeriodo, stato: pStato, data: nul(pData),
    }),
    onSuccess: () => { refresh(); setPDesc(""); setPLordo(""); toast.success("Pagamento aggiunto"); },
    onError,
  });
  const togglePagamento = useMutation({
    mutationFn: (p: Pagamento) => api.pagamenti.update(p.id, { stato: p.stato === "incassato" ? "da_incassare" : "incassato" }),
    onSuccess: refresh, onError,
  });
  const delPagamento = useMutation({ mutationFn: (i: string) => api.pagamenti.remove(i), onSuccess: refresh, onError });

  const pg = pagamenti.data ?? [];
  const incLordo = pg.filter((p) => p.stato === "incassato").reduce((s, p) => s + Number(p.importo_lordo), 0);
  const incNetto = pg.filter((p) => p.stato === "incassato").reduce((s, p) => s + Number(p.importo_netto), 0);
  const daInc = pg.filter((p) => p.stato === "da_incassare").reduce((s, p) => s + Number(p.importo_netto), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Incassato lordo" value={fmtEur(incLordo)} />
        <Stat label="Incassato netto" value={fmtEur(incNetto)} tone="deep" />
        <Stat label="Da incassare (netto)" value={fmtEur(daInc)} />
      </div>

      <section className="surface p-5">
        <h2 className="title-md mb-4">Servizi</h2>
        {(servizi.data ?? []).length === 0 ? <Empty>Nessun servizio registrato.</Empty> : (
          <ul className="divide-y divide-border">
            {servizi.data!.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold">{tipoServizioLabel(s.tipo)}</p>
                  {s.descrizione && <p className="text-sm text-muted-foreground">{s.descrizione}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-bold">{fmtEur(Number(s.importo))}</span>
                  <Button variant="ghost" size="icon" aria-label="Elimina servizio" onClick={() => delServizio.mutate(s.id)}><Trash2 className="size-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <form className="mt-4 grid gap-2 sm:grid-cols-[160px_1fr_120px_auto]" onSubmit={(e) => { e.preventDefault(); addServizio.mutate(); }}>
          <Select value={sTipo} onValueChange={(v) => setSTipo(v as TipoServizio)}>
            <SelectTrigger aria-label="Tipo servizio"><SelectValue /></SelectTrigger>
            <SelectContent>{TIPI_SERVIZIO.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Descrizione" value={sDesc} onChange={(e) => setSDesc(e.target.value)} />
          <Input type="number" min="0" step="0.01" placeholder="Importo €" value={sImporto} onChange={(e) => setSImporto(e.target.value)} />
          <Button type="submit" className="rounded-full">Aggiungi</Button>
        </form>
      </section>

      <section className="surface p-5">
        <h2 className="title-md mb-4">Pagamenti</h2>
        {pg.length === 0 ? <Empty>Nessun pagamento registrato.</Empty> : (
          <ul className="divide-y divide-border">
            {pg.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold">{p.descrizione}</p>
                  <p className="hud text-muted-foreground">
                    {p.periodo === "prima" ? "Storico" : "Dopo data zero"} · {p.data ? fmtData(p.data) : p.data_label ?? "senza data"}
                    {Number(p.trattenuta_pct) > 0 && ` · trattenuta ${Number(p.trattenuta_pct)}%`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-display text-lg font-bold leading-none">{fmtEur(Number(p.importo_netto))}</p>
                    {Number(p.trattenuta_pct) > 0 && <p className="text-xs text-muted-foreground">lordo {fmtEur(Number(p.importo_lordo))}</p>}
                  </div>
                  <button onClick={() => togglePagamento.mutate(p)}
                    className={`hud rounded-full border px-3 py-1.5 text-[10px] ${p.stato === "incassato" ? "border-emerald-300 bg-emerald-100 text-emerald-900" : "border-amber-300 bg-amber-100 text-amber-900"}`}>
                    {p.stato === "incassato" ? "Incassato" : "Da incassare"}
                  </button>
                  <Button variant="ghost" size="icon" aria-label="Elimina pagamento" onClick={() => delPagamento.mutate(p.id)}><Trash2 className="size-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <form className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(e) => { e.preventDefault(); if (!pDesc.trim() || !pLordo) return toast.error("Descrizione e importo sono obbligatori"); addPagamento.mutate(); }}>
          <Input className="lg:col-span-2" placeholder="Descrizione" value={pDesc} onChange={(e) => setPDesc(e.target.value)} />
          <Input type="number" min="0" step="0.01" placeholder="Importo lordo €" value={pLordo} onChange={(e) => setPLordo(e.target.value)} />
          <Input type="number" min="0" max="100" step="0.01" placeholder="Trattenuta %" value={pTratt} onChange={(e) => setPTratt(e.target.value)} />
          <Select value={pPeriodo} onValueChange={(v) => setPPeriodo(v as "prima" | "dopo")}>
            <SelectTrigger aria-label="Periodo"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="dopo">Dopo data zero</SelectItem><SelectItem value="prima">Storico (prima)</SelectItem></SelectContent>
          </Select>
          <Select value={pStato} onValueChange={(v) => setPStato(v as "incassato" | "da_incassare")}>
            <SelectTrigger aria-label="Stato pagamento"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="da_incassare">Da incassare</SelectItem><SelectItem value="incassato">Incassato</SelectItem></SelectContent>
          </Select>
          <Input type="date" value={pData} onChange={(e) => setPData(e.target.value)} aria-label="Data" />
          <Button type="submit" className="rounded-full">Aggiungi</Button>
        </form>
      </section>
    </div>
  );
}

/* ---------------- Manutenzione ---------------- */
function TabManutenzione({ c }: { c: Cliente }) {
  const qc = useQueryClient();
  const lista = useQuery({ queryKey: ["manutenzioni", c.id], queryFn: () => api.manutenzioni.list(c.id) });
  const m = lista.data?.[0];

  const [lordo, setLordo] = useState("50");
  const [tratt, setTratt] = useState("0");
  const [mesi, setMesi] = useState("0");
  const [dal, setDal] = useState("");
  const [notaM, setNotaM] = useState("");
  const [caricato, setCaricato] = useState<string | null>(null);
  if (m && caricato !== m.id) {
    setCaricato(m.id); setLordo(String(m.importo_lordo)); setTratt(String(m.trattenuta_pct));
    setMesi(String(m.mesi_storico)); setDal(m.attiva_dal ?? ""); setNotaM(m.note ?? "");
  }

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["manutenzioni", c.id] });
    qc.invalidateQueries({ queryKey: ["manutenzioni-all"] });
  };
  const salva = useMutation({
    mutationFn: async (attiva: boolean | undefined) => {
      const payload = {
        importo_lordo: Number(lordo || 0), trattenuta_pct: Number(tratt || 0), mesi_storico: Number(mesi || 0),
        attiva_dal: nul(dal), note: nul(notaM), ...(attiva === undefined ? {} : { attiva }),
      };
      if (m) await api.manutenzioni.update(m.id, payload);
      else await api.manutenzioni.create({ cliente_id: c.id, attiva: attiva ?? false, ...payload });
    },
    onSuccess: () => { refresh(); toast.success("Manutenzione salvata"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const netto = Math.round(Number(lordo || 0) * (1 - Number(tratt || 0) / 100) * 100) / 100;

  return (
    <div className="surface max-w-2xl space-y-4 p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="title-md">Manutenzione mensile</h2>
        <label className="flex items-center gap-3">
          <span className="hud">{m?.attiva ? "Attiva" : "Non attiva"}</span>
          <Switch checked={!!m?.attiva} onCheckedChange={(v) => salva.mutate(v)} />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Importo lordo al mese (€)</Label><Input type="number" min="0" step="0.01" value={lordo} onChange={(e) => setLordo(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Trattenuta (%)</Label><Input type="number" min="0" max="100" step="0.01" value={tratt} onChange={(e) => setTratt(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Mesi già incassati (storico)</Label><Input type="number" min="0" value={mesi} onChange={(e) => setMesi(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Attiva dal</Label><Input type="date" value={dal} onChange={(e) => setDal(e.target.value)} /></div>
      </div>
      <div className="space-y-1.5"><Label>Note</Label><Textarea rows={3} value={notaM} onChange={(e) => setNotaM(e.target.value)} /></div>
      <p className="rounded-xl bg-ice-100 px-4 py-3 text-sm">Netto al mese: <strong>{fmtEur(netto)}</strong> · incasso il 1° del mese</p>
      <Button onClick={() => salva.mutate(undefined)} disabled={salva.isPending} className="h-11 rounded-full px-7">Salva</Button>
    </div>
  );
}
