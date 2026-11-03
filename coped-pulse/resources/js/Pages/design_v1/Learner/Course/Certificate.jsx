import { Head, Link, usePage } from '@inertiajs/react';
import LearnerLayout from '@/Layouts/design_v1/LearnerLayout';
import CourseLogoBadge, { LOGO_CONFIG } from '@/Components/flat/CourseLogoBadge';

const PRINT_CSS = `
@page { size: A4 landscape; margin: 0; }
@media print {
    html, body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
}
`;

function formatDate(value) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function escapePdfText(str) {
    if (!str) return '';
    const ascii = String(str)
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/[^\x20-\x7E]/g, ' ');
    return ascii.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function estimateTextWidth(text, fontSize) {
    if (!text) return 0;
    let width = 0;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (/[A-Z]/.test(c)) width += fontSize * 0.65;
        else if (/[a-z]/.test(c)) width += fontSize * 0.50;
        else if (/[0-9]/.test(c)) width += fontSize * 0.55;
        else if (c === ' ') width += fontSize * 0.28;
        else width += fontSize * 0.5;
    }
    return width;
}

function generateCertificatePdf({ learnerName, courseTitle, completedOn, verificationId, academicYear, instructorName }) {
    const width = 842;
    const height = 595;

    const certTitle = 'CERTIFICATE OF ACHIEVEMENT';
    const subTitle1 = 'This is proudly presented to';
    const subTitle2 = 'for successfully completing the self-paced program';
    const masteryBadge = 'FINAL ASSESSMENT PASSED WITH 100% MASTERY';

    const certTitleX = Math.max(50, Math.round((width - estimateTextWidth(certTitle, 26)) / 2));
    const subTitle1X = Math.max(50, Math.round((width - estimateTextWidth(subTitle1, 13)) / 2));
    const learnerX = Math.max(50, Math.round((width - estimateTextWidth(learnerName, 28)) / 2));
    const subTitle2X = Math.max(50, Math.round((width - estimateTextWidth(subTitle2, 13)) / 2));
    const courseTitleX = Math.max(50, Math.round((width - estimateTextWidth(courseTitle, 22)) / 2));
    const masteryX = Math.max(50, Math.round((width - estimateTextWidth(masteryBadge, 11)) / 2));

    const streamLines = [
        'q',
        '1 1 1 rg',
        `0 0 ${width} ${height} re`,
        'f',
        // Outer border
        '0.07 0.09 0.15 RG',
        '6 w',
        `24 24 ${width - 48} ${height - 48} re`,
        'S',
        // Inner soft border
        '0.89 0.91 0.94 RG',
        '1.5 w',
        `34 34 ${width - 68} ${height - 68} re`,
        'S',
        // Emerald accent divider
        '0.06 0.73 0.51 RG',
        '2 w',
        `45 ${height - 90} ${width - 90} 0 re`,
        'S',
        'Q',
        // Header
        'BT',
        '/F2 13 Tf',
        '0.4 0.45 0.52 rg',
        '50 535 Td',
        `(${escapePdfText('UNIVERSITI UTARA MALAYSIA | COPED')}) Tj`,
        'ET',
        'BT',
        '/F2 22 Tf',
        '0.07 0.09 0.15 rg',
        '50 508 Td',
        `(${escapePdfText('CoPED PULSE')}) Tj`,
        'ET',
        'BT',
        '/F2 12 Tf',
        '0.06 0.73 0.51 rg',
        '645 520 Td',
        `(${escapePdfText('OFFICIAL CREDENTIAL')}) Tj`,
        'ET',
        // Main certificate titles
        'BT',
        '/F2 26 Tf',
        '0.07 0.09 0.15 rg',
        `${certTitleX} 435 Td`,
        `(${escapePdfText(certTitle)}) Tj`,
        'ET',
        'BT',
        '/F1 13 Tf',
        '0.3 0.35 0.42 rg',
        `${subTitle1X} 405 Td`,
        `(${escapePdfText(subTitle1)}) Tj`,
        'ET',
        'BT',
        '/F2 28 Tf',
        '0.06 0.73 0.51 rg',
        `${learnerX} 355 Td`,
        `(${escapePdfText(learnerName)}) Tj`,
        'ET',
        'BT',
        '/F1 13 Tf',
        '0.3 0.35 0.42 rg',
        `${subTitle2X} 320 Td`,
        `(${escapePdfText(subTitle2)}) Tj`,
        'ET',
        'BT',
        '/F2 22 Tf',
        '0.07 0.09 0.15 rg',
        `${courseTitleX} 280 Td`,
        `(${escapePdfText(courseTitle)}) Tj`,
        'ET',
        'BT',
        '/F2 11 Tf',
        '0.06 0.73 0.51 rg',
        `${masteryX} 250 Td`,
        `(${escapePdfText(masteryBadge)}) Tj`,
        'ET',
        // Metadata separator
        'q',
        '0.89 0.91 0.94 RG',
        '1 w',
        `60 180 ${width - 120} 0 re`,
        'S',
        'Q',
        // Metadata columns
        'BT',
        '/F2 9 Tf',
        '0.4 0.45 0.52 rg',
        '70 155 Td',
        `(${escapePdfText('ACADEMIC YEAR')}) Tj`,
        '/F2 11 Tf',
        '0.07 0.09 0.15 rg',
        '0 -18 Td',
        `(${escapePdfText(academicYear)}) Tj`,
        'ET',
        'BT',
        '/F2 9 Tf',
        '0.4 0.45 0.52 rg',
        '250 155 Td',
        `(${escapePdfText('COMPLETED ON')}) Tj`,
        '/F2 11 Tf',
        '0.07 0.09 0.15 rg',
        '0 -18 Td',
        `(${escapePdfText(completedOn)}) Tj`,
        'ET',
        'BT',
        '/F2 9 Tf',
        '0.4 0.45 0.52 rg',
        '440 155 Td',
        `(${escapePdfText('INSTRUCTOR')}) Tj`,
        '/F2 11 Tf',
        '0.07 0.09 0.15 rg',
        '0 -18 Td',
        `(${escapePdfText(instructorName)}) Tj`,
        'ET',
        'BT',
        '/F2 9 Tf',
        '0.4 0.45 0.52 rg',
        '630 155 Td',
        `(${escapePdfText('VERIFICATION ID')}) Tj`,
        '/F2 10 Tf',
        '0.06 0.73 0.51 rg',
        '0 -18 Td',
        `(${escapePdfText(verificationId)}) Tj`,
        'ET',
        // Footer note
        'BT',
        '/F1 9 Tf',
        '0.5 0.55 0.62 rg',
        '170 65 Td',
        `(${escapePdfText('Official verification record issued by Centre for Professional & Executive Development (CoPED), Universiti Utara Malaysia.')}) Tj`,
        'ET'
    ];

    const streamContent = streamLines.join('\n');
    const streamLength = new TextEncoder().encode(streamContent).length;

    const objects = [
        '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
        '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
        `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n`,
        '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
        '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
        `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`
    ];

    let offset = 0;
    const header = '%PDF-1.4\n';
    offset += new TextEncoder().encode(header).length;

    const xrefEntries = ['0000000000 65535 f \n'];
    let body = '';

    for (const obj of objects) {
        xrefEntries.push(String(offset).padStart(10, '0') + ' 00000 n \n');
        body += obj;
        offset += new TextEncoder().encode(obj).length;
    }

    const startXref = offset;
    const xref = `xref\n0 ${objects.length + 1}\n${xrefEntries.join('')}`;
    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

    return header + body + xref + trailer;
}

export default function Certificate({ course, enrollment }) {
    const { auth } = usePage().props;
    const learnerName = auth?.user?.name || 'CoPED Learner';
    const config = LOGO_CONFIG[course.category_logo] || LOGO_CONFIG.general;
    const Emblem = config.icon;

    const completedOn = formatDate(enrollment.completed_at || enrollment.updated_at);
    const verificationId = `COPED-${enrollment.id}-${course.id}`;
    const instructorName = course.instructor?.name || 'Faculty Instructor';
    const academicYear = course.academic_year || '2026 / 2027';

    const handleDownloadPdf = () => {
        const sanitizedTitle = (course.title || 'Course').replace(/[^a-zA-Z0-9_-]/g, '_');
        const pdfString = generateCertificatePdf({
            learnerName,
            courseTitle: course.title || 'Course',
            completedOn: completedOn || 'N/A',
            verificationId,
            academicYear,
            instructorName
        });

        const blob = new Blob([pdfString], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `CoPED-Certificate-${sanitizedTitle}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const handlePrint = () => {
        const sanitizedTitle = (course.title || 'Course').replace(/[^a-zA-Z0-9_-]/g, '_');
        const prevTitle = document.title;
        document.title = `CoPED-PULSE-Certificate-${sanitizedTitle}`;
        window.print();
        setTimeout(() => {
            document.title = prevTitle;
        }, 1000);
    };

    return (
        <LearnerLayout>
            <Head title={`Certificate: ${course.title}`} />
            <style>{PRINT_CSS}</style>

            <div className="max-w-5xl mx-auto space-y-5 print:space-y-0 print:max-w-none print:p-8">
                {/* Top Action Bar (hidden in print) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
                    <Link
                        href={route('learner.course.learn', course.id)}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-[#111827] hover:underline"
                    >
                        <span>&larr;</span>
                        <span>Back to Course</span>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            className="inline-flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm px-5 py-2.5 rounded-xl border border-[#059669] transition-colors duration-200"
                        >
                            <span>&#11015;</span>
                            <span>Download Official Certificate (PDF)</span>
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F8FAFC] text-[#111827] font-bold text-sm px-4 py-2.5 rounded-xl border border-[#E2E8F0] transition-colors duration-200"
                        >
                            <span>&#128438;</span>
                            <span>Print / Browser Copy</span>
                        </button>
                    </div>
                </div>

                {/* Official CoPED PULSE Certificate Frame */}
                <section
                    aria-label="Certificate of Achievement"
                    className="relative bg-white border border-[#111827] rounded-xl p-8 print:border-4 print:p-6 break-inside-avoid"
                >
                    <div className="border border-[#E2E8F0] rounded-lg p-6 print:p-4 text-center space-y-5 print:space-y-3">
                        {/* Header: institution + subject emblem */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="text-left">
                                <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                                    UUM CoPED
                                </p>
                                <p className="font-display text-lg font-extrabold text-[#111827] leading-tight">
                                    CoPED PULSE
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-md flex items-center justify-center ${config.bg} ${config.text}`}>
                                    <Emblem className="w-6 h-6" />
                                </div>
                                <CourseLogoBadge category={course.category_logo} size="badge" />
                            </div>
                        </div>

                        <div className="border-t-2 border-[#111827] pt-5 print:pt-3 space-y-2">
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">
                                Certificate of Achievement
                            </p>
                            <p className="text-sm text-gray-600">This is proudly presented to</p>
                            <h1 className="font-display text-4xl print:text-3xl font-black text-[#111827] break-words">
                                {learnerName}
                            </h1>
                            <p className="text-sm text-gray-600">
                                for successfully completing the self-paced program
                            </p>
                            <h2 className="font-display text-2xl print:text-xl font-extrabold text-[#111827] break-words">
                                {course.title}
                            </h2>
                            <p className="text-xs font-bold text-gray-600">
                                Final Assessment passed with 100%
                            </p>
                        </div>

                        {/* Metadata strip */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t-2 border-[#E5E7EB] pt-4 print:pt-3 text-left">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Academic Year</p>
                                <p className="text-sm font-bold text-[#111827]">{course.academic_year || '2026 / 2027'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Completed On</p>
                                <p className="text-sm font-bold text-[#111827]">{completedOn || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Instructor</p>
                                <p className="text-sm font-bold text-[#111827] break-words">{instructorName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Verification ID</p>
                                <p className="text-sm font-black text-[#111827] font-mono break-all">{verificationId}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Industry Certification Next-Step Card */}
                {course.cert_title && (
                    <section
                        aria-label="Industry certification pathway"
                        className="bg-[#FEF3C7] border border-[#F59E0B] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden"
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-2xl shrink-0 print:text-xl">&#127891;</span>
                            <div>
                                <h3 className="font-display font-extrabold text-base print:text-sm text-[#111827]">
                                    Official Industry Certification Pathway: {course.cert_title}
                                </h3>
                                <p className="text-xs text-gray-700 mt-0.5">
                                    You have completed the CoPED preparation curriculum. Use the official affiliation link below to register for your external certification exam.
                                </p>
                                {course.cert_url && (
                                    <p className="hidden print:block text-[10px] font-bold text-gray-700 mt-1 break-all">
                                        {course.cert_url}
                                    </p>
                                )}
                            </div>
                        </div>
                        {course.cert_url && (
                            <a
                                href={course.cert_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 bg-[#111827] hover:bg-[#3B82F6] text-white font-bold text-xs px-5 py-2.5 rounded shrink-0 transition-colors duration-200 print:hidden"
                            >
                                <span>Register at Official {course.cert_title} Portal</span>
                                <span>&#8599;</span>
                            </a>
                        )}
                    </section>
                )}
            </div>
        </LearnerLayout>
    );
}
