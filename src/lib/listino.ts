// Listino Peak Studio. Fonte: src/config/site.ts del sito (repo peak-studio3).
// Se cambiano i prezzi sul sito, aggiornali anche qui (il sito prevale sempre).
export const SITO = "https://peakstudio.click";
export const GIORNI_CONSEGNA = 7;
export const NOTA_IVA = "Prezzi indicativi, IVA esclusa se dovuta.";

export type Piano = { id: string; nome: string; prezzoDa: number | null; consigliato?: boolean; include: string[] };
export const PIANI: Piano[] = [
  { id: "starter", nome: "Starter", prezzoDa: 390, include: ["Sito a pagina singola", "Design su misura, adatto a ogni schermo", "Pulsante WhatsApp e modulo contatti"] },
  { id: "business", nome: "Business", prezzoDa: 790, consigliato: true, include: ["Fino a 5 pagine", "Menù o catalogo", "Una lingua aggiuntiva", "Ottimizzazione per Google"] },
  { id: "premium", nome: "Premium", prezzoDa: 1490, include: ["Pagine illimitate", "Animazioni e sezioni avanzate", "Prenotazioni o richieste online"] },
  { id: "ecommerce", nome: "E-commerce", prezzoDa: 1200, include: ["Catalogo prodotti", "Carrello e pagamenti online", "Gestione di ordini e spedizioni"] },
  { id: "custom", nome: "Su misura", prezzoDa: null, include: ["Progetto costruito sulle tue esigenze", "Funzioni personalizzate"] },
];

export type Addon = { id: string; cat: string; nome: string; prezzo: number | null; inclusoIn?: string[] };
export const ADDON: Addon[] = [
  { id: "gbp", cat: "Visibilità", nome: "Scheda Google Business", prezzo: 40 },
  { id: "analytics", cat: "Visibilità", nome: "Statistiche e conversioni", prezzo: 60 },
  { id: "lingua", cat: "Contenuti", nome: "Lingua aggiuntiva", prezzo: 30, inclusoIn: ["business"] },
  { id: "foto", cat: "Contenuti", nome: "Selezione immagini", prezzo: 40 },
  { id: "prenotazioni", cat: "Funzioni", nome: "Prenotazioni online", prezzo: 150, inclusoIn: ["premium"] },
  { id: "moduli", cat: "Funzioni", nome: "Moduli di preventivo", prezzo: 90 },
  { id: "automazioni", cat: "Crescita", nome: "Automazioni e CRM", prezzo: 190 },
];

export const PAGAMENTO = "30% alla conferma, 70% alla consegna";

export const IDENTITA = [
  { id: "nome", nome: "Nome e dominio", prezzoDa: 30 },
  { id: "logo", nome: "Logo", prezzoDa: 150 },
  { id: "coordinata", nome: "Logo + immagine coordinata", prezzoDa: 290 },
  { id: "completa", nome: "Identità completa", prezzoDa: 590 },
];

export const MANUTENZIONE = {
  prezzoMese: 60,
  include: ["Aggiornamenti grafici e tecnici", "Backup mensile completo su server esterno", "Scansione di sicurezza mensile", "Recap mensile delle visite su richiesta"],
};

export const totalePreventivo = (pianoId: string, addonIds: string[]) => {
  const piano = PIANI.find((p) => p.id === pianoId);
  let totale = piano?.prezzoDa ?? 0;
  let daDefinire = piano?.prezzoDa == null;
  for (const id of addonIds) {
    const a = ADDON.find((x) => x.id === id);
    if (!a || a.inclusoIn?.includes(pianoId)) continue;
    if (a.prezzo == null) daDefinire = true; else totale += a.prezzo;
  }
  return { totale, daDefinire };
};
