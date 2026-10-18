import { Head, Link } from '@inertiajs/react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';
import StatCard, { ProgressBar } from './Partials/StatCard';

export default function Dashboard({ stats = {}, breakdown = [], recentActivity = [] }) {
    const s = {
        total_courses: stats.total_courses ?? 0,
        total_modules: stats.total_modules ?? 0,
        active_learners: stats.active_learners ?? 0,
        total_enrollments: stats.total_enrollments ?? 0,
        completed: stats.completed ?? 0,
        in_progress: stats.in_progress ?? 0,
        avg_completion: stats.avg_completion ?? 0,
    };

    return (
        <StaffLayout>
            <Head title="Instructor Dashboard" />

            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-display">
                        Instructor Dashboard
                    </h1>
                    <p className="mt-2 text-base sm:text-lg text-gray-600">
                        Manage your courses, track learner progress, and build your curriculum.
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
                        className="px-5 py-2.5 text-sm font-bold text-[#111827] bg-[#F3F4F6] border-2 border-transparent rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Manage
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard value={s.total_courses} label="My Courses" sub={`${s.total_modules} modules`} />
                <StatCard value={s.active_learners} label="Active Learners" sub={`${s.total_enrollments} enrollments`} tone="bg-indigo-50 text-indigo-700 border-indigo-200" />
                <StatCard value={s.completed} label="Completed" sub={`${s.in_progress} in progress`} tone="bg-green-50 text-green-700 border-green-200" />
                <StatCard value={`${s.avg_completion}%`} label="Avg Completion" sub="across my courses" tone="bg-amber-50 text-amber-700 border-amber-200" />
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-extrabold text-[#111827] text-lg font-display">Top Courses</h3>
                        <Link href={route('staff.courses.index')} className="text-xs font-bold text-[#10B981] hover:text-emerald-700">
                            View all →
                        </Link>
                    </div>
                    {breakdown.length > 0 ? (
                        <ul className="space-y-5">
                            {breakdown.map((c) => (
                                <li key={c.id}>
                                    <div className="flex items-center justify-between gap-3 mb-1">
                                        <Link href={route('staff.courses.edit', c.id)} className="text-sm font-bold text-[#111827] hover:text-[#10B981] truncate">
                                            {c.title}
                                        </Link>
                                        <span className="shrink-0 text-[11px] font-bold text-gray-500">
                                            {c.enrollments_count} learners · {c.completed_count} done
                                        </span>
                                    </div>
                                    <ProgressBar pct={c.avg_progress} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400">No courses yet. Create your first course to see analytics.</p>
                    )}
                </div>

                <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-6">
                    <h3 className="font-extrabold text-[#111827] text-lg font-display mb-4">Recent Activity</h3>
                    {recentActivity.length > 0 ? (
                        <ul className="divide-y-2 divide-[#E5E7EB]">
                            {recentActivity.map((a) => (
                                <li key={a.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                                    <span className="min-w-0">
                                        <span className="font-bold text-[#111827]">{a.user?.name || 'Learner'}</span>
                                        <span className="text-gray-500"> enrolled in </span>
                                        <span className="font-semibold text-gray-800 truncate">{a.course?.title}</span>
                                    </span>
                                    <span className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                        a.completed_at
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {a.completed_at ? 'COMPLETED' : `${Math.round(Number(a.progress ?? 0))}%`}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400">No enrollments yet. Share your catalog link with learners.</p>
                    )}
                </div>
            </div>
        </StaffLayout>
    );
}
