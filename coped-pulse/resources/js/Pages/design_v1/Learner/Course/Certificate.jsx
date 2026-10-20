import { Head, Link, usePage } from '@inertiajs/react';
import LearnerLayout from '@/Layouts/design_v1/LearnerLayout';
import CourseLogoBadge, { LOGO_CONFIG } from '@/Components/flat/CourseLogoBadge';

const PRINT_CSS = `
@page { size: A4 landscape; margin: 10mm; }
@media print {
    html, body { background: #ffffff !important; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

function formatDate(value) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function Certificate({ course, enrollment }) {
    const { auth } = usePage().props;
    const learnerName = auth?.user?.name || 'CoPED Learner';
    const config = LOGO_CONFIG[course.category_logo] || LOGO_CONFIG.general;
    const Emblem = config.icon;

    const completedOn = formatDate(enrollment.completed_at || enrollment.updated_at);
    const verificationId = `COPED-${enrollment.id}-${course.id}`;
    const instructorName = course.instructor?.name || 'Faculty Instructor';

    return (
        <LearnerLayout>
            <Head title={`Certificate: ${course.title}`} />
            <style>{PRINT_CSS}</style>

            <div className="max-w-5xl mx-auto space-y-5 print:space-y-0 print:max-w-none">
                {/* Top Action Bar (hidden in print) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
                    <Link
                        href={route('learner.course.learn', course.id)}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-[#111827] hover:underline"
                    >
                        <span>&larr;</span>
                        <span>Back to Course</span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-[#10B981] text-white font-bold text-sm px-5 py-2.5 rounded transition-colors duration-200"
                    >
                        <span>&#11015;</span>
                        <span>Download Certificate as PDF (1 Page)</span>
                    </button>
                </div>

                {/* Official CoPED PULSE Certificate Frame */}
                <section
                    aria-label="Certificate of Achievement"
                    className="relative bg-white border-4 border-[#111827] p-8 print:p-6 break-inside-avoid"
                >
                    <div className="border-2 border-[#E5E7EB] p-6 print:p-4 text-center space-y-5 print:space-y-3">
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
                        className="bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-lg p-5 print:p-3 flex flex-col md:flex-row md:items-center justify-between gap-4 print:gap-2 break-inside-avoid print:mt-3"
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
