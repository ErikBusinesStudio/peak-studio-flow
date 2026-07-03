import { createServerFn } from "@tanstack/react-start";

export type DiaryCategory = "Peak Studio" | "Scuola" | "Personale" | "Idee" | "Task";

export type DiaryAction =
  | { type: "cliente"; name: string; status?: string; notes?: string }
  | { type: "entrata"; description: string; amount: number; category?: string; date?: string }
  | { type: "task"; title: string; priority?: "alta" | "media" | "bassa" }
  | { type: "evento"; title: string; date: string; time?: string; notes?: string };

export interface DiaryAnalysis {
  summary: string;
  categories: Record<DiaryCategory, string[]>;
  actions: DiaryAction[];
}

const SYSTEM_PROMPT = `Sei un assistente che analizza il diario giornaliero di Erik (founder di Peak Studio, agenzia web).
Rispondi SEMPRE in italiano e SOLO con JSON valido (nessun testo extra, nessun markdown).

Schema JSON obbligatorio:
{
  "summary": "riassunto breve in una frase (max 140 caratteri)",
  "categories": {
    "Peak Studio": ["punto...", "..."],
    "Scuola": ["..."],
    "Personale": ["..."],
    "Idee": ["..."],
    "Task": ["..."]
  },
  "actions": [
    // solo azioni CONCRETE menzionate esplicitamente. Ogni action è UNA di queste forme:
    { "type": "cliente", "name": "Nome cliente", "status": "da_contattare|in_attesa|acquisito|rifiutato", "notes": "opzionale" },
    { "type": "entrata", "description": "descrizione", "amount": 500, "category": "opzionale", "date": "YYYY-MM-DD opzionale" },
    { "type": "task", "title": "cosa fare", "priority": "alta|media|bassa" },
    { "type": "evento", "title": "titolo evento", "date": "YYYY-MM-DD", "time": "HH:MM opzionale", "notes": "opzionale" }
  ]
}

Regole:
- Tutte le 5 chiavi in "categories" devono esistere (usa array vuoto [] se non applicabile).
- Estrai in "actions" SOLO cose concrete e azionabili chiaramente nominate nel testo. Non inventare.
- Date: se il testo dice "oggi/domani", converti in formato YYYY-MM-DD (usa la data odierna come riferimento se serve).
- Se il testo è vago o vuoto, restituisci comunque JSON valido con actions: [].`;

export const analyzeDiary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const obj = input as { content?: unknown };
    if (typeof obj?.content !== "string" || obj.content.trim().length === 0) {
      throw new Error("Contenuto vuoto");
    }
    return { content: obj.content.trim().slice(0, 8000) };
  })
  .handler(async ({ data }): Promise<DiaryAnalysis> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY non configurata");

    const today = new Date().toISOString().slice(0, 10);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    let response: Response;
    try {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": apiKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Data odierna: ${today}\n\nDiario:\n${data.content}` },
          ],
        }),
      });
    } catch (err) {
      clearTimeout(timeout);
      if ((err as Error).name === "AbortError") {
        throw new Error("Timeout: l'AI ha impiegato troppo tempo. Riprova.");
      }
      throw new Error("Errore di rete verso l'AI. Riprova.");
    }
    clearTimeout(timeout);

    if (response.status === 429) throw new Error("Limite richieste AI raggiunto. Riprova tra poco.");
    if (response.status === 402) throw new Error("Crediti AI esauriti. Aggiungi crediti nel workspace.");
    if (!response.ok) throw new Error(`AI ha risposto con errore ${response.status}. Riprova.`);

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = payload.choices?.[0]?.message?.content?.trim();
    if (!raw) throw new Error("Risposta AI vuota. Riprova.");

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Try to extract JSON block if the model wrapped it
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("L'AI non ha restituito JSON valido. Riprova.");
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        throw new Error("L'AI non ha restituito JSON valido. Riprova.");
      }
    }

    const obj = parsed as Partial<DiaryAnalysis> & { categories?: Partial<Record<DiaryCategory, unknown>> };
    const cats: DiaryCategory[] = ["Peak Studio", "Scuola", "Personale", "Idee", "Task"];
    const categories = {} as Record<DiaryCategory, string[]>;
    for (const c of cats) {
      const v = obj.categories?.[c];
      categories[c] = Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
    }

    const actions: DiaryAction[] = Array.isArray(obj.actions)
      ? (obj.actions.filter((a) => a && typeof a === "object" && typeof (a as { type?: unknown }).type === "string") as DiaryAction[])
      : [];

    return {
      summary: typeof obj.summary === "string" ? obj.summary : "",
      categories,
      actions,
    };
  });
