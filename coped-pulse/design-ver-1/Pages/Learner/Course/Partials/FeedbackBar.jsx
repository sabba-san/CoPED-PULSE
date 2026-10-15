import { router } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Thumbs up/down + report, posted instantly without reload.
 * Keyed by module from the parent so state resets per module.
 */
export default function FeedbackBar({ course, module, initial = null }) {
    const [reportOpen, setReportOpen] = useState(false);
    const [report, setReport] = useState('');
    const [sending, setSending] = useState(false);

    const reaction = initial?.reaction ?? null;

    const send = (payload, done) => {
        setSending(true);
        router.post(route('learner.course.module.feedback.store', [course.id, module.id]), payload, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
                setSending(false);
                done?.();
            },
        });
    };

    const react = (value) => {
        send({ reaction: reaction === value ? null : value });
    };

    const submitReport = (e) => {
        e.preventDefault();
        if (!report.trim()) return;
        send({ reaction, report: report.trim() }, () => {
            setReport('');
            setReportOpen(false);
        });
    };

    const btn = (isActive, activeCls) =>
        `p-2 rounded-lg transition-colors disabled:opacity-40 ${
            isActive ? activeCls : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
        }`;

    return (
        <div>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={sending}
                    onClick={() => react('up')}
                    title="Helpful"
                    aria-pressed={reaction === 'up'}
                    className={btn(reaction === 'up', 'text-emerald-600 bg-emerald-50')}
                >
                    <svg className="w-5 h-5" fill={reaction === 'up' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" /></svg>
                </button>
                <button
                    type="button"
                    disabled={sending}
                    onClick={() => react('down')}
                    title="Not helpful"
                    aria-pressed={reaction === 'down'}
                    className={btn(reaction === 'down', 'text-red-600 bg-red-50')}
                >
                    <svg className="w-5 h-5" fill={reaction === 'down' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 15v4a3 3 0 003 3l4-9V2H6.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM17 2h3a2 2 0 012 2v7a2 2 0 01-2 2h-3" /></svg>
                </button>
                <button
                    type="button"
                    onClick={() => setReportOpen((v) => !v)}
                    className={`px-2 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        initial?.has_report || reportOpen ? 'text-amber-700 bg-amber-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    {initial?.has_report ? '✓ Reported' : 'Report'}
                </button>
            </div>
            {reportOpen && (
                <form onSubmit={submitReport} className="mt-2 flex gap-2">
                    <input
                        type="text"
                        value={report}
                        onChange={(e) => setReport(e.target.value)}
                        placeholder="What's wrong with this lesson?"
                        maxLength={2000}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={sending || !report.trim()}
                        className="px-3 py-2 text-xs font-bold text-white bg-gray-900 rounded-lg disabled:opacity-40"
                    >
                        Send
                    </button>
                </form>
            )}
        </div>
    );
}
