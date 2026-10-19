import { Head, Link } from '@inertiajs/react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';
import StatCard, { ProgressBar } from './Partials/StatCard';

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

            {/* High-Contrast Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard value={s.total_courses} label="My Active Courses" sub={`${s.total_modules} total modules`} />
                <StatCard value={s.active_learners} label="Active Students" sub={`${s.total_enrollments} total enrollments`} tone="bg-indigo-50 text-indigo-700 border-indigo-200" />
                <StatCard value={s.completed} label="Completions" sub={`${s.in_progress} actively studying`} tone="bg-green-50 text-green-700 border-green-200" />
                <StatCard value={`${s.avg_completion}%`} label="Class Avg Progress" sub="across your curriculum" tone="bg-amber-50 text-amber-700 border-amber-200" />
            </div>

            {/* 1. My Active Courses (Learner-Card Style) */}
            <div className="mt-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#E5E7EB] pb-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-[#111827] font-display">
                            My Active Courses
                        </h2>
                        <p className="text-sm text-gray-600 mt-0.5">
                            Courses you teach, structured in the student view format with direct curriculum editing controls.
                        </p>
                    </div>
                    <Link
                        href={route('staff.courses.index')}
                        className="text-xs font-bold text-[#10B981] hover:text-emerald-700 uppercase tracking-wider shrink-0"
                    >
                        View Full Course Index ({myCourses.length}) →
                    </Link>
                </div>

                {myCourses.length > 0 ? (
                    <div className="space-y-5">
                        {myCourses.map((course) => {
                            const avgProgress = Math.min(100, Math.max(0, Math.round(Number(course.avg_progress ?? 0))));
                            const statusColor =
                                course.status === 'published'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : course.status === 'archived'
                                    ? 'bg-gray-100 text-gray-800 border-gray-300'
                                    : 'bg-amber-100 text-amber-800 border-amber-300';

                            return (
                                <div
                                    key={course.id}
                                    className="bg-white border-2 border-[#E5E7EB] rounded-lg overflow-hidden transition-transform duration-200 hover:scale-[1.005]"
                                >
                                    <div className="flex flex-col md:flex-row items-stretch">
                                        {/* Left Flat Graphic Block */}
                                        <div className="bg-[#111827] text-white p-6 flex flex-col justify-center items-center w-full md:w-44 shrink-0 border-b-2 md:border-b-0 md:border-r-2 border-[#E5E7EB]">
                                            <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-1">
                                                CURRICULUM
                                            </span>
                                            <p className="text-3xl font-black text-white">{course.modules_count ?? 0}</p>
                                            <span className="text-[11px] text-gray-400 font-semibold mt-0.5">
                                                {course.modules_count === 1 ? 'Module' : 'Modules'}
                                            </span>
                                        </div>

                                        {/* Center Course Details */}
                                        <div className="flex-1 p-6 flex flex-col justify-between min-w-0 space-y-3">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                        UUM CoPED
                                                    </span>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold border ${statusColor}`}>
                                                        {course.status ? course.status.toUpperCase() : 'DRAFT'}
                                                    </span>
                                                </div>
                                                <h3 className="font-display text-xl font-bold text-[#111827] truncate">
                                                    <Link href={route('staff.courses.show', course.id)} className="hover:text-[#10B981] transition-colors">
                                                        {course.title}
                                                    </Link>
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                                    {course.description || 'No course description provided yet.'}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500">
                                                <span>{course.enrollments_count ?? 0} Students Enrolled</span>
                                                <span>·</span>
                                                <span>{course.completed_count ?? 0} Finished</span>
                                                <span>·</span>
                                                <span>Self-paced with 100% Passing Assessment</span>
                                            </div>
                                        </div>

                                        {/* Right Action Buttons */}
                                        <div className="p-6 flex flex-col sm:flex-row md:flex-col items-center justify-center gap-2.5 shrink-0 border-t-2 md:border-t-0 md:border-l-2 border-[#E5E7EB] bg-[#F9FAFB]">
                                            <Link
                                                href={route('staff.courses.edit', course.id)}
                                                className="w-full inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-gray-800 text-white font-bold py-2.5 px-4 rounded text-xs transition-transform active:scale-[0.98]"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                <span>Edit Curriculum</span>
                                            </Link>
                                            <Link
                                                href={route('staff.courses.show', course.id)}
                                                className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-[#111827] border-2 border-[#E5E7EB] font-bold py-2.5 px-4 rounded text-xs transition-colors"
                                            >
                                                <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                <span>Preview as Learner</span>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Bottom Average Progress Strip */}
                                    <div className="bg-[#F3F4F6] border-t-2 border-[#E5E7EB] px-5 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-semibold text-[#111827]">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <span>Student Cohort Average Progress:</span>
                                            <span className="font-extrabold text-[#111827]">{avgProgress}%</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-32 sm:w-48 bg-white border border-[#E5E7EB] h-2.5 rounded-full overflow-hidden"
                                                role="progressbar"
                                                aria-valuenow={avgProgress}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                            >
                                                <div
                                                    className="h-full bg-[#10B981] rounded-full transition-all"
                                                    style={{ width: `${avgProgress}%` }}
                                                />
                                            </div>
                                            <span className="font-bold text-[#111827] min-w-[3ch] text-right">
                                                {avgProgress}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-lg py-16 px-6 text-center">
                        <p className="text-base font-bold text-[#111827] mb-1">No courses created yet.</p>
                        <p className="text-sm text-gray-600 mb-6">Create your first course to begin authoring curriculum modules.</p>
                        <Link
                            href={route('staff.courses.create')}
                            className="inline-flex items-center gap-2 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded"
                        >
                            <span>+ Create New Course</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* 2. Recent Learner Activity & Submissions Feed */}
            <div className="mt-12 bg-white rounded-md border-2 border-[#E5E7EB] overflow-hidden">
                <div className="p-6 border-b-2 border-[#E5E7EB] bg-[#F9FAFB] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h3 className="text-xl font-extrabold text-[#111827] font-display">
                            Recent Learner Activity & Submissions Feed
                        </h3>
                        <p className="text-xs text-gray-600 mt-0.5">
                            Live submissions, unit completions, and progress updates across all your students.
                        </p>
                    </div>
                    <span className="text-xs font-bold bg-[#111827] text-white px-2.5 py-1 rounded">
                        {recentActivity.length} Active Records
                    </span>
                </div>

                {recentActivity.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-[#E5E7EB] bg-white text-[11px] font-extrabold uppercase text-gray-500 tracking-wider">
                                    <th className="py-3.5 px-6">Learner</th>
                                    <th className="py-3.5 px-6">Course</th>
                                    <th className="py-3.5 px-6">Modules Done</th>
                                    <th className="py-3.5 px-6">Overall Progress</th>
                                    <th className="py-3.5 px-6">Assessment Status</th>
                                    <th className="py-3.5 px-6 text-right">Last Active</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-[#E5E7EB] text-sm">
                                {recentActivity.map((activity) => {
                                    const progressVal = Math.min(100, Math.max(0, Math.round(Number(activity.progress ?? 0))));
                                    const isDone = Boolean(activity.completed_at) || progressVal >= 100;
                                    const learnerName = activity.user?.name || 'Enrolled Learner';
                                    const learnerEmail = activity.user?.email || '';
                                    const completedMods = activity.completed_modules_count ?? 0;
                                    const totalMods = activity.total_modules_count ?? 0;

                                    return (
                                        <tr key={activity.id} className="hover:bg-[#F9FAFB] transition-colors">
                                            <td className="py-4 px-6 font-semibold text-[#111827]">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center text-xs font-extrabold shrink-0">
                                                        {learnerName.charAt(0).toUpperCase()}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-[#111827] truncate">
                                                            {learnerName}
                                                        </p>
                                                        {activity.latest_module_title ? (
                                                            <p className="text-[11px] text-gray-500 font-medium truncate">
                                                                Latest: {activity.latest_module_title}
                                                            </p>
                                                        ) : (
                                                            learnerEmail && <p className="text-xs text-gray-400 truncate">{learnerEmail}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-[#111827]">
                                                <span className="line-clamp-1">{activity.course?.title || 'Course'}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F3F4F6] text-[#111827] text-xs font-bold border border-[#E5E7EB]">
                                                    <span className="text-emerald-600 font-extrabold">✓</span>
                                                    <span>{completedMods} / {totalMods} Done</span>
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-20 bg-gray-200 h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${isDone ? 'bg-[#10B981]' : 'bg-[#3B82F6]'}`}
                                                            style={{ width: `${progressVal}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-bold text-xs text-[#111827]">{progressVal}%</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {isDone ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                        <span>✓</span> 100% Certified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300">
                                                        <span>⏳</span> Quiz Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right text-xs font-semibold whitespace-nowrap">
                                                {formatActivityTime(activity.updated_at || activity.created_at) === 'Just Now' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                        ● Just Now
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500">{formatActivityTime(activity.updated_at || activity.created_at)}</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 px-6 text-center">
                        <p className="text-sm font-semibold text-gray-500">
                            No learner submissions recorded yet. Once enrolled learners complete units or take assessments, real-time activity will show here.
                        </p>
                    </div>
                )}
            </div>
        </StaffLayout>
    );
}
