import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import LearnerLayout from '@/Layouts/design_v1/LearnerLayout';
import FlatButton from '@/Components/flat/FlatButton';
import FlatInput from '@/Components/flat/FlatInput';
import SortMenu from '@/Components/flat/SortMenu';
import CatalogCourseCard from '@/Components/flat/CatalogCourseCard';
import {
    MagnifyingGlassIcon,
    XMarkIcon,
    BookOpenIcon,
} from '@/Components/flat/icons';

function distributeCoursesByColumn(courses, columnCount) {
    const columns = Array.from({ length: columnCount }, () => []);
    courses.forEach((course, index) => columns[index % columnCount].push(course));
    return columns;
}

export default function Catalog({ courses = [], enrolledCourseIds = [], filters = { q: '' } }) {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'available', 'enrolled', 'free', 'subscription'
    const [sortOrder, setSortOrder] = useState('default'); // 'default', 'az', 'za'
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
        router.visit(route('learner.catalog.show', course.id));
    };

    const twoColumnCourses = useMemo(
        () => distributeCoursesByColumn(filteredCourses, 2),
        [filteredCourses]
    );
    const threeColumnCourses = useMemo(
        () => distributeCoursesByColumn(filteredCourses, 3),
        [filteredCourses]
    );
    const isCourseExpanded = hoveredCourseId !== null || pinnedCourseId !== null;

    const renderCourseCard = (course) => {
        const enrolled = isEnrolled(course.id);

        return (
            <CatalogCourseCard
                key={course.id}
                course={course}
                enrolled={enrolled}
                isDetailsOpen={hoveredCourseId === course.id || pinnedCourseId === course.id}
                isMobileExpanded={pinnedCourseId === course.id}
                onCardMouseEnter={() => {
                    setPinnedCourseId((id) => (id === course.id ? id : null));
                    setHoveredCourseId(course.id);
                }}
                onNavigate={() => {
                    const href = enrolled
                        ? route('learner.course.learn', course.id)
                        : route('learner.catalog.show', course.id);
                    router.visit(href);
                }}
                onToggleDesktopDetails={(e) => {
                    e.stopPropagation();
                    if (pinnedCourseId === course.id) {
                        setPinnedCourseId(null);
                        setHoveredCourseId(null);
                    } else {
                        setPinnedCourseId(course.id);
                        setHoveredCourseId(null);
                    }
                }}
                onToggleMobileDetails={(e) => {
                    e.stopPropagation();
                    setPinnedCourseId(pinnedCourseId === course.id ? null : course.id);
                }}
                onEnrollClick={() => handleEnrollClick(course)}
            />
        );
    };

    return (
        <LearnerLayout>
            <Head title="Course Catalog · CoPED PULSE" />

            <div className="space-y-8">
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
                    <>
                        <div className="space-y-6 md:hidden">
                            {filteredCourses.map(renderCourseCard)}
                        </div>
                        <div
                            className={`hidden md:grid-cols-2 lg:grid-cols-3 gap-6 items-start ${
                                isCourseExpanded ? 'md:hidden lg:hidden' : 'md:grid lg:grid'
                            }`}
                        >
                            {filteredCourses.map(renderCourseCard)}
                        </div>
                        <div
                            onMouseLeave={() => setHoveredCourseId(null)}
                            className={`hidden md:grid-cols-2 lg:hidden gap-6 items-start ${
                                isCourseExpanded ? 'md:grid' : 'md:hidden'
                            }`}
                        >
                            {twoColumnCourses.map((column, index) => (
                                <div key={index} className="min-w-0 space-y-6">
                                    {column.map(renderCourseCard)}
                                </div>
                            ))}
                        </div>
                        <div
                            onMouseLeave={() => setHoveredCourseId(null)}
                            className={`hidden lg:grid-cols-3 gap-6 items-start ${
                                isCourseExpanded ? 'lg:grid' : 'lg:hidden'
                            }`}
                        >
                            {threeColumnCourses.map((column, index) => (
                                <div key={index} className="min-w-0 space-y-6">
                                    {column.map(renderCourseCard)}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

        </LearnerLayout>
    );
}
