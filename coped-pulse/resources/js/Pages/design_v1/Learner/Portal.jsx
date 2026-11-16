import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import LearnerLayout from '@/Layouts/design_v1/LearnerLayout';
import { ArrowRightIcon, TrophyIcon, TargetIcon, CircleCheckIcon, GraduationCapIcon, PlayIcon, BoltIcon, SparklesIcon } from '@/Components/flat/icons';
import CourseLogoBadge, { LOGO_CONFIG } from '@/Components/flat/CourseLogoBadge';
import SortMenu from '@/Components/flat/SortMenu';

export default function Portal({ enrollments, stats }) {
    const { unreadChatSummary, auth } = usePage().props;
    const firstName = auth?.user?.name?.split(' ')[0] || 'Learner';
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'in-progress', 'not-started', 'completed', 'free', 'subscription'
    const [sortBy, setSortBy] = useState('recent'); // 'recent', 'az', 'za'

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
        } else if (activeFilter === 'free') {
            result = result.filter((e) => !(e.course?.billing_type !== 'free' && Number(e.course?.price || 0) > 0));
        } else if (activeFilter === 'subscription') {
            result = result.filter((e) => e.course?.billing_type === 'subscription');
        }

        // Sort
        if (sortBy === 'az' || sortBy === 'za') {
            result.sort((a, b) => (a.course?.title || '').localeCompare(b.course?.title || ''));
            if (sortBy === 'za') result.reverse();
        } else {
            result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        }

        return result;
    }, [enrollments?.data, activeFilter, sortBy]);

    const inProgressEnrollment = useMemo(() => {
        const raw = enrollments?.data || [];
        return raw
            .filter((e) => !e.completed_at && Number(e.progress ?? 0) > 0)
            .sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))[0] || null;
    }, [enrollments?.data]);

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

            <div className="space-y-5 sm:space-y-8">
                {/* Mobile Greeting, Duolingo-style Streak/Progress Pill & Quick Stats (< md) */}
                <div className="md:hidden space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB]">
                                UUM CoPED · Ready to learn
                            </p>
                            <h1 className="font-display text-xl font-black text-[#111827] truncate">
                                Hi, {firstName}
                            </h1>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFFBEB] border border-[#FCD34D] text-[#B45309] text-xs font-black">
                                <BoltIcon className="w-3.5 h-3.5" />
                                <span>{stats?.modules_completed ?? 0} done</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#6EE7B7] text-[#047857] text-xs font-black">
                                <SparklesIcon className="w-3.5 h-3.5" />
                                <span>{stats?.overall_pct ?? 0}%</span>
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                        <div className="bg-white border border-[#E5E7EB] border-b-[3px] rounded-2xl p-3 text-center">
                            <span className="block font-display text-xl font-black text-[#111827] leading-tight">
                                {stats?.enrolled ?? 0}
                            </span>
                            <span className="text-[11px] font-semibold text-[#64748B]">Enrolled</span>
                        </div>
                        <div className="bg-white border border-[#E5E7EB] border-b-[3px] rounded-2xl p-3 text-center">
                            <span className="block font-display text-xl font-black text-[#2563EB] leading-tight">
                                {stats?.in_progress ?? 0}
                            </span>
                            <span className="text-[11px] font-semibold text-[#64748B]">Active</span>
                        </div>
                        <div className="bg-white border border-[#E5E7EB] border-b-[3px] rounded-2xl p-3 text-center">
                            <span className="block font-display text-xl font-black text-[#10B981] leading-tight">
                                {stats?.completed ?? 0}
                            </span>
                            <span className="text-[11px] font-semibold text-[#64748B]">Mastered</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1">
                        {[
                            { value: 'all', label: 'All' },
                            { value: 'in-progress', label: 'In Progress' },
                            { value: 'not-started', label: 'Not Started' },
                            { value: 'completed', label: 'Completed' },
                            { value: 'free', label: 'Free' },
                        ].map((chip) => {
                            const active = activeFilter === chip.value;
                            return (
                                <button
                                    key={chip.value}
                                    type="button"
                                    onClick={() => setActiveFilter(chip.value)}
                                    className={`min-h-11 px-4 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                                        active
                                            ? 'bg-[#111827] text-white'
                                            : 'bg-white border border-[#E5E7EB] text-[#475569] hover:bg-[#F3F4F6]'
                                    }`}
                                >
                                    {chip.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Desktop Heading & Refine Bar (>= md) */}
                <div className="hidden md:flex md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-extrabold text-[#111827]">
                            My Courses
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Track your active courses, weekly study goals, and official records.
                        </p>
                    </div>

                    <SortMenu
                        groups={[
                            {
                                id: 'order',
                                label: 'Order',
                                value: sortBy,
                                defaultValue: 'recent',
                                onChange: setSortBy,
                                options: [
                                    { value: 'recent', label: 'Last enrolled' },
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
                                    { value: 'all', label: 'All' },
                                    { value: 'in-progress', label: 'In-Progress' },
                                    { value: 'not-started', label: 'Not Started' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'free', label: 'Free Courses' },
                                    { value: 'subscription', label: 'Subscription Courses' },
                                ],
                            },
                        ]}
                    />
                </div>

                {/* 2-Column Asymmetric Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                    {/* Left Column (Horizontal edX Course Cards) */}
                    <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                        {/* Continue Where You Left Off Top Strip */}
                        {inProgressEnrollment && inProgressEnrollment.course && (
                            <div className="bg-[#111827] text-white rounded-2xl sm:rounded-lg p-4 sm:p-5 border-2 border-[#111827] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                                    <CourseLogoBadge
                                        category={inProgressEnrollment.course.category_logo}
                                        size="badge"
                                        className="shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#10B981] text-white">
                                                Continue Learning
                                            </span>
                                            <span className="text-xs text-gray-300 font-semibold truncate">
                                                {progressPct(inProgressEnrollment)}%
                                            </span>
                                        </div>
                                        <h2 className="text-base sm:text-lg font-extrabold text-white truncate font-display">
                                            {inProgressEnrollment.course.title}
                                        </h2>
                                        <div className="w-full max-w-xs bg-gray-700 h-2 rounded-full overflow-hidden mt-2">
                                            <div
                                                className="bg-[#10B981] h-full rounded-full transition-all duration-300"
                                                style={{ width: `${progressPct(inProgressEnrollment)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href={route('learner.course.learn', inProgressEnrollment.course.id)}
                                    className="min-h-12 sm:min-h-11 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-2xl sm:rounded-md shrink-0 tactile-btn border border-[#047857] sm:border-0"
                                >
                                    <PlayIcon className="w-3.5 h-3.5" />
                                    <span>Resume Course</span>
                                </Link>
                            </div>
                        )}

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
                                const unreadCount = unreadChatSummary?.by_course?.[course?.id] || 0;
                                const themeConfig = LOGO_CONFIG[course?.category_logo] || LOGO_CONFIG.charcoal || LOGO_CONFIG.general;
                                const EmblemIcon = themeConfig?.icon;
                                const isKssrCourse = Boolean(
                                    course?.title?.includes('Tahun') ||
                                        course?.title?.includes('KSSR') ||
                                        course?.academic_year?.includes('KSSR')
                                );

                                return (
                                    <div
                                        key={enrollment.id}
                                        onClick={(e) => {
                                            if (e.target.closest('button, a, input, select')) return;
                                            router.visit(route('learner.course.learn', course.id));
                                        }}
                                        className={`rounded-2xl sm:rounded-lg overflow-hidden transition-all duration-200 sm:hover:scale-[1.005] hover:border-black cursor-pointer ${
                                            isKssrCourse
                                                ? 'bg-[#FEF9C3]/40 border-2 border-[#111827]'
                                                : 'bg-white border border-[#E5E7EB] sm:border-2'
                                        }`}
                                    >
                                        {/* Mobile View (< sm): Canvas Color-Banded Card + Tactile Button */}
                                        <div className="block sm:hidden">
                                            <div className={`h-1.5 w-full ${themeConfig.bg}`} aria-hidden="true" />
                                            <div className="p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                {/* 56x56px Compact Emblem Badge */}
                                                <div className={`w-14 h-14 shrink-0 rounded-xl ${themeConfig.bg} ${themeConfig.text} flex flex-col items-center justify-center border border-black/10`}>
                                                    {EmblemIcon ? <EmblemIcon className="w-6 h-6" /> : <GraduationCapIcon className="w-6 h-6" />}
                                                    <span className="text-[8px] font-black uppercase tracking-wider opacity-85 leading-none mt-0.5">UUM</span>
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black border ${status.border} ${status.bg} ${status.text}`}
                                                        >
                                                            {status.label}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-500">
                                                            {course?.academic_year || '2026/2027'}
                                                        </span>
                                                        {unreadCount > 0 && (
                                                            <Link
                                                                href={route('learner.course.learn', course.id) + '?tab=chat'}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="bg-[#D1FAE5] border border-[#10B981] text-[#065F46] text-[9px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0"
                                                            >
                                                                <span>{unreadCount} new</span>
                                                            </Link>
                                                        )}
                                                    </div>
                                                    <h2 className="font-display text-sm font-black text-[#111827] line-clamp-2 leading-snug">
                                                        {course?.title}
                                                    </h2>
                                                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                                        {course?.instructor?.name || 'Faculty Instructor'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Progress & Primary Action Row */}
                                            <div className="pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <div
                                                        className="flex-1 max-w-[120px] bg-[#F3F4F6] border border-[#E5E7EB] h-2 rounded-full overflow-hidden"
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
                                                    <span className="text-xs font-black text-[#111827] shrink-0">{pct}%</span>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Link
                                                        href={route('learner.course.learn', course.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="min-h-11 bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs px-4 rounded-xl inline-flex items-center gap-1.5 tactile-btn border border-black"
                                                    >
                                                        <span>{getCTAText(enrollment)}</span>
                                                        <ArrowRightIcon className="w-3.5 h-3.5" />
                                                    </Link>
                                                    {enrollment.completed_at && (
                                                        <Link
                                                            href={route('learner.course.certificate', course.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="min-h-11 min-w-11 border border-[#10B981] border-b-[3px] text-[#065F46] hover:bg-emerald-50 font-bold text-xs px-2.5 rounded-xl inline-flex items-center justify-center"
                                                            title="Certificate PDF"
                                                            aria-label="View Certificate PDF"
                                                        >
                                                            <GraduationCapIcon className="w-4 h-4" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                            </div>
                                        </div>

                                        {/* Desktop View (sm:): Full Poster Row & Passing Grade Strip */}
                                        <div className="hidden sm:block">
                                            <div className="flex flex-row items-stretch">
                                                {/* Left Flat Graphic Block: CourseLogoBadge */}
                                                <CourseLogoBadge
                                                    category={course?.category_logo}
                                                    size="tile"
                                                    subtitle={`${pct}% Completed`}
                                                    className="!w-44 shrink-0"
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
                                                            {isKssrCourse && (
                                                                <span className="inline-flex items-center gap-1 bg-[#0284C7] border border-[#111827] text-[10px] font-black text-white px-2 py-0.5 rounded">
                                                                    🌈 MOD CERIA KSSR
                                                                </span>
                                                            )}
                                                            {course?.cert_title && (
                                                                <span className="inline-flex items-center gap-1 bg-[#FFFBEB] border border-[#FDE68A] text-[10px] font-bold text-[#92400E] px-2 py-0.5 rounded">
                                                                    🎓 {course.cert_title}
                                                                </span>
                                                            )}
                                                            {unreadCount > 0 && (
                                                                <Link
                                                                    href={route('learner.course.learn', course.id) + '?tab=chat'}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="bg-[#D1FAE5] border border-[#10B981] text-[#065F46] hover:bg-[#10B981] hover:text-white transition-colors text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 shrink-0"
                                                                    title={`${unreadCount} unread message(s)`}
                                                                >
                                                                    <span>💬</span>
                                                                    <span>{unreadCount} new</span>
                                                                </Link>
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
                                                <div className="p-6 flex flex-col items-stretch justify-center gap-2 shrink-0 border-l-2 border-[#E5E7EB] bg-[#F9FAFB]">
                                                    <Link
                                                        href={route('learner.course.learn', course.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-auto min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-gray-800 text-white font-bold py-3 px-5 rounded text-sm transition-transform active:scale-[0.98]"
                                                    >
                                                        <span>{getCTAText(enrollment)}</span>
                                                        <ArrowRightIcon className="w-4 h-4" />
                                                    </Link>
                                                    {enrollment.completed_at && (
                                                        <Link
                                                            href={route('learner.course.certificate', course.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 bg-white border-2 border-[#10B981] text-[#065F46] hover:bg-[#10B981] hover:text-white font-bold py-2.5 px-4 rounded text-xs transition-colors duration-200"
                                                        >
                                                            <span>🎓 View Certificate PDF</span>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Bottom Passing-Grade Strip */}
                                            <div className="bg-[#F3F4F6] border-t-2 border-[#E5E7EB] px-5 py-2.5 flex items-center justify-between gap-2 text-xs font-semibold text-[#111827]">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">ⓘ</span>
                                                    <span>Grade required to pass Final Assessment: 100%</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-40 bg-white border border-[#E5E7EB] h-2.5 rounded-full overflow-hidden"
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

                        {/* Card 3: Achievement Points & Training Rewards */}
                        {(() => {
                            const modulesCompletedCount = stats?.modules_completed || 0;
                            const certificatesEarnedCount = stats?.completed || completedEnrollments.length || 0;
                            const totalXp = (modulesCompletedCount * 50) + (certificatesEarnedCount * 200);
                            const xpRewardThreshold = 500;
                            const xpProgressPct = Math.min(100, Math.round((totalXp / xpRewardThreshold) * 100));

                            return (
                                <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">⚡</span>
                                            <h2 className="font-display font-extrabold text-lg text-[#111827]">
                                                Achievement Points
                                            </h2>
                                        </div>
                                        <span className="bg-[#111827] text-white text-xs font-black px-2.5 py-1 rounded">
                                            {totalXp} XP
                                        </span>
                                    </div>

                                    <p className="text-xs text-gray-600">
                                        +50 XP per chapter · +200 XP per certificate · Unlock CoPED course discount vouchers at 500 XP.
                                    </p>

                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                                            <span>Reward Progress</span>
                                            <span>{totalXp} / {xpRewardThreshold} XP</span>
                                        </div>
                                        <div
                                            className="w-full bg-[#F3F4F6] border border-[#E5E7EB] h-2.5 rounded-full overflow-hidden"
                                            role="progressbar"
                                            aria-valuenow={xpProgressPct}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        >
                                            <div
                                                className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                                                style={{ width: `${xpProgressPct}%` }}
                                            />
                                        </div>
                                    </div>

                                    {totalXp >= xpRewardThreshold ? (
                                        <div className="p-3 bg-[#ECFDF5] border border-[#10B981] rounded text-xs font-bold text-[#065F46]">
                                            🎉 Milestone Achieved: You have unlocked a CoPED course discount voucher! Contact program administration to redeem.
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-gray-500">
                                            Earn {xpRewardThreshold - totalXp} more XP to reach your first training discount voucher.
                                        </p>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </LearnerLayout>
    );
}