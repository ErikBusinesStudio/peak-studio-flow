-- Dati presi dai biglietti da visita (24/11/2026).
-- Solo UPDATE: nessuna riga eliminata, lo storico contatti_log resta collegato per id.

-- Correzione nome: il biglietto riporta "Carrozzeria Massaro di Massaro Maurizio" (non "Massimo")
update public.clienti set
  nome='Carrozzeria Massaro',
  referente='Maurizio Massaro',
  telefono='338 2258182',
  email='info@carrozzeriamassaro.it',
  sito_web='https://www.carrozzeriamassaro.it',
  indirizzo='Via Appennini 36',
  comune='Cocquio-Trevisago',
  zona='Cocquio-Trevisago',
  latitudine=45.868496, longitudine=8.671102,
  distanza_km=6.5, minuti_da_casa=10,
  orari=coalesce(orari,'{"Lun": "8–12 · 14–18", "Mar": "8–12 · 14–18", "Mer": "8–12 · 14–18", "Gio": "8–12 · 14–18", "Ven": "8–12 · 14–18", "Sab": "8–12:30", "Dom": "Chiuso"}'::jsonb),
  motivo_modalita='Già visto dal vivo: si richiama dal vivo. Sede ora nota (Cocquio-Trevisago, ~10 min). Il figlio fa il sito come progetto scolastico: meglio ripassare dopo la consegna del progetto. Orari: lun–ven 8–12 e 14–18, sab 8–12:30.',
  da_confermare='Il biglietto riporta www.carrozzeriamassaro.it: verificare se il sito esiste già (ha_sito non verificato) e come si collega al progetto del figlio.',
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Biglietto 24/11/2026: nome corretto in "Carrozzeria Massaro di Massaro Maurizio" (prima "Massimo"). Fisso 0332 970888, cell. 338 2258182. P.IVA 02910960125. PEC maurizio.massaro@arubapec.it. Google: 4,7 su 36 recensioni, anche revisioni, gomme, noleggio.'),
  ricerca_il='2026-11-24'
 where nome='Carrozzeria Massimo';

update public.clienti set
  telefono=coalesce(telefono,'331 4742083'),
  email=coalesce(email,'lloa.flowerbar@protonmail.com'),
  sito_web=coalesce(sito_web,'https://www.lloa.it'),
  social=coalesce(social,'Instagram: lloa.flowerbar · Facebook: Lloà Flower Bar'),
  ha_sito=coalesce(ha_sito,true),
  motivo_modalita='WhatsApp senza risposta: secondo contatto per telefono (331 4742083). Il biglietto non riporta un indirizzo: se è solo e-commerce, resta telefono.',
  da_confermare='Comune/indirizzo non presenti sul biglietto: ha un negozio fisico o è solo online?',
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Biglietto 24/11/2026: "Fiori freschi | Bouquet artigianali". Nome confermato: Lloà Flower Bar. Sito www.lloa.it, Instagram lloa.flowerbar, Facebook Lloà Flower Bar, tel. +39 331 474 2083, email lloa.flowerbar@protonmail.com.'),
  ricerca_il='2026-11-24'
 where nome='Lloà Flower Bar';

update public.clienti set
  telefono=coalesce(telefono,'347 2491884'),
  email=coalesce(email,'blupulizieok@gmail.com'),
  motivo_modalita='WhatsApp senza risposta: secondo contatto per telefono (347 2491884).',
  da_confermare='Comune mancante: non è indicato sul biglietto.',
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Biglietto 24/11/2026: cognome confermato "Belinghieri". Lavaggio vetri professionale, potatura siepi e taglio giardini. Tel. 347 249 1884, email blupulizieok@gmail.com. Slogan sul biglietto: trasforma giardini e vetrate in opere d''arte.'),
  ricerca_il='2026-11-24'
 where nome='Luca Belinghieri';

-- Nicholas Ceri = marchio "Bianco Sovrano" (logo uguale sul biglietto). Sede a Cuveglio.
update public.clienti set
  referente=coalesce(referente,'Nicholas Ceri'),
  telefono=coalesce(telefono,'347 9930938'),
  email=coalesce(email,'cerinicholas95@gmail.com'),
  indirizzo=coalesce(indirizzo,'Via XXIV Maggio 68'),
  comune=coalesce(comune,'Cuveglio'),
  zona='Cuveglio',
  latitudine=45.906976, longitudine=8.739955,
  distanza_km=2.8, minuti_da_casa=4,
  modalita_contatto='di_persona',
  motivo_modalita='A ~4 min da casa, indirizzo sul biglietto (Via XXIV Maggio 68, Cuveglio): passare a fine giornata. Se risulta una sede privata, chiamare prima (347 9930938). WhatsApp già inviato senza risposta.',
  da_confermare='Il biglietto non dice che mestiere fa (marchio "Bianco Sovrano – la qualità prende colore"): categoria e attività da confermare. Via XXIV Maggio 68 è una sede aperta al pubblico o un indirizzo privato?',
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Biglietto 24/11/2026: marchio "Bianco Sovrano – La qualità prende colore". Cell. 347 9930938, email cerinicholas95@gmail.com, Via XXIV Maggio 68, 21030 Cuveglio (VA), P.IVA 03883170122.'),
  ricerca_il='2026-11-24'
 where nome='Nicholas Ceri';

-- Pizzeria Il Vesuvio = pizzeria da asporto di Laveno-Mombello (era l'ipotesi da confermare)
update public.clienti set
  telefono=coalesce(telefono,'331 3713913'),
  indirizzo='Via XXV Aprile 43',
  comune='Laveno-Mombello',
  zona='Laveno-Mombello',
  latitudine=45.900143, longitudine=8.626783,
  distanza_km=10.0, minuti_da_casa=15,
  orari=coalesce(orari,'{"Lun": "Chiuso", "Mar": "18–21:30", "Mer": "12–14 · 18–21:30", "Gio": "12–14 · 18–21:30", "Ven": "12–14 · 18–21:30", "Sab": "12–14 · 18–21:30", "Dom": "12–14 · 18–21:30"}'::jsonb),
  modalita_contatto='di_persona',
  motivo_modalita='Pizzeria da asporto, ~15 min via Cittiglio. Passare 11:30–12 o dopo le 14 (mai nei picchi 12–14 e 18–21:30); lunedì chiuso, martedì solo sera. Se si va a Cittiglio (giro 2), è a 4–5 km.',
  da_confermare=null,
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Biglietto 24/11/2026: "Pizzeria da asporto", Via XXV Aprile 43, Laveno-Mombello (VA), tel./WhatsApp 331 3713913. Orari: lun chiuso, mar 18–21:30, mer–dom 12–14 e 18–21:30. Sede confermata (corrisponde a "Il Vesuvio di Enzo e Enza" su Google).'),
  ricerca_il='2026-11-24'
 where nome='Pizzeria Il Vesuvio';

update public.clienti set
  telefono=coalesce(telefono,'333 3315021'),
  da_confermare='Numero scritto a mano sul biglietto e parzialmente corretto/coperto (333 3315021): verificare le cifre. Cognome e comune mancanti.',
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Biglietto 24/11/2026: "Roberto Tuttofare". Lavori di muratura, cartongesso, elettrici e idraulici. Numero scritto a mano.'),
  ricerca_il='2026-11-24'
 where nome='Roberto (tuttofare)';
