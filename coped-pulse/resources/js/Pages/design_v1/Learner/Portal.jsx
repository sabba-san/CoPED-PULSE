import { Head, Link } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import LearnerLayout from '@/Layouts/design_v1/LearnerLayout';
import { ArrowRightIcon, TrophyIcon, TargetIcon, CircleCheckIcon } from '@/Components/flat/icons';
import CourseLogoBadge from '@/Components/flat/CourseLogoBadge';

export default function Portal({ enrollments, stats }) {
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'in-progress', 'not-started', 'completed'
    const [sortBy, setSortBy] = useState('recent'); // 'recent', 'title'

    const [weeklyGoal, setWeeklyGoal] = useState('regular');
    const [goalReminder, setGoalReminder] = useState(false);

    useEffect(() => {
        try {
            const savedGoal = localStorage.getItem('coped_weekly_goal');
            if (savedGoal) setWeeklyGoal(savedGoal);
            const savedReminder = localStorage.getItem('coped_goal_reminder');
            if (savedReminder !== null) setGoalReminder(savedReminder === 'true');
        } catch {}
    }, []);

    const handleSelectGoal = (goalId) => {
        setWeeklyGoal(goalId);
        try {
            localStorage.setItem('coped_weekly_goal', goalId);
        } catch {}
    };

    const handleToggleReminder = (checked) => {
        setGoalReminder(checked);
        try {
            localStorage.setItem('coped_goal_reminder', String(checked));
        } catch {}
    };

    const filteredEnrollments = useMemo(() => {
        const raw = enrollments?.data || [];
        let result = [...raw];

        // Filter
        if (activeFilter === 'in-progress') {
            result = result.filter((e) => !e.completed_at && (e.progress ?? 0) > 0);
        } else if (activeFilter === 'not-started') {
            result = result.filter((e) => !e.completed_at && (e.progress ?? 0) === 0);
        } else if (activeFilter === 'completed') {
            result = result.filter((e) => Boolean(e.completed_at));
        }

        // Sort
        if (sortBy === 'title') {
            result.sort((a, b) => (a.course?.title || '').localeCompare(b.course?.title || ''));
        } else {
            result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        }

        return result;
    }, [enrollments?.data, activeFilter, sortBy]);

    const completedEnrollments = useMemo(() => {
        return (enrollments?.data || []).filter((e) => Boolean(e.completed_at));
    }, [enrollments?.data]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (enrollment) => {
        if (enrollment.completed_at) {
            return {
                label: 'COMPLETED',
                bg: 'bg-emerald-50',
                text: 'text-[#10B981]',
                border: 'border-[#10B981]',
            };
        }
        if ((enrollment.progress ?? 0) > 0) {
            return {
                label: 'IN PROGRESS',
                bg: 'bg-blue-50',
                text: 'text-[#3B82F6]',
                border: 'border-[#3B82F6]',
            };
        }
        return {
            label: 'NOT STARTED',
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            border: 'border-gray-300',
        };
    };

    const getCTAText = (enrollment) => {
        if (enrollment.completed_at) return 'Review Course';
        if ((enrollment.progress ?? 0) > 0) return 'Resume Course';
        return 'Begin Course';
    };

    const progressPct = (enrollment) =>
        Math.min(100, Math.max(0, Math.round(Number(enrollment.progress ?? 0))));

    return (
        <LearnerLayout>
            <Head title="My Learning Portal" />

            <div className="space-y-8">
                {/* Top Heading & Refine Bar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-extrabold text-[#111827]">
                            My Courses
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Track your active courses, weekly study goals, and official records.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {/* Refine Filter Pills */}
                        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Course status filters">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'in-progress', label: 'In-Progress' },
                                { id: 'not-started', label: 'Not Started' },
                                { id: 'completed', label: 'Completed' },
                            ].map((filter) => {
                                const active = activeFilter === filter.id;
                                return (
                                    <button
                                        key={filter.id}
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setActiveFilter(filter.id)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md border-2 transition-colors ${
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

                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            aria-label="Sort courses"
                            className="px-3 py-1.5 text-xs font-bold rounded-md border-2 border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:border-[#111827] cursor-pointer"
                        >
                            <option value="recent">Last enrolled</option>
                            <option value="title">Title (A-Z)</option>
                        </select>
                    </div>
                </div>

                {/* 2-Column Asymmetric Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column (Horizontal edX Course Cards) */}
                    <div className="lg:col-span-8 space-y-6">
                        {filteredEnrollments.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-lg py-16 px-6 text-center">
                                <TrophyIcon className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                                <h2 className="font-display font-bold text-lg text-[#111827] mb-1">
                                    {activeFilter !== 'all'
                                        ? 'No courses found matching this filter.'
                                        : 'You are not enrolled in any courses yet.'}
                                </h2>
                                <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                                    {activeFilter !== 'all'
                                        ? 'Try switching to another filter tab to view all enrolled courses.'
                                        : 'Explore our catalog of professional courses and start learning today.'}
                                </p>
                                <Link
                                    href={route('learner.catalog')}
                                    className="inline-flex items-center gap-2 bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs px-5 py-2.5 rounded transition-transform active:scale-[0.98]"
                                >
                                    <span>Browse Course Catalog</span>
                                    <ArrowRightIcon className="w-4 h-4" />
                                </Link>
                            </div>
                        ) : (
                            filteredEnrollments.map((enrollment) => {
                                const course = enrollment.course;
                                const status = getStatusBadge(enrollment);
                                const pct = progressPct(enrollment);
                                const enrolledAt = formatDate(enrollment.created_at);

                                return (
                                    <div
                                        key={enrollment.id}
                                        className="bg-white border-2 border-[#E5E7EB] rounded-lg overflow-hidden transition-transform duration-200 hover:scale-[1.005]"
                                    >
                                        {/* Main Row */}
                                        <div className="flex flex-col sm:flex-row items-stretch">
                                            {/* Left Flat Graphic Block: CourseLogoBadge */}
                                            <CourseLogoBadge
                                                category={course?.category_logo}
                                                size="tile"
                                                subtitle={`${pct}% Completed`}
                                                className="!w-full sm:!w-44 shrink-0"
                                            />

                                            {/* Center Course Details */}
                                            <div className="flex-1 p-6 flex flex-col justify-between min-w-0 space-y-3">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                            UUM CoPED · Enrolled {enrolledAt}
                                                        </span>
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold border ${status.border} ${status.bg} ${status.text}`}
                                                        >
                                                            {status.label}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 bg-[#F3F4F6] border border-[#E5E7EB] text-[10px] font-bold text-gray-700 px-2 py-0.5 rounded">
                                                            📅 {course?.academic_year || '2026 / 2027'}
                                                        </span>
                                                        {course?.cert_title && (
                                                            <span className="inline-flex items-center gap-1 bg-[#FFFBEB] border border-[#FDE68A] text-[10px] font-bold text-[#92400E] px-2 py-0.5 rounded">
                                                                🎓 {course.cert_title}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h2 className="font-display text-xl font-bold text-[#111827] truncate">
                                                        {course?.title}
                                                    </h2>
                                                    <p className="text-sm text-gray-600 mt-0.5">
                                                        {course?.instructor?.name || 'Faculty Instructor'}
                                                    </p>
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    Self-paced learning · 100% required to pass Final Assessment
                                                </div>
                                            </div>

                                            {/* Right Primary CTA Button */}
                                            <div className="p-6 flex flex-col items-stretch justify-center gap-2 shrink-0 border-t-2 sm:border-t-0 sm:border-l-2 border-[#E5E7EB] bg-[#F9FAFB]">
                                                <Link
                                                    href={route('learner.course.learn', course.id)}
                                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-gray-800 text-white font-bold py-3 px-5 rounded text-sm transition-transform active:scale-[0.98]"
                                                >
                                                    <span>{getCTAText(enrollment)}</span>
                                                    <ArrowRightIcon className="w-4 h-4" />
                                                </Link>
                                                {enrollment.completed_at && (
                                                    <Link
                                                        href={route('learner.course.certificate', course.id)}
                                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white border-2 border-[#10B981] text-[#065F46] hover:bg-[#10B981] hover:text-white font-bold py-2.5 px-4 rounded text-xs transition-colors duration-200"
                                                    >
                                                        <span>🎓 View Certificate PDF</span>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bottom Passing-Grade Strip */}
                                        <div className="bg-[#F3F4F6] border-t-2 border-[#E5E7EB] px-5 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-semibold text-[#111827]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500">ⓘ</span>
                                                <span>Grade required to pass Final Assessment: 100%</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-28 sm:w-40 bg-white border border-[#E5E7EB] h-2.5 rounded-full overflow-hidden"
                                                    role="progressbar"
                                                    aria-valuenow={pct}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    aria-label={`Progress for ${course?.title}`}
                                                >
                                                    <div
                                                        className="h-full bg-[#10B981] rounded-full transition-all"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="font-bold text-[#111827] min-w-[3ch] text-right">
                                                    {pct}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {/* Pagination Links */}
                        {enrollments.links && enrollments.links.length > 3 && (
                            <div className="mt-8 flex justify-center gap-2">
                                {enrollments.links.map((link, i) =>
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-3.5 py-1.5 rounded text-xs font-bold border-2 transition-colors ${
                                                link.active
                                                    ? 'bg-[#111827] text-white border-[#111827]'
                                                    : 'bg-white text-gray-700 border-[#E5E7EB] hover:bg-[#F3F4F6] hover:text-[#111827]'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="px-3.5 py-1.5 rounded text-xs font-bold bg-[#F3F4F6] text-gray-400 border-2 border-[#E5E7EB]"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar (Weekly Learning Goal + My Learner Records) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Card 1: Set a weekly learning goal */}
                        <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6 space-y-5">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <TargetIcon className="w-5 h-5 text-[#3B82F6]" />
                                    <h2 className="font-display font-extrabold text-lg text-[#111827]">
                                        Set a weekly learning goal
                                    </h2>
                                </div>
                                <p className="text-xs text-gray-600">
                                    Learners who set a goal are 75% more likely to finish.
                                </p>
                            </div>

                            <div className="space-y-2.5">
                                {[
                                    { id: 'casual', title: 'Casual', subtitle: '1 day a week' },
                                    { id: 'regular', title: 'Regular', subtitle: '3 days a week' },
                                    { id: 'intense', title: 'Intense', subtitle: '5 days a week' },
                                ].map((goal) => {
                                    const active = weeklyGoal === goal.id;
                                    return (
                                        <button
                                            key={goal.id}
                                            type="button"
                                            onClick={() => handleSelectGoal(goal.id)}
                                            className={`w-full text-left p-3 rounded-md border-2 transition-colors flex items-center justify-between ${
                                                active
                                                    ? 'border-[#111827] bg-[#F3F4F6] text-[#111827] font-bold'
                                                    : 'border-[#E5E7EB] bg-white text-gray-700 hover:border-gray-400'
                                            }`}
                                        >
                                            <div>
                                                <p className="text-sm font-bold">{goal.title}</p>
                                                <p className="text-xs text-gray-500">{goal.subtitle}</p>
                                            </div>
                                            <span
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                    active
                                                        ? 'border-[#111827] bg-[#111827] text-white'
                                                        : 'border-[#E5E7EB]'
                                                }`}
                                            >
                                                {active && <CircleCheckIcon className="w-3.5 h-3.5 text-white" />}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t-2 border-[#E5E7EB]">
                                <input
                                    type="checkbox"
                                    checked={goalReminder}
                                    onChange={(e) => handleToggleReminder(e.target.checked)}
                                    className="w-4 h-4 rounded border-2 border-[#E5E7EB] text-[#111827] focus:ring-0 focus:outline-none cursor-pointer"
                                />
                                <span className="text-xs font-semibold text-gray-700">
                                    Set a goal reminder
                                </span>
                            </label>
                        </div>

                        {/* Card 2: My Learner Records & Certificates */}
                        <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrophyIcon className="w-5 h-5 text-[#10B981]" />
                                    <h2 className="font-display font-extrabold text-lg text-[#111827]">
                                        My Learner Records
                                    </h2>
                                </div>
                                <span className="bg-[#10B981] text-white text-xs font-black px-2 py-0.5 rounded">
                                    {completedEnrollments.length}
                                </span>
                            </div>

                            <p className="text-xs text-gray-600">
                                Official verifiable records earned upon passing with 100%.
                            </p>

                            {completedEnrollments.length > 0 ? (
                                <ul className="space-y-3 pt-2">
                                    {completedEnrollments.map((item) => (
                                        <li
                                            key={item.id}
                                            className="p-3 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-md space-y-2"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-display font-bold text-sm text-[#111827] line-clamp-1">
                                                    {item.course?.title}
                                                </h3>
                                                <span className="bg-emerald-50 text-[#059669] border border-[#10B981] text-[9px] font-black uppercase px-2 py-0.5 rounded shrink-0">
                                                    VERIFIED RECORD
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                                                <span>Passed on {formatDate(item.completed_at)}</span>
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        href={route('learner.course.learn', item.course?.id)}
                                                        className="font-bold text-[#111827] hover:underline"
                                                    >
                                                        Review
                                                    </Link>
                                                    <Link
                                                        href={route('learner.course.certificate', item.course?.id)}
                                                        className="font-bold text-[#065F46] hover:underline"
                                                    >
                                                        🎓 Certificate
                                                    </Link>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="py-8 px-4 text-center border-2 border-dashed border-[#E5E7EB] rounded-md bg-[#F9FAFB]">
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        No records yet. Course records are created once you pass the Final Assessment with 100%.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </LearnerLayout>
    );
}