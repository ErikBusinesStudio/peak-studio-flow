import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, MapPin, MessageCircle, Phone, Plus, Search, X } from "lucide-react";
import {
  api, CATEGORIE, STATI, STATO_RANK, categoriaLabel, distanzaLabel, modalitaCfg, telLink, whatsappLink,
  type Categoria, type Cliente, type Stato,
} from "@/lib/gestionale";
import { BarsH, ChartCard, Donut, STATO_COLOR } from "@/components/app/charts";
import { PageHead, StatoBadge, Empty } from "@/components/app/bits";
import { ClienteForm } from "@/components/app/ClienteForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Search = { stato?: Stato };

export const Route = createFileRoute("/clienti/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    stato: STATI.some((x) => x.id === s.stato) ? (s.stato as Stato) : undefined,
  }),
  component: Clienti,
  head: () => ({ meta: [{ title: "Clienti — Peak Studio OS" }] }),
});

const ALL = "all";

function Clienti() {
  const { stato } = Route.useSearch();
  const navigate = useNavigate();
  const clienti = useQuery({ queryKey: ["clienti"], queryFn: api.clienti.list });
  const manutenzioni = useQuery({ queryKey: ["manutenzioni-all"], queryFn: api.manutenzioni.listAll });

  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState<string>(ALL);
  const [comune, setComune] = useState<string>(ALL);
  const [periodo, setPeriodo] = useState<string>(ALL);
  const [sito, setSito] = useState<string>(ALL);
  const [manut, setManut] = useState<string>(ALL);
  const [nuovo, setNuovo] = useState(false);
  const [vista, setVista] = useState<"comune" | "elenco">("comune");

  const tutti = clienti.data ?? [];
  const comuni = useMemo(() => [...new Set(tutti.map((c) => c.comune).filter((x): x is string => !!x))].sort(), [tutti]);
  const conManutAttiva = useMemo(
    () => new Set((manutenzioni.data ?? []).filter((m) => m.attiva).map((m) => m.cliente_id)),
    [manutenzioni.data],
  );

  const filtrati = useMemo(() => {
    const term = q.trim().toLowerCase();
    return tutti
      .filter((c) => !stato || c.stato === stato)
      .filter((c) => categoria === ALL || c.categoria === categoria)
      .filter((c) => comune === ALL || (comune === "__none" ? !c.comune : c.comune === comune))
      .filter((c) => periodo === ALL || (periodo === "storico" ? c.storico : !c.storico))
      .filter((c) => sito === ALL || (sito === "si" ? c.ha_sito === true : sito === "no" ? c.ha_sito === false : c.ha_sito === null))
      .filter((c) => manut === ALL || (manut === "si" ? conManutAttiva.has(c.id) : !conManutAttiva.has(c.id)))
      .filter((c) => !term || [c.nome, c.referente, c.comune, c.telefono, c.note, c.indirizzo].some((v) => v?.toLowerCase().includes(term)))
      .sort((a, b) => STATO_RANK[a.stato] - STATO_RANK[b.stato] || (a.priorita ?? 999) - (b.priorita ?? 999) || a.nome.localeCompare(b.nome, "it"));
  }, [tutti, stato, categoria, comune, periodo, sito, manut, q, conManutAttiva]);

  /** Gruppi per sede: prima i comuni più vicini a Casalzuigno, poi gli altri in ordine alfabetico, "Senza comune" in fondo. */
  const gruppi = useMemo(() => {
    const m = new Map<string, Cliente[]>();
    filtrati.forEach((c) => { const k = c.comune ?? ""; m.set(k, [...(m.get(k) ?? []), c]); });
    const minMin = (l: Cliente[]) => Math.min(...l.map((c) => c.minuti_da_casa ?? 999));
    return [...m.entries()].sort(([ka, a], [kb, b]) => {
      if (!ka) return 1;
      if (!kb) return -1;
      return minMin(a) - minMin(b) || ka.localeCompare(kb, "it");
    });
  }, [filtrati]);

  const conteggio = (s?: Stato) => (s ? tutti.filter((c) => c.stato === s).length : tutti.length);
  const filtriAttivi = categoria !== ALL || comune !== ALL || periodo !== ALL || sito !== ALL || manut !== ALL || q !== "";
  const reset = () => { setQ(""); setCategoria(ALL); setComune(ALL); setPeriodo(ALL); setSito(ALL); setManut(ALL); };

  const perCategoria = useMemo(() => {
    const m = new Map<string, number>();
    filtrati.forEach((c) => m.set(categoriaLabel(c.categoria as Categoria), (m.get(categoriaLabel(c.categoria as Categoria)) ?? 0) + 1));
    return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtrati]);
  const perComune = useMemo(() => {
    const m = new Map<string, number>();
    filtrati.forEach((c) => m.set(c.comune ?? "Da definire", (m.get(c.comune ?? "Da definire") ?? 0) + 1));
    return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [filtrati]);
  const perStatoGraf = STATI.map((s) => ({ name: s.short, value: filtrati.filter((c) => c.stato === s.id).length, color: STATO_COLOR[s.id] })).filter((x) => x.value > 0);

  const sel = (value: string, onChange: (v: string) => void, label: string, items: { v: string; l: string }[]) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-full bg-white/70" aria-label={label}><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}: tutti</SelectItem>
        {items.map((i) => <SelectItem key={i.v} value={i.v}>{i.l}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  return (
    <>
      <PageHead kicker={`${tutti.length} schede`} title="Clienti">
        <Button onClick={() => setNuovo(true)} className="h-12 rounded-full px-6 font-semibold"><Plus className="size-5" />Cliente</Button>
      </PageHead>

      {/* Divisione per stato */}
      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0" role="tablist" aria-label="Stato">
        {[{ id: undefined as Stato | undefined, label: "Tutti" }, ...STATI].map((s) => {
          const attivo = stato === s.id;
          return (
            <button key={s.id ?? "tutti"} role="tab" aria-selected={attivo}
              onClick={() => navigate({ to: "/clienti", search: { stato: s.id } })}
              className={cn("hud flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 transition-colors",
                attivo ? "border-deep-900 bg-deep-900 text-white" : "border-border bg-white/70 text-foreground hover:bg-white")}>
              {s.label}
              <span className={cn("rounded-full px-2 py-0.5 text-[10px]", attivo ? "bg-white/20" : "bg-ice-100")}>{conteggio(s.id)}</span>
            </button>
          );
        })}
      </div>

      {/* Filtri */}
      <div className="surface mb-6 p-4">
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca nome, referente, comune, telefono, note…" className="h-11 bg-white/70 pl-10" />
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {sel(categoria, setCategoria, "Attività", CATEGORIE.map((c) => ({ v: c.id, l: c.label })))}
          {sel(comune, setComune, "Comune", [...comuni.map((c) => ({ v: c, l: c })), { v: "__none", l: "Senza comune" }])}
          {sel(periodo, setPeriodo, "Periodo", [{ v: "storico", l: "Storico (prima)" }, { v: "nuovi", l: "Nuovi (dopo)" }])}
          {sel(sito, setSito, "Ha un sito", [{ v: "si", l: "Sì" }, { v: "no", l: "No" }, { v: "ignoto", l: "Non so" }])}
          {sel(manut, setManut, "Manutenzione", [{ v: "si", l: "Attiva" }, { v: "no", l: "Non attiva" }])}
        </div>
        {filtriAttivi && (
          <button onClick={reset} className="hud mt-3 flex items-center gap-1.5 text-muted-foreground hover:text-foreground"><X className="size-3.5" />Azzera filtri</button>
        )}
      </div>

      <details className="mb-6">
        <summary className="hud cursor-pointer text-muted-foreground">Grafici sui {filtrati.length} clienti filtrati</summary>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <ChartCard title="Per stato" empty={perStatoGraf.length === 0}><Donut data={perStatoGraf} /></ChartCard>
          <ChartCard title="Per tipo di attività" empty={perCategoria.length === 0}><BarsH data={perCategoria} /></ChartCard>
          <ChartCard title="Per comune (top 10)" empty={perComune.length === 0}><BarsH data={perComune} /></ChartCard>
        </div>
      </details>

      {clienti.error && <Empty>Errore: {(clienti.error as Error).message}. Controlla la migrazione del database v2.</Empty>}
      {clienti.isLoading && <Empty>Caricamento…</Empty>}
      {!clienti.isLoading && !clienti.error && filtrati.length === 0 && <Empty>Nessun cliente con questi filtri.</Empty>}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="hud text-muted-foreground">{filtrati.length} risultati</p>
        <div className="flex rounded-full border border-border bg-white/70 p-1" role="tablist" aria-label="Vista">
          {([["comune", "Per sede"], ["elenco", "Elenco"]] as const).map(([v, l]) => (
            <button key={v} role="tab" aria-selected={vista === v} onClick={() => setVista(v)}
              className={cn("hud rounded-full px-4 py-2 transition-colors", vista === v ? "bg-deep-900 text-white" : "text-muted-foreground hover:text-foreground")}>{l}</button>
          ))}
        </div>
      </div>

      {vista === "elenco" ? (
        <ul className="grid gap-3 md:grid-cols-2">{filtrati.map((c) => <ClienteCard key={c.id} c={c} />)}</ul>
      ) : (
        <div className="space-y-8">
          {gruppi.map(([nomeComune, lista]) => {
            const vicino = lista.map((c) => c.minuti_da_casa).filter((x): x is number => x != null);
            return (
              <section key={nomeComune || "__none"}>
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b-2 border-deep-900 pb-2">
                  <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
                    <MapPin className="size-6 shrink-0" />{nomeComune || "Sede da definire"}
                    <span className="hud rounded-full bg-ice-100 px-2.5 py-1 text-[11px] font-normal">{lista.length}</span>
                  </h2>
                  <p className="hud text-muted-foreground">
                    {vicino.length ? `a ~${Math.min(...vicino)} min da Casalzuigno` : nomeComune ? "" : "indirizzo mancante"}
                  </p>
                </div>
                <ul className="grid gap-3 md:grid-cols-2">{lista.map((c) => <ClienteCard key={c.id} c={c} nascondiComune />)}</ul>
              </section>
            );
          })}
        </div>
      )}

      <ClienteForm open={nuovo} onOpenChange={setNuovo} comuni={comuni} />
    </>
  );
}


const STRISCIA: Record<Stato, string> = {
  pagato: "border-l-emerald-500", accettato: "border-l-teal-500", in_trattativa: "border-l-blue-500",
  contattato: "border-l-cyan-500", da_contattare: "border-l-slate-400", rifiutato: "border-l-rose-400",
};

function ClienteCard({ c, nascondiComune = false }: { c: Cliente; nascondiComune?: boolean }) {
  const wa = whatsappLink(c.telefono);
  const tel = telLink(c.telefono);
  const mod = c.stato === "da_contattare" ? modalitaCfg(c.modalita_contatto) : null;
  const dist = distanzaLabel(c);
  return (
    <li className={cn("surface relative border-l-4 p-4 transition-transform hover:-translate-y-0.5", STRISCIA[c.stato], c.stato === "rifiutato" && "opacity-60")}>
      <Link to="/clienti/$id" params={{ id: c.id }} className="block">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-bold leading-tight tracking-tight">{c.nome}</h3>
          <StatoBadge stato={c.stato} />
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-sm font-semibold">
          <MapPin className="mt-0.5 size-4 shrink-0" />
          <span>
            {[c.indirizzo, nascondiComune ? null : c.comune ?? "sede da definire"].filter(Boolean).join(", ") || "indirizzo mancante"}
            {dist && <span className="block text-xs font-normal text-muted-foreground">{dist}</span>}
          </span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="hud rounded-full border border-border bg-white/70 px-2.5 py-1 text-[10px]">{categoriaLabel(c.categoria as Categoria)}</span>
          {mod && <span className={cn("hud rounded-full border px-2.5 py-1 text-[10px]", mod.cls)}>{c.priorita ? `#${c.priorita} · ` : ""}{mod.label}</span>}
          {c.da_confermare && <span className="hud inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] text-amber-900"><AlertCircle className="size-3" />Da confermare</span>}
        </div>
        {c.note && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.note}</p>}
      </Link>
      {(tel || wa) && (
        <div className="mt-3 flex gap-2">
          {tel && <a href={tel} className="hud inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 hover:bg-ice-100"><Phone className="size-3.5" />Chiama</a>}
          {wa && <a href={wa} target="_blank" rel="noreferrer" className="hud inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 hover:bg-ice-100"><MessageCircle className="size-3.5" />WhatsApp</a>}
        </div>
      )}
    </li>
  );
}
