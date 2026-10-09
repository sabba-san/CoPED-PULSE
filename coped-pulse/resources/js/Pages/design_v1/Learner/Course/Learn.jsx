import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import LearnerLayout from '@/Layouts/design_v1/LearnerLayout';

/**
 * Only allow http(s) URLs to be rendered as links.
 * Prevents javascript:/data: URLs (stored XSS) from becoming clickable.
 */
const safeMediaUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    try {
        const parsed = new URL(url.trim());
        return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
    } catch {
        return null;
    }
};

const OPTION_KEYS = ['a', 'b', 'c', 'd'];

export default function Learn({ course, enrollment }) {
    const modules = course.modules || [];
    const assessments = course.assessments || [];
    const { flash } = usePage().props;
    const isCompleted = !!enrollment?.completed_at;
    const progressPct = Math.min(100, Math.max(0, Math.round(Number(enrollment?.progress ?? 0))));

    const [showQuiz, setShowQuiz] = useState(false);

    const form = useForm({
        answers: {},
    });

    const setAnswer = (assessmentId, value) => {
        form.setData('answers', {
            ...form.data.answers,
            [assessmentId]: value,
        });
    };

    const submitQuiz = (e) => {
        e.preventDefault();
        form.post(route('learner.course.assess', course.id), {
            preserveScroll: true,
            onSuccess: () => {
                // Keep modal open on fail so learner can retry;
                // close it on pass (banner takes over after reload).
                if (flash?.assessment_passed) setShowQuiz(false);
            },
        });
    };

    return (
        <LearnerLayout>
            <Head title={`Learn: ${course.title}`} />

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Course Header */}
                <div className="bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>

                    <Link
                        href={route('portal')}
                        className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 mb-6 transition-colors relative z-10"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Portal
                    </Link>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
                                {course.title}
                            </h1>
                            {course.description && (
                                <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
                                    {course.description}
                                </p>
                            )}
                            {/* Progress line */}
                            <div className="mt-6 max-w-3xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-gray-700">Progress</span>
                                    <span className={`text-sm font-bold ${isCompleted ? 'text-green-700' : 'text-indigo-700'}`}>
                                        {progressPct}%
                                    </span>
                                </div>
                                <div
                                    className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden"
                                    role="progressbar"
                                    aria-valuenow={progressPct}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-label="Course progress"
                                >
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            isCompleted
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                                        }`}
                                        style={{ width: `${progressPct}%` }}
                                    />
                                </div>
                                {assessments.length === 0 && (
                                    <p className="mt-2 text-xs text-gray-400">No quiz yet — progress updates after the final assessment is added.</p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end space-y-3 shrink-0">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                                isCompleted
                                    ? 'bg-green-100/90 text-green-800 border border-green-200'
                                    : 'bg-blue-100/90 text-blue-800 border border-blue-200'
                            }`}>
                                {isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                            </span>
                            <div className="text-sm text-gray-500 font-medium bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                {modules.length} {modules.length === 1 ? 'Module' : 'Modules'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Completed banner */}
                {isCompleted && (
                    <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-6 text-center shadow-sm">
                        <p className="text-2xl font-black">🎉 Course Completed!</p>
                        <p className="mt-1 text-sm font-medium">
                            You passed the final assessment with 100%. Your progress is saved.
                        </p>
                    </div>
                )}

                {/* Flash messages (quiz score / enrollment feedback) */}
                {!isCompleted && flash?.success && (
                    <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-2xl px-6 py-4 text-sm font-medium">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4 text-sm font-medium">
                        {flash.error}
                    </div>
                )}

                {/* Modules List */}
                {modules.length > 0 ? (
                    <div className="space-y-4">
                        {modules.map((module, index) => {
                            const mediaUrl = safeMediaUrl(module.media_url);

                            return (
                                <article
                                    key={module.id}
                                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 p-6 flex gap-5"
                                >
                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                                        {index + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xl font-bold text-gray-900 break-words">
                                            {module.title}
                                        </h2>

                                        {module.description && (
                                            <p className="mt-2 text-gray-500 leading-relaxed whitespace-pre-line break-words">
                                                {module.description}
                                            </p>
                                        )}

                                        {mediaUrl && module.content_type === 'embed' ? (
                                            <div className="mt-5">
                                                <iframe
                                                    src={mediaUrl}
                                                    title={`Embedded content: ${module.title}`}
                                                    className="w-full aspect-video rounded-lg border border-gray-200 shadow-sm bg-white"
                                                    allow="fullscreen"
                                                    allowFullScreen
                                                    loading="lazy"
                                                />
                                                <a
                                                    href={mediaUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-2 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                                                >
                                                    Open in new tab
                                                    <svg className="w-4 h-4 ml-1 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                </a>
                                            </div>
                                        ) : mediaUrl ? (
                                            <a
                                                href={mediaUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                View Media in New Tab
                                                <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        ) : null}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 border-dashed">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <p className="text-lg text-gray-500 font-medium">No modules available yet.</p>
                        <p className="text-sm text-gray-400 mt-2">Check back later once the instructor adds content.</p>
                    </div>
                )}

                {/* Final Assessment entry */}
                {!isCompleted && assessments.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                        <h3 className="text-xl font-bold text-gray-900">Final Assessment</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {assessments.length} {assessments.length === 1 ? 'question' : 'questions'} • You need 100% to complete this course.
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowQuiz(true)}
                            className="mt-4 inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            Take Final Assessment
                        </button>
                    </div>
                )}

                {!isCompleted && assessments.length === 0 && (
                    <div className="text-center text-sm text-gray-400">
                        No assessment available for this course yet.
                    </div>
                )}

                {/* Quiz modal */}
                {showQuiz && !isCompleted && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
                            onClick={() => setShowQuiz(false)}
                        />
                        <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8">
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">Final Assessment</h3>
                                    <p className="text-sm text-gray-500 mt-1">Select one answer per question. 100% required to pass.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowQuiz(false)}
                                    className="shrink-0 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors"
                                    aria-label="Close quiz"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={submitQuiz} className="space-y-6">
                                {assessments.map((q, idx) => (
                                    <fieldset key={q.id} className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
                                        <legend className="sr-only">Question {idx + 1}</legend>
                                        <p className="font-bold text-gray-900">
                                            <span className="text-indigo-600 mr-2">Q{idx + 1}.</span>
                                            {q.question}
                                        </p>
                                        <div className="mt-3 space-y-2">
                                            {OPTION_KEYS.map((key) => (
                                                <label
                                                    key={key}
                                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                                                        form.data.answers[q.id] === key
                                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                                                            : 'border-gray-200 bg-white hover:border-indigo-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${q.id}`}
                                                        value={key}
                                                        checked={form.data.answers[q.id] === key}
                                                        onChange={() => setAnswer(q.id, key)}
                                                        className="accent-indigo-600"
                                                    />
                                                    <span className="font-bold uppercase text-xs w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                        {key}
                                                    </span>
                                                    <span className="text-sm font-medium">{q[`option_${key}`]}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {form.errors[`answers.${q.id}`] && (
                                            <p className="mt-2 text-red-500 text-sm font-medium">{form.errors[`answers.${q.id}`]}</p>
                                        )}
                                    </fieldset>
                                ))}

                                {form.errors.answers && (
                                    <p className="text-red-500 text-sm font-medium">{form.errors.answers}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full py-3.5 rounded-xl text-white font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {form.processing ? 'Submitting...' : 'Submit Answers'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </LearnerLayout>
    );
}
