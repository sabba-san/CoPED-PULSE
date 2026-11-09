<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public const KSSM_F1_TITLE = 'Matematik Tingkatan 1 KSSM: Nombor Nisbah, Ungkapan Algebra & Persamaan Linear';
    public const KSSM_F4_TITLE = 'Matematik Tingkatan 4 KSSM: Fungsi & Persamaan Kuadratik, Asas Nombor & Penaakulan Logik';
    public const KSSM_ADD_TITLE = 'Matematik Tambahan Tingkatan 4 KSSM: Fungsi, Kuadratik, Indeks, Janjang & Vektor';

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

        // -------------------------------------------------------------
        // 11. KPM KSSR Primary Mathematics Pilot: Tahun 1 (Jilid 1)
        // -------------------------------------------------------------
        $kssrTahun1 = Course::updateOrCreate(
            ['title' => 'Matematik Tahun 1 KSSR (Jilid 1): Nombor Hingga 100, Tambah & Tolak'],
            [
                'description' => 'Program Rintis Sekolah Rendah KSSR berdasarkan Buku Teks Rasmi KPM Matematik Tahun 1 (Jilid 1). Merangkumi konsep Nombor Hingga 100, Nilai Tempat, Bundar, serta Operasi Tambah dan Tolak dalam Bentuk Lazim.',
                'instructor_id' => $staffId,
                'status' => 'published',
                'course_mode' => 'school',
                'academic_year' => 'KSSR Rendah · Tahun 1',
                'category_logo' => 'amber',
                'billing_type' => 'free',
                'price' => 0.00,
                'cert_title' => 'Sijil Kemahiran Matematik KSSR · Tahun 1 (KPM)',
                'cert_url' => '/books/BUKU TEKS MATEMATIK TAHUN 1 JILID 1.pdf',
                'bundle_title' => 'Buku Teks Rasmi KPM: Matematik Tahun 1 KSSR (Jilid 1) PDF',
                'bundle_url' => '/books/BUKU TEKS MATEMATIK TAHUN 1 JILID 1.pdf',
            ]
        );

        $t1Mod1 = $kssrTahun1->modules()->updateOrCreate(
            ['course_id' => $kssrTahun1->id, 'order' => 1],
            [
                'title' => 'Unit 1 - Nombor Hingga 100 (Banyak & Sedikit, Nilai Tempat & Bundar)',
                'description' => 'Kenali perbandingan Banyak dan Sedikit, membilang nombor 0 hingga 100, Nilai Tempat (Puluh dan Sa), Pola Nombor, dan Bundar kepada Puluh Terdekat.',
                'duration' => 1200,
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=0TgLtF3PMOc',
                'transcript' => "### Nota Ceria Unit 1: Nombor Hingga 100\n\nSelamat datang murid-murid Tahun 1! Dalam Unit 1 Buku Teks KPM, kita belajar mengenali nombor di sekeliling kita.\n\n#### 1. Banyak dan Sedikit & Kenali 0 Hingga 100\n- Bandingkan dua kumpulan objek secara padanan satu dengan satu untuk menentukan kumpulan yang **banyak**, **sedikit**, atau **sama banyak**.\n- Kenali dan tulis nombor daripada **0 hingga 100** dalam angka dan perkataan.\n\n#### 2. Kombinasi Nombor & Nilai Tempat (Puluh dan Sa)\n- Setiap nombor dua digit mempunyai nilai tempat **Puluh** dan **Sa**.\n- Contoh: Nombor **13** ialah **1 puluh dan 3 sa** (Nilai digit: 10 dan 3).\n- Contoh: Nombor **58** mempunyai angka **5** pada nilai tempat **Puluh** (nilai digit **50**) dan angka **8** pada nilai tempat **Sa** (nilai digit **8**).\n\n#### 3. Susunan & Pola Nombor\n- **Tertib Menaik**: Susunan nombor daripada kecil kepada besar (contoh: bilang menaik dua-dua, lima-lima `5, 10, 15, 20, 25`, atau sepuluh-sepuluh).\n- **Tertib Menurun**: Susunan nombor daripada besar kepada kecil.\n\n#### 4. Kenali Bundar kepada Puluh Terdekat\n- Jika digit Sa ialah **1, 2, 3, atau 4**, kekalkan digit Puluh dan tukar Sa menjadi 0 (Contoh: **22 dibundarkan menjadi 20**).\n- Jika digit Sa ialah **5, 6, 7, 8, atau 9**, tambah 1 pada Puluh dan tukar Sa menjadi 0 (Contoh: **65 dibundarkan menjadi 70**).",
            ]
        );

        $t1Mod1->lessons()->updateOrCreate(
            ['module_id' => $t1Mod1->id, 'order' => 1],
            [
                'title' => 'Subtopik 1.1: Kenali Nombor 0 Hingga 100 & Kombinasi Nombor',
                'content_type' => 'video',
                'content_url' => 'https://www.youtube.com/watch?v=0TgLtF3PMOc',
                'duration' => 600,
                'content' => "### Subtopik 1.1: Kenali Nombor 0 Hingga 100 & Kombinasi Nombor\n\n1. **Banyak dan Sedikit**: Bandingkan bilangan objek seperti guli, bunga, dan pensel.\n2. **Kombinasi Nombor**: Satu nombor boleh dibentuk daripada dua nombor yang lebih kecil. Contohnya, nombor **8** boleh dibentuk daripada kombinasi **5 dan 3** atau **4 dan 4**.\n3. **Membilang Kumpulan Sepuluh-Sepuluh**: Kumpulkan 10 batang aiskrim menjadi 1 ikat **Puluh** untuk membilang dengan pantas sehingga 100.",
                'transcript' => 'Video DidikTV KSSR Matematik Tahun 1: Kenali Nombor 0 Hingga 100.',
            ]
        );

        $t1Mod1->lessons()->updateOrCreate(
            ['module_id' => $t1Mod1->id, 'order' => 2],
            [
                'title' => 'Subtopik 1.2: Nilai Tempat (Puluh & Sa), Pola Nombor & Bundar Puluh Terdekat (Buku Teks PDF)',
                'content_type' => 'pdf',
                'content_url' => '/books/BUKU TEKS MATEMATIK TAHUN 1 JILID 1.pdf',
                'duration' => 600,
                'content' => "### Subtopik 1.2: Nilai Tempat, Pola Nombor & Bundar\n\n- **Nilai Tempat & Nilai Digit**: Dalam nombor **58**, digit **5** berada di tempat **Puluh** (nilainya **50**) dan digit **8** berada di tempat **Sa** (nilainya **8**).\n- **Pola Nombor Menaik Lima-Lima**: `5, 10, 15, 20, 25`.\n- **Bundar kepada Puluh Terdekat**: Gunakan garis nombor atau bukit bundar. Nombor **22** lebih dekat dengan **20**, manakala **65** dibundarkan menjadi **70**.",
                'transcript' => 'Rujukan Buku Teks Rasmi KPM Matematik Tahun 1 Jilid 1.',
            ]
        );

        if ($kssrTahun1->assessments()->where('module_id', $t1Mod1->id)->count() === 0) {
            $kssrTahun1->assessments()->create([
                'module_id' => $t1Mod1->id,
                'question' => 'Dalam nombor 13, berapakah nilai tempat Puluh dan Sa?',
                'option_a' => '1 puluh dan 3 sa',
                'option_b' => '3 puluh dan 1 sa',
                'option_c' => '10 puluh dan 3 sa',
                'option_d' => '0 puluh dan 13 sa',
                'correct_option' => 'a',
            ]);
            $kssrTahun1->assessments()->create([
                'module_id' => $t1Mod1->id,
                'question' => 'Bundarkan nombor 22 kepada puluh yang terdekat.',
                'option_a' => '10',
                'option_b' => '20',
                'option_c' => '30',
                'option_d' => '25',
                'correct_option' => 'b',
            ]);
        }

        $t1Mod2 = $kssrTahun1->modules()->updateOrCreate(
            ['course_id' => $kssrTahun1->id, 'order' => 2],
            [
                'title' => 'Unit 2 - Operasi Tambah Dalam Lingkungan 100 (Bentuk Lazim)',
                'description' => 'Pelajari simbol tambah (+) dan sama dengan (=), Tambah Mudah, serta Tambah dengan Mengumpul Semula menggunakan Bentuk Lazim.',
                'duration' => 1200,
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=mjlsSYLLOSE',
                'transcript' => "### Nota Ceria Unit 2 (Bahagian A): Operasi Tambah Dalam Lingkungan 100\n\n#### 1. Kenali Tambah (`+` dan `=`) & Tambah Cepat\n- **Tambah** bermaksud menyatukan dua kumpulan objek untuk mencari **jumlah semuanya**.\n- Gunakan simbol **`+`** (tambah) dan **`=`** (sama dengan).\n\n#### 2. Tambah Mudah (Tanpa Mengumpul Semula)\n- Susun nombor mengikut lajur **Puluh** dan **Sa** dalam **Bentuk Lazim**.\n- Contoh 1: `25 + 3 = 28` (Tambah Sa: `5 + 3 = 8`, turunkan `2 puluh`).\n- Contoh 2: `17 + 30 = 47` (Tambah Sa: `7 + 0 = 7`, tambah Puluh: `1 + 3 = 4`).\n\n#### 3. Tambah Lagi dengan Mengumpul Semula\n- Apabila hasil tambah di rumah **Sa** mencapai **10 atau lebih**, tukarkan **10 sa kepada 1 puluh**.\n- Contoh 1: `29 + 6 = 35` (`9 sa + 6 sa = 15 sa` -> tulis `5 sa`, kumpul `1 puluh` ke rumah Puluh: `1 + 2 = 3 puluh`).\n- Contoh 2: `18 + 34 = 52` (`8 sa + 4 sa = 12 sa` -> tulis `2 sa`, naik `1 puluh`: `1 + 1 + 3 = 5 puluh`).",
            ]
        );

        $t1Mod2->lessons()->updateOrCreate(
            ['module_id' => $t1Mod2->id, 'order' => 1],
            [
                'title' => 'Subtopik 2.1: Tambah Mudah & Tambah Mengumpul Semula (Bentuk Lazim)',
                'content_type' => 'video',
                'content_url' => 'https://www.youtube.com/watch?v=mjlsSYLLOSE',
                'duration' => 900,
                'content' => "### Langkah Demi Langkah Bentuk Lazim (Tambah)\n\n1. Pastikan digit **Sa** disusun sebaris di lajur kanan dan digit **Puluh** di lajur kiri.\n2. Selesaikan rumah **Sa** dahulu.\n3. Jika jumlah Sa melebihi 9 (contoh: `18 + 34`), kumpulkan **10 sa menjadi 1 puluh** di atas rumah Puluh: `8 + 4 = 12` (tulis 2, naik 1), kemudian `1 + 1 + 3 = 5`. Jawapan akhir ialah **52**.",
                'transcript' => 'Video penerangan Bentuk Lazim Tambah Tahun 1.',
            ]
        );

        if ($kssrTahun1->assessments()->where('module_id', $t1Mod2->id)->count() === 0) {
            $kssrTahun1->assessments()->create([
                'module_id' => $t1Mod2->id,
                'question' => 'Berapakah hasil tambah mudah bagi 25 + 3?',
                'option_a' => '22',
                'option_b' => '28',
                'option_c' => '55',
                'option_d' => '38',
                'correct_option' => 'b',
            ]);
            $kssrTahun1->assessments()->create([
                'module_id' => $t1Mod2->id,
                'question' => 'Apabila mengira 29 + 6 dalam bentuk lazim, apakah yang berlaku pada 15 sa?',
                'option_a' => 'Tukar 10 sa kepada 1 puluh, tinggal 5 sa (Jawapan: 35)',
                'option_b' => 'Buang angka 1 dan tulis 5 sahaja',
                'option_c' => 'Tolak 6 daripada 9',
                'option_d' => 'Menjadi 296',
                'correct_option' => 'a',
            ]);
        }

        $t1Mod3 = $kssrTahun1->modules()->updateOrCreate(
            ['course_id' => $kssrTahun1->id, 'order' => 3],
            [
                'title' => 'Unit 2 - Operasi Tolak & Penyelesaian Masalah Harian',
                'description' => 'Fahami konsep Baki dan Beza, Tolak Mudah, Tolak dengan Mengumpul Semula, dan Cerita Tambah serta Tolak.',
                'duration' => 1200,
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=ug0gs8kLE48',
                'transcript' => "### Nota Ceria Unit 2 (Bahagian B): Operasi Tolak & Masalah Harian\n\n#### 1. Kenali Tolak (Baki & Beza)\n- **Tolak (`-`)** digunakan untuk mencari **baki** (apabila objek dikeluarkan/diberi) atau **beza** antara dua kuantiti.\n\n#### 2. Tolak Mudah (Tanpa Mengumpul Semula)\n- Contoh: `37 - 14 = 23`.\n- Tolak rumah Sa: `7 sa - 4 sa = 3 sa`.\n- Tolak rumah Puluh: `3 puluh - 1 puluh = 2 puluh`.\n\n#### 3. Tolak Lagi dengan Mengumpul Semula\n- Jika digit Sa di atas lebih kecil daripada digit Sa di bawah, **pinjam / tukar 1 puluh kepada 10 sa**.\n- Contoh 1: `63 - 7 = 56` (Pinjam 1 puluh daripada 6 puluh tinggal 5 puluh; `13 sa - 7 sa = 6 sa` -> Jawapan **56**).\n- Contoh 2: `50 - 24 = 26` (Tukar 1 puluh daripada 5 puluh menjadi 10 sa; `10 - 4 = 6 sa`, `4 - 2 = 2 puluh` -> Jawapan **26**).\n\n#### 4. Cerita Tambah dan Tolak\n- Gariskan maklumat penting dalam cerita matematik dan tentukan operasi yang betul.",
            ]
        );

        $t1Mod3->lessons()->updateOrCreate(
            ['module_id' => $t1Mod3->id, 'order' => 1],
            [
                'title' => 'Subtopik 3.1: Tolak Mengumpul Semula & Cerita Matematik',
                'content_type' => 'video',
                'content_url' => 'https://www.youtube.com/watch?v=ug0gs8kLE48',
                'duration' => 900,
                'content' => "### Subtopik 3.1: Tolak Mengumpul Semula\n\n- Contoh: `50 - 24 = 26`.\n- Kerana `0 sa` tidak cukup untuk ditolak `4 sa`, kita tukar **1 puluh kepada 10 sa**.\n- Rumah Puluh tinggal `4 puluh`, rumah Sa menjadi `10 sa`.\n- `10 sa - 4 sa = 6 sa` dan `4 puluh - 2 puluh = 2 puluh`. Jawapan: **26**.",
                'transcript' => 'Video pembelajaran operasi tolak dengan mengumpul semula.',
            ]
        );

        if ($kssrTahun1->assessments()->where('module_id', $t1Mod3->id)->count() === 0) {
            $kssrTahun1->assessments()->create([
                'module_id' => $t1Mod3->id,
                'question' => 'Selesaikan operasi tolak mudah ini: 37 - 14 = ___',
                'option_a' => '23',
                'option_b' => '33',
                'option_c' => '51',
                'option_d' => '13',
                'correct_option' => 'a',
            ]);
            $kssrTahun1->assessments()->create([
                'module_id' => $t1Mod3->id,
                'question' => 'Kira baki bagi 50 - 24 dengan mengumpul semula.',
                'option_a' => '34',
                'option_b' => '26',
                'option_c' => '74',
                'option_d' => '36',
                'correct_option' => 'b',
            ]);
        }

        if ($kssrTahun1->assessments()->whereNull('module_id')->count() === 0) {
            $kssrTahun1->assessments()->create([
                'question' => 'Apakah nilai tempat dan nilai digit bagi angka 5 dalam nombor 58?',
                'option_a' => 'Puluh, 50',
                'option_b' => 'Sa, 5',
                'option_c' => 'Puluh, 5',
                'option_d' => 'Ratus, 500',
                'correct_option' => 'a',
            ]);

            $kssrTahun1->assessments()->create([
                'question' => 'Bundarkan nombor 65 kepada puluh yang terdekat.',
                'option_a' => '60',
                'option_b' => '70',
                'option_c' => '50',
                'option_d' => '65',
                'correct_option' => 'b',
            ]);

            $kssrTahun1->assessments()->create([
                'question' => 'Lengkapkan pola nombor bilang menaik lima-lima ini: 5, 10, 15, __, 25.',
                'option_a' => '16',
                'option_b' => '18',
                'option_c' => '20',
                'option_d' => '22',
                'correct_option' => 'c',
            ]);

            $kssrTahun1->assessments()->create([
                'question' => 'Kira hasil tambah dengan mengumpul semula: 18 + 34 = __.',
                'option_a' => '42',
                'option_b' => '52',
                'option_c' => '48',
                'option_d' => '62',
                'correct_option' => 'b',
            ]);

            $kssrTahun1->assessments()->create([
                'question' => 'Akid ada 63 biji guli. Dia beri 7 biji guli kepada Amar. Berapakah baki guli Akid?',
                'option_a' => '54',
                'option_b' => '56',
                'option_c' => '64',
                'option_d' => '70',
                'correct_option' => 'b',
            ]);
        }

        // -------------------------------------------------------------
        // 12. KPM KSSR Primary Mathematics Pilot: Tahun 2 (Jilid 2)
        // -------------------------------------------------------------
        $kssrTahun2 = Course::updateOrCreate(
            ['title' => 'Matematik Tahun 2 KSSR (Jilid 2): Pecahan, Wang, Masa, Ukuran & Bentuk'],
            [
                'description' => 'Program Rintis Sekolah Rendah KSSR berdasarkan Buku Teks Rasmi KPM Matematik Tahun 2 (Jilid 2). Merangkumi Pecahan & Perpuluhan, Wang Hingga RM100, Masa & Waktu, Ukuran Metrik, Bentuk 3D/2D, dan Carta Palang.',
                'instructor_id' => $staffId,
                'status' => 'published',
                'course_mode' => 'school',
                'academic_year' => 'KSSR Rendah · Tahun 2',
                'category_logo' => 'emerald',
                'billing_type' => 'free',
                'price' => 0.00,
                'cert_title' => 'Sijil Kemahiran Matematik KSSR · Tahun 2 (KPM)',
                'cert_url' => '/books/Buku Teks Matematik Tahun 2 Jilid 2.pdf',
                'bundle_title' => 'Buku Teks Rasmi KPM: Matematik Tahun 2 KSSR (Jilid 2) PDF',
                'bundle_url' => '/books/Buku Teks Matematik Tahun 2 Jilid 2.pdf',
            ]
        );

        $t2Mod1 = $kssrTahun2->modules()->updateOrCreate(
            ['course_id' => $kssrTahun2->id, 'order' => 1],
            [
                'title' => 'Unit 3 & 4 - Pecahan, Perpuluhan & Wang Hingga RM100',
                'description' => 'Kenali Pecahan Wajar (1/2 hingga 9/10), tukar pecahan persepuluh kepada perpuluhan (0.1 hingga 0.9), dan operasi Wang hingga RM100.',
                'duration' => 1400,
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=n0FZhQ_GkKw',
                'transcript' => "### Nota Ceria Unit 3 & 4: Pecahan, Perpuluhan & Wang Hingga RM100\n\n#### 1. Pecahan Wajar\n- Pecahan terdiri daripada **Pengangka** (nombor di atas) dan **Penyebut** (jumlah bahagian sama besar di bawah).\n- Contoh pecahan wajar: `1/2`, `1/4`, `3/4`, hingga `9/10`.\n\n#### 2. Tukar Pecahan Persepuluh kepada Perpuluhan\n- Pecahan dengan penyebut 10 boleh ditulis dalam bentuk nombor perpuluhan:\n  - `1/10 = 0.1` (sifar perpuluhan satu)\n  - `5/10 = 0.5` (sifar perpuluhan lima)\n  - `7/10 = 0.7` (sifar perpuluhan tujuh)\n\n#### 3. Banding Pecahan & Perpuluhan\n- Gunakan gambar rajah jalur atau garis nombor untuk membandingkan nilai yang lebih besar atau lebih kecil (contoh: `0.7` lebih besar daripada `0.3`).\n\n#### 4. Operasi Wang Hingga RM100 & Celik Wang\n- Pastikan titik perpuluhan antara **Ringgit (RM)** dan **Sen** disusun sebaris dalam bentuk lazim semasa menambah atau menolak wang.\n- Contoh: `RM90.00 - RM54.60 - RM27.00 = RM8.40`.",
            ]
        );

        $t2Mod1->lessons()->updateOrCreate(
            ['module_id' => $t2Mod1->id, 'order' => 1],
            [
                'title' => 'Subtopik 1.1: Pecahan Wajar, Perpuluhan & Pengiraan Wang RM100',
                'content_type' => 'video',
                'content_url' => 'https://www.youtube.com/watch?v=n0FZhQ_GkKw',
                'duration' => 700,
                'content' => "### Subtopik 1.1: Pecahan Persepuluh & Wang\n\n- **Pecahan kepada Perpuluhan**: `1/10 = 0.1`, `3/10 = 0.3`, `7/10 = 0.7`, `9/10 = 0.9`.\n- **Pengiraan Baki Wang**: Apabila menolak wang seperti `RM90.00 - RM54.60`, tulis `.00` pada nilai sen supaya mudah mengumpul semula 1 ringgit kepada 100 sen.",
                'transcript' => 'Video pembelajaran Pecahan, Perpuluhan, dan Wang Tahun 2.',
            ]
        );

        $t2Mod1->lessons()->updateOrCreate(
            ['module_id' => $t2Mod1->id, 'order' => 2],
            [
                'title' => 'Subtopik 1.2: Rujukan Buku Teks KPM Matematik Tahun 2 Jilid 2 (PDF)',
                'content_type' => 'pdf',
                'content_url' => '/books/Buku Teks Matematik Tahun 2 Jilid 2.pdf',
                'duration' => 700,
                'content' => "### Buku Teks Rasmi KPM: Matematik Tahun 2 Jilid 2\n\nBaca dan muat turun Buku Teks Rasmi KPM Matematik Tahun 2 Jilid 2 untuk melihat ilustrasi penuh Pecahan, Perpuluhan, dan Wang.",
                'transcript' => 'Dokumen PDF Buku Teks KPM Matematik Tahun 2 Jilid 2.',
            ]
        );

        if ($kssrTahun2->assessments()->where('module_id', $t2Mod1->id)->count() === 0) {
            $kssrTahun2->assessments()->create([
                'module_id' => $t2Mod1->id,
                'question' => 'Tukarkan pecahan persepuluh 7/10 kepada nombor perpuluhan.',
                'option_a' => '0.07',
                'option_b' => '0.7',
                'option_c' => '7.0',
                'option_d' => '1.7',
                'correct_option' => 'b',
            ]);
            $kssrTahun2->assessments()->create([
                'module_id' => $t2Mod1->id,
                'question' => 'Antara 0.8 dan 0.4, nombor perpuluhan manakah yang lebih besar?',
                'option_a' => '0.8',
                'option_b' => '0.4',
                'option_c' => 'Kedua-duanya sama besar',
                'option_d' => 'Tiada jawapan',
                'correct_option' => 'a',
            ]);
        }

        $t2Mod2 = $kssrTahun2->modules()->updateOrCreate(
            ['course_id' => $kssrTahun2->id, 'order' => 2],
            [
                'title' => 'Unit 5 & 6 - Masa dan Waktu & Panjang, Jisim, Isi Padu Cecair',
                'description' => 'Kenali senggatan minit pada muka jam (suku jam, setengah jam, 1 jam) dan unit ukuran metrik (cm, m, g, kg, ml, l).',
                'duration' => 1400,
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=HrxZWNu72WI',
                'transcript' => "### Nota Ceria Unit 5 & 6: Masa dan Waktu & Ukuran Metrik\n\n#### 1. Kenali Senggatan Minit & Perkaitan Waktu\n- Setiap selang antara dua nombor pada muka jam bernilai **5 minit**.\n- **Suku jam** = `15 minit` (jarum minit bergerak dari 12 ke 3).\n- **Setengah jam** = `30 minit` (jarum minit bergerak setengah pusingan dari 12 ke 6).\n- **1 jam** = `60 minit` (satu pusingan lengkap).\n- **1 hari** = `24 jam`.\n\n#### 2. Ukuran Metrik (Panjang, Jisim & Isi Padu Cecair)\n- **Panjang**: Sentimeter (`cm`) untuk objek pendek (pensel, buku) dan Meter (`m`) untuk objek panjang (papan tulis, bilik darjah).\n- **Jisim**: Gram (`g`) untuk objek ringan dan Kilogram (`kg`) untuk objek berat (kampit beras).\n- **Isi Padu Cecair**: Mililiter (`ml`) untuk cecair sedikit (sebotol kecil ubat vitamin, sudu sirap) dan Liter (`l`) untuk cecair banyak (botol air besar, baldi).",
            ]
        );

        $t2Mod2->lessons()->updateOrCreate(
            ['module_id' => $t2Mod2->id, 'order' => 1],
            [
                'title' => 'Subtopik 2.1: Membaca Muka Jam Minit & Sukatan Metrik (cm, m, g, kg, ml, l)',
                'content_type' => 'video',
                'content_url' => 'https://www.youtube.com/watch?v=HrxZWNu72WI',
                'duration' => 800,
                'content' => "### Subtopik 2.1: Muka Jam & Unit Sukatan\n\n- Bilang gandaan 5 pada nombor jam: Nombor 1 = 5 minit, Nombor 3 = 15 minit (suku jam), Nombor 6 = 30 minit (setengah jam).\n- Pilih unit yang sesuai: Ubat cecair dalam botol kecil disukat menggunakan **mililiter (ml)**.",
                'transcript' => 'Video penerangan masa dan sukatan metrik Tahun 2.',
            ]
        );

        if ($kssrTahun2->assessments()->where('module_id', $t2Mod2->id)->count() === 0) {
            $kssrTahun2->assessments()->create([
                'module_id' => $t2Mod2->id,
                'question' => 'Berapa minitkah bagi suku jam apabila jarum minit bergerak dari nombor 12 ke nombor 3?',
                'option_a' => '5 minit',
                'option_b' => '15 minit',
                'option_c' => '30 minit',
                'option_d' => '45 minit',
                'correct_option' => 'b',
            ]);
        }

        $t2Mod3 = $kssrTahun2->modules()->updateOrCreate(
            ['course_id' => $kssrTahun2->id, 'order' => 3],
            [
                'title' => 'Unit 7 & 8 - Bentuk 3D/2D & Pengumpulan Data (Carta Palang)',
                'description' => 'Kenali ciri bentuk 3D (Kubus, Kuboid, Piramid, Kon, Silinder & Bentangan), bentuk 2D, cara kumpul data (gundal), dan membaca Carta Palang.',
                'duration' => 1400,
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=guNdJ5MtX1A',
                'transcript' => "### Nota Ceria Unit 7 & 8: Bentuk 3D/2D & Pengumpulan Data\n\n#### 1. Ciri-Ciri Bentuk Tiga Dimensi (3D) & Bentangan\n- **Kubus**: 6 permukaan rata yang semuanya sama besar (segi empat sama), 8 bucu, dan 12 sisi lurus.\n- **Kuboid**: 6 permukaan rata berbentuk segi empat tepat/sama, 8 bucu, dan 12 sisi lurus.\n- **Piramid Tapak Segi Empat Sama**: 5 permukaan rata (1 tapak segi empat sama + 4 segi tiga), 5 bucu, dan 8 sisi lurus.\n- **Silinder**: 2 permukaan rata berbentuk bulatan, 1 permukaan melengkung, tiada bucu.\n- **Kon**: 1 permukaan rata (bulatan), 1 permukaan melengkung, dan 1 bucu.\n\n#### 2. Bentuk Dua Dimensi (2D)\n- Bulatan, Segi Tiga, Segi Empat Sama (4 sisi sama panjang), dan Segi Empat Tepat.\n\n#### 3. Kumpul Data (Gundal) & Membaca Carta Palang\n- Gunakan tanda **gundal** (ikat 5-5) untuk mengira kekerapan objek.\n- Baca tajuk, paksi mendatar, dan paksi mencancang pada **Carta Palang** untuk menjawab soalan.",
            ]
        );

        $t2Mod3->lessons()->updateOrCreate(
            ['module_id' => $t2Mod3->id, 'order' => 1],
            [
                'title' => 'Subtopik 3.1: Kenali Ciri Bentuk 3D, Bentangan & Carta Palang',
                'content_type' => 'video',
                'content_url' => 'https://www.youtube.com/watch?v=guNdJ5MtX1A',
                'duration' => 800,
                'content' => "### Subtopik 3.1: Bentuk 3D & Carta Palang\n\n- **Kubus** mempunyai 6 permukaan rata sama besar, 8 bucu, dan 12 sisi lurus.\n- **Carta Palang** memaparkan bilangan data menggunakan palang mencancang atau mendatar supaya mudah dibandingkan.",
                'transcript' => 'Video pembelajaran Bentuk 3D/2D dan Carta Palang Tahun 2.',
            ]
        );

        if ($kssrTahun2->assessments()->where('module_id', $t2Mod3->id)->count() === 0) {
            $kssrTahun2->assessments()->create([
                'module_id' => $t2Mod3->id,
                'question' => 'Bentuk 3D manakah yang mempunyai 1 permukaan rata berbentuk bulatan, 1 permukaan melengkung, dan 1 bucu?',
                'option_a' => 'Kubus',
                'option_b' => 'Kon',
                'option_c' => 'Silinder',
                'option_d' => 'Kuboid',
                'correct_option' => 'b',
            ]);
        }

        if ($kssrTahun2->assessments()->whereNull('module_id')->count() === 0) {
            $kssrTahun2->assessments()->create([
                'question' => 'Tukarkan pecahan 7/10 kepada nombor perpuluhan.',
                'option_a' => '0.07',
                'option_b' => '0.7',
                'option_c' => '7.10',
                'option_d' => '1.7',
                'correct_option' => 'b',
            ]);

            $kssrTahun2->assessments()->create([
                'question' => 'Siti ada RM90. Dia membeli sebiji kek berharga RM54.60 dan hadiah berharga RM27. Berapakah baki wangnya?',
                'option_a' => 'RM8.40',
                'option_b' => 'RM9.40',
                'option_c' => 'RM18.40',
                'option_d' => 'RM35.40',
                'correct_option' => 'a',
            ]);

            $kssrTahun2->assessments()->create([
                'question' => 'Jarum minit bergerak setengah pusingan dari nombor 12 hingga nombor 6. Berapa minitkah itu?',
                'option_a' => '15 minit',
                'option_b' => '30 minit',
                'option_c' => '45 minit',
                'option_d' => '60 minit',
                'correct_option' => 'b',
            ]);

            $kssrTahun2->assessments()->create([
                'question' => 'Bentuk 3D manakah yang mempunyai 6 permukaan rata yang semuanya sama besar, 8 bucu, dan 12 sisi lurus?',
                'option_a' => 'Kubus',
                'option_b' => 'Kon',
                'option_c' => 'Silinder',
                'option_d' => 'Sfera',
                'correct_option' => 'a',
            ]);

            $kssrTahun2->assessments()->create([
                'question' => 'Apakah unit yang paling sesuai digunakan untuk menyukat isi padu sebotol kecil ubat vitamin adik?',
                'option_a' => 'Kilogram (kg)',
                'option_b' => 'Meter (m)',
                'option_c' => 'Mililiter (ml)',
                'option_d' => 'Liter (l)',
                'correct_option' => 'c',
            ]);
        }

        // -------------------------------------------------------------
        // 13. KPM KSSR Primary Mathematics Pilot: Tahun 3 (Jilid 2)
        // -------------------------------------------------------------
        $kssrTahun3 = Course::updateOrCreate(
            ['title' => 'Matematik Tahun 3 KSSR (Jilid 2): Wang, Masa, Ukuran Metrik, Prisma & Data'],
            [
                'description' => 'Program Rintis Sekolah Rendah KSSR berdasarkan Buku Teks Rasmi KPM Matematik Tahun 3 (Jilid 2). Merangkumi Wang Hingga RM10,000 & Mata Wang ASEAN, Pertukaran Unit Masa & Metrik, Prisma & Poligon Sekata, Paksi Simetri, Kedudukan, dan Carta Pai.',
                'instructor_id' => $staffId,
                'status' => 'published',
                'course_mode' => 'school',
                'academic_year' => 'KSSR Rendah · Tahun 3',
                'category_logo' => 'blue',
                'billing_type' => 'free',
                'price' => 0.00,
                'cert_title' => 'Sijil Kemahiran Matematik KSSR · Tahun 3 (KPM)',
                'cert_url' => '/books/Buku Teks Matematik Tahun 3 Jilid 2.pdf',
                'bundle_title' => 'Buku Teks Rasmi KPM: Matematik Tahun 3 KSSR (Jilid 2) PDF',
                'bundle_url' => '/books/Buku Teks Matematik Tahun 3 Jilid 2.pdf',
            ]
        );

        $t3Mod1 = $kssrTahun3->modules()->updateOrCreate(
            ['course_id' => $kssrTahun3->id, 'order' => 1],
            [
                'title' => 'Unit 4 - Wang Hingga RM10,000, Mata Wang ASEAN & Celik Wang',
                'description' => 'Operasi tambah, tolak, darab, dan bahagi wang hingga RM10,000, mengenali mata wang negara ASEAN, serta pengurusan simpanan dan pelaburan.',
                'duration' => 1500,
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=Wn7e9nB3k8w',
                'transcript' => "### Nota Ceria Unit 4: Wang Hingga RM10,000, Mata Wang ASEAN & Celik Wang\n\n#### 1. Operasi Wang Hingga RM10,000\n- Lakukan operasi tambah, tolak, darab, dan bahagi melibatkan nilai wang sehingga **RM10,000** dalam bentuk lazim.\n\n#### 2. Kenal Mata Wang Negara ASEAN\n- **Malaysia**: Ringgit (RM)\n- **Singapura & Brunei**: Dolar (\$)\n- **Thailand**: Baht (฿)\n- **Indonesia**: Rupiah (Rp)\n- **Filipina**: Peso (₱)\n- **Vietnam**: Dong (₫)\n- **Laos**: Kip (₭)\n- **Kemboja**: Riel\n- **Myanmar**: Kyat\n\n#### 3. Celik Wang: Keperluan vs Kehendak, Simpanan & Pelaburan\n- **Keperluan**: Barang asas yang mesti ada untuk terus hidup (makanan, tempat tinggal, pakaian sekolah).\n- **Kehendak**: Barang pelengkap untuk keselesaan (permainan video, coklat mewah).",
            ]
        );

        $t3Mod1->lessons()->updateOrCreate(
            ['module_id' => $t3Mod1->id, 'order' => 1],
            [
                'title' => 'Subtopik 1.1: Operasi Wang Hingga RM10,000 & Mata Wang Negara ASEAN',
                'content_type' => 'video',
                'content_url' => 'https://www.youtube.com/watch?v=Wn7e9nB3k8w',
                'duration' => 750,
                'content' => "### Subtopik 1.1: Mata Wang ASEAN & Celik Wang\n\n- Ingat mata wang negara jiran utama kita: **Thailand menggunakan Baht**, **Indonesia menggunakan Rupiah**, **Singapura dan Brunei menggunakan Dolar**, dan **Filipina menggunakan Peso**.\n- Utamakan **Keperluan** sebelum berbelanja untuk **Kehendak**.",
                'transcript' => 'Video pembelajaran Wang dan Mata Wang ASEAN Tahun 3.',
            ]
        );

        $t3Mod1->lessons()->updateOrCreate(
            ['module_id' => $t3Mod1->id, 'order' => 2],
            [
                'title' => 'Subtopik 1.2: Rujukan Buku Teks KPM Matematik Tahun 3 Jilid 2 (PDF)',
                'content_type' => 'pdf',
                'content_url' => '/books/Buku Teks Matematik Tahun 3 Jilid 2.pdf',
                'duration' => 750,
                'content' => "### Buku Teks Rasmi KPM: Matematik Tahun 3 Jilid 2\n\nSemak dan muat turun Buku Teks Rasmi KPM Matematik Tahun 3 Jilid 2 untuk latihan lengkap Unit 4 hingga Unit 9.",
                'transcript' => 'Dokumen PDF Buku Teks KPM Matematik Tahun 3 Jilid 2.',
            ]
        );

        if ($kssrTahun3->assessments()->where('module_id', $t3Mod1->id)->count() === 0) {
            $kssrTahun3->assessments()->create([
                'module_id' => $t3Mod1->id,
                'question' => 'Apakah mata wang rasmi bagi negara Thailand dan Indonesia?',
                'option_a' => 'Baht dan Rupiah',
                'option_b' => 'Peso dan Dong',
                'option_c' => 'Dolar dan Kyat',
                'option_d' => 'Yen dan Won',
                'correct_option' => 'a',
            ]);
        }

        $t3Mod2 = $kssrTahun3->modules()->updateOrCreate(
            ['course_id' => $kssrTahun3->id, 'order' => 2],
            [
                'title' => 'Unit 5 & 6 - Masa (Saat, Minit, Jam) & Pertukaran Unit Panjang, Jisim, Isi Padu',
                'description' => 'Kuasai formula pertukaran unit masa (1 minit = 60 saat) dan ukuran metrik (1 m = 100 cm, 1 kg = 1,000 g, 1 l = 1,000 ml).',
                'duration' => 1500,
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=kOJFSH_Bn9U',
                'transcript' => "### Nota Ceria Unit 5 & 6: Pertukaran Unit Masa & Ukuran Metrik\n\n#### 1. Perkaitan Unit Masa\n- **1 minit = 60 saat** (Contoh: `4 minit = 4 x 60 saat = 240 saat`).\n- **1 jam = 60 minit**.\n- **1 minggu = 7 hari**.\n- **1 tahun = 12 bulan**.\n\n#### 2. Formula Pertukaran Unit Panjang, Jisim & Isi Padu Cecair\n- **Panjang**: `1 m = 100 cm` (Contoh: `9 m 20 cm = 900 cm + 20 cm = 920 cm`).\n- **Jisim**: `1 kg = 1,000 g` (Contoh: `3 kg 500 g = 3,500 g`).\n- **Isi Padu Cecair**: `1 l = 1,000 ml` (Contoh: `2 l 250 ml = 2,250 ml`).\n- **Operasi Darab Ukuran**: Untuk `6 x 6 m 80 cm`, darabkan `6 x 80 cm = 480 cm` (`4 m 80 cm`), kemudian `6 x 6 m = 36 m`. Jumlahkan `36 m + 4 m 80 cm = 40 m 80 cm`.",
            ]
        );

        $t3Mod2->lessons()->updateOrCreate(
            ['module_id' => $t3Mod2->id, 'order' => 1],
            [
                'title' => 'Subtopik 2.1: Pertukaran Unit Masa (Saat & Minit) serta Ukuran (m, cm, kg, g, l, ml)',
                'content_type' => 'video',
                'content_url' => 'https://www.youtube.com/watch?v=kOJFSH_Bn9U',
                'duration' => 900,
                'content' => "### Subtopik 2.1: Formula Pantas Pertukaran Unit\n\n- **Masa**: Darab 60 untuk menukar minit kepada saat (`4 minit x 60 = 240 saat`).\n- **Panjang**: Darab 100 untuk menukar meter kepada sentimeter (`9 m 20 cm = 900 cm + 20 cm = 920 cm`).",
                'transcript' => 'Video pembelajaran pertukaran unit masa dan metrik Tahun 3.',
            ]
        );

        if ($kssrTahun3->assessments()->where('module_id', $t3Mod2->id)->count() === 0) {
            $kssrTahun3->assessments()->create([
                'module_id' => $t3Mod2->id,
                'question' => 'Tukarkan 9 m 20 cm kepada unit sentimeter (cm).',
                'option_a' => '92 cm',
                'option_b' => '902 cm',
                'option_c' => '920 cm',
                'option_d' => '9200 cm',
                'correct_option' => 'c',
            ]);
        }

        $t3Mod3 = $kssrTahun3->modules()->updateOrCreate(
            ['course_id' => $kssrTahun3->id, 'order' => 3],
            [
                'title' => 'Unit 7, 8 & 9 - Prisma, Poligon Sekata, Paksi Simetri, Kedudukan & Carta Pai',
                'description' => 'Kenali Prisma vs Bukan Prisma, Poligon Sekata (Pentagon hingga Oktagon), Paksi Simetri, Koordinat Kedudukan, dan Carta Pai.',
                'duration' => 1500,
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=zI3rUMrRLF8',
                'transcript' => "### Nota Ceria Unit 7, 8 & 9: Prisma, Poligon Sekata, Paksi Simetri & Data\n\n#### 1. Kenali Prisma vs Bukan Prisma\n- **Prisma** mempunyai **2 tapak rata yang bertentangan dan sama bentuk/saiz**, serta permukaan rata yang lain berbentuk segi empat tepat (tiada permukaan melengkung).\n- Jenis Prisma Tahun 3:\n  1. **Prisma Segi Empat Sama** (Kubus)\n  2. **Prisma Segi Empat Tepat** (Kuboid)\n  3. **Prisma Segi Tiga**\n- **Bukan Prisma**: Sfera, Kon, Silinder (kerana ada permukaan melengkung) dan Piramid (kerana hanya ada 1 tapak dan bertemu di puncak).\n\n#### 2. Poligon Sekata (Sisi Lurus Sama Panjang)\n- **Pentagon**: 5 sisi lurus sama panjang dan 5 bucu.\n- **Heksagon**: 6 sisi lurus sama panjang dan 6 bucu.\n- **Heptagon**: 7 sisi lurus sama panjang dan 7 bucu.\n- **Oktagon**: 8 sisi lurus sama panjang dan 8 bucu.\n\n#### 3. Paksi Simetri, Kedudukan & Carta Pai\n- **Paksi Simetri**: Garis lurus yang membahagikan bentuk kepada dua bahagian yang sama saiz dan bentuk apabila dilipat.\n- **Kedudukan**: Baca lajur (paksi mengufuk) dahulu diikuti baris (paksi mencancang).",
            ]
        );

        $t3Mod3->lessons()->updateOrCreate(
            ['module_id' => $t3Mod3->id, 'order' => 1],
            [
                'title' => 'Subtopik 3.1: Prisma, Poligon Sekata (Pentagon - Oktagon) & Paksi Simetri',
                'content_type' => 'video',
                'content_url' => 'https://www.youtube.com/watch?v=zI3rUMrRLF8',
                'duration' => 900,
                'content' => "### Subtopik 3.1: Prisma & Poligon Sekata\n\n- **Prisma Segi Empat Tepat (Kuboid)** ialah sebuah prisma kerana mempunyai 2 tapak rata yang kongruen dan tiada permukaan melengkung.\n- **Oktagon** mempunyai **8 sisi lurus** yang sama panjang dan **8 bucu**.",
                'transcript' => 'Video pembelajaran Prisma dan Poligon Sekata Tahun 3.',
            ]
        );

        if ($kssrTahun3->assessments()->where('module_id', $t3Mod3->id)->count() === 0) {
            $kssrTahun3->assessments()->create([
                'module_id' => $t3Mod3->id,
                'question' => 'Apakah nama poligon sekata yang mempunyai 8 sisi lurus sama panjang dan 8 bucu?',
                'option_a' => 'Pentagon',
                'option_b' => 'Heksagon',
                'option_c' => 'Heptagon',
                'option_d' => 'Oktagon',
                'correct_option' => 'd',
            ]);
        }

        if ($kssrTahun3->assessments()->whereNull('module_id')->count() === 0) {
            $kssrTahun3->assessments()->create([
                'question' => 'Apakah mata wang rasmi bagi negara jiran Thailand dan Indonesia?',
                'option_a' => 'Baht dan Rupiah',
                'option_b' => 'Peso dan Dong',
                'option_c' => 'Dolar dan Riel',
                'option_d' => 'Kyat dan Kip',
                'correct_option' => 'a',
            ]);

            $kssrTahun3->assessments()->create([
                'question' => 'Ibu merebus telur selama 4 minit. Nyatakan masa tersebut dalam unit saat.',
                'option_a' => '120 saat',
                'option_b' => '180 saat',
                'option_c' => '240 saat',
                'option_d' => '400 saat',
                'correct_option' => 'c',
            ]);

            $kssrTahun3->assessments()->create([
                'question' => 'Tukarkan ukuran panjang 9 m 20 cm kepada unit sentimeter (cm).',
                'option_a' => '92 cm',
                'option_b' => '902 cm',
                'option_c' => '920 cm',
                'option_d' => '9200 cm',
                'correct_option' => 'c',
            ]);

            $kssrTahun3->assessments()->create([
                'question' => 'Antara bentuk berikut, yang manakah merupakan sebuah Prisma?',
                'option_a' => 'Sfera',
                'option_b' => 'Kon',
                'option_c' => 'Kuboid / Prisma Segi Empat Tepat',
                'option_d' => 'Silinder',
                'correct_option' => 'c',
            ]);

            $kssrTahun3->assessments()->create([
                'question' => 'Apakah nama poligon sekata yang mempunyai 8 bucu dan 8 sisi lurus yang sama panjang?',
                'option_a' => 'Pentagon',
                'option_b' => 'Heksagon',
                'option_c' => 'Heptagon',
                'option_d' => 'Oktagon',
                'correct_option' => 'd',
            ]);
        }

        // -------------------------------------------------------------
        // 14. KSSM Secondary Mathematics Pilot: Tingkatan 1 (13 bab), Tingkatan 4 (10 bab), Matematik Tambahan Tingkatan 4 (10 bab)
        // Chapter content lives in kssm_curriculum.php
        // -------------------------------------------------------------
        foreach (require __DIR__ . '/kssm_curriculum.php' as $def) {
            $course = Course::updateOrCreate(
                ['title' => $def['title']],
                [
                    'description' => $def['description'],
                    'instructor_id' => $staffId,
                    'status' => 'published',
                    'course_mode' => 'school',
                    'academic_year' => $def['academic_year'],
                    'category_logo' => $def['category_logo'],
                    'billing_type' => 'free',
                    'price' => 0.00,
                    'cert_title' => $def['cert_title'],
                    'cert_url' => $def['pdf'],
                    'bundle_title' => $def['bundle_title'],
                    'bundle_url' => $def['pdf'],
                ]
            );

            foreach ($def['chapters'] as $i => $chapter) {
                $this->seedKssmChapter($course, $i + 1, $chapter, $def['pdf']);
            }
            $this->seedKssmFinal($course, $def['final']);
        }

        // Ensure all adult/professional courses default to 'certification' and KSSR courses to 'school'
        Course::whereNull('course_mode')->update(['course_mode' => 'certification']);
        Course::where('title', 'like', '%KSSR%')
            ->orWhere('academic_year', 'like', '%KSSR%')
            ->update(['course_mode' => 'school']);
    }

    private function seedKssmChapter(Course $course, int $order, array $chapter, string $pdf): void
    {
        $video = 'https://www.youtube.com/watch?v=' . $chapter['v'];
        $notes = implode("\n", array_map(fn ($n) => "- {$n}", $chapter['notes']));

        $module = $course->modules()->updateOrCreate(
            ['course_id' => $course->id, 'order' => $order],
            [
                'title' => $chapter['title'],
                'description' => $chapter['sub'],
                'duration' => 1500,
                'content_type' => 'link',
                'media_url' => $video,
                'transcript' => "### Nota {$chapter['title']}\n\n{$notes}",
            ]
        );

        $lessons = [
            ['title' => "Subtopik {$order}.1: {$chapter['sub']}", 'type' => 'video', 'url' => $video, 'content' => $notes],
            ['title' => "Subtopik {$order}.2: Rujukan Buku Teks Bab {$order} (PDF)", 'type' => 'pdf', 'url' => $pdf, 'content' => "Rujuk Bab {$order} dalam buku teks rasmi KPM."],
        ];
        foreach ($lessons as $i => $lesson) {
            $module->lessons()->updateOrCreate(
                ['module_id' => $module->id, 'order' => $i + 1],
                [
                    'title' => $lesson['title'],
                    'content_type' => $lesson['type'],
                    'content_url' => $lesson['url'],
                    'duration' => 750,
                    'content' => "### {$lesson['title']}\n\n{$lesson['content']}",
                    'transcript' => $lesson['title'],
                ]
            );
        }

        // Replace (not append) so reseeding never leaves stale questions from an older chapter layout.
        $course->assessments()->where('module_id', $module->id)->delete();
        foreach ($chapter['quiz'] as $q) {
            $course->assessments()->create($this->kssmQuestion($q) + ['module_id' => $module->id]);
        }
    }

    private function seedKssmFinal(Course $course, array $questions): void
    {
        if ($course->assessments()->whereNull('module_id')->count() === 0) {
            foreach ($questions as $q) {
                $course->assessments()->create($this->kssmQuestion($q));
            }
        }
    }

    private function kssmQuestion(array $q): array
    {
        [$question, $options, $correct] = $q;

        return [
            'question' => $question,
            'option_a' => $options[0],
            'option_b' => $options[1],
            'option_c' => $options[2],
            'option_d' => $options[3],
            'correct_option' => $correct,
        ];
    }
}