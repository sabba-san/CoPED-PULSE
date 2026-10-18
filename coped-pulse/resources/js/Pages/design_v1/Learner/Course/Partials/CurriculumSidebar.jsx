import { router } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Left curriculum sidebar: daily goal header + module accordion
 * with per-lesson checkmarks. Parent checks only when every
 * child lesson is complete (server enforces the same invariant).
 */
export default function CurriculumSidebar({
    course,
    modules = [],
    activeId,
    onSelect,
    completedModuleIds = [],
    completedLessonIds = [],
    todayCount = 0,
    dailyGoal = 3,
}) {
    const [expanded, setExpanded] = useState({ [activeId]: true });

    const doneModules = new Set(completedModuleIds || []);
    const doneLessons = new Set(completedLessonIds || []);

    const pick = (id) => {
        setExpanded((p) => ({ ...p, [id]: true }));
        onSelect(id);
    };

    const toggleModule = (m) => {
        const finished = doneModules.has(m.id) || (m.lessons?.length > 0 && m.lessons.every((l) => doneLessons.has(l.id)));
        const args = [course.id, m.id];
        if (finished) {
            router.delete(route('learner.course.module.uncomplete', args), { preserveScroll: true });
        } else {
            router.post(route('learner.course.module.complete', args), {}, { preserveScroll: true });
        }
    };

    const toggleLesson = (moduleId, lesson) => {
        const args = [course.id, moduleId, lesson.id];
        if (doneLessons.has(lesson.id)) {
            router.delete(route('learner.course.module.lesson.uncomplete', args), { preserveScroll: true });
        } else {
            router.post(route('learner.course.module.lesson.complete', args), {}, { preserveScroll: true });
        }
    };

    const bumpGoal = (delta) => {
        const next = Math.min(20, Math.max(1, (dailyGoal || 3) + delta));
        if (next !== dailyGoal) {
            router.put(route('learner.goal.update'), { daily_goal_items: next }, { preserveScroll: true });
        }
    };

    const pct = Math.min(100, Math.round((todayCount / Math.max(1, dailyGoal)) * 100));

    return (
        <div className="space-y-4 h-fit lg:sticky lg:top-20">
            <div className="bg-[#3B82F6] rounded-md p-5 text-white">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-100">Today's goal</p>
                <p className="mt-1 text-2xl font-black font-display">
                    {todayCount} <span className="text-sm font-bold text-blue-100">/ {dailyGoal} items</span>
                </p>
                <div className="mt-3 h-2 bg-blue-900/40 rounded-sm overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Daily goal progress">
                    <div className="h-full rounded-sm bg-white transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-blue-100">Daily target</span>
                    <span className="flex items-center gap-2">
                        <button type="button" onClick={() => bumpGoal(-1)} aria-label="Decrease daily goal" className="w-6 h-6 rounded-md bg-white/20 hover:bg-white/30 font-bold leading-none">-</button>
                        <span className="text-sm font-black w-4 text-center">{dailyGoal}</span>
                        <button type="button" onClick={() => bumpGoal(1)} aria-label="Increase daily goal" className="w-6 h-6 rounded-md bg-white/20 hover:bg-white/30 font-bold leading-none">+</button>
                    </span>
                </div>
            </div>

            <nav className="bg-white rounded-md border-2 border-[#E5E7EB] p-2 space-y-1" aria-label="Course curriculum">
                {modules.map((m, i) => {
                    const lessons = m.lessons || [];
                    const allLessonsDone = lessons.length > 0 && lessons.every((l) => doneLessons.has(l.id));
                    const finished = doneModules.has(m.id) || allLessonsDone;
                    const selected = m.id === activeId;
                    const isOpen = !!expanded[m.id];

                    return (
                        <div key={m.id} className={`rounded-md transition-colors ${selected ? 'bg-blue-50/70 border-2 border-[#3B82F6]' : 'border-2 border-transparent'}`}>
                            <div className="w-full flex items-center gap-2 p-2.5 text-left">
                                <button
                                    type="button"
                                    onClick={() => toggleModule(m)}
                                    aria-pressed={finished}
                                    aria-label={finished ? `Mark ${m.title} incomplete` : `Mark ${m.title} complete`}
                                    title={finished ? 'Mark incomplete' : 'Mark complete'}
                                    className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                                        finished ? 'bg-[#10B981] text-white hover:bg-emerald-600' : 'bg-[#F3F4F6] text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {finished ? '✓' : i + 1}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => pick(m.id)}
                                    aria-current={selected}
                                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                                >
                                    <span className="flex-1 min-w-0">
                                        <span className="block text-sm font-bold text-[#111827] truncate">{m.title}</span>
                                        <span className={`text-[11px] font-bold ${finished ? 'text-[#10B981]' : 'text-gray-500'}`}>
                                            {finished ? 'COMPLETED' : lessons.length > 0 ? `${lessons.filter((l) => doneLessons.has(l.id)).length}/${lessons.length} lessons` : 'NOT STARTED'}
                                        </span>
                                    </span>
                                </button>
                                {lessons.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setExpanded((p) => ({ ...p, [m.id]: !p[m.id] }))}
                                        aria-expanded={isOpen}
                                        aria-label={isOpen ? `Collapse ${m.title}` : `Expand ${m.title}`}
                                        className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-[#F3F4F6]"
                                    >
                                        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            {isOpen && lessons.length > 0 && (
                                <ul className="ml-5 mr-2 mb-2 pl-4 border-l-2 border-[#E5E7EB] space-y-0.5">
                                    {lessons.map((l) => {
                                        const done = doneLessons.has(l.id);
                                        return (
                                            <li key={l.id} className="flex items-center gap-2 py-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleLesson(m.id, l)}
                                                    aria-pressed={done}
                                                    aria-label={done ? `Mark ${l.title} incomplete` : `Mark ${l.title} complete`}
                                                    className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center text-[10px] font-black transition-colors ${
                                                        done ? 'bg-[#10B981] border-[#10B981] text-white' : 'border-gray-300 text-transparent hover:border-[#10B981]'
                                                    }`}
                                                >
                                                    ✓
                                                </button>
                                                <button type="button" onClick={() => pick(m.id)} className="flex-1 min-w-0 text-left group">
                                                    <span className={`block text-[13px] font-semibold truncate ${done ? 'text-gray-400 line-through' : 'text-gray-700 group-hover:text-[#3B82F6]'}`}>
                                                        {l.title}
                                                    </span>
                                                    <span className="block text-[11px] text-gray-500">
                                                        {[l.content_type, l.duration != null ? `${l.duration} min` : null].filter(Boolean).join(' · ') || 'Lesson'}
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
}
