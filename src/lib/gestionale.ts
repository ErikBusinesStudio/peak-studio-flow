import { supabase } from "@/integrations/supabase/client";

/* =========================================================
   Tipi e costanti del gestionale (schema v2: tabelle in italiano)
   ========================================================= */

export type Stato = "da_contattare" | "contattato" | "in_trattativa" | "accettato" | "pagato" | "rifiutato";
export type Categoria =
  | "auto_officine" | "ristorazione_bar" | "bellezza_benessere" | "tattoo" | "professionisti"
  | "ospitalita" | "sport_danza" | "negozi_commercio" | "artigiani_servizi" | "altro";
export type Canale = "whatsapp" | "telefono" | "di_persona" | "email" | "social" | "altro";
export type TipoServizio = "sito" | "ecommerce" | "landing" | "logo" | "google_business" | "locandine" | "manutenzione" | "dominio_hosting" | "altro";
export type Periodo = "prima" | "dopo";

export interface Cliente {
  id: string;
  nome: string;
  referente: string | null;
  telefono: string | null;
  email: string | null;
  sito_web: string | null;
  social: string | null;
  indirizzo: string | null;
  comune: string | null;
  categoria: Categoria;
  stato: Stato;
  storico: boolean;
  fonte: string | null;
  ha_sito: boolean | null;
  motivo_rifiuto: string | null;
  prossimo_contatto: string | null;
  note: string | null;
  orari: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}
export interface Contatto {
  id: string; cliente_id: string; data: string | null; canale: Canale;
  esito: string | null; note: string | null; prossimo_followup: string | null; created_at: string;
}
export interface Servizio {
  id: string; cliente_id: string; tipo: TipoServizio; descrizione: string | null;
  importo: number; stato: "proposto" | "accettato" | "consegnato"; data: string | null; created_at: string;
}
export interface Pagamento {
  id: string; cliente_id: string; descrizione: string; importo_lordo: number; trattenuta_pct: number;
  importo_netto: number; periodo: Periodo; stato: "incassato" | "da_incassare";
  data: string | null; data_label: string | null; created_at: string;
}
export interface Manutenzione {
  id: string; cliente_id: string; importo_lordo: number; trattenuta_pct: number; importo_netto: number;
  giorno_incasso: number; attiva: boolean; attiva_dal: string | null; mesi_storico: number;
  note: string | null; created_at: string;
}
export interface Impostazioni {
  id: number; nome: string; data_zero: string | null; obiettivo: number; scadenza: string;
}

export const STATI: { id: Stato; label: string; short: string; cls: string }[] = [
  { id: "pagato", label: "Pagati", short: "Pagato", cls: "bg-emerald-100 text-emerald-900 border-emerald-300" },
  { id: "accettato", label: "Accettati", short: "Accettato", cls: "bg-teal-100 text-teal-900 border-teal-300" },
  { id: "in_trattativa", label: "In trattativa", short: "In trattativa", cls: "bg-blue-100 text-blue-900 border-blue-300" },
  { id: "contattato", label: "Contattati", short: "Contattato", cls: "bg-cyan-100 text-cyan-900 border-cyan-300" },
  { id: "da_contattare", label: "Da contattare", short: "Da contattare", cls: "bg-slate-100 text-slate-800 border-slate-300" },
  { id: "rifiutato", label: "Rifiutati", short: "Rifiutato", cls: "bg-rose-100 text-rose-900 border-rose-300" },
];
export const STATO_RANK: Record<Stato, number> = {
  pagato: 0, accettato: 1, in_trattativa: 2, contattato: 3, da_contattare: 4, rifiutato: 5,
};
export const statoCfg = (s: Stato) => STATI.find((x) => x.id === s)!;

export const CATEGORIE: { id: Categoria; label: string }[] = [
  { id: "auto_officine", label: "Auto e officine" },
  { id: "ristorazione_bar", label: "Ristorazione e bar" },
  { id: "bellezza_benessere", label: "Bellezza e benessere" },
  { id: "tattoo", label: "Tattoo" },
  { id: "professionisti", label: "Professionisti" },
  { id: "ospitalita", label: "Ospitalità" },
  { id: "sport_danza", label: "Sport e danza" },
  { id: "negozi_commercio", label: "Negozi e commercio" },
  { id: "artigiani_servizi", label: "Artigiani e servizi" },
  { id: "altro", label: "Altro" },
];
export const categoriaLabel = (c: Categoria) => CATEGORIE.find((x) => x.id === c)?.label ?? c;

export const CANALI: { id: Canale; label: string }[] = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "telefono", label: "Telefono" },
  { id: "di_persona", label: "Di persona" },
  { id: "email", label: "Email" },
  { id: "social", label: "Social" },
  { id: "altro", label: "Altro" },
];
export const canaleLabel = (c: Canale) => CANALI.find((x) => x.id === c)?.label ?? c;

export const TIPI_SERVIZIO: { id: TipoServizio; label: string }[] = [
  { id: "sito", label: "Sito" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "landing", label: "Landing page" },
  { id: "logo", label: "Logo" },
  { id: "google_business", label: "Google Business" },
  { id: "locandine", label: "Locandine" },
  { id: "manutenzione", label: "Manutenzione" },
  { id: "dominio_hosting", label: "Dominio e hosting" },
  { id: "altro", label: "Altro" },
];
export const tipoServizioLabel = (t: TipoServizio) => TIPI_SERVIZIO.find((x) => x.id === t)?.label ?? t;

export const GIORNI = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

/* ---------- Formattazione ---------- */
export const fmtEur = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);

export const fmtData = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

/** Link WhatsApp solo per numeri di cellulare italiani (iniziano con 3). */
export const whatsappLink = (tel: string | null | undefined) => {
  if (!tel) return null;
  const digits = tel.replace(/[^\d]/g, "");
  if (!digits.startsWith("3") || digits.length < 9) return null;
  return `https://wa.me/39${digits}`;
};
export const telLink = (tel: string | null | undefined) => (tel ? `tel:${tel.replace(/[^\d+]/g, "")}` : null);

export const normalizeUrl = (u: string | null | undefined) => {
  if (!u) return null;
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
};

/* =========================================================
   Accesso ai dati (Supabase)
   Le tabelle nuove non sono nei tipi generati: si usa un client non tipizzato.
   ========================================================= */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tb = (name: string): any => (supabase as unknown as { from: (t: string) => any }).from(name);

async function many<T>(p: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T[]> {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}
async function exec(p: PromiseLike<{ error: { message: string } | null }>): Promise<void> {
  const { error } = await p;
  if (error) throw new Error(error.message);
}

export const api = {
  clienti: {
    list: () => many<Cliente>(tb("clienti").select("*").order("nome", { ascending: true })),
    get: async (id: string) => {
      const { data, error } = await tb("clienti").select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? null) as Cliente | null;
    },
    create: async (r: Partial<Cliente>) => {
      const { data, error } = await tb("clienti").insert(r).select("id").single();
      if (error) throw new Error(error.message);
      return (data as { id: string }).id;
    },
    update: (id: string, r: Partial<Cliente>) => exec(tb("clienti").update(r).eq("id", id)),
    remove: (id: string) => exec(tb("clienti").delete().eq("id", id)),
  },
  contatti: {
    list: (clienteId: string) =>
      many<Contatto>(tb("contatti_log").select("*").eq("cliente_id", clienteId)
        .order("data", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false })),
    listAll: () => many<Contatto>(tb("contatti_log").select("*")),
    create: (r: Partial<Contatto>) => exec(tb("contatti_log").insert(r)),
    remove: (id: string) => exec(tb("contatti_log").delete().eq("id", id)),
  },
  servizi: {
    list: (clienteId: string) =>
      many<Servizio>(tb("servizi_venduti").select("*").eq("cliente_id", clienteId).order("created_at", { ascending: true })),
    listAll: () => many<Servizio>(tb("servizi_venduti").select("*")),
    create: (r: Partial<Servizio>) => exec(tb("servizi_venduti").insert(r)),
    remove: (id: string) => exec(tb("servizi_venduti").delete().eq("id", id)),
  },
  pagamenti: {
    list: (clienteId: string) =>
      many<Pagamento>(tb("pagamenti").select("*").eq("cliente_id", clienteId).order("created_at", { ascending: true })),
    listAll: () => many<Pagamento>(tb("pagamenti").select("*")),
    create: (r: Partial<Pagamento>) => exec(tb("pagamenti").insert(r)),
    update: (id: string, r: Partial<Pagamento>) => exec(tb("pagamenti").update(r).eq("id", id)),
    remove: (id: string) => exec(tb("pagamenti").delete().eq("id", id)),
  },
  manutenzioni: {
    list: (clienteId: string) =>
      many<Manutenzione>(tb("manutenzioni").select("*").eq("cliente_id", clienteId).order("created_at", { ascending: true })),
    listAll: () => many<Manutenzione>(tb("manutenzioni").select("*")),
    create: (r: Partial<Manutenzione>) => exec(tb("manutenzioni").insert(r)),
    update: (id: string, r: Partial<Manutenzione>) => exec(tb("manutenzioni").update(r).eq("id", id)),
    remove: (id: string) => exec(tb("manutenzioni").delete().eq("id", id)),
  },
  impostazioni: {
    get: async () => {
      const { data, error } = await tb("impostazioni").select("*").eq("id", 1).maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? null) as Impostazioni | null;
    },
    update: (r: Partial<Impostazioni>) => exec(tb("impostazioni").update(r).eq("id", 1)),
  },
};

/** Link "Aggiungi a Google Calendar" (evento di un giorno, senza bisogno di login nell'app). */
export const calendarLink = (titolo: string, isoDate: string, dettagli?: string) => {
  const d = isoDate.replace(/-/g, "");
  const next = new Date(isoDate + "T12:00:00");
  next.setDate(next.getDate() + 1);
  const n = next.toISOString().slice(0, 10).replace(/-/g, "");
  const q = new URLSearchParams({ action: "TEMPLATE", text: titolo, dates: `${d}/${n}`, details: dettagli ?? "" });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
};

export const mapsLink = (indirizzo: string | null | undefined, comune: string | null | undefined) => {
  const q = [indirizzo, comune].filter(Boolean).join(", ");
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
};
