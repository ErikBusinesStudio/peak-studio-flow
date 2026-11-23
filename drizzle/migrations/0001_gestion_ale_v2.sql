-- Peak Studio OS v2 — schema nuovo, separato dalle vecchie tabelle (clients, incomes, ...).
-- Le tabelle vecchie NON vengono toccate né cancellate.
-- Accesso: solo utenti autenticati (nessun accesso anonimo).

create or replace function public.gestionale_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- CLIENTI
-- =========================================================
create table public.clienti (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  referente text,
  telefono text,
  email text,
  sito_web text,
  social text,
  indirizzo text,
  comune text,
  categoria text not null default 'altro'
    check (categoria in ('auto_officine','ristorazione_bar','bellezza_benessere','tattoo','professionisti','ospitalita','sport_danza','negozi_commercio','artigiani_servizi','altro')),
  stato text not null default 'da_contattare'
    check (stato in ('da_contattare','contattato','in_trattativa','accettato','pagato','rifiutato')),
  storico boolean not null default false,
  fonte text,
  ha_sito boolean,
  motivo_rifiuto text,
  prossimo_contatto date,
  note text,
  orari jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index clienti_stato_idx on public.clienti (stato);
create index clienti_comune_idx on public.clienti (comune);
create index clienti_categoria_idx on public.clienti (categoria);
create trigger clienti_updated_at before update on public.clienti
  for each row execute function public.gestionale_set_updated_at();

-- =========================================================
-- REGISTRO CONTATTI
-- =========================================================
create table public.contatti_log (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clienti(id) on delete cascade,
  data date,
  canale text not null default 'altro'
    check (canale in ('whatsapp','telefono','di_persona','email','social','altro')),
  esito text,
  note text,
  prossimo_followup date,
  created_at timestamptz not null default now()
);
create index contatti_log_cliente_idx on public.contatti_log (cliente_id);

-- =========================================================
-- SERVIZI VENDUTI
-- =========================================================
create table public.servizi_venduti (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clienti(id) on delete cascade,
  tipo text not null default 'altro'
    check (tipo in ('sito','ecommerce','landing','logo','google_business','locandine','manutenzione','dominio_hosting','altro')),
  descrizione text,
  importo numeric(10,2) not null default 0,
  stato text not null default 'proposto'
    check (stato in ('proposto','accettato','consegnato')),
  data date,
  created_at timestamptz not null default now()
);
create index servizi_venduti_cliente_idx on public.servizi_venduti (cliente_id);

-- =========================================================
-- PAGAMENTI (lordo, trattenuta %, netto calcolato)
-- =========================================================
create table public.pagamenti (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clienti(id) on delete cascade,
  descrizione text not null,
  importo_lordo numeric(10,2) not null,
  trattenuta_pct numeric(5,2) not null default 0 check (trattenuta_pct >= 0 and trattenuta_pct <= 100),
  importo_netto numeric(10,2) generated always as (round(importo_lordo * (1 - trattenuta_pct / 100.0), 2)) stored,
  periodo text not null default 'dopo' check (periodo in ('prima','dopo')),
  stato text not null default 'da_incassare' check (stato in ('incassato','da_incassare')),
  data date,
  data_label text,
  created_at timestamptz not null default now()
);
create index pagamenti_cliente_idx on public.pagamenti (cliente_id);
create index pagamenti_periodo_idx on public.pagamenti (periodo);

-- =========================================================
-- MANUTENZIONI RICORRENTI
-- =========================================================
create table public.manutenzioni (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clienti(id) on delete cascade,
  importo_lordo numeric(10,2) not null default 50,
  trattenuta_pct numeric(5,2) not null default 0 check (trattenuta_pct >= 0 and trattenuta_pct <= 100),
  importo_netto numeric(10,2) generated always as (round(importo_lordo * (1 - trattenuta_pct / 100.0), 2)) stored,
  giorno_incasso int not null default 1 check (giorno_incasso between 1 and 28),
  attiva boolean not null default false,
  attiva_dal date,
  mesi_storico int not null default 0,
  note text,
  created_at timestamptz not null default now()
);
create index manutenzioni_cliente_idx on public.manutenzioni (cliente_id);

-- =========================================================
-- IMPOSTAZIONI (riga unica)
-- =========================================================
create table public.impostazioni (
  id int primary key default 1 check (id = 1),
  nome text not null default 'Peak Studio OS',
  data_zero date,
  obiettivo numeric(10,2) not null default 10000,
  scadenza date not null default '2027-06-08',
  updated_at timestamptz not null default now()
);
create trigger impostazioni_updated_at before update on public.impostazioni
  for each row execute function public.gestionale_set_updated_at();

-- =========================================================
-- SICUREZZA: solo utenti autenticati
-- =========================================================
alter table public.clienti enable row level security;
alter table public.contatti_log enable row level security;
alter table public.servizi_venduti enable row level security;
alter table public.pagamenti enable row level security;
alter table public.manutenzioni enable row level security;
alter table public.impostazioni enable row level security;

create policy "autenticati clienti" on public.clienti for all to authenticated using (true) with check (true);
create policy "autenticati contatti_log" on public.contatti_log for all to authenticated using (true) with check (true);
create policy "autenticati servizi_venduti" on public.servizi_venduti for all to authenticated using (true) with check (true);
create policy "autenticati pagamenti" on public.pagamenti for all to authenticated using (true) with check (true);
create policy "autenticati manutenzioni" on public.manutenzioni for all to authenticated using (true) with check (true);
create policy "autenticati impostazioni" on public.impostazioni for all to authenticated using (true) with check (true);

grant select, insert, update, delete on public.clienti, public.contatti_log, public.servizi_venduti,
  public.pagamenti, public.manutenzioni, public.impostazioni to authenticated;
grant all on public.clienti, public.contatti_log, public.servizi_venduti,
  public.pagamenti, public.manutenzioni, public.impostazioni to service_role;

-- =========================================================
-- DATI INIZIALI (stato al 23/11/2026) — 57 clienti
-- storico = true: pratiche chiuse prima della "data zero" (pagati e rifiutati)
-- =========================================================
insert into public.impostazioni (id, nome, data_zero, obiettivo, scadenza)
values (1, 'Peak Studio OS', null, 10000, '2027-06-08');

insert into public.clienti
  (nome, referente, telefono, email, sito_web, social, indirizzo, comune, categoria, stato, storico, fonte, ha_sito, motivo_rifiuto, note, orari)
values
-- ---------- PAGATI (7) ----------
('Safety Solutions','Giorgio Sigurtà','0332 743388',null,'https://safetysolutionproject.lovable.app',null,null,'Gavirate','professionisti','pagato',true,null,null,null,'Sicurezza sul lavoro. Sito vetrina dei servizi. Manutenzione non attiva. Nel vecchio gestionale: riferimento "Bdog" (da chiarire).',null),
('C.G. Cars','Chiara Gemma (direttrice vendite) · Moreno Russo (direttore tecnico)',null,'info@cgcars.it','https://cgcars.it',null,null,'Cuveglio','auto_officine','pagato',true,null,null,null,'Concessionaria auto multimarca. Solo sito. Dominio cgcars.it gestito da OVH. Richiesta modifiche al sito del 24/09/2026.','{"Lun":"9–12 · 15–18:30","Mar":"9–12 · 15–18:30","Mer":"9–12 · 15–18:30","Gio":"9–12 · 15–18:30","Ven":"9–12 · 15–18:30","Sab":"9–12","Dom":"Chiuso"}'::jsonb),
('ADHD & Biscotti',null,null,null,'https://adhdebiscotti.it','Instagram (circa 11k follower)',null,null,'altro','pagato',true,null,null,null,'Divulgazione e blog. Sito su misura con blog, guida e area riservata. 1 mese di manutenzione pagato. Segnalati problemi di indicizzazione (20/10/2026).',null),
('CTS Cuvio',null,null,null,'https://centrocuvio.it',null,null,'Cuveglio','sport_danza','pagato',true,null,null,null,'Centro turistico sportivo. Primo cliente, ha generato referral. Manutenzione non attiva.',null),
('E-Riutility',null,null,null,'https://e-riutility.it',null,null,'Cittiglio','negozi_commercio','pagato',true,null,null,null,'Mercatino dell''usato. Sito e-commerce. Il titolare è lo stesso del Partito degli Indecisi. Manutenzione 50 €/mese non tassata, attiva dal 01/12/2026.',null),
('CRV · Centro Revisioni Valcuvia',null,null,null,'https://eventmotorsport.com',null,null,'Cuveglio','auto_officine','pagato',true,null,null,null,'Revisioni e officina. Sito dei servizi bilingue con galleria. Manutenzione fatturata: 50 € meno 35% = 32,50 € netti al mese, incasso il 1° del mese.',null),
('Lu in Wonderland',null,null,null,null,null,null,'Cuveglio','ristorazione_bar','pagato',true,'Referral da CTS Cuvio',null,null,'Bar (ex "Bar Cuveglio"). Solo scheda Google Business.',null),

-- ---------- IN TRATTATIVA (2) ----------
('Partito degli Indecisi',null,null,null,null,'LinkedIn',null,null,'altro','in_trattativa',false,null,null,null,'Preventivo opzione A 1.490 € (bacheca senza account): scelta dal cliente, non ancora accettata. Il titolare è lo stesso di E-Riutility. Logo e dominio fuori prezzo.',null),
('Fiorista Peri',null,'0332 973317',null,'https://fioristaperi.it',null,'Via Provinciale 18','Cuveglio','negozi_commercio','in_trattativa',false,'Visita di persona',true,null,'Dal 1960. Sedi Cuveglio e Sangiano. Ha già un''agenzia che include il sito nel pacchetto, ma il lavoro non gli è piaciuto (troppo AI). Erik prepara una bozza di confronto da mostrare entro la prossima settimana.','{"Lun":"Chiuso","Mar":"9–12:30 · 15:30–19","Mer":"9–12:30 · 15:30–19","Gio":"9–12:30 · 15:30–19","Ven":"9–12:30 · 15:30–19","Sab":"9–12:30 · 15:30–19","Dom":"9–12"}'::jsonb),

-- ---------- CONTATTATI (8) ----------
('Kodawari Ink',null,'3791067891',null,null,null,null,'Cuveglio','tattoo','contattato',false,null,null,null,'Da ricontattare. Nel vecchio gestionale: inaugurazione prevista ~agosto.',null),
('Carrozzeria Massimo','Massimo Maurizio',null,null,null,null,null,null,'auto_officine','contattato',false,'Contatto di persona',null,null,'Da ricontattare. Il figlio (scuola di informatica) sta preparando un sito come progetto scolastico; il titolare non era convinto. Se non è soddisfatto, Erik prepara una bozza.',null),
('Lloà Flower Bar',null,null,null,null,null,null,null,'negozi_commercio','contattato',false,null,true,null,'Ha già un sito e-commerce. Proposta di restyling con prima bozza gratuita. Grafia del nome da confermare.',null),
('Luca Belinghieri',null,null,null,null,null,null,null,'artigiani_servizi','contattato',false,null,null,null,'Lavaggio vetri professionale e giardinaggio. Grafia del cognome da confermare.',null),
('Nicholas Ceri',null,null,null,null,'Instagram: bianco_sovrano',null,null,'altro','contattato',false,null,false,null,'Lavora in proprio con partita IVA. Non ha un sito.',null),
('Pizzeria Il Vesuvio',null,null,null,null,null,null,null,'ristorazione_bar','contattato',false,null,null,null,'Piccola pizzeria. Proposta: landing page con menu e contatti.',null),
('Roberto (tuttofare)',null,null,null,null,null,null,null,'artigiani_servizi','contattato',false,null,null,null,'Tuttofare. Messaggio con bozza gratuita.',null),
('Performing English Labs',null,null,null,null,null,null,null,'altro','contattato',false,null,null,null,'Dettagli sull''attività ancora da raccogliere.',null),

-- ---------- RIFIUTATI (17) ----------
('Fratelli Longhi',null,'0332 650256',null,null,null,null,'Casalzuigno','auto_officine','rifiutato',true,null,null,'Non ha accettato il preventivo','Concessionaria (Hyundai). Appuntamento del 04/07 18:30, circa 5 auto a settimana. Preventivo non accettato.',null),
('Gianni · Fuego Latino Style',null,null,null,null,null,'Via Armando Diaz 8','Besozzo','sport_danza','rifiutato',true,null,null,'Rifiutato da Erik: il lavoro proposto non era di suo gradimento','Scuola di ballo (corso di bachata e salsa). Aveva risposto in modo positivo.',null),
('Gym Area 77',null,'3402898262',null,null,null,'Via Sciareda 15','Casalzuigno','sport_danza','rifiutato',true,null,null,null,'Palestra.',null),
('Pretty Woman',null,null,null,null,null,null,null,'altro','rifiutato',true,null,null,null,'Categoria e comune da verificare.',null),
('Halibu Adventure Kenya',null,null,null,null,null,null,null,'altro','rifiutato',true,null,null,null,'Categoria e comune da verificare.',null),
('Netti x Giardini',null,null,null,null,null,null,'Casalzuigno','artigiani_servizi','rifiutato',true,null,null,null,'Conoscente del padre di Erik.',null),
('Le Officine Tattoo Studio',null,null,null,null,null,null,'Laveno','tattoo','rifiutato',true,null,null,null,null,null),
('Josy Creazioni',null,null,null,null,null,null,'Cittiglio','altro','rifiutato',true,null,null,null,'Sito realizzato come demo, non venduto.',null),
('Texas Bar',null,null,null,null,null,null,'Brenta','ristorazione_bar','rifiutato',true,null,null,null,null,null),
('Le Gemelle Parrucchiere',null,null,null,null,null,null,'Brenta','bellezza_benessere','rifiutato',true,null,null,null,null,null),
('Trattoria degli Amici',null,null,null,null,null,null,'Cittiglio','ristorazione_bar','rifiutato',true,null,null,null,null,null),
('Le Delizie',null,null,null,null,null,null,'Cuveglio','ristorazione_bar','rifiutato',true,null,null,null,'Categoria da verificare.',null),
('Musso Motorsport',null,null,null,null,null,null,'Rancio','auto_officine','rifiutato',true,null,null,null,null,null),
('Osteria della Purtascia',null,null,null,null,null,null,'Cocquio','ristorazione_bar','rifiutato',true,null,null,null,null,null),
('Pizzeria Dance 888',null,null,null,null,null,null,'Cocquio','ristorazione_bar','rifiutato',true,null,null,null,null,null),
('Studio Avvocato Maraviglia',null,null,null,null,null,null,'Cuveglio','professionisti','rifiutato',true,null,null,null,'Liquidato subito.',null),
('Chandra Tattoo',null,'334 105 0574',null,null,null,null,'Besozzo','tattoo','rifiutato',true,null,null,'Ha detto no.',null,null),

-- ---------- DA CONTATTARE: piano visite ottobre (5) ----------
('Antico Borgo Sanda',null,null,null,null,null,null,null,'altro','da_contattare',false,null,null,null,'Piano visite ottobre. Categoria e comune da verificare.',null),
('Carrozzeria Torcaso',null,null,null,null,null,null,null,'auto_officine','da_contattare',false,null,null,null,'Piano visite ottobre. Comune da verificare.',null),
('Studio Tecnico Geom. Bolognesi',null,null,null,null,null,null,null,'professionisti','da_contattare',false,null,null,null,'Piano visite ottobre. Comune da verificare.',null),
('Curcio & Coclite',null,null,null,null,null,null,null,'altro','da_contattare',false,'Visita di persona con Monti',null,null,'Piano visite ottobre. Categoria e comune da verificare.',null),
('Hair Love',null,null,null,null,null,null,null,'bellezza_benessere','da_contattare',false,'Visita di persona con Monti',null,null,'Piano visite ottobre. Comune da verificare.',null),

-- ---------- DA CONTATTARE: dal vecchio gestionale (18) ----------
('Blue Bar',null,'0332 624727',null,null,null,'Via Valcuvia 28','Casalzuigno','ristorazione_bar','da_contattare',false,null,null,null,null,null),
('B&B Casale del Cantico','Roberto e Lucia','349 622 2502',null,null,null,null,'Brenta','ospitalita','da_contattare',false,null,null,null,'B&B: nessun orario, basta chiamare.',null),
('Urban Fighting (Boxe Gym)',null,null,null,null,'Facebook: @urbanfightingbrenta',null,'Brenta','sport_danza','da_contattare',false,null,null,null,'Palestra di boxe.',null),
('L''Albero della Vita',null,'349 387 1054',null,null,null,'Via Campo dei Fiori 18','Brenta','professionisti','da_contattare',false,null,null,null,'Studio di psicologia e psicoterapia.','{"Lun":"9–19","Mar":"9–19","Mer":"9–19","Gio":"9–19","Ven":"9–19","Sab":"9–16","Dom":"Chiuso"}'::jsonb),
('Cristallo',null,'0332 601336',null,null,null,'Via Provinciale 75','Cittiglio','ospitalita','da_contattare',false,null,true,null,'Hotel e ristorante. Ha già un sito. Sempre aperto quando si passa.',null),
('La Bussola',null,'0332 602291',null,null,null,'Via Marconi 28','Cittiglio','ristorazione_bar','da_contattare',false,null,true,null,'Ha già un sito: proporre solo il menu con QR code. Sempre aperto.',null),
('Le Follie di Laura',null,'0332 603141',null,null,null,'Via del Sasso 8','Cittiglio','bellezza_benessere','da_contattare',false,null,null,null,'Centro estetico.','{"Lun":"9–22","Mar":"9–19","Mer":"9–22","Gio":"9–19","Ven":"9–19","Sab":"Chiuso","Dom":"Chiuso"}'::jsonb),
('Simona Marinoni Parrucchiera',null,'0332 601786',null,null,null,'Via Roma 38','Cittiglio','bellezza_benessere','da_contattare',false,null,null,null,'Parrucchiera.','{"Lun":"Chiuso","Mar":"8–12","Mer":"8–12","Gio":"8–19","Ven":"8–19","Sab":"8–19","Dom":"Chiuso"}'::jsonb),
('Carmen Ramona Matei Psicologa',null,null,null,null,null,null,'Cuveglio','professionisti','da_contattare',false,null,null,null,'Centro di Cuveglio. Da verificare gli orari sul posto.',null),
('L''Estetica di Michela Fogli',null,null,null,null,null,null,'Cuveglio','bellezza_benessere','da_contattare',false,null,null,null,'Estetica e ricostruzione unghie.','{"Lun":"Chiuso","Mar":"9:30–18:30","Mer":"9:30–18:30","Gio":"9:30–18:30","Ven":"9–18:30","Sab":"9–13:30","Dom":"Chiuso"}'::jsonb),
('Estetica DESY','Desiree Donadio',null,null,null,null,null,'Cuveglio','bellezza_benessere','da_contattare',false,null,null,null,null,'{"Lun":"8:30–19","Mar":"8:30–12 · 14–19","Mer":"8:30–19","Gio":"8:30–19","Ven":"8:30–19","Sab":"Chiuso","Dom":"Chiuso"}'::jsonb),
('Autosalone Internazionale',null,null,null,null,null,null,'Cuveglio','auto_officine','da_contattare',false,null,true,null,'Auto usate. Ha già un sito ma fatto male: proporre un restyling. Orari non noti.',null),
('SHM Tattoo - Piercing',null,'3452383043',null,null,null,'Corso XXV Aprile 40','Gavirate','tattoo','da_contattare',false,null,null,null,null,null),
('COR MEUM Tattoo',null,'351 612 8002',null,null,null,'Viale Ticino 2','Gavirate','tattoo','da_contattare',false,null,null,null,null,null),
('Giro Pizza Revolution',null,'393 546 4398',null,null,null,'Viale Verbano 62','Gavirate','ristorazione_bar','da_contattare',false,null,null,null,null,null),
('Mianiink Tattoo Studio',null,null,null,null,null,null,'Rancio','tattoo','da_contattare',false,null,null,null,null,null),
('Latin Fit Dancing',null,null,null,null,null,null,'Caravate','sport_danza','da_contattare',false,null,null,null,null,null),
('Candela Meccanico',null,null,null,null,null,null,'Besozzo','auto_officine','da_contattare',false,null,null,null,null,null);

-- ---------- Registro contatti iniziale ----------
insert into public.contatti_log (cliente_id, data, canale, esito, note)
select c.id, v.data::date, v.canale, v.esito, v.note
from (values
  ('Fiorista Peri','2026-11-17','di_persona','In trattativa','Ha già un''agenzia con il sito incluso nel pacchetto, ma non gradito (troppo AI). Promessa una bozza di confronto per la prossima settimana.'),
  ('Carrozzeria Massimo',null,'di_persona','Da ricontattare','Il figlio sta preparando un sito come progetto scolastico.'),
  ('Gianni · Fuego Latino Style',null,'whatsapp','Risposta positiva, poi rifiutato da Erik','Il lavoro proposto non era di suo gradimento: non ricontattato.'),
  ('Lloà Flower Bar',null,'whatsapp','Nessuna risposta',null),
  ('Luca Belinghieri',null,'whatsapp','Nessuna risposta',null),
  ('Nicholas Ceri',null,'whatsapp','Nessuna risposta',null),
  ('Pizzeria Il Vesuvio',null,'whatsapp','Nessuna risposta',null),
  ('Roberto (tuttofare)',null,'whatsapp','Nessuna risposta',null),
  ('Performing English Labs',null,'whatsapp','Nessuna risposta',null)
) as v(nome, data, canale, esito, note)
join public.clienti c on c.nome = v.nome;

-- ---------- Servizi venduti (storico "prima") ----------
insert into public.servizi_venduti (cliente_id, tipo, descrizione, importo, stato)
select c.id, v.tipo, v.descrizione, v.importo, 'consegnato'
from (values
  ('Safety Solutions','sito','Sito vetrina dei servizi',200),
  ('C.G. Cars','sito','Sito vetrina con parco auto e servizi',400),
  ('ADHD & Biscotti','sito','Sito su misura con blog, guida e area riservata',450),
  ('CTS Cuvio','sito','Sito con attività e contatti',200),
  ('CTS Cuvio','locandine','2 locandine',40),
  ('CTS Cuvio','google_business','Scheda Google Business',100),
  ('E-Riutility','ecommerce','Sito e-commerce',1200),
  ('CRV · Centro Revisioni Valcuvia','sito','Sito dei servizi bilingue con galleria',500),
  ('Lu in Wonderland','google_business','Scheda Google Business',150)
) as v(nome, tipo, descrizione, importo)
join public.clienti c on c.nome = v.nome;

-- ---------- Pagamenti (storico "prima": tutto incassato) ----------
insert into public.pagamenti (cliente_id, descrizione, importo_lordo, trattenuta_pct, periodo, stato, data_label)
select c.id, v.descrizione, v.lordo, v.trattenuta, 'prima', 'incassato', v.label
from (values
  ('Safety Solutions','Sito web',200,0,null),
  ('C.G. Cars','Sito web',400,0,null),
  ('ADHD & Biscotti','Sito web',450,0,null),
  ('ADHD & Biscotti','Manutenzione (1 mese)',50,0,null),
  ('CTS Cuvio','Sito web',200,0,'Mag 2026'),
  ('CTS Cuvio','2 locandine',40,0,'Mag 2026'),
  ('CTS Cuvio','Google Business',100,0,'Mag 2026'),
  ('E-Riutility','E-commerce — acconto',200,0,'Mag 2026'),
  ('E-Riutility','E-commerce — 1ª rata',500,0,'01/07/2026'),
  ('E-Riutility','E-commerce — 2ª rata',500,0,null),
  ('E-Riutility','Manutenzione (4 mesi)',200,0,null),
  ('CRV · Centro Revisioni Valcuvia','Sito web',500,0,null),
  ('CRV · Centro Revisioni Valcuvia','Manutenzione (3 mesi, fatturata)',150,35,null),
  ('Lu in Wonderland','Google Business',150,0,'Mag 2026')
) as v(nome, descrizione, lordo, trattenuta, label)
join public.clienti c on c.nome = v.nome;

-- ---------- Manutenzioni ----------
insert into public.manutenzioni (cliente_id, importo_lordo, trattenuta_pct, giorno_incasso, attiva, attiva_dal, mesi_storico, note)
select c.id, v.lordo, v.trattenuta, 1, v.attiva, v.dal::date, v.mesi, v.note
from (values
  ('CRV · Centro Revisioni Valcuvia',50,35,true,null,3,'Fatturata: netto 32,50 €/mese. Incasso il 1° del mese.'),
  ('E-Riutility',50,0,true,'2026-12-01',4,'Non tassata: 50 €/mese netti. Nel "normale" da dicembre 2026.'),
  ('ADHD & Biscotti',50,0,false,null,1,'Un solo mese di manutenzione, poi non attiva.'),
  ('CTS Cuvio',50,0,false,null,0,'Non attiva.'),
  ('Safety Solutions',50,0,false,null,0,'Non attiva.')
) as v(nome, lordo, trattenuta, attiva, dal, mesi, note)
join public.clienti c on c.nome = v.nome;
