import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPinned, MessageSquareText, Tags } from "lucide-react";
import { PageHead } from "@/components/app/bits";

export const Route = createFileRoute("/strumenti")({
  component: Strumenti,
  head: () => ({ meta: [{ title: "Strumenti — Peak Studio OS" }] }),
});

function Strumenti() {
  const voci = [
    { to: "/listino", titolo: "Listino e preventivo", testo: "Piani e prezzi dal sito, con calcolo del preventivo.", icon: Tags },
    { to: "/messaggi", titolo: "Messaggi WhatsApp", testo: "Modelli pronti da inviare ai clienti con il nome già inserito.", icon: MessageSquareText },
    { to: "/visite", titolo: "Giro visite", testo: "Attività da visitare raggruppate per comune, con mappa.", icon: MapPinned },
  ] as const;
  return (
    <>
      <PageHead kicker="Per lavorare più in fretta" title="Strumenti" />
      <div className="grid gap-4 md:grid-cols-3">
        {voci.map((v) => (
          <Link key={v.to} to={v.to} className="surface block p-6 transition-transform hover:-translate-y-0.5">
            <v.icon className="size-7 text-glacier-700" />
            <h2 className="title-md mt-4">{v.titolo}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{v.testo}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
