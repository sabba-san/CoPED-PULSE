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

        $staffB = User::where('email', 'instructor@coped.org')->first()
            ?? $staffA;

        $staffId = $staffA ? $staffA->id : 1;
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

        if ($aiCourse->assessments()->count() === 0) {
            $aiCourse->assessments()->create([
                'question' => 'what does the fox say ?',
                'option_a' => 'meow',
                'option_b' => 'AAA',
                'option_c' => 'Artificial intelligence',
                'option_d' => 'VVV',
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
    }
}