<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $staffA = User::where('email', 'instruct@gmail.com')->first()
            ?? User::where('role', 'staff')->first()
            ?? User::first();

        if (! $staffA) {
            $staffA = User::factory()->staff()->create([
                'email' => 'instruct@gmail.com',
                'name' => 'Default Instructor',
            ]);
        }

        $staffB = User::where('email', 'instructor@coped.org')->first()
            ?? $staffA;

        $staffId = $staffA->id;
        $staffBId = $staffB ? $staffB->id : $staffId;

        // -------------------------------------------------------------
        // 1. Enhanced Maritime Cyber Security (JLM) - Flagship Commercial
        // -------------------------------------------------------------
        $maritimeCourse = Course::updateOrCreate(
            ['title' => 'Keselamatan Siber & Perlindungan Data Maritim Lanjutan (JLM)'],
            [
                'description' => 'Modul interaktif khas untuk warga Jabatan Laut Malaysia bagi mengenalpasti ancaman siber maritim, keselamatan sistem navigasi, dan perlindungan data rasmi.',
                'instructor_id' => $staffId,
                'status' => 'published',
                'academic_year' => '2026 / 2027 · Intake 1',
                'category_logo' => 'maritime',
                'billing_type' => 'subscription',
                'price' => 150.00,
                'cert_title' => 'JLM Pelaut & Pegawai Operasi Maritim Certified',
                'cert_url' => 'https://www.marine.gov.my',
                'bundle_title' => 'Complete Maritime Training & SOP Bundle (PDF + Slides + Logbook)',
                'bundle_url' => 'https://drive.google.com/drive/folders/coped-maritime-bundle-demo',
            ]
        );

        $m1 = $maritimeCourse->modules()->updateOrCreate(
            ['course_id' => $maritimeCourse->id, 'order' => 1],
            [
                'title' => 'Topik 1: Ancaman Siber Terhadap Sistem Maritim & VTS',
                'description' => 'Ketahui risiko serangan ke atas Sistem Pengurusan Trafik Vab (VTS), GPS Spoofing, dan percubaan pencerobohan pangkalan data pelabuhan.',
                'content_type' => 'link',
                'media_url' => 'https://www.imo.org/en/OurWork/Security/Pages/Cyber-security.aspx',
            ]
        );
        $m1->lessons()->updateOrCreate(
            ['module_id' => $m1->id, 'order' => 1],
            [
                'title' => 'Subtopik 1.1: Pengenalan kepada VTS & Kerentanan Rangkaian',
                'content_type' => 'link',
                'content_url' => 'https://www.imo.org/en/OurWork/Security/Pages/Cyber-security.aspx',
            ]
        );

        $m2 = $maritimeCourse->modules()->updateOrCreate(
            ['course_id' => $maritimeCourse->id, 'order' => 2],
            [
                'title' => 'Topik 2: Keselamatan Emel & Serangan Phishing Sasaran',
                'description' => 'Teknik mengenalpasti e-mel palsu yang menyamar sebagai pihak pengurusan tertinggi JLM atau agensi antarabangsa IMO.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=YfiN_W8I1cE',
            ]
        );
        $m2->lessons()->updateOrCreate(
            ['module_id' => $m2->id, 'order' => 1],
            [
                'title' => 'Subtopik 2.1: Analisis Header Emel & Domain Palsu',
                'content_type' => 'link',
                'content_url' => 'https://www.youtube.com/watch?v=YfiN_W8I1cE',
            ]
        );

        $m3 = $maritimeCourse->modules()->updateOrCreate(
            ['course_id' => $maritimeCourse->id, 'order' => 3],
            [
                'title' => 'Topik 3: Protokol Tindak Balas Insiden & Pelaporan Rasmi',
                'description' => 'Langkah pantas apabila mengesyaki berlakunya ketirisan data sulit perkapalan atau jangkitan perisian tebusan (ransomware).',
                'content_type' => 'link',
                'media_url' => 'https://www.cisa.gov/topics/cyber-threats-and-advisories/incident-response',
            ]
        );
        $m3->lessons()->updateOrCreate(
            ['module_id' => $m3->id, 'order' => 1],
            [
                'title' => 'Subtopik 3.1: Pelan Pengasingan Peranti (Network Air-Gapping)',
                'content_type' => 'link',
                'content_url' => 'https://www.cisa.gov/topics/cyber-threats-and-advisories/incident-response',
            ]
        );

        if ($maritimeCourse->assessments()->count() === 0) {
            $maritimeCourse->assessments()->create([
                'question' => 'Anda menerima arahan mendesak melalui e-mel daripada "Ketua Pengarah" yang meminta kata laluan akses sistem VTS dikongsikan segera untuk audit kilat. Apakah tindakan paling selamat?',
                'option_a' => 'Terus berikan kata laluan kerana arahan datang dari pihak atasan',
                'option_b' => 'Abaikan e-mel tersebut dan sahkan kesahihan arahan melalui saluran komunikasi rasmi jabatan',
                'option_c' => 'Salin kata laluan dan hantar melalui aplikasi mesej peribadi',
                'option_d' => 'Padam e-mel dan biarkan tanpa sebarang laporan',
                'correct_option' => 'b',
            ]);

            $maritimeCourse->assessments()->create([
                'question' => 'Semasa memantau pergerakan kapal, sistem navigasi menunjukkan bacaan koordinat GPS yang mencurigakan dan bercanggah dengan radar fizikal. Apakah kemungkinan besar ancaman siber ini?',
                'option_a' => 'Kegagalan bateri biasa',
                'option_b' => 'Serangan GPS Spoofing (Pemalsuan Isyarat)',
                'option_c' => 'Kerosakan tetikus komputer',
                'option_d' => 'Ketiadaan sambungan Wi-Fi pejabat',
                'correct_option' => 'b',
            ]);

            $maritimeCourse->assessments()->create([
                'question' => 'Mengapakah pematuhan terhadap garis panduan keselamatan data maritim antarabangsa (seperti piawaian IMO) penting bagi Jabatan Laut Malaysia?',
                'option_a' => 'Untuk melengkapkan syarat kertas kerja dalaman sahaja',
                'option_b' => 'Melindungi infrastruktur kritikal negara dan memastikan keselamatan rantai bekalan pelabuhan',
                'option_c' => 'Membolehkan perkongsian maklumat bebas di media sosial',
                'option_d' => 'Mengurangkan kos penyelenggaraan komputer pejabat',
                'correct_option' => 'b',
            ]);

            $maritimeCourse->assessments()->create([
                'question' => 'Seorang rakan sekerja meninggalkan komputer skrin terbuka tanpa kunci semasa keluar rehat di pejabat operasi. Apakah risiko keselamatan yang boleh berlaku?',
                'option_a' => 'Komputer akan menjadi perlahan',
                'option_b' => 'Individu tidak berkenaan boleh mengakses data sulit pelantar atau dokumen penguatkuasaan maritim',
                'option_c' => 'Bateri komputer akan cepat rosak',
                'option_d' => 'Sistem penyejukan pejabat akan terganggu',
                'correct_option' => 'b',
            ]);

            $maritimeCourse->assessments()->create([
                'question' => 'Apakah langkah pertama yang WAJIB diambil jika skrin komputer pejabat tiba-tiba memaparkan mesej sekatan fail akibat serangan ransomware?',
                'option_a' => 'Tutup suis utama komputer dan terus hubungi Pasukan Tindak Balas Insiden ICT (IT Security)',
                'option_b' => 'Cuba bayar wang tebusan menggunakan kad kredit peribadi',
                'option_c' => 'Biarkan komputer menyala sehingga fail pulih sendiri',
                'option_d' => 'Format sendiri cakera keras komputer tanpa maklumkan kepada sesiapa',
                'correct_option' => 'a',
            ]);
        }

        // -------------------------------------------------------------
        // 2. Pengurusan Projek Profesional (CAPM® Exam Preparation) - Flagship Certification
        // -------------------------------------------------------------
        $capmCourse = Course::updateOrCreate(
            ['title' => 'Pengurusan Projek Profesional (CAPM® Exam Preparation)'],
            [
                'description' => 'Program persediaan pensijilan antarabangsa Certified Associate in Project Management (CAPM)® berpandukan PMBOK® Guide edisi terkini untuk pengurus projek dan pentadbir industri.',
                'instructor_id' => $staffId,
                'status' => 'published',
                'academic_year' => '2026 / 2027 · Cohort 1',
                'category_logo' => 'capm',
                'billing_type' => 'subscription',
                'price' => 199.00,
                'cert_title' => 'CAPM® · Certified Associate in Project Management',
                'cert_url' => 'https://www.pmi.org/certifications/certified-associate-capm',
                'bundle_title' => 'PMI-CAPM® Complete Study Kit & Practice Exam Simulation Pack',
                'bundle_url' => 'https://drive.google.com/drive/folders/coped-capm-study-kit-demo',
            ]
        );

        $capm1 = $capmCourse->modules()->updateOrCreate(
            ['course_id' => $capmCourse->id, 'order' => 1],
            [
                'title' => 'Modul 1: Kerangka Pengurusan Projek & Domain Prestasi PMBOK®',
                'description' => 'Pengenalan kepada kitaran hayat projek, peranan pengurus projek, dan domain prestasi projek berpandukan standard global PMI.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=Wg7575ZVxxg',
            ]
        );
        $capm1->lessons()->updateOrCreate(
            ['module_id' => $capm1->id, 'order' => 1],
            [
                'title' => 'Subtopik 1.1: Asas Metodologi Projek & Kod Etika PMI',
                'content_type' => 'link',
                'content_url' => 'https://www.youtube.com/watch?v=Wg7575ZVxxg',
            ]
        );

        $capm2 = $capmCourse->modules()->updateOrCreate(
            ['course_id' => $capmCourse->id, 'order' => 2],
            [
                'title' => 'Modul 2: Pendekatan Pembangunan & Prinsip Agile/Hibrid',
                'description' => 'Memahami perbezaan antara pendekatan prediktif (waterfall), adaptif (Agile, Scrum), dan hibrid dalam mengurus skop dan jadual projek.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=YP_ZcGdlbH0',
            ]
        );
        $capm2->lessons()->updateOrCreate(
            ['module_id' => $capm2->id, 'order' => 1],
            [
                'title' => 'Subtopik 2.1: Upacara Scrum & Peranan Product Owner / Scrum Master',
                'content_type' => 'link',
                'content_url' => 'https://www.youtube.com/watch?v=YP_ZcGdlbH0',
            ]
        );

        $capm3 = $capmCourse->modules()->updateOrCreate(
            ['course_id' => $capmCourse->id, 'order' => 3],
            [
                'title' => 'Modul 3: Pengurusan Risiko, Kualiti & Penyerahan Nilai Perniagaan',
                'description' => 'Strategi pengenalpastian risiko awal, analisis impak kualitatif/kuantitatif, dan pengukuran pulangan nilai bagi pihak berkepentingan.',
                'content_type' => 'link',
                'media_url' => 'https://www.pmi.org/certifications/certified-associate-capm',
            ]
        );
        $capm3->lessons()->updateOrCreate(
            ['module_id' => $capm3->id, 'order' => 1],
            [
                'title' => 'Subtopik 3.1: Matriks Penilaian Risiko & Pelan Tindak Balas Mitigasi',
                'content_type' => 'link',
                'content_url' => 'https://www.pmi.org/certifications/certified-associate-capm',
            ]
        );

        if ($capmCourse->assessments()->count() === 0) {
            $capmCourse->assessments()->create([
                'question' => 'Mengikut panduan PMBOK® terkini, apakah perbezaan utama antara pendekatan projek Prediktif (Predictive) dan Adaptif (Agile)?',
                'option_a' => 'Pendekatan adaptif tidak memerlukan sebarang perancangan awal',
                'option_b' => 'Pendekatan prediktif menetapkan skop, masa, dan kos di awal projek, manakala adaptif menyesuaikan skop secara berulang mengikut maklum balas pantas',
                'option_c' => 'Pendekatan prediktif hanya digunakan untuk perisian komputer sahaja',
                'option_d' => 'Pendekatan adaptif tidak membenarkan penglibatan pihak berkepentingan (stakeholders)',
                'correct_option' => 'b',
            ]);

            $capmCourse->assessments()->create([
                'question' => 'Dalam rangka kerja Scrum, siapakah individu yang bertanggungjawab memaksimumkan nilai produk dan menguruskan Product Backlog?',
                'option_a' => 'Scrum Master',
                'option_b' => 'Product Owner',
                'option_c' => 'Pembangun Perisian (Developers)',
                'option_d' => 'Pegawai Kewangan Syarikat',
                'correct_option' => 'b',
            ]);

            $capmCourse->assessments()->create([
                'question' => 'Apakah tujuan utama penyediaan Piagam Projek (Project Charter) pada fasa permulaan projek?',
                'option_a' => 'Mengesahkan kelulusan bajet minit akhir secara tidak rasmi',
                'option_b' => 'Memberi kuasa rasmi kepada Pengurus Projek untuk memulakan projek dan menggunakan sumber organisasi',
                'option_c' => 'Menggantikan keperluan pelan pengurusan risiko',
                'option_d' => 'Menetapkan tarikh cuti tahunan kakitangan',
                'correct_option' => 'b',
            ]);
        }

        // -------------------------------------------------------------
        // 3. Intro to AI (The user's authored course)
        // -------------------------------------------------------------
        $aiCourse = Course::updateOrCreate(
            ['title' => 'Intro to Ai'],
            [
                'description' => 'Fundamental concepts of artificial intelligence, machine learning history, and real-world applications.',
                'instructor_id' => $staffId,
                'status' => 'published',
                'academic_year' => '2026 / 2027',
                'category_logo' => 'ai',
                'billing_type' => 'free',
                'price' => 0.00,
            ]
        );

        $aiCourse->modules()->updateOrCreate(
            ['course_id' => $aiCourse->id, 'order' => 1],
            [
                'title' => 'Chapter 1: Introduction to Artificial Intelligence',
                'description' => 'Fundamental concepts of artificial intelligence, machine learning history, and real-world applications.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=ad79nYk2keg',
            ]
        );

        $aiCourse->modules()->updateOrCreate(
            ['course_id' => $aiCourse->id, 'order' => 2],
            [
                'title' => 'Chapter 2: Applied Generative AI & Google Gemini',
                'description' => 'Core AI paradigms: supervised learning, unsupervised learning, and neural network fundamentals.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=PDMcpthR88U',
            ]
        );

        $aiCourse->modules()->updateOrCreate(
            ['course_id' => $aiCourse->id, 'order' => 3],
            [
                'title' => 'Chapter 3: Neural Networks & Deep Learning Fundamentals',
                'description' => 'Interactive deep learning demonstration, modern LLMs, and ethical considerations in AI.',
                'content_type' => 'embed',
                'media_url' => 'https://www.youtube.com/embed/aircAruvnKk',
            ]
        );

        $aiCourse->assessments()->where('question', 'like', '%fox say%')->delete();

        if ($aiCourse->assessments()->count() < 2) {
            $aiCourse->assessments()->delete();

            $aiCourse->assessments()->create([
                'question' => 'Which machine learning paradigm trains a model using labeled input-output pairs?',
                'option_a' => 'Supervised Learning',
                'option_b' => 'Unsupervised Clustering',
                'option_c' => 'Hardware Overclocking',
                'option_d' => 'Relational Database Indexing',
                'correct_option' => 'a',
            ]);

            $aiCourse->assessments()->create([
                'question' => 'What is the primary purpose of Artificial Intelligence (AI) in computer systems?',
                'option_a' => 'To simulate human intelligence, reasoning, and problem-solving capabilities',
                'option_b' => 'To replace physical computer keyboards with touchscreen devices',
                'option_c' => 'To strictly increase internet download bandwidth',
                'option_d' => 'To prevent monitors from overheating',
                'correct_option' => 'a',
            ]);
        }

        // -------------------------------------------------------------
        // 4. Child Protection Fundamentals
        // -------------------------------------------------------------
        $cpFund = Course::updateOrCreate(
            ['title' => 'Child Protection Fundamentals'],
            [
                'description' => 'Core principles and legal frameworks for child protection in humanitarian settings. Covers UNCRC, mandatory reporting, and referral pathways.',
                'instructor_id' => $staffBId,
                'status' => 'published',
                'academic_year' => '2026 / 2027',
                'category_logo' => 'child_protection',
                'billing_type' => 'free',
                'price' => 0.00,
            ]
        );

        $cpFund->modules()->updateOrCreate(
            ['course_id' => $cpFund->id, 'order' => 1],
            [
                'title' => 'Unit 1: UNCRC & International Legal Frameworks',
                'description' => 'Understanding the UN Convention on the Rights of the Child (UNCRC) and state obligations.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=bkQqMawi2-Y',
            ]
        );
        $cpFund->modules()->updateOrCreate(
            ['course_id' => $cpFund->id, 'order' => 2],
            [
                'title' => 'Unit 2: Identifying Vulnerabilities & Risk Indicators',
                'description' => 'Recognizing signs of neglect, physical abuse, psychological harm, and environmental risks.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=hfrOFoYnnco',
            ]
        );
        $cpFund->modules()->updateOrCreate(
            ['course_id' => $cpFund->id, 'order' => 3],
            [
                'title' => 'Unit 3: Mandatory Reporting & Multi-Agency Referral',
                'description' => 'Legal reporting responsibilities, inter-agency communication, and keeping the child safe.',
                'content_type' => 'link',
                'media_url' => 'https://www.unicef.org/child-protection',
            ]
        );

        if ($cpFund->assessments()->count() === 0) {
            $cpFund->assessments()->create([
                'question' => 'Under the UN Convention on the Rights of the Child (UNCRC), which principle mandates that all actions concerning children prioritize their welfare above administrative convenience?',
                'option_a' => 'The Right to Information',
                'option_b' => 'The Best Interests of the Child Principle',
                'option_c' => 'The Principle of Reciprocity',
                'option_d' => 'The Standard Operating Procedure Clause',
                'correct_option' => 'b',
            ]);
        }

        // -------------------------------------------------------------
        // 5. Psychosocial Support for Children
        // -------------------------------------------------------------
        $pssCourse = Course::updateOrCreate(
            ['title' => 'Psychosocial Support for Children'],
            [
                'description' => 'Evidence-based approaches to providing psychosocial support to children affected by crisis. Includes PFA, safe spaces, and caregiver engagement.',
                'instructor_id' => $staffBId,
                'status' => 'published',
                'academic_year' => '2026 / 2027',
                'category_logo' => 'child_protection',
                'billing_type' => 'free',
                'price' => 0.00,
            ]
        );

        $pssCourse->modules()->updateOrCreate(
            ['course_id' => $pssCourse->id, 'order' => 1],
            [
                'title' => 'Unit 1: Psychological First Aid (PFA) for Minors',
                'description' => 'Core action principles: Look, Listen, and Link in humanitarian crisis settings.',
                'content_type' => 'link',
                'media_url' => 'https://www.who.int/publications/i/item/9789241548205',
            ]
        );
        $pssCourse->modules()->updateOrCreate(
            ['course_id' => $pssCourse->id, 'order' => 2],
            [
                'title' => 'Unit 2: Designing Child-Friendly Safe Spaces',
                'description' => 'Setting up secure, stimulating physical spaces that support healing and peer socialization.',
                'content_type' => 'link',
                'media_url' => 'https://www.unicef.org/protection/child-friendly-spaces',
            ]
        );
        $pssCourse->modules()->updateOrCreate(
            ['course_id' => $pssCourse->id, 'order' => 3],
            [
                'title' => 'Unit 3: Caregiver & Family Engagement',
                'description' => 'Strengthening caregiver capacity and resilience during displacement or trauma.',
                'content_type' => 'link',
                'media_url' => 'https://www.unicef.org/parenting',
            ]
        );

        if ($pssCourse->assessments()->count() === 0) {
            $pssCourse->assessments()->create([
                'question' => 'What are the three core action principles of Psychological First Aid (PFA)?',
                'option_a' => 'Diagnose, Prescribe, Refer',
                'option_b' => 'Look, Listen, Link',
                'option_c' => 'Analyze, Document, Conclude',
                'option_d' => 'Search, Interrogate, Isolate',
                'correct_option' => 'b',
            ]);
        }

        // -------------------------------------------------------------
        // 6. Case Management in Child Protection
        // -------------------------------------------------------------
        $cmCourse = Course::updateOrCreate(
            ['title' => 'Case Management in Child Protection'],
            [
                'description' => 'Step-by-step case management methodology: identification, assessment, planning, implementation, monitoring, and closure. Best practices for documentation.',
                'instructor_id' => $staffBId,
                'status' => 'published',
                'academic_year' => '2026 / 2027',
                'category_logo' => 'child_protection',
                'billing_type' => 'free',
                'price' => 0.00,
            ]
        );

        $cmCourse->modules()->updateOrCreate(
            ['course_id' => $cmCourse->id, 'order' => 1],
            [
                'title' => 'Unit 1: Step 1-2: Identification & Needs Assessment',
                'description' => 'Immediate intake, informed consent/assent, and safety planning.',
                'content_type' => 'link',
                'media_url' => 'https://alliancecpha.org/en/child-protection-hub/child-protection-case-management',
            ]
        );
        $cmCourse->modules()->updateOrCreate(
            ['course_id' => $cmCourse->id, 'order' => 2],
            [
                'title' => 'Unit 2: Step 3-4: Action Planning & Multi-Agency Referral',
                'description' => 'Developing child-centered case plans and coordinating specialist medical or legal support.',
                'content_type' => 'link',
                'media_url' => 'https://alliancecpha.org/en/system/files/library/cm_guidelines_english_web_0.pdf',
            ]
        );
        $cmCourse->modules()->updateOrCreate(
            ['course_id' => $cmCourse->id, 'order' => 3],
            [
                'title' => 'Unit 3: Step 5-6: Case Monitoring, Evaluation & Safe Closure',
                'description' => 'Periodic case review, family stabilization indicators, and safe case transition.',
                'content_type' => 'link',
                'media_url' => 'https://alliancecpha.org/en/resources/case-management-standard',
            ]
        );

        if ($cmCourse->assessments()->count() === 0) {
            $cmCourse->assessments()->create([
                'question' => 'Before initiating a formal child protection case assessment, what must the caseworker secure whenever feasible?',
                'option_a' => 'A judicial court order only',
                'option_b' => 'Informed consent from parents/caregivers and informed assent from the child',
                'option_c' => 'A media release signature',
                'option_d' => 'A full psychiatric evaluation report',
                'correct_option' => 'b',
            ]);
        }

        // -------------------------------------------------------------
        // 7. Child Safeguarding Policy Development (Draft)
        // -------------------------------------------------------------
        $safePolicy = Course::updateOrCreate(
            ['title' => 'Child Safeguarding Policy Development'],
            [
                'description' => 'How to develop and implement organizational child safeguarding policies. Risk assessment, code of conduct, and reporting mechanisms.',
                'instructor_id' => $staffBId,
                'status' => 'draft',
                'academic_year' => '2026 / 2027',
                'category_logo' => 'child_protection',
                'billing_type' => 'free',
                'price' => 0.00,
            ]
        );

        $safePolicy->modules()->updateOrCreate(
            ['course_id' => $safePolicy->id, 'order' => 1],
            [
                'title' => 'Draft Unit 1: Organizational Risk Audit & Code of Conduct',
                'description' => 'Draft policies, vetting staff, and establishing clear behavioral boundaries.',
                'content_type' => 'link',
                'media_url' => 'https://www.keepingchildrensafe.global/standards/',
            ]
        );

        // -------------------------------------------------------------
        // 8. Legacy Course: Basic Hygiene Promotion (Archived)
        // -------------------------------------------------------------
        $legacyCourse = Course::updateOrCreate(
            ['title' => 'Legacy Course: Basic Hygiene Promotion'],
            [
                'description' => 'Archived content. Superseded by WASH Integration module.',
                'instructor_id' => $staffBId,
                'status' => 'archived',
                'academic_year' => '2025 / 2026',
                'category_logo' => 'general',
                'billing_type' => 'free',
                'price' => 0.00,
            ]
        );

        $legacyCourse->modules()->updateOrCreate(
            ['course_id' => $legacyCourse->id, 'order' => 1],
            [
                'title' => 'Archived Unit: WASH Principles for Emergency Camps',
                'description' => 'Archived lecture notes and historical health promotion guides.',
                'content_type' => 'link',
                'media_url' => 'https://www.who.int/teams/environment-climate-change-and-health/water-sanitation-and-health',
            ]
        );

        // -------------------------------------------------------------
        // 9. Outcome-Based Education (OBE) & Digital Pedagogy (Fresh SV Evaluation Course)
        // -------------------------------------------------------------
        $obeCourse = Course::updateOrCreate(
            ['title' => 'Outcome-Based Education (OBE) & Digital Pedagogy'],
            [
                'description' => 'Comprehensive professional development course for university educators on Constructive Alignment, Bloom\'s Taxonomy, Course Learning Outcomes (CLOs), and digital assessment design in higher education.',
                'instructor_id' => $staffId,
                'status' => 'published',
                'academic_year' => '2026 / 2027 · Semester 1',
                'category_logo' => 'blue',
                'billing_type' => 'free',
                'price' => 0.00,
                'cert_title' => 'UUM CoPED · Certificate in Outcome-Based Education (OBE)',
                'cert_url' => 'https://www.mqa.gov.my',
            ]
        );

        $obeMod1 = $obeCourse->modules()->updateOrCreate(
            ['course_id' => $obeCourse->id, 'order' => 1],
            [
                'title' => 'Constructive Alignment & Course Learning Outcomes (CLOs)',
                'description' => 'Formulating measurable Course Learning Outcomes using Bloom\'s Taxonomy and aligning teaching-learning activities with Program Educational Objectives (PEOs).',
                'duration' => 1800,
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=OLsNldDYdRw',
            ]
        );

        $obeMod1->lessons()->updateOrCreate(
            ['module_id' => $obeMod1->id, 'order' => 1],
            [
                'title' => 'Video Lecture: Introduction to Constructive Alignment (University of Helsinki)',
                'content' => 'Core principles of aligning intended learning outcomes, teaching methods, and assessment tasks.',
                'content_type' => 'video',
                'content_url' => 'https://www.youtube.com/watch?v=OLsNldDYdRw',
                'duration' => 900,
            ]
        );

        $obeMod1->lessons()->updateOrCreate(
            ['module_id' => $obeMod1->id, 'order' => 2],
            [
                'title' => 'Reference Guide: Revised Bloom\'s Taxonomy Action Verbs',
                'content' => 'Cognitive domain action verbs from Remembering and Understanding to Evaluating and Creating.',
                'content_type' => 'link',
                'content_url' => 'https://www.mqa.gov.my',
                'duration' => 900,
            ]
        );

        $obeMod2 = $obeCourse->modules()->updateOrCreate(
            ['course_id' => $obeCourse->id, 'order' => 2],
            [
                'title' => 'Designing Formative & Summative Digital Assessments',
                'description' => 'Building valid assessment rubrics, mastery quizzes, and continuous quality improvement (CQI) feedback loops in an institutional LMS.',
                'duration' => 2100,
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=rJxFXjfB_B4',
            ]
        );

        $obeMod2->lessons()->updateOrCreate(
            ['module_id' => $obeMod2->id, 'order' => 1],
            [
                'title' => 'Video Lecture: Formative vs. Summative Evaluation Strategies',
                'content' => 'Designing diagnostic, formative, and summative assessments to measure student mastery.',
                'content_type' => 'video',
                'content_url' => 'https://www.youtube.com/watch?v=rJxFXjfB_B4',
                'duration' => 1200,
            ]
        );

        if ($obeCourse->assessments()->whereNull('module_id')->count() === 0) {
            $obeCourse->assessments()->create([
                'question' => 'In Outcome-Based Education (OBE), what does John Biggs\' principle of Constructive Alignment require?',
                'option_a' => 'Grading students strictly on a bell curve regardless of learning outcomes',
                'option_b' => 'Directly aligning teaching-learning activities and assessment tasks with the intended Course Learning Outcomes (CLOs)',
                'option_c' => 'Replacing all written examinations with attendance marks',
                'option_d' => 'Scheduling lectures only in the morning session',
                'correct_option' => 'b',
            ]);

            $obeCourse->assessments()->create([
                'question' => 'Which cognitive level represents the highest order of thinking in the revised Bloom\'s Taxonomy?',
                'option_a' => 'Creating',
                'option_b' => 'Remembering',
                'option_c' => 'Understanding',
                'option_d' => 'Applying',
                'correct_option' => 'a',
            ]);

            $obeCourse->assessments()->create([
                'question' => 'What is the primary purpose of Formative Assessment during a semester?',
                'option_a' => 'To issue the final graduation transcript at convocation',
                'option_b' => 'To rank departments by research funding',
                'option_c' => 'To monitor student learning continuously and provide actionable feedback for improvement',
                'option_d' => 'To archive old course syllabi',
                'correct_option' => 'c',
            ]);
        }

        // -------------------------------------------------------------
        // 10. Flagship Course: Kecerdasan Buatan Generatif & Kejuruteraan Prompt untuk Profesional
        // Complete with embedded video links, reading articles, per-module mini-quizzes, and final certification exam.
        // -------------------------------------------------------------
        $genAiCourse = Course::updateOrCreate(
            ['title' => 'Kecerdasan Buatan Generatif & Kejuruteraan Prompt untuk Profesional'],
            [
                'description' => 'Program pensijilan komprehensif mengenai teknologi AI generatif, seni reka bentuk prompt berstruktur, integrasi Retrieval-Augmented Generation (RAG), dan etika kecerdasan buatan untuk meningkatkan produktiviti sektor awam dan swasta.',
                'instructor_id' => $staffId,
                'status' => 'published',
                'academic_year' => '2026 / 2027 · Professional Track',
                'category_logo' => 'ai',
                'billing_type' => 'free',
                'price' => 0.00,
                'cert_title' => 'CoPED Certified Generative AI & Prompt Engineering Specialist',
                'cert_url' => 'https://coped.org/cert/genai-prompt-engineering',
                'bundle_title' => 'Complete GenAI & Prompt Engineering Study Guide + Cheatsheets',
                'bundle_url' => 'https://drive.google.com/drive/folders/coped-genai-bundle-demo',
            ]
        );

        // Module 1: Foundations of LLMs & Prompting
        $genAiMod1 = $genAiCourse->modules()->updateOrCreate(
            ['course_id' => $genAiCourse->id, 'order' => 1],
            [
                'title' => 'Modul 1: Asas Model Bahasa Besar (LLM) & Seni Kejuruteraan Prompt',
                'description' => 'Ketahui seni bina asas Large Language Models (LLM), konsep tokenisasi, tetingkap konteks (context window), dan prinsip kejuruteraan prompt berkesan untuk tugasan profesional.',
                'duration' => 1800,
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=zjkBMFhNj_g',
                'transcript' => "### Panduan Pembelajaran Modul 1: Asas Model Bahasa Besar (LLM) & Kejuruteraan Prompt\n\nModel Bahasa Besar (LLM) merupakan model pembelajaran mesin lanjutan yang dilatih menggunakan korpus teks berskala bilion token. Berbeza dengan pengaturcaraan tradisional yang berasaskan peraturan tetap, LLM meramal kebarangkalian token seterusnya berdasarkan konteks yang diberikan.\n\n#### Konsep Teras Pembelajaran\n1. **Tokenisasi**: Cara teks dipecahkan kepada sub-kata atau unit nombor sebelum diproses oleh model transformer.\n2. **Tetingkap Konteks (Context Window)**: Had jumlah token (input dan output) yang boleh diingati oleh model dalam satu sesi interaksi.\n3. **Suhu (Temperature) & Top-P**: Parameter inferens yang mengawal tahap kreativiti berbanding ketepatan deterministik jawapan model.\n\n#### Kerangka Kejuruteraan Prompt Profesional (C-L-E-A-R)\n- **C (Context)**: Berikan latar belakang peranan dan senario kerja spesifik.\n- **L (Length & Format)**: Nyatakan format output yang dikehendaki (jadual eksekutif, senarai bulet, format JSON).\n- **E (Examples)**: Sertakan contoh input-output untuk memandu nada jawapan (Few-shot prompting).\n- **A (Action)**: Gunakan arahan kata kerja yang tegas (Analisis, Ringkaskan, Ekstrak, Rangka).\n- **R (Restrictions)**: Nyatakan pantang larang dan had patah perkataan untuk mengelakkan jawapan meleret.",
            ]
        );

        $genAiMod1->lessons()->updateOrCreate(
            ['module_id' => $genAiMod1->id, 'order' => 1],
            [
                'title' => 'Subtopik 1.1: Kuliah Video: Mekanik Dalaman LLM & Parameter Inferens',
                'content_type' => 'video',
                'content_url' => 'https://www.youtube.com/watch?v=zjkBMFhNj_g',
                'duration' => 900,
                'content' => "Artikel Kuliah 1.1: Memahami Mekanik LLM & Mekanisme Self-Attention\n\nDalam video kuliah ini, kita meneliti bagaimana model transformer memproses hubungan semantik antara perkataan menggunakan mekanisme 'Self-Attention'. Pembelajaran ini penting untuk memahami mengapa pemilihan perkataan dalam prompt memberikan kesan langsung terhadap output yang dijana.\n\nFokus Utama Kuliah:\n- Struktur transformer decoder-only.\n- Bagaimana temperature mempengaruhi kebarangkalian pemilihan token.\n- Strategi pengurusan tetingkap konteks agar tidak melebihi kuota memori model.",
                'transcript' => 'Transkrip Video Kuliah: Pengenalan kepada mekanisme transformer, tokenisasi, dan inferens model bahasa.',
            ]
        );

        $genAiMod1->lessons()->updateOrCreate(
            ['module_id' => $genAiMod1->id, 'order' => 2],
            [
                'title' => 'Subtopik 1.2: Panduan Artikel: Teknik Few-Shot & Chain-of-Thought (CoT) Prompting',
                'content_type' => 'text',
                'content_url' => 'https://www.youtube.com/watch?v=jC4v5AS4RIM',
                'duration' => 900,
                'content' => "Panduan Artikel & Kajian Kes 1.2: Teknik Few-Shot dan Chain-of-Thought (CoT)\n\nZero-shot prompting merujuk kepada situasi di mana model diminta melaksanakan tugasan tanpa sebarang contoh awal. Walau bagaimanapun, untuk tugasan analitikal kompleks, teknik Few-Shot dan Chain-of-Thought (CoT) terbukti meningkatkan ketepatan jawapan sehingga 40%.\n\nContoh Prompt Chain-of-Thought:\n'Fikirkan langkah demi langkah sebelum memberikan kesimpulan akhir. Senaraikan hujah pro dan kontra terlebih dahulu berserta justifikasi fakta.'\n\nAmalan Terbaik Kejuruteraan Prompt:\n1. Berikan arahan sistem (System Prompt) yang menetapkan persona pakar industri.\n2. Nyatakan langkah penaakulan secara eksplisit.\n3. Uji konsistensi jawapan dengan menjalankan beberapa variasi prompt.",
                'transcript' => 'Panduan bertulis menyeluruh teknik prompt kejuruteraan lanjutan.',
            ]
        );

        // Mini-quizzes for Module 1 (module_id set)
        if ($genAiCourse->assessments()->where('module_id', $genAiMod1->id)->count() === 0) {
            $genAiCourse->assessments()->create([
                'module_id' => $genAiMod1->id,
                'question' => 'Dalam kejuruteraan prompt, apakah perbezaan utama antara "Zero-Shot" prompting dan "Few-Shot" prompting?',
                'option_a' => 'Zero-shot tidak memerlukan sebarang sambungan internet, manakala few-shot memerlukannya.',
                'option_b' => 'Zero-shot meminta model menjawab tanpa contoh terdahulu, manakala few-shot membekalkan beberapa contoh input-output untuk memandu model.',
                'option_c' => 'Zero-shot hanya berfungsi untuk imej, manakala few-shot untuk teks.',
                'option_d' => 'Few-shot menghasilkan jawapan secara rawak tanpa sebarang konteks.',
                'correct_option' => 'b',
            ]);

            $genAiCourse->assessments()->create([
                'module_id' => $genAiMod1->id,
                'question' => 'Mengapakah teknik Chain-of-Thought (CoT) berkesan untuk tugasan penaakulan logik dalam LLM?',
                'option_a' => 'Kerana ia memaksa model menjana langkah-langkah penaakulan perantaraan sebelum tiba ke jawapan akhir.',
                'option_b' => 'Kerana ia memadam memori perbualan terdahulu untuk menjimatkan kos API.',
                'option_c' => 'Kerana ia menterjemahkan teks ke dalam kod biner secara automatik.',
                'option_d' => 'Kerana ia menaikkan kelajuan pemprosesan CPU komputer secara fizikal.',
                'correct_option' => 'a',
            ]);
        }

        // Module 2: RAG & Vector Databases
        $genAiMod2 = $genAiCourse->modules()->updateOrCreate(
            ['course_id' => $genAiCourse->id, 'order' => 2],
            [
                'title' => 'Modul 2: Teknik Lanjutan: RAG (Retrieval-Augmented Generation) & Pangkalan Data Vektor',
                'description' => 'Pelajari bagaimana menggabungkan data dalaman organisasi dengan keupayaan LLM melalui seni bina Retrieval-Augmented Generation (RAG) bagi menghapuskan halusinasi maklumat.',
                'duration' => 2100,
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=T-D1OfcDW1M',
                'transcript' => "### Panduan Pembelajaran Modul 2: Seni Bina Retrieval-Augmented Generation (RAG)\n\nHalusinasi merupakan cabaran utama apabila LLM menjana maklumat yang kelihatan meyakinkan tetapi sebenarnya salah secara fakta. RAG menyelesaikan masalah ini dengan menyediakan rujukan dokumen sahih semasa masa nyata sebelum model menjawab.\n\n#### Kitaran Kerja RAG Perusahaan\n1. **Penyediaan Dokumen (Ingestion & Chunking)**: Dokumen teks rasmi (PDF SOP, pekeliling, arkib dasar) dipecahkan kepada ketulan (chunks) bersaiz 500-1000 token dengan pertindihan (overlap).\n2. **Pengekodan Vektor (Vector Embeddings)**: Setiap ketulan teks ditukar kepada vektor nombor berdimensi tinggi menggunakan model embedding khusus.\n3. **Carian Semantik (Vector Search)**: Apabila pengguna mengemukakan soalan, pertanyaan ditukar kepada vektor dan dicari ketulan teks paling berkaitan menggunakan metrik 'Cosine Similarity'.\n4. **Penjanaan Berpandukan Konteks (Augmentation & Generation)**: Teks rujukan berkaitan dimasukkan ke dalam prompt sistem sebagai konteks sahih untuk model merangka jawapan.",
            ]
        );

        $genAiMod2->lessons()->updateOrCreate(
            ['module_id' => $genAiMod2->id, 'order' => 1],
            [
                'title' => 'Subtopik 2.1: Kuliah Video: Seni Bina RAG & Aliran Kerja Pangkalan Data Vektor',
                'content_type' => 'video',
                'content_url' => 'https://www.youtube.com/watch?v=T-D1OfcDW1M',
                'duration' => 1100,
                'content' => "Artikel Kuliah 2.1: RAG untuk Perusahaan & Pengurusan Pengetahuan\n\nVideo ini menerangkan bagaimana organisasi memanfaatkan dokumen rasmi, arkib dasar, dan SOP tanpa perlu melatih semula (fine-tune) model asas yang memakan kos berjuta ringgit. RAG membolehkan maklumat dikemaskini secara serta-merta hanya dengan menambah dokumen ke pangkalan data vektor.\n\nKomponen Kritikal:\n- Model embedding dwibahasa.\n- Pangkalan data vektor (seperti Pinecone, Milvus, pgvector).\n- Saluran integrasi API model penjanaan.",
                'transcript' => 'Transkrip Video Kuliah: Aliran data RAG daripada dokumen asal sehingga pembentukan jawapan akhir.',
            ]
        );

        $genAiMod2->lessons()->updateOrCreate(
            ['module_id' => $genAiMod2->id, 'order' => 2],
            [
                'title' => 'Subtopik 2.2: Panduan Artikel: Strategi Chunking & Pengurangan Halusinasi AI',
                'content_type' => 'text',
                'content_url' => 'https://www.youtube.com/watch?v=OLsNldDYdRw',
                'duration' => 1000,
                'content' => "Panduan Artikel 2.2: Strategi Chunking dan Evaluasi Ketepatan Fakta\n\nMemilih saiz ketulan (chunk size) yang tepat adalah penentu kejayaan sistem RAG:\n- **Ketulan Terlalu Kecil**: Kehilangan konteks keseluruhan dan kaitan logik sesebuah perenggan dasar.\n- **Ketulan Terlalu Besar**: Memuatkan maklumat tidak berkaitan (noise) yang mengelirukan tetingkap perhatian model.\n\nStrategi Terbaik:\n1. Gunakan 'Recursive Character Text Splitter' dengan pertindihan token (token overlap 10-20%).\n2. Gunakan 'Hybrid Search' yang menggabungkan carian kata kunci (BM25) dan carian vektor semantik.\n3. Wajibkan model menyertakan petikan sumber (citation) dalam jawapan untuk audit manusia.",
                'transcript' => 'Panduan terperinci metrik penilaian RAG dan strategi fragmentasi dokumen.',
            ]
        );

        // Mini-quizzes for Module 2 (module_id set)
        if ($genAiCourse->assessments()->where('module_id', $genAiMod2->id)->count() === 0) {
            $genAiCourse->assessments()->create([
                'module_id' => $genAiMod2->id,
                'question' => 'Apakah fungsi utama model Embedding dalam seni bina Retrieval-Augmented Generation (RAG)?',
                'option_a' => 'Menukar teks kepada representasi vektor berangka yang menangkap makna semantik perkataan.',
                'option_b' => 'Memadam fail lama daripada pelayan secara berkala.',
                'option_c' => 'Mengecilkan saiz fon dokumen agar muat pada skrin telefon.',
                'option_d' => 'Menggantikan kad grafik komputer dengan cip khas.',
                'correct_option' => 'a',
            ]);

            $genAiCourse->assessments()->create([
                'module_id' => $genAiMod2->id,
                'question' => 'Bagaimanakah RAG membantu mengurangkan isu halusinasi pada Model Bahasa Besar (LLM)?',
                'option_a' => 'Dengan menutup sambungan internet semasa model menjawab.',
                'option_b' => 'Dengan membekalkan dokumen fakta berkaitan sebagai konteks rujukan sebelum model menjana jawapan.',
                'option_c' => 'Dengan memadam sejarah perbualan pengguna selepas 5 minit.',
                'option_d' => 'Dengan menghadkan jawapan kepada 10 patah perkataan sahaja.',
                'correct_option' => 'b',
            ]);
        }

        // Module 3: AI Safety, Ethics & Governance
        $genAiMod3 = $genAiCourse->modules()->updateOrCreate(
            ['course_id' => $genAiCourse->id, 'order' => 3],
            [
                'title' => 'Modul 3: Keselamatan Prompt Injection, Etika & Tadbir Urus AI Sektor Awam',
                'description' => 'Kuasai keselamatan siber generatif AI termasuk serangan Prompt Injection, Jailbreaking, kebocoran data sulit, dan prinsip etika pematuhan piawaian tadbir urus kecerdasan buatan.',
                'duration' => 1900,
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=bEj4bO62sQk',
                'transcript' => "### Panduan Pembelajaran Modul 3: Keselamatan Siber AI & Garis Panduan Etika\n\nPenggunaan AI dalam sektor awam dan korporat menuntut piawaian keselamatan maklumat dan ketelusan etika yang tinggi. Ancaman terhadap sistem AI moden bukan sahaja berbentuk pencerobohan pelayan tradisional, tetapi juga manipulasi semantik melalui prompt adversarial.\n\n#### Bentuk Ancaman Utama AI Generatif\n1. **Direct Prompt Injection (Jailbreaking)**: Percubaan pengguna untuk memintas arahan sistem (system prompt) bagi menjana maklumat larangan atau kandungan berbahaya.\n2. **Indirect Prompt Injection**: Penyerang menyuntik teks hasad ke dalam laman web atau dokumen yang kemudiannya dibaca oleh model AI semasa proses RAG atau carian web automatik.\n3. **Kebocoran Data Sensitif**: Memasukkan maklumat rahsia rasmi, data peribadi pelanggan (PII), atau kod perisian sulit ke dalam model awam tanpa penyulitan.\n\n#### Kerangka Tadbir Urus & Etika AI\n- **Ketelusan & Akauntabiliti**: Keputusan berasaskan AI mesti mempunyai jejak audit manusia (Human-in-the-loop).\n- **Keadilan & Bebas Berat Sebelah**: Menguji dataset latihan bagi mengelakkan diskriminasi atau berat sebelah demografi.\n- **Perlindungan Privasi**: Mematuhi Akta Perlindungan Data Peribadi (PDPA) dan arahan keselamatan ICT jabatan.",
            ]
        );

        $genAiMod3->lessons()->updateOrCreate(
            ['module_id' => $genAiMod3->id, 'order' => 1],
            [
                'title' => 'Subtopik 3.1: Kuliah Video: Memahami Serangan Prompt Injection & Kaedah Pertahanan',
                'content_type' => 'video',
                'content_url' => 'https://www.youtube.com/watch?v=bEj4bO62sQk',
                'duration' => 950,
                'content' => "Artikel Kuliah 3.1: Keselamatan Siber AI & Pertahanan Prompt Injection\n\nKuliah ini membincangkan vektor serangan 'Ignore all previous instructions' dan bagaimana pembangun boleh membina lapisan pertahanan input sanitization dan output guardrails menggunakan kerangka seperti NeMo Guardrails atau Llama Guard.\n\nLangkah-langkah Pertahanan:\n- Asingkan arahan sistem daripada input pengguna menggunakan format token khas.\n- Pasang lapisan penapis pengesahan sebelum dan selepas inferens model.\n- Hadkan hak capaian (privilege least authority) bagi ejen AI yang mempunyai alat pelaksanaan kod.",
                'transcript' => 'Transkrip Video Kuliah: Analisis ancaman prompt injection dan kaedah pertahanan berlapis.',
            ]
        );

        $genAiMod3->lessons()->updateOrCreate(
            ['module_id' => $genAiMod3->id, 'order' => 2],
            [
                'title' => 'Subtopik 3.2: Panduan Artikel: Garis Panduan Tadbir Urus & Etika AI Sektor Awam',
                'content_type' => 'text',
                'content_url' => 'https://www.youtube.com/watch?v=rJxFXjfB_B4',
                'duration' => 950,
                'content' => "Panduan Artikel 3.2: Tadbir Urus dan Etika AI Kebangsaan\n\nPematuhan terhadap garis panduan etika AI kebangsaan menekankan 7 prinsip teras:\n1. Kebolehpercayaan dan keteguhan teknikal (Technical Robustness).\n2. Privasi dan tadbir urus data yang telus.\n3. Ketelusan dan kebolehan penjelasan (Explainable AI).\n4. Kepelbagaian, tanpa diskriminasi dan kesaksamaan sosial.\n5. Kesejahteraan sosial dan perlindungan alam sekitar.\n6. Akauntabiliti dan pengawasan manusia (Human-in-the-loop).\n7. Mengutamakan nilai kemanusiaan dan impak positif kepada masyarakat.",
                'transcript' => 'Dokumentasi komprehensif etika dan tadbir urus kecerdasan buatan.',
            ]
        );

        // Mini-quizzes for Module 3 (module_id set)
        if ($genAiCourse->assessments()->where('module_id', $genAiMod3->id)->count() === 0) {
            $genAiCourse->assessments()->create([
                'module_id' => $genAiMod3->id,
                'question' => 'Apakah yang dimaksudkan dengan serangan "Indirect Prompt Injection" pada aplikasi berasaskan AI?',
                'option_a' => 'Penyerang mematikan bekalan kuasa ke pusat data secara fizikal.',
                'option_b' => 'Penyerang memasukkan arahan tersembunyi ke dalam dokumen luaran yang dibaca oleh AI, menyebabkan AI melakukan tindakan tidak dibenarkan.',
                'option_c' => 'Pengguna terlupa kata laluan log masuk ke dalam emel peribadi.',
                'option_d' => 'Kabel monitor komputer terputus semasa pemprosesan prompt.',
                'correct_option' => 'b',
            ]);

            $genAiCourse->assessments()->create([
                'module_id' => $genAiMod3->id,
                'question' => 'Dalam prinsip tadbir urus etika AI, apakah peranan pendekatan "Human-in-the-Loop" (HITL)?',
                'option_a' => 'Memastikan keputusan berisiko tinggi disemak dan disahkan oleh manusia yang bertanggungjawab sebelum dikuatkuasakan.',
                'option_b' => 'Menghapuskan keperluan pegawai manusia dalam semua urusan pentadbiran.',
                'option_c' => 'Mewajibkan pekerja sentiasa menaip teks secara manual tanpa bantuan komputer.',
                'option_d' => 'Mengurangkan gaji kakitangan IT secara automatik.',
                'correct_option' => 'a',
            ]);
        }

        // Final Course Assessment (module_id = null): 5 questions, 100% required to pass & earn certificate
        if ($genAiCourse->assessments()->whereNull('module_id')->count() === 0) {
            $genAiCourse->assessments()->create([
                'question' => 'Apakah parameter inferens LLM yang perlu dilaraskan ke nilai rendah (contoh: 0.1 - 0.2) jika pengguna menginginkan output yang sangat konsisten, faktual, dan deterministik?',
                'option_a' => 'Temperature',
                'option_b' => 'Screen Resolution',
                'option_c' => 'Baud Rate',
                'option_d' => 'Audio Volume',
                'correct_option' => 'a',
            ]);

            $genAiCourse->assessments()->create([
                'question' => 'Antara teknik berikut, yang manakah paling tepat digunakan untuk membimbing LLM memahami format laporan rasmi jabatan dengan memberikan 2 hingga 3 contoh lengkap dalam prompt?',
                'option_a' => 'Zero-Shot Prompting',
                'option_b' => 'Few-Shot Prompting',
                'option_c' => 'Hardware Overclocking',
                'option_d' => 'Database Defragmentation',
                'correct_option' => 'b',
            ]);

            $genAiCourse->assessments()->create([
                'question' => 'Mengapakah organisasi memilih kaedah RAG berbanding melatih semula (pre-training) model asas dari awal apabila perlu mengakses dokumen dalaman terkini?',
                'option_a' => 'RAG lebih pantas, menjimatkan kos perkakasan berbilion ringgit, dan membolehkan maklumat dikemaskini secara masa nyata dalam pangkalan data vektor.',
                'option_b' => 'RAG menghapuskan keperluan sebarang peranti komputer dalam pejabat.',
                'option_c' => 'Pre-training hanya sah digunakan pada sistem operasi lama.',
                'option_d' => 'RAG tidak memerlukan sambungan rangkaian data.',
                'correct_option' => 'a',
            ]);

            $genAiCourse->assessments()->create([
                'question' => 'Dalam pangkalan data vektor untuk RAG, apakah fungsi metrik "Cosine Similarity"?',
                'option_a' => 'Mengukur sudut antara dua vektor bagi menentukan darjah persamaan semantik antara pertanyaan pengguna dan ketulan dokumen.',
                'option_b' => 'Mengira jumlah bateri yang digunakan oleh tetikus wayarles.',
                'option_c' => 'Memadam rekod fail pendua pada cakera keras.',
                'option_d' => 'Menyulitkan fail PDF menjadi arkib kata laluan ZIP.',
                'correct_option' => 'a',
            ]);

            $genAiCourse->assessments()->create([
                'question' => 'Apakah amalan keselamatan terbaik bagi mencegah kebocoran data sulit kerajaan semasa menggunakan alat AI awam?',
                'option_a' => 'Jangan masukkan maklumat rahsia rasmi atau data peribadi (PII) ke dalam prompt model awam, dan gunakan model on-premise atau private cloud berpagar.',
                'option_b' => 'Tukar nama fail kepada huruf besar sebelum memuat naik maklumat ke internet.',
                'option_c' => 'Gunakan mod inkognito pelayar web tanpa sebarang perlindungan data lain.',
                'option_d' => 'Kongsikan kata laluan pentadbir dengan semua pengguna di media sosial.',
                'correct_option' => 'a',
            ]);
        }
    }
}