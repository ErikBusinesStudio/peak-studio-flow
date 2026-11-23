import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { fmtEur } from "@/lib/gestionale";
import { ADDON, GIORNI_CONSEGNA, MANUTENZIONE, NOTA_IVA, PIANI, SITO, totalePreventivo } from "@/lib/listino";
import { PageHead } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/listino")({
  component: Listino,
  head: () => ({ meta: [{ title: "Listino — Peak Studio OS" }] }),
});

function Listino() {
  const [piano, setPiano] = useState("business");
  const [sel, setSel] = useState<string[]>([]);
  const [manut, setManut] = useState(false);
  const { totale, daDefinire } = useMemo(() => totalePreventivo(piano, sel), [piano, sel]);
  const nomePiano = PIANI.find((p) => p.id === piano)!.nome;

  const testo = () => {
    const righe = [`Preventivo Peak Studio · piano ${nomePiano}`];
    sel.forEach((id) => {
      const a = ADDON.find((x) => x.id === id)!;
      if (a.inclusoIn?.includes(piano)) righe.push(`- ${a.nome} (incluso)`);
      else righe.push(`- ${a.nome}: ${a.prezzo == null ? "su preventivo" : fmtEur(a.prezzo)}`);
    });
    righe.push(`Totale una tantum: ${daDefinire ? `da ${fmtEur(totale)} + voci su preventivo` : fmtEur(totale)}`);
    if (manut) righe.push(`Manutenzione mensile: ${fmtEur(MANUTENZIONE.prezzoMese)}/mese`);
    righe.push(`Consegna in ${GIORNI_CONSEGNA} giorni dalla ricezione del materiale. ${NOTA_IVA}`, SITO);
    return righe.join("\n");
  };

  return (
    <>
      <PageHead kicker="Dal sito peakstudio.click" title="Listino" />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {PIANI.map((p) => (
          <button key={p.id} onClick={() => setPiano(p.id)} aria-pressed={piano === p.id}
            className={cn("surface p-5 text-left transition-all", piano === p.id && "ring-2 ring-glacier-500")}>
            <p className="hud text-muted-foreground">{p.consigliato ? "Consigliato" : " "}</p>
            <h2 className="title-md mt-1">{p.nome}</h2>
            <p className="mt-2 font-display text-3xl font-extrabold">{p.prezzoDa == null ? "Su misura" : `da ${fmtEur(p.prezzoDa)}`}</p>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">{p.include.map((i) => <li key={i}>• {i}</li>)}</ul>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="surface p-5">
          <h2 className="title-md mb-3">Aggiunte</h2>
          <ul className="divide-y divide-border">
            {ADDON.map((a) => {
              const incluso = a.inclusoIn?.includes(piano);
              return (
                <li key={a.id}>
                  <label className="flex cursor-pointer items-center justify-between gap-3 py-3">
                    <span className="flex items-center gap-3">
                      <Checkbox checked={sel.includes(a.id)} onCheckedChange={(v) => setSel((s) => (v ? [...s, a.id] : s.filter((x) => x !== a.id)))} />
                      <span><span className="block font-medium">{a.nome}</span><span className="hud text-muted-foreground">{a.cat}</span></span>
                    </span>
                    <span className="text-sm">{incluso ? "incluso nel piano" : a.prezzo == null ? "su preventivo" : fmtEur(a.prezzo)}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="surface-deep h-fit p-6 lg:sticky lg:top-24">
          <p className="hud text-white/70">Preventivo · {nomePiano}</p>
          <p className="mt-2 font-display text-5xl font-extrabold leading-none">{daDefinire && "da "}{fmtEur(totale)}</p>
          {daDefinire && <p className="mt-2 text-sm text-white/70">Include voci su preventivo: il totale va definito.</p>}
          <label className="mt-5 flex items-center gap-3 text-sm">
            <Checkbox checked={manut} onCheckedChange={(v) => setManut(!!v)} className="border-white/60" />
            Manutenzione mensile {fmtEur(MANUTENZIONE.prezzoMese)}/mese
          </label>
          <p className="mt-4 text-xs text-white/60">Consegna in {GIORNI_CONSEGNA} giorni dal materiale. {NOTA_IVA}</p>
          <Button className="mt-5 w-full rounded-full" variant="secondary"
            onClick={() => navigator.clipboard.writeText(testo()).then(() => toast.success("Preventivo copiato"), () => toast.error("Copia non riuscita"))}>
            Copia testo preventivo
          </Button>
        </aside>
      </div>

      <section className="surface mt-6 p-5">
        <h2 className="title-md mb-2">Manutenzione mensile · {fmtEur(MANUTENZIONE.prezzoMese)}</h2>
        <ul className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">{MANUTENZIONE.include.map((i) => <li key={i}>• {i}</li>)}</ul>
      </section>
    </>
  );
}
