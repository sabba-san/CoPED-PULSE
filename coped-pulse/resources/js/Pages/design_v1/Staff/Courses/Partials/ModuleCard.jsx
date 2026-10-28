import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

const getLessonPill = (lesson) => {
    const url = (lesson.content_url || '').toLowerCase();
    const type = (lesson.content_type || '').toLowerCase();
    if (type === 'file' || url.endsWith('.pdf') || url.includes('.pdf?')) {
        return { label: 'PDF Document', shortLabel: 'PDF', bg: 'bg-[#FFF1F2]', text: 'text-[#BE123C]', border: 'border-[#FECDD3]' };
    }
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || url.endsWith('.mp4') || type === 'video') {
        return { label: 'Video Lecture', shortLabel: 'VIDEO', bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]', border: 'border-[#93C5FD]' };
    }
    return { label: 'External Resource', shortLabel: 'URL', bg: 'bg-[#F3F4F6]', text: 'text-gray-700', border: 'border-[#D1D5DB]' };
};

export default function ModuleCard({
    course,
    module,
    index,
    quizCount = 0,
    enrolledCount = 0,
    editMode = false,
    onAddActivity = null,
    onQuickRename = null,
    onPreviewMaterial = null,
}) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(module.title || '');
    const [isSavingTitle, setIsSavingTitle] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const lessons = module.lessons || [];
    const completionsCount = module.completions_count ?? 0;

    const handleSaveTitle = (e) => {
        e?.preventDefault();
        const trimmed = titleDraft.trim();
        if (!trimmed || trimmed === module.title) {
            setIsEditingTitle(false);
            return;
        }

        if (onQuickRename) {
            onQuickRename(module, trimmed);
            setIsEditingTitle(false);
            return;
        }

        setIsSavingTitle(true);
        router.put(
            route('staff.courses.modules.update', [course.id, module.id]),
            {
                title: trimmed,
                description: module.description || '',
                duration_minutes: module.duration != null ? Math.round(module.duration / 60) : null,
                content_type: module.content_type || 'link',
                media_url: module.media_url || null,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setIsEditingTitle(false),
                onFinish: () => setIsSavingTitle(false),
            }
        );
    };

    const handleCancelTitle = () => {
        setTitleDraft(module.title || '');
        setIsEditingTitle(false);
    };

    const destroy = () => {
        if (confirm(`Delete topic "${module.title}"? Its activities and practice quiz will also be removed.`)) {
            router.delete(route('staff.courses.modules.destroy', [course.id, module.id]), {
                preserveScroll: true,
            });
        }
    };

    return (
        <div
            id={`module-${module.id}`}
            className="bg-[#F8FAFC] rounded border border-[#CBD5E1] scroll-mt-24 overflow-hidden"
        >
            {/* Moodle 4 Collapsible Topic Header Bar */}
            <div className="px-4 sm:px-5 py-3.5 bg-[#EDF1F7] border-b border-[#CBD5E1] flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                        type="button"
                        onClick={() => setCollapsed(!collapsed)}
                        aria-label={collapsed ? 'Expand topic' : 'Collapse topic'}
                        className="mt-0.5 w-6 h-6 rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-gray-600 flex items-center justify-center shrink-0 text-xs"
                    >
                        {collapsed ? '▸' : '▾'}
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                            <span>Topic {index + 1}</span>
                            {enrolledCount > 0 && (
                                <>
                                    <span>·</span>
                                    <span>{completionsCount} of {enrolledCount} completed</span>
                                </>
                            )}
                        </div>

                        {isEditingTitle && editMode ? (
                            <form onSubmit={handleSaveTitle} className="flex items-center gap-2 max-w-lg mt-1">
                                <input
                                    type="text"
                                    value={titleDraft}
                                    onChange={(e) => setTitleDraft(e.target.value)}
                                    autoFocus
                                    disabled={isSavingTitle}
                                    className="px-3 py-1 bg-white border border-[#111827] rounded text-sm font-semibold text-[#111827] w-full focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={isSavingTitle}
                                    className="px-2.5 py-1 bg-[#111827] text-white font-semibold text-xs rounded"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelTitle}
                                    className="px-2.5 py-1 bg-white border border-[#D1D5DB] text-gray-700 font-semibold text-xs rounded"
                                >
                                    Cancel
                                </button>
                            </form>
                        ) : (
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                <Link
                                    href={route('staff.courses.modules.edit', [course.id, module.id])}
                                    className="font-display font-bold text-[#111827] text-base hover:text-[#2563EB] transition-colors truncate"
                                >
                                    {module.title}
                                </Link>
                                {editMode && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTitleDraft(module.title || '');
                                            setIsEditingTitle(true);
                                        }}
                                        title="Rename topic title"
                                        className="text-xs px-2 py-0.5 rounded border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-gray-600 font-medium transition-colors"
                                    >
                                        Rename
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {module.media_url && onPreviewMaterial && (
                        <button
                            type="button"
                            onClick={() => onPreviewMaterial({
                                title: module.title,
                                url: module.media_url,
                                contentType: module.content_type,
                            })}
                            className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] rounded transition-colors"
                        >
                            Preview
                        </button>
                    )}

                    {editMode && (
                        <Link
                            href={route('staff.courses.modules.edit', [course.id, module.id])}
                            className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-[#F3F4F6] text-[#111827] border border-[#D1D5DB] rounded transition-colors"
                        >
                            Edit topic
                        </Link>
                    )}

                    {editMode && (
                        <button
                            type="button"
                            onClick={destroy}
                            title={`Delete ${module.title}`}
                            aria-label={`Delete ${module.title}`}
                            className="px-2 py-1 text-xs font-semibold text-red-600 bg-white border border-[#D1D5DB] hover:bg-red-50 rounded transition-colors"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>

            {/* Collapsible Topic Body */}
            {!collapsed && (
                <div className="p-4 sm:p-5 space-y-3">
                    {module.description && (
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pb-1">
                            {module.description}
                        </p>
                    )}

                    {/* Moodle Activity & Resource List */}
                    <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded bg-white">
                        {lessons.length > 0 ? (
                            lessons.map((lesson, lIdx) => {
                                const pill = getLessonPill(lesson);
                                return (
                                    <div
                                        key={lesson.id}
                                        className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-[#F9FAFB] text-xs transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${pill.bg} ${pill.text} ${pill.border} shrink-0`}>
                                                {pill.shortLabel}
                                            </span>
                                            <span className="font-semibold text-[#111827] truncate">
                                                {lIdx + 1}. {lesson.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {(lesson.content_url || lesson.file) && onPreviewMaterial && (
                                                <button
                                                    type="button"
                                                    onClick={() => onPreviewMaterial({
                                                        title: lesson.title,
                                                        url: lesson.content_url,
                                                        contentType: lesson.content_type,
                                                    })}
                                                    className="px-2 py-0.5 text-xs font-semibold text-gray-700 bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] rounded transition-colors"
                                                >
                                                    Preview
                                                </button>
                                            )}
                                            {editMode && (
                                                <Link
                                                    href={`${route('staff.courses.modules.edit', [course.id, module.id])}?tab=materials&subtab=subtopics`}
                                                    className="text-xs font-semibold text-[#2563EB] hover:underline"
                                                >
                                                    Settings
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-3.5 py-3 text-xs text-gray-500">
                                No learning activities or resources added to this topic yet.
                            </div>
                        )}

                        {quizCount > 0 && (
                            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-[#F8FAFC] text-xs">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border bg-purple-50 text-[#6D28D9] border-[#DDD6FE] shrink-0">
                                        QUIZ
                                    </span>
                                    <span className="font-semibold text-[#111827] truncate">
                                        Topic Practice Quiz ({quizCount} question{quizCount === 1 ? '' : 's'})
                                    </span>
                                </div>
                                {editMode && (
                                    <Link
                                        href={`${route('staff.courses.modules.edit', [course.id, module.id])}?tab=quizzes`}
                                        className="text-xs font-semibold text-[#2563EB] hover:underline shrink-0"
                                    >
                                        Edit quiz
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Moodle "+ Add an activity or resource" Footer */}
                    {editMode && (
                        <div className="pt-1 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => onAddActivity && onAddActivity(module)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-white hover:bg-[#F3F4F6] text-[#2563EB] border border-dashed border-[#93C5FD] rounded transition-colors"
                            >
                                <span>+ Add an activity or resource</span>
                            </button>

                            <Link
                                href={route('staff.courses.modules.edit', [course.id, module.id])}
                                className="text-xs font-semibold text-gray-600 hover:text-[#111827]"
                            >
                                Open topic settings →
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
