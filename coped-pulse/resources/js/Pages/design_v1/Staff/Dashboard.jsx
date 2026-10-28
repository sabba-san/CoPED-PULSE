import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';
import StatCard, { ProgressBar } from './Partials/StatCard';
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

    // Main workspace tab: 'courses' | 'activity' (eliminates side-by-side split clutter)
    const [mainView, setMainView] = useState('courses');

    // Tab state & controls for Courses section
    const [activeCourseTab, setActiveCourseTab] = useState('all');
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
        activeCourseTab === 'all'
            ? myCourses
            : activeCourseTab === 'live'
            ? liveCourses
            : draftCourses;
    const displayedCourses = expandedCourses ? tabCourses : tabCourses.slice(0, 6);

    return (
        <StaffLayout>
            <Head title="Course Overview" />

            {/* Calm, Low-Glare Header + Compact Summary Strip */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight font-display">
                        {isCoordinator ? 'Course Administration' : 'My Courses'}
                    </h1>
                    <div className="mt-1.5 flex items-center flex-wrap gap-2 text-xs text-slate-600">
                        <span className="font-semibold text-[#1E293B]">{myCourses.length} courses</span>
                        <span>·</span>
                        <span>{s.active_learners} enrolled learners</span>
                        <span>·</span>
                        <span>{s.completed} certified</span>
                        <span>·</span>
                        <span>{s.avg_completion}% avg. completion</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href={route('staff.courses.create')}
                        className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1E293B] rounded hover:bg-[#0F172A] transition-colors"
                    >
                        + Create new course
                    </Link>
                </div>
            </div>

            {/* Single-Focus Workspace Container (Soft Low-Glare Surface #F4F6F9) */}
            <div className="bg-[#F4F6F9] border border-[#CBD5E1] rounded-md overflow-hidden">
                {/* Primary Moodle Underline Tabs: My Courses vs Learner Activity */}
                <div className="px-4 sm:px-6 bg-[#EDF1F7] border-b border-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 -mb-px">
                        <button
                            type="button"
                            onClick={() => setMainView('courses')}
                            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                                mainView === 'courses'
                                    ? 'border-[#1E293B] text-[#1E293B] bg-[#F4F6F9]'
                                    : 'border-transparent text-slate-600 hover:text-[#1E293B]'
                            }`}
                        >
                            Course Overview ({myCourses.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setMainView('activity')}
                            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                                mainView === 'activity'
                                    ? 'border-[#1E293B] text-[#1E293B] bg-[#F4F6F9]'
                                    : 'border-transparent text-slate-600 hover:text-[#1E293B]'
                            }`}
                        >
                            Recent Learner Activity ({dedupedActivity.length})
                        </button>
                    </div>

                    {mainView === 'courses' && (
                        <div className="flex items-center gap-1 py-2 sm:py-0">
                            {[
                                { id: 'all', label: `All (${myCourses.length})` },
                                { id: 'live', label: `Published (${liveCourses.length})` },
                                { id: 'draft', label: `Drafts (${draftCourses.length})` },
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => { setActiveCourseTab(f.id); setExpandedCourses(false); }}
                                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                        activeCourseTab === f.id
                                            ? 'bg-[#1E293B] text-white'
                                            : 'text-slate-600 hover:bg-[#E2E8F0] hover:text-[#1E293B]'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* VIEW 1: SPACIOUS 2-COLUMN COURSE GRID */}
                {mainView === 'courses' && (
                    <div className="p-4 sm:p-6">
                        {tabCourses.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            className="text-xs font-semibold text-[#1E293B] hover:bg-[#E2E8F0] transition-colors py-1.5 px-4 rounded border border-[#CBD5E1] bg-[#F8FAFC]"
                                        >
                                            {expandedCourses
                                                ? 'Show fewer courses'
                                                : `Show all ${tabCourses.length} courses`}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="border border-dashed border-[#CBD5E1] rounded py-12 px-6 text-center bg-[#F8FAFC]">
                                <p className="text-sm font-semibold text-[#1E293B] mb-1">
                                    No courses in this filter.
                                </p>
                                <p className="text-xs text-slate-500 mb-4">
                                    Create a new course or switch filters above.
                                </p>
                                <Link
                                    href={route('staff.courses.create')}
                                    className="inline-flex items-center gap-1.5 bg-[#1E293B] hover:bg-[#0F172A] text-white font-semibold text-xs px-4 py-2 rounded"
                                >
                                    + Create new course
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* VIEW 2: FULL-WIDTH LEARNER ACTIVITY LIST */}
                {mainView === 'activity' && (
                    <div className="p-4 sm:p-6 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-slate-600">
                                Recent student enrollments, topic completions, and certification status.
                            </p>
                            <div className="flex items-center gap-1 bg-[#E2E8F0] p-1 rounded border border-[#CBD5E1]">
                                <button
                                    type="button"
                                    onClick={() => setActivityFilter('all')}
                                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                                        activityFilter === 'all'
                                            ? 'bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1]'
                                            : 'text-slate-600 hover:text-[#1E293B]'
                                    }`}
                                >
                                    All ({dedupedActivity.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActivityFilter('pending')}
                                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                                        activityFilter === 'pending'
                                            ? 'bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1]'
                                            : 'text-slate-600 hover:text-[#1E293B]'
                                    }`}
                                >
                                    In progress ({pendingCount})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActivityFilter('completed')}
                                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                                        activityFilter === 'completed'
                                            ? 'bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1]'
                                            : 'text-slate-600 hover:text-[#1E293B]'
                                    }`}
                                >
                                    Certified ({dedupedActivity.length - pendingCount})
                                </button>
                            </div>
                        </div>

                        {filteredActivity.length > 0 ? (
                            <ul className="divide-y divide-[#CBD5E1] border border-[#CBD5E1] rounded bg-[#F8FAFC]">
                                {filteredActivity.map((activity) => {
                                    const progressVal = Math.min(100, Math.max(0, Math.round(Number(activity.progress ?? 0))));
                                    const isDone = Boolean(activity.completed_at) || progressVal >= 100 || activity.assessment_status === 'certified';
                                    const learnerName = activity.user?.name || 'Enrolled Learner';
                                    const learnerEmail = activity.user?.email || '';
                                    const when = formatActivityTime(activity.updated_at || activity.created_at);

                                    return (
                                        <li key={activity.id} className="px-4 py-3 hover:bg-[#F1F5F9] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span title={learnerEmail} className="font-semibold text-sm text-[#1E293B]">
                                                        {learnerName}
                                                    </span>
                                                    <span className="text-slate-400">·</span>
                                                    <span className="text-xs font-medium text-slate-700">
                                                        {activity.course?.title || 'Course'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {activity.latest_module_title || 'Enrolled in course'}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0 text-xs">
                                                <span className="text-slate-500">{when}</span>
                                                <span className="font-semibold text-[#1E293B] w-9 text-right">{progressVal}%</span>
                                                {isDone ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]">
                                                        Certified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E2E8F0] text-slate-700 border border-[#CBD5E1]">
                                                        In progress
                                                    </span>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="py-12 px-6 text-center bg-[#F8FAFC] border border-[#CBD5E1] rounded">
                                <p className="text-sm text-slate-500">
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



