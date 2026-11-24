-- Carrozzeria Massaro: ha pubblicato un sito (probabilmente fatto dal figlio) -> rifiutato (24/11/2026)
update public.clienti set
  stato='rifiutato',
  storico=true,
  motivo_rifiuto='Ha già pubblicato un sito, probabilmente fatto dal figlio (progetto scolastico)',
  priorita=null,
  modalita_contatto=null,
  motivo_modalita=null,
  da_confermare=null,
  prossimo_contatto=null,
  ha_sito=true,
  note=trim(both E'\n' from coalesce(note,'') || E'\n\n' || 'Il 24/11/2026 Erik ha segnalato che ha pubblicato un sito (probabilmente realizzato dal figlio): spostato tra i rifiutati. Tolto dal giro del 17/12.')
 where nome='Carrozzeria Massaro';

insert into public.contatti_log (cliente_id, data, canale, esito, note)
select c.id, '2026-11-24'::date, 'altro', 'Rifiutato', 'Sito già pubblicato, probabilmente fatto dal figlio.'
from public.clienti c where c.nome='Carrozzeria Massaro';
