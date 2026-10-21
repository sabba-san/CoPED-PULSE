import { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { LOGO_CONFIG } from '@/Components/flat/CourseLogoBadge';

export default function CourseRow({
    course,
    status = course.status === 'published' ? 'published' : 'draft',
    variant = 'table', // 'table' | 'dashboard'
    activeMenuCourseId = null,
    setActiveMenuCourseId = null,
}) {
    const isPublished = status === 'published';
    const isDraft = !isPublished;
    const modulesCount = Number(course.modules_count ?? 0);
    const enrollmentsCount = Number(course.enrollments_count ?? 0);
    const hasStudents = isPublished && enrollmentsCount > 0;
    const avg = Math.min(100, Math.max(0, Math.round(Number(course.avg_progress ?? 0))));

    // Local state for delete confirmation dialog
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
            <div className="bg-white border-2 border-[#111827] rounded-lg p-6 max-w-md w-full space-y-4">
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

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E5E7EB]">
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(false)}
                        disabled={isDeleting}
                        className="border-2 border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#111827] font-bold text-xs px-4 py-2 rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded transition-colors disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                </div>
            </div>
        </div>
    );

    // Overflow Dropdown Menu Content
    const overflowDropdown = isMenuOpen && (
        <div className="absolute right-0 top-full mt-1.5 bg-white border-2 border-[#E5E7EB] rounded-md py-1 z-30 min-w-[180px] divide-y divide-gray-100 text-left">
            <div className="py-0.5">
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
            </div>
            <div className="py-0.5">
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
                <tr className="hover:bg-[#F9FAFB] transition-colors border-b-2 border-[#E5E7EB]">
                    {/* 1. Course Details */}
                    <td className="px-5 py-4 min-w-0 max-w-sm">
                        <Link
                            href={route('staff.courses.edit', course.id)}
                            className="font-display font-bold text-base text-[#111827] hover:text-[#3B82F6] transition-colors block truncate"
                            title={course.title}
                        >
                            {course.title}
                        </Link>
                        <div className="text-xs text-gray-500 mt-1 flex items-center flex-wrap gap-1.5">
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}>
                                {config.label}
                            </span>
                            <span>·</span>
                            <span>{course.academic_year || '2026/2027'}</span>
                            <span>·</span>
                            <span>{priceFormatted}</span>
                            <span>·</span>
                            <span>{modulesCount} {modulesCount === 1 ? 'module' : 'modules'}</span>
                            {course.cert_title && (
                                <span title={`Leads to: ${course.cert_title}`} className="cursor-help">🎓</span>
                            )}
                        </div>
                    </td>

                    {/* 2. Status Badge */}
                    <td className="px-5 py-4 whitespace-nowrap">
                        {isPublished ? (
                            <span className="bg-[#D1FAE5] border border-[#10B981] text-[#065F46] text-[11px] font-bold uppercase px-2 py-0.5 rounded">
                                Published
                            </span>
                        ) : (
                            <span className="bg-[#FEF3C7] border border-[#F59E0B] text-[#92400E] text-[11px] font-bold uppercase px-2 py-0.5 rounded">
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
                                    className="w-20 h-1.5 bg-[#E5E7EB] rounded overflow-hidden"
                                    role="progressbar"
                                    aria-valuenow={avg}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                >
                                    <div
                                        className="h-full bg-[#10B981] rounded transition-all"
                                        style={{ width: `${avg}%` }}
                                    />
                                </div>
                                <span className="text-xs font-bold text-[#111827]">{avg}%</span>
                            </div>
                        ) : (
                            <span className="text-sm font-semibold text-gray-400">-</span>
                        )}
                    </td>

                    {/* 5. Created */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-medium text-gray-600">
                        {formatDate(course.created_at)}
                    </td>

                    {/* 6. Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5" data-dropdown-container>
                            {isDraft ? (
                                <>
                                    {/* Primary Action: Solid Deploy Live */}
                                    {modulesCount === 0 ? (
                                        <button
                                            type="button"
                                            disabled
                                            title="Add content to your curriculum first"
                                            aria-label="Deploy Live - Add content to your curriculum first"
                                            className="bg-[#F3F4F6] border-2 border-[#E5E7EB] text-gray-400 cursor-not-allowed px-3 py-1.5 rounded text-xs font-bold"
                                        >
                                            Deploy Live
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => router.post(route('staff.courses.deploy', course.id), {}, { preserveScroll: true })}
                                            className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded transition-colors"
                                        >
                                            Deploy Live
                                        </button>
                                    )}

                                    {/* Secondary Action: Outline Edit */}
                                    <Link
                                        href={route('staff.courses.edit', course.id)}
                                        className="border-2 border-[#111827] text-[#111827] hover:bg-[#F3F4F6] px-3 py-1.5 rounded text-xs font-bold transition-colors"
                                    >
                                        Edit
                                    </Link>
                                </>
                            ) : (
                                /* Published Primary: Solid Dark Edit */
                                <Link
                                    href={route('staff.courses.edit', course.id)}
                                    className="bg-[#111827] hover:bg-[#1F2937] text-white font-bold text-xs px-3.5 py-1.5 rounded transition-colors"
                                >
                                    Edit
                                </Link>
                            )}

                            {/* Accessible Overflow Menu Button */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={toggleMenu}
                                    aria-label={`More actions for ${course.title}`}
                                    aria-expanded={isMenuOpen}
                                    className={`w-8 h-8 rounded border-2 border-[#E5E7EB] hover:bg-[#F3F4F6] flex items-center justify-center font-bold text-sm transition-colors ${
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
            </>
        );
    }

    // ==========================================
    // VARIANT: DASHBOARD (for Staff/Dashboard.jsx)
    // ==========================================
    return (
        <>
            <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-3.5 sm:p-4 hover:border-gray-400 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Course Identity */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Link
                                href={route('staff.courses.edit', course.id)}
                                className="font-display font-bold text-base text-[#111827] hover:text-[#3B82F6] transition-colors truncate max-w-[220px] sm:max-w-[320px]"
                                title={course.title}
                            >
                                {course.title}
                            </Link>
                            {isPublished ? (
                                <span className="bg-[#D1FAE5] border border-[#10B981] text-[#065F46] text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0">
                                    Published
                                </span>
                            ) : (
                                <span className="bg-[#FEF3C7] border border-[#F59E0B] text-[#92400E] text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0">
                                    Draft
                                </span>
                            )}
                        </div>

                        <div className="text-xs text-gray-500 mt-1 flex items-center flex-wrap gap-1.5">
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}>
                                {config.label}
                            </span>
                            <span>·</span>
                            <span>{course.academic_year || '2026/2027'}</span>
                            <span>·</span>
                            <span>{priceFormatted}</span>
                            <span>·</span>
                            <span>{modulesCount} {modulesCount === 1 ? 'module' : 'modules'}</span>
                            {course.cert_title && (
                                <span title={`Leads to: ${course.cert_title}`} className="cursor-help">🎓</span>
                            )}
                        </div>
                    </div>

                    {/* Right: Enrolled/Progress Stats + Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E7EB]">
                        {/* Stats */}
                        <div className="text-right shrink-0 min-w-[110px]">
                            {isPublished ? (
                                hasStudents ? (
                                    <>
                                        <p className="text-xs font-semibold text-gray-700">
                                            {enrollmentsCount} {enrollmentsCount === 1 ? 'student' : 'students'}
                                        </p>
                                        <div className="flex items-center justify-end gap-2 mt-1">
                                            <div
                                                className="w-16 sm:w-20 bg-[#E5E7EB] h-1.5 rounded overflow-hidden"
                                                role="progressbar"
                                                aria-valuenow={avg}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                            >
                                                <div
                                                    className="h-full bg-[#10B981] rounded transition-all"
                                                    style={{ width: `${avg}%` }}
                                                />
                                            </div>
                                            <span className="text-[11px] font-bold text-[#111827]">{avg}%</span>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-xs font-semibold text-gray-400">-</p>
                                )
                            ) : (
                                <p className="text-xs font-semibold text-gray-400">-</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0" data-dropdown-container>
                            {isDraft ? (
                                <>
                                    {modulesCount === 0 ? (
                                        <button
                                            type="button"
                                            disabled
                                            title="Add content to your curriculum first"
                                            aria-label="Deploy Live - Add content to your curriculum first"
                                            className="bg-[#F3F4F6] border-2 border-[#E5E7EB] text-gray-400 cursor-not-allowed px-3 py-1.5 rounded text-xs font-bold"
                                        >
                                            Deploy Live
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => router.post(route('staff.courses.deploy', course.id), {}, { preserveScroll: true })}
                                            className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded transition-colors"
                                        >
                                            Deploy Live
                                        </button>
                                    )}

                                    <Link
                                        href={route('staff.courses.edit', course.id)}
                                        className="border-2 border-[#111827] text-[#111827] hover:bg-[#F3F4F6] px-3 py-1.5 rounded text-xs font-bold transition-colors"
                                    >
                                        Edit
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href={route('staff.courses.edit', course.id)}
                                    className="bg-[#111827] hover:bg-[#1F2937] text-white font-bold text-xs px-3.5 py-1.5 rounded transition-colors"
                                >
                                    Edit
                                </Link>
                            )}

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={toggleMenu}
                                    aria-label={`More actions for ${course.title}`}
                                    aria-expanded={isMenuOpen}
                                    className={`w-8 h-8 rounded border-2 border-[#E5E7EB] hover:bg-[#F3F4F6] flex items-center justify-center font-bold text-sm transition-colors ${
                                        isMenuOpen ? 'bg-gray-200 text-[#111827]' : 'text-gray-700'
                                    }`}
                                >
                                    ⋯
                                </button>
                                {overflowDropdown}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {deleteModal}
        </>
    );
}
