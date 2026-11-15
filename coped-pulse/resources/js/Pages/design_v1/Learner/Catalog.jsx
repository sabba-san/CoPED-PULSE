import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import LearnerLayout from '@/Layouts/design_v1/LearnerLayout';
import FlatButton from '@/Components/flat/FlatButton';
import FlatInput from '@/Components/flat/FlatInput';
import SortMenu from '@/Components/flat/SortMenu';
import CourseLogoBadge, { LOGO_CONFIG } from '@/Components/flat/CourseLogoBadge';
import {
    MagnifyingGlassIcon,
    XMarkIcon,
    BookOpenIcon,
    CircleCheckIcon,
    ArrowRightIcon,
    GraduationCapIcon,
} from '@/Components/flat/icons';

export default function Catalog({ courses = [], enrolledCourseIds = [], filters = { q: '' } }) {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'available', 'enrolled', 'free', 'subscription'
    const [sortOrder, setSortOrder] = useState('default'); // 'default', 'az', 'za'
    const [selectedCheckoutCourse, setSelectedCheckoutCourse] = useState(null);
    const [hoveredCourseId, setHoveredCourseId] = useState(null);
    const [pinnedCourseId, setPinnedCourseId] = useState(null);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('learner.catalog'), searchQuery.trim() ? { q: searchQuery.trim() } : {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        router.get(route('learner.catalog'), {}, { preserveState: true, replace: true });
    };

    const filteredCourses = useMemo(() => {
        let result = courses;
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(
                (course) =>
                    course.title?.toLowerCase().includes(q) ||
                    course.description?.toLowerCase().includes(q) ||
                    course.cert_title?.toLowerCase().includes(q) ||
                    course.academic_year?.toLowerCase().includes(q)
            );
        }
        if (activeFilter === 'enrolled') {
            result = result.filter((course) => enrolledCourseIds.includes(course.id));
        } else if (activeFilter === 'available') {
            result = result.filter((course) => !enrolledCourseIds.includes(course.id));
        } else if (activeFilter === 'free') {
            result = result.filter((course) => !(course.billing_type !== 'free' && Number(course.price || 0) > 0));
        } else if (activeFilter === 'subscription') {
            result = result.filter((course) => course.billing_type === 'subscription');
        }
        if (sortOrder !== 'default') {
            result = [...result].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            if (sortOrder === 'za') result.reverse();
        }
        return result;
    }, [courses, searchQuery, activeFilter, sortOrder, enrolledCourseIds]);

    const isEnrolled = (courseId) => enrolledCourseIds.includes(courseId);

    const handleEnrollClick = (course) => {
        const isCommercial = course.billing_type !== 'free' && Number(course.price || 0) > 0;
        if (isCommercial) {
            setSelectedCheckoutCourse(course);
        } else {
            router.post(route('learner.catalog.enroll', course.id), {
                redirect_to_learn: true,
            });
        }
    };

    const handleConfirmSubscription = () => {
        if (!selectedCheckoutCourse) return;
        router.post(
            route('learner.catalog.enroll', selectedCheckoutCourse.id),
            { redirect_to_learn: true },
            {
                onSuccess: () => setSelectedCheckoutCourse(null),
            }
        );
    };

    return (
        <LearnerLayout>
            <Head title="Course Catalog · CoPED PULSE" />

            <div className="space-y-8">
                {/* Header Back Link */}
                <div>
                    <Link
                        href={route('portal')}
                        className="inline-flex items-center text-sm font-bold text-[#111827] hover:underline"
                    >
                        ← Back to My Courses
                    </Link>
                </div>

                {/* Top Search & Filter Bar */}
                <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6 space-y-6">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <MagnifyingGlassIcon className="w-5 h-5" />
                            </span>
                            <FlatInput
                                id="catalog-search"
                                type="text"
                                placeholder="Search by subject, certification (e.g. CAPM, JLM), or year..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#111827] transition-colors"
                                    aria-label="Clear search"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <FlatButton type="submit" variant="dark" className="shrink-0 h-auto py-3">
                            Search
                        </FlatButton>
                    </form>

                    {/* Result Counter & Filter Pills */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t-2 border-[#E5E7EB]">
                        <span className="font-display font-extrabold text-lg text-[#111827]">
                            {filteredCourses.length} result{filteredCourses.length !== 1 ? 's' : ''}
                        </span>
                        <SortMenu
                            groups={[
                                {
                                    id: 'order',
                                    label: 'Order',
                                    value: sortOrder,
                                    defaultValue: 'default',
                                    onChange: setSortOrder,
                                    options: [
                                        { value: 'default', label: 'Default' },
                                        { value: 'az', label: 'Title A–Z' },
                                        { value: 'za', label: 'Title Z–A' },
                                    ],
                                },
                                {
                                    id: 'show',
                                    label: 'Show',
                                    value: activeFilter,
                                    defaultValue: 'all',
                                    onChange: setActiveFilter,
                                    options: [
                                        { value: 'all', label: 'All Courses' },
                                        { value: 'available', label: 'Available Courses' },
                                        { value: 'enrolled', label: 'Enrolled Courses' },
                                        { value: 'free', label: 'Free Courses' },
                                        { value: 'subscription', label: 'Subscription Courses' },
                                    ],
                                },
                            ]}
                        />
                    </div>
                </div>

                {/* Course Grid */}
                {filteredCourses.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-lg py-16 px-6 text-center">
                        <BookOpenIcon className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                        <h2 className="font-display font-bold text-lg text-[#111827] mb-1">
                            No courses match your criteria
                        </h2>
                        <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                            {searchQuery || activeFilter !== 'all'
                                ? 'Try searching for another keyword or resetting the filter pills.'
                                : 'Check back later as new published courses are added to the catalog.'}
                        </p>
                        {(searchQuery || activeFilter !== 'all') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setActiveFilter('all');
                                    setSortOrder('default');
                                    router.get(route('learner.catalog'), {}, { preserveState: true, replace: true });
                                }}
                                className="inline-flex items-center gap-2 bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs px-5 py-2.5 rounded transition-transform active:scale-[0.98]"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                        {filteredCourses.map((course) => {
                            const enrolled = isEnrolled(course.id);
                            const isCommercial = course.billing_type !== 'free' && Number(course.price || 0) > 0;
                            const themeConfig = LOGO_CONFIG[course.category_logo] || LOGO_CONFIG.charcoal || LOGO_CONFIG.general;
                            const EmblemIcon = themeConfig?.icon;
                            const isKssrCourse = Boolean(
                                course.title?.includes('Tahun') ||
                                    course.title?.includes('KSSR') ||
                                    course.academic_year?.includes('KSSR')
                            );

                            const isDetailsOpen = hoveredCourseId === course.id || pinnedCourseId === course.id;
                            const isMobileExpanded = pinnedCourseId === course.id;

                            const handleToggleDetails = (e) => {
                                e.stopPropagation();
                                if (isDetailsOpen) {
                                    setPinnedCourseId(null);
                                    setHoveredCourseId(null);
                                } else {
                                    setPinnedCourseId(course.id);
                                }
                            };

                            return (
                                <div
                                    key={course.id}
                                    onMouseEnter={() => setHoveredCourseId(course.id)}
                                    onMouseLeave={() => setHoveredCourseId((id) => (id === course.id ? null : id))}
                                    onClick={(e) => {
                                        if (e.target.closest('button, a, input, select')) return;
                                        if (enrolled) {
                                            router.visit(route('learner.course.learn', course.id));
                                        }
                                    }}
                                    className={`rounded-lg overflow-hidden flex flex-col justify-between transition-all duration-200 hover:border-black ${
                                        enrolled ? 'cursor-pointer' : ''
                                    } ${
                                        isKssrCourse
                                            ? 'bg-[#FEF9C3]/40 border-2 border-[#111827]'
                                            : 'bg-white border-2 border-[#E5E7EB]'
                                    }`}
                                >
                                        {/* Mobile View (< sm): Ultra-compact horizontal layout */}
                                        <div className="block sm:hidden p-3.5 space-y-2.5">
                                            <div className="flex items-start gap-3">
                                                {/* 56x56 Compact Emblem */}
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

                                            {/* Mobile Open/Close Details Section */}
                                            <CourseDetailsSection
                                                course={course}
                                                isOpen={isMobileExpanded}
                                                onToggle={(e) => {
                                                    e.stopPropagation();
                                                    setPinnedCourseId(isMobileExpanded ? null : course.id);
                                                }}
                                            />

                                            {/* Bottom Action Row */}
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
                                                                handleEnrollClick(course);
                                                            }}
                                                            className="bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs py-1.5 px-3 rounded inline-flex items-center gap-1 active:scale-95"
                                                        >
                                                            <span>{isCommercial ? `Enroll · RM ${Number(course.price || 0).toFixed(0)}` : 'Enroll Free →'}</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                    {/* Desktop View (sm:): Full Cover Banner & Multi-Row Details */}
                                    <div className="hidden sm:flex flex-col justify-between h-full">
                                        <div>
                                            {/* Top Subject Emblem Banner */}
                                            <CourseLogoBadge
                                                category={course.category_logo}
                                                size="tile"
                                                className="!w-full !border-b-2 !border-r-0 !py-6"
                                            />

                                            {/* Enrollment Tag Strip */}
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

                                            {/* Body */}
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

                                                {/* Collapsible Bottom Details Section */}
                                                <CourseDetailsSection
                                                    course={course}
                                                    isOpen={isDetailsOpen}
                                                    onToggle={handleToggleDetails}
                                                />
                                            </div>
                                        </div>

                                        {/* Action Footer */}
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
                                                        handleEnrollClick(course);
                                                    }}
                                                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-gray-800 text-white font-bold py-3 px-4 rounded text-sm transition-transform active:scale-[0.98]"
                                                >
                                                    <span>
                                                        Subscribe & Unlock · RM {Number(course.price || 0).toFixed(2)}
                                                    </span>
                                                    <ArrowRightIcon className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEnrollClick(course);
                                                    }}
                                                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-gray-800 text-white font-bold py-3 px-4 rounded text-sm transition-transform active:scale-[0.98]"
                                                >
                                                    <span>Enroll Now (Free)</span>
                                                    <ArrowRightIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Flat Subscription & Course Unlock Modal */}
            {selectedCheckoutCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                    <div className="bg-white border-2 border-[#111827] rounded-lg max-w-lg w-full p-6 sm:p-8 space-y-6">
                        <div className="flex items-start justify-between border-b-2 border-[#E5E7EB] pb-4">
                            <div>
                                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#10B981]">
                                    Direct-to-Learn Checkout
                                </span>
                                <h3 className="text-xl font-black text-[#111827] font-display mt-0.5">
                                    CoPED Pass Subscription
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedCheckoutCourse(null)}
                                className="text-gray-400 hover:text-[#111827] p-1"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Course Overview Card */}
                        <div className="bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-md p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <CourseLogoBadge category={selectedCheckoutCourse.category_logo} size="badge" />
                                <span className="text-xs font-bold text-gray-500">
                                    Intake: {selectedCheckoutCourse.academic_year || '2026 / 2027'}
                                </span>
                            </div>
                            <h4 className="font-bold text-base text-[#111827]">
                                {selectedCheckoutCourse.title}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2">
                                {selectedCheckoutCourse.description}
                            </p>
                        </div>

                        {/* Plan Details & Pricing */}
                        <div className="border-2 border-[#E5E7EB] rounded-md divide-y-2 divide-[#E5E7EB] text-xs">
                            <div className="p-3.5 flex items-center justify-between">
                                <span className="font-semibold text-gray-600">Plan Type</span>
                                <span className="font-extrabold text-[#111827]">
                                    {selectedCheckoutCourse.billing_type === 'subscription'
                                        ? 'CoPED Monthly Pass (Full Access)'
                                        : 'One-Time Lifetime Subject Purchase'}
                                </span>
                            </div>
                            <div className="p-3.5 flex items-center justify-between bg-amber-50/50">
                                <span className="font-semibold text-gray-700">Course Fee</span>
                                <span className="text-base font-black text-[#111827]">
                                    RM {Number(selectedCheckoutCourse.price || 0).toFixed(2)}
                                </span>
                            </div>

                            {selectedCheckoutCourse.cert_title && (
                                <div className="p-3.5 flex items-start justify-between gap-3">
                                    <span className="font-semibold text-gray-600">Certification</span>
                                    <span className="font-bold text-[#92400E] text-right">
                                        🎓 {selectedCheckoutCourse.cert_title}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="text-xs text-gray-500">
                            By subscribing, you will be enrolled immediately and redirected straight to your interactive study dashboard.
                        </div>

                        {/* Modal Action Controls */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedCheckoutCourse(null)}
                                className="px-5 py-2.5 text-xs font-bold text-[#111827] bg-[#F3F4F6] hover:bg-gray-200 rounded transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSubscription}
                                className="px-6 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 rounded transition-transform active:scale-[0.98] flex items-center gap-1.5"
                            >
                                <span>Confirm Subscription & Start Learning →</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </LearnerLayout>
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
