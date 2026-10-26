-- CoPED PULSE - Database Cleanup Script for Testing & Demonstration Video
-- Target: PostgreSQL (coped_pulse)

BEGIN;

-- 1. Remove draft dummy course 'testing' and any child relations
DELETE FROM assessments WHERE course_id IN (SELECT id FROM courses WHERE title = 'testing' AND status = 'draft');
DELETE FROM course_messages WHERE course_id IN (SELECT id FROM courses WHERE title = 'testing' AND status = 'draft');
DELETE FROM enrollments WHERE course_id IN (SELECT id FROM courses WHERE title = 'testing' AND status = 'draft');
DELETE FROM lessons WHERE module_id IN (SELECT id FROM modules WHERE course_id IN (SELECT id FROM courses WHERE title = 'testing' AND status = 'draft'));
DELETE FROM modules WHERE course_id IN (SELECT id FROM courses WHERE title = 'testing' AND status = 'draft');
DELETE FROM courses WHERE title = 'testing' AND status = 'draft';

-- 2. Remove ghost 'Untitled Module' records and their child relations
DELETE FROM lessons WHERE module_id IN (SELECT id FROM modules WHERE title = 'Untitled Module');
DELETE FROM assessments WHERE module_id IN (SELECT id FROM modules WHERE title = 'Untitled Module');
DELETE FROM module_completions WHERE module_id IN (SELECT id FROM modules WHERE title = 'Untitled Module');
DELETE FROM module_user WHERE module_id IN (SELECT id FROM modules WHERE title = 'Untitled Module');
DELETE FROM modules WHERE title = 'Untitled Module';

-- 3. Remove placeholder user 'salman@dummy.com' and associated test data
DELETE FROM enrollments WHERE user_id IN (SELECT id FROM users WHERE email = 'salman@dummy.com');
DELETE FROM course_messages WHERE sender_id IN (SELECT id FROM users WHERE email = 'salman@dummy.com') OR recipient_id IN (SELECT id FROM users WHERE email = 'salman@dummy.com');
DELETE FROM module_completions WHERE user_id IN (SELECT id FROM users WHERE email = 'salman@dummy.com');
DELETE FROM module_user WHERE user_id IN (SELECT id FROM users WHERE email = 'salman@dummy.com');
DELETE FROM users WHERE email = 'salman@dummy.com';

-- 4. Clean up spammy/duplicate/test chat messages
DELETE FROM course_messages WHERE 
    body LIKE '%automatic WhatsApp%' 
    OR body LIKE '%automatic reply%'
    OR body = 'testing'
    OR body = 'hi abbas'
    OR body = 'hi dr lia ?';

-- 5. Seed authentic, realistic instructor-student exchanges per demo course
-- Course 1: Keselamatan Siber & Perlindungan Data Maritim Lanjutan (JLM)
INSERT INTO course_messages (course_id, sender_id, recipient_id, body, created_at, updated_at)
VALUES 
(1, 3, 1, 'Salam Dr. Irdina, untuk topik VTS ini adakah kita perlu rujuk garis panduan IMO MSC 2026?', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(1, 1, 3, 'Waalaikumsalam Abbas. Ya betul, sila rujuk lampiran PDF dalam modul 1 bahagian rujukan standard antarabangsa.', NOW() - INTERVAL '1 day 22 hours', NOW() - INTERVAL '1 day 22 hours');

-- Course 2: Intro to Ai
INSERT INTO course_messages (course_id, sender_id, recipient_id, body, created_at, updated_at)
VALUES 
(2, 1, NULL, '[Announcement] Selamat datang ke Intro to AI! Sila lengkapkan Chapter 1 & 2 sebelum sesi hands-on makmal.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(2, 3, 1, 'Dr. Irdina, saya telah selesai kuiz akhir dan berjaya jana Sijil Tamat Kursus. Terima kasih atas modul yang interaktif ini!', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(2, 1, 3, 'Tahniah Abbas atas pencapaian cemerlang 100%! Sijil anda kini telah disahkan secara rasmi dalam pangkalan data UUM CoPED.', NOW() - INTERVAL '18 hours', NOW() - INTERVAL '18 hours');

-- Course 3: Child Protection Fundamentals
INSERT INTO course_messages (course_id, sender_id, recipient_id, body, created_at, updated_at)
VALUES 
(3, 3, 4, 'Hi Dr. Noor, is the UNCRC reporting protocol applicable for cross-border humanitarian cases?', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
(3, 4, 3, 'Yes Abbas, Unit 2 covers multi-agency referral pathways including cross-border UNHCR standards.', NOW() - INTERVAL '3 days 18 hours', NOW() - INTERVAL '3 days 18 hours');

-- Course 8: Pengurusan Projek Profesional (CAPM® Exam Preparation)
INSERT INTO course_messages (course_id, sender_id, recipient_id, body, created_at, updated_at)
VALUES 
(8, 3, 1, 'Salam Dr. Irdina, saya sudah sertai WhatsApp group kohort melalui pautan di portal. Bilakah tarikh semakan mock exam CAPM?', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(8, 1, 3, 'Waalaikumsalam Abbas. Sesi mock exam akan diadakan pada hari Sabtu jam 10:00 pagi secara dalam talian. Nota persediaan ada di Modul 3.', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours');

COMMIT;
