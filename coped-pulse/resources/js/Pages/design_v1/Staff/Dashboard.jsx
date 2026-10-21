import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';
import StatCard, { ProgressBar } from './Partials/StatCard';
import CourseRow from './Courses/Partials/CourseRow';

export default function Dashboard({ stats = {}, courses = [], breakdown = [], recentActivity = [] }) {
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

    // Tab state & controls for Courses section
    const [activeCourseTab, setActiveCourseTab] = useState('live');
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

    const tabCourses = activeCourseTab === 'live' ? liveCourses : draftCourses;
    const displayedCourses = expandedCourses ? tabCourses : tabCourses.slice(0, 3);

    return (
        <StaffLayout>
            <Head title="Instructor Dashboard" />

            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-display">
                        Instructor Studio & Dashboard
                    </h1>
                    <p className="mt-2 text-base sm:text-lg text-gray-600">
                        Active teaching workspace · Build your curriculum, preview courses, and track student submissions.
                    </p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Link
                        href={route('staff.courses.create')}
                        className="px-5 py-2.5 text-sm font-bold text-white bg-[#10B981] rounded-md hover:bg-emerald-600 transition-colors"
                    >
                        + New Course
                    </Link>
                    <Link
                        href={route('staff.courses.index')}
                        className="px-5 py-2.5 text-sm font-bold text-[#111827] bg-[#F3F4F6] border-2 border-[#E5E7EB] rounded-md hover:bg-gray-200 transition-colors"
                    >
                        All Courses
                    </Link>
                </div>
            </div>

            {/* High-Contrast KPI Stat Cards (Single SVG Icon, Clarified Counts) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    value={`${myCourses.length} Courses (${liveCourses.length} live)`}
                    label="Course Portfolio"
                    sub={`${draftCourses.length} drafts · ${s.total_modules} total modules`}
                    tone="bg-gray-100 text-gray-800 border-gray-300"
                    icon={(
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    )}
                />
                <StatCard
                    value={s.active_learners}
                    label="Active Students"
                    sub={`${s.total_enrollments} total enrollments`}
                    tone="bg-indigo-50 text-indigo-700 border-indigo-200"
                    icon={(
                        <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    )}
                />
                <StatCard
                    value={s.completed}
                    label="Completions"
                    sub={`${s.in_progress} actively studying`}
                    tone="bg-green-50 text-green-700 border-green-200"
                    icon={(
                        <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                />
                <StatCard
                    value={`${s.avg_completion}%`}
                    label="Class Avg Progress"
                    sub="across your curriculum"
                    tone="bg-amber-50 text-amber-700 border-amber-200"
                    icon={(
                        <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    )}
                />
            </div>

            {/* 1. My Courses Tabbed Rows (left) + 2. Needs Attention Feed (right): side-by-side */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: My Courses (~100-115px Compact Rows with Live/Draft Tabs) */}
                <div className="lg:col-span-7 space-y-4 min-w-0">
                    {/* Flat Tab Bar Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#E5E7EB] pb-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => { setActiveCourseTab('live'); setExpandedCourses(false); }}
                                className={`px-3.5 py-1.5 rounded text-xs font-bold transition-colors ${
                                    activeCourseTab === 'live'
                                        ? 'bg-[#111827] text-white'
                                        : 'bg-[#F3F4F6] text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Live ({liveCourses.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => { setActiveCourseTab('draft'); setExpandedCourses(false); }}
                                className={`px-3.5 py-1.5 rounded text-xs font-bold transition-colors ${
                                    activeCourseTab === 'draft'
                                        ? 'bg-[#111827] text-white'
                                        : 'bg-[#F3F4F6] text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Drafts ({draftCourses.length})
                            </button>
                        </div>
                        <Link
                            href={route('staff.courses.index')}
                            className="text-xs font-bold text-[#10B981] hover:text-emerald-700 uppercase tracking-wider shrink-0"
                        >
                            View all ({myCourses.length}) →
                        </Link>
                    </div>

                    {/* Compact Course Rows (Limited to 3 by default) */}
                    {tabCourses.length > 0 ? (
                        <div className="space-y-3">
                            {displayedCourses.map((course) => (
                                <CourseRow
                                    key={course.id}
                                    course={course}
                                    status={course.status === 'published' ? 'published' : 'draft'}
                                    variant="dashboard"
                                    activeMenuCourseId={activeMenuCourseId}
                                    setActiveMenuCourseId={setActiveMenuCourseId}
                                />
                            ))}

                            {/* Expand / Collapse Toggle if > 3 items */}
                            {tabCourses.length > 3 && (
                                <div className="pt-1 text-center">
                                    <button
                                        type="button"
                                        onClick={() => setExpandedCourses(!expandedCourses)}
                                        className="text-xs font-bold text-[#111827] hover:text-[#10B981] transition-colors py-1.5 px-4 rounded border-2 border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]"
                                    >
                                        {expandedCourses
                                            ? '▲ Show fewer courses'
                                            : `▼ Show all ${tabCourses.length} ${activeCourseTab} courses`}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-lg py-12 px-6 text-center">
                            <p className="text-sm font-bold text-[#111827] mb-1">
                                {activeCourseTab === 'live'
                                    ? 'No live courses published yet.'
                                    : 'No draft courses in progress.'}
                            </p>
                            <p className="text-xs text-gray-500 mb-4">
                                {activeCourseTab === 'live'
                                    ? 'Switch to the Drafts tab to review and deploy your modules live.'
                                    : 'All courses you have created are currently live and visible to learners.'}
                            </p>
                            <Link
                                href={route('staff.courses.create')}
                                className="inline-flex items-center gap-1.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded"
                            >
                                <span>+ Create New Course</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Right Column: Needs Attention & Submissions Feed (2-Line Rows, Filter Pills) */}
                <div className="lg:col-span-5 bg-white rounded-lg border-2 border-[#E5E7EB] overflow-hidden min-w-0">
                    {/* Feed Header with Title + Pending Count + 3 Filter Pills */}
                    <div className="p-4 border-b-2 border-[#E5E7EB] bg-[#F9FAFB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-base font-extrabold text-[#111827] font-display flex items-center gap-2">
                                <span>Needs attention</span>
                                <span className="text-xs font-bold bg-[#111827] text-white px-2 py-0.5 rounded">
                                    {pendingCount}
                                </span>
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Learner submissions &amp; unit progression
                            </p>
                        </div>

                        {/* Filter Pills: All | Pending quizzes | Completed */}
                        <div className="flex items-center gap-1 bg-[#E5E7EB] p-0.5 rounded-md self-start sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setActivityFilter('all')}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                                    activityFilter === 'all'
                                        ? 'bg-white text-[#111827]'
                                        : 'text-gray-600 hover:text-[#111827]'
                                }`}
                            >
                                All ({dedupedActivity.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActivityFilter('pending')}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                                    activityFilter === 'pending'
                                        ? 'bg-white text-[#92400E]'
                                        : 'text-gray-600 hover:text-[#111827]'
                                }`}
                            >
                                Pending ({pendingCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActivityFilter('completed')}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                                    activityFilter === 'completed'
                                        ? 'bg-white text-[#065F46]'
                                        : 'text-gray-600 hover:text-[#111827]'
                                }`}
                            >
                                Done ({dedupedActivity.length - pendingCount})
                            </button>
                        </div>
                    </div>

                    {/* 2-Line Activity Items */}
                    {filteredActivity.length > 0 ? (
                        <ul className="max-h-[440px] overflow-y-auto divide-y-2 divide-[#E5E7EB]">
                            {filteredActivity.map((activity) => {
                                const progressVal = Math.min(100, Math.max(0, Math.round(Number(activity.progress ?? 0))));
                                const isDone = Boolean(activity.completed_at) || progressVal >= 100 || activity.assessment_status === 'certified';
                                const learnerName = activity.user?.name || 'Enrolled Learner';
                                const learnerEmail = activity.user?.email || '';
                                const when = formatActivityTime(activity.updated_at || activity.created_at);

                                return (
                                    <li key={activity.id} className="p-3 sm:px-4 sm:py-2.5 hover:bg-[#F9FAFB] transition-colors">
                                        {/* Line 1: Learner Name · Course Title (Left) | Progress% · Time ago (Right) */}
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0 flex items-center gap-1.5 truncate">
                                                <span
                                                    title={learnerEmail}
                                                    className="font-bold text-xs sm:text-sm text-[#111827] truncate hover:underline cursor-help"
                                                >
                                                    {learnerName}
                                                </span>
                                                <span className="text-gray-400">·</span>
                                                <span className="text-xs text-gray-600 truncate font-medium">
                                                    {activity.course?.title || 'Course'}
                                                </span>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-1.5 text-xs">
                                                <span className="font-bold text-[#111827]">{progressVal}%</span>
                                                <span className="text-gray-400">·</span>
                                                <span className="text-gray-500 font-medium">{when}</span>
                                            </div>
                                        </div>

                                        {/* Line 2: Latest Chapter / Module · Status Badge (Quiz Pending / 100% Certified) */}
                                        <div className="flex items-center justify-between gap-2 mt-1 text-xs">
                                            <div className="min-w-0 flex items-center gap-1.5 text-gray-500 truncate">
                                                <span className="truncate">
                                                    {activity.latest_module_title || 'Course enrolled'}
                                                </span>
                                            </div>
                                            <div className="shrink-0">
                                                {isDone ? (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#D1FAE5] text-[#065F46] border border-[#10B981]">
                                                        100% Certified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]">
                                                        Quiz Pending
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="py-12 px-6 text-center">
                            <p className="text-sm font-semibold text-gray-500">
                                {activityFilter === 'pending'
                                    ? 'No pending quizzes. All enrolled learners are caught up!'
                                    : activityFilter === 'completed'
                                    ? 'No certified completions recorded yet.'
                                    : 'No learner submissions recorded yet.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </StaffLayout>
    );
}



