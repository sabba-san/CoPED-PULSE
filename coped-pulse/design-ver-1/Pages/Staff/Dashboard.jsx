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

            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-teal-700 tracking-tight">
                        Welcome Back, Instructor
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Manage your courses, track learner progress, and build your curriculum.
                    </p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Link
                        href={route('staff.courses.create')}
                        className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-500 hover:to-teal-500 shadow-md transition-all"
                    >
                        + New Course
                    </Link>
                    <Link
                        href={route('staff.courses.index')}
                        className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all"
                    >
                        Manage
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard value={s.total_courses} label="My Courses" sub={`${s.total_modules} modules`} />
                <StatCard value={s.active_learners} label="Active Learners" sub={`${s.total_enrollments} enrollments`} tone="bg-indigo-50 text-indigo-600" />
                <StatCard value={s.completed} label="Completed" sub={`${s.in_progress} in progress`} tone="bg-green-50 text-green-600" />
                <StatCard value={`${s.avg_completion}%`} label="Avg Completion" sub="across my courses" tone="bg-amber-50 text-amber-600" />
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-extrabold text-gray-900">Top Courses</h3>
                        <Link href={route('staff.courses.index')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                            View all →
                        </Link>
                    </div>
                    {breakdown.length > 0 ? (
                        <ul className="space-y-5">
                            {breakdown.map((c) => (
                                <li key={c.id}>
                                    <div className="flex items-center justify-between gap-3 mb-1">
                                        <Link href={route('staff.courses.edit', c.id)} className="text-sm font-bold text-gray-900 hover:text-emerald-700 truncate">
                                            {c.title}
                                        </Link>
                                        <span className="shrink-0 text-[11px] font-bold text-gray-500">
                                            {c.enrollments_count} learners • {c.completed_count} done
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

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-extrabold text-gray-900 mb-4">Recent Activity</h3>
                    {recentActivity.length > 0 ? (
                        <ul className="divide-y divide-gray-100">
                            {recentActivity.map((a) => (
                                <li key={a.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                                    <span className="min-w-0">
                                        <span className="font-bold text-gray-900">{a.user?.name || 'Learner'}</span>
                                        <span className="text-gray-500"> enrolled in </span>
                                        <span className="font-semibold text-gray-700 truncate">{a.course?.title}</span>
                                    </span>
                                    <span className={`shrink-0 px-2 py-1 rounded-full text-[11px] font-bold ${
                                        a.completed_at
                                            ? 'bg-green-100 text-green-800'
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
