import { supabase } from "@/integrations/supabase/client";

export type ClientStatus = "acquisito" | "in_attesa" | "da_contattare" | "rifiutato";
export type ProjectStage = "lead" | "proposta" | "trattativa" | "vinto" | "perso";
export type Priority = "alta" | "media" | "bassa";

export interface Client { id: string; name: string; contact: string | null; notes: string | null; status: ClientStatus; created_at: string; }
export interface Project { id: string; client_id: string | null; name: string; amount: number; stage: ProjectStage; due_date: string | null; notes: string | null; }
export interface Management { id: string; client_id: string | null; name: string; monthly_amount: number; active: boolean; start_date: string | null; notes: string | null; }
export interface Income { id: string; description: string; amount: number; category: string | null; date: string; client_id: string | null; }
export interface Cost { id: string; description: string; amount: number; category: string | null; date: string; recurring: boolean; }
export interface Saving { id: string; amount: number; note: string | null; date: string; }
export interface Todo { id: string; title: string; priority: Priority; done: boolean; }
export interface EventItem { id: string; title: string; date: string; time: string | null; notes: string | null; }
export interface DiaryEntry { id: string; date: string; content: string; mood: number | null; ai_analysis: string | null; }
export interface Settings { id: number; dashboard_name: string; primary_color: string; savings_goal: number; savings_deadline: string | null; moto_split: number; }

export const fmtEur = (n: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
export const fmtDate = (d: string) => new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });

export const api = {
  clients: {
    list: async () => (await supabase.from("clients").select("*").order("created_at", { ascending: false })).data as Client[] | null,
    create: (row: Partial<Client>) => supabase.from("clients").insert(row as never),
    update: (id: string, row: Partial<Client>) => supabase.from("clients").update(row as never).eq("id", id),
    remove: (id: string) => supabase.from("clients").delete().eq("id", id),
  },
  projects: {
    list: async () => (await supabase.from("projects").select("*").order("due_date", { ascending: true, nullsFirst: false })).data as Project[] | null,
    create: (row: Partial<Project>) => supabase.from("projects").insert(row as never),
    update: (id: string, row: Partial<Project>) => supabase.from("projects").update(row as never).eq("id", id),
    remove: (id: string) => supabase.from("projects").delete().eq("id", id),
  },
  managements: {
    list: async () => (await supabase.from("managements").select("*").order("created_at", { ascending: false })).data as Management[] | null,
    create: (row: Partial<Management>) => supabase.from("managements").insert(row as never),
    update: (id: string, row: Partial<Management>) => supabase.from("managements").update(row as never).eq("id", id),
    remove: (id: string) => supabase.from("managements").delete().eq("id", id),
  },
  incomes: {
    list: async () => (await supabase.from("incomes").select("*").order("date", { ascending: false })).data as Income[] | null,
    create: (row: Partial<Income>) => supabase.from("incomes").insert(row as never),
    remove: (id: string) => supabase.from("incomes").delete().eq("id", id),
  },
  costs: {
    list: async () => (await supabase.from("costs").select("*").order("date", { ascending: false })).data as Cost[] | null,
    create: (row: Partial<Cost>) => supabase.from("costs").insert(row as never),
    remove: (id: string) => supabase.from("costs").delete().eq("id", id),
  },
  savings: {
    list: async () => (await supabase.from("savings").select("*").order("date", { ascending: false })).data as Saving[] | null,
    create: (row: Partial<Saving>) => supabase.from("savings").insert(row as never),
    remove: (id: string) => supabase.from("savings").delete().eq("id", id),
  },
  todos: {
    list: async () => (await supabase.from("todos").select("*").order("created_at", { ascending: false })).data as Todo[] | null,
    create: (row: Partial<Todo>) => supabase.from("todos").insert(row as never),
    update: (id: string, row: Partial<Todo>) => supabase.from("todos").update(row as never).eq("id", id),
    remove: (id: string) => supabase.from("todos").delete().eq("id", id),
  },
  events: {
    list: async () => (await supabase.from("events").select("*").order("date", { ascending: true })).data as EventItem[] | null,
    create: (row: Partial<EventItem>) => supabase.from("events").insert(row as never),
    remove: (id: string) => supabase.from("events").delete().eq("id", id),
  },
  diary: {
    list: async () => (await supabase.from("diary_entries").select("*").order("date", { ascending: false }).order("created_at", { ascending: false })).data as DiaryEntry[] | null,
    create: async (row: Partial<DiaryEntry>) => (await supabase.from("diary_entries").insert(row as never).select().single()).data as DiaryEntry | null,
    remove: (id: string) => supabase.from("diary_entries").delete().eq("id", id),
  },
  settings: {
    get: async () => (await supabase.from("settings").select("*").eq("id", 1).maybeSingle()).data as Settings | null,
    update: (row: Partial<Settings>) => supabase.from("settings").update(row as never).eq("id", 1),
  },
};
