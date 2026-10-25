import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

const getLessonPill = (lesson) => {
    const url = (lesson.content_url || '').toLowerCase();
    const type = (lesson.content_type || '').toLowerCase();
    if (type === 'file' || url.endsWith('.pdf') || url.includes('.pdf?')) {
        return { label: 'PDF', bg: 'bg-[#FFF1F2]', text: 'text-[#BE123C]', border: 'border-[#FECDD3]' };
    }
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || url.endsWith('.mp4') || type === 'video') {
        return { label: 'VIDEO', bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]', border: 'border-[#93C5FD]' };
    }
    return { label: 'LINK', bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', border: 'border-[#FDE68A]' };
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
}) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(module.title || '');
    const [isSavingTitle, setIsSavingTitle] = useState(false);

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
        if (confirm(`Delete module "${module.title}"? Its lessons and mini-quiz go with it.`)) {
            router.delete(route('staff.courses.modules.destroy', [course.id, module.id]), {
                preserveScroll: true,
            });
        }
    };

    return (
        <div
            id={`module-${module.id}`}
            className="p-5 sm:p-6 bg-white rounded-md border-2 border-[#E5E7EB] hover:border-[#10B981] transition-all scroll-mt-24 space-y-4"
        >
            {/* Header Row: Index, Title / Quick Rename, Edit Link, Actions */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="shrink-0 w-9 h-9 rounded-md bg-[#10B981] text-white font-extrabold flex items-center justify-center text-sm">
                        {index + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                        {isEditingTitle && editMode ? (
                            <form onSubmit={handleSaveTitle} className="flex items-center gap-2 max-w-lg">
                                <input
                                    type="text"
                                    value={titleDraft}
                                    onChange={(e) => setTitleDraft(e.target.value)}
                                    autoFocus
                                    disabled={isSavingTitle}
                                    className="px-3 py-1.5 bg-[#F3F4F6] border-2 border-[#10B981] rounded text-sm font-bold text-[#111827] w-full focus:bg-white focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={isSavingTitle}
                                    title="Save title"
                                    className="px-2.5 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white font-extrabold text-xs rounded transition-colors"
                                >
                                    ✓
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelTitle}
                                    title="Cancel"
                                    className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-extrabold text-xs rounded transition-colors"
                                >
                                    ✕
                                </button>
                            </form>
                        ) : (
                            <div className="flex flex-wrap items-center gap-2">
                                <Link
                                    href={route('staff.courses.modules.edit', [course.id, module.id])}
                                    className="font-bold text-[#111827] text-base sm:text-lg hover:text-[#10B981] transition-colors truncate"
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
                                        title="Quick rename module title"
                                        className="text-xs px-2 py-0.5 rounded border border-[#E5E7EB] hover:border-gray-400 bg-[#F9FAFB] text-gray-600 font-semibold transition-colors"
                                    >
                                        ✏️ Rename
                                    </button>
                                )}
                            </div>
                        )}

                        {module.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{module.description}</p>
                        )}
                    </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href={route('staff.courses.modules.edit', [course.id, module.id])}
                        className="px-3 py-1.5 text-xs font-bold bg-[#F3F4F6] hover:bg-gray-200 text-[#111827] border border-[#E5E7EB] rounded-md transition-colors"
                    >
                        ⚙️ Edit Unit
                    </Link>

                    {editMode && (
                        <button
                            type="button"
                            onClick={destroy}
                            title={`Delete ${module.title}`}
                            aria-label={`Delete ${module.title}`}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Subtopics & Resources List */}
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold uppercase tracking-wider text-gray-500 text-[10px]">
                        Activities & Resources ({lessons.length} item{lessons.length === 1 ? '' : 's'})
                    </span>
                    {enrolledCount > 0 && (
                        <span className="text-[11px] font-bold text-gray-600">
                            {completionsCount} / {enrolledCount} learners completed
                        </span>
                    )}
                </div>

                {lessons.length > 0 ? (
                    <div className="space-y-1.5">
                        {lessons.map((lesson, lIdx) => {
                            const pill = getLessonPill(lesson);
                            return (
                                <div
                                    key={lesson.id}
                                    className="flex items-center justify-between gap-2 p-2 bg-white border border-[#E5E7EB] rounded text-xs"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${pill.bg} ${pill.text} ${pill.border} shrink-0`}>
                                            {pill.label}
                                        </span>
                                        <span className="font-bold text-[#111827] truncate">
                                            {lIdx + 1}. {lesson.title}
                                        </span>
                                    </div>
                                    <Link
                                        href={`${route('staff.courses.modules.edit', [course.id, module.id])}?tab=materials&subtab=subtopics`}
                                        className="text-[11px] font-bold text-gray-500 hover:text-[#10B981] shrink-0"
                                    >
                                        Edit →
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-gray-500 italic py-1">
                        No subtopic resources uploaded yet. Click below to add a video lecture or slide file.
                    </p>
                )}

                {/* Module Quiz Pill if present */}
                {quizCount > 0 && (
                    <div className="flex items-center justify-between gap-2 p-2 bg-[#F5F3FF] border border-[#DDD6FE] rounded text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border bg-purple-100 text-[#6D28D9] border-[#DDD6FE] shrink-0">
                                QUIZ
                            </span>
                            <span className="font-bold text-[#111827] truncate">
                                Optional Practice Quiz ({quizCount} question{quizCount === 1 ? '' : 's'})
                            </span>
                        </div>
                        <Link
                            href={`${route('staff.courses.modules.edit', [course.id, module.id])}?tab=quizzes`}
                            className="text-[11px] font-bold text-[#6D28D9] hover:underline shrink-0"
                        >
                            Manage →
                        </Link>
                    </div>
                )}
            </div>

            {/* Bottom Add Activity / Resource Button in Edit Mode */}
            {editMode && (
                <div className="pt-1 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => onAddActivity && onAddActivity(module)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-white hover:bg-emerald-50 text-[#10B981] border-2 border-dashed border-[#10B981] rounded-md transition-colors"
                    >
                        <span>+</span>
                        <span>Add Activity or Resource</span>
                    </button>

                    <Link
                        href={route('staff.courses.modules.edit', [course.id, module.id])}
                        className="text-xs font-bold text-gray-500 hover:text-[#111827] flex items-center gap-1"
                    >
                        <span>Full Studio Editor</span>
                        <span>→</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
