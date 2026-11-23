import { auth, defineMcp } from "@lovable.dev/mcp-js";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";
import listClienti from "./tools/list-clienti";
import listPagamenti from "./tools/list-pagamenti";
import listCosts from "./tools/list-costs";
import listTodos from "./tools/list-todos";
import listEvents from "./tools/list-events";
import listSavings from "./tools/list-savings";
import getKpis from "./tools/get-kpis";
import createTodo from "./tools/create-todo";
import createEvent from "./tools/create-event";
import addPagamento from "./tools/add-pagamento";
import createCliente from "./tools/create-cliente";
import addContatto from "./tools/add-contatto";

export default defineMcp({
  name: "peak-studio-hub",
  title: "Peak Studio Hub",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  version: "0.1.0",
  instructions:
    "Gestionale di Erik per Peak Studio (agenzia web). Strumenti per leggere e aggiornare clienti, contatti, pagamenti e KPI (obiettivo 10.000 €). Costi, to-do, eventi e risparmi leggono ancora le vecchie tabelle.",
  tools: [
    listClienti,
    listPagamenti,
    listCosts,
    listTodos,
    listEvents,
    listSavings,
    getKpis,
    createTodo,
    createEvent,
    addPagamento,
    createCliente,
    addContatto,
  ],
});
