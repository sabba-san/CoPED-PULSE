import { Link } from '@inertiajs/react';
import CourseLogoBadge, { LOGO_CONFIG } from '@/Components/flat/CourseLogoBadge';
import {
    ArrowRightIcon,
    BookOpenIcon,
    CircleCheckIcon,
    GraduationCapIcon,
} from '@/Components/flat/icons';

export default function CatalogCourseCard({
    course,
    enrolled,
    isDetailsOpen,
    isMobileExpanded,
    onCardMouseEnter,
    onNavigate,
    onToggleDesktopDetails,
    onToggleMobileDetails,
    onEnrollClick,
}) {
    const isCommercial = course.billing_type !== 'free' && Number(course.price || 0) > 0;
    const themeConfig = LOGO_CONFIG[course.category_logo] || LOGO_CONFIG.charcoal || LOGO_CONFIG.general;
    const EmblemIcon = themeConfig?.icon;
    const isKssrCourse = Boolean(
        course.title?.includes('Tahun') ||
            course.title?.includes('KSSR') ||
            course.academic_year?.includes('KSSR')
    );

    return (
        <div
            role="link"
            tabIndex={0}
            aria-label={`Open ${course.title}`}
            onMouseEnter={onCardMouseEnter}
            onClick={(e) => {
                if (e.target.closest('button, a, input, select')) return;
                onNavigate();
            }}
            onKeyDown={(e) => {
                if (e.target.closest('button, a, input, select')) return;
                if (e.key === 'Enter') onNavigate();
            }}
            className="cursor-pointer rounded-lg overflow-hidden flex flex-col justify-between border-2 border-[#E5E7EB] bg-white transition-all duration-200 hover:border-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
        >
            <div className="block sm:hidden p-3.5 space-y-2.5">
                <div className="flex items-start gap-3">
                    <div className={`w-14 h-14 shrink-0 rounded-md ${themeConfig.bg} ${themeConfig.text} flex flex-col items-center justify-center border border-black/10`}>
                        {EmblemIcon ? <EmblemIcon className="w-6 h-6" /> : <span className="text-sm font-black">🎓</span>}
                        <span className="text-[8px] font-black uppercase tracking-wider opacity-85 leading-none mt-0.5">UUM</span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            {enrolled ? (
                                <span className="font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.2 rounded text-[9px]">
                                    ✓ ENROLLED
                                </span>
                            ) : (
                                <span className="font-black text-gray-600 bg-white border border-gray-300 px-1.5 py-0.2 rounded text-[9px]">
                                    NOT ENROLLED
                                </span>
                            )}
                            <span className="text-[10px] font-bold text-gray-500">
                                {isKssrCourse ? 'KSSR Rendah' : (course.academic_year || '2026/2027')}
                            </span>
                            <span className="text-[10px] text-gray-500 font-semibold">
                                · {course.modules_count ?? 0} mod
                            </span>
                        </div>
                        <h2 className="font-display text-sm font-black text-[#111827] line-clamp-2 leading-snug">
                            {course.title}
                        </h2>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            {course.instructor?.name || 'Faculty Instructor'}
                        </p>
                    </div>
                </div>

                <CourseDetailsSection
                    course={course}
                    isOpen={isMobileExpanded}
                    onToggle={onToggleMobileDetails}
                />

                <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                    <div className="text-[11px] text-gray-500 truncate min-w-0">
                        {course.modules_count ?? 0} modules
                    </div>
                    <div className="shrink-0">
                        {enrolled ? (
                            <Link
                                href={route('learner.course.learn', course.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs py-1.5 px-3 rounded inline-flex items-center gap-1 active:scale-95"
                            >
                                <span>Continue →</span>
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEnrollClick();
                                }}
                                className="bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs py-1.5 px-3 rounded inline-flex items-center gap-1 active:scale-95"
                            >
                                <span>{isCommercial ? `Enroll · RM ${Number(course.price || 0).toFixed(0)}` : 'Enroll Free'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="hidden sm:flex flex-col justify-between h-full">
                <div>
                    <CourseLogoBadge
                        category={course.category_logo}
                        size="tile"
                        className="!w-full !border-b-2 !border-r-0 !py-6"
                    />

                    <div className="px-5 py-2 bg-[#F9FAFB] border-b-2 border-[#E5E7EB] flex items-center justify-end text-xs">
                        {enrolled ? (
                            <span className="font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded text-[11px]">
                                ✓ ENROLLED
                            </span>
                        ) : (
                            <span className="font-black text-gray-600 bg-white border border-gray-300 px-2 py-0.5 rounded text-[11px]">
                                NOT ENROLLED
                            </span>
                        )}
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <span className="inline-block mb-1.5 px-2 py-0.5 rounded bg-[#0284C7] text-white border border-[#111827] text-[10px] font-black uppercase tracking-wider">
                                {isKssrCourse ? 'KSSR Rendah' : (course.academic_year || '2026 / 2027')}
                            </span>
                            <h2
                                className={`font-display text-[#111827] line-clamp-2 ${
                                    isKssrCourse
                                        ? 'font-extrabold text-lg sm:text-xl'
                                        : 'font-bold text-lg'
                                }`}
                            >
                                {course.title}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {course.instructor?.name || 'Faculty Instructor'}
                            </p>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {course.description || 'Comprehensive curriculum designed for applied professional development.'}
                        </p>

                        <CourseDetailsSection
                            course={course}
                            isOpen={isDetailsOpen}
                            onToggle={onToggleDesktopDetails}
                        />
                    </div>
                </div>

                <div className="p-6 pt-0">
                    {enrolled ? (
                        <Link
                            href={route('learner.course.learn', course.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3 px-4 rounded text-sm transition-transform active:scale-[0.98]"
                        >
                            <span>Continue</span>
                            <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                    ) : isCommercial ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEnrollClick();
                            }}
                            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-gray-800 text-white font-bold py-3 px-4 rounded text-sm transition-transform active:scale-[0.98]"
                        >
                            <span>Subscribe & Unlock · RM {Number(course.price || 0).toFixed(2)}</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEnrollClick();
                            }}
                            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-gray-800 text-white font-bold py-3 px-4 rounded text-sm transition-transform active:scale-[0.98]"
                        >
                            <span>Enroll Now (Free)</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function CourseDetailsSection({ course, isOpen, onToggle }) {
    return (
        <div className="border-t-2 border-[#E5E7EB] pt-3">
            <button
                type="button"
                aria-expanded={isOpen}
                onClick={onToggle}
                className="w-full flex items-center justify-between text-xs font-bold text-[#111827] hover:text-[#0284C7] transition-colors"
            >
                <span>Course Details</span>
                <span
                    aria-hidden="true"
                    className={`text-[11px] font-extrabold text-gray-500 transition-transform duration-300 ease-out ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                >
                    ▾
                </span>
            </button>

            <div
                className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'
                }`}
            >
                <div className="overflow-hidden">
                    <div className="space-y-3">
                        {course.cert_title && (
                            <div className="flex items-center gap-2 text-xs font-bold text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] p-2 rounded">
                                <GraduationCapIcon className="w-4 h-4 text-[#F59E0B] shrink-0" />
                                <span className="line-clamp-1">🎓 {course.cert_title}</span>
                            </div>
                        )}
                        <div className="space-y-2 text-xs font-semibold text-[#111827]">
                            <div className="flex items-center gap-2.5">
                                <BookOpenIcon className="w-4 h-4 text-[#3B82F6] shrink-0" />
                                <span>{course.modules_count ?? 0} modules</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <GraduationCapIcon className="w-4 h-4 text-[#10B981] shrink-0" />
                                <span>Self-paced learning · Direct to Learn</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <CircleCheckIcon className="w-4 h-4 text-[#F59E0B] shrink-0" />
                                <span>Official Course Certificate</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
