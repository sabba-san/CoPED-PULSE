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
            ?? User::where('role', 'staff')->first();

        $staffB = User::where('email', 'instructor@coped.org')->first()
            ?? $staffA;

        // -------------------------------------------------------------
        // 1. Intro to AI (The user's authored course)
        // -------------------------------------------------------------
        $aiCourse = Course::firstOrCreate(
            ['title' => 'Intro to Ai'],
            [
                'description' => 'testing 123',
                'instructor_id' => $staffA ? $staffA->id : 1,
                'status' => 'published',
            ]
        );

        if ($aiCourse->modules()->count() === 0) {
            $aiCourse->modules()->create([
                'title' => 'Chapter-1st Intro to ai',
                'description' => 'Fundamental concepts of artificial intelligence, machine learning history, and real-world applications.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=ad79nYk2keg&pp=ygUKd2hhdCBpcyBhaQ%3D%3D',
                'order' => 1,
            ]);

            $aiCourse->modules()->create([
                'title' => 'Chapter-2 ai',
                'description' => 'Core AI paradigms: supervised learning, unsupervised learning, and neural network fundamentals.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=PDMcpthR88U',
                'order' => 2,
            ]);

            $aiCourse->modules()->create([
                'title' => 'chaprter 3',
                'description' => 'Interactive deep learning demonstration, modern LLMs, and ethical considerations in AI.',
                'content_type' => 'embed',
                'media_url' => 'https://www.youtube.com/embed/aircAruvnKk',
                'order' => 3,
            ]);
        }

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
        // 2. Enhanced Maritime Cyber Security (JLM)
        // -------------------------------------------------------------
        $maritimeCourse = Course::firstOrCreate(
            ['title' => 'Keselamatan Siber & Perlindungan Data Maritim Lanjutan (JLM)'],
            [
                'description' => 'Modul interaktif khas untuk warga Jabatan Laut Malaysia bagi mengenalpasti ancaman siber maritim, keselamatan sistem navigasi, dan perlindungan data rasmi.',
                'instructor_id' => $staffA ? $staffA->id : 1,
                'status' => 'published',
            ]
        );

        if ($maritimeCourse->modules()->count() === 0) {
            $m1 = $maritimeCourse->modules()->create([
                'title' => 'Topik 1: Ancaman Siber Terhadap Sistem Maritim & VTS',
                'description' => 'Ketahui risiko serangan ke atas Sistem Pengurusan Trafik Vab (VTS), GPS Spoofing, dan percubaan pencerobohan pangkalan data pelabuhan.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=ad79nYk2keg',
                'order' => 1,
            ]);
            $m1->lessons()->create([
                'title' => 'Subtopik 1.1: Pengenalan kepada VTS & Kerentanan Rangkaian',
                'content_type' => 'link',
                'content_url' => 'https://www.youtube.com/watch?v=ad79nYk2keg',
                'order' => 1,
            ]);

            $m2 = $maritimeCourse->modules()->create([
                'title' => 'Topik 2: Keselamatan Emel & Serangan Phishing Sasaran',
                'description' => 'Teknik mengenalpasti e-mel palsu yang menyamar sebagai pihak pengurusan tertinggi JLM atau agensi antarabangsa IMO.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=PDMcpthR88U',
                'order' => 2,
            ]);
            $m2->lessons()->create([
                'title' => 'Subtopik 2.1: Analisis Header Emel & Domain Palsu',
                'content_type' => 'link',
                'content_url' => 'https://www.youtube.com/watch?v=PDMcpthR88U',
                'order' => 1,
            ]);

            $m3 = $maritimeCourse->modules()->create([
                'title' => 'Topik 3: Protokol Tindak Balas Insiden & Pelaporan Rasmi',
                'description' => 'Langkah pantas apabila mengesyaki berlakunya ketirisan data sulit perkapalan atau jangkitan perisian tebusan (ransomware).',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/embed/aircAruvnKk',
                'order' => 3,
            ]);
            $m3->lessons()->create([
                'title' => 'Subtopik 3.1: Pelan Pengasingan Peranti (Network Air-Gapping)',
                'content_type' => 'link',
                'content_url' => 'https://www.youtube.com/embed/aircAruvnKk',
                'order' => 1,
            ]);
        }

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
        // 3. Child Protection Fundamentals
        // -------------------------------------------------------------
        $cpFund = Course::firstOrCreate(
            ['title' => 'Child Protection Fundamentals'],
            [
                'description' => 'Core principles and legal frameworks for child protection in humanitarian settings. Covers UNCRC, mandatory reporting, and referral pathways.',
                'instructor_id' => $staffB ? $staffB->id : 1,
                'status' => 'published',
            ]
        );

        if ($cpFund->modules()->count() === 0) {
            $cpFund->modules()->create([
                'title' => 'Unit 1: UNCRC & International Legal Frameworks',
                'description' => 'Understanding the UN Convention on the Rights of the Child (UNCRC) and state obligations.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=ad79nYk2keg',
                'order' => 1,
            ]);
            $cpFund->modules()->create([
                'title' => 'Unit 2: Identifying Vulnerabilities & Risk Indicators',
                'description' => 'Recognizing signs of neglect, physical abuse, psychological harm, and environmental risks.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=PDMcpthR88U',
                'order' => 2,
            ]);
            $cpFund->modules()->create([
                'title' => 'Unit 3: Mandatory Reporting & Multi-Agency Referral',
                'description' => 'Legal reporting responsibilities, inter-agency communication, and keeping the child safe.',
                'content_type' => 'embed',
                'media_url' => 'https://www.youtube.com/embed/aircAruvnKk',
                'order' => 3,
            ]);
        }

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
        // 4. Psychosocial Support for Children
        // -------------------------------------------------------------
        $pssCourse = Course::firstOrCreate(
            ['title' => 'Psychosocial Support for Children'],
            [
                'description' => 'Evidence-based approaches to providing psychosocial support to children affected by crisis. Includes PFA, safe spaces, and caregiver engagement.',
                'instructor_id' => $staffB ? $staffB->id : 1,
                'status' => 'published',
            ]
        );

        if ($pssCourse->modules()->count() === 0) {
            $pssCourse->modules()->create([
                'title' => 'Unit 1: Psychological First Aid (PFA) for Minors',
                'description' => 'Core action principles: Look, Listen, and Link in humanitarian crisis settings.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=ad79nYk2keg',
                'order' => 1,
            ]);
            $pssCourse->modules()->create([
                'title' => 'Unit 2: Designing Child-Friendly Safe Spaces',
                'description' => 'Setting up secure, stimulating physical spaces that support healing and peer socialization.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=PDMcpthR88U',
                'order' => 2,
            ]);
            $pssCourse->modules()->create([
                'title' => 'Unit 3: Caregiver & Family Engagement',
                'description' => 'Strengthening caregiver capacity and resilience during displacement or trauma.',
                'content_type' => 'embed',
                'media_url' => 'https://www.youtube.com/embed/aircAruvnKk',
                'order' => 3,
            ]);
        }

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
        // 5. Case Management in Child Protection
        // -------------------------------------------------------------
        $cmCourse = Course::firstOrCreate(
            ['title' => 'Case Management in Child Protection'],
            [
                'description' => 'Step-by-step case management methodology: identification, assessment, planning, implementation, monitoring, and closure. Best practices for documentation.',
                'instructor_id' => $staffB ? $staffB->id : 1,
                'status' => 'published',
            ]
        );

        if ($cmCourse->modules()->count() === 0) {
            $cmCourse->modules()->create([
                'title' => 'Unit 1: Step 1-2: Identification & Needs Assessment',
                'description' => 'Immediate intake, informed consent/assent, and safety planning.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=ad79nYk2keg',
                'order' => 1,
            ]);
            $cmCourse->modules()->create([
                'title' => 'Unit 2: Step 3-4: Action Planning & Multi-Agency Referral',
                'description' => 'Developing child-centered case plans and coordinating specialist medical or legal support.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=PDMcpthR88U',
                'order' => 2,
            ]);
            $cmCourse->modules()->create([
                'title' => 'Unit 3: Step 5-6: Case Monitoring, Evaluation & Safe Closure',
                'description' => 'Periodic case review, family stabilization indicators, and safe case transition.',
                'content_type' => 'embed',
                'media_url' => 'https://www.youtube.com/embed/aircAruvnKk',
                'order' => 3,
            ]);
        }

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
        // 6. Child Safeguarding Policy Development (Draft)
        // -------------------------------------------------------------
        $safePolicy = Course::firstOrCreate(
            ['title' => 'Child Safeguarding Policy Development'],
            [
                'description' => 'How to develop and implement organizational child safeguarding policies. Risk assessment, code of conduct, and reporting mechanisms.',
                'instructor_id' => $staffB ? $staffB->id : 1,
                'status' => 'draft',
            ]
        );

        if ($safePolicy->modules()->count() === 0) {
            $safePolicy->modules()->create([
                'title' => 'Draft Unit 1: Organizational Risk Audit & Code of Conduct',
                'description' => 'Draft policies, vetting staff, and establishing clear behavioral boundaries.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=ad79nYk2keg',
                'order' => 1,
            ]);
        }

        // -------------------------------------------------------------
        // 7. Legacy Course: Basic Hygiene Promotion (Archived)
        // -------------------------------------------------------------
        $legacyCourse = Course::firstOrCreate(
            ['title' => 'Legacy Course: Basic Hygiene Promotion'],
            [
                'description' => 'Archived content. Superseded by WASH Integration module.',
                'instructor_id' => $staffB ? $staffB->id : 1,
                'status' => 'archived',
            ]
        );

        if ($legacyCourse->modules()->count() === 0) {
            $legacyCourse->modules()->create([
                'title' => 'Archived Unit: WASH Principles for Emergency Camps',
                'description' => 'Archived lecture notes and historical health promotion guides.',
                'content_type' => 'link',
                'media_url' => 'https://www.youtube.com/watch?v=ad79nYk2keg',
                'order' => 1,
            ]);
        }
    }
}