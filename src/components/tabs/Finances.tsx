import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, fmtEur, type Income, type Cost, type IncomeStatus } from "@/lib/db";
import { P } from "@/lib/theme";
import { Sec, Btn, Field, Modal, Card } from "@/components/ui/Sec";
import { useState } from "react";
import { toast } from "sonner";

export default function Finances() {
  const qc = useQueryClient();
  const { data: incomes = [] } = useQuery<Income[]>({ queryKey: ["incomes"], queryFn: api.incomes.list });
  const { data: costs = [] } = useQuery<Cost[]>({ queryKey: ["costs"], queryFn: api.costs.list });

  const inTot = incomes.filter((i) => i.status === "incassato").reduce((s, i) => s + Number(i.amount), 0);
  const inPend = incomes.filter((i) => i.status === "da_incassare").reduce((s, i) => s + Number(i.amount), 0);
  const cTot = costs.reduce((s, c) => s + Number(c.amount), 0);

  const [openI, setOpenI] = useState(false);
  const [openC, setOpenC] = useState(false);
  const [iDesc, setIDesc] = useState(""); const [iAmt, setIAmt] = useState(""); const [iLbl, setILbl] = useState(""); const [iStat, setIStat] = useState<IncomeStatus>("incassato");
  const [cDesc, setCDesc] = useState(""); const [cAmt, setCAmt] = useState(""); const [cLbl, setCLbl] = useState("");

  const wrap = async (keys: string[], fn: () => Promise<unknown>, msg: string) => {
    try { await fn(); keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] })); toast.success(msg); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        <MiniKpi label="Incassato" value={fmtEur(inTot)} color={P.green} />
        <MiniKpi label="Da incassare" value={fmtEur(inPend)} color={P.amber} />
        <MiniKpi label="Costi" value={fmtEur(cTot)} color={P.red} />
      </div>

      <Sec title="Entrate" accent={P.green} action={<Btn color={P.green} onClick={() => setOpenI(true)}>+ Aggiungi</Btn>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {incomes.map((i) => (
            <Card key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.navy }}>{i.description}</div>
                <div style={{ fontSize: 11, color: P.slateL, marginTop: 2 }}>{i.date_label || i.date} · {i.status === "incassato" ? "incassato" : "da incassare"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: i.status === "incassato" ? P.green : P.amber }}>{fmtEur(Number(i.amount))}</div>
                <button onClick={() => wrap(["incomes"], () => api.incomes.remove(i.id), "Eliminata")} style={{ background: "transparent", border: 0, color: P.red, cursor: "pointer" }}>×</button>
              </div>
            </Card>
          ))}
        </div>
      </Sec>

      <Sec title="Costi" accent={P.red} action={<Btn color={P.red} onClick={() => setOpenC(true)}>+ Aggiungi</Btn>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {costs.map((c) => (
            <Card key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.navy }}>{c.description}</div>
                <div style={{ fontSize: 11, color: P.slateL, marginTop: 2 }}>{c.date_label || c.date}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: P.red }}>{fmtEur(Number(c.amount))}</div>
                <button onClick={() => wrap(["costs"], () => api.costs.remove(c.id), "Eliminato")} style={{ background: "transparent", border: 0, color: P.red, cursor: "pointer" }}>×</button>
              </div>
            </Card>
          ))}
        </div>
      </Sec>

      <Modal open={openI} onClose={() => setOpenI(false)} title="Nuova entrata">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Field placeholder="Descrizione" value={iDesc} onChange={(e) => setIDesc(e.target.value)} />
          <Field placeholder="Importo €" type="number" value={iAmt} onChange={(e) => setIAmt(e.target.value)} />
          <Field placeholder="Data (es. Mag 2026 o 01/07/2026)" value={iLbl} onChange={(e) => setILbl(e.target.value)} />
          <select value={iStat} onChange={(e) => setIStat(e.target.value as IncomeStatus)}
            style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 13 }}>
            <option value="incassato">Incassato</option>
            <option value="da_incassare">Da incassare</option>
          </select>
          <Btn color={P.green} disabled={!iDesc || !iAmt} onClick={async () => {
            await wrap(["incomes"], () => api.incomes.create({ description: iDesc, amount: Number(iAmt), date_label: iLbl || null, status: iStat }), "Aggiunta");
            setIDesc(""); setIAmt(""); setILbl(""); setIStat("incassato"); setOpenI(false);
          }}>Salva</Btn>
        </div>
      </Modal>

      <Modal open={openC} onClose={() => setOpenC(false)} title="Nuovo costo">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Field placeholder="Descrizione" value={cDesc} onChange={(e) => setCDesc(e.target.value)} />
          <Field placeholder="Importo €" type="number" value={cAmt} onChange={(e) => setCAmt(e.target.value)} />
          <Field placeholder="Data (es. Giu 2026)" value={cLbl} onChange={(e) => setCLbl(e.target.value)} />
          <Btn color={P.red} disabled={!cDesc || !cAmt} onClick={async () => {
            await wrap(["costs"], () => api.costs.create({ description: cDesc, amount: Number(cAmt), date_label: cLbl || null }), "Aggiunto");
            setCDesc(""); setCAmt(""); setCLbl(""); setOpenC(false);
          }}>Salva</Btn>
        </div>
      </Modal>
    </div>
  );
}

function MiniKpi({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${P.border}`, borderTop: `3px solid ${color}`, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", color: P.slateL, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color, marginTop: 2 }}>{value}</div>
    </div>
  );
}
