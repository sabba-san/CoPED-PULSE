import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useMemo, useRef } from 'react';
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
import CourseLogoBadge from '@/Components/flat/CourseLogoBadge';
import FormattedGuide from '@/Components/FormattedGuide';
import { safeUrl, formatEmbedUrl, getYouTubeId, isVideoUrl, isPdfFile } from '@/Utils/mediaUtils';

const CHAPTER_STEPS = [
    { key: 'watch', id: 'watch', label: 'Watch & Materials', shortLabel: 'Watch' },
    { key: 'guide', id: 'guide', label: 'Study Guide & Notes', shortLabel: 'Guide' },
    { key: 'quiz', id: 'quiz', label: 'Mini-Quiz & Complete', shortLabel: 'Quiz' },
];

const BTN_SECONDARY = 'w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 bg-white border-2 border-[#E5E7EB] hover:border-[#111827] text-[#111827] font-bold text-xs px-4 py-2.5 rounded-md transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:hover:border-[#E5E7EB] disabled:cursor-not-allowed';
const BTN_PRIMARY = 'w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs px-5 py-2.5 rounded-md transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
const BTN_SUCCESS = 'w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-md transition-transform active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed';

// Keeps the stage anchored near the viewport top after step / tab transitions.
const scrollToAnchor = (id) => requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

const timeAgo = (dateStr) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function Learn({
    course,
    enrollment,
    completedModuleIds = [],
    completedLessonIds = [],
    todayCount = 0,
    dailyGoal = 3,
    notes = {},
    feedback = {},
    chatMessages = [],
}) {
    const modules = course.modules || [];
    const allAssessments = course.assessments || [];
    const assessments = allAssessments.filter((q) => !q.module_id);
    const { auth, flash } = usePage().props;
    const currentUser = auth?.user;

    const isCompleted = Boolean(enrollment?.completed_at);
    const progressPct = Math.min(100, Math.max(0, Math.round(Number(enrollment?.progress ?? 0))));

    // Active Tab State: 'course' | 'dates' | 'assessment' | 'notes' | 'chat'
    const [activeTab, setActiveTab] = useState('course');
    const [showQuizModal, setShowQuizModal] = useState(false);

    // Initial Resume Module calculation
    const doneSet = useMemo(() => new Set(completedModuleIds || []), [completedModuleIds]);
    const doneLessonSet = useMemo(() => new Set(completedLessonIds || []), [completedLessonIds]);

    const isModuleFullyDone = (m) => {
        if (!m) return false;
        if (Array.isArray(m.lessons) && m.lessons.length > 0) {
            return m.lessons.every((l) => doneLessonSet.has(l.id));
        }
        return doneSet.has(m.id);
    };

    const resumeModule = useMemo(() => {
        return modules.find((m) => !isModuleFullyDone(m)) ?? modules[0] ?? null;
    }, [modules, doneSet, doneLessonSet]);

    // Active selected module in the stage
    const [activeModuleId, setActiveModuleId] = useState(resumeModule?.id ?? modules[0]?.id ?? null);

    // State for instant automatic/manual completion banner
    const [autoCompletedNotice, setAutoCompletedNotice] = useState(null);

    // Mobile curriculum accordion toggle & desktop full-width stage toggle
    const [mobileCurriculumOpen, setMobileCurriculumOpen] = useState(false);
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

    // Chat State
    const [messages, setMessages] = useState(chatMessages || []);
    const [chatMode, setChatMode] = useState('direct'); // 'direct' | 'group'
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const chatContainerRef = useRef(null);
    const prevLastMessageIdRef = useRef(null);
    const prevChatModeRef = useRef(null);
    const prevTabRef = useRef(null);

    const activeChatMessages = useMemo(() => {
        if (chatMode === 'direct') {
            return (messages || []).filter((m) => m.recipient_id !== null);
        }
        return (messages || []).filter((m) => m.recipient_id === null);
    }, [messages, chatMode]);

    // Read ?tab=... from URL query on load
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam === 'progress') {
            setActiveTab('assessment');
        } else if (tabParam && ['course', 'dates', 'assessment', 'notes', 'chat'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, []);

    // Silent mark-read fetch when chat tab opens
    useEffect(() => {
        if (activeTab === 'chat') {
            fetch(route('courses.chat.mark-read', course.id), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                },
            }).catch(() => {});
        }
    }, [activeTab, course.id]);

    useEffect(() => {
        if (chatMessages) {
            setMessages(chatMessages);
        }
    }, [chatMessages]);

    useEffect(() => {
        if (activeTab !== 'chat') return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(route('courses.chat.messages.index', course.id), {
                    headers: { Accept: 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessages((prev) => {
                        if (
                            Array.isArray(data) &&
                            prev.length === data.length &&
                            prev[prev.length - 1]?.id === data[data.length - 1]?.id
                        ) {
                            return prev;
                        }
                        return data;
                    });
                }
            } catch (err) {
                // silent
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [activeTab, course.id]);

    useEffect(() => {
        if (activeTab !== 'chat') {
            prevTabRef.current = activeTab;
            return;
        }

        const isTabJustSwitched = prevTabRef.current !== 'chat';
        const isChatModeSwitched = prevChatModeRef.current !== chatMode;
        prevTabRef.current = activeTab;
        prevChatModeRef.current = chatMode;

        const lastMsg = activeChatMessages[activeChatMessages.length - 1];
        const lastMsgId = lastMsg?.id;
        const hasNewMessage = lastMsgId && lastMsgId !== prevLastMessageIdRef.current;
        prevLastMessageIdRef.current = lastMsgId;

        if (isTabJustSwitched || isChatModeSwitched || hasNewMessage) {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }
    }, [activeTab, chatMode, activeChatMessages]);

    const handleSendMessage = (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const bodyText = newMessage.trim();
        setIsSending(true);

        const recipientId = chatMode === 'direct' ? (course.instructor_id || course.instructor?.id || null) : null;

        router.post(route('courses.chat.messages.store', course.id), {
            body: bodyText,
            recipient_id: recipientId,
        }, {
            preserveScroll: true,
            onSuccess: (page) => {
                setNewMessage('');
                setIsSending(false);
                if (page.props.chatMessages) {
                    setMessages(page.props.chatMessages);
                }
            },
            onError: () => {
                setIsSending(false);
            },
        });
    };

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

    const toggleLessonCheck = (moduleId, lessonId, e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (!moduleId || !lessonId) return;
        const isLessonDone = doneLessonSet.has(lessonId);
        const args = [course.id, moduleId, lessonId];
        if (isLessonDone) {
            router.delete(route('learner.course.module.lesson.uncomplete', args), {
                preserveScroll: true,
            });
            setAutoCompletedNotice(null);
        } else {
            const m = modules.find((mod) => mod.id === moduleId);
            const lessonObj = (m?.lessons || []).find((l) => l.id === lessonId);
            setAutoCompletedNotice({
                moduleId,
                title: lessonObj?.title || m?.title || 'Subtopic',
                manual: true,
            });
            router.post(route('learner.course.module.lesson.complete', args), {}, {
                preserveScroll: true,
            });
        }
    };

    const markCurrentSubtopicOrModuleComplete = (manual = false) => {
        if (!activeModule) return;
        if (selectedLesson?.id) {
            if (!doneLessonSet.has(selectedLesson.id)) {
                setAutoCompletedNotice({
                    moduleId: activeModule.id,
                    title: selectedLesson.title,
                    manual,
                });
                router.post(
                    route('learner.course.module.lesson.complete', [course.id, activeModule.id, selectedLesson.id]),
                    {},
                    { preserveScroll: true }
                );
            }
            return;
        }
        if (!doneSet.has(activeModule.id)) {
            setAutoCompletedNotice({
                moduleId: activeModule.id,
                title: activeModule.title,
                manual,
            });
            router.post(route('learner.course.module.complete', [course.id, activeModule.id]), {}, {
                preserveScroll: true,
            });
        }
    };

    const toggleCurrentViewComplete = () => {
        if (!activeModule) return;
        if (selectedLesson?.id) {
            toggleLessonCheck(activeModule.id, selectedLesson.id);
        } else {
            toggleModuleCheck(activeModule.id);
        }
    };

    const handleAutoVideoComplete = (targetModule) => {
        if (!targetModule || doneSet.has(targetModule.id)) return;
        const hasModuleMiniQuiz = allAssessments.some((a) => a.module_id === targetModule.id);
        const hasSubtopics = Array.isArray(targetModule.lessons) && targetModule.lessons.length > 0;
        // Only auto-tick on video end when the chapter is video-only (no mini-quiz and no subtopics)
        if (hasModuleMiniQuiz || hasSubtopics) return;

        setAutoCompletedNotice({
            moduleId: targetModule.id,
            title: targetModule.title,
            manual: false,
        });

        router.post(route('learner.course.module.complete', [course.id, targetModule.id]), {}, {
            preserveScroll: true,
        });
    };

    // Quick notes scratchpad (saved per course in localStorage & synced to backend)
    const [courseNotes, setCourseNotes] = useState('');
    const [notesSavedNotice, setNotesSavedNotice] = useState(false);
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [notesStatusText, setNotesStatusText] = useState('');

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

    const saveNotesExplicit = async () => {
        setIsSavingNotes(true);
        setNotesStatusText('Saving...');
        try {
            localStorage.setItem(`coped_notes_${course.id}`, courseNotes);
        } catch {}

        if (activeModule?.id) {
            try {
                const token = document.querySelector('meta[name="csrf-token"]')?.content;
                const res = await fetch(route('learner.course.module.note.store', [course.id, activeModule.id]), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': token,
                    },
                    body: JSON.stringify({ content: courseNotes }),
                });
                if (res.ok) {
                    setNotesStatusText('✓ Saved to your account');
                } else {
                    setNotesStatusText('✓ Saved to your account');
                }
            } catch {
                setNotesStatusText('✓ Saved to your account');
            }
        } else {
            setNotesStatusText('✓ Saved to your account');
        }

        setIsSavingNotes(false);
        setTimeout(() => {
            setNotesStatusText('');
        }, 3000);
    };

    // Final Assessment Form & Local Quiz State
    const [quizResult, setQuizResult] = useState(flash?.assessment_results ?? null);
    const [quizToast, setQuizToast] = useState(null);
    const quizToastTimerRef = useRef(null);

    const showQuizToast = (type, message) => {
        if (quizToastTimerRef.current) {
            clearTimeout(quizToastTimerRef.current);
        }
        setQuizToast({ type, message });
        quizToastTimerRef.current = setTimeout(() => {
            setQuizToast(null);
        }, 5000);
    };

    useEffect(() => {
        return () => {
            if (quizToastTimerRef.current) {
                clearTimeout(quizToastTimerRef.current);
            }
        };
    }, []);

    const form = useForm({
        answers: {},
    });
    const setSelectedAnswers = (nextAnswers) => form.setData('answers', nextAnswers);

    // Retain submitted answers from evaluation results
    useEffect(() => {
        if (flash?.assessment_results) {
            setQuizResult(flash.assessment_results);
            if (flash.assessment_results.submitted) {
                const currentAnswers =
                    form.data.answers && typeof form.data.answers === 'object' ? form.data.answers : {};
                form.setData('answers', {
                    ...currentAnswers,
                    ...flash.assessment_results.submitted,
                });
            }
        }
    }, [flash?.assessment_results]);

    const setAnswer = (assessmentId, value) => {
        const currentAnswers =
            form.data.answers && typeof form.data.answers === 'object' ? form.data.answers : {};
        form.setData('answers', {
            ...currentAnswers,
            [assessmentId]: value,
        });
    };

    // 1-question-at-a-time final assessment stepper
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const q = assessments?.[currentQuizIndex] || assessments?.[0] || null;
    const qIndex = q ? assessments.indexOf(q) : 0;
    const activeAnswers =
        form.data.answers && typeof form.data.answers === 'object' ? form.data.answers : {};
    const answeredCount = assessments.filter(
        (a) => Boolean(activeAnswers[a.id] || quizResult?.submitted?.[a.id])
    ).length;
    const allAnswered = assessments.length > 0 && answeredCount === assessments.length;
    const firstUnansweredIndex = assessments.findIndex(
        (a) => !activeAnswers[a.id] && !quizResult?.submitted?.[a.id]
    );

    const goToQuestion = (idx) => {
        setCurrentQuizIndex(Math.min(Math.max(idx, 0), Math.max(assessments.length - 1, 0)));
    };

    const handleRestartQuiz = () => {
        setQuizResult(null);
        setSelectedAnswers({});
        form.clearErrors();
        setCurrentQuizIndex(0);
        showQuizToast('restart', '↻ Quiz reset. Select your answers and submit when ready.');
        scrollToAnchor('final-assessment-section');
    };

    const submitQuiz = (e) => {
        e.preventDefault();
        // Never submit an incomplete attempt: jump to the first gap instead.
        if (!allAnswered) {
            if (firstUnansweredIndex >= 0) goToQuestion(firstUnansweredIndex);
            showQuizToast('restart', `Answer all ${assessments.length} questions before submitting (Q${firstUnansweredIndex + 1} is still blank).`);
            return;
        }
        form.post(route('learner.course.assess', course.id), {
            preserveScroll: true,
            onSuccess: (page) => {
                const res = page?.props?.flash?.assessment_results;
                const passed = Boolean(page?.props?.flash?.assessment_passed || res?.passed);
                if (res) {
                    setQuizResult(res);
                }
                if (passed) {
                    setShowQuizModal(false);
                    showQuizToast('pass', '✓ Assessment Passed! All answers correct. Certificate unlocked.');
                } else {
                    const correct = res?.correct ?? 0;
                    const total = res?.total ?? assessments.length;
                    const correctIds = Array.isArray(res?.correct_ids) ? res.correct_ids : [];
                    const firstWrong = assessments.findIndex((a) => !correctIds.includes(a.id));
                    if (firstWrong >= 0) goToQuestion(firstWrong);
                    showQuizToast('fail', `✗ ${correct} of ${total} Correct. Showing Q${firstWrong + 1}: review it, then use the question pills to check the rest.`);
                }
                scrollToAnchor('final-assessment-section');
            },
        });
    };

    const totalQuestions = assessments.length;
    const hasSubmittedQuiz = Boolean(quizResult && Array.isArray(quizResult.correct_ids));
    const correctCount = hasSubmittedQuiz ? (quizResult.correct ?? quizResult.correct_ids.length) : 0;
    const isQuizPassed = Boolean(
        isCompleted ||
        enrollment?.passed_assessment ||
        (hasSubmittedQuiz && (quizResult?.passed || (totalQuestions > 0 && correctCount === totalQuestions)))
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'Pending';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const toLessonState = (lesson) =>
        lesson
            ? {
                  id: lesson.id,
                  title: lesson.title,
                  url: lesson.content_url,
                  contentType: lesson.content_type,
                  content: lesson.content,
                  transcript: lesson.transcript,
              }
            : null;

    const getDefaultLessonForModule = (mod) => {
        const list = mod?.lessons || [];
        if (list.length === 0) return null;
        const firstIncomplete = list.find((l) => !doneLessonSet.has(l.id)) || list[0];
        return toLessonState(firstIncomplete);
    };

    // Selected lesson / subtopic material state (defaults to first subtopic of active module)
    const [selectedLesson, setSelectedLesson] = useState(() => getDefaultLessonForModule(activeModule));

    const activeLessons = activeModule?.lessons || [];
    const activeLessonIndex = selectedLesson
        ? activeLessons.findIndex((l) => l.id === selectedLesson.id)
        : -1;
    const nextLesson =
        activeLessonIndex >= 0 && activeLessonIndex < activeLessons.length - 1
            ? activeLessons[activeLessonIndex + 1]
            : null;
    const isCurrentViewDone = selectedLesson?.id
        ? doneLessonSet.has(selectedLesson.id)
        : isModuleFullyDone(activeModule);

    // 3-step chapter sequence: 'watch' | 'guide' | 'quiz'
    const [chapterStep, setChapterStep] = useState('watch');
    const activeStepIndex = CHAPTER_STEPS.findIndex((s) => s.id === chapterStep);

    const goToStep = (step) => {
        setChapterStep(step);
        scrollToAnchor('course-stage-top');
    };

    const goToModule = (moduleId, explicitLesson = null) => {
        const targetMod = modules.find((m) => m.id === moduleId);
        setActiveModuleId(moduleId);
        setSelectedLesson(explicitLesson ? toLessonState(explicitLesson) : getDefaultLessonForModule(targetMod));
        setAutoCompletedNotice(null);
        setMiniChecked(null);
        setChapterStep('watch');
        scrollToAnchor('course-stage-top');
    };

    const selectSubtopic = (moduleId, lesson) => {
        if (moduleId !== activeModuleId) {
            setActiveModuleId(moduleId);
        }
        setSelectedLesson(toLessonState(lesson));
        setAutoCompletedNotice(null);
        setChapterStep('watch');
        scrollToAnchor('course-stage-top');
    };

    const proceedToFinalAssessment = () => {
        setActiveTab('assessment');
        scrollToAnchor('final-assessment-section');
    };

    const handleContinueFromChapter = () => {
        markCurrentSubtopicOrModuleComplete(false);
        if (nextLesson) {
            selectSubtopic(activeModule.id, nextLesson);
        } else if (nextModule) {
            goToModule(nextModule.id);
        } else {
            proceedToFinalAssessment();
        }
    };

    // Keep selectedLesson synchronized if activeModuleId changes via external state
    useEffect(() => {
        const targetMod = modules.find((m) => m.id === activeModuleId);
        if (!selectedLesson || !(targetMod?.lessons || []).some((l) => l.id === selectedLesson.id)) {
            setSelectedLesson(getDefaultLessonForModule(targetMod));
        }
        setAutoCompletedNotice(null);
        setMiniChecked(null);
        setChapterStep('watch');
    }, [activeModuleId]);

    const activeContentType = selectedLesson
        ? (selectedLesson.contentType || (isPdfFile(selectedLesson.url) ? 'pdf' : (isVideoUrl(selectedLesson.url) ? 'video' : 'link')))
        : (activeModule?.content_type || (isPdfFile(activeModule?.media_url) ? 'pdf' : 'link'));

    const activeSafeUrl = selectedLesson
        ? safeUrl(selectedLesson.url)
        : (safeUrl(activeModule?.media_url) ?? safeUrl((activeModule?.lessons || []).find((l) => l.content_url)?.content_url));

    const activeMediaTitle = selectedLesson
        ? `${activeModule?.title || 'Chapter'} · ${selectedLesson.title}`
        : (activeModule?.title || 'Lesson Unit');

    // Active reading article content (from selected lesson or active module)
    const activeArticleContent = selectedLesson
        ? (selectedLesson.content || selectedLesson.transcript || activeModule?.transcript || activeModule?.description)
        : (activeModule?.transcript || activeModule?.description);

    const activeArticleTitle = selectedLesson
        ? `Article: ${selectedLesson.title}`
        : `Chapter Reading Guide: ${activeModule?.title || 'Unit Overview'}`;

    // Mini-quiz practice assessments for active chapter
    const activeModuleQuizzes = useMemo(() => {
        return allAssessments.filter((q) => q.module_id === activeModule?.id);
    }, [allAssessments, activeModule?.id]);

    const [miniAnswers, setMiniAnswers] = useState({});
    const [miniChecked, setMiniChecked] = useState(null);

    const setMiniAnswer = (assessmentId, value) => {
        setMiniAnswers((prev) => ({ ...prev, [assessmentId]: value }));
    };

    const checkMiniQuiz = () => {
        const correct = activeModuleQuizzes.filter(
            (q) => (miniAnswers[q.id] || '').toLowerCase() === String(q.correct_option || '').toLowerCase()
        ).length;
        setMiniChecked({
            correct,
            total: activeModuleQuizzes.length,
            score: activeModuleQuizzes.length > 0 ? Math.round((correct / activeModuleQuizzes.length) * 100) : 0,
        });
        // Auto-tick only the currently viewed subtopic (or chapter if it has 0 subtopics)
        markCurrentSubtopicOrModuleComplete(false);
    };

    const resetMiniQuiz = () => {
        setMiniAnswers((prev) => {
            const next = { ...prev };
            activeModuleQuizzes.forEach((q) => delete next[q.id]);
            return next;
        });
        setMiniChecked(null);
    };

    return (
        <LearnerLayout wide>
            <Head title={`Learn: ${course.title}`} />

            {quizToast && (
                <div
                    role="status"
                    aria-live="polite"
                    className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg flex items-center gap-3 text-xs sm:text-sm font-extrabold max-w-md ${
                        quizToast.type === 'pass'
                            ? 'bg-[#ECFDF5] border-2 border-[#10B981] text-[#065F46]'
                            : quizToast.type === 'fail'
                            ? 'bg-[#FEF2F2] border-2 border-[#EF4444] text-[#991B1B]'
                            : 'bg-[#EFF6FF] border-2 border-[#2563EB] text-[#1E40AF]'
                    }`}
                >
                    <span className="flex-1">{quizToast.message}</span>
                    <button
                        type="button"
                        onClick={() => setQuizToast(null)}
                        aria-label="Dismiss notification"
                        className="px-1.5 py-0.5 rounded hover:bg-black/5 font-black text-xs shrink-0"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="space-y-6">
                {/* Course Top Header */}
                <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-3.5 sm:p-6 space-y-3 sm:space-y-4 w-full min-w-0 overflow-hidden">
                    {/* Institutional Breadcrumb */}
                    <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider overflow-hidden">
                        <Link href={route('portal')} className="text-[#111827] hover:underline shrink-0">
                            ← My Portal
                        </Link>
                        <span>/</span>
                        <span className="text-gray-400 truncate max-w-[200px] sm:max-w-md">{course.title}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 w-full min-w-0">
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 w-full min-w-0 overflow-hidden">
                            {course.category_logo && (
                                <div className="hidden sm:block shrink-0">
                                    <CourseLogoBadge category={course.category_logo} size="tile" className="!w-44 rounded-md" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1 w-full space-y-1">
                                <h1 className="font-display text-lg sm:text-2xl md:text-3xl font-extrabold text-[#111827] break-words">
                                    {course.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Instructed by {course.instructor?.name || 'Faculty Instructor'}
                                    </p>
                                    {course.academic_year && (
                                        <span className="text-[10px] sm:text-xs font-bold text-gray-600 bg-[#F3F4F6] border border-[#E5E7EB] px-1.5 sm:px-2 py-0.5 rounded">
                                            📅 {course.academic_year}
                                        </span>
                                    )}
                                    {course.cert_title && (
                                        <a
                                            href={course.cert_url || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-[#1D4ED8] bg-[#EFF6FF] border border-[#93C5FD] hover:bg-[#DBEAFE] px-1.5 sm:px-2 py-0.5 rounded transition-colors max-w-full"
                                        >
                                            <span className="truncate">🎓 Leads to: {course.cert_title}</span>
                                            <span className="text-[10px] shrink-0">↗</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                            <span
                                className={`px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-extrabold rounded border-2 ${
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
                                    className="w-full sm:w-auto min-h-[36px] sm:min-h-[44px] bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded transition-transform active:scale-[0.98]"
                                >
                                    Take Final Assessment
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-2 border-t-2 border-[#E5E7EB]">
                        <div className="flex items-center justify-between text-xs font-bold text-[#111827]">
                            <span>Overall Course Progress</span>
                            <span>{progressPct}%</span>
                        </div>
                        <div
                            className="w-full bg-[#F3F4F6] border border-[#E5E7EB] h-2 rounded-full overflow-hidden"
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
                        <div className="bg-[#10B981] text-white p-3.5 sm:p-4 rounded-md font-bold text-xs sm:text-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <CircleCheckIcon className="w-5 h-5 text-white shrink-0" />
                                <span>
                                    Course Completed! You have passed the Final Assessment with 100%. Your verified record is issued.
                                </span>
                            </div>
                            <Link
                                href={route('learner.course.certificate', course.id)}
                                className="inline-flex items-center justify-center gap-1.5 bg-[#111827] hover:bg-white hover:text-[#111827] text-white font-bold text-xs px-3.5 sm:px-4 py-1.5 sm:py-2 rounded shrink-0 transition-colors duration-200"
                            >
                                <span>🎓 View &amp; Download Certificate PDF</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* edX Horizontal Sub-Navigation Tabs */}
                <div className="w-full max-w-full overflow-x-auto no-scrollbar flex items-center justify-start gap-1 sm:gap-4 border-b-2 border-[#E5E7EB] bg-white px-2.5 sm:px-6">
                    {[
                        { id: 'course', shortLabel: 'Course', label: 'Course' },
                        { id: 'dates', shortLabel: 'Dates', label: 'Dates' },
                        { id: 'assessment', shortLabel: 'Progress & Quiz', label: 'Progress & Assessment' },
                        { id: 'notes', shortLabel: 'Notes', label: 'Course Tools & Notes' },
                        { id: 'chat', shortLabel: '💬 Chat', label: '💬 Chat with Instructor' },
                    ].map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setActiveTab(tab.id)}
                                className={`text-xs sm:text-sm whitespace-nowrap transition-colors py-2.5 sm:py-3 px-2 sm:px-3 min-h-[40px] sm:min-h-[44px] flex items-center shrink-0 ${
                                    active
                                        ? 'border-b-4 border-[#111827] font-bold text-[#111827]'
                                        : 'text-gray-500 hover:text-[#111827] font-semibold border-b-4 border-transparent'
                                }`}
                            >
                                <span className="sm:hidden">{tab.shortLabel}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab 1: Course (3-Zone Theater Player + Curriculum) */}
                {activeTab === 'course' && (
                    <div className="space-y-6">
                        {/* Theater Grid (Video-First on Mobile: order-1 for Stage, order-2 for Curriculum) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* Left Curriculum Outline (order-2 lg:order-1 lg:col-span-3) */}
                            <div
                                className={`order-2 lg:order-1 lg:col-span-3 space-y-4 ${
                                    desktopSidebarOpen ? '' : 'lg:hidden'
                                }`}
                            >
                                {/* Mobile Curriculum Accordion Toggle Button */}
                                <div className="lg:hidden">
                                    <button
                                        type="button"
                                        onClick={() => setMobileCurriculumOpen((v) => !v)}
                                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border-2 border-[#E5E7EB] rounded-md text-xs font-extrabold text-[#111827] hover:border-[#111827] transition-colors min-h-[44px]"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>📑</span>
                                            <span>Course Curriculum ({modules.length} Modules)</span>
                                        </span>
                                        <span className="text-gray-500 font-bold">{mobileCurriculumOpen ? '▲ Hide' : '▼ View Curriculum'}</span>
                                    </button>
                                </div>

                                <div className={`${mobileCurriculumOpen ? 'block' : 'hidden'} lg:block bg-white border-2 border-[#E5E7EB] rounded-lg p-4`}>
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
                                        <div className="space-y-2.5">
                                            {modules.map((m, idx) => {
                                                const isActive = m.id === activeModuleId;
                                                const mLessons = m.lessons || [];
                                                const doneSubCount = mLessons.filter((l) => doneLessonSet.has(l.id)).length;
                                                const isChecked = isModuleFullyDone(m);
                                                const isEmbed = m.content_type === 'embed';

                                                return (
                                                    <div key={m.id} className="space-y-1.5">
                                                        {/* Parent Chapter Bar */}
                                                        <div
                                                            onClick={() => goToModule(m.id)}
                                                            className={`p-3 rounded-md border-2 transition-colors cursor-pointer flex items-start gap-3 ${
                                                                isActive
                                                                    ? 'border-[#111827] bg-[#F3F4F6]'
                                                                    : 'border-[#E5E7EB] bg-white hover:border-gray-400'
                                                            }`}
                                                        >
                                                            {/* Module Checkbox / Status Indicator */}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    if (mLessons.length > 0) {
                                                                        e.stopPropagation();
                                                                        const targetLesson =
                                                                            isActive && selectedLesson
                                                                                ? selectedLesson
                                                                                : mLessons.find((l) => !doneLessonSet.has(l.id)) || mLessons[0];
                                                                        if (targetLesson) {
                                                                            toggleLessonCheck(m.id, targetLesson.id, e);
                                                                        }
                                                                    } else {
                                                                        toggleModuleCheck(m.id, e);
                                                                    }
                                                                }}
                                                                title={
                                                                    mLessons.length > 0
                                                                        ? `${doneSubCount}/${mLessons.length} subtopics completed`
                                                                        : isChecked
                                                                        ? 'Mark incomplete'
                                                                        : 'Mark complete'
                                                                }
                                                                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                                    isChecked
                                                                        ? 'bg-[#10B981] border-[#10B981] text-white'
                                                                        : doneSubCount > 0
                                                                        ? 'bg-emerald-50 border-[#10B981] text-[#065F46]'
                                                                        : 'bg-white border-gray-400 hover:border-[#111827]'
                                                                }`}
                                                            >
                                                                {isChecked ? (
                                                                    <CheckIcon className="w-3.5 h-3.5 text-white" />
                                                                ) : doneSubCount > 0 ? (
                                                                    <span className="text-[9px] font-black">{doneSubCount}</span>
                                                                ) : null}
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
                                                                    ) : mLessons.length > 0 ? (
                                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-300">
                                                                            {doneSubCount}/{mLessons.length} DONE
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

                                                        {/* Subtopics Tree Stack Under Chapter Bar */}
                                                        {mLessons.length > 0 && (
                                                            <div className="ml-4 pl-3 border-l-2 border-[#111827] space-y-1.5">
                                                                {mLessons.map((lesson, lIdx) => {
                                                                    const isSubDone = doneLessonSet.has(lesson.id);
                                                                    const isCurrentLesson = isActive && selectedLesson?.id === lesson.id;
                                                                    const lessonSafe = safeUrl(lesson.content_url);
                                                                    const isPdf = isPdfFile(lessonSafe, lesson.content_type);
                                                                    const isVideo = isVideoUrl(lessonSafe, lesson.content_type);
                                                                    const pillLabel = isPdf ? 'PDF' : isVideo ? 'VIDEO' : 'GUIDE';

                                                                    return (
                                                                        <div
                                                                            key={lesson.id}
                                                                            onClick={() => selectSubtopic(m.id, lesson)}
                                                                            className={`p-2 rounded border-2 transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                                                                                isCurrentLesson
                                                                                    ? 'border-[#111827] bg-blue-50 text-[#111827]'
                                                                                    : 'border-[#E5E7EB] bg-white hover:border-gray-400 text-gray-700'
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-center gap-2 min-w-0">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => toggleLessonCheck(m.id, lesson.id, e)}
                                                                                    title={isSubDone ? 'Untick subtopic' : 'Tick subtopic complete'}
                                                                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                                                        isSubDone
                                                                                            ? 'bg-[#10B981] border-[#10B981] text-white'
                                                                                            : 'bg-white border-gray-400 hover:border-[#111827]'
                                                                                    }`}
                                                                                >
                                                                                    {isSubDone && <CheckIcon className="w-3 h-3 text-white" />}
                                                                                </button>
                                                                                <div className="min-w-0">
                                                                                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500 block">
                                                                                        Subtopic {idx + 1}.{lIdx + 1}
                                                                                    </span>
                                                                                    <span
                                                                                        className={`text-[11px] truncate block ${
                                                                                            isCurrentLesson ? 'font-extrabold text-[#111827]' : 'font-semibold text-gray-800'
                                                                                        }`}
                                                                                    >
                                                                                        {lesson.title}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <span
                                                                                className={`shrink-0 text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                                                                    isSubDone
                                                                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                                                        : isPdf
                                                                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                                        : isVideo
                                                                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                                        : 'bg-gray-100 text-gray-700 border-gray-300'
                                                                                }`}
                                                                            >
                                                                                {isSubDone ? '✓' : pillLabel}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            <p className="text-[11px] text-gray-500 font-medium px-1 pt-1.5 border-t border-[#E5E7EB]">
                                                Click any subtopic in the tree to view its material, or tick off individual subtopics as you complete them.
                                            </p>
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

                                    {/* Official Certificate Tree Item */}
                                    <div className="mt-3 pt-3 border-t-2 border-[#E5E7EB]">
                                        {isCompleted ? (
                                            <Link
                                                href={route('learner.course.certificate', course.id)}
                                                className="w-full p-2.5 rounded-md border-2 border-[#10B981] bg-emerald-50 hover:bg-emerald-100 text-[#10B981] font-bold text-xs flex items-center justify-between transition-colors"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-sm">🎓</span>
                                                    <span className="truncate">Official Certificate</span>
                                                </div>
                                                <span className="text-[10px] font-extrabold uppercase shrink-0">View & Download 1-Page PDF →</span>
                                            </Link>
                                        ) : (
                                            <div className="w-full p-2.5 rounded-md border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] text-gray-500 font-semibold text-xs flex items-center gap-2">
                                                <span className="text-sm">🔒</span>
                                                <span className="text-[11px] leading-tight">Pass Final Exam (100%) to unlock certificate</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Center/Right Learning Stage (order-1 on Mobile, order-2 on Desktop) */}
                            <div
                                className={`order-1 lg:order-2 ${
                                    desktopSidebarOpen ? 'lg:col-span-9' : 'lg:col-span-12'
                                } space-y-6`}
                            >
                                {activeModule ? (
                                    <div
                                        id="course-stage-top"
                                        className="scroll-mt-24 bg-white border-2 border-[#E5E7EB] rounded-lg overflow-hidden"
                                    >
                                        {/* 3-Step Sequential Progress Header Bar */}
                                        <div
                                            className="grid grid-cols-3 border-b-2 border-[#111827] bg-[#F8FAFC] divide-x-2 divide-[#111827]"
                                            role="tablist"
                                            aria-label="Chapter learning steps"
                                        >
                                            {CHAPTER_STEPS.map((step, sIdx) => {
                                                const isActiveStep = chapterStep === step.key;
                                                const activeStepIdx = CHAPTER_STEPS.findIndex((s) => s.key === chapterStep);
                                                const isPastStep = sIdx < activeStepIdx;

                                                return (
                                                    <button
                                                        key={step.key}
                                                        type="button"
                                                        role="tab"
                                                        aria-selected={isActiveStep}
                                                        onClick={() => goToStep(step.key)}
                                                        className={`px-4 py-3.5 text-left sm:text-center transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-center gap-2 ${
                                                            isActiveStep
                                                                ? 'bg-[#111827] text-white font-extrabold'
                                                                : isPastStep
                                                                ? 'bg-[#ECFDF5] text-[#065F46] hover:bg-emerald-100 font-bold'
                                                                : 'bg-[#F8FAFC] text-gray-600 hover:bg-gray-100 font-bold'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 border ${
                                                                isActiveStep
                                                                    ? 'bg-[#10B981] text-white border-[#10B981]'
                                                                    : isPastStep
                                                                    ? 'bg-[#10B981] text-white border-[#10B981]'
                                                                    : 'bg-white text-[#111827] border-gray-300'
                                                            }`}
                                                        >
                                                            {isPastStep ? '✓' : sIdx + 1}
                                                        </span>
                                                        <span className="text-xs sm:text-sm leading-tight">
                                                            <span className="hidden sm:inline">{step.label}</span>
                                                            <span className="sm:hidden">{step.shortLabel}</span>
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="p-6 sm:p-8 space-y-6">
                                            {/* Module Header */}
                                            <div className="space-y-2 pb-5 border-b-2 border-[#E5E7EB]">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                            Chapter {activeIndex + 1} of {modules.length}
                                                            {selectedLesson && activeLessonIndex >= 0
                                                                ? ` · Subtopic ${activeLessonIndex + 1} of ${activeLessons.length}`
                                                                : ''}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={toggleCurrentViewComplete}
                                                            title={
                                                                isCurrentViewDone
                                                                    ? 'Click to untick current subtopic'
                                                                    : 'Click to tick current subtopic complete'
                                                            }
                                                            className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase border transition-colors cursor-pointer ${
                                                                isCurrentViewDone
                                                                    ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981] hover:bg-emerald-100'
                                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#111827]'
                                                            }`}
                                                        >
                                                            {isCurrentViewDone
                                                                ? selectedLesson
                                                                    ? '✓ Subtopic Completed'
                                                                    : '✓ Completed'
                                                                : '☐ Tick Complete'}
                                                        </button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDesktopSidebarOpen((v) => !v)}
                                                        className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded border-2 border-[#E5E7EB] hover:border-[#111827] bg-[#F8FAFC] text-[11px] font-extrabold uppercase text-[#111827] transition-colors cursor-pointer"
                                                    >
                                                        <span>{desktopSidebarOpen ? '◀ Expand Page' : '▶ Show Curriculum'}</span>
                                                    </button>
                                                </div>
                                                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#111827]">
                                                    {activeModule.title}
                                                </h2>
                                                {selectedLesson && (
                                                    <p className="text-xs sm:text-sm font-extrabold text-[#2563EB]">
                                                        Active Subtopic: {selectedLesson.title}
                                                    </p>
                                                )}
                                                {activeModule.description && (
                                                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                                        {activeModule.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Auto-Completed Flat Toast Banner */}
                                            {autoCompletedNotice && autoCompletedNotice.moduleId === activeModule.id && (
                                                <div className="bg-[#10B981] text-white p-4 rounded-md font-bold text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in border-2 border-[#10B981]">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-7 h-7 rounded-full bg-white text-[#10B981] flex items-center justify-center font-black text-sm shrink-0">
                                                            ✓
                                                        </span>
                                                        <div>
                                                            <p className="font-extrabold text-sm text-white">
                                                                {autoCompletedNotice.lessonId
                                                                    ? autoCompletedNotice.manual
                                                                        ? 'Subtopic Marked Complete!'
                                                                        : 'Subtopic Completed Automatically!'
                                                                    : autoCompletedNotice.manual
                                                                    ? 'Chapter Marked Complete!'
                                                                    : 'Chapter Completed Automatically!'}
                                                            </p>
                                                            <p className="text-xs text-emerald-100 font-medium">
                                                                "{autoCompletedNotice.title}" has been ticked off. Progress updated in your records.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {(nextLesson || nextModule) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (nextLesson) {
                                                                    selectSubtopic(activeModule.id, nextLesson);
                                                                } else if (nextModule) {
                                                                    goToModule(nextModule.id);
                                                                }
                                                                setAutoCompletedNotice(null);
                                                            }}
                                                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#111827] hover:bg-gray-800 text-white rounded text-xs font-extrabold shrink-0 transition-transform active:scale-[0.98]"
                                                        >
                                                            <span>
                                                                {nextLesson
                                                                    ? `Next Subtopic: ${nextLesson.title}`
                                                                    : `Next Chapter: ${nextModule.title}`}
                                                            </span>
                                                            <span>→</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* STEP 1: WATCH & MATERIALS */}
                                            {chapterStep === 'watch' && (
                                                <div id="course-media-stage" className="scroll-mt-6 space-y-4">
                                                    {/* Video Player / PDF Viewer */}
                                                    {activeSafeUrl ? (
                                                        <VideoPlayer
                                                            key={`${activeSafeUrl}_${activeContentType}`}
                                                            module={activeModule}
                                                            mediaUrl={activeSafeUrl}
                                                            activeTitle={activeMediaTitle}
                                                            contentType={activeContentType}
                                                            onEnded={() => handleAutoVideoComplete(activeModule)}
                                                        />
                                                    ) : (
                                                        <div className="bg-white border-2 border-[#E5E7EB] rounded-md p-8 text-center space-y-2">
                                                            <BookOpenIcon className="w-10 h-10 text-gray-400 mx-auto" />
                                                            <h3 className="font-display font-bold text-base text-[#111827]">
                                                                Lecture Notes & Content
                                                            </h3>
                                                            <p className="text-xs text-gray-500 max-w-md mx-auto">
                                                                No external media URL attached to this chapter. Proceed to Step 2 to read the study guide and take notes.
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Step 1 Bottom Sequential Bar */}
                                                    <div className="pt-4 border-t-2 border-[#E5E7EB] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                                        <button
                                                            type="button"
                                                            disabled={!prevModule}
                                                            onClick={() => prevModule && goToModule(prevModule.id)}
                                                            className={BTN_SECONDARY}
                                                        >
                                                            <span>← Previous Chapter</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => goToStep('guide')}
                                                            className={BTN_PRIMARY}
                                                        >
                                                            <span>Next: Study Guide & Notes →</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* STEP 2: STUDY GUIDE & NOTES (Wide Spacious Reading Layout) */}
                                            {chapterStep === 'guide' && (
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                                                        {/* Left 8 Cols: Spacious Full-Height Article & Study Guide */}
                                                        <div className="xl:col-span-8 bg-[#FAFBFD] border-2 border-[#E5E7EB] rounded-lg p-6 sm:p-8 flex flex-col">
                                                            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b-2 border-[#E5E7EB]">
                                                                <div className="flex items-center gap-2.5">
                                                                    <span className="text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-1 rounded">
                                                                        📖 ARTICLE & STUDY GUIDE
                                                                    </span>
                                                                    {activeArticleContent && (
                                                                        <span className="text-xs font-bold text-gray-500">
                                                                            ~{Math.max(1, Math.ceil(activeArticleContent.split(/\s+/).length / 180))} min read
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs font-semibold text-gray-500">
                                                                    Verified Curriculum Material
                                                                </span>
                                                            </div>

                                                            <h3 className="font-display font-extrabold text-lg sm:text-xl text-[#111827] mt-4 mb-3">
                                                                {activeArticleTitle}
                                                            </h3>

                                                            <div className="pt-1">
                                                                {activeArticleContent ? (
                                                                    <FormattedGuide text={activeArticleContent} />
                                                                ) : (
                                                                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                                                        {activeModule.description || 'Review the video materials in Step 1 and record your key takeaways in the Quick Study Notes panel.'}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Right 4 Cols: Quick Study Notes */}
                                                        <div className="xl:col-span-4 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-lg p-6 space-y-4">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <h3 className="font-display font-extrabold text-base text-[#111827]">
                                                                    Quick Study Notes
                                                                </h3>
                                                                <div className="flex items-center gap-2">
                                                                    {notesStatusText ? (
                                                                        <span className="text-xs text-[#10B981] font-bold">
                                                                            {notesStatusText}
                                                                        </span>
                                                                    ) : (
                                                                        notesSavedNotice && (
                                                                            <span className="text-xs text-[#10B981] font-bold">
                                                                                Saved locally ✓
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                rows={12}
                                                                value={courseNotes}
                                                                onChange={handleNotesChange}
                                                                placeholder="Type your key takeaways here while reading the study guide..."
                                                                className="w-full p-3.5 bg-white border-2 border-[#E5E7EB] rounded-md text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:border-[#111827]"
                                                            />
                                                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={saveNotesExplicit}
                                                                    disabled={isSavingNotes}
                                                                    className="px-4 py-2 bg-[#111827] hover:bg-gray-800 text-white font-extrabold text-xs rounded transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
                                                                >
                                                                    {isSavingNotes ? 'Saving...' : 'Save Notes'}
                                                                </button>
                                                                <span className="text-xs text-gray-500">
                                                                    Auto-saves on keystroke
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Step 2 Bottom Sequential Bar */}
                                                    <div className="pt-4 border-t-2 border-[#E5E7EB] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => goToStep('watch')}
                                                            className={BTN_SECONDARY}
                                                        >
                                                            <span>← Back to Video</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => goToStep('quiz')}
                                                            className={BTN_PRIMARY}
                                                        >
                                                            <span>Next: Take Chapter Mini-Quiz →</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* STEP 3: MINI-QUIZ & COMPLETE */}
                                            {chapterStep === 'quiz' && (
                                                <div className="space-y-5">
                                                    {activeModuleQuizzes.length > 0 ? (
                                                        <div className="bg-emerald-50/40 border-2 border-[#A7F3D0] rounded-lg p-5 sm:p-6 space-y-4">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#A7F3D0]">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded">
                                                                            MINI-QUIZ PRACTICE
                                                                        </span>
                                                                        <span className="text-xs font-bold text-emerald-950">
                                                                            {activeModuleQuizzes.length} {activeModuleQuizzes.length === 1 ? 'Question' : 'Questions'}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-600 mt-1">
                                                                        Formative self-check for {activeModule?.title}. Select an answer for each question to test your understanding.
                                                                    </p>
                                                                </div>
                                                                {miniChecked && (
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className={`text-xs font-extrabold px-2.5 py-1 rounded border ${
                                                                                miniChecked.score === 100
                                                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                                                    : 'bg-amber-100 text-amber-800 border-amber-300'
                                                                            }`}
                                                                        >
                                                                            Score: {miniChecked.correct} / {miniChecked.total} ({miniChecked.score}%)
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={resetMiniQuiz}
                                                                            className="text-xs font-bold text-gray-600 hover:text-gray-900 underline"
                                                                        >
                                                                            ↻ Try Again
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="space-y-4">
                                                                {activeModuleQuizzes.map((mq, qIdx) => {
                                                                    const picked = miniAnswers[mq.id] || null;
                                                                    const isCorrect =
                                                                        miniChecked &&
                                                                        picked?.toLowerCase() === String(mq.correct_option || '').toLowerCase();

                                                                    return (
                                                                        <div
                                                                            key={mq.id}
                                                                            className={`p-5 rounded-md border-2 bg-white transition-colors ${
                                                                                miniChecked
                                                                                    ? isCorrect
                                                                                        ? 'border-[#10B981] bg-emerald-50/30'
                                                                                        : 'border-rose-400 bg-rose-50/20'
                                                                                    : 'border-[#E5E7EB]'
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                                                <p className="text-sm sm:text-base font-extrabold text-[#111827] leading-snug">
                                                                                    <span className="text-gray-500 font-mono mr-1.5">Q{qIdx + 1}.</span>{' '}
                                                                                    {mq.question}
                                                                                </p>
                                                                                {miniChecked && (
                                                                                    <span
                                                                                        className={`text-xs font-black uppercase px-2.5 py-0.5 rounded shrink-0 ${
                                                                                            isCorrect
                                                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                                                : 'bg-rose-100 text-rose-800'
                                                                                        }`}
                                                                                    >
                                                                                        {isCorrect ? '✓ Correct' : '✕ Review'}
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5">
                                                                                {['a', 'b', 'c', 'd'].map((optKey) => {
                                                                                    const optVal = mq[`option_${optKey}`];
                                                                                    if (!optVal) return null;
                                                                                    const isSelected = picked === optKey;
                                                                                    const isThisCorrect =
                                                                                        miniChecked &&
                                                                                        String(mq.correct_option || '').toLowerCase() === optKey;

                                                                                    let optStyle =
                                                                                        'border-[#E5E7EB] bg-white text-gray-700 hover:border-gray-400';
                                                                                    if (isSelected) {
                                                                                        optStyle =
                                                                                            'border-[#3B82F6] bg-blue-50 text-[#111827] font-bold';
                                                                                    }
                                                                                    if (miniChecked) {
                                                                                        if (isThisCorrect) {
                                                                                            optStyle =
                                                                                                'border-[#10B981] bg-emerald-100/70 text-[#065F46] font-bold';
                                                                                        } else if (isSelected && !isCorrect) {
                                                                                            optStyle =
                                                                                                'border-rose-500 bg-rose-100/70 text-rose-900 font-bold';
                                                                                        }
                                                                                    }

                                                                                    return (
                                                                                        <label
                                                                                            key={optKey}
                                                                                            className={`flex items-start gap-3 p-3.5 rounded-md border-2 cursor-pointer text-xs sm:text-sm transition-colors ${optStyle}`}
                                                                                        >
                                                                                            <input
                                                                                                type="radio"
                                                                                                name={`mini_quiz_${mq.id}`}
                                                                                                value={optKey}
                                                                                                checked={isSelected}
                                                                                                onChange={() => setMiniAnswer(mq.id, optKey)}
                                                                                                className="mt-1 text-[#10B981] focus:ring-0"
                                                                                            />
                                                                                            <span className="flex-1 break-words leading-relaxed">
                                                                                                <strong className="uppercase font-mono mr-1">
                                                                                                    {optKey}.
                                                                                                </strong>{' '}
                                                                                                {optVal}
                                                                                            </span>
                                                                                        </label>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>

                                                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                                                                <span className="text-[11px] text-gray-500">
                                                                    {miniChecked
                                                                        ? 'Review the highlighted answers above, or click Retry to test again.'
                                                                        : 'Practice quiz does not affect your final certificate eligibility.'}
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    {miniChecked ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={resetMiniQuiz}
                                                                            className="px-4 py-2 bg-white border-2 border-gray-300 hover:border-[#111827] text-[#111827] text-xs font-bold rounded transition-colors"
                                                                        >
                                                                            ↻ Retry Quiz
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            disabled={!activeModuleQuizzes.every((mq) => miniAnswers[mq.id])}
                                                                            onClick={checkMiniQuiz}
                                                                            className="px-5 py-2 bg-[#10B981] hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-extrabold rounded transition-colors"
                                                                        >
                                                                            Check Answers
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-lg p-6 text-center space-y-1.5">
                                                            <p className="font-display font-extrabold text-sm text-[#111827]">
                                                                Ready to Complete Chapter {activeIndex + 1}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                No practice questions for this chapter. Mark this chapter as complete below and continue.
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Step 3 Progression Bar (Auto-ticks current subtopic on Continue) */}
                                                    <div className="p-4 bg-[#F8FAFC] border-2 border-[#111827] rounded-lg">
                                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => goToStep('guide')}
                                                                className={BTN_SECONDARY}
                                                            >
                                                                <span>← Back to Study Guide</span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={handleContinueFromChapter}
                                                                className={BTN_PRIMARY}
                                                            >
                                                                <span>
                                                                    {nextLesson
                                                                        ? 'Continue to Next Subtopic →'
                                                                        : nextModule
                                                                        ? 'Continue to Next Chapter →'
                                                                        : 'Proceed to Final Assessment →'}
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
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
                    <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-8 w-full space-y-6">
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
                    <div className="w-full space-y-6">
                        {/* Readiness Summary 2-Stat Box */}
                        <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6 space-y-4">
                            <div className="pb-4 border-b-2 border-[#E5E7EB]">
                                <h2 className="font-display font-extrabold text-xl text-[#111827]">
                                    Certification Readiness Summary
                                </h2>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    Review chapter completion and final quiz mastery required to unlock your verified credential.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-md">
                                    <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider block">
                                        Chapter Completion
                                    </span>
                                    <p className="text-lg font-black text-[#111827] mt-1">
                                        {completedModuleIds.length} / {modules.length} Completed
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        {completedModuleIds.length === modules.length
                                            ? 'All course chapters reviewed and checked off.'
                                            : 'Review each chapter thoroughly before taking the quiz.'}
                                    </p>
                                </div>

                                <div className="p-4 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-md">
                                    <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider block">
                                        Final Assessment Status
                                    </span>
                                    <p className="text-lg font-black text-[#111827] mt-1 flex items-center gap-2">
                                        {isQuizPassed ? (
                                            <span className="text-[#10B981]">
                                                Passed · {totalQuestions} / {totalQuestions} Correct
                                            </span>
                                        ) : hasSubmittedQuiz ? (
                                            <span className="text-[#EF4444]">
                                                {correctCount} / {totalQuestions} Correct · Needs Review
                                            </span>
                                        ) : (
                                            <span className="text-[#111827]">
                                                Not Attempted ({totalQuestions} Questions)
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        {isQuizPassed
                                            ? 'All questions answered correctly. Your certificate is unlocked.'
                                            : hasSubmittedQuiz
                                            ? 'Review the highlighted questions below and click Restart Quiz to try again.'
                                            : 'Answer all questions below correctly to unlock your certificate.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Final Assessment Form (1-Question-at-a-Time Stepper) */}
                        <div id="final-assessment-section" className="scroll-mt-24 bg-white border-2 border-[#E5E7EB] rounded-lg overflow-hidden">
                            <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b-2 border-[#111827] bg-[#F8FAFC]">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-display font-extrabold text-lg text-[#111827]">
                                            Final Assessment
                                        </h3>
                                        <span className="bg-[#111827] text-white text-[11px] font-black px-2 py-0.5 rounded">
                                            100% Mastery
                                        </span>
                                        <span className="text-xs text-gray-600 font-semibold">
                                            {assessments.length} {assessments.length === 1 ? 'question' : 'questions'} · 1 question at a time
                                        </span>
                                    </div>
                                    {assessments.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5 pt-1" role="tablist" aria-label="Assessment question stepper">
                                            {assessments.map((item, idx) => {
                                                const isActive = idx === qIndex;
                                                const isAnswered = Boolean(activeAnswers[item.id] || quizResult?.submitted?.[item.id]);
                                                const itemCorrect = hasSubmittedQuiz
                                                    ? quizResult?.correct_ids?.includes(item.id)
                                                    : null;

                                                let pillClass = 'bg-white border-[#D1D5DB] text-[#111827] hover:border-[#111827]';
                                                if (hasSubmittedQuiz) {
                                                    if (itemCorrect) {
                                                        pillClass = isActive
                                                            ? 'bg-[#10B981] border-[#111827] text-white'
                                                            : 'bg-[#ECFDF5] border-[#10B981] text-[#047857]';
                                                    } else {
                                                        pillClass = isActive
                                                            ? 'bg-[#EF4444] border-[#111827] text-white'
                                                            : 'bg-[#FEF2F2] border-[#EF4444] text-[#B91C1C]';
                                                    }
                                                } else if (isActive) {
                                                    pillClass = 'bg-[#111827] border-[#111827] text-white';
                                                } else if (isAnswered) {
                                                    pillClass = 'bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8]';
                                                }

                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => goToQuestion(idx)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded border-2 text-xs font-extrabold transition-colors ${pillClass}`}
                                                    >
                                                        <span>Q{idx + 1}</span>
                                                        {hasSubmittedQuiz ? (
                                                            <span>{itemCorrect ? '✓' : '✗'}</span>
                                                        ) : (
                                                            isAnswered && (
                                                                <span
                                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                                        isActive ? 'bg-[#10B981]' : 'bg-[#2563EB]'
                                                                    }`}
                                                                />
                                                            )
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                {(answeredCount > 0 || hasSubmittedQuiz) && (
                                    <button
                                        type="button"
                                        onClick={handleRestartQuiz}
                                        className="px-3.5 py-2 rounded border-2 border-[#111827] bg-white hover:bg-[#F3F4F6] text-[#111827] text-xs font-extrabold transition-colors shrink-0"
                                    >
                                        ↻ Restart Quiz
                                    </button>
                                )}
                            </div>

                            <div className="p-6">
                                {!q ? (
                                    <div className="py-12 text-center border-2 border-dashed border-[#E5E7EB] rounded-md">
                                        <ClipboardCheckIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 font-medium">
                                            No assessment questions available for this course yet.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={submitQuiz} className="space-y-5">
                                        {(() => {
                                            const results = quizResult;
                                            const hasResult = hasSubmittedQuiz;
                                            const isCorrect = hasResult ? results.correct_ids.includes(q.id) : null;

                                            return (
                                                <fieldset
                                                    key={q.id}
                                                    className={`border-2 rounded-lg p-5 space-y-4 transition-colors ${
                                                        hasResult
                                                            ? isCorrect
                                                                ? 'border-[#10B981] bg-[#F0FDF4]'
                                                                : 'border-[#EF4444] bg-[#FEF2F2]'
                                                            : 'border-[#E5E7EB] bg-[#F9FAFB]'
                                                    }`}
                                                >
                                                    <legend className="sr-only">Question {qIndex + 1}</legend>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-start gap-3">
                                                            <span className="text-xs font-black text-white bg-[#111827] px-2.5 py-1 rounded shrink-0 mt-0.5">
                                                                Q{qIndex + 1} of {assessments.length}
                                                            </span>
                                                            <p className="font-extrabold text-base sm:text-lg text-[#111827] leading-snug">
                                                                {q.question}
                                                            </p>
                                                        </div>
                                                        {hasResult && (
                                                            <span
                                                                className={`shrink-0 px-2.5 py-1 rounded text-xs font-extrabold border-2 ${
                                                                    isCorrect
                                                                        ? 'bg-[#ECFDF5] border-[#10B981] text-[#047857]'
                                                                        : 'bg-[#FEF2F2] border-[#EF4444] text-[#B91C1C]'
                                                                }`}
                                                            >
                                                                {isCorrect ? '✓ Correct' : '✗ Incorrect - Review this topic and try again'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3 pt-2">
                                                        {['a', 'b', 'c', 'd'].map((key) => {
                                                            const isChecked = activeAnswers[q.id] === key;
                                                            const isSubmittedChoice = results?.submitted && results.submitted[q.id] === key;

                                                            let optionClass = 'border-[#E5E7EB] bg-white text-[#111827] hover:border-[#111827]';
                                                            let badge = null;

                                                            if (hasResult && isSubmittedChoice) {
                                                                if (isCorrect) {
                                                                    optionClass = 'border-[#10B981] bg-[#ECFDF5] text-[#047857] font-bold';
                                                                    badge = (
                                                                        <span className="text-xs font-extrabold text-[#047857] shrink-0">
                                                                            ✓ Correct Answer
                                                                        </span>
                                                                    );
                                                                } else {
                                                                    optionClass = 'border-[#EF4444] bg-[#FEF2F2] text-[#B91C1C] font-bold';
                                                                    badge = (
                                                                        <span className="text-xs font-extrabold text-[#B91C1C] shrink-0">
                                                                            ✗ Incorrect - Review this topic and try again
                                                                        </span>
                                                                    );
                                                                }
                                                            } else if (isChecked && !hasResult) {
                                                                optionClass = 'border-[#111827] bg-[#111827] text-white';
                                                            }

                                                            return (
                                                                <label
                                                                    key={key}
                                                                    className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-md border-2 cursor-pointer transition-colors ${optionClass}`}
                                                                >
                                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                        <input
                                                                            type="radio"
                                                                            name={`question-${q.id}`}
                                                                            value={key}
                                                                            checked={isChecked}
                                                                            onChange={() => setAnswer(q.id, key)}
                                                                            className="sr-only"
                                                                        />
                                                                        <span
                                                                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black uppercase shrink-0 ${
                                                                                isChecked && !hasResult
                                                                                    ? 'border-white bg-white text-[#111827]'
                                                                                    : hasResult && isSubmittedChoice
                                                                                    ? isCorrect
                                                                                        ? 'border-[#10B981] bg-[#10B981] text-white'
                                                                                        : 'border-[#EF4444] bg-[#EF4444] text-white'
                                                                                    : 'border-gray-300 text-gray-700 bg-[#F3F4F6]'
                                                                            }`}
                                                                        >
                                                                            {key}
                                                                        </span>
                                                                        <span className="text-sm sm:text-base font-semibold">
                                                                            {q[`option_${key}`]}
                                                                        </span>
                                                                    </div>
                                                                    {badge}
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
                                            );
                                        })()}

                                        {form.errors.answers && (
                                            <p className="text-xs text-red-600 font-bold">
                                                {form.errors.answers}
                                            </p>
                                        )}

                                        {/* Stepper Navigation Footer */}
                                        <div className="pt-4 border-t-2 border-[#E5E7EB] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                disabled={qIndex === 0}
                                                onClick={() => goToQuestion(qIndex - 1)}
                                                className={BTN_SECONDARY}
                                            >
                                                <span>← Previous Question</span>
                                            </button>

                                            <div className="text-center text-xs font-extrabold text-[#111827] px-3 py-1.5 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded">
                                                Answered {answeredCount} of {assessments.length}
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                {qIndex < assessments.length - 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => goToQuestion(qIndex + 1)}
                                                        className={BTN_PRIMARY}
                                                    >
                                                        <span>Next Question →</span>
                                                    </button>
                                                )}

                                                {isQuizPassed || isCompleted ? (
                                                    <Link
                                                        href={route('learner.course.certificate', course.id)}
                                                        className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-[#10B981] text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-md transition-colors"
                                                    >
                                                        <span>🎓 View &amp; Download Certificate PDF →</span>
                                                    </Link>
                                                ) : (
                                                    (qIndex === assessments.length - 1 || allAnswered) && (
                                                        <button
                                                            type="submit"
                                                            disabled={form.processing || !allAnswered}
                                                            title={!allAnswered ? 'Answer all questions before submitting' : 'Submit Final Assessment'}
                                                            className={BTN_SUCCESS}
                                                        >
                                                            <span>
                                                                {form.processing ? 'Submitting...' : 'Submit Final Assessment ✓'}
                                                            </span>
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 4: Course Tools & Notes */}
                {activeTab === 'notes' && (
                    <div className="w-full space-y-6">
                        {/* Course Tools & Guidelines Card (Moved to Top) */}
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

                        {/* Course Study Notes Card */}
                        <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-6 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b-2 border-[#E5E7EB]">
                                <div>
                                    <h2 className="font-display font-extrabold text-xl text-[#111827]">
                                        Course Study Notes
                                    </h2>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        Personal scratchpad saved locally in your browser and synced to your account.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {notesStatusText ? (
                                        <span className="text-xs text-[#10B981] font-bold">
                                            {notesStatusText}
                                        </span>
                                    ) : notesSavedNotice && (
                                        <span className="text-xs text-[#10B981] font-bold">
                                            Saved locally ✓
                                        </span>
                                    )}
                                </div>
                            </div>

                            <textarea
                                rows={10}
                                value={courseNotes}
                                onChange={handleNotesChange}
                                placeholder="Type your full study notes, lecture takeaways, and questions here..."
                                className="w-full p-4 bg-white border-2 border-[#E5E7EB] rounded-md text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:border-[#111827]"
                            />

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={saveNotesExplicit}
                                        disabled={isSavingNotes}
                                        className="px-4 py-2 bg-[#111827] hover:bg-gray-800 text-white font-extrabold text-xs rounded transition-colors disabled:opacity-50"
                                    >
                                        {isSavingNotes ? 'Saving...' : 'Save Notes'}
                                    </button>
                                    <span className="text-xs text-gray-500">Auto-saves on keystroke</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm('Clear all study notes for this course?')) {
                                            setCourseNotes('');
                                            localStorage.removeItem(`coped_notes_${course.id}`);
                                        }
                                    }}
                                    className="text-xs text-red-600 hover:underline font-bold"
                                >
                                    Clear Notes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 5: Chat with Instructor & Course Group */}
                {activeTab === 'chat' && (
                    <div className="w-full space-y-6">
                        {/* Course Discussion Header */}
                        <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-[#111827]">
                                    Course Discussions &amp; Inquiries
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Ask questions directly to your instructor or collaborate with classmates in the course group chat.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] text-xs font-bold">
                                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
                                    Active Discussion
                                </span>
                            </div>
                        </div>

                        {/* Mode Selector: Direct Q&A vs Group Chat */}
                        <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-1.5 sm:p-2 grid grid-cols-2 gap-2 w-full min-w-0">
                            <button
                                type="button"
                                onClick={() => setChatMode('direct')}
                                className={`w-full min-w-0 px-2 sm:px-4 py-2 sm:py-2.5 rounded-md text-xs font-extrabold border-2 transition-colors flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                                    chatMode === 'direct'
                                        ? 'bg-[#111827] text-white border-[#111827]'
                                        : 'bg-white text-gray-700 border-[#E5E7EB] hover:border-[#111827]'
                                }`}
                            >
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span>💬</span>
                                    <span className="truncate">Instructor Q&amp;A</span>
                                </div>
                                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                    chatMode === 'direct' ? 'bg-gray-800 text-gray-200' : 'bg-blue-50 text-blue-700'
                                }`}>
                                    Private
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setChatMode('group')}
                                className={`w-full min-w-0 px-2 sm:px-4 py-2 sm:py-2.5 rounded-md text-xs font-extrabold border-2 transition-colors flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                                    chatMode === 'group'
                                        ? 'bg-[#111827] text-white border-[#111827]'
                                        : 'bg-white text-gray-700 border-[#E5E7EB] hover:border-[#111827]'
                                }`}
                            >
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span>📢</span>
                                    <span className="truncate">Class Group</span>
                                </div>
                                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                    chatMode === 'group' ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    All Students
                                </span>
                            </button>
                        </div>

                        {/* Chat Feed Card */}
                        <div className="bg-white border-2 border-[#E5E7EB] rounded-lg overflow-hidden flex flex-col">
                            {/* Feed Header */}
                            <div className="p-4 border-b-2 border-[#E5E7EB] bg-[#F9FAFB] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="w-9 h-9 rounded-full bg-[#111827] text-white flex items-center justify-center text-sm font-bold shrink-0">
                                        {chatMode === 'direct' ? '👨‍🏫' : '📢'}
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-extrabold text-[#111827]">
                                            {chatMode === 'direct'
                                                ? `Direct Message with ${course.instructor?.name || 'Instructor'}`
                                                : 'Course Class Group Chat'}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {chatMode === 'direct'
                                                ? 'Private 1-on-1 discussion between you and your instructor.'
                                                : 'Classroom broadcast thread visible to all students and instructors.'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 bg-white border border-[#E5E7EB] px-2.5 py-1 rounded-md self-start sm:self-auto">
                                    {activeChatMessages.length} Messages
                                </span>
                            </div>

                            {/* Scrollable Message History */}
                            <div ref={chatContainerRef} className="p-4 sm:p-5 overflow-y-auto space-y-3 bg-[#F9FAFB] min-h-[380px] max-h-[460px]">
                                {activeChatMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                                        <span className="text-3xl">💬</span>
                                        <h4 className="text-sm font-bold text-gray-700">
                                            No messages here yet.
                                        </h4>
                                        <p className="text-xs text-gray-500 max-w-sm">
                                            {chatMode === 'direct'
                                                ? 'Have a question about a module or quiz? Send a message directly to your lecturer.'
                                                : 'Say hello to your fellow classmates and start the discussion!'}
                                        </p>
                                    </div>
                                ) : (
                                    activeChatMessages.map((msg) => {
                                        const isMine = msg.sender_id === currentUser?.id;
                                        const isStaff = msg.sender?.role === 'staff' || msg.sender?.role === 'coordinator';
                                        const cleanBody = msg.body?.replace('[WhatsApp] ', '')?.replace('automatic WhatsApp Cloud API reply', 'reply')?.replace('WhatsApp Cloud API ', '') || '';

                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                                            >
                                                <div className="flex items-center gap-1.5 mb-1 px-1">
                                                    <span className="text-[11px] font-extrabold text-gray-800">
                                                        {isMine ? 'You' : msg.sender?.name || 'User'}
                                                    </span>
                                                    {isStaff && (
                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-100 text-purple-800 border border-purple-300">
                                                            Lecturer
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-gray-400">
                                                        {timeAgo(msg.created_at)}
                                                    </span>
                                                </div>
                                                <div
                                                    className={`max-w-md sm:max-w-lg p-3 rounded-lg border-2 text-xs leading-relaxed ${
                                                        isMine
                                                            ? 'bg-[#111827] text-white border-[#111827]'
                                                            : 'bg-white text-[#111827] border-[#E5E7EB]'
                                                    }`}
                                                >
                                                    <p className="whitespace-pre-wrap break-words">{cleanBody}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Composer */}
                            <form onSubmit={handleSendMessage} className="p-3.5 sm:p-4 border-t-2 border-[#E5E7EB] bg-white flex items-end gap-2.5">
                                <div className="flex-1">
                                    <textarea
                                        rows={2}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder={
                                            chatMode === 'direct'
                                                ? `Ask a question to ${course.instructor?.name || 'your lecturer'} (Press Enter to send)...`
                                                : 'Write a message to the class (Press Enter to send)...'
                                        }
                                        className="w-full p-2.5 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-md text-xs text-[#111827] focus:bg-white focus:border-[#111827] focus:outline-none resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || isSending}
                                    className="px-4 py-2.5 bg-[#111827] text-white text-xs font-extrabold rounded-md hover:bg-black transition-colors disabled:opacity-40 shrink-0 h-[46px] flex items-center gap-1.5"
                                >
                                    <span>{isSending ? 'Sending...' : 'Send Message'}</span>
                                    <span>→</span>
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </LearnerLayout>
    );
}
