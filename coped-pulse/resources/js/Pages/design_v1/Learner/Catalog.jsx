import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import LearnerLayout from '@/Layouts/design_v1/LearnerLayout';
import FlatButton from '@/Components/flat/FlatButton';
import FlatInput from '@/Components/flat/FlatInput';
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
                    course.description?.toLowerCase().includes(q)
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

    return (
        <LearnerLayout>
            <Head title="Course Catalog" />

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
                        Explore Courses
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 max-w-2xl">
                        Discover new skills and knowledge. Browse our curated selection of high-quality courses and enroll today.
                    </p>
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
                                placeholder="Search for programs, courses, or topics..."
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
                                        className={`px-4 py-2 text-xs font-bold rounded-md border-2 transition-colors ${
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

                {/* edX Professional Certificate Card Grid */}
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
                        {filteredCourses.map((course, index) => {
                            const enrolled = isEnrolled(course.id);
                            const bannerBg = index % 2 === 0 ? 'bg-[#111827]' : 'bg-[#3B82F6]';

                            return (
                                <div
                                    key={course.id}
                                    className="bg-white border-2 border-[#E5E7EB] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:scale-[1.01]"
                                >
                                    <div>
                                        {/* Top Eyebrow Strip */}
                                        <div className="px-4 py-2 bg-[#F3F4F6] border-b-2 border-[#E5E7EB] text-xs font-bold uppercase tracking-wider text-[#111827]">
                                            Professional Certificate
                                        </div>

                                        {/* Color-Blocked Banner */}
                                        <div className={`${bannerBg} p-6 relative min-h-[110px] flex items-end`}>
                                            <div className="absolute top-4 right-4 bg-white border-2 border-[#111827] px-3 py-1 rounded text-xs font-extrabold text-[#111827]">
                                                UUM · CoPED
                                            </div>
                                            <span className="text-xs uppercase tracking-widest font-extrabold text-white/80">
                                                Self-Paced Course
                                            </span>
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

                                            {/* edX Metadata List */}
                                            <div className="border-t-2 border-[#E5E7EB] pt-4 space-y-2 text-xs font-semibold text-[#111827]">
                                                <div className="flex items-center gap-2.5">
                                                    <BookOpenIcon className="w-4 h-4 text-[#3B82F6] shrink-0" />
                                                    <span>{course.modules_count ?? 0} modules</span>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <GraduationCapIcon className="w-4 h-4 text-[#10B981] shrink-0" />
                                                    <span>Self-paced learning</span>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <CircleCheckIcon className="w-4 h-4 text-[#F59E0B] shrink-0" />
                                                    <span>Verifiable completion</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="p-6 pt-0">
                                        {enrolled ? (
                                            <Link
                                                href={route('learner.course.learn', course.id)}
                                                className="w-full inline-flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3 px-4 rounded text-sm transition-transform active:scale-[0.98]"
                                            >
                                                <span>Enrolled ✓ · Continue Course</span>
                                                <ArrowRightIcon className="w-4 h-4" />
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => router.post(route('learner.catalog.enroll', course.id))}
                                                className="w-full inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-gray-800 text-white font-bold py-3 px-4 rounded text-sm transition-transform active:scale-[0.98]"
                                            >
                                                <span>Enroll Now</span>
                                                <ArrowRightIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </LearnerLayout>
    );
}