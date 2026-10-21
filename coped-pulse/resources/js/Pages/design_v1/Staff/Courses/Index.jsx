import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';
import CourseRow from './Partials/CourseRow';

export default function Index({ courses }) {
    const allCourses = courses.data || [];
    const liveCount = allCourses.filter((c) => c.status === 'published').length;
    const draftCount = allCourses.filter((c) => c.status !== 'published').length;

    // Filter, Search & Sort State
    const [filterTab, setFilterTab] = useState('all'); // 'all' | 'live' | 'draft'
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('created'); // 'title' | 'status' | 'students' | 'created'
    const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'
    const [activeMenuCourseId, setActiveMenuCourseId] = useState(null);

    // Global listener to close dropdown on click outside
    useEffect(() => {
        if (!activeMenuCourseId) return;
        const handleClickOutside = (e) => {
            if (!e.target.closest('[data-dropdown-container]')) {
                setActiveMenuCourseId(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeMenuCourseId]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection(field === 'created' ? 'desc' : 'asc');
        }
    };

    const renderSortIndicator = (field) => {
        if (sortField !== field) {
            return <span className="text-gray-400 ml-1">↕</span>;
        }
        return <span className="text-[#111827] ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    // Filter courses
    const filteredCourses = allCourses.filter((course) => {
        if (filterTab === 'live' && course.status !== 'published') return false;
        if (filterTab === 'draft' && course.status === 'published') return false;
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase().trim();
            const matchesTitle = (course.title || '').toLowerCase().includes(q);
            const matchesCategory = (course.category_logo || '').toLowerCase().includes(q);
            if (!matchesTitle && !matchesCategory) return false;
        }
        return true;
    });

    // Sort courses
    const sortedCourses = [...filteredCourses].sort((a, b) => {
        let comparison = 0;
        if (sortField === 'title') {
            comparison = (a.title || '').localeCompare(b.title || '');
        } else if (sortField === 'status') {
            comparison = (a.status || '').localeCompare(b.status || '');
        } else if (sortField === 'students') {
            const aCount = a.status === 'published' ? Number(a.enrollments_count ?? 0) : -1;
            const bCount = b.status === 'published' ? Number(b.enrollments_count ?? 0) : -1;
            comparison = aCount - bCount;
        } else if (sortField === 'created') {
            const aTime = new Date(a.created_at || 0).getTime();
            const bTime = new Date(b.created_at || 0).getTime();
            comparison = aTime - bTime;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    return (
        <StaffLayout>
            <Head title="My Courses" />

            {/* Back navigation */}
            <Link
                href={route('dashboard')}
                className="inline-flex items-center text-xs font-bold text-[#10B981] hover:text-emerald-700 uppercase tracking-wider mb-4 transition-colors"
            >
                ← Back to Studio Dashboard
            </Link>

            {/* Top Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-display">
                        My Courses
                    </h1>
                    <p className="mt-1 text-sm sm:text-base text-gray-600">
                        Manage your training curriculum
                    </p>
                </div>
                <div>
                    <Link
                        href={route('staff.courses.create')}
                        className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold rounded-md text-white bg-[#10B981] hover:bg-emerald-600 transition-colors"
                    >
                        <span>+ New Course</span>
                    </Link>
                </div>
            </div>

            {/* Control Bar: Filter Tabs + Search Input */}
            <div className="bg-white border-2 border-[#E5E7EB] rounded-t-lg p-3 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-0">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => setFilterTab('all')}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                            filterTab === 'all'
                                ? 'bg-[#111827] text-white'
                                : 'bg-[#F3F4F6] text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        All ({allCourses.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterTab('live')}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                            filterTab === 'live'
                                ? 'bg-[#111827] text-white'
                                : 'bg-[#F3F4F6] text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Live ({liveCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterTab('draft')}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                            filterTab === 'draft'
                                ? 'bg-[#111827] text-white'
                                : 'bg-[#F3F4F6] text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Drafts ({draftCount})
                    </button>
                </div>

                {/* Search Box with Clear Button */}
                <div className="relative w-full sm:w-72">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search courses by title..."
                        className="w-full text-xs font-medium border-2 border-[#E5E7EB] rounded px-3 py-1.5 pr-8 text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#111827] transition-colors"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111827] font-bold text-xs leading-none"
                            aria-label="Clear search"
                        >
                            &times;
                        </button>
                    )}
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white border-2 border-[#E5E7EB] rounded-b-lg overflow-hidden">
                {allCourses.length === 0 ? (
                    /* Initial Empty State */
                    <div className="text-center py-16 px-4">
                        <h3 className="text-lg font-extrabold text-[#111827] mb-1 font-display">
                            No courses created yet
                        </h3>
                        <p className="text-gray-600 max-w-sm mx-auto mb-6 text-sm">
                            Get started by creating your first course and authoring curriculum modules.
                        </p>
                        <Link
                            href={route('staff.courses.create')}
                            className="inline-flex items-center px-5 py-2.5 text-xs font-bold rounded-md text-white bg-[#10B981] hover:bg-emerald-600 transition-colors"
                        >
                            + Create your first course
                        </Link>
                    </div>
                ) : sortedCourses.length === 0 ? (
                    /* Search/Filter Empty State */
                    <div className="text-center py-12 px-4">
                        <p className="text-sm font-bold text-[#111827] mb-1">
                            No courses match your filter or search criteria.
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                            Try searching with a different term or resetting the filter.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setFilterTab('all');
                                setSearchQuery('');
                            }}
                            className="inline-flex items-center px-4 py-1.5 text-xs font-bold rounded border-2 border-[#111827] text-[#111827] hover:bg-[#F3F4F6] transition-colors"
                        >
                            Clear search &amp; filters
                        </button>
                    </div>
                ) : (
                    /* Management Table */
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y-2 divide-[#E5E7EB]">
                            <thead className="bg-[#F9FAFB] border-b-2 border-[#E5E7EB]">
                                <tr>
                                    <th
                                        scope="col"
                                        onClick={() => handleSort('title')}
                                        className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-[#111827] select-none"
                                    >
                                        Course {renderSortIndicator('title')}
                                    </th>
                                    <th
                                        scope="col"
                                        onClick={() => handleSort('status')}
                                        className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-[#111827] select-none"
                                    >
                                        Status {renderSortIndicator('status')}
                                    </th>
                                    <th
                                        scope="col"
                                        onClick={() => handleSort('students')}
                                        className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-[#111827] select-none"
                                    >
                                        Students {renderSortIndicator('students')}
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider select-none"
                                    >
                                        Avg. Progress
                                    </th>
                                    <th
                                        scope="col"
                                        onClick={() => handleSort('created')}
                                        className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-[#111827] select-none"
                                    >
                                        Created {renderSortIndicator('created')}
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider select-none"
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y-2 divide-[#E5E7EB]">
                                {sortedCourses.map((course) => (
                                    <CourseRow
                                        key={course.id}
                                        course={course}
                                        status={course.status === 'published' ? 'published' : 'draft'}
                                        variant="table"
                                        activeMenuCourseId={activeMenuCourseId}
                                        setActiveMenuCourseId={setActiveMenuCourseId}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination Navigation */}
            {courses.links && courses.links.length > 3 && (
                <div className="mt-6 flex justify-center space-x-1.5">
                    {courses.links.map((link, i) =>
                        link.url ? (
                            <Link
                                key={i}
                                href={link.url}
                                className={`px-3.5 py-1.5 rounded text-xs font-bold transition-colors ${
                                    link.active
                                        ? 'bg-[#111827] text-white'
                                        : 'bg-white text-gray-700 border-2 border-[#E5E7EB] hover:bg-[#F3F4F6]'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={i}
                                className="px-3.5 py-1.5 rounded text-xs font-bold bg-[#F3F4F6] text-gray-400 border-2 border-transparent"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    )}
                </div>
            )}
        </StaffLayout>
    );
}
