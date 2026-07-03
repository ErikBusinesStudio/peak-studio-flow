export const P = {
  // Dark burgundy palette matched to peakstudio.it
  bg: "#1a0810",           // page background — deep wine
  card: "#25101a",         // surface / cards
  cardAlt: "#2f1522",      // elevated / hover
  navy: "#f5e6d3",         // primary text (cream) — token name kept for compatibility
  navyMid: "#14060c",      // header/tabs bg (deepest)
  navyLt: "#3a1621",       // divider on dark
  border: "#3a1621",       // borders on dark surfaces
  slate: "#c9a89b",        // secondary text
  slateL: "#8a6b62",       // muted text
  white: "#ffffff",
  // Accents (mountain-inspired warm reds)
  accent: "#e11d48",       // primary rose/red
  rose: "#f43f5e",
  red: "#ef4444",
  amber: "#f59e0b",
  green: "#22c55e",
  blue: "#60a5fa",
  blueLt: "#93c5fd",
  purple: "#a855f7",
} as const;

export const STATO_CFG: Record<string, { label: string; color: string; dot: string }> = {
  acquisito: { label: "Acquisito", color: "#22c55e", dot: "#22c55e" },
  in_attesa: { label: "In attesa", color: "#f59e0b", dot: "#f59e0b" },
  da_contattare: { label: "Da contattare", color: "#60a5fa", dot: "#60a5fa" },
  rifiutato: { label: "Rifiutato", color: "#ef4444", dot: "#ef4444" },
};
export const STATO_ORDER = ["acquisito", "in_attesa", "da_contattare", "rifiutato"] as const;

export const DIST: Record<string, number> = {
  Casalzuigno: 0, Cuveglio: 2.5, Rancio: 3.5, Brenta: 4, Cittiglio: 5.5,
  Caravate: 7.5, Cocquio: 8.5, Besozzo: 9.5, Gavirate: 11, Laveno: 11.5,
};

export const PRIO_COLOR: Record<string, string> = { alta: P.red, media: P.amber, bassa: P.blue };

export const DIARY_CATS = [
  { id: "Peak Studio", icon: "⛰", color: P.amber },
  { id: "Scuola", icon: "📚", color: P.green },
  { id: "Personale", icon: "🫀", color: P.rose },
  { id: "Idee", icon: "💡", color: P.purple },
  { id: "Task", icon: "✅", color: P.blue },
] as const;

export const fmtEur = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export const fmtEur2 = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
