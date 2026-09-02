-- 1. Bootstrap: first ever signup becomes super_admin
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_bootstrap_admin ON auth.users;
CREATE TRIGGER on_auth_user_bootstrap_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_admin();

-- 2. Site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('school_name', 'Happy Kids Junior School'),
  ('tagline', 'Where bright beginnings become brilliant futures'),
  ('phone', '+263 242 555 0100'),
  ('email', 'hello@happykidsjunior.school'),
  ('address', '14 Chestnut Avenue, Northgate, Harare')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. Academic structure
INSERT INTO public.academic_years (name, starts_on, ends_on, is_active)
VALUES ('2026 Academic Year', '2026-01-12', '2026-12-04', true)
ON CONFLICT DO NOTHING;

WITH ay AS (SELECT id FROM public.academic_years ORDER BY is_active DESC, starts_on DESC LIMIT 1)
INSERT INTO public.terms (academic_year_id, name, starts_on, ends_on, is_active, sort_order)
SELECT ay.id, t.name, t.s::date, t.e::date, t.act, t.so FROM ay,
(VALUES ('Term 1','2026-01-12','2026-04-03',false,1),
        ('Term 2','2026-05-04','2026-08-07',true,2),
        ('Term 3','2026-09-07','2026-12-04',false,3)) AS t(name,s,e,act,so)
WHERE NOT EXISTS (SELECT 1 FROM public.terms);

INSERT INTO public.departments (name, code, description) VALUES
  ('Early Years', 'EY', 'Reception and pre-primary learning'),
  ('Lower Primary', 'LP', 'Grades 1 to 3'),
  ('Upper Primary', 'UP', 'Grades 4 to 7'),
  ('Creative Arts', 'CA', 'Art, music and drama'),
  ('Sport and Wellbeing', 'SW', 'Physical education and pastoral care')
ON CONFLICT DO NOTHING;

INSERT INTO public.grade_levels (code, name, min_age, max_age, capacity, sort_order, is_active) VALUES
  ('ECD-A', 'ECD A', 3, 4, 40, 1, true),
  ('ECD-B', 'ECD B', 4, 5, 40, 2, true),
  ('G1', 'Grade 1', 5, 6, 60, 3, true),
  ('G2', 'Grade 2', 6, 7, 60, 4, true),
  ('G3', 'Grade 3', 7, 8, 60, 5, true),
  ('G4', 'Grade 4', 8, 9, 60, 6, true),
  ('G5', 'Grade 5', 9, 10, 60, 7, true),
  ('G6', 'Grade 6', 10, 11, 60, 8, true),
  ('G7', 'Grade 7', 11, 12, 60, 9, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.subjects (code, name, description, academic_level, sort_order, is_active) VALUES
  ('ENG', 'English Language', 'Reading, writing, speaking and listening', 'primary', 1, true),
  ('MAT', 'Mathematics', 'Number, shape, measure and problem solving', 'primary', 2, true),
  ('SCI', 'Science and Technology', 'Enquiry led science and simple technology', 'primary', 3, true),
  ('SOC', 'Social Studies', 'Community, geography and history', 'primary', 4, true),
  ('ICT', 'Computing', 'Digital literacy, coding and online safety', 'primary', 5, true),
  ('ART', 'Visual Arts', 'Drawing, painting and craft', 'primary', 6, true),
  ('MUS', 'Music', 'Singing, rhythm and instruments', 'primary', 7, true),
  ('PE', 'Physical Education', 'Movement, games and athletics', 'primary', 8, true),
  ('FRN', 'French', 'Introductory conversational French', 'primary', 9, true),
  ('SHO', 'Shona', 'Home language and culture', 'primary', 10, true)
ON CONFLICT DO NOTHING;

-- 4. Public staff profiles
INSERT INTO public.staff_members (full_name, role_title, department, bio, email, sort_order, is_published) VALUES
  ('Dr Naomi Chikore', 'Head Teacher', 'Leadership', 'Naomi has led Happy Kids Junior School for nine years and champions joyful, rigorous early learning.', 'head@happykidsjunior.school', 1, true),
  ('Mr Tafara Moyo', 'Deputy Head, Academics', 'Leadership', 'Tafara oversees curriculum design and teacher development across all grades.', 'deputy@happykidsjunior.school', 2, true),
  ('Mrs Grace Bello', 'Head of Early Years', 'Early Years', 'Grace specialises in play based learning and school readiness.', 'earlyyears@happykidsjunior.school', 3, true),
  ('Ms Aisha Patel', 'Lead Teacher, Lower Primary', 'Lower Primary', 'Aisha leads our phonics and early numeracy programme.', 'lowerprimary@happykidsjunior.school', 4, true),
  ('Mr Daniel Okonkwo', 'Lead Teacher, Upper Primary', 'Upper Primary', 'Daniel prepares pupils for a confident move to secondary school.', 'upperprimary@happykidsjunior.school', 5, true),
  ('Mrs Rudo Nyathi', 'Head of Creative Arts', 'Creative Arts', 'Rudo runs our studio, choir and annual production.', 'arts@happykidsjunior.school', 6, true),
  ('Mr Kevin Dube', 'Head of Sport', 'Sport and Wellbeing', 'Kevin coaches athletics, swimming and mini rugby.', 'sport@happykidsjunior.school', 7, true),
  ('Mrs Linda Sibanda', 'Admissions Registrar', 'Administration', 'Linda guides every family through the admissions journey.', 'admissions@happykidsjunior.school', 8, true),
  ('Mr Peter Ncube', 'Finance Officer', 'Administration', 'Peter manages fees, invoicing and family payment plans.', 'finance@happykidsjunior.school', 9, true),
  ('Ms Chiedza Mutasa', 'School Counsellor', 'Sport and Wellbeing', 'Chiedza supports pupil wellbeing and family partnership.', 'wellbeing@happykidsjunior.school', 10, true)
ON CONFLICT DO NOTHING;

-- 5. Internal staff records
INSERT INTO public.staff (staff_no, full_name, position, email, phone, employment_status, is_active, department_id)
SELECT s.no, s.nm, s.pos, s.em, s.ph, 'permanent', true,
       (SELECT id FROM public.departments WHERE name = s.dept)
FROM (VALUES
  ('HKJS-001','Dr Naomi Chikore','Head Teacher','head@happykidsjunior.school','+263 242 555 0101','Leadership'),
  ('HKJS-002','Mr Tafara Moyo','Deputy Head','deputy@happykidsjunior.school','+263 242 555 0102','Upper Primary'),
  ('HKJS-003','Mrs Grace Bello','Head of Early Years','earlyyears@happykidsjunior.school','+263 242 555 0103','Early Years'),
  ('HKJS-004','Ms Aisha Patel','Class Teacher','aisha@happykidsjunior.school','+263 242 555 0104','Lower Primary'),
  ('HKJS-005','Mr Daniel Okonkwo','Class Teacher','daniel@happykidsjunior.school','+263 242 555 0105','Upper Primary'),
  ('HKJS-006','Mrs Rudo Nyathi','Arts Teacher','rudo@happykidsjunior.school','+263 242 555 0106','Creative Arts'),
  ('HKJS-007','Mr Kevin Dube','Sports Coach','kevin@happykidsjunior.school','+263 242 555 0107','Sport and Wellbeing'),
  ('HKJS-008','Mrs Linda Sibanda','Registrar','admissions@happykidsjunior.school','+263 242 555 0108','Administration'),
  ('HKJS-009','Mr Peter Ncube','Finance Officer','finance@happykidsjunior.school','+263 242 555 0109','Administration'),
  ('HKJS-010','Ms Chiedza Mutasa','Counsellor','wellbeing@happykidsjunior.school','+263 242 555 0110','Sport and Wellbeing')
) AS s(no,nm,pos,em,ph,dept)
WHERE NOT EXISTS (SELECT 1 FROM public.staff);

-- 6. Classes
INSERT INTO public.classes (academic_year_id, grade_level_id, name, stream, room, capacity, is_active, class_teacher_id)
SELECT (SELECT id FROM public.academic_years ORDER BY is_active DESC LIMIT 1),
       gl.id, gl.name || c.stream, trim(c.stream), 'Room ' || gl.sort_order || upper(trim(c.stream)), 30, true,
       (SELECT id FROM public.staff ORDER BY staff_no OFFSET (gl.sort_order % 7) LIMIT 1)
FROM public.grade_levels gl CROSS JOIN (VALUES (' A'), (' B')) AS c(stream)
WHERE NOT EXISTS (SELECT 1 FROM public.classes);

-- 7. Programmes
INSERT INTO public.programs (slug, name, level, summary, details, sort_order, is_published) VALUES
  ('early-years', 'Early Years', 'ECD A - ECD B', 'A gentle, play rich start where curiosity, language and confidence grow every day.', 'Our Early Years rooms blend structured phonics and number work with free play, outdoor discovery, music and story time. Small groups mean every child is known well.', 1, true),
  ('lower-primary', 'Lower Primary', 'Grade 1 - Grade 3', 'Strong foundations in reading, writing and mathematics with plenty of joy.', 'Daily guided reading, mastery mathematics, weekly science enquiry, French, computing and swimming. Reading fluency is tracked termly and shared with families.', 2, true),
  ('upper-primary', 'Upper Primary', 'Grade 4 - Grade 7', 'Deeper thinking, leadership and confident preparation for secondary school.', 'Specialist teaching in science, computing, languages and the arts, plus a leadership programme, debating, coding club and a full sporting calendar.', 3, true),
  ('creative-arts', 'Creative Arts', 'All grades', 'Studio art, choir, instruments and an annual whole school production.', 'Every child paints, sings and performs. Instrumental tuition is available in piano, violin, marimba and guitar.', 4, true),
  ('sport-wellbeing', 'Sport and Wellbeing', 'All grades', 'Movement every day, plus pastoral care that puts children first.', 'Athletics, swimming, mini rugby, netball, football and yoga, supported by a school counsellor and a structured wellbeing curriculum.', 5, true),
  ('after-school', 'After School Club', 'All grades', 'Safe, warm and busy care until 17:30 with homework support and clubs.', 'Includes a hot snack, supervised homework time and a rotating club programme of chess, coding, dance, gardening and craft.', 6, true)
ON CONFLICT DO NOTHING;

-- 8. Pages
INSERT INTO public.pages (slug, title, subtitle, body, is_published) VALUES
  ('about', 'About Happy Kids Junior School', 'A warm, ambitious junior school for children aged 3 to 12', 'Happy Kids Junior School was founded on a simple belief: children learn best when they feel safe, known and delighted. Our campus is purpose built for young learners, with light filled classrooms, a dedicated reading house, an art studio, science room and generous outdoor space. Class sizes are deliberately small so every child is taught, not just timetabled.', true),
  ('mission', 'Our Mission and Values', 'Kindness, curiosity and courage', 'We grow children who are kind to others, curious about the world and courageous in their learning. Our values shape everything from how lessons are planned to how playtime is supervised.', true),
  ('admissions-guide', 'Admissions Guide', 'How to join our school community', 'Applications open twice a year. Families complete an online form, upload a birth certificate and previous reports, attend a friendly familiarisation morning and then receive an offer. Places are limited and are allocated in the order applications are completed.', true)
ON CONFLICT DO NOTHING;

-- 9. Announcements
INSERT INTO public.announcements (message, importance, is_active, starts_at) VALUES
  ('Applications for the 2027 intake are now open - limited places per grade.', 'high', true, now() - interval '3 days'),
  ('Term 2 parent consultation evenings run from 14 to 18 September.', 'normal', true, now() - interval '1 day')
ON CONFLICT DO NOTHING;

-- 10. News
INSERT INTO public.news_posts (slug, title, excerpt, body, category, author_name, published_at, is_published) VALUES
  ('reading-house-opens', 'Our new Reading House opens its doors', 'A dedicated reading space with more than four thousand titles is now open to every class.', 'After a year of planning and generous family support, the Reading House opened this month. The space includes a story nook, quiet reading pods and a lending desk run by our Grade 7 librarians. Every class now visits twice a week, and books may be borrowed overnight.', 'Campus', 'Dr Naomi Chikore', now() - interval '5 days', true),
  ('junior-science-fair', 'Junior Science Fair sparks big ideas', 'Ninety pupils presented investigations from water filtration to solar ovens.', 'Our annual Junior Science Fair filled the hall with bubbling experiments and confident young scientists. Judges praised the quality of questioning and the clarity of the display boards. Overall honours went to a Grade 5 team for a study of rainwater harvesting on our own roof.', 'Academics', 'Mr Tafara Moyo', now() - interval '12 days', true),
  ('choir-national-final', 'Choir reaches the national final', 'Forty two voices earned a standing ovation at the regional round.', 'Our junior choir performed two pieces in the regional round and placed first, qualifying for the national final in October. Rehearsals now run twice weekly and families are warmly invited to the send off concert.', 'Arts', 'Mrs Rudo Nyathi', now() - interval '20 days', true),
  ('swimming-gala-results', 'Swimming gala breaks three records', 'A brilliant afternoon in the pool with personal bests across every grade.', 'The inter house swimming gala produced three new school records and, more importantly, a huge number of first time racers. Thank you to every parent who cheered from the stands.', 'Sport', 'Mr Kevin Dube', now() - interval '28 days', true),
  ('phonics-results-rise', 'Phonics screening results rise again', 'Ninety four percent of Grade 1 pupils met the expected standard.', 'Our structured phonics programme continues to deliver. Ninety four percent of Grade 1 pupils met the expected standard this term, up from eighty eight percent last year. Small group interventions run daily for any child who needs extra practice.', 'Academics', 'Ms Aisha Patel', now() - interval '40 days', true),
  ('garden-project', 'Pupils plant the new kitchen garden', 'Every class now tends a raised bed of herbs and vegetables.', 'The kitchen garden project links science, geography and healthy eating. Produce is used in the school kitchen and surplus goes home with families on Fridays.', 'Campus', 'Mrs Grace Bello', now() - interval '55 days', true)
ON CONFLICT DO NOTHING;

-- 11. Events
INSERT INTO public.events (slug, title, description, location, starts_at, ends_at, is_published) VALUES
  ('open-morning-october', 'Open Morning', 'Tour the campus, meet teachers and see lessons in action. Booking recommended.', 'Main Reception', now() + interval '9 days', now() + interval '9 days 3 hours', true),
  ('grandparents-day', 'Grandparents Day', 'A morning of songs, storytelling and shared tea with our extended families.', 'School Hall', now() + interval '21 days', now() + interval '21 days 4 hours', true),
  ('inter-house-athletics', 'Inter House Athletics', 'Track and field events for every grade, followed by a family picnic.', 'Sports Field', now() + interval '34 days', now() + interval '34 days 6 hours', true),
  ('choir-national-final-event', 'Choir National Final', 'Come and support our junior choir at the national final.', 'National Arts Centre', now() + interval '48 days', now() + interval '48 days 5 hours', true),
  ('parent-consultations', 'Parent Consultation Evenings', 'Fifteen minute appointments with your child''s class teacher.', 'Classrooms', now() + interval '12 days', now() + interval '16 days', true),
  ('spring-production', 'Whole School Production', 'Our annual musical, performed by every child in the school.', 'School Hall', now() + interval '70 days', now() + interval '70 days 3 hours', true),
  ('past-founders-day', 'Founders Day Assembly', 'A celebration of the school''s founding and our values.', 'School Hall', now() - interval '25 days', now() - interval '25 days' + interval '2 hours', true)
ON CONFLICT DO NOTHING;

-- 12. Gallery
INSERT INTO public.gallery_albums (slug, title, description, sort_order, is_published) VALUES
  ('campus-life', 'Campus Life', 'Everyday moments around our light filled campus.', 1, true),
  ('classrooms', 'In the Classroom', 'Learning in action across every grade.', 2, true),
  ('arts-and-music', 'Arts and Music', 'Studio work, choir rehearsals and performances.', 3, true),
  ('sport-and-play', 'Sport and Play', 'Playground energy, gala days and team sport.', 4, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.gallery_images (album_id, image_url, caption, alt_text, sort_order)
SELECT a.id, i.url, i.cap, i.alt, i.so
FROM public.gallery_albums a
JOIN (VALUES
  ('campus-life','/gallery/campus-1.jpg','Morning light on the front lawn','School building and lawn at sunrise',1),
  ('campus-life','/gallery/campus-2.jpg','The Reading House','Children reading in the library nook',2),
  ('classrooms','/gallery/class-1.jpg','Grade 3 enquiry lesson','Children working at colourful classroom tables',1),
  ('classrooms','/gallery/class-2.jpg','Early Years story circle','Young children listening to a story',2),
  ('arts-and-music','/gallery/arts-1.jpg','Studio painting session','Child painting at an easel',1),
  ('sport-and-play','/gallery/play-1.jpg','Break time on the playground','Children running on a colourful playground',1)
) AS i(slug,url,cap,alt,so) ON i.slug = a.slug
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_images);

-- 13. Admissions period
INSERT INTO public.admissions_periods (name, academic_year, opens_at, closes_at, application_fee_cents, currency, instructions, is_active)
SELECT '2027 Intake', '2027', now() - interval '10 days', now() + interval '80 days', 5000, 'USD',
       'Complete every section, upload a birth certificate and the most recent school report, then submit. Our registrar will contact you within five working days.', true
WHERE NOT EXISTS (SELECT 1 FROM public.admissions_periods);

-- 14. Guardians and students
INSERT INTO public.guardians (full_name, email, phone, address, occupation, emergency_contact_name, emergency_contact_phone)
SELECT g.nm, g.em, g.ph, g.ad, g.oc, g.ec, g.ep FROM (VALUES
  ('Tendai Marufu','tendai.marufu@example.com','+263 771 000 101','12 Acacia Close, Northgate','Accountant','Rita Marufu','+263 771 000 102'),
  ('Sarah Banda','sarah.banda@example.com','+263 771 000 103','4 Msasa Lane, Northgate','Nurse','John Banda','+263 771 000 104'),
  ('Michael Ncube','michael.ncube@example.com','+263 771 000 105','88 Baobab Drive, Eastlea','Engineer','Faith Ncube','+263 771 000 106'),
  ('Priya Naidoo','priya.naidoo@example.com','+263 771 000 107','7 Jacaranda Way, Avondale','Pharmacist','Ravi Naidoo','+263 771 000 108'),
  ('Joseph Chirwa','joseph.chirwa@example.com','+263 771 000 109','23 Flame Tree Road, Borrowdale','Teacher','Mary Chirwa','+263 771 000 110'),
  ('Emma Whitfield','emma.whitfield@example.com','+263 771 000 111','56 Cedar Rise, Highlands','Architect','Paul Whitfield','+263 771 000 112'),
  ('Fatima Hassan','fatima.hassan@example.com','+263 771 000 113','9 Olive Grove, Mount Pleasant','Lawyer','Omar Hassan','+263 771 000 114'),
  ('Brian Mutale','brian.mutale@example.com','+263 771 000 115','31 Willow Bend, Greendale','Entrepreneur','Naomi Mutale','+263 771 000 116')
) AS g(nm,em,ph,ad,oc,ec,ep)
WHERE NOT EXISTS (SELECT 1 FROM public.guardians);

INSERT INTO public.students (student_no, first_name, last_name, date_of_birth, gender, nationality, status, admission_date, grade_level_id, current_academic_year_id, current_class_id)
SELECT 'HKJS-STU-' || lpad(row_number() OVER ()::text, 4, '0'), s.fn, s.ln, s.dob::date, s.gen, 'Zimbabwean', s.st::public.student_status, s.adm::date,
  gl.id, (SELECT id FROM public.academic_years ORDER BY is_active DESC LIMIT 1),
  (SELECT c.id FROM public.classes c WHERE c.grade_level_id = gl.id ORDER BY c.name LIMIT 1)
FROM (VALUES
  ('Anesu','Marufu','2018-03-14','female','active','2023-01-10','G3'),
  ('Rufaro','Marufu','2020-07-02','male','active','2025-01-13','ECD-B'),
  ('Chipo','Banda','2016-11-21','female','active','2021-01-11','G5'),
  ('Nathan','Ncube','2015-05-09','male','active','2020-01-13','G6'),
  ('Leah','Ncube','2019-09-30','female','active','2024-01-15','G1'),
  ('Aarav','Naidoo','2017-01-25','male','active','2022-01-10','G4'),
  ('Diya','Naidoo','2021-04-18','female','active','2026-01-12','ECD-A'),
  ('Tanaka','Chirwa','2014-08-05','male','active','2019-01-14','G7'),
  ('Ruvarashe','Chirwa','2018-12-11','female','active','2023-01-10','G2'),
  ('Oliver','Whitfield','2016-02-27','male','active','2021-01-11','G5'),
  ('Amelia','Whitfield','2020-10-08','female','active','2025-01-13','ECD-B'),
  ('Yusuf','Hassan','2017-06-19','male','active','2022-01-10','G4'),
  ('Layla','Hassan','2019-03-03','female','active','2024-01-15','G1'),
  ('Kabelo','Mutale','2015-12-01','male','active','2020-01-13','G6'),
  ('Zoe','Mutale','2018-05-22','female','enrolled','2026-01-12','G3'),
  ('Simba','Marufu','2014-02-16','male','active','2019-01-14','G7'),
  ('Tariro','Banda','2020-01-29','female','active','2025-01-13','ECD-B'),
  ('Ethan','Whitfield','2017-11-07','male','active','2022-01-10','G4'),
  ('Nyasha','Chirwa','2021-08-12','male','enrolled','2026-01-12','ECD-A'),
  ('Bianca','Naidoo','2015-09-15','female','active','2020-01-13','G6')
) AS s(fn,ln,dob,gen,st,adm,grade)
JOIN public.grade_levels gl ON gl.code = s.grade
WHERE NOT EXISTS (SELECT 1 FROM public.students);

INSERT INTO public.parent_student_relationships (guardian_id, student_id, relationship, is_primary, is_emergency_contact, can_pickup)
SELECT g.id, st.id, 'guardian'::public.guardian_relationship, true, true, true
FROM public.students st
JOIN public.guardians g ON g.full_name LIKE '%' || st.last_name
WHERE NOT EXISTS (SELECT 1 FROM public.parent_student_relationships)
ON CONFLICT DO NOTHING;

INSERT INTO public.enrollments (student_id, academic_year_id, grade_level_id, class_id, stage, start_date)
SELECT st.id, st.current_academic_year_id, st.grade_level_id, st.current_class_id,
       CASE WHEN st.status = 'active' THEN 'active'::public.enrollment_stage ELSE 'confirmed'::public.enrollment_stage END,
       st.admission_date
FROM public.students st
WHERE NOT EXISTS (SELECT 1 FROM public.enrollments);

-- 15. Attendance for the last 20 school days
INSERT INTO public.attendance_records (student_id, class_id, academic_year_id, attendance_date, status, session_label)
SELECT st.id, st.current_class_id, st.current_academic_year_id, d::date,
  (CASE WHEN random() < 0.93 THEN 'present' WHEN random() < 0.6 THEN 'late' WHEN random() < 0.5 THEN 'excused' ELSE 'absent' END)::public.attendance_status,
  'Morning'
FROM public.students st
CROSS JOIN generate_series(current_date - 27, current_date - 1, interval '1 day') d
WHERE extract(isodow from d) < 6
  AND st.current_class_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.attendance_records);

-- 16. Finance
INSERT INTO public.fee_categories (name, code, description, is_active) VALUES
  ('Tuition', 'TUI', 'Termly tuition fee', true),
  ('Transport', 'TRA', 'Daily bus service', true),
  ('Meals', 'MEA', 'Hot lunch programme', true),
  ('After School Club', 'ASC', 'Extended care until 17:30', true),
  ('Uniform', 'UNI', 'Uniform and kit', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.payment_methods (name, is_active, requires_reference) VALUES
  ('Bank transfer', true, true),
  ('Mobile money', true, true),
  ('Card', true, false),
  ('Cash', true, false)
ON CONFLICT DO NOTHING;

INSERT INTO public.invoices (student_id, guardian_id, academic_year_id, currency, status, issue_date, due_date, notes)
SELECT st.id,
       (SELECT r.guardian_id FROM public.parent_student_relationships r WHERE r.student_id = st.id LIMIT 1),
       st.current_academic_year_id, 'USD', 'issued'::public.invoice_status,
       current_date - 30, current_date + 10, 'Term 2 fees'
FROM public.students st
WHERE NOT EXISTS (SELECT 1 FROM public.invoices);

INSERT INTO public.invoice_items (invoice_id, fee_category_id, description, quantity, unit_amount_cents)
SELECT i.id, fc.id, fc.name || ' - Term 2', 1, fc.amt
FROM public.invoices i
JOIN (SELECT id, name, CASE code WHEN 'TUI' THEN 95000 WHEN 'MEA' THEN 18000 WHEN 'TRA' THEN 14000 ELSE 9000 END amt, code
      FROM public.fee_categories WHERE code IN ('TUI','MEA','TRA')) fc ON true
WHERE NOT EXISTS (SELECT 1 FROM public.invoice_items);

INSERT INTO public.payments (student_id, invoice_id, amount_cents, currency, payment_date, provider, transaction_reference, verified, notes)
SELECT i.student_id, i.id,
       CASE WHEN random() < 0.45 THEN i.total_cents ELSE (i.total_cents * 0.5)::int END,
       'USD', current_date - (random() * 20)::int, 'Bank transfer',
       'TXN-' || upper(substr(md5(i.id::text), 1, 8)), true, 'Term 2 payment'
FROM public.invoices i
WHERE random() < 0.75
  AND NOT EXISTS (SELECT 1 FROM public.payments);

-- 17. Contact messages
INSERT INTO public.contact_messages (name, email, phone, subject, message, is_handled) VALUES
  ('Ruth Chibanda','ruth.chibanda@example.com','+263 772 111 222','Grade 1 availability','Good morning, do you still have places in Grade 1 for the 2027 intake? We live in Northgate.', false),
  ('Kudzai Mhlanga','kudzai.mhlanga@example.com','+263 772 333 444','Bus route','Please could you send the bus route map and the transport fee for Borrowdale.', false),
  ('Helen Roberts','helen.roberts@example.com','+263 772 555 666','Open morning','We would like to attend the next open morning with our two children.', true),
  ('Samuel Dziva','samuel.dziva@example.com','+263 772 777 888','After school club','What time does the after school club finish and is a snack included?', false)
ON CONFLICT DO NOTHING;