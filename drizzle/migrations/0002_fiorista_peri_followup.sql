-- Fiorista Peri: Erik lo ricontatta il 23/11/2026
update public.clienti set prossimo_contatto = '2026-11-23'
where nome ilike 'Fiorista Peri%' and prossimo_contatto is null;
