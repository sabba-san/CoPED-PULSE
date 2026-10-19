import { Link, router } from '@inertiajs/react';

export default function ModuleCard({ course, module, index, quizCount = 0, enrolledCount = 0 }) {
    const destroy = () => {
        if (confirm(`Delete module "${module.title}"? Its lessons and mini-quiz go with it.`)) {
            router.delete(route('staff.courses.modules.destroy', [course.id, module.id]), {
                preserveScroll: true,
            });
        }
    };

    const completionsCount = module.completions_count ?? 0;

    return (
        <div className="flex items-center gap-2 p-5 sm:p-6 bg-white rounded-md border-2 border-[#E5E7EB] hover:border-[#10B981] hover:scale-[1.01] transition-all">
            <Link
                href={route('staff.courses.modules.edit', [course.id, module.id])}
                className="flex items-start gap-4 flex-1 min-w-0"
            >
                <span className="shrink-0 w-9 h-9 rounded-md bg-[#10B981] text-white font-extrabold flex items-center justify-center">
                    {index + 1}
                </span>
                <span className="flex-1 min-w-0">
                    <span className="block font-bold text-[#111827] text-base sm:text-lg truncate">
                        {module.title}
                    </span>
                    {module.description && (
                        <span className="block text-sm text-gray-600 mt-1 line-clamp-2">{module.description}</span>
                    )}
                    <span className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold">
                        {quizCount > 0 ? (
                            <span className="px-2.5 py-1 rounded-md bg-[#F3F4F6] text-[#111827] flex items-center gap-1.5">
                                <span>{quizCount} mini-quiz {quizCount === 1 ? 'question' : 'questions'}</span>
                                <span className="text-[9px] uppercase font-bold text-gray-500 bg-white border border-[#E5E7EB] px-1 py-0.5 rounded">
                                    Optional
                                </span>
                            </span>
                        ) : (
                            <span className="px-2.5 py-1 rounded-md bg-[#F9FAFB] border border-[#E5E7EB] text-gray-500 flex items-center gap-1.5">
                                <span>No quiz</span>
                                <span className="text-[9px] uppercase font-bold text-gray-400 bg-white border border-[#E5E7EB] px-1 py-0.5 rounded">
                                    Optional
                                </span>
                            </span>
                        )}
                        {module.media_url ? (
                            <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
                                {module.content_type === 'file' ? 'Document attached' : 'Link attached'}
                            </span>
                        ) : (
                            <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800">
                                No media yet
                            </span>
                        )}
                        {enrolledCount > 0 && (
                            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                                {completionsCount} / {enrolledCount} completed
                            </span>
                        )}
                    </span>
                </span>
            </Link>
            <button
                type="button"
                onClick={destroy}
                title={`Delete ${module.title}`}
                aria-label={`Delete ${module.title}`}
                className="shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        </div>
    );
}
