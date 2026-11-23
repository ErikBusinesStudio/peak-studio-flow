import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, whatsappLink } from "@/lib/gestionale";
import { SITO } from "@/lib/listino";
import { PageHead } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/messaggi")({
  component: Messaggi,
  head: () => ({ meta: [{ title: "Messaggi — Peak Studio OS" }] }),
});

// Tono: scritti da un ragazzo che lo dice, bozza gratuita da vedere dal vivo, chiusura con il sito.
const MODELLI = [
  { id: "primo", nome: "Primo contatto", testo: `Buongiorno {nome}, sono Erik, un ragazzo di Casalzuigno che realizza siti web per le attività del territorio. Se le interessa, preparo una bozza gratuita del sito e passo a mostrargliela di persona, senza impegno. Qui trova i miei lavori: ${SITO}` },
  { id: "followup", nome: "Follow-up dopo il primo messaggio", testo: `Buongiorno {nome}, sono Erik, le avevo scritto qualche giorno fa per la bozza gratuita del sito. Ha avuto modo di pensarci? Se vuole passo a trovarla e gliela mostro dal vivo. ${SITO}` },
  { id: "bozza", nome: "Bozza pronta", testo: `Buongiorno {nome}, sono Erik, ho preparato la bozza gratuita del sito per la sua attività. Quando le va, passo a farle vedere come è venuta? ${SITO}` },
  { id: "preventivo", nome: "Invio preventivo", testo: `Buongiorno {nome}, sono Erik di Peak Studio. Le invio il preventivo come d'accordo: resto a disposizione per qualsiasi domanda o modifica. ${SITO}` },
  { id: "grazie", nome: "Dopo il pagamento", testo: `Buongiorno {nome}, sono Erik, grazie per la fiducia! Il sito è online e per qualsiasi modifica o dubbio può scrivermi qui. ${SITO}` },
];

function Messaggi() {
  const clienti = useQuery({ queryKey: ["clienti"], queryFn: api.clienti.list });
  const [modello, setModello] = useState(MODELLI[0].id);
  const [clienteId, setClienteId] = useState<string>("");
  const cliente = (clienti.data ?? []).find((c) => c.id === clienteId);
  const base = MODELLI.find((m) => m.id === modello)!.testo;
  const [custom, setCustom] = useState<string | null>(null);

  const testo = useMemo(() => (custom ?? base).replaceAll("{nome}", cliente?.referente || cliente?.nome || "{nome}"), [custom, base, cliente]);
  const wa = cliente ? whatsappLink(cliente.telefono) : null;
  const waConTesto = wa ? `${wa}${wa.includes("?") ? "&" : "?"}text=${encodeURIComponent(testo)}` : null;

  return (
    <>
      <PageHead kicker="Pronti da inviare" title="Messaggi" />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="surface space-y-2 p-4">
          {MODELLI.map((m) => (
            <button key={m.id} onClick={() => { setModello(m.id); setCustom(null); }} aria-pressed={modello === m.id}
              className={`hud w-full rounded-xl border px-4 py-3 text-left ${modello === m.id ? "border-deep-900 bg-deep-900 text-white" : "border-border bg-white/70"}`}>
              {m.nome}
            </button>
          ))}
        </div>
        <div className="surface space-y-4 p-5">
          <Select value={clienteId} onValueChange={setClienteId}>
            <SelectTrigger aria-label="Cliente"><SelectValue placeholder="Scegli il cliente (inserisce il nome)" /></SelectTrigger>
            <SelectContent>{(clienti.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
          </Select>
          <Textarea rows={7} value={testo} onChange={(e) => setCustom(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {waConTesto ? (
              <a href={waConTesto} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center rounded-full bg-deep-900 px-6 font-semibold text-white">Apri in WhatsApp</a>
            ) : (
              <Button disabled className="h-11 rounded-full">{cliente ? "Numero non valido per WhatsApp" : "Scegli un cliente"}</Button>
            )}
            <Button variant="outline" className="h-11 rounded-full"
              onClick={() => navigator.clipboard.writeText(testo).then(() => toast.success("Copiato"), () => toast.error("Copia non riuscita"))}>Copia</Button>
          </div>
          <p className="text-xs text-muted-foreground">Dopo l&apos;invio registra il contatto dalla Pipeline o dal Follow-up.</p>
        </div>
      </div>
    </>
  );
}
