import { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import CourseLogoBadge, { LOGO_CONFIG } from '@/Components/flat/CourseLogoBadge';

export default function CourseRow({
    course,
    status = course.status === 'published' ? 'published' : 'draft',
    variant = 'table', // 'table' | 'dashboard'
    activeMenuCourseId = null,
    setActiveMenuCourseId = null,
    isCoordinator = false,
    instructors = [],
}) {
    const { unreadChatSummary } = usePage().props;
    const unreadCount = unreadChatSummary?.by_course?.[course.id] || 0;

    const isPublished = status === 'published';
    const isDraft = !isPublished;
    const modulesCount = Number(course.modules_count ?? 0);
    const enrollmentsCount = Number(course.enrollments_count ?? 0);
    const hasStudents = isPublished && enrollmentsCount > 0;
    const avg = Math.min(100, Math.max(0, Math.round(Number(course.avg_progress ?? 0))));

    const isSchoolMode = Boolean(
        course.course_mode === 'school' ||
            course.title?.includes('Tahun') ||
            course.title?.includes('KSSR') ||
            course.academic_year?.includes('KSSR')
    );

    // Local state for delete confirmation dialog
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Local state for assign instructor modal
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedInstructorId, setSelectedInstructorId] = useState(course.instructor_id || '');
    const [isAssigning, setIsAssigning] = useState(false);

    // Overflow menu toggle
    const [localMenuOpen, setLocalMenuOpen] = useState(false);
    const isMenuOpen = setActiveMenuCourseId
        ? activeMenuCourseId === course.id
        : localMenuOpen;

    const toggleMenu = (e) => {
        e.stopPropagation();
        if (setActiveMenuCourseId) {
            setActiveMenuCourseId(isMenuOpen ? null : course.id);
        } else {
            setLocalMenuOpen(!localMenuOpen);
        }
    };

    const closeMenu = () => {
        if (setActiveMenuCourseId) {
            setActiveMenuCourseId(null);
        } else {
            setLocalMenuOpen(false);
        }
    };

    // Close menu on Escape key
    useEffect(() => {
        if (!isMenuOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeMenu();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMenuOpen]);

    // Close menu on click outside when local menu is used
    useEffect(() => {
        if (setActiveMenuCourseId || !localMenuOpen) return;
        const handleClickOutside = (e) => {
            if (!e.target.closest('[data-dropdown-container]')) {
                setLocalMenuOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [localMenuOpen, setActiveMenuCourseId]);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('staff.courses.destroy', course.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setShowDeleteModal(false);
                closeMenu();
            },
        });
    };

    const handleAssign = (e) => {
        e.preventDefault();
        if (!selectedInstructorId) return;
        setIsAssigning(true);
        router.post(route('staff.courses.assign-instructor', course.id), {
            instructor_id: selectedInstructorId,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsAssigning(false);
                setShowAssignModal(false);
                closeMenu();
            },
        });
    };

    // Category config
    const config = LOGO_CONFIG[course.category_logo] || LOGO_CONFIG.charcoal || LOGO_CONFIG.general;

    // Price formatting
    const priceFormatted =
        course.billing_type === 'free' || Number(course.price) === 0
            ? 'Free'
            : course.billing_type === 'subscription'
                ? `RM${Number(course.price).toFixed(2)}/mo`
                : `RM${Number(course.price).toFixed(2)}`;

    // Format created date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Safe Delete Flat Modal Component
    const deleteModal = showDeleteModal && (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-title-${course.id}`}
        >
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 max-w-md w-full space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <h3
                        id={`delete-title-${course.id}`}
                        className="font-display text-lg font-extrabold text-[#111827] leading-snug"
                    >
                        Delete &ldquo;{course.title}&rdquo;?
                    </h3>
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(false)}
                        className="text-gray-400 hover:text-[#111827] font-bold text-lg leading-none"
                        aria-label="Close dialog"
                    >
                        &times;
                    </button>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                    This will permanently remove &ldquo;{course.title}&rdquo; and its curriculum modules. This action cannot be undone.
                </p>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(false)}
                        disabled={isDeleting}
                        className="border border-[#E2E8F0] hover:bg-[#F3F4F6] text-[#111827] font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                </div>
            </div>
        </div>
    );

    // Flat Assign Instructor Modal Component
    const assignModal = showAssignModal && (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`assign-title-${course.id}`}
        >
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 max-w-md w-full space-y-4 text-left">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-amber-500 text-white rounded">
                            Coordinator Action
                        </span>
                        <h3
                            id={`assign-title-${course.id}`}
                            className="font-display text-lg font-extrabold text-[#111827] leading-snug mt-1"
                        >
                            Assign Subject Instructor
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAssignModal(false)}
                        className="text-gray-400 hover:text-[#111827] font-bold text-lg leading-none"
                        aria-label="Close dialog"
                    >
                        &times;
                    </button>
                </div>

                <p className="text-xs text-gray-600">
                    Subject: <span className="font-bold text-[#111827]">&ldquo;{course.title}&rdquo;</span>
                </p>

                <form onSubmit={handleAssign} className="space-y-4">
                    <div>
                        <label htmlFor={`instructor-select-${course.id}`} className="block text-xs font-bold text-[#111827] mb-1">
                            Select Faculty Instructor
                        </label>
                        <select
                            id={`instructor-select-${course.id}`}
                            value={selectedInstructorId}
                            onChange={(e) => setSelectedInstructorId(e.target.value)}
                            required
                            className="block w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#111827] focus:border-[#111827] focus:outline-none"
                        >
                            <option value="">-- Choose Instructor --</option>
                            {instructors.map((ins) => (
                                <option key={ins.id} value={ins.id}>
                                    {ins.name} ({ins.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                        <button
                            type="button"
                            onClick={() => setShowAssignModal(false)}
                            disabled={isAssigning}
                            className="border border-[#E2E8F0] hover:bg-[#F3F4F6] text-[#111827] font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isAssigning || !selectedInstructorId}
                            className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // Overflow Dropdown Menu Content
    const overflowDropdown = isMenuOpen && (
        <div className="absolute right-0 top-full mt-1.5 bg-white border border-[#E2E8F0] rounded-xl py-1 z-50 min-w-[180px] divide-y divide-gray-100 text-left">
            <div className="py-1">
                <Link
                    href={route('staff.courses.show', course.id)}
                    className="block px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-[#F3F4F6] transition-colors"
                    onClick={closeMenu}
                >
                    Preview as Learner
                </Link>
                <Link
                    href={route('staff.courses.assessments.index', course.id)}
                    className="block px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-[#F3F4F6] transition-colors"
                    onClick={closeMenu}
                >
                    Manage Final Quiz
                </Link>
                {isCoordinator && (
                    <button
                        type="button"
                        onClick={() => {
                            closeMenu();
                            setShowAssignModal(true);
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                        Assign Instructor
                    </button>
                )}
            </div>
            <div className="py-1">
                <button
                    type="button"
                    onClick={() => {
                        closeMenu();
                        setShowDeleteModal(true);
                    }}
                    className="w-full text-left px-3.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                    Delete Course
                </button>
            </div>
        </div>
    );

    // ==========================================
    // VARIANT: TABLE (for Courses/Index.jsx)
    // ==========================================
    if (variant === 'table') {
        return (
            <>
                <tr
                    onClick={(e) => {
                        if (e.target.closest('button, a, select, input, [data-dropdown-container]')) return;
                        router.visit(route('staff.courses.edit', course.id));
                    }}
                    className="hover:bg-[#F9FAFB] transition-colors border-b border-[#E2E8F0] cursor-pointer"
                >
                    {/* 1. Course Details */}
                    <td className="px-5 py-4 min-w-0 max-w-sm">
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('staff.courses.edit', course.id)}
                                className="font-display font-bold text-sm sm:text-base text-[#111827] hover:text-[#2563EB] transition-colors block truncate"
                                title={course.title}
                            >
                                {course.title}
                            </Link>
                            {unreadCount > 0 && (
                                <Link
                                    href={route('staff.courses.edit', course.id) + '?tab=chat'}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-[#D1FAE5] border border-[#10B981] text-[#065F46] hover:bg-[#10B981] hover:text-white transition-colors text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shrink-0"
                                    title={`${unreadCount} unread message(s)`}
                                >
                                    <span>💬</span>
                                    <span>{unreadCount} new</span>
                                </Link>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center flex-wrap gap-1.5">
                            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-[#F3F4F6] text-gray-700 border border-[#D1D5DB]">
                                {config.label}
                            </span>
                            <span>·</span>
                            <span>{course.academic_year || '2026/2027'}</span>
                            <span>·</span>
                            <span>{priceFormatted}</span>
                            <span>·</span>
                            <span>{modulesCount} {modulesCount === 1 ? 'topic' : 'topics'}</span>
                            {course.instructor?.name && (
                                <>
                                    <span>·</span>
                                    <span className="font-medium text-gray-700">
                                        Lecturer: {course.instructor.name}
                                    </span>
                                </>
                            )}
                        </div>
                    </td>

                    {/* 2. Status Badge */}
                    <td className="px-5 py-4 whitespace-nowrap">
                        {isPublished ? (
                            <span className="bg-[#D1FAE5] border border-[#10B981] text-[#065F46] text-[11px] font-bold px-2 py-0.5 rounded-md">
                                Published
                            </span>
                        ) : (
                            <span className="bg-[#FEF3C7] border border-[#F59E0B] text-[#92400E] text-[11px] font-bold px-2 py-0.5 rounded-md">
                                Draft
                            </span>
                        )}
                    </td>

                    {/* 3. Students */}
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                        {isPublished ? enrollmentsCount : '-'}
                    </td>

                    {/* 4. Avg. Progress */}
                    <td className="px-5 py-4 whitespace-nowrap">
                        {hasStudents ? (
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-20 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden"
                                    role="progressbar"
                                    aria-valuenow={avg}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                >
                                    <div
                                        className="h-full bg-[#10B981] rounded-full transition-all"
                                        style={{ width: `${avg}%` }}
                                    />
                                </div>
                                <span className="text-xs font-bold text-[#111827]">{avg}%</span>
                            </div>
                        ) : (
                            <span className="text-sm text-gray-400">-</span>
                        )}
                    </td>

                    {/* 5. Created */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-600">
                        {formatDate(course.created_at)}
                    </td>

                    {/* 6. Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5" data-dropdown-container>
                            {isDraft ? (
                                <>
                                    {modulesCount === 0 ? (
                                        <button
                                            type="button"
                                            disabled
                                            title="Add at least one topic first"
                                            className="bg-[#F3F4F6] border border-[#D1D5DB] text-gray-400 cursor-not-allowed px-3 py-1.5 rounded-lg text-xs font-semibold"
                                        >
                                            Publish
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => router.post(route('staff.courses.deploy', course.id), {}, { preserveScroll: true })}
                                            className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-transform active:scale-[0.98]"
                                        >
                                            Publish
                                        </button>
                                    )}

                                    <Link
                                        href={route('staff.courses.edit', course.id)}
                                        className="border border-[#CBD5E1] bg-white text-[#111827] hover:bg-[#F3F4F6] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        Manage
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href={route('staff.courses.edit', course.id)}
                                    className="border border-[#111827] bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-transform active:scale-[0.98]"
                                >
                                    Open Studio →
                                </Link>
                            )}

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={toggleMenu}
                                    aria-label={`More actions for ${course.title}`}
                                    aria-expanded={isMenuOpen}
                                    className={`w-8 h-8 rounded-lg border border-[#CBD5E1] hover:bg-[#F3F4F6] flex items-center justify-center font-bold text-sm transition-colors ${
                                        isMenuOpen ? 'bg-gray-200 text-[#111827]' : 'text-gray-700'
                                    }`}
                                >
                                    ⋯
                                </button>
                                {overflowDropdown}
                            </div>
                        </div>
                    </td>
                </tr>
                {deleteModal}
                {assignModal}
            </>
        );
    }

    // ==========================================
    // VARIANT: DASHBOARD (Horizontal edX Course Card)
    // ==========================================
    return (
        <>
            <div
                onClick={(e) => {
                    if (e.target.closest('button, a, select, input, [data-dropdown-container]')) return;
                    router.visit(route('staff.courses.edit', course.id));
                }}
                className={`bg-white border border-[#E2E8F0] rounded-xl hover:border-[#111827] transition-colors cursor-pointer group ${
                    isMenuOpen ? 'relative z-30' : 'relative z-0'
                }`}
            >
                {/* Main Card Body */}
                <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    {/* Left: Badge + Metadata + Title */}
                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                        <CourseLogoBadge
                            category={course.category_logo}
                            size="badge"
                            className="shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                            {/* Badges strip */}
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                {isPublished ? (
                                    <span className="bg-[#D1FAE5] border border-[#10B981] text-[#065F46] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                                        Published
                                    </span>
                                ) : (
                                    <span className="bg-[#FEF3C7] border border-[#F59E0B] text-[#92400E] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                                        Draft
                                    </span>
                                )}

                                {isSchoolMode ? (
                                    <span className="bg-sky-50 border border-sky-300 text-sky-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                                        School · KSSR
                                    </span>
                                ) : (
                                    <span className="bg-gray-100 border border-gray-300 text-gray-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                                        Certification
                                    </span>
                                )}

                                <span className="text-xs text-gray-500 font-medium">
                                    {course.academic_year || '2026 / 2027'}
                                </span>

                                {unreadCount > 0 && (
                                    <Link
                                        href={route('staff.courses.edit', course.id) + '?tab=chat'}
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-[#D1FAE5] border border-[#10B981] text-[#065F46] hover:bg-[#10B981] hover:text-white transition-colors text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 shrink-0"
                                        title={`${unreadCount} unread message(s)`}
                                    >
                                        <span>💬</span>
                                        <span>{unreadCount} new</span>
                                    </Link>
                                )}
                            </div>

                            {/* Title */}
                            <Link
                                href={route('staff.courses.edit', course.id)}
                                className="font-display text-lg sm:text-xl font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors block truncate"
                                title={course.title}
                            >
                                {course.title}
                            </Link>

                            {/* Meta details */}
                            <div className="text-xs text-gray-600 mt-1 flex items-center flex-wrap gap-1.5">
                                <span>{modulesCount} {modulesCount === 1 ? 'topic' : 'topics'}</span>
                                <span>·</span>
                                <span>{enrollmentsCount} {enrollmentsCount === 1 ? 'enrolled learner' : 'enrolled learners'}</span>
                                <span>·</span>
                                <span>{priceFormatted}</span>
                                {isCoordinator && course.instructor?.name && (
                                    <>
                                        <span>·</span>
                                        <span className="font-semibold text-gray-800">
                                            Lecturer: {course.instructor.name}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Action Block */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center" data-dropdown-container>
                        {isDraft && modulesCount > 0 && (
                            <button
                                type="button"
                                onClick={() => router.post(route('staff.courses.deploy', course.id), {}, { preserveScroll: true })}
                                className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-transform active:scale-[0.98]"
                            >
                                Publish
                            </button>
                        )}

                        <Link
                            href={route('staff.courses.edit', course.id)}
                            className="inline-flex items-center gap-1.5 bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition-transform active:scale-[0.98]"
                        >
                            <span>Open Studio</span>
                            <span className="text-sm">→</span>
                        </Link>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={toggleMenu}
                                aria-label={`More actions for ${course.title}`}
                                aria-expanded={isMenuOpen}
                                className={`w-8 h-8 rounded-lg border border-[#E2E8F0] hover:bg-[#F3F4F6] flex items-center justify-center font-bold text-sm transition-colors ${
                                    isMenuOpen ? 'bg-gray-200 text-[#111827]' : 'text-gray-700'
                                }`}
                            >
                                ⋯
                            </button>
                            {overflowDropdown}
                        </div>
                    </div>
                </div>

                {/* Bottom Telemetry Strip */}
                <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-5 py-2.5 flex items-center justify-between gap-3 text-xs font-semibold text-[#111827] rounded-b-xl">
                    <div className="flex items-center gap-2 text-gray-600">
                        <span>{hasStudents ? 'Cohort Average Progress:' : 'No learners enrolled yet'}</span>
                        {isCoordinator && !course.instructor_id && (
                            <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                                Unassigned Lecturer
                            </span>
                        )}
                    </div>
                    {hasStudents ? (
                        <div className="flex items-center gap-3">
                            <div
                                className="w-32 sm:w-44 bg-white border border-[#E2E8F0] h-2 rounded-full overflow-hidden"
                                role="progressbar"
                                aria-valuenow={avg}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`Average progress for ${course.title}`}
                            >
                                <div
                                    className="h-full bg-[#10B981] rounded-full transition-all"
                                    style={{ width: `${avg}%` }}
                                />
                            </div>
                            <span className="font-bold text-[#111827] min-w-[3ch] text-right">
                                {avg}%
                            </span>
                        </div>
                    ) : (
                        <span className="text-gray-400 font-normal text-xs">Self-paced cohort</span>
                    )}
                </div>
            </div>
            {deleteModal}
            {assignModal}
        </>
    );
}
