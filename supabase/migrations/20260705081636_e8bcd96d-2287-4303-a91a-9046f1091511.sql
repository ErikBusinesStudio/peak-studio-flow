
UPDATE incomes SET date = '2026-05-15' WHERE date IS NULL AND date_label = 'Mag 2026';
UPDATE incomes SET date = '2026-06-15' WHERE date IS NULL AND date_label = 'Giu 2026';
UPDATE incomes SET date = '2026-07-15' WHERE date IS NULL AND date_label = 'Lug 2026';
UPDATE incomes SET date = '2026-07-01' WHERE date IS NULL AND date_label = '01/07/2026';

UPDATE costs SET date = '2026-05-15' WHERE date IS NULL AND date_label = 'Mag 2026';
UPDATE costs SET date = '2026-06-15' WHERE date IS NULL AND date_label = 'Giu 2026';
UPDATE costs SET date = '2026-07-15' WHERE date IS NULL AND date_label = 'Lug 2026';
