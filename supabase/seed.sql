-- Taxonomy rows only. Never listings. Adding a category is an INSERT here, never a migration.

insert into type (id, label_en, label_el, sort_order) values
  ('internship',         'Internship',           'πρακτικη',              1),
  ('fellowship',         'Fellowship',            'υποτροφιεσ',            2),
  ('conference',         'Conference',            'συνεδρια',              3),
  ('workshop',           'Workshop',              'worskshop',             4),
  ('summer_school',      'Summer school',         'summer schools',        5),
  ('hackathon',          'Hackathon',             'hackathon',             6),
  ('competition',        'Competition',           'διαγωνισμοι',           7),
  ('research_programme', 'Research programme',    'ερευνητικα προγραμματα',8),
  ('volunteering',       'Volunteering',          'εθελοντισμοσ',          9),
  ('accelerator',        'Accelerator',           'accelerators',         10),
  ('exchange_programme', 'Exchange programme',    'προγραμματα ανταλλαγησ',11),
  ('networking_event',   'Networking event',      'event Δικυωσησ',       12)
on conflict (id) do update set
  label_en = excluded.label_en,
  label_el = excluded.label_el,
  sort_order = excluded.sort_order;

insert into field (id, label_en, label_el, sort_order) values
  ('mathematics',               'Mathematics',                   'Μαθηματικά',                              1),
  ('computer_science',          'Computer science',               'Πληροφορική',                             2),
  ('engineering',                'Engineering',                    'Μηχανική',                                3),
  ('physical_sciences',          'Physical sciences',              'Φυσικές Επιστήμες',                       4),
  ('ai_data_science',            'AI & data science',              'Τεχνητή Νοημοσύνη & Επιστήμη Δεδομένων',  5),
  ('business_entrepreneurship',  'Business & entrepreneurship',    'Επιχειρηματικότητα',                      6),
  ('social_sciences_policy',     'Social sciences & policy',       'Κοινωνικές Επιστήμες & Πολιτική',         7),
  ('health_life_sciences',       'Health & life sciences',         'Υγεία & Επιστήμες Ζωής',                  8),
  ('environment_sustainability', 'Environment & sustainability',   'Περιβάλλον & Βιωσιμότητα',                9),
  ('arts_humanities',            'Arts & humanities',              'Τέχνες & Ανθρωπιστικές Επιστήμες',       10),
  ('law',                        'Law',                            'Νομική',                                 11),
  ('education',                  'Education',                     'Εκπαίδευση',                              12),
  ('global_development',         'Global development & policy',    'Παγκόσμια Ανάπτυξη & Πολιτική',          13)
on conflict (id) do update set
  label_en = excluded.label_en,
  label_el = excluded.label_el,
  sort_order = excluded.sort_order;
