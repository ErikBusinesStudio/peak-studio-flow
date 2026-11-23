import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type OAuthApi = {
  getAuthorizationDetails(id: string): Promise<{ data: any; error: { message: string } | null }>;
  approveAuthorization(id: string): Promise<{ data: any; error: { message: string } | null }>;
  denyAuthorization(id: string): Promise<{ data: any; error: { message: string } | null }>;
};
const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s["authorization_id"] === "string" ? s["authorization_id"] : "",
  }),
  head: () => ({ meta: [{ title: "Autorizza accesso — Peak Studio OS" }, { name: "robots", content: "noindex" }] }),
  component: Consent,
});

// Il layout principale mostra già il login se non c'è sessione: qui la sessione esiste.
function Consent() {
  const { authorization_id } = Route.useSearch();
  const [details, setDetails] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authorization_id) { setError("Richiesta di autorizzazione mancante."); return; }
    oauth().getAuthorizationDetails(authorization_id).then(({ data, error }) => {
      if (error) { setError(error.message); return; }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) { window.location.href = immediate; return; }
      setDetails(data);
    }).catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [authorization_id]);

  async function decide(approve: boolean) {
    setBusy(true); setError(null);
    try {
      const { data, error } = approve ? await oauth().approveAuthorization(authorization_id) : await oauth().denyAuthorization(authorization_id);
      if (error) throw new Error(error.message);
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) throw new Error("Nessun indirizzo di ritorno ricevuto.");
      window.location.href = target;
    } catch (e) { setBusy(false); setError(e instanceof Error ? e.message : String(e)); }
  }

  const name = details?.client?.name ?? "un'app";
  return (
    <div className="surface mx-auto max-w-md p-6">
      <h1 className="title-xl">Collega {name}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{name} potrà leggere e modificare i dati del gestionale a tuo nome.</p>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-5 flex gap-3">
        <Button disabled={busy || !details} onClick={() => decide(true)}>Autorizza</Button>
        <Button variant="outline" disabled={busy || !details} onClick={() => decide(false)}>Rifiuta</Button>
      </div>
    </div>
  );
}
