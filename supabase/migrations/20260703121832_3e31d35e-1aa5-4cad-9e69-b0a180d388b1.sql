
-- === SCHEMA CHANGES ===
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS zona text,
  ADD COLUMN IF NOT EXISTS value numeric,
  ADD COLUMN IF NOT EXISTS collected numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS hours jsonb;

ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS date_note text;

ALTER TABLE public.incomes
  ADD COLUMN IF NOT EXISTS date_label text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'incassato';
ALTER TABLE public.incomes ALTER COLUMN date DROP NOT NULL;
ALTER TABLE public.incomes ALTER COLUMN date DROP DEFAULT;

ALTER TABLE public.costs ADD COLUMN IF NOT EXISTS date_label text;
ALTER TABLE public.costs ALTER COLUMN date DROP NOT NULL;
ALTER TABLE public.costs ALTER COLUMN date DROP DEFAULT;

ALTER TABLE public.managements ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'acquisito';
ALTER TABLE public.managements ALTER COLUMN monthly_amount DROP NOT NULL;
ALTER TABLE public.managements ALTER COLUMN monthly_amount DROP DEFAULT;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS services_one_off jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS services_monthly jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ALTER COLUMN stage DROP NOT NULL;

CREATE TABLE IF NOT EXISTS public.updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  event text NOT NULL,
  category text NOT NULL DEFAULT 'Peak Studio',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.updates TO anon, authenticated;
GRANT ALL ON public.updates TO service_role;
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public all" ON public.updates;
CREATE POLICY "public all" ON public.updates FOR ALL USING (true) WITH CHECK (true);

-- === WIPE ===
TRUNCATE public.clients, public.todos, public.incomes, public.costs, public.savings, public.projects, public.managements, public.updates, public.events, public.diary_entries RESTART IDENTITY CASCADE;

-- === CLIENTI (42) ===
INSERT INTO public.clients (name, zona, status, value, collected, phone, notes, hours) VALUES
('CTS Cuvio','Cuveglio','acquisito',340,340,NULL,'Primo cliente. Ha generato referral.',NULL),
('Usato e-Riulity','Cittiglio','acquisito',1200,700,NULL,'1° rata 500€ incassata. 2° rata in arrivo.',NULL),
('Bar Cuveglio','Cuveglio','acquisito',150,150,NULL,'Referral da CTS. Solo Google Business.',NULL),
('Safety Solution','Gavirate','acquisito',200,0,'0332 743388','Via Bdog. In attesa FAQ da Giorgio Sigurtà.',NULL),
('Fratelli Longhi','Casalzuigno','in_attesa',NULL,0,'0332 650256','App. ven 4/07 18:30. ~5 auto/sett.',NULL),
('CRV Revisioni','Cuveglio','in_attesa',500,0,NULL,'In attesa materiali.',NULL),
('ADHD & Biscotti',NULL,'in_attesa',450,0,NULL,'Demo pronta. 11k follower.',NULL),
('Partito degli Indecisi',NULL,'in_attesa',800,0,NULL,'Titolare e-Riulity. Dopo 2° rata.',NULL),
('Kodawari Ink','Cuveglio','in_attesa',NULL,0,'3791067891','Inaugurazione ~agosto.',NULL),
('Josy Creazioni','Cittiglio','rifiutato',NULL,0,NULL,'Sito fatto, non venduto.',NULL),
('Texas Bar','Brenta','rifiutato',NULL,0,NULL,'',NULL),
('Le Gemelle Parrucchiere','Brenta','rifiutato',NULL,0,NULL,'',NULL),
('Trattoria degli Amici','Cittiglio','rifiutato',NULL,0,NULL,'',NULL),
('Le Delizie','Cuveglio','rifiutato',NULL,0,NULL,'',NULL),
('Musso Motorsport','Rancio','rifiutato',NULL,0,NULL,'',NULL),
('Osteria della Purtascia','Cocquio','rifiutato',NULL,0,NULL,'',NULL),
('Pizzeria Dance 888','Cocquio','rifiutato',NULL,0,NULL,'',NULL),
('Studio Avvocato Maraviglia','Cuveglio','rifiutato',NULL,0,NULL,'Liquidato subito.',NULL),
('Chandra Tattoo','Besozzo','rifiutato',NULL,0,'334 105 0574','Ha detto no.',NULL),
('Blue Bar','Casalzuigno','da_contattare',NULL,0,'0332 624727','Via Valcuvia 28.',NULL),
('Gym Area 77','Casalzuigno','da_contattare',NULL,0,'3402898262','Via Sciareda 15.',NULL),
('Netti x Giardini','Casalzuigno','da_contattare',NULL,0,NULL,'Amico del padre.',NULL),
('B&B Casale del Cantico','Brenta','da_contattare',NULL,0,'349 622 2502','B&B — nessun orario, basta chiamare. Titolari: Roberto e Lucia.',NULL),
('Cristallo','Cittiglio','da_contattare',NULL,0,'0332 601336','Via Provinciale 75. Hotel+ristorante. Ha già sito. Sempre aperto quando passo.',NULL),
('La Bussola','Cittiglio','da_contattare',NULL,0,'0332 602291','Via Marconi 28. Ha già sito — proporre solo menu QR code. Sempre aperto.',NULL),
('Le Follie di Laura Estetista','Cittiglio','da_contattare',NULL,0,'0332 603141','Via del Sasso 8. Centro estetico.','{"Lun":"9–22","Mar":"9–19","Mer":"9–22","Gio":"9–19","Ven":"9–19","Sab":"Chiuso","Dom":"Chiuso"}'::jsonb),
('Simona Marinoni Parrucchiera','Cittiglio','da_contattare',NULL,0,'0332 601786','Via Roma 38. Parrucchiera.','{"Lun":"Chiuso","Mar":"8–12","Mer":"8–12","Gio":"8–19","Ven":"8–19","Sab":"8–19","Dom":"Chiuso"}'::jsonb),
('Urban Fighting (Boxe Gym)','Brenta','da_contattare',NULL,0,NULL,'FB @urbanfightingbrenta.',NULL),
('Carmen Ramona Matei Psicologa','Cuveglio','da_contattare',NULL,0,NULL,'Centro Cuveglio. Verificare orari sul posto martedì 7/07.',NULL),
('L''Estetica di Michela Fogli','Cuveglio','da_contattare',NULL,0,NULL,'Estetica + ricostruzione unghie.','{"Lun":"Chiuso","Mar":"9:30–18:30","Mer":"9:30–18:30","Gio":"9:30–18:30","Ven":"9–18:30","Sab":"9–13:30","Dom":"Chiuso"}'::jsonb),
('Estetica DESY','Cuveglio','da_contattare',NULL,0,NULL,'Di Donadio Desiree.','{"Lun":"8:30–19","Mar":"8:30–12 · 14–19","Mer":"8:30–19","Gio":"8:30–19","Ven":"8:30–19","Sab":"Chiuso","Dom":"Chiuso"}'::jsonb),
('Fiorista Peri','Cuveglio','da_contattare',NULL,0,'0332 973317','Via Provinciale 18. Ha già sito. Dal 1960.','{"Lun":"Chiuso","Mar":"9–12:30 · 15:30–19","Mer":"9–12:30 · 15:30–19","Gio":"9–12:30 · 15:30–19","Ven":"9–12:30 · 15:30–19","Sab":"9–12:30 · 15:30–19","Dom":"9–12"}'::jsonb),
('CGCars Cuveglio','Cuveglio','da_contattare',NULL,0,NULL,'Concessionaria auto.','{"Lun":"9–12:30 · 15–18:30","Mar":"9–12:30 · 15–18:30","Mer":"9–12:30 · 15–18:30","Gio":"9–12:30 · 15–18:30","Ven":"9–12:30 · 15–18:30","Sab":"9–12:30","Dom":"Chiuso"}'::jsonb),
('Autosalone Internazionale','Cuveglio','da_contattare',NULL,0,NULL,'Auto usate. Ha già sito ma fatto male — proporre restyling. Orari non noti.',NULL),
('Le Officine Tattoo Studio','Laveno','da_contattare',NULL,0,NULL,'',NULL),
('Mianiink Tattoo Studio','Rancio','da_contattare',NULL,0,NULL,'',NULL),
('SHM Tattoo - Piercing','Gavirate','da_contattare',NULL,0,'3452383043','Corso XXV Aprile 40.',NULL),
('COR MEUM Tattoo','Gavirate','da_contattare',NULL,0,'351 612 8002','Viale Ticino 2.',NULL),
('Giro Pizza Revolution','Gavirate','da_contattare',NULL,0,'393 546 4398','Viale Verbano 62.',NULL),
('Latin Fit Dancing','Caravate','da_contattare',NULL,0,NULL,'',NULL),
('L''Albero della Vita','Brenta','da_contattare',NULL,0,'349 387 1054','Via Campo dei Fiori 18, Brenta. Studio di psicologia e psicoterapia.','{"Lun":"9–19","Mar":"9–19","Mer":"9–19","Gio":"9–19","Ven":"9–19","Sab":"9–16","Dom":"Chiuso"}'::jsonb),
('Candela Meccanico','Besozzo','da_contattare',NULL,0,NULL,'',NULL);

-- === TODOS ===
INSERT INTO public.todos (title, priority, date_note, done) VALUES
('Incassare 2° rata e-Riulity (500€)','alta','In arrivo',false),
('Appuntamento Fratelli Longhi — info preventivo','alta','Ven 4/07 18:30',false),
('Inviare demo + preventivo ADHD & Biscotti','alta','Mer 1/07 10:30',false),
('WhatsApp CRV Revisioni — reminder modulo','media','Gio 2/07 12:15',false),
('Attivare gestioni mensili CTS e e-Riulity','media','—',false),
('Passare spesa Shopify a e-Riulity','media','A breve',false),
('Definire accordo Safety Solution manutenzione','bassa','Post pub.',false);

-- === INCOMES ===
INSERT INTO public.incomes (description, date_label, amount, status) VALUES
('2 locandine — CTS Cuvio','Mag 2026',40,'incassato'),
('Sito web — CTS Cuvio','Mag 2026',200,'incassato'),
('Google Business — CTS Cuvio','Mag 2026',100,'incassato'),
('Google Business — Bar Cuveglio','Mag 2026',150,'incassato'),
('E-commerce — e-Riulity (acconto)','Mag 2026',200,'incassato'),
('E-commerce — e-Riulity (1° rata)','01/07/2026',500,'incassato'),
('E-commerce — e-Riulity (2° rata)','In arrivo',500,'da_incassare'),
('Sito — Safety Solution (Bdog)','Post pub.',200,'da_incassare');

-- === COSTI ===
INSERT INTO public.costs (description, date_label, amount) VALUES
('Lovable (mag — 3 mesi promo)','Mag 2026',105),
('ChatGPT Pro','Mag 2026',6.99),
('Dominio CTS','Mag 2026',7.31),
('Lovable','Giu 2026',25),
('ChatGPT Pro','Giu 2026',6.99),
('Claude Pro','Giu 2026',22);

-- === UPDATES / CRONO ===
INSERT INTO public.updates (date, event, category) VALUES
('2026-05-02','Inizio attività commerciale Peak Studio','Peak Studio'),
('2026-06-09','Safety Solution — prime mail con Giorgio Sigurtà','Peak Studio'),
('2026-06-25','ADHD & Biscotti — demo creata su Lovable','Peak Studio'),
('2026-06-29','Call e-Riulity — modifiche al sito richieste','Peak Studio'),
('2026-07-01','e-Riulity — 1° rata 500€ incassata','Peak Studio');

-- === PROJECTS / PIPELINE ===
INSERT INTO public.projects (name, color, services_one_off, services_monthly, notes) VALUES
('Fratelli Longhi','#f59e0b',
 '[{"v":"Sito restyling","i":960},{"v":"Dominio+test+online","i":150},{"v":"Cookie+SEO","i":200},{"v":"Logo 65°","i":80},{"v":"Post social (cad)","i":80}]'::jsonb,
 '[{"v":"Gestione tecnica","i":50},{"v":"Aggiornamento cookie","i":30},{"v":"Caricamento auto (cad)","i":35},{"v":"Aggiornamenti Hyundai","i":150}]'::jsonb,
 'App. ven 4/07 18:30.'),
('ADHD & Biscotti','#a855f7',
 '[{"v":"Sito web completo","i":450}]'::jsonb,
 '[{"v":"Manutenzione sito","i":50}]'::jsonb,
 'Demo pronta. 11k follower.'),
('CRV Revisioni','#3b82f6',
 '[{"v":"Sito web","i":500}]'::jsonb,
 '[{"v":"Manutenzione sito","i":50}]'::jsonb,
 'In attesa materiali.'),
('Partito degli Indecisi','#22c55e',
 '[{"v":"Sito blog","i":800}]'::jsonb,
 '[{"v":"Gestione mensile","i":50}]'::jsonb,
 'Titolare e-Riulity.');

-- === MANAGEMENTS ===
INSERT INTO public.managements (name, monthly_amount, category, notes, active) VALUES
('CTS Cuvio',50,'acquisito','Mai fatturata',true),
('Usato e-Riulity',50,'acquisito','Mai fatturata',true),
('Safety Solution',NULL,'acquisito','Dipende da Bdog',true),
('Fratelli Longhi',230,'pipeline','+ 35€/auto extra — Da confermare',false),
('ADHD & Biscotti',50,'pipeline',NULL,false),
('CRV Revisioni',50,'pipeline',NULL,false),
('Partito degli Indecisi',50,'pipeline',NULL,false);

-- === SAVINGS ===
INSERT INTO public.savings (amount, note, date) VALUES
(1000,'Risparmi accumulati','2026-07-01');

-- === SETTINGS ===
UPDATE public.settings SET
  dashboard_name='Basecamp',
  primary_color='#6366f1',
  savings_goal=10000,
  savings_deadline='2026-12-31',
  moto_split=60
WHERE id=1;
INSERT INTO public.settings (id, dashboard_name, primary_color, savings_goal, savings_deadline, moto_split)
SELECT 1,'Basecamp','#6366f1',10000,'2026-12-31',60
WHERE NOT EXISTS (SELECT 1 FROM public.settings WHERE id=1);
