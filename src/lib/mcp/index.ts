import { auth, defineMcp } from "@lovable.dev/mcp-js";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";
import listClients from "./tools/list-clients";
import listIncomes from "./tools/list-incomes";
import listCosts from "./tools/list-costs";
import listTodos from "./tools/list-todos";
import listEvents from "./tools/list-events";
import listSavings from "./tools/list-savings";
import getKpis from "./tools/get-kpis";
import createTodo from "./tools/create-todo";
import createEvent from "./tools/create-event";
import createIncome from "./tools/create-income";
import createClient from "./tools/create-client";

export default defineMcp({
  name: "peak-studio-hub",
  title: "Peak Studio Hub",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  version: "0.1.0",
  instructions:
    "Basecamp is Erik's personal management app for Peak Studio (web agency). Tools let you read and update clients, incomes, costs, to-dos, calendar events, savings, and headline KPIs.",
  tools: [
    listClients,
    listIncomes,
    listCosts,
    listTodos,
    listEvents,
    listSavings,
    getKpis,
    createTodo,
    createEvent,
    createIncome,
    createClient,
  ],
});
