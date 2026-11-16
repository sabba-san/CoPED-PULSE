import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import LearnerLayout from '@/Layouts/design_v1/LearnerLayout';
import FlatButton from '@/Components/flat/FlatButton';
import FlatInput from '@/Components/flat/FlatInput';
import SortMenu from '@/Components/flat/SortMenu';
import CourseLogoBadge, { LOGO_CONFIG } from '@/Components/flat/CourseLogoBadge';
import { matchesCourseSearch } from '@/Utils/courseSearch';
import {
    MagnifyingGlassIcon,
    XMarkIcon,
    BookOpenIcon,
    CircleCheckIcon,
    ArrowRightIcon,
    GraduationCapIcon,
} from '@/Components/flat/icons';

function getColumnCount() {
    if (typeof window === 'undefined') return 3;
    if (window.matchMedia('(min-width: 1024px)').matches) return 3;
    if (window.matchMedia('(min-width: 768px)').matches) return 2;
    return 1;
}

export default function Catalog({ courses = [], enrolledCourseIds = [], filters = { q: '' } }) {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'available', 'enrolled', 'free', 'subscription'
    const [sortOrder, setSortOrder] = useState('default'); // 'default', 'az', 'za'
    const [selectedCheckoutCourse, setSelectedCheckoutCourse] = useState(null);
    const [hoveredCourseId, setHoveredCourseId] = useState(null);
    const [pinnedCourseId, setPinnedCourseId] = useState(null);
    const [columnCount, setColumnCount] = useState(() => getColumnCount());

    useEffect(() => {
        const updateColumns = () => setColumnCount(getColumnCount());
        const mdQuery = window.matchMedia('(min-width: 768px)');
        const lgQuery = window.matchMedia('(min-width: 1024px)');
        mdQuery.addEventListener('change', updateColumns);
        lgQuery.addEventListener('change', updateColumns);
        return () => {
            mdQuery.removeEventListener('change', updateColumns);
            lgQuery.removeEventListener('change', updateColumns);
        };
    }, []);

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
            result = result.filter((course) => matchesCourseSearch(course, searchQuery));
        }
        if (activeFilter === 'enrolled') {
            result = result.filter((course) => enrolledCourseIds.includes(course.id));
        } else if (activeFilter === 'available') {
            result = result.filter((course) => !enrolledCourseIds.includes(course.id));
        } else if (activeFilter === 'free') {
            result = result.filter((course) => !(course.billing_type !== 'free' && Number(course.price || 0) > 0));
        } else if (activeFilter === 'subscription') {
            result = result.filter((course) => course.billing_type === 'subscription');
        } else if (activeFilter === 'ai') {
            result = result.filter((course) => matchesCourseSearch(course, 'ai') || matchesCourseSearch(course, 'llm'));
        } else if (activeFilter === 'kssm') {
            result = result.filter((course) => matchesCourseSearch(course, 'kssm'));
        } else if (activeFilter === 'kssr') {
            result = result.filter((course) => matchesCourseSearch(course, 'kssr'));
        }
        if (sortOrder !== 'default') {
            result = [...result].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            if (sortOrder === 'za') result.reverse();
        }
        return result;
    }, [courses, searchQuery, activeFilter, sortOrder, enrolledCourseIds]);

    // Distribute left-to-right into independent columns so expanding one card only shifts its own column.
    const courseColumns = useMemo(() => {
        const cols = Array.from({ length: columnCount }, () => []);
        filteredCourses.forEach((course, index) => {
            cols[index % columnCount].push(course);
        });
        return cols;
    }, [filteredCourses, columnCount]);

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

            <div className="space-y-4 sm:space-y-8">
                {/* Desktop Back Link (>= md) */}
                <div className="hidden md:block">
                    <Link
                        href={route('portal')}
                        className="inline-flex items-center text-sm font-bold text-[#111827] hover:underline"
                    >
                        ← Back to My Courses
                    </Link>
                </div>

                {/* Mobile App Search & Horizontal Filter Chips (< md) */}
                <div className="md:hidden space-y-3">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                            <MagnifyingGlassIcon className="w-5 h-5" />
                        </span>
                        <FlatInput
                            id="catalog-search-mobile"
                            type="search"
                            placeholder="Search courses, LLM, KSSR, CAPM..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full"
                            inputClassName="rounded-full bg-white border border-[#E5E7EB] pl-11 pr-11 py-3 min-h-12 text-sm font-medium text-[#111827] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-10 min-w-10 inline-flex items-center justify-center rounded-full text-gray-400 hover:text-[#111827] transition-colors"
                                aria-label="Clear search"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        )}
                    </form>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1">
                        {[
                            { value: 'all', label: 'All' },
                            { value: 'ai', label: 'AI & LLM' },
                            { value: 'kssm', label: 'KSSM' },
                            { value: 'kssr', label: 'KSSR' },
                            { value: 'available', label: 'Available' },
                            { value: 'enrolled', label: 'Enrolled' },
                            { value: 'free', label: 'Free' },
                        ].map((chip) => {
                            const active = activeFilter === chip.value;
                            return (
                                <button
                                    key={chip.value}
                                    type="button"
                                    onClick={() => setActiveFilter(chip.value)}
                                    className={`min-h-11 px-4 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                                        active
                                            ? 'bg-[#2563EB] text-white'
                                            : 'bg-white border border-[#E5E7EB] text-[#475569] hover:bg-[#F3F4F6]'
                                    }`}
                                >
                                    {chip.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                            {filteredCourses.length} Course{filteredCourses.length !== 1 ? 's' : ''}
                        </span>
                        <button
                            type="button"
                            onClick={() => setSortOrder((s) => (s === 'default' ? 'az' : s === 'az' ? 'za' : 'default'))}
                            className="min-h-11 px-3 rounded-full text-xs font-bold text-[#111827] bg-white border border-[#E5E7EB]"
                        >
                            Sort: {sortOrder === 'az' ? 'A–Z' : sortOrder === 'za' ? 'Z–A' : 'Default'}
                        </button>
                    </div>
                </div>

                {/* Desktop Search & Filter Bar (>= md) */}
                <div className="hidden md:block bg-white border-2 border-[#E5E7EB] rounded-lg p-6 space-y-6">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                                <MagnifyingGlassIcon className="w-5 h-5" />
                            </span>
                            <FlatInput
                                id="catalog-search"
                                type="text"
                                placeholder="Search by subject, certification (e.g. CAPM, JLM), or year..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full"
                                inputClassName="rounded-md bg-[#F3F4F6] pl-11 pr-10 py-3 text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-2 border-transparent"
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
                        {courseColumns.map((columnCourses, colIndex) => (
                            <div key={colIndex} className="flex flex-col gap-6">
                                {columnCourses.map((course) => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        enrolled={isEnrolled(course.id)}
                                        isHovered={hoveredCourseId === course.id}
                                        isPinned={pinnedCourseId === course.id}
                                        onHoverStart={() => setHoveredCourseId(course.id)}
                                        onHoverEnd={() => setHoveredCourseId((id) => (id === course.id ? null : id))}
                                        onTogglePin={() => setPinnedCourseId((id) => (id === course.id ? null : course.id))}
                                        onClearActive={() => {
                                            setPinnedCourseId(null);
                                            setHoveredCourseId(null);
                                        }}
                                        onEnrollClick={handleEnrollClick}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Flat Subscription & Course Unlock Modal / Mobile Bottom Sheet */}
            {selectedCheckoutCourse && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setSelectedCheckoutCourse(null);
                    }}
                >
                    <div className="bg-white border-t-2 sm:border-2 border-[#111827] rounded-t-2xl sm:rounded-lg max-w-lg w-full p-5 sm:p-8 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-5 sm:space-y-6 animate-sheet-up max-h-[90vh] overflow-y-auto">
                        <div className="sm:hidden flex justify-center -mt-1 mb-1">
                            <div className="h-1 w-10 rounded-full bg-gray-300" aria-hidden="true" />
                        </div>
                        <div className="flex items-start justify-between border-b border-[#E5E7EB] sm:border-b-2 pb-4">
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
                                className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#111827]"
                                aria-label="Close checkout"
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


function CourseCard({
    course,
    enrolled,
    isHovered,
    isPinned,
    onHoverStart,
    onHoverEnd,
    onTogglePin,
    onClearActive,
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

    const isDetailsOpen = isHovered || isPinned;

    const handleToggleDetails = (e) => {
        e.stopPropagation();
        if (isDetailsOpen) {
            onClearActive();
        } else {
            onTogglePin();
        }
    };

    return (
        <div
            onMouseEnter={onHoverStart}
            onMouseLeave={onHoverEnd}
            onClick={(e) => {
                if (e.target.closest('button, a, input, select')) return;
                if (enrolled) {
                    router.visit(route('learner.course.learn', course.id));
                }
            }}
            className={`rounded-2xl sm:rounded-lg overflow-hidden flex flex-col justify-between transition-all duration-200 hover:border-black ${
                enrolled ? 'cursor-pointer' : ''
            } ${
                isKssrCourse
                    ? 'bg-[#FEF9C3]/40 border-2 border-[#111827]'
                    : 'bg-white border border-[#E5E7EB] sm:border-2'
            } ${
                isDetailsOpen ? 'sm:border-black' : ''
            }`}
        >
            {/* Mobile View (< sm): Canvas Color-Banded Card + Tactile CTA */}
            <div className="block sm:hidden">
                <div className={`h-1.5 w-full ${themeConfig.bg}`} aria-hidden="true" />
                <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                    {/* 56x56 Compact Emblem */}
                    <div className={`w-14 h-14 shrink-0 rounded-xl ${themeConfig.bg} ${themeConfig.text} flex flex-col items-center justify-center border border-black/10`}>
                        {EmblemIcon ? <EmblemIcon className="w-6 h-6" /> : <GraduationCapIcon className="w-6 h-6" />}
                        <span className="text-[8px] font-black uppercase tracking-wider opacity-85 leading-none mt-0.5">UUM</span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            {enrolled ? (
                                <span className="font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full text-[9px]">
                                    ✓ ENROLLED
                                </span>
                            ) : (
                                <span className="font-black text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full text-[9px]">
                                    OPEN
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
                    isOpen={isPinned}
                    onToggle={(e) => {
                        e.stopPropagation();
                        onTogglePin();
                    }}
                />

                {/* Bottom Action Row */}
                <div className="pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold text-gray-500 truncate min-w-0">
                        {course.modules_count ?? 0} modules
                    </div>
                    <div className="shrink-0">
                        {enrolled ? (
                            <Link
                                href={route('learner.course.learn', course.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="min-h-11 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs px-4 rounded-xl inline-flex items-center gap-1.5 tactile-btn border border-[#047857]"
                            >
                                <span>Continue</span>
                                <ArrowRightIcon className="w-3.5 h-3.5" />
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEnrollClick(course);
                                }}
                                className="min-h-11 bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs px-4 rounded-xl inline-flex items-center gap-1.5 tactile-btn border border-black"
                            >
                                <span>{isCommercial ? `Enroll · RM ${Number(course.price || 0).toFixed(0)}` : 'Enroll Free'}</span>
                                <ArrowRightIcon className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
                </div>
            </div>

            {/* Desktop View (sm:): Full Cover Banner & Multi-Row Details */}
            <div className="hidden sm:flex flex-col justify-between">
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
                                className={`font-display text-[#111827] line-clamp-2 min-h-[3.5rem] ${
                                    isKssrCourse
                                        ? 'font-extrabold text-lg sm:text-xl'
                                        : 'font-bold text-lg'
                                }`}
                            >
                                {course.title}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1 truncate">
                                {course.instructor?.name || 'Faculty Instructor'}
                            </p>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.85rem] leading-relaxed">
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
                                onEnrollClick(course);
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
                                onEnrollClick(course);
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
