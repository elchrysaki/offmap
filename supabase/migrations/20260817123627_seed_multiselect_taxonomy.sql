-- Replaces the earlier invented `field` list with the real 22 broad fields
-- from offmap-hub's submission form, and seeds the four new lookup tables
-- with the real options from that same form.

delete from opportunity_field;
delete from field;

insert into field (id, label_en, label_el, sort_order) values
  ('engineering_technology',        'Engineering and Technology',              'Μηχανική & Τεχνολογία',                     1),
  ('computer_science_ai',           'Computer Science and Artificial Intelligence', 'Πληροφορική & Τεχνητή Νοημοσύνη',       2),
  ('mathematics_statistics',        'Mathematics and Statistics',              'Μαθηματικά & Στατιστική',                   3),
  ('physics_astronomy',             'Physics and Astronomy',                   'Φυσική & Αστρονομία',                       4),
  ('chemistry_materials_science',   'Chemistry and Materials Science',         'Χημεία & Επιστήμη Υλικών',                  5),
  ('biology_life_sciences',         'Biology and Life Sciences',               'Βιολογία & Επιστήμες Ζωής',                 6),
  ('medicine_health',               'Medicine and Health',                     'Ιατρική & Υγεία',                           7),
  ('environmental_science_sustainability', 'Environmental Science and Sustainability', 'Περιβαλλοντικές Επιστήμες & Βιωσιμότητα', 8),
  ('business_economics',            'Business and Economics',                  'Επιχειρήσεις & Οικονομικά',                 9),
  ('entrepreneurship_innovation',   'Entrepreneurship and Innovation',         'Επιχειρηματικότητα & Καινοτομία',          10),
  ('law_public_policy',             'Law and Public Policy',                   'Νομική & Δημόσια Πολιτική',                11),
  ('politics_international_relations', 'Politics and International Relations', 'Πολιτική & Διεθνείς Σχέσεις',              12),
  ('social_sciences',               'Social Sciences',                         'Κοινωνικές Επιστήμες',                     13),
  ('psychology_behavioural_science','Psychology and Behavioural Science',      'Ψυχολογία & Επιστήμη Συμπεριφοράς',        14),
  ('education',                     'Education',                               'Εκπαίδευση',                               15),
  ('arts_design',                   'Arts and Design',                         'Τέχνες & Σχεδιασμός',                      16),
  ('humanities',                    'Humanities',                              'Ανθρωπιστικές Επιστήμες',                  17),
  ('media_communications',          'Media and Communications',                'Μέσα & Επικοινωνία',                       18),
  ('architecture_urban_planning',   'Architecture and Urban Planning',         'Αρχιτεκτονική & Πολεοδομία',               19),
  ('agriculture_food_science',      'Agriculture and Food Science',            'Γεωπονία & Επιστήμη Τροφίμων',             20),
  ('interdisciplinary',             'Interdisciplinary',                       'Διεπιστημονικό',                           21),
  ('open_to_all_fields',            'Open to all fields',                      'Ανοιχτό σε όλους τους τομείς',             22);

insert into academic_level (id, label_en, label_el, sort_order) values
  ('secondary_high_school',       'Secondary or high-school students', 'Μαθητές Λυκείου',                     1),
  ('vocational',                  'Vocational students',               'Επαγγελματική Εκπαίδευση',            2),
  ('undergraduate',               'Undergraduate students',            'Προπτυχιακοί',                        3),
  ('masters',                     'Master''s students',                'Μεταπτυχιακοί',                       4),
  ('doctoral',                    'Doctoral students',                 'Διδακτορικοί',                        5),
  ('postdoctoral',                'Postdoctoral researchers',          'Μεταδιδακτορικοί Ερευνητές',          6),
  ('recent_graduates',            'Recent graduates',                  'Πρόσφατοι Απόφοιτοι',                 7),
  ('early_career_professionals',  'Early-career professionals',        'Επαγγελματίες Πρώιμου Σταδίου',       8),
  ('professionals',               'Professionals',                     'Επαγγελματίες',                       9),
  ('open_to_several_levels',      'Open to several levels',            'Ανοιχτό σε πολλά επίπεδα',           10),
  ('no_academic_restriction',     'No academic restriction mentioned', 'Χωρίς ακαδημαϊκό περιορισμό',        11),
  ('not_sure_academic_level',     'Not sure',                          'Άγνωστο',                             12);

insert into geo_scope (id, label_en, label_el, sort_order) values
  ('worldwide',                   'Worldwide',                          'Παγκόσμιο',                            1),
  ('africa',                      'Africa',                             'Αφρική',                               2),
  ('asia',                        'Asia',                               'Ασία',                                 3),
  ('europe',                      'Europe',                             'Ευρώπη',                               4),
  ('eu_eea',                      'European Union or EEA',              'ΕΕ / ΕΟΧ',                             5),
  ('latin_america_caribbean',     'Latin America and the Caribbean',    'Λατινική Αμερική & Καραϊβική',        6),
  ('middle_east_north_africa',    'Middle East and North Africa',       'Μέση Ανατολή & Βόρεια Αφρική',        7),
  ('north_america',               'North America',                      'Βόρεια Αμερική',                       8),
  ('oceania',                     'Oceania',                            'Ωκεανία',                              9),
  ('host_country_only',           'Host country only',                  'Μόνο χώρα διεξαγωγής',                10),
  ('specific_countries',          'Specific countries',                 'Συγκεκριμένες χώρες',                 11),
  ('multiple_countries_regions',  'Multiple countries or regions',      'Πολλές χώρες ή περιοχές',            12),
  ('no_geographic_restriction',   'No geographic restriction mentioned','Χωρίς γεωγραφικό περιορισμό',        13),
  ('not_sure_geo',                'Not sure',                           'Άγνωστο',                             14);

insert into audience_group (id, label_en, label_el, sort_order) values
  ('women',                       'Women',                                          'Γυναίκες',                                     1),
  ('women_in_stem',               'Women in STEM',                                  'Γυναίκες στις Θετικές Επιστήμες',             2),
  ('underrepresented_stem',       'Underrepresented groups in STEM',                'Υποεκπροσωπούμενες ομάδες στις Θετικές Επιστήμες', 3),
  ('first_gen_low_income',        'First-generation or low-income students',        'Πρώτης γενιάς / χαμηλού εισοδήματος',        4),
  ('disabilities_neurodivergent', 'Students with disabilities or neurodivergent students', 'Φοιτητές με αναπηρία/νευροδιαφορετικότητα', 5),
  ('international_students',      'International students',                        'Διεθνείς φοιτητές',                           6),
  ('refugees_migrant',            'Refugees, displaced students, or migrant-background students', 'Πρόσφυγες / εκτοπισμένοι / μεταναστευτικό υπόβαθρο', 7),
  ('ethnic_racial_indigenous',    'Ethnic, racial, or Indigenous minorities',       'Εθνοτικές/φυλετικές/αυτόχθονες μειονότητες', 8),
  ('lgbtq',                       'LGBTQ+ students',                                'ΛΟΑΤΚΙ+ φοιτητές',                            9),
  ('young_researchers',           'Young researchers',                              'Νέοι ερευνητές',                             10),
  ('student_founders',            'Student founders',                               'Φοιτητές ιδρυτές επιχειρήσεων',              11),
  ('rural_remote',                'Rural or remote-community students',             'Αγροτικές/απομακρυσμένες κοινότητες',        12),
  ('other_specific_community',    'Another specific community',                     'Άλλη συγκεκριμένη κοινότητα',                13),
  ('no_particular_group',         'No particular group mentioned',                  'Χωρίς συγκεκριμένη ομάδα',                   14),
  ('not_sure_audience',           'Not sure',                                       'Άγνωστο',                                     15);

insert into funding_feature (id, label_en, label_el, sort_order) values
  ('free_to_apply',               'Free to apply',                       'Δωρεάν αίτηση',                        1),
  ('application_fee_required',    'Application fee required',            'Απαιτείται τέλος αίτησης',            2),
  ('free_to_participate',         'Free to participate',                 'Δωρεάν συμμετοχή',                    3),
  ('participation_fee_required',  'Participation fee required',          'Απαιτείται τέλος συμμετοχής',        4),
  ('full_funding_available',      'Full funding available',              'Πλήρης χρηματοδότηση',                5),
  ('partial_funding_available',   'Partial funding available',           'Μερική χρηματοδότηση',                6),
  ('scholarships_fee_waivers',    'Scholarships or fee waivers available', 'Υποτροφίες / απαλλαγή τελών',      7),
  ('travel_covered',              'Travel covered or reimbursed',        'Κάλυψη/επιστροφή εξόδων ταξιδιού',    8),
  ('accommodation_covered',       'Accommodation covered or provided',   'Κάλυψη διαμονής',                      9),
  ('meals_covered',               'Meals covered or provided',           'Κάλυψη γευμάτων',                     10),
  ('stipend_or_salary',           'Stipend or salary provided',          'Υποτροφία διαβίωσης / μισθός',       11),
  ('prize_money',                 'Prize money available',               'Χρηματικό έπαθλο',                    12),
  ('visa_support',                'Visa support available',              'Υποστήριξη βίζας',                    13),
  ('accessibility_support',       'Accessibility support or accommodations available', 'Υποστήριξη προσβασιμότητας', 14),
  ('funding_not_stated',          'Funding information is not stated',   'Δεν αναφέρεται χρηματοδότηση',       15),
  ('other_mixed_funding',         'Other or mixed arrangement',          'Άλλο / μικτή ρύθμιση',                16);

-- reattach the test opportunity to the new field taxonomy
insert into opportunity_field (opportunity_id, field_id)
select id, 'computer_science_ai' from opportunity where title = 'Test Fellowship 2027';
