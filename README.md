# Peak Studio Hub

Crea "Peak Studio OS", un gestionale personale per un'agenzia web (founder: Erik). App mobile-first, tema chiaro con header navy scuro (#0f172a) e accento indigo (#6366f1). Navigazione a tab orizzontale scrollabile in alto. TUTTI i dati devono essere salvati in modo persistente nel database (usa il backend Lovable/Supabase) così restano anche cambiando dispositivo.

TAB DA CREARE:

1. OVERVIEW: griglia di card con KPI (Incassato, Da incassare, Pipeline una tantum, Pipeline mensile, Risparmi, Conversione). Sotto due colonne: "Azioni urgenti" (todo priorità alta) e "Aggiornamenti recenti" (cronologia).

2. DIARIO: casella di testo dove l'utente scrive o detta la giornata. Bottone "Analizza" che manda il testo a un'analisi AI. L'AI deve dividere il contenuto in categorie fisse (Peak Studio, Scuola, Personale, Idee, Task) ed estrarre "azioni" concrete (nuovo cliente, entrata incassata, task, evento). Le azioni vengono mostrate come card con una domanda di conferma: l'utente conferma o salta. Se conferma, l'azione aggiorna la dashboard (aggiunge cliente/entrata/task/evento). Ogni entry salvata mostra: sommario, categorie con i punti estratti, e il testo originale in una sezione nascosta espandibile ("Mostra testo originale"). Feed con entry più recenti in cima.

3. CALENDARIO: calendario mensile vero, navigabile avanti/indietro. I giorni con eventi hanno un pallino. Cliccando un giorno si apre il dettaglio con gli eventi di quel giorno. Gli eventi arrivano dalle entry del diario (sommario) e da eventi manuali.

4. PIPELINE: progetti non ancora chiusi con dettaglio voci una tantum e mensili. Progetti: Fratelli Longhi (sito 960€, dominio+test 150€, cookie+SEO 200€, logo 80€, post social 80€; mensile: gestione tecnica 50€, cookie 30€, caricamento auto 35€/cad, aggiornamenti Hyundai 150€), ADHD & Biscotti (sito 450€, mensile 50€), CRV Revisioni (sito 500€, mensile 50€), Partito degli Indecisi (sito 800€, mensile 50€).

5. GESTIONI: due sezioni. "Acquisiti da attivare" (CTS Cuvio 50€/mese, Usato e-Riulity 50€/mese, Safety Solution da definire). "Pipeline future" (Fratelli Longhi 230€/mese + 35€/auto, ADHD 50€, CRV 50€, Partito Indecisi 50€).

6. CLIENTI: lista filtrabile per stato (acquisito, in attesa, da contattare, rifiutato) e ricerca. I rifiutati vanno in fondo con opacità ridotta. Ogni cliente cliccabile mostra scheda dettaglio con valore, incassato, note, telefono, zona. Pulsante "+ Cliente" per aggiungere e "Modifica" per editare/eliminare. Dati clienti iniziali: CTS Cuvio (Cuveglio, acquisito, 340€ incassati), Usato e-Riulity (Cittiglio, acquisito, 1200€ valore 700€ incassati), Bar Cuveglio (acquisito, 150€), Safety Solution (Gavirate, acquisito, 200€, tel 0332 743388), Fratelli Longhi (Casalzuigno, in attesa, tel 0332 650256), CRV Revisioni (Cuveglio, in attesa, 500€), ADHD & Biscotti (in attesa, 450€), Partito degli Indecisi (in attesa, 800€), Kodawari Ink (Cuveglio, in attesa, tel 3791067891), più clienti rifiutati (Josy Creazioni, Texas Bar, Le Gemelle, Trattoria degli Amici, Le Delizie, Musso Motorsport, Osteria della Purtascia, Pizzeria Dance 888, Studio Avvocato Maraviglia, Chandra Tattoo) e da contattare (Blue Bar tel 0332 624727, Gym Area 77 tel 3402898262, Netti x Giardini, B&B Casale del Cantico tel 3496222502, Cristallo tel 0332 601336, La Bussola tel 0332 602291, Le Follie di Laura tel 0332 603141, Simona Marinoni tel 0332 601786, Urban Fighting Boxe Gym, Carmen Ramona Matei Psicologa, L'Estetica di Michela Fogli, Estetica DESY, Fiorista Peri tel 0332 973317, CGCars Cuveglio, Autosalone Internazionale, Le Officine Tattoo Laveno, Mianiink Tattoo Rancio, SHM Tattoo Gavirate tel 3452383043, COR MEUM Tattoo tel 351 612 8002, Giro Pizza Revolution tel 393 546 4398, Latin Fit Dancing Caravate, L'Albero della Vita Brenta, Candela Meccanico Besozzo).

7. FINANZE: card totali (Incassato, Da incassare, Costi). Registro entrate con stato incassato/da incassare e pulsante per aggiungere. Registro costi strumenti.

8. RISPARMI: obiettivo "Road to 10.000€" entro 31 dicembre 2026. Barra di progresso, countdown giorni/settimane rimanenti, quanto risparmiare a settimana. Divisione con cursore regolabile tra quota moto e quota investimento. Form per aggiungere versamenti (importo, nota, data). Storico versamenti con totale.

9. TODO: attività divise per priorità (alta/media/bassa), spuntabili, eliminabili, con pulsante aggiungi.

10. KPI: griglia di tutti gli indicatori chiave calcolati dai dati.

11. IMPOSTAZIONI: personalizzazione nome dashboard, colore principale (8 colori tra cui scegliere), obiettivo risparmi, scadenza, cursore divisione moto/investimento.

Usa Supabase per salvare tutto in modo permanente. L'analisi AI del diario deve usare una Edge Function sicura (non esporre chiavi API nel frontend).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://peak-studio-flow.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9d83bc04-5cac-4982-9170-f83112369968).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
