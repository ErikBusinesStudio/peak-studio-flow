import { supabase } from "@/integrations/supabase/client";

export type ClientStatus = "acquisito" | "in_attesa" | "da_contattare" | "rifiutato";
export type Priority = "alta" | "media" | "bassa";
export type IncomeStatus = "incassato" | "da_incassare";
export type MgmtCategory = "acquisito" | "pipeline";

export interface Client {
  id: string; name: string; zona: string | null; status: ClientStatus;
  value: number | null; collected: number; phone: string | null; contact: string | null;
  notes: string | null; hours: Record<string, string> | null; created_at: string;
}
export interface ServiceItem { v: string; i: number }
export interface Project {
  id: string; name: string; color: string | null;
  services_one_off: ServiceItem[]; services_monthly: ServiceItem[];
  notes: string | null;
}
export interface Management {
  id: string; name: string; monthly_amount: number | null; category: MgmtCategory;
  notes: string | null; active: boolean;
}
export interface Income {
  id: string; description: string; amount: number; date_label: string | null;
  date: string | null; status: IncomeStatus; category: string | null; client_id: string | null;
}
export interface Cost {
  id: string; description: string; amount: number; date_label: string | null; date: string | null;
}
export interface Saving { id: string; amount: number; note: string | null; date: string; }
export interface Todo { id: string; title: string; priority: Priority; done: boolean; date_note: string | null; }
export interface EventItem { id: string; title: string; date: string; time: string | null; notes: string | null; }
export interface Update { id: string; date: string; event: string; category: string; }
export interface DiaryEntry { id: string; date: string; content: string; ai_analysis: string | null; }
export interface Settings {
  id: number; dashboard_name: string; primary_color: string;
  savings_goal: number; savings_deadline: string | null; moto_split: number;
}

const T = supabase.from.bind(supabase);
const first = async <T>(p: PromiseLike<{ data: unknown; error: unknown }>): Promise<T[]> => {
  const { data, error } = await p;
  if (error) throw error;
  return (data ?? []) as T[];
};
const run = async (p: PromiseLike<{ error: unknown }>): Promise<void> => {
  const { error } = await p;
  if (error) throw error;
};

export const api = {
  clients: {
    list: () => first<Client>(T("clients").select("*").order("created_at", { ascending: true })),
    create: (r: Partial<Client>) => T("clients").insert(r as never),
    update: (id: string, r: Partial<Client>) => T("clients").update(r as never).eq("id", id),
    remove: (id: string) => T("clients").delete().eq("id", id),
  },
  projects: {
    list: () => first<Project>(T("projects").select("*").order("created_at", { ascending: true })),
    create: (r: Partial<Project>) => T("projects").insert(r as never),
    update: (id: string, r: Partial<Project>) => T("projects").update(r as never).eq("id", id),
    remove: (id: string) => T("projects").delete().eq("id", id),
  },
  managements: {
    list: () => first<Management>(T("managements").select("*").order("created_at", { ascending: true })),
    create: (r: Partial<Management>) => T("managements").insert(r as never),
    update: (id: string, r: Partial<Management>) => T("managements").update(r as never).eq("id", id),
    remove: (id: string) => T("managements").delete().eq("id", id),
  },
  incomes: {
    list: () => first<Income>(T("incomes").select("*").order("created_at", { ascending: true })),
    create: (r: Partial<Income>) => T("incomes").insert(r as never),
    update: (id: string, r: Partial<Income>) => T("incomes").update(r as never).eq("id", id),
    remove: (id: string) => T("incomes").delete().eq("id", id),
  },
  costs: {
    list: () => first<Cost>(T("costs").select("*").order("created_at", { ascending: true })),
    create: (r: Partial<Cost>) => T("costs").insert(r as never),
    remove: (id: string) => T("costs").delete().eq("id", id),
  },
  savings: {
    list: () => first<Saving>(T("savings").select("*").order("date", { ascending: false })),
    create: (r: Partial<Saving>) => T("savings").insert(r as never),
    remove: (id: string) => T("savings").delete().eq("id", id),
  },
  todos: {
    list: () => first<Todo>(T("todos").select("*").order("created_at", { ascending: true })),
    create: (r: Partial<Todo>) => T("todos").insert(r as never),
    update: (id: string, r: Partial<Todo>) => T("todos").update(r as never).eq("id", id),
    remove: (id: string) => T("todos").delete().eq("id", id),
  },
  events: {
    list: () => first<EventItem>(T("events").select("*").order("date", { ascending: true })),
    create: (r: Partial<EventItem>) => T("events").insert(r as never),
    remove: (id: string) => T("events").delete().eq("id", id),
  },
  updates: {
    list: () => first<Update>(T("updates").select("*").order("date", { ascending: false })),
    create: (r: Partial<Update>) => T("updates").insert(r as never),
    remove: (id: string) => T("updates").delete().eq("id", id),
  },
  diary: {
    list: () => first<DiaryEntry>(T("diary_entries").select("*").order("date", { ascending: false }).order("created_at", { ascending: false })),
    create: (r: Partial<DiaryEntry>) => T("diary_entries").insert(r as never),
    remove: (id: string) => T("diary_entries").delete().eq("id", id),
  },
  settings: {
    get: async () => {
      const { data } = await T("settings").select("*").eq("id", 1).maybeSingle();
      return data as Settings | null;
    },
    update: (r: Partial<Settings>) => T("settings").update(r as never).eq("id", 1),
  },
};

export const fmtEur = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
