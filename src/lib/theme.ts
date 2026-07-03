export const P = {
  navy: "#0a0f1e",
  navyMid: "#111827",
  navyLt: "#1e293b",
  blue: "#3b82f6",
  blueLt: "#60a5fa",
  amber: "#f59e0b",
  green: "#22c55e",
  red: "#ef4444",
  purple: "#a855f7",
  slate: "#64748b",
  slateL: "#94a3b8",
  border: "#e2e8f0",
  bg: "#f8fafc",
  white: "#ffffff",
  rose: "#f43f5e",
  accent: "#6366f1",
} as const;

export const STATO_CFG: Record<string, { label: string; color: string; dot: string }> = {
  acquisito: { label: "Acquisito", color: "#16a34a", dot: "#22c55e" },
  in_attesa: { label: "In attesa", color: "#d97706", dot: "#f59e0b" },
  da_contattare: { label: "Da contattare", color: "#2563eb", dot: "#3b82f6" },
  rifiutato: { label: "Rifiutato", color: "#dc2626", dot: "#ef4444" },
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
