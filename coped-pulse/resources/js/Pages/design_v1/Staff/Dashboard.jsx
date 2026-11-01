import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';
import CourseRow from './Courses/Partials/CourseRow';

export default function Dashboard({
    stats = {},
    courses = [],
    breakdown = [],
    recentActivity = [],
    instructors = [],
    isCoordinator = false,
}) {
    const s = {
        total_courses: stats.total_courses ?? 0,
        total_modules: stats.total_modules ?? 0,
        active_learners: stats.active_learners ?? 0,
        total_enrollments: stats.total_enrollments ?? 0,
        completed: stats.completed ?? 0,
        in_progress: stats.in_progress ?? 0,
        avg_completion: stats.avg_completion ?? 0,
    };

    // Use courses prop or fallback to breakdown for backward compatibility
    const myCourses = courses.length > 0 ? courses : breakdown;
    const liveCourses = myCourses.filter((c) => c.status === 'published');
    const draftCourses = myCourses.filter((c) => c.status !== 'published');

    // Main workspace filter pill: 'all' | 'live' | 'draft' | 'activity'
    const [activeTab, setActiveTab] = useState('all');
    const [expandedCourses, setExpandedCourses] = useState(false);
    const [activeMenuCourseId, setActiveMenuCourseId] = useState(null);

    // Filter state for Activity Feed
    const [activityFilter, setActivityFilter] = useState('all'); // 'all' | 'pending' | 'completed'

    // Close any open row dropdown when clicking outside
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

    const formatActivityTime = (dateString) => {
        if (!dateString) return 'Just Now';
        const date = new Date(dateString);
        const diffMs = Date.now() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 2) return 'Just Now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Deduplicate so the same student never appears twice in a row with identical timestamp or course
    const dedupedActivity = recentActivity.reduce((acc, curr) => {
        if (acc.length === 0) {
            acc.push(curr);
            return acc;
        }
        const prev = acc[acc.length - 1];
        const prevTime = prev.updated_at || prev.created_at;
        const currTime = curr.updated_at || curr.created_at;
        const prevUserId = prev.user_id ?? prev.user?.id;
        const currUserId = curr.user_id ?? curr.user?.id;
        const prevName = prev.user?.name;
        const currName = curr.user?.name;

        const isSameLearner =
            (prevUserId && currUserId && prevUserId === currUserId) ||
            (prevName && currName && prevName === currName);
        const isSameTime = prevTime === currTime;
        const isSameCourse = prev.course_id === curr.course_id;

        if (isSameLearner && (isSameTime || isSameCourse)) {
            return acc;
        }
        acc.push(curr);
        return acc;
    }, []);

    // Pending quizzes count for feed header
    const pendingCount = dedupedActivity.filter((act) => {
        const progressVal = Math.min(100, Math.max(0, Math.round(Number(act.progress ?? 0))));
        const isDone = Boolean(act.completed_at) || progressVal >= 100 || act.assessment_status === 'certified';
        return !isDone;
    }).length;

    // Filter activities by active filter pill
    const filteredActivity = dedupedActivity.filter((act) => {
        const progressVal = Math.min(100, Math.max(0, Math.round(Number(act.progress ?? 0))));
        const isDone = Boolean(act.completed_at) || progressVal >= 100 || act.assessment_status === 'certified';

        if (activityFilter === 'pending') return !isDone;
        if (activityFilter === 'completed') return isDone;
        return true;
    });

    const tabCourses =
        activeTab === 'live'
            ? liveCourses
            : activeTab === 'draft'
            ? draftCourses
            : myCourses;

    const displayedCourses = expandedCourses ? tabCourses : tabCourses.slice(0, 6);

    return (
        <StaffLayout>
            <Head title="Course Overview" />

            <div className="space-y-8">
                {/* Top Heading & Quick Action */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-extrabold text-[#111827]">
                            {isCoordinator ? 'Course Administration' : 'My Courses'}
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {isCoordinator
                                ? 'Platform-wide course oversight, faculty workload audit, and curriculum governance.'
                                : 'Manage your curriculum portfolio, author interactive modules, and track learner progress.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Link
                            href={route('staff.courses.create')}
                            className="inline-flex items-center gap-1.5 bg-[#111827] hover:bg-gray-800 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-transform active:scale-[0.98]"
                        >
                            <span>+ Create new course</span>
                        </Link>
                    </div>
                </div>

                {/* KPI Metrics Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                            Total Courses
                        </span>
                        <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] mt-1">
                            {myCourses.length}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {liveCourses.length} published · {draftCourses.length} drafts
                        </p>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                            Enrolled Learners
                        </span>
                        <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] mt-1">
                            {s.active_learners}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {s.total_enrollments} total registrations
                        </p>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                            Certified Graduates
                        </span>
                        <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#065F46] mt-1">
                            {s.completed}
                        </p>
                        <p className="text-xs text-emerald-600 font-semibold mt-1">
                            ✓ 100% curriculum passed
                        </p>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                            Avg. Completion
                        </span>
                        <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] mt-1">
                            {s.avg_completion}%
                        </p>
                        <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full overflow-hidden mt-2">
                            <div
                                className="bg-[#10B981] h-full rounded-full"
                                style={{ width: `${Math.min(100, Math.max(0, s.avg_completion))}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Filter Pills Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Course and activity filters">
                        {[
                            { id: 'all', label: `All Courses (${myCourses.length})` },
                            { id: 'live', label: `Published (${liveCourses.length})` },
                            { id: 'draft', label: `Drafts (${draftCourses.length})` },
                            { id: 'activity', label: `Recent Activity (${dedupedActivity.length})` },
                        ].map((filter) => {
                            const active = activeTab === filter.id;
                            return (
                                <button
                                    key={filter.id}
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => {
                                        setActiveTab(filter.id);
                                        setExpandedCourses(false);
                                    }}
                                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-colors min-h-[38px] flex items-center ${
                                        active
                                            ? 'bg-[#111827] text-white border-[#111827]'
                                            : 'bg-white text-[#111827] border-[#E2E8F0] hover:border-[#111827]'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>

                    {activeTab !== 'activity' && (
                        <Link
                            href={route('staff.courses.index')}
                            className="text-xs font-bold text-gray-600 hover:text-[#111827] underline"
                        >
                            Open Table View →
                        </Link>
                    )}
                </div>

                {/* VIEW 1: HORIZONTAL edX COURSE CARDS STACK */}
                {activeTab !== 'activity' && (
                    <div className="space-y-4">
                        {tabCourses.length > 0 ? (
                            <>
                                <div className="space-y-4">
                                    {displayedCourses.map((course) => (
                                        <CourseRow
                                            key={course.id}
                                            course={course}
                                            status={course.status === 'published' ? 'published' : 'draft'}
                                            variant="dashboard"
                                            activeMenuCourseId={activeMenuCourseId}
                                            setActiveMenuCourseId={setActiveMenuCourseId}
                                            isCoordinator={isCoordinator}
                                            instructors={instructors}
                                        />
                                    ))}
                                </div>

                                {tabCourses.length > 6 && (
                                    <div className="pt-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedCourses(!expandedCourses)}
                                            className="text-xs font-bold text-[#111827] hover:bg-[#F3F4F6] transition-colors py-2 px-5 rounded-lg border border-[#E2E8F0] bg-white"
                                        >
                                            {expandedCourses
                                                ? 'Show fewer courses'
                                                : `Show all ${tabCourses.length} courses`}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="border border-dashed border-[#CBD5E1] rounded-xl py-16 px-6 text-center bg-white">
                                <p className="text-base font-bold text-[#111827] mb-1 font-display">
                                    No courses found matching this filter
                                </p>
                                <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
                                    Create a new course or switch to another filter tab above.
                                </p>
                                <Link
                                    href={route('staff.courses.create')}
                                    className="inline-flex items-center gap-1.5 bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded-lg"
                                >
                                    + Create new course
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* VIEW 2: RECENT LEARNER ACTIVITY FEED */}
                {activeTab === 'activity' && (
                    <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden p-5 sm:p-6 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
                            <div>
                                <h3 className="font-display font-bold text-lg text-[#111827]">
                                    Learner Telemetry &amp; Assessment Activity
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Live student enrollments, module ticks, and final certification events.
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5">
                                {[
                                    { id: 'all', label: `All (${dedupedActivity.length})` },
                                    { id: 'pending', label: `In progress (${pendingCount})` },
                                    { id: 'completed', label: `Certified (${dedupedActivity.length - pendingCount})` },
                                ].map((pill) => (
                                    <button
                                        key={pill.id}
                                        type="button"
                                        onClick={() => setActivityFilter(pill.id)}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                            activityFilter === pill.id
                                                ? 'bg-[#111827] text-white'
                                                : 'text-gray-600 hover:bg-[#F3F4F6] hover:text-[#111827]'
                                        }`}
                                    >
                                        {pill.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredActivity.length > 0 ? (
                            <ul className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl bg-white overflow-hidden">
                                {filteredActivity.map((activity) => {
                                    const progressVal = Math.min(100, Math.max(0, Math.round(Number(activity.progress ?? 0))));
                                    const isDone = Boolean(activity.completed_at) || progressVal >= 100 || activity.assessment_status === 'certified';
                                    const learnerName = activity.user?.name || 'Enrolled Learner';
                                    const learnerEmail = activity.user?.email || '';
                                    const when = formatActivityTime(activity.updated_at || activity.created_at);

                                    return (
                                        <li
                                            key={activity.id}
                                            className="px-4 py-3.5 hover:bg-[#F9FAFB] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span title={learnerEmail} className="font-bold text-sm text-[#111827]">
                                                        {learnerName}
                                                    </span>
                                                    <span className="text-gray-400">·</span>
                                                    <span className="text-xs font-semibold text-gray-700">
                                                        {activity.course?.title || 'Course'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {activity.latest_module_title || 'Enrolled in course'}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0 text-xs">
                                                <span className="text-gray-500">{when}</span>
                                                <span className="font-bold text-[#111827] w-9 text-right">{progressVal}%</span>
                                                {isDone ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#D1FAE5] text-[#065F46] border border-[#10B981]">
                                                        Certified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                                                        In progress
                                                    </span>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="py-12 px-6 text-center bg-[#F9FAFB] border border-[#E2E8F0] rounded-xl">
                                <p className="text-sm font-semibold text-gray-600">
                                    No learner activity recorded for this filter.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </StaffLayout>
    );
}
