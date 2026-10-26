import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import LearnerLayout from '@/Layouts/design_v1/LearnerLayout';
import FlatButton from '@/Components/flat/FlatButton';
import FlatInput from '@/Components/flat/FlatInput';
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
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'available', 'enrolled'
    const [selectedCheckoutCourse, setSelectedCheckoutCourse] = useState(null);

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
        }
        return result;
    }, [courses, searchQuery, activeFilter, enrolledCourseIds]);

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
                {/* Header Back Link & Title */}
                <div className="space-y-2">
                    <Link
                        href={route('portal')}
                        className="inline-flex items-center text-sm font-bold text-[#111827] hover:underline"
                    >
                        ← Back to My Courses
                    </Link>
                    <h1 className="font-display font-extrabold text-3xl md:text-4xl text-[#111827] tracking-tight">
                        Explore Courses & Professional Certifications
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 max-w-2xl">
                        Discover industry-aligned curriculum, bulk downloadable kits, and professional certifications including Maritime JLM and PMI-CAPM®.
                    </p>
                </div>

                {/* 3-Step "How to Subscribe & Learn in CoPED PULSE" Flat Strip */}
                <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-[#111827]">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <span className="w-6 h-6 rounded bg-[#111827] text-white flex items-center justify-center font-black text-xs shrink-0">
                                1
                            </span>
                            <span>Choose Subject or CoPED Pass</span>
                        </div>
                        <span className="hidden md:inline text-gray-300 font-extrabold">→</span>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <span className="w-6 h-6 rounded bg-[#10B981] text-white flex items-center justify-center font-black text-xs shrink-0">
                                2
                            </span>
                            <span>Instant Subscription Checkout</span>
                        </div>
                        <span className="hidden md:inline text-gray-300 font-extrabold">→</span>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <span className="w-6 h-6 rounded bg-[#3B82F6] text-white flex items-center justify-center font-black text-xs shrink-0">
                                3
                            </span>
                            <span>Immediate Access to Materials & CAPM/JLM Certificate</span>
                        </div>
                    </div>
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
                        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Course filters">
                            {[
                                { id: 'all', label: 'All Courses' },
                                { id: 'available', label: 'Available to Enroll' },
                                { id: 'enrolled', label: 'Enrolled' },
                            ].map((filter) => {
                                const active = activeFilter === filter.id;
                                return (
                                    <button
                                        key={filter.id}
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setActiveFilter(filter.id)}
                                        className={`px-4 py-2 text-xs font-bold rounded-md border-2 transition-colors min-h-[38px] flex items-center ${
                                            active
                                                ? 'bg-[#111827] text-white border-[#111827]'
                                                : 'bg-white text-[#111827] border-[#E5E7EB] hover:border-[#111827]'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                );
                            })}
                        </div>
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
                                    router.get(route('learner.catalog'), {}, { preserveState: true, replace: true });
                                }}
                                className="inline-flex items-center gap-2 bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs px-5 py-2.5 rounded transition-transform active:scale-[0.98]"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => {
                            const enrolled = isEnrolled(course.id);
                            const isCommercial = course.billing_type !== 'free' && Number(course.price || 0) > 0;
                            const themeConfig = LOGO_CONFIG[course.category_logo] || LOGO_CONFIG.charcoal || LOGO_CONFIG.general;
                            const EmblemIcon = themeConfig?.icon;

                            return (
                                <div
                                    key={course.id}
                                    onClick={(e) => {
                                        if (e.target.closest('button, a, input, select')) return;
                                        if (enrolled) {
                                            router.visit(route('learner.course.learn', course.id));
                                        } else {
                                            handleEnrollClick(course);
                                        }
                                    }}
                                    className="bg-white border-2 border-[#E5E7EB] rounded-lg overflow-hidden flex flex-col justify-between transition-all duration-200 hover:scale-[1.01] hover:border-black cursor-pointer"
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
                                                    {course.billing_type === 'subscription' ? (
                                                        <span className="font-black text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.2 rounded text-[9px]">
                                                            RM {Number(course.price || 0).toFixed(2)}/mo
                                                        </span>
                                                    ) : course.billing_type === 'one_time' ? (
                                                        <span className="font-black text-blue-800 bg-blue-50 border border-blue-300 px-1.5 py-0.2 rounded text-[9px]">
                                                            RM {Number(course.price || 0).toFixed(2)}
                                                        </span>
                                                    ) : (
                                                        <span className="font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.2 rounded text-[9px]">
                                                            FREE ACCESS
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] font-bold text-gray-500">
                                                        {course.academic_year || '2026/2027'}
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

                                        {/* Bottom Action Row */}
                                        <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                                            <div className="text-xs text-gray-500 truncate min-w-0">
                                                {course.cert_title ? (
                                                    <span className="text-[#92400E] font-bold text-[11px] truncate block">
                                                        🎓 {course.cert_title}
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-gray-500">Self-paced learning</span>
                                                )}
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
                                            <div className="relative">
                                                <CourseLogoBadge
                                                    category={course.category_logo}
                                                    size="tile"
                                                    className="!w-full !border-b-2 !border-r-0 !py-6"
                                                />
                                                <div className="absolute top-3 right-3 bg-white border border-[#111827] px-2.5 py-0.5 rounded text-[11px] font-black text-[#111827]">
                                                    {course.academic_year || '2026 / 2027'}
                                                </div>
                                            </div>

                                            {/* Eyebrow Pricing Strip */}
                                            <div className="px-5 py-2 bg-[#F9FAFB] border-b-2 border-[#E5E7EB] flex items-center justify-between text-xs">
                                                <span className="font-extrabold text-gray-600 uppercase tracking-wider text-[10px]">
                                                    {course.billing_type === 'subscription' ? 'CoPED Pass' : 'Course Admission'}
                                                </span>
                                                {course.billing_type === 'subscription' ? (
                                                    <span className="font-black text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded text-[11px]">
                                                        RM {Number(course.price || 0).toFixed(2)}/mo
                                                    </span>
                                                ) : course.billing_type === 'one_time' ? (
                                                    <span className="font-black text-blue-800 bg-blue-50 border border-blue-300 px-2 py-0.5 rounded text-[11px]">
                                                        RM {Number(course.price || 0).toFixed(2)} ONE-TIME
                                                    </span>
                                                ) : (
                                                    <span className="font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded text-[11px]">
                                                        FREE ACCESS
                                                    </span>
                                                )}
                                            </div>

                                            {/* Body */}
                                            <div className="p-6 space-y-4">
                                                <div>
                                                    <h2 className="font-display font-bold text-lg text-[#111827] line-clamp-2">
                                                        {course.title}
                                                    </h2>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {course.instructor?.name || 'Faculty Instructor'}
                                                    </p>
                                                </div>

                                                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                                    {course.description || 'Comprehensive curriculum designed for applied professional development.'}
                                                </p>

                                                {/* Certification Badge */}
                                                {course.cert_title && (
                                                    <div className="pt-1">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] p-2 rounded">
                                                            <GraduationCapIcon className="w-4 h-4 text-[#F59E0B] shrink-0" />
                                                            <span className="line-clamp-1">🎓 {course.cert_title}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Metadata List */}
                                                <div className="border-t-2 border-[#E5E7EB] pt-4 space-y-2 text-xs font-semibold text-[#111827]">
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

                                        {/* Action Footer */}
                                        <div className="p-6 pt-0">
                                            {enrolled ? (
                                                <Link
                                                    href={route('learner.course.learn', course.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3 px-4 rounded text-sm transition-transform active:scale-[0.98]"
                                                >
                                                    <span>Enrolled ✓ · Continue Course</span>
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