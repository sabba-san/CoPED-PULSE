import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import LearnerLayout from '@/Layouts/design_v1/LearnerLayout';
import {
    BookOpenIcon,
    CircleCheckIcon,
    CheckIcon,
    ArrowRightIcon,
    GraduationCapIcon,
    CalendarIcon,
    TrophyIcon,
    LinkIcon,
    ClipboardCheckIcon,
    XMarkIcon,
} from '@/Components/flat/icons';

import VideoPlayer from './Partials/VideoPlayer';
import { safeUrl, formatEmbedUrl, getYouTubeId, isVideoUrl } from '@/Utils/mediaUtils';

export default function Learn({
    course,
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
    const assessments = allAssessments.filter((q) => !q.module_id);
    const { flash } = usePage().props;

    const isCompleted = Boolean(enrollment?.completed_at);
    const progressPct = Math.min(100, Math.max(0, Math.round(Number(enrollment?.progress ?? 0))));

    // Active Tab State: 'course' | 'dates' | 'assessment' | 'notes'
    const [activeTab, setActiveTab] = useState('course');
    const [showQuizModal, setShowQuizModal] = useState(false);

    // Initial Resume Module calculation
    const doneSet = useMemo(() => new Set(completedModuleIds || []), [completedModuleIds]);
    const resumeModule = useMemo(() => {
        return modules.find((m) => !doneSet.has(m.id)) ?? modules[0] ?? null;
    }, [modules, doneSet]);

    // Active selected module in the stage
    const [activeModuleId, setActiveModuleId] = useState(resumeModule?.id ?? modules[0]?.id ?? null);

    // State for instant automatic/manual completion banner
    const [autoCompletedNotice, setAutoCompletedNotice] = useState(null);

    const toggleModuleCheck = (moduleId, e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        const isDone = doneSet.has(moduleId);
        if (isDone) {
            router.delete(route('learner.course.module.uncomplete', [course.id, moduleId]), {
                preserveScroll: true,
            });
            setAutoCompletedNotice(null);
        } else {
            const m = modules.find((mod) => mod.id === moduleId);
            setAutoCompletedNotice({
                moduleId,
                title: m?.title || 'Module',
                manual: true,
            });
            router.post(route('learner.course.module.complete', [course.id, moduleId]), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleMarkComplete = (moduleId) => {
        const m = modules.find((mod) => mod.id === moduleId);
        setAutoCompletedNotice({
            moduleId,
            title: m?.title || 'Module',
            manual: true,
        });
        router.post(route('learner.course.module.complete', [course.id, moduleId]), {}, {
            preserveScroll: true,
        });
    };

    const handleAutoVideoComplete = (targetModule) => {
        if (!targetModule || doneSet.has(targetModule.id)) return;

        setAutoCompletedNotice({
            moduleId: targetModule.id,
            title: targetModule.title,
            manual: false,
        });

        router.post(route('learner.course.module.complete', [course.id, targetModule.id]), {}, {
            preserveScroll: true,
        });
    };

    // Quick notes scratchpad (saved per course in localStorage)
    const [courseNotes, setCourseNotes] = useState('');
    const [notesSavedNotice, setNotesSavedNotice] = useState(false);

    useEffect(() => {
        try {
            const savedNotes = localStorage.getItem(`coped_notes_${course.id}`);
            if (savedNotes !== null) {
                setCourseNotes(savedNotes);
            } else if (notes && typeof notes === 'object') {
                const combined = Object.values(notes)
                    .map((n) => n?.content)
                    .filter(Boolean)
                    .join('\n\n');
                setCourseNotes(combined);
            }
        } catch {}
    }, [course.id, notes]);

    const handleNotesChange = (e) => {
        const val = e.target.value;
        setCourseNotes(val);
        try {
            localStorage.setItem(`coped_notes_${course.id}`, val);
            setNotesSavedNotice(true);
            setTimeout(() => setNotesSavedNotice(false), 2000);
        } catch {}
    };

    // Active module entity & surrounding navigation
    const activeIndex = Math.max(0, modules.findIndex((m) => m.id === activeModuleId));
    const activeModule = modules[activeIndex] || modules[0] || null;
    const prevModule = activeIndex > 0 ? modules[activeIndex - 1] : null;
    const nextModule = activeIndex < modules.length - 1 ? modules[activeIndex + 1] : null;

    // Final Assessment Form
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
            onSuccess: (page) => {
                if (page?.props?.flash?.assessment_passed) {
                    setShowQuizModal(false);
                }
            },
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Pending';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const [selectedLessonUrl, setSelectedLessonUrl] = useState(null);
    const [selectedLessonTitle, setSelectedLessonTitle] = useState(null);

    // Reset selected lesson URL and notice when module changes
    useEffect(() => {
        setSelectedLessonUrl(null);
        setSelectedLessonTitle(null);
        setAutoCompletedNotice(null);
    }, [activeModuleId]);

    const activeSafeUrl = selectedLessonUrl
        ?? safeUrl(activeModule?.media_url)
        ?? safeUrl((activeModule?.lessons || []).find((l) => l.content_url)?.content_url);
    const activeMediaTitle = selectedLessonTitle || activeModule?.title || 'Lesson Unit';

    return (
        <LearnerLayout>
            <Head title={`Learn: ${course.title}`} />

            <div className="space-y-6">
                {/* Course Top Header */}
                <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6 space-y-4">
                    {/* Institutional Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <Link href={route('portal')} className="text-[#111827] hover:underline">
                            UUM CoPED
                        </Link>
                        <span>/</span>
                        <span className="text-gray-400 truncate max-w-md">{course.title}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#111827]">
                                {course.title}
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Instructed by {course.instructor?.name || 'Faculty Instructor'}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <span
                                className={`px-3 py-1 text-xs font-extrabold rounded border-2 ${
                                    isCompleted
                                        ? 'bg-emerald-50 text-[#10B981] border-[#10B981]'
                                        : 'bg-blue-50 text-[#3B82F6] border-[#3B82F6]'
                                }`}
                            >
                                {isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                            </span>
                            {assessments.length > 0 && !isCompleted && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('assessment')}
                                    className="bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded transition-transform active:scale-[0.98]"
                                >
                                    Take Final Assessment
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2 border-t-2 border-[#E5E7EB]">
                        <div className="flex items-center justify-between text-xs font-bold text-[#111827]">
                            <span>Overall Course Progress</span>
                            <span>{progressPct}%</span>
                        </div>
                        <div
                            className="w-full bg-[#F3F4F6] border border-[#E5E7EB] h-2.5 rounded-full overflow-hidden"
                            role="progressbar"
                            aria-valuenow={progressPct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        >
                            <div
                                className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>

                    {/* Celebration Banner */}
                    {isCompleted && (
                        <div className="bg-[#10B981] text-white p-4 rounded-md font-bold text-sm flex items-center gap-3">
                            <CircleCheckIcon className="w-5 h-5 text-white shrink-0" />
                            <span>
                                Course Completed! You have passed the Final Assessment with 100%. Your verified record is issued.
                            </span>
                        </div>
                    )}
                </div>

                {/* edX Horizontal Sub-Navigation Tabs */}
                <div className="border-b-2 border-[#E5E7EB] bg-white px-6 flex gap-6 overflow-x-auto">
                    {[
                        { id: 'course', label: 'Course' },
                        { id: 'dates', label: 'Dates' },
                        { id: 'assessment', label: 'Progress & Assessment' },
                        { id: 'notes', label: 'Course Tools & Notes' },
                    ].map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setActiveTab(tab.id)}
                                className={`text-sm whitespace-nowrap transition-colors py-3 ${
                                    active
                                        ? 'border-b-4 border-[#111827] font-bold text-[#111827]'
                                        : 'text-gray-500 hover:text-[#111827] font-semibold border-b-4 border-transparent'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab 1: Course (Default Onboarding Banner + 3-Zone Theater Player) */}
                {activeTab === 'course' && (
                    <div className="space-y-6">
                        {/* Begin your course today Callout Card */}
                        <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="font-display font-bold text-xl text-[#111827]">
                                    Begin your course today
                                </h2>
                                <p className="text-sm text-gray-600 mt-0.5">
                                    Work through each chapter module at your own pace and prepare for the final assessment.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (resumeModule?.id) setActiveModuleId(resumeModule.id);
                                }}
                                className="bg-[#111827] hover:bg-gray-800 text-white font-bold text-sm px-6 py-3 rounded shrink-0 transition-transform active:scale-[0.98]"
                            >
                                {doneSet.has(activeModuleId) ? 'Next Module' : 'Start Course'}
                            </button>
                        </div>

                        {/* Warm flat amber notice box */}
                        <div className="bg-[#FEF3C7] border-2 border-[#F59E0B] p-4 rounded-md text-sm text-[#111827] font-medium flex items-start gap-3">
                            <span className="text-[#F59E0B] text-lg font-black leading-none">ⓘ</span>
                            <p>
                                Welcome to this self-paced course! You can learn at your own pace, complete modules, and pass the final assessment when you are ready.
                            </p>
                        </div>

                        {/* Theater Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left Curriculum Outline (lg:col-span-4) */}
                            <div className="lg:col-span-4 space-y-4">
                                <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-4">
                                    <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#E5E7EB]">
                                        <h3 className="font-display font-extrabold text-sm text-[#111827] uppercase tracking-wider">
                                            Curriculum ({modules.length} Modules)
                                        </h3>
                                        <span className="text-xs text-gray-500 font-semibold">
                                            Click to open
                                        </span>
                                    </div>

                                    {modules.length === 0 ? (
                                        <p className="text-xs text-gray-500 py-4 text-center">
                                            No modules added to this course yet.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {modules.map((m, idx) => {
                                                const isActive = m.id === activeModuleId;
                                                const isChecked = doneSet.has(m.id);
                                                const isEmbed = m.content_type === 'embed';

                                                return (
                                                    <div
                                                        key={m.id}
                                                        onClick={() => setActiveModuleId(m.id)}
                                                        className={`p-3 rounded-md border-2 transition-colors cursor-pointer flex items-start gap-3 ${
                                                            isActive
                                                                ? 'border-[#111827] bg-[#F3F4F6]'
                                                                : 'border-[#E5E7EB] bg-white hover:border-gray-400'
                                                        }`}
                                                    >
                                                        {/* Module Checkbox Toggle */}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => toggleModuleCheck(m.id, e)}
                                                            title={isChecked ? 'Mark incomplete' : 'Mark complete'}
                                                            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                                isChecked
                                                                    ? 'bg-[#10B981] border-[#10B981] text-white'
                                                                    : 'bg-white border-gray-400 hover:border-[#111827]'
                                                            }`}
                                                        >
                                                            {isChecked && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                                                        </button>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-1">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                                    Chapter {idx + 1}
                                                                </span>
                                                                {isChecked ? (
                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pop">
                                                                        ✓ DONE
                                                                    </span>
                                                                ) : (
                                                                    <span
                                                                        className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider border ${
                                                                            isEmbed
                                                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                                : 'bg-gray-100 text-gray-700 border-gray-300'
                                                                        }`}
                                                                    >
                                                                        {isEmbed ? 'EMBED' : 'LINK'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p
                                                                className={`text-xs font-bold truncate mt-0.5 ${
                                                                    isActive ? 'text-[#111827]' : 'text-gray-800'
                                                                }`}
                                                            >
                                                                {m.title}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Bottom Assessment Jump Button */}
                                    {assessments.length > 0 && (
                                        <div className="mt-4 pt-3 border-t-2 border-[#E5E7EB]">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('assessment')}
                                                className="w-full bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs py-2.5 px-3 rounded flex items-center justify-between transition-transform active:scale-[0.98]"
                                            >
                                                <span>Final Assessment ({assessments.length} Questions)</span>
                                                <ArrowRightIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Center/Right Learning Stage (lg:col-span-8) */}
                            <div className="lg:col-span-8 space-y-6">
                                {activeModule ? (
                                    <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6 space-y-6">
                                        {/* Module Header */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Module {activeIndex + 1} of {modules.length}
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                                                        activeModule.content_type === 'embed'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                            : 'bg-gray-100 text-gray-700 border-gray-300'
                                                    }`}
                                                >
                                                    {activeModule.content_type === 'embed' ? 'Interactive Embed' : 'Resource Link'}
                                                </span>
                                            </div>
                                            <h2 className="font-display font-extrabold text-2xl text-[#111827]">
                                                {activeModule.title}
                                            </h2>
                                            {activeModule.description && (
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {activeModule.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Media Content Stage (Universal In-App Player) */}
                                        <div id="course-media-stage" className="scroll-mt-6 space-y-4">
                                            {/* Auto-Completed Flat Toast Banner */}
                                            {autoCompletedNotice && autoCompletedNotice.moduleId === activeModule.id && (
                                                <div className="bg-[#10B981] text-white p-4 rounded-md font-bold text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in border-2 border-[#10B981]">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-7 h-7 rounded-full bg-white text-[#10B981] flex items-center justify-center font-black text-sm shrink-0">
                                                            ✓
                                                        </span>
                                                        <div>
                                                            <p className="font-extrabold text-sm text-white">
                                                                {autoCompletedNotice.manual ? 'Module Marked Complete!' : 'Module Completed Automatically!'}
                                                            </p>
                                                            <p className="text-xs text-emerald-100 font-medium">
                                                                "{autoCompletedNotice.title}" has been ticked off. Progress updated in your records.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {nextModule && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActiveModuleId(nextModule.id);
                                                                setAutoCompletedNotice(null);
                                                            }}
                                                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#111827] hover:bg-gray-800 text-white rounded text-xs font-extrabold shrink-0 transition-transform active:scale-[0.98]"
                                                        >
                                                            <span>Next Module: {nextModule.title}</span>
                                                            <span>→</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {activeSafeUrl ? (
                                                <VideoPlayer
                                                    key={activeSafeUrl}
                                                    module={activeModule}
                                                    mediaUrl={activeSafeUrl}
                                                    activeTitle={activeMediaTitle}
                                                    onEnded={() => handleAutoVideoComplete(activeModule)}
                                                />
                                            ) : (
                                                <div className="bg-white border-2 border-[#E5E7EB] rounded-md p-8 text-center space-y-2">
                                                    <BookOpenIcon className="w-10 h-10 text-gray-400 mx-auto" />
                                                    <h3 className="font-display font-bold text-base text-[#111827]">
                                                        Lecture Notes & Content
                                                    </h3>
                                                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                                                        No external media URL attached to this module. Review the module overview and take notes below.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Module Completion Action Bar */}
                                        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t-2 border-[#E5E7EB]">
                                            <div className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${doneSet.has(activeModule.id) ? 'bg-[#10B981]' : 'bg-gray-400'}`} />
                                                <span>Unit Completion Status: {doneSet.has(activeModule.id) ? 'Completed' : 'In Progress'}</span>
                                            </div>
                                            {doneSet.has(activeModule.id) ? (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#10B981] text-white font-bold text-xs px-5 py-2.5 rounded-md cursor-default transition-all duration-200"
                                                >
                                                    <span>✓ Completed</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleMarkComplete(activeModule.id)}
                                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-md transition-transform active:scale-[0.98]"
                                                >
                                                    <span>✓ Mark Module as Complete</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Subtopics / Lessons Playlist */}
                                        {activeModule.lessons && activeModule.lessons.length > 0 && (
                                            <div className="mt-4 pt-4 border-t-2 border-[#E5E7EB] space-y-2">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Subtopics & Lessons in this Module:
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {activeModule.lessons.map((lesson, lIdx) => {
                                                        const lessonSafe = safeUrl(lesson.content_url);
                                                        const isCurrentLesson = selectedLessonUrl ? selectedLessonUrl === lessonSafe : (activeSafeUrl === lessonSafe);
                                                        return (
                                                            <button
                                                                key={lesson.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    if (lessonSafe) {
                                                                        setSelectedLessonUrl(lessonSafe);
                                                                        setSelectedLessonTitle(`${activeModule.title} · ${lesson.title}`);
                                                                        document.getElementById('course-media-stage')?.scrollIntoView({ behavior: 'smooth' });
                                                                    }
                                                                }}
                                                                className={`text-left p-3 rounded-md border-2 transition-all flex items-center justify-between gap-2 ${
                                                                    isCurrentLesson
                                                                        ? 'border-[#3B82F6] bg-blue-50 text-[#111827] font-bold'
                                                                        : 'border-[#E5E7EB] bg-[#F9FAFB] hover:border-gray-400 text-gray-700'
                                                                }`}
                                                            >
                                                                <div className="min-w-0">
                                                                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Lesson {lIdx + 1}</span>
                                                                    <span className="text-xs truncate block">{lesson.title}</span>
                                                                </div>
                                                                {lessonSafe && (
                                                                    <span className="shrink-0 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white border border-[#E5E7EB] text-[#3B82F6]">
                                                                        ▶ Play
                                                                    </span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Prev / Next Navigation Buttons */}
                                        <div className="flex items-center justify-between pt-4 border-t-2 border-[#E5E7EB]">
                                            {prevModule ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveModuleId(prevModule.id)}
                                                    className="inline-flex items-center gap-2 bg-white border-2 border-[#E5E7EB] hover:border-[#111827] text-[#111827] font-bold text-xs px-4 py-2.5 rounded transition-colors"
                                                >
                                                    <span>← Previous Module</span>
                                                </button>
                                            ) : (
                                                <div />
                                            )}

                                            {nextModule ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveModuleId(nextModule.id)}
                                                    className="inline-flex items-center gap-2 bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs px-4 py-2.5 rounded transition-transform active:scale-[0.98]"
                                                >
                                                    <span>Next Module →</span>
                                                </button>
                                            ) : assessments.length > 0 ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('assessment')}
                                                    className="inline-flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs px-5 py-2.5 rounded transition-transform active:scale-[0.98]"
                                                >
                                                    <span>Proceed to Final Assessment →</span>
                                                </button>
                                            ) : null}
                                        </div>

                                        {/* Quick Notes Scratchpad */}
                                        <div className="bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-lg p-5 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-display font-bold text-sm text-[#111827]">
                                                    Quick Study Notes
                                                </h3>
                                                {notesSavedNotice && (
                                                    <span className="text-[11px] text-[#10B981] font-bold">
                                                        Saved locally ✓
                                                    </span>
                                                )}
                                            </div>
                                            <textarea
                                                rows={4}
                                                value={courseNotes}
                                                onChange={handleNotesChange}
                                                placeholder="Type your notes here while watching videos or reading slides..."
                                                className="w-full p-3 bg-white border-2 border-[#E5E7EB] rounded-md text-xs text-[#111827] placeholder:text-gray-400 focus:outline-none focus:border-[#111827]"
                                            />
                                        </div>

                                        {/* Bottom Action Footer for Final Assessment */}
                                        {assessments.length > 0 && !isCompleted && (
                                            <div className="p-4 bg-[#F3F4F6] border-2 border-[#E5E7EB] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div>
                                                    <p className="font-bold text-xs text-[#111827]">
                                                        Ready for certification?
                                                    </p>
                                                    <p className="text-[11px] text-gray-600">
                                                        100% required on all {assessments.length} questions to earn your certificate.
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('assessment')}
                                                    className="bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs px-5 py-2.5 rounded shrink-0 transition-transform active:scale-[0.98]"
                                                >
                                                    Take Final Assessment
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-lg p-12 text-center">
                                        <p className="text-gray-500 font-medium text-sm">
                                            No module selected. Choose a chapter from the curriculum on the left.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 2: Dates (edX Vertical Milestone Timeline from 2.png) */}
                {activeTab === 'dates' && (
                    <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-8 max-w-3xl space-y-6">
                        <div>
                            <h2 className="font-display font-extrabold text-2xl text-[#111827]">
                                Important Dates & Milestones
                            </h2>
                            <p className="text-xs text-gray-600 mt-1">
                                Self-paced timeline tracking your course enrollment, study progress, and assessment deadlines.
                            </p>
                        </div>

                        {/* Vertical Timeline */}
                        <div className="relative border-l-2 border-[#111827] ml-4 pl-6 space-y-8 my-6">
                            {/* Milestone 1: Enrollment Date */}
                            <div className="relative">
                                <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#111827] border-2 border-white" />
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        Enrollment Confirmed
                                    </span>
                                    <h3 className="font-display font-bold text-base text-[#111827]">
                                        {formatDate(enrollment?.created_at)}
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        Enrollment confirmed in CoPED PULSE. Self-paced course window activated.
                                    </p>
                                </div>
                            </div>

                            {/* Milestone 2: Today Badge */}
                            <div className="relative">
                                <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#F59E0B] border-2 border-white" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                            Current Date
                                        </span>
                                        <span className="bg-[#F59E0B] text-[#111827] text-[10px] font-extrabold px-2 py-0.5 rounded">
                                            Today
                                        </span>
                                    </div>
                                    <h3 className="font-display font-bold text-base text-[#111827]">
                                        {new Date().toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        Active study session. Current progress: {progressPct}% completed.
                                    </p>
                                </div>
                            </div>

                            {/* Milestone 3: Final Assessment Gate */}
                            <div className="relative">
                                <span
                                    className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                        isCompleted ? 'bg-[#10B981]' : 'bg-[#3B82F6]'
                                    }`}
                                />
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        Grading Gate
                                    </span>
                                    <h3 className="font-display font-bold text-base text-[#111827]">
                                        Final Assessment (100% Mastery Required)
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        {isCompleted
                                            ? 'Passed with 100% score. Requirement fulfilled.'
                                            : 'Pending completion. You may attempt the assessment at any time.'}
                                    </p>
                                    {!isCompleted && assessments.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('assessment')}
                                            className="mt-2 text-xs font-bold text-[#111827] underline hover:text-[#3B82F6]"
                                        >
                                            Go to Final Assessment →
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Milestone 4: Record Issued */}
                            <div className="relative">
                                <span
                                    className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                        isCompleted ? 'bg-[#10B981]' : 'bg-gray-300'
                                    }`}
                                />
                                <div>
                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        Certificate Unlocked
                                    </span>
                                    <h3 className="font-display font-bold text-base text-[#111827]">
                                        Official Verified Record
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        {isCompleted
                                            ? `Verified record unlocked on ${formatDate(enrollment?.completed_at)}.`
                                            : 'Complete all modules and pass the Final Assessment to unlock your official record.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 3: Progress & Assessment (Inline Final Quiz & Score Breakdown) */}
                {activeTab === 'assessment' && (
                    <div className="max-w-3xl space-y-6">
                        {/* Score Breakdown Card */}
                        <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h2 className="font-display font-extrabold text-xl text-[#111827]">
                                        Assessment Status & Progress
                                    </h2>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        Passing criteria: 100% correct answers on all questions.
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-500 font-bold uppercase">Current Score</span>
                                    <p className="font-display text-2xl font-black text-[#111827]">
                                        {progressPct}%
                                    </p>
                                </div>
                            </div>

                            {/* Flash Alert Messages */}
                            {flash?.success && (
                                <div className="bg-emerald-50 border-2 border-[#10B981] text-emerald-900 p-4 rounded-md text-xs font-bold">
                                    {flash.success}
                                </div>
                            )}
                            {flash?.error && (
                                <div className="bg-red-50 border-2 border-red-500 text-red-900 p-4 rounded-md text-xs font-bold">
                                    {flash.error}
                                </div>
                            )}
                            {flash?.assessment_score !== undefined && !flash?.assessment_passed && (
                                <div className="bg-[#FEF3C7] border-2 border-[#F59E0B] text-[#111827] p-4 rounded-md text-xs font-bold">
                                    You scored {flash.assessment_score}%. 100% is required to pass. Please review your answers and retry.
                                </div>
                            )}
                        </div>

                        {/* Interactive Final Assessment Form */}
                        <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b-2 border-[#E5E7EB]">
                                <div>
                                    <h3 className="font-display font-extrabold text-lg text-[#111827]">
                                        Final Assessment
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        {assessments.length} {assessments.length === 1 ? 'question' : 'questions'} · Select one answer per question
                                    </p>
                                </div>
                                <span className="bg-[#111827] text-white text-xs font-black px-2.5 py-1 rounded">
                                    100% Mastery
                                </span>
                            </div>

                            {assessments.length === 0 ? (
                                <div className="py-12 text-center border-2 border-dashed border-[#E5E7EB] rounded-md">
                                    <ClipboardCheckIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 font-medium">
                                        No assessment questions available for this course yet.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={submitQuiz} className="space-y-6">
                                    {assessments.map((q, idx) => (
                                        <fieldset
                                            key={q.id}
                                            className="border-2 border-[#E5E7EB] rounded-lg p-5 bg-[#F9FAFB] space-y-3"
                                        >
                                            <legend className="sr-only">Question {idx + 1}</legend>
                                            <div className="flex items-start gap-2">
                                                <span className="text-xs font-black text-[#111827] bg-[#E5E7EB] px-2 py-0.5 rounded">
                                                    Q{idx + 1}
                                                </span>
                                                <p className="font-bold text-sm text-[#111827] leading-snug">
                                                    {q.question}
                                                </p>
                                            </div>

                                            <div className="space-y-2 pt-1">
                                                {['a', 'b', 'c', 'd'].map((key) => {
                                                    const isChecked = form.data.answers[q.id] === key;
                                                    return (
                                                        <label
                                                            key={key}
                                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-md border-2 cursor-pointer transition-colors ${
                                                                isChecked
                                                                    ? 'border-[#111827] bg-[#111827] text-white'
                                                                    : 'border-[#E5E7EB] bg-white text-[#111827] hover:border-gray-400'
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`question-${q.id}`}
                                                                value={key}
                                                                checked={isChecked}
                                                                onChange={() => setAnswer(q.id, key)}
                                                                className="sr-only"
                                                            />
                                                            <span
                                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-black uppercase shrink-0 ${
                                                                    isChecked
                                                                        ? 'border-white bg-white text-[#111827]'
                                                                        : 'border-gray-300 text-gray-600 bg-[#F3F4F6]'
                                                                }`}
                                                            >
                                                                {key}
                                                            </span>
                                                            <span className="text-xs font-semibold flex-1">
                                                                {q[`option_${key}`]}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>

                                            {form.errors[`answers.${q.id}`] && (
                                                <p className="text-xs text-red-600 font-bold mt-1">
                                                    {form.errors[`answers.${q.id}`]}
                                                </p>
                                            )}
                                        </fieldset>
                                    ))}

                                    {form.errors.answers && (
                                        <p className="text-xs text-red-600 font-bold">
                                            {form.errors.answers}
                                        </p>
                                    )}

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={form.processing}
                                            className="w-full bg-[#111827] hover:bg-gray-800 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded text-sm transition-transform active:scale-[0.98]"
                                        >
                                            {form.processing ? 'Submitting Answers...' : 'Submit Answers'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab 4: Course Tools & Notes */}
                {activeTab === 'notes' && (
                    <div className="max-w-3xl space-y-6">
                        <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b-2 border-[#E5E7EB]">
                                <div>
                                    <h2 className="font-display font-extrabold text-xl text-[#111827]">
                                        Course Study Notes
                                    </h2>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        Personal scratchpad saved locally in your browser.
                                    </p>
                                </div>
                                {notesSavedNotice && (
                                    <span className="text-xs text-[#10B981] font-bold">
                                        Saved locally ✓
                                    </span>
                                )}
                            </div>

                            <textarea
                                rows={10}
                                value={courseNotes}
                                onChange={handleNotesChange}
                                placeholder="Type your full study notes, lecture takeaways, and questions here..."
                                className="w-full p-4 bg-white border-2 border-[#E5E7EB] rounded-md text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:border-[#111827]"
                            />

                            <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                                <span>Auto-saves on keystroke</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm('Clear all study notes for this course?')) {
                                            setCourseNotes('');
                                            localStorage.removeItem(`coped_notes_${course.id}`);
                                        }
                                    }}
                                    className="text-red-600 hover:underline font-bold"
                                >
                                    Clear Notes
                                </button>
                            </div>
                        </div>

                        {/* Course Tools Card */}
                        <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6 space-y-3">
                            <h3 className="font-display font-bold text-base text-[#111827]">
                                About this Course & Guidelines
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded">
                                    <p className="font-bold text-[#111827]">Instructor</p>
                                    <p className="text-gray-600 mt-0.5">{course.instructor?.name || 'Faculty'}</p>
                                </div>
                                <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded">
                                    <p className="font-bold text-[#111827]">Passing Standard</p>
                                    <p className="text-gray-600 mt-0.5">100% required on final assessment</p>
                                </div>
                                <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded">
                                    <p className="font-bold text-[#111827]">Curriculum Structure</p>
                                    <p className="text-gray-600 mt-0.5">{modules.length} interactive modules</p>
                                </div>
                                <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded">
                                    <p className="font-bold text-[#111827]">Institutional Partner</p>
                                    <p className="text-gray-600 mt-0.5">Universiti Utara Malaysia · CoPED</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </LearnerLayout>
    );
}
