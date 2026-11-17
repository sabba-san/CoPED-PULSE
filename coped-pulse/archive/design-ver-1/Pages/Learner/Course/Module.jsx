import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import LearnerLayout from '@/Layouts/design_v1/LearnerLayout';
import CurriculumSidebar from './Partials/CurriculumSidebar';
import RightSidebar from './Partials/RightSidebar';
import VideoPlayer from './Partials/VideoPlayer';
import DiveDeeper from './Partials/DiveDeeper';
import FeedbackBar from './Partials/FeedbackBar';

const OPTION_KEYS = ['a', 'b', 'c', 'd'];

const safeUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    if (url.startsWith('/storage/')) return url;
    try {
        const p = new URL(url.trim());
        return p.protocol === 'http:' || p.protocol === 'https:' ? p.href : null;
    } catch { return null; }
};

export default function Module({
    course,
    module,
    enrollment,
    completedModuleIds = [],
    completedLessonIds = [],
    todayCount = 0,
    dailyGoal = 3,
    notes = {},
    feedback = {},
}) {
    const modules = course.modules || [];
    const allAssessments = course.assessments || [];
    const moduleQuizzes = allAssessments.filter((q) => q.module_id === module.id);
    const { flash } = usePage().props;

    const doneSet = new Set(completedModuleIds || []);
    const isModuleDone = doneSet.has(module.id);

    const activeIndex = Math.max(0, modules.findIndex((m) => m.id === module.id));
    const prev = modules[activeIndex - 1] || null;
    const next = modules[activeIndex + 1] || null;

    const activeMediaUrl = safeUrl(module.media_url)
        ?? safeUrl((module.lessons || []).find((l) => l.content_url)?.content_url);
    const deepTranscript = module.transcript
        ?? (module.lessons || []).find((l) => l.transcript)?.transcript
        ?? null;

    const [sidebarTab, setSidebarTab] = useState('notes');
    const [deepOpen, setDeepOpen] = useState(false);
    const [miniAnswers, setMiniAnswers] = useState({});
    const [miniChecked, setMiniChecked] = useState(null);

    const goToNotes = () => {
        setSidebarTab('notes');
        requestAnimationFrame(() => {
            document.getElementById('study-sidebar')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            document.getElementById('module-note-textarea')?.focus({ preventScroll: true });
        });
    };

    const toggleComplete = () => {
        if (isModuleDone) {
            router.delete(route('learner.course.module.uncomplete', [course.id, module.id]), {
                preserveScroll: true,
            });
        } else {
            router.post(route('learner.course.module.complete', [course.id, module.id]), {}, {
                preserveScroll: true,
            });
        }
    };

    const setMiniAnswer = (assessmentId, value) => {
        setMiniAnswers((prev) => ({ ...prev, [assessmentId]: value }));
        setMiniChecked(null);
    };

    const checkMiniQuiz = () => {
        const correct = moduleQuizzes.filter(
            (q) => (miniAnswers[q.id] || '').toLowerCase() === String(q.correct_option || '').toLowerCase()
        ).length;
        setMiniChecked({
            correct,
            total: moduleQuizzes.length,
            score: moduleQuizzes.length > 0 ? Math.round((correct / moduleQuizzes.length) * 100) : 0,
        });
    };

    const resetMiniQuiz = () => {
        setMiniAnswers({});
        setMiniChecked(null);
    };

    return (
        <LearnerLayout>
            <Head title={module.title} />

            <div className="max-w-6xl mx-auto space-y-6">
                <div>
                    <Link
                        href={route('learner.course.learn', course.id)}
                        className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to {course.title}
                    </Link>
                    <p className="mt-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        Module {activeIndex + 1} of {modules.length}
                    </p>
                </div>

                {flash?.success && (
                    <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-2xl px-6 py-4 text-sm font-medium">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4 text-sm font-medium">
                        {flash.error}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_320px]">
                    <CurriculumSidebar
                        course={course}
                        modules={modules}
                        activeId={module.id}
                        onSelect={() => {}}
                        completedModuleIds={completedModuleIds}
                        completedLessonIds={completedLessonIds}
                        todayCount={todayCount}
                        dailyGoal={dailyGoal}
                    />

                    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h1 className="text-2xl font-black text-gray-900 break-words">
                            {module.title}
                        </h1>
                        {module.description && (
                            <p className="mt-2 text-gray-500 leading-relaxed whitespace-pre-line break-words">
                                {module.description}
                            </p>
                        )}
                        {module.duration != null && (
                            <p className="mt-1 text-xs font-semibold text-gray-400">
                                {Math.floor(module.duration / 60)}:{String(module.duration % 60).padStart(2, '0')} min
                            </p>
                        )}

                        <VideoPlayer
                            module={{ ...module, content_type: module.media_url ? module.content_type : 'file' }}
                            mediaUrl={activeMediaUrl}
                        />

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={goToNotes}
                                className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors"
                            >
                                Save note
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeepOpen((v) => !v)}
                                aria-expanded={deepOpen}
                                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                Dive deeper on this topic {deepOpen ? '▴' : '▾'}
                            </button>
                            <span className="flex-1" />
                            <FeedbackBar
                                key={`fb-${module.id}`}
                                course={course}
                                module={module}
                                initial={feedback?.[module.id] ?? null}
                            />
                        </div>

                        <DiveDeeper
                            key={`dd-${module.id}`}
                            module={module}
                            transcript={deepTranscript}
                            open={deepOpen}
                            onToggle={setDeepOpen}
                        />

                        {/* Mini-quiz practice */}
                        {moduleQuizzes.length > 0 && (
                            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                                    Mini-Quiz • {moduleQuizzes.length} {moduleQuizzes.length === 1 ? 'question' : 'questions'} (practice)
                                </p>
                                <div className="mt-3 space-y-3">
                                    {moduleQuizzes.map((q, qIdx) => {
                                        const picked = miniAnswers[q.id] || null;
                                        const isCorrect = miniChecked && picked?.toLowerCase() === String(q.correct_option || '').toLowerCase();
                                        return (
                                            <div key={q.id} className="bg-white rounded-xl border border-gray-100 p-4">
                                                <p className="text-sm font-bold text-gray-900">
                                                    <span className="text-emerald-600 mr-1">Q{qIdx + 1}.</span>
                                                    {q.question}
                                                </p>
                                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {OPTION_KEYS.map((key) => {
                                                        const selected = picked === key;
                                                        let cls = 'bg-gray-50 border-gray-200 text-gray-600 hover:border-emerald-300';
                                                        if (miniChecked && selected && isCorrect) cls = 'bg-emerald-50 border-emerald-400 text-emerald-900';
                                                        else if (miniChecked && selected && !isCorrect) cls = 'bg-red-50 border-red-300 text-red-800';
                                                        else if (selected) cls = 'bg-emerald-50 border-emerald-400 text-emerald-900';
                                                        return (
                                                            <label
                                                                key={key}
                                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${cls}`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={`mini-${q.id}`}
                                                                    value={key}
                                                                    checked={selected}
                                                                    onChange={() => setMiniAnswer(q.id, key)}
                                                                    className="accent-emerald-600"
                                                                />
                                                                <span className="uppercase font-bold">{key}.</span>
                                                                <span>{q[`option_${key}`]}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                                {miniChecked && (
                                                    <p className={`mt-2 text-xs font-bold ${isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
                                                        {isCorrect ? '✓ Correct' : '✕ Try again — review the module content.'}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    {miniChecked ? (
                                        <>
                                            <span className="text-xs font-bold text-emerald-800">
                                                Score: {miniChecked.correct}/{miniChecked.total} ({miniChecked.score}%)
                                            </span>
                                            <button
                                                type="button"
                                                onClick={resetMiniQuiz}
                                                className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                Retry
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={!moduleQuizzes.every((q) => miniAnswers[q.id])}
                                            onClick={checkMiniQuiz}
                                            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-40"
                                        >
                                            Check Answers
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            {prev ? (
                                <Link
                                    href={route('learner.course.module.learn', [course.id, prev.id])}
                                    className="px-4 py-2.5 rounded-xl bg-gray-100 font-bold text-sm text-center hover:bg-gray-200 transition-colors"
                                >
                                    ← Previous
                                </Link>
                            ) : (
                                <span className="px-4 py-2.5 rounded-xl bg-gray-50 font-bold text-sm text-gray-300 text-center">← Previous</span>
                            )}
                            <button
                                type="button"
                                onClick={toggleComplete}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                                    isModuleDone
                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                            >
                                {isModuleDone ? '✓ Completed — Undo?' : 'Mark as Complete'}
                            </button>
                            {next ? (
                                <Link
                                    href={route('learner.course.module.learn', [course.id, next.id])}
                                    className="px-4 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm text-center hover:bg-gray-800 transition-colors"
                                >
                                    Next →
                                </Link>
                            ) : (
                                <Link
                                    href={route('learner.course.learn', course.id)}
                                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm text-center shadow-md transition-all"
                                >
                                    Finish →
                                </Link>
                            )}
                        </div>
                    </article>

                    <RightSidebar
                        key={module.id}
                        course={course}
                        module={module}
                        modules={modules}
                        initialNote={notes?.[module.id]?.content ?? ''}
                        savedAt={notes?.[module.id]?.updated_at ?? null}
                        tab={sidebarTab}
                        onTabChange={setSidebarTab}
                    />
                </div>
            </div>
        </LearnerLayout>
    );
}
