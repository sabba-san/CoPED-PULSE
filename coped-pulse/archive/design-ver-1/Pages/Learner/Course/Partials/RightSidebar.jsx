import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const fileNameFromUrl = (url) => {
    try {
        const raw = decodeURIComponent(String(url).split('?')[0].split('/').pop() || '');
        return raw.replace(/^\d+_/, '') || raw || 'attachment';
    } catch {
        return 'attachment';
    }
};

const extOf = (url) => (String(url).split('?')[0].split('.').pop() || '').toLowerCase();

/**
 * Right sidebar for the learning view: Notes (per-module, manual save,
 * no reload) and Files (every instructor attachment in this course).
 * Keyed by module id from the parent so the editor resets per module.
 */
export default function RightSidebar({ course, module, modules = [], initialNote = '', savedAt = null, tab: controlledTab, onTabChange }) {
    const [innerTab, setInnerTab] = useState('notes');
    const tab = controlledTab ?? innerTab;
    const setTab = onTabChange ?? setInnerTab;
    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        content: initialNote,
    });

    const save = (e) => {
        e.preventDefault();
        post(route('learner.course.module.note.store', [course.id, module.id]), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const clear = () => {
        if (!data.content && !initialNote) return;
        if (confirm('Delete this note?')) {
            router.delete(route('learner.course.module.note.destroy', [course.id, module.id]), {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setData('content', ''),
            });
        }
    };

    const files = [
        ...modules.map((m, i) => m.media_url && {
            key: `m-${m.id}`,
            url: m.media_url,
            name: fileNameFromUrl(m.media_url),
            sub: `Module ${i + 1} • ${m.title}`,
            current: m.id === module.id,
        }).filter(Boolean),
        ...modules.flatMap((m) => (m.lessons || [])
            .filter((l) => l.content_url)
            .map((l) => ({
                key: `l-${l.id}`,
                url: l.content_url,
                name: fileNameFromUrl(l.content_url),
                sub: `${m.title} • ${l.title}`,
                current: m.id === module.id,
            }))),
    ];

    return (
        <aside id="study-sidebar" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit xl:sticky xl:top-20" aria-label="Study sidebar">
            <div className="grid grid-cols-2 p-2 gap-1 bg-gray-50/70" role="tablist">
                {['notes', 'files'].map((t) => (
                    <button
                        key={t}
                        role="tab"
                        aria-selected={tab === t}
                        onClick={() => setTab(t)}
                        className={`py-2 rounded-xl text-sm font-bold capitalize transition-colors ${
                            tab === t ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {t}
                        {t === 'files' && files.length > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-indigo-100 text-indigo-700 text-[11px]">
                                {files.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {tab === 'notes' ? (
                <form onSubmit={save} className="p-4 space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Notes • {module.title}
                    </p>
                    <textarea
                        id="module-note-textarea"
                        rows={8}
                        value={data.content}
                        onChange={(e) => setData('content', e.target.value)}
                        placeholder="Type your personal takeaways for this module..."
                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-y focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    {errors.content && <p className="text-red-500 text-xs font-medium">{errors.content}</p>}
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-gray-400" aria-live="polite">
                            {wasSuccessful ? '✓ Saved' : savedAt ? `Saved ${new Date(savedAt).toLocaleString()}` : 'Not saved yet'}
                        </span>
                        <span className="flex gap-2">
                            {(data.content || initialNote) && (
                                <button
                                    type="button"
                                    onClick={clear}
                                    className="px-3 py-2 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    Delete
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Note'}
                            </button>
                        </span>
                    </div>
                </form>
            ) : (
                <div className="p-4 space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                        Instructor Resources
                    </p>
                    {files.length > 0 ? (
                        files.map((f) => {
                            const ext = extOf(f.url);
                            return (
                                <a
                                    key={f.key}
                                    href={f.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                                        f.current
                                            ? 'border-indigo-200 bg-indigo-50/60 hover:bg-indigo-50'
                                            : 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40'
                                    }`}
                                >
                                    <span className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-[10px] font-black flex items-center justify-center uppercase">
                                        {ext.slice(0, 4) || 'file'}
                                    </span>
                                    <span className="flex-1 min-w-0">
                                        <span className="block text-xs font-bold text-gray-900 truncate">
                                            {f.name}
                                        </span>
                                        <span className="block text-[11px] text-gray-500 truncate">
                                            {f.sub}
                                        </span>
                                    </span>
                                    <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            );
                        })
                    ) : (
                        <p className="text-sm text-gray-400 px-1 py-4 text-center">No files uploaded for this course yet.</p>
                    )}
                </div>
            )}
        </aside>
    );
}
