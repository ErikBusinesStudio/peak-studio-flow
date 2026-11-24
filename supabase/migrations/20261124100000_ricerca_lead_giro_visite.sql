-- Peak Studio OS — ricerca lead e giro visite (24/11/2026)
-- 1) nuove colonne su clienti per sede, distanza, priorità e modalità di contatto
alter table public.clienti
  add column if not exists zona text,
  add column if not exists latitudine numeric(9,6),
  add column if not exists longitudine numeric(9,6),
  add column if not exists distanza_km numeric(5,1),
  add column if not exists minuti_da_casa int,
  add column if not exists priorita int,
  add column if not exists modalita_contatto text,
  add column if not exists motivo_modalita text,
  add column if not exists da_confermare text,
  add column if not exists ricerca_il date;
alter table public.clienti drop constraint if exists clienti_modalita_contatto_check;
alter table public.clienti add constraint clienti_modalita_contatto_check
  check (modalita_contatto is null or modalita_contatto in ('di_persona','telefono','da_definire'));
create index if not exists clienti_priorita_idx on public.clienti (priorita);

-- 2) i già contattati senza esito tornano "da contattare" (il registro contatti resta intatto)
update public.clienti
   set stato = 'da_contattare',
       note = trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Tornato in "da contattare" il 24/11/2026: già contattato, nessun esito (storico in registro contatti).')
 where stato = 'contattato';

-- 3) giro proposte: priorità, modalità, distanza stimata da Casalzuigno e dati trovati online

update public.clienti set
  priorita=1,
  modalita_contatto='di_persona',
  motivo_modalita='Già contattato e a 200 m da casa: passaggio senza costi. Aperto mar–sab 10:30–18:30 (chiuso lunedì).',
  zona='Casalzuigno',
  latitudine=45.904,
  longitudine=8.7111,
  distanza_km=0.2,
  minuti_da_casa=2,
  orari=coalesce(orari,'{"Lun": "Chiuso", "Mar": "10:30–18:30", "Mer": "10:30–18:30", "Gio": "10:30–18:30", "Ven": "10:30–18:30", "Sab": "10:30–18:30", "Dom": "Chiuso"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: studio in Via Valcuvia 20, Casalzuigno, tel. 352 026 0135; recensioni parlano di un ''nuovo studio''.'),
  da_confermare='Sede e telefono: Google dà Via Valcuvia 20, Casalzuigno e 352 026 0135; in archivio erano Cuveglio e 379 106 7891. Quale è giusto?',
  ricerca_il='2026-11-24'
 where nome='Kodawari Ink';

update public.clienti set
  priorita=2,
  modalita_contatto='di_persona',
  motivo_modalita='Già visto dal vivo: si richiama dal vivo appena è nota la sede. Il figlio fa il sito come progetto scolastico: meglio ripassare dopo la consegna del progetto.',
  zona='Da definire',
  da_confermare='Comune/indirizzo e telefono mancanti: non trovata online con questo nome. Dove si trova?',
  ricerca_il='2026-11-24'
 where nome='Carrozzeria Massimo';

update public.clienti set
  priorita=3,
  modalita_contatto='telefono',
  motivo_modalita='WhatsApp senza risposta: secondo contatto per telefono, poi visita se la sede è vicina.',
  zona='Da definire',
  da_confermare='Sede e telefono mancanti: non trovata online come ''Lloà Flower Bar''. Confermi nome e comune?',
  ricerca_il='2026-11-24'
 where nome='Lloà Flower Bar';

update public.clienti set
  priorita=4,
  modalita_contatto='telefono',
  motivo_modalita='WhatsApp senza risposta: secondo contatto per telefono.',
  zona='Da definire',
  da_confermare='Telefono e comune mancanti (persona fisica: nessuna ricerca online fatta). Cognome da confermare.',
  ricerca_il='2026-11-24'
 where nome='Luca Belinghieri';

update public.clienti set
  priorita=5,
  modalita_contatto='telefono',
  motivo_modalita='WhatsApp senza risposta: secondo contatto per telefono / messaggio su Instagram.',
  zona='Da definire',
  da_confermare='Telefono e comune mancanti (persona fisica: nessuna ricerca online fatta).',
  ricerca_il='2026-11-24'
 where nome='Nicholas Ceri';

update public.clienti set
  priorita=6,
  modalita_contatto='telefono',
  motivo_modalita='WhatsApp senza risposta: secondo contatto per telefono.',
  zona='Da definire',
  da_confermare='Comune mancante: su Google ci sono pizzerie ''Vesuvio'' a Laveno (Via XXV Aprile 43, 331 371 3913), Arconate, Somma Lombardo e altre. Quale è?',
  ricerca_il='2026-11-24'
 where nome='Pizzeria Il Vesuvio';

update public.clienti set
  priorita=7,
  modalita_contatto='telefono',
  motivo_modalita='WhatsApp senza risposta: secondo contatto per telefono.',
  zona='Da definire',
  da_confermare='Cognome, telefono e comune mancanti (persona fisica: nessuna ricerca online fatta).',
  ricerca_il='2026-11-24'
 where nome='Roberto (tuttofare)';

update public.clienti set
  priorita=8,
  modalita_contatto='telefono',
  motivo_modalita='WhatsApp senza risposta: secondo contatto per telefono.',
  zona='Da definire',
  da_confermare='Non trovata online: sede e telefono mancanti. Nome esatto e comune?',
  ricerca_il='2026-11-24'
 where nome='Performing English Labs';

update public.clienti set
  priorita=9,
  modalita_contatto='di_persona',
  motivo_modalita='A 200 m da casa, aperto tutto il giorno: passare nelle ore calme (metà mattina o primo pomeriggio) e parlare con il titolare.',
  zona='Casalzuigno',
  latitudine=45.90565,
  longitudine=8.71372,
  distanza_km=0.2,
  minuti_da_casa=2,
  indirizzo=coalesce(indirizzo,'Via Valcuvia 28'),
  telefono=coalesce(telefono,'0332 624727'),
  orari=coalesce(orari,'{"Lun": "4–22", "Mar": "4–22", "Mer": "4–22", "Gio": "4–22", "Ven": "4–22", "Sab": "4–22", "Dom": "5–14"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: ''Blu Bar di Maran Vanni e C. sas'', Via Valcuvia 28, tel. 0332 624727; orari da Google (apertura molto presto).'),
  da_confermare='Nome: in archivio ''Blue Bar'', su Google ''Blu Bar''. Quale grafia usare?',
  ricerca_il='2026-11-24'
 where nome='Blue Bar';

update public.clienti set
  priorita=10,
  modalita_contatto='di_persona',
  motivo_modalita='A 500 m da casa. B&B di 2 camere con titolare presente: passare tra le 10 e le 14 (colazione 8–9, check-in 15–17:30).',
  zona='Casalzuigno',
  latitudine=45.90697,
  longitudine=8.70707,
  distanza_km=0.5,
  minuti_da_casa=2,
  indirizzo=coalesce(indirizzo,'Via Sanda 16'),
  comune=coalesce(comune,'Casalzuigno'),
  telefono=coalesce(telefono,'0332 651992'),
  categoria='ospitalita',
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google/Booking: B&B boutique, 2 camere, solo adulti, host Andrea (con il padre Costantino). Compare su Booking, Expedia e Hotels.com; sito proprio non trovato.'),
  ricerca_il='2026-11-24'
 where nome='Antico Borgo Sanda';

update public.clienti set
  priorita=11,
  modalita_contatto='di_persona',
  motivo_modalita='Carrozzeria (target che hai scelto) a 1,5 km: visita in orario d''ufficio.',
  zona='Cuveglio',
  latitudine=45.90483,
  longitudine=8.72765,
  distanza_km=1.5,
  minuti_da_casa=2,
  indirizzo=coalesce(indirizzo,'Via Provinciale 2'),
  comune=coalesce(comune,'Cuveglio'),
  telefono=coalesce(telefono,'0332 650565'),
  categoria='auto_officine',
  orari=coalesce(orari,'{"Lun": "8–12 · 13:30–19", "Mar": "8–12 · 13:30–19", "Mer": "8–12 · 13:30–19", "Gio": "8–12 · 13:30–19", "Ven": "8–12 · 13:30–19", "Sab": "8–12:30", "Dom": "Chiuso"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: carrozzeria e verniciatura auto. Ha partecipato al restauro del tram storico di Cuveglio (VareseNews, 2025).'),
  ricerca_il='2026-11-24'
 where nome='Curcio & Coclite';

update public.clienti set
  priorita=12,
  modalita_contatto='di_persona',
  motivo_modalita='A 1,6 km, in centro Cuveglio, vicina a Curcio & Coclite: stesso giro. Chiusa lunedì.',
  zona='Cuveglio',
  latitudine=45.90466,
  longitudine=8.72834,
  distanza_km=1.6,
  minuti_da_casa=2,
  indirizzo=coalesce(indirizzo,'Via Coloder 2'),
  telefono=coalesce(telefono,'320 763 2017'),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: centro estetico, Via Coloder 2, Cuveglio.'),
  ricerca_il='2026-11-24'
 where nome='L''Estetica di Michela Fogli';

update public.clienti set
  priorita=13,
  modalita_contatto='di_persona',
  motivo_modalita='A 2 km, a pochi passi da Matei e Maraviglia: stesso giro. Chiusa sabato e domenica.',
  zona='Cuveglio',
  latitudine=45.90442,
  longitudine=8.73254,
  distanza_km=2.0,
  minuti_da_casa=3,
  indirizzo=coalesce(indirizzo,'Via Battaglia S. Martino 37'),
  telefono=coalesce(telefono,'349 410 5272'),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Estetica DESY di Donadio Desiree, Via Battaglia S. Martino 37, Cuveglio.'),
  ricerca_il='2026-11-24'
 where nome='Estetica DESY';

update public.clienti set
  priorita=14,
  modalita_contatto='di_persona',
  motivo_modalita='A 2,3 km. Chiuso lunedì; mercoledì apre solo dalle 13 alle 21 (giorno migliore per il pomeriggio). Accanto a Lu in Wonderland (già cliente).',
  zona='Cuvio',
  latitudine=45.89965,
  longitudine=8.73411,
  distanza_km=2.3,
  minuti_da_casa=3,
  indirizzo=coalesce(indirizzo,'Via Commune Giuseppe Maggi 18'),
  comune=coalesce(comune,'Cuvio'),
  telefono=coalesce(telefono,'0332 624601'),
  referente=coalesce(referente,'Simona Pulcinelli'),
  orari=coalesce(orari,'{"Lun": "Chiuso", "Mar": "9–18", "Mer": "13–21", "Gio": "9–18", "Ven": "9–18", "Sab": "9–18", "Dom": "Chiuso"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: ''Hair Love S.N.C. di Pulcinelli Simona'', Via Commune Giuseppe Maggi 18, Cuvio; team giovane.'),
  ricerca_il='2026-11-24'
 where nome='Hair Love';

update public.clienti set
  priorita=15,
  modalita_contatto='di_persona',
  motivo_modalita='A 4 km, studio professionale (target scelto): visita lun–ven in orario d''ufficio, vicina a Torcaso.',
  zona='Cuveglio est',
  latitudine=45.90512,
  longitudine=8.75579,
  distanza_km=4.2,
  minuti_da_casa=6,
  indirizzo=coalesce(indirizzo,'Via San Michele 12'),
  comune=coalesce(comune,'Cuveglio'),
  telefono=coalesce(telefono,'347 863 1747'),
  referente=coalesce(referente,'Michele Bolognesi'),
  orari=coalesce(orari,'{"Lun": "8:30–18", "Mar": "8:30–18", "Mer": "8:30–18", "Gio": "8:30–18", "Ven": "8:30–18", "Sab": "Chiuso", "Dom": "Chiuso"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Studio Tecnico Geom. Michele Bolognesi, Via San Michele 12, Cuveglio.'),
  ricerca_il='2026-11-24'
 where nome='Studio Tecnico Geom. Bolognesi';

update public.clienti set
  priorita=16,
  modalita_contatto='di_persona',
  motivo_modalita='A 4,3 km, carrozzeria (target scelto), stesso giro del geometra e di Mianiink.',
  zona='Cuveglio est',
  latitudine=45.91154,
  longitudine=8.75503,
  distanza_km=4.3,
  minuti_da_casa=6,
  indirizzo=coalesce(indirizzo,'Via Molino Galli 1'),
  comune=coalesce(comune,'Cuveglio'),
  telefono=coalesce(telefono,'0332 650346'),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Carrozzeria Torcaso dei Fratelli Torcaso S.N.C., Via Molino Galli 1; a Cuveglio dagli anni ''70, soccorso stradale h24, convenzioni assicurative. Orari lun–ven 8–12 e 13:30–18 da un annuncio del 2020: da verificare.'),
  ricerca_il='2026-11-24'
 where nome='Carrozzeria Torcaso';

update public.clienti set
  priorita=17,
  modalita_contatto='di_persona',
  motivo_modalita='A 4,6 km, in fondo al giro di Cuveglio est. Aperto lun–sab fino alle 18–19.',
  zona='Cuveglio est',
  latitudine=45.91467,
  longitudine=8.75786,
  distanza_km=4.6,
  minuti_da_casa=7,
  indirizzo=coalesce(indirizzo,'Via Provinciale'),
  telefono=coalesce(telefono,'339 428 7377'),
  orari=coalesce(orari,'{"Lun": "9:30–19", "Mar": "9:30–18", "Mer": "9:30–19", "Gio": "9:30–18", "Ven": "9:30–19", "Sab": "9:30–19", "Dom": "Chiuso"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Via Provinciale, Cuveglio.'),
  da_confermare='Comune: Google dà Cuveglio (Via Provinciale), in archivio è Rancio. Quale?',
  ricerca_il='2026-11-24'
 where nome='Mianiink Tattoo Studio';

update public.clienti set
  priorita=18,
  modalita_contatto='telefono',
  motivo_modalita='Studio sanitario che riceve su appuntamento: non si entra senza preavviso. Chiamare/WhatsApp e fissare un passaggio.',
  zona='Cuveglio',
  latitudine=45.90409,
  longitudine=8.73212,
  distanza_km=2.0,
  minuti_da_casa=3,
  indirizzo=coalesce(indirizzo,'Via Battaglia S. Martino 18'),
  telefono=coalesce(telefono,'371 379 5798'),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: psicologa-psicoterapeuta, Via Battaglia S. Martino 18, Cuveglio. Orari non pubblicati.'),
  ricerca_il='2026-11-24'
 where nome='Carmen Ramona Matei Psicologa';

update public.clienti set
  priorita=19,
  modalita_contatto='telefono',
  motivo_modalita='Casa privata con B&B, senza orari: dall''archivio ''basta chiamare''. Chiamare per fissare, poi passare.',
  zona='Brenta',
  latitudine=45.89347,
  longitudine=8.68114,
  distanza_km=3.4,
  minuti_da_casa=5,
  indirizzo=coalesce(indirizzo,'Via Valcuvia 2'),
  telefono=coalesce(telefono,'349 622 2502'),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google/Booking: B&B con host Roberto e Lucia, camere familiari, colazione fatta in casa; compare su Booking e simili, sito proprio non trovato.'),
  da_confermare='Indirizzo: Google dà Via Valcuvia 2, Brenta; Booking dà Via Domenico Cerini 32. Quale è giusto?',
  ricerca_il='2026-11-24'
 where nome='B&B Casale del Cantico';

update public.clienti set
  priorita=20,
  modalita_contatto='di_persona',
  motivo_modalita='A 2,3 km. Palestra aperta di sera: passare verso le 17:30–19 durante gli allenamenti.',
  zona='Brenta',
  latitudine=45.89357,
  longitudine=8.69473,
  distanza_km=2.3,
  minuti_da_casa=3,
  indirizzo=coalesce(indirizzo,'Via G. Verdi 34'),
  telefono=coalesce(telefono,'320 764 9759'),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: ''Urbanfighting'', Via G. Verdi 34, Brenta. Orari Google poco chiari (pomeriggio/sera): da verificare sul posto.'),
  ricerca_il='2026-11-24'
 where nome='Urban Fighting (Boxe Gym)';

update public.clienti set
  priorita=21,
  modalita_contatto='di_persona',
  motivo_modalita='A 4,2 km. Chiusa sabato e domenica; lunedì e mercoledì aperta fino alle 22.',
  zona='Cittiglio',
  latitudine=45.89466,
  longitudine=8.67113,
  distanza_km=4.2,
  minuti_da_casa=6,
  telefono=coalesce(telefono,'0332 603141'),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Via del Sasso 8, Cittiglio; centro estetico con massaggi e nail.'),
  ricerca_il='2026-11-24'
 where nome='Le Follie di Laura';

update public.clienti set
  priorita=22,
  modalita_contatto='di_persona',
  motivo_modalita='A 5,2 km, vicina a Cristallo: giovedì–sabato aperta tutto il giorno (mar e mer solo mattina).',
  zona='Cittiglio',
  latitudine=45.89651,
  longitudine=8.65991,
  distanza_km=5.2,
  minuti_da_casa=8,
  telefono=coalesce(telefono,'0332 601786'),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Via Roma 38, Cittiglio.'),
  ricerca_il='2026-11-24'
 where nome='Simona Marinoni Parrucchiera';

update public.clienti set
  priorita=23,
  modalita_contatto='di_persona',
  motivo_modalita='Ha già un sito: proporre il menu con QR. Hotel-ristorante aperto 24 ore, passare nel primo pomeriggio.',
  zona='Cittiglio',
  latitudine=45.89287,
  longitudine=8.66729,
  distanza_km=4.6,
  minuti_da_casa=7,
  indirizzo=coalesce(indirizzo,'Via Marconi 26/28'),
  telefono=coalesce(telefono,'0332 602291'),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google/Booking: hotel 3 stelle, 27 camere, ristorante, sala ricevimenti (matrimoni ''Villa Rosa'').'),
  ricerca_il='2026-11-24'
 where nome='La Bussola';

update public.clienti set
  priorita=24,
  modalita_contatto='di_persona',
  motivo_modalita='Ha già un sito: proporre il restyling. Hotel-ristorante sempre aperto: passare nel primo pomeriggio.',
  zona='Cittiglio',
  latitudine=45.89455,
  longitudine=8.65937,
  distanza_km=5.3,
  minuti_da_casa=8,
  indirizzo=coalesce(indirizzo,'Via Provinciale 75'),
  telefono=coalesce(telefono,'0332 601336'),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google/Booking: Albergo Cristallo 2 stelle, ristorante-pizzeria, giardino con barbecue. Un portale lo indica con sito ufficiale (non aperto).'),
  ricerca_il='2026-11-24'
 where nome='Cristallo';

update public.clienti set
  priorita=25,
  modalita_contatto='telefono',
  motivo_modalita='Studio di psicologia su appuntamento: chiamare per fissare, non presentarsi senza preavviso.',
  zona='Brenta',
  latitudine=45.89356,
  longitudine=8.69118,
  distanza_km=2.6,
  minuti_da_casa=4,
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Via Campo dei Fiori 18, Brenta; compare su MioDottore.'),
  ricerca_il='2026-11-24'
 where nome='L''Albero della Vita';

update public.clienti set
  priorita=26,
  modalita_contatto='telefono',
  motivo_modalita='Scuola di ballo senza orari pubblicati e con lezioni serali: chiamare per capire quando c''è il titolare.',
  zona='Caravate',
  latitudine=45.87952,
  longitudine=8.66454,
  distanza_km=7.5,
  minuti_da_casa=11,
  indirizzo=coalesce(indirizzo,'Via XX Settembre 80'),
  telefono=coalesce(telefono,'347 467 9036'),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Via XX Settembre 80, Caravate.'),
  ricerca_il='2026-11-24'
 where nome='Latin Fit Dancing';

update public.clienti set
  priorita=27,
  modalita_contatto='di_persona',
  motivo_modalita='~14 km: un solo viaggio per tre attività a Gavirate. Aperto lun–sab, anche di sabato.',
  zona='Gavirate',
  latitudine=45.84276,
  longitudine=8.71521,
  distanza_km=14.6,
  minuti_da_casa=22,
  telefono=coalesce(telefono,'351 612 8002'),
  orari=coalesce(orari,'{"Lun": "10:30–18:30", "Mar": "10:30–18:30", "Mer": "10:30–18:30", "Gio": "10:30–18:30", "Ven": "10:30–18:30", "Sab": "10:30–18:30", "Dom": "Chiuso"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Viale Ticino 2, Gavirate.'),
  ricerca_il='2026-11-24'
 where nome='COR MEUM Tattoo';

update public.clienti set
  priorita=28,
  modalita_contatto='di_persona',
  motivo_modalita='Stesso viaggio di COR MEUM (circa 300 m). Aperto solo lun–ven.',
  zona='Gavirate',
  latitudine=45.84561,
  longitudine=8.71383,
  distanza_km=14.2,
  minuti_da_casa=21,
  telefono=coalesce(telefono,'345 238 3043'),
  orari=coalesce(orari,'{"Lun": "10–12 · 14–19", "Mar": "10–12 · 14–19", "Mer": "10–12 · 14–19", "Gio": "10–12 · 14–19", "Ven": "10–12 · 14–19", "Sab": "Chiuso", "Dom": "Chiuso"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Corso XXV Aprile 40, Gavirate.'),
  ricerca_il='2026-11-24'
 where nome='SHM Tattoo - Piercing';

update public.clienti set
  priorita=29,
  modalita_contatto='di_persona',
  motivo_modalita='Officina (target scelto): lun–ven 8:30–19 senza pausa; è sulla strada verso Gavirate.',
  zona='Besozzo',
  latitudine=45.84021,
  longitudine=8.66899,
  distanza_km=13.2,
  minuti_da_casa=20,
  indirizzo=coalesce(indirizzo,'Via Leonardo da Vinci 9'),
  telefono=coalesce(telefono,'0332 771896'),
  orari=coalesce(orari,'{"Lun": "8:30–19", "Mar": "8:30–19", "Mer": "8:30–19", "Gio": "8:30–19", "Ven": "8:30–19", "Sab": "Chiuso", "Dom": "Chiuso"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: ''Auto Officina Candela di Candela Mario (Candelasport)'', Besozzo; preparazione elettronica/centraline e banco prova.'),
  ricerca_il='2026-11-24'
 where nome='Candela Meccanico';

update public.clienti set
  priorita=30,
  modalita_contatto='telefono',
  motivo_modalita='Apre solo alle 19: di sera non si può parlare con il titolare. Chiamare nel pomeriggio e fissare un passaggio durante il giro di Gavirate.',
  zona='Gavirate',
  latitudine=45.85181,
  longitudine=8.70504,
  distanza_km=13.0,
  minuti_da_casa=19,
  telefono=coalesce(telefono,'393 546 4398'),
  orari=coalesce(orari,'{"Lun": "Chiuso", "Mar": "19–24", "Mer": "19–24", "Gio": "19–24", "Ven": "19–24", "Sab": "19–24", "Dom": "12–14:30 · 19–24"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: ''Pizza Revolution'', Viale Verbano 62, Gavirate.'),
  da_confermare='Nome: in archivio ''Giro Pizza Revolution'', su Google ''Pizza Revolution''. Quale è giusto?',
  ricerca_il='2026-11-24'
 where nome='Giro Pizza Revolution';

update public.clienti set
  priorita=31,
  modalita_contatto='da_definire',
  motivo_modalita='Sede non verificata: prima va confermato di quale attività si tratta.',
  zona='Da definire',
  da_confermare='Non trovato a Cuveglio. Su Google c''è ''Autosalone Internazionale Srl'' a Varese (Land Rover, Jaguar, Geely; 0332 227310). È la stessa attività o un''altra?',
  ricerca_il='2026-11-24'
 where nome='Autosalone Internazionale';

-- 4) altri clienti: solo dati mancanti (nessun valore esistente viene sovrascritto)

update public.clienti set
  indirizzo=coalesce(indirizzo,'Via Valcuvia 2 (vendite) · Via Valcuvia 11 (officina)'),
  orari=coalesce(orari,'{"Lun": "9–12 · 14–18", "Mar": "9–12 · 14–18", "Mer": "9–12 · 14–18", "Gio": "9–12 · 14–18", "Ven": "9–12 · 14–18", "Sab": "9–12 · 14–17", "Dom": "Chiuso"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Autosalone Fratelli Longhi (Hyundai, Via Valcuvia 2, 0332 624302) e Hyundai Service (Via Valcuvia 11, 0332 650256).'),
  ricerca_il='2026-11-24'
 where nome='Fratelli Longhi';

update public.clienti set
  telefono=coalesce(telefono,'0332 770351'),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Fuego Latino Style A.S.D., Via Armando Diaz 8, Besozzo.'),
  ricerca_il='2026-11-24'
 where nome='Gianni · Fuego Latino Style';

update public.clienti set
  orari=coalesce(orari,'{"Lun": "8:30–21", "Mar": "8:30–21", "Mer": "8:30–21", "Gio": "8:30–21", "Ven": "8:30–21", "Sab": "9–17", "Dom": "9:30–12:30"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Area 77, Via Sciareda 15, Casalzuigno.'),
  ricerca_il='2026-11-24'
 where nome='Gym Area 77';

update public.clienti set
  indirizzo=coalesce(indirizzo,'Via S. Fermo 10'),
  telefono=coalesce(telefono,'389 455 0399'),
  orari=coalesce(orari,'{"Lun": "Chiuso", "Mar": "Chiuso", "Mer": "Chiuso", "Gio": "10:30–12:30 · 14:30–18", "Ven": "10:30–12:30 · 14:30–18", "Sab": "10:30–12:30 · 14:30–18", "Dom": "Chiuso"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Via S. Fermo 10, Laveno-Mombello.'),
  ricerca_il='2026-11-24'
 where nome='Le Officine Tattoo Studio';

update public.clienti set
  indirizzo=coalesce(indirizzo,'Via Valcuvia 90'),
  telefono=coalesce(telefono,'342 957 7638'),
  orari=coalesce(orari,'{"Lun": "Chiuso", "Mar": "11–24", "Mer": "11–24", "Gio": "11–24", "Ven": "11–24", "Sab": "11–24", "Dom": "11–24"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Texas Bar & C. sas, Via Valcuvia 90, Brenta; bar e pizzeria.'),
  ricerca_il='2026-11-24'
 where nome='Texas Bar';

update public.clienti set
  indirizzo=coalesce(indirizzo,'Via Alpi 23'),
  telefono=coalesce(telefono,'0332 154 0300'),
  orari=coalesce(orari,'{"Lun": "Chiuso", "Mar": "18–22", "Mer": "18–22", "Gio": "18–22", "Ven": "18–22", "Sab": "18–22", "Dom": "18–22"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Via Alpi 23, Cittiglio; pizzeria con area giochi.'),
  ricerca_il='2026-11-24'
 where nome='Trattoria degli Amici';

update public.clienti set
  indirizzo=coalesce(indirizzo,'Via Coloder 2/b'),
  telefono=coalesce(telefono,'333 839 8441'),
  orari=coalesce(orari,'{"Lun": "7:30–14", "Mar": "7:30–18:30", "Mer": "7:30–18:30", "Gio": "7:30–18:30", "Ven": "7:30–18:30", "Sab": "7:30–18:30", "Dom": "Chiuso"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: bar-bistrot con alimentari, Via Coloder 2/b, Cuveglio.'),
  ricerca_il='2026-11-24'
 where nome='Le Delizie';

update public.clienti set
  indirizzo=coalesce(indirizzo,'Via Provinciale 20'),
  telefono=coalesce(telefono,'351 929 3861'),
  orari=coalesce(orari,'{"Lun": "8:30–12:30 · 14–18", "Mar": "8:30–12:30 · 14–18", "Mer": "8:30–12:30 · 14–18", "Gio": "8:30–12:30 · 14–18", "Ven": "8:30–12:30 · 14–18", "Sab": "Chiuso", "Dom": "Chiuso"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Musso Motorsport di Francesco Musso, Rancio Valcuvia; officina moto.'),
  ricerca_il='2026-11-24'
 where nome='Musso Motorsport';

update public.clienti set
  indirizzo=coalesce(indirizzo,'Strada Stazione 4'),
  telefono=coalesce(telefono,'392 517 6596'),
  orari=coalesce(orari,'{"Lun": "Chiuso", "Mar": "Chiuso", "Mer": "Chiuso", "Gio": "19:30–22", "Ven": "19:30–22", "Sab": "12:30–14:30 · 19:30–22:30", "Dom": "12:30–14:30"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Cocquio-Trevisago, davanti alla stazione.'),
  ricerca_il='2026-11-24'
 where nome='Osteria della Purtascia';

update public.clienti set
  indirizzo=coalesce(indirizzo,'Via dei Martiri Cristiani 16'),
  telefono=coalesce(telefono,'327 490 9785'),
  orari=coalesce(orari,'{"Lun": "12–22", "Mar": "12–22", "Mer": "12–22", "Gio": "12–22", "Ven": "12–22", "Sab": "12–22", "Dom": "12–22"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: ristorante-pizzeria con sala da ballo, Cocquio.'),
  ricerca_il='2026-11-24'
 where nome='Pizzeria Dance 888';

update public.clienti set
  indirizzo=coalesce(indirizzo,'Via Battaglia S. Martino 50/B'),
  telefono=coalesce(telefono,'333 601 3789'),
  referente=coalesce(referente,'Federico Maraviglia'),
  orari=coalesce(orari,'{"Lun": "9:30–18", "Mar": "9:30–18", "Mer": "9:30–18", "Gio": "9:30–18", "Ven": "9:30–13", "Sab": "Chiuso", "Dom": "Chiuso"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Avvocato Federico Maraviglia, Cuveglio.'),
  ricerca_il='2026-11-24'
 where nome='Studio Avvocato Maraviglia';

update public.clienti set
  indirizzo=coalesce(indirizzo,'Via Luigi Roncari 11'),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Via Luigi Roncari 11, Besozzo.'),
  ricerca_il='2026-11-24'
 where nome='Chandra Tattoo';

update public.clienti set
  da_confermare='Non identificato: su Google ci sono più saloni ''Pretty Woman'' (es. Gorla Minore, VA). Quale è il tuo e dove si trova?',
  ricerca_il='2026-11-24'
 where nome='Pretty Woman';

update public.clienti set
  da_confermare='Non trovato online con questo nome. Comune/sede e categoria?',
  ricerca_il='2026-11-24'
 where nome='Halibu Adventure Kenya';

update public.clienti set
  da_confermare='Non trovato online con questo nome. Nome esatto dell''attività?',
  ricerca_il='2026-11-24'
 where nome='Netti x Giardini';

update public.clienti set
  da_confermare='Non trovato online con questo nome (comune già Cittiglio in archivio).',
  ricerca_il='2026-11-24'
 where nome='Josy Creazioni';

update public.clienti set
  da_confermare='Non trovato online con questo nome (comune già Brenta in archivio).',
  ricerca_il='2026-11-24'
 where nome='Le Gemelle Parrucchiere';

update public.clienti set
  da_confermare='Su Google risultano due schede: ''Safety Group srl'' a Gavirate, Via Milano 5 (0332 743388, il numero in archivio) e ''Safety Solutions srl'' a Laveno-Mombello, Via Rebolgiane 48 (393 582 9193). Quale è la sede/il numero giusti?',
  ricerca_il='2026-11-24'
 where nome='Safety Solutions';

update public.clienti set
  indirizzo=coalesce(indirizzo,'Via Provinciale 11'),
  telefono=coalesce(telefono,'0332 161 0528'),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: C.G. Cars srl, Via Provinciale 11, Cuveglio.'),
  ricerca_il='2026-11-24'
 where nome='C.G. Cars';

update public.clienti set
  indirizzo=coalesce(indirizzo,'Via Commune Giuseppe Maggi 9'),
  telefono=coalesce(telefono,'0332 624561'),
  orari=coalesce(orari,'{"Lun": "17–24", "Mar": "12–14 · 17–24", "Mer": "12–14 · 17–24", "Gio": "12–14 · 17–24", "Ven": "12–14 · 17–24", "Sab": "12–24", "Dom": "12–24"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: ''Tourist Center & Beghetto Sports'', Via Commune Giuseppe Maggi 9, Cuvio; centro sportivo con pizzeria.'),
  da_confermare='Comune: in archivio Cuveglio, ma l''indirizzo Google è a Cuvio. Correggo in Cuvio?',
  ricerca_il='2026-11-24'
 where nome='CTS Cuvio';

update public.clienti set
  indirizzo=coalesce(indirizzo,'Via Valcuvia 60'),
  telefono=coalesce(telefono,'346 405 7561'),
  orari=coalesce(orari,'{"Lun": "9:30–19:30", "Mar": "9:30–19:30", "Mer": "9:30–19:30", "Gio": "9:30–19:30", "Ven": "9:30–19:30", "Sab": "9:30–19:30", "Dom": "10–19:30"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Via Valcuvia 60, Cittiglio.'),
  ricerca_il='2026-11-24'
 where nome='E-Riutility';

update public.clienti set
  indirizzo=coalesce(indirizzo,'Via Coloder 4'),
  telefono=coalesce(telefono,'392 962 1590'),
  orari=coalesce(orari,'{"Lun": "8:30–12:30 · 14–18", "Mar": "8:30–12:30 · 14–18", "Mer": "8:30–12:30 · 14–18", "Gio": "8:30–12:30 · 14–18", "Ven": "8:30–12:30 · 14–18", "Sab": "9–13", "Dom": "Chiuso"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: Centro Revisioni Valcuvia, Via Coloder 4, Cuveglio.'),
  ricerca_il='2026-11-24'
 where nome='CRV · Centro Revisioni Valcuvia';

update public.clienti set
  telefono=coalesce(telefono,'380 365 3426'),
  orari=coalesce(orari,'{"Lun": "5–20", "Mar": "5–20", "Mer": "5–20", "Gio": "5–20", "Ven": "5–20", "Sab": "5–20", "Dom": "6–19"}'::jsonb),
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Ricerca 24/11/2026: Google: bar con tabaccheria, edicola e gelateria artigianale, Via Commune Giuseppe Maggi 20, Cuvio.'),
  da_confermare='Comune: in archivio Cuveglio, ma l''indirizzo Google è a Cuvio (Via Commune Giuseppe Maggi 20). Correggo in Cuvio?',
  ricerca_il='2026-11-24'
 where nome='Lu in Wonderland';
