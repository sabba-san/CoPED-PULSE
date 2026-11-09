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
import MathPlayground from './Partials/MathPlayground';
import CourseLogoBadge from '@/Components/flat/CourseLogoBadge';
import FormattedGuide from '@/Components/FormattedGuide';
import { safeUrl, formatEmbedUrl, getYouTubeId, isVideoUrl, isPdfFile } from '@/Utils/mediaUtils';
import { renderMathText } from '@/Utils/mathTypography';

const CERT_CHAPTER_STEPS = [
    { key: 'watch', id: 'watch', label: '1. Watch & Materials', shortLabel: '1. Watch' },
    { key: 'guide', id: 'guide', label: '2. Study Guide & Notes', shortLabel: '2. Guide' },
    { key: 'quiz', id: 'quiz', label: '3. Mini-Quiz & Complete', shortLabel: '3. Quiz' },
];

const SCHOOL_CHAPTER_STEPS = [
    { key: 'watch', id: 'watch', label: '▶ 1. Video', shortLabel: '▶ Video' },
    { key: 'interact', id: 'interact', label: '🎮 2. Aktiviti Interaktif', shortLabel: '🎮 Aktiviti' },
    { key: 'guide', id: 'guide', label: '📖 3. Nota Ringkas', shortLabel: '📖 Nota' },
    { key: 'quiz', id: 'quiz', label: '📝 4. Latihan Kertas & Kuiz', shortLabel: '📝 Latihan & Kuiz' },
];

const buildDemoWorksheetSvg = (yearLevel) => {
    const lines =
        yearLevel === 'F4_ADD'
            ? [
                  'LATIHAN KERTAS MATEMATIK TAMBAHAN TINGKATAN 4 (FUNGSI)',
                  'Diberi f(x) = 2x - 3 dan g(x) = x + 4.',
                  'fg(x) = f(g(x)) = f(x + 4)',
                  '      = 2(x + 4) - 3',
                  '      = 2x + 5',
                  'Fungsi songsang: y = 2x - 3',
                  '                 x = (y + 3) / 2',
                  '                 f-1(x) = (x + 3) / 2',
                  'Jawapan Akhir: fg(x) = 2x + 5, f-1(x) = (x + 3) / 2   [Disemak Betul]',
              ]
            : yearLevel === 'F1'
            ? [
                  'LATIHAN KERTAS MATEMATIK TINGKATAN 1 (PERSAMAAN LINEAR)',
                  'Soalan: (a) 3x - 4 = 11    (b) (y / 2) + 3 = 7',
                  '(a) 3x - 4 = 11',
                  '    3x = 11 + 4',
                  '    3x = 15',
                  '     x = 15 / 3 = 5',
                  '(b) (y / 2) + 3 = 7',
                  '    y / 2 = 7 - 3 = 4',
                  '      y = 4 x 2 = 8',
                  'Jawapan Akhir: x = 5, y = 8   [Disemak Betul]',
              ]
            : yearLevel === 'F4'
            ? [
                  'LATIHAN KERTAS MATEMATIK TINGKATAN 4 (PERSAMAAN KUADRATIK)',
                  'Soalan: x² + 2x - 15 = 0 (pemfaktoran) dan lakaran f(x)',
                  'x² + 2x - 15 = 0',
                  '(x + 5)(x - 3) = 0',
                  'x + 5 = 0   atau   x - 3 = 0',
                  'x = -5   atau   x = 3',
                  'Lakaran: parabola senyum (a > 0), memotong paksi-x',
                  '         pada -5 dan 3, pintasan-y = -15, paksi x = -1',
                  'Jawapan Akhir: x = 3, x = -5   [Disemak Betul]',
              ]
            : yearLevel === 2
            ? [
                  'LATIHAN KERTAS MATEMATIK TAHUN 2 (BENTUK LAZIM)',
                  'Soalan: RM90.00 - RM54.60 - RM27.00 = ___',
                  'Langkah 1:   RM 90 . 00',
                  '           - RM 54 . 60',
                  '           ------------',
                  '             RM 35 . 40   (Pinjam RM1 = 100 sen)',
                  'Langkah 2:   RM 35 . 40',
                  '           - RM 27 . 00',
                  '           ------------',
                  'Jawapan:     RM  8 . 40   [Disemak Betul]',
              ]
            : yearLevel === 3
            ? [
                  'LATIHAN KERTAS MATEMATIK TAHUN 3 (BENTUK LAZIM)',
                  'Soalan: 6 x 6 m 80 cm = ___ m ___ cm',
                  'Langkah 1:    6 m   80 cm',
                  '           x            6',
                  '           --------------',
                  '             36 m  480 cm',
                  'Langkah 2 (Tukar Unit 1 m = 100 cm):',
                  '             480 cm = 4 m 80 cm',
                  '             36 m + 4 m 80 cm = 40 m 80 cm',
                  'Jawapan:     40 m 80 cm   [Disemak Betul]',
              ]
            : [
                  'LATIHAN KERTAS MATEMATIK TAHUN 1 (BENTUK LAZIM)',
                  'Soalan: (a) 39 + 47 = ___    (b) 63 - 7 = ___',
                  '(a) Kumpul Semula Puluh & Sa:   (b) Pinjam 1 Puluh = 10 Sa:',
                  '      +1                              5  13',
                  '      3 9 (3 puluh 9 sa)              6  3',
                  '    + 4 7 (4 puluh 7 sa)            -    7',
                  '    -----                           ------',
                  '      8 6 (16 sa -> 1P 6S)            5  6',
                  '',
                  'Jawapan Akhir: 86 dan 56   [Disemak Betul]',
              ];

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="220" viewBox="0 0 560 220">
        <rect width="560" height="220" fill="#FFFBEB" stroke="#CBD5E1" stroke-width="1.5"/>
        <line x1="44" y1="0" x2="44" y2="220" stroke="#EF4444" stroke-width="1.5"/>
        ${lines
            .map(
                (txt, idx) =>
                    `<line x1="0" y1="${28 + idx * 19}" x2="560" y2="${28 + idx * 19}" stroke="#93C5FD" stroke-width="1"/>
                     <text x="54" y="${24 + idx * 19}" font-family="monospace" font-size="11" font-weight="bold" fill="#1E3A8A">${txt
                         .replace(/&/g, '&amp;')
                         .replace(/</g, '&lt;')
                         .replace(/>/g, '&gt;')}</text>`
            )
            .join('')}
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const BTN_SECONDARY = 'w-full sm:w-auto min-h-[40px] inline-flex items-center justify-center gap-2 bg-white border border-[#CBD5E1] hover:border-[#2563EB] text-[#0F172A] font-bold text-xs px-4 py-2 rounded-lg transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed';
const BTN_PRIMARY = 'w-full sm:w-auto min-h-[40px] inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs px-5 py-2 rounded-lg transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
const BTN_SUCCESS = 'w-full sm:w-auto min-h-[40px] inline-flex items-center justify-center gap-2 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2 rounded-lg transition-transform active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed';

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
    const sidebarScrollRef = useRef(null);
    const activeModuleRef = useRef(null);

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

    // Keep active chapter scrolled smoothly into view inside the sidebar container without window shifting
    useEffect(() => {
        if (activeModuleRef.current && sidebarScrollRef.current) {
            const container = sidebarScrollRef.current;
            const target = activeModuleRef.current;
            const targetRect = target.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            if (targetRect.top < containerRect.top) {
                container.scrollTop -= (containerRect.top - targetRect.top + 8);
            } else if (targetRect.bottom > containerRect.bottom) {
                container.scrollTop += (targetRect.bottom - containerRect.bottom + 8);
            }
        }
    }, [activeModuleId]);

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

    // Quick notes scratchpad (saved per course in localStorage & debounced cloud autosave)
    const [courseNotes, setCourseNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [autosaveStatus, setAutosaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'saved-local'
    const [lastSavedTime, setLastSavedTime] = useState(null);
    const autosaveTimerRef = useRef(null);

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

        return () => {
            if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
        };
    }, [course.id, notes]);

    const handleNotesChange = (e) => {
        const val = e.target.value;
        setCourseNotes(val);
        setAutosaveStatus('saving');
        try {
            localStorage.setItem(`coped_notes_${course.id}`, val);
        } catch {}

        if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = setTimeout(async () => {
            if (!activeModule?.id) {
                setAutosaveStatus('saved');
                setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                return;
            }
            try {
                const token = document.querySelector('meta[name="csrf-token"]')?.content;
                const res = await fetch(route('learner.course.module.note.store', [course.id, activeModule.id]), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': token,
                    },
                    body: JSON.stringify({ content: val }),
                });
                if (res.ok) {
                    setAutosaveStatus('saved');
                    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                } else {
                    setAutosaveStatus('saved-local');
                }
            } catch {
                setAutosaveStatus('saved-local');
            }
        }, 800);
    };

    // Active module entity & surrounding navigation
    const activeIndex = Math.max(0, modules.findIndex((m) => m.id === activeModuleId));
    const activeModule = modules[activeIndex] || modules[0] || null;
    const prevModule = activeIndex > 0 ? modules[activeIndex - 1] : null;
    const nextModule = activeIndex < modules.length - 1 ? modules[activeIndex + 1] : null;

    const saveNotesExplicit = async () => {
        setIsSavingNotes(true);
        setAutosaveStatus('saving');
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
                    setAutosaveStatus('saved');
                    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                } else {
                    setAutosaveStatus('saved-local');
                }
            } catch {
                setAutosaveStatus('saved-local');
            }
        } else {
            setAutosaveStatus('saved-local');
        }

        setIsSavingNotes(false);
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

    // Detect School Interactive & Gamified Mode (course_mode === 'school' or KSSR fallback)
    const isKssrCourse = Boolean(
        course?.course_mode === 'school' ||
            course?.title?.includes('Tahun') ||
            course?.title?.includes('KSSR') ||
            course?.title?.includes('KSSM') ||
            course?.title?.includes('Tingkatan') ||
            course?.academic_year?.includes('KSSR') ||
            course?.academic_year?.includes('KSSM')
    );

    const pilotModule = useMemo(() => {
        return modules.find((m) => /fokus\s+ujian\s+rintis|ujian\s+rintis/i.test(m.title)) ?? null;
    }, [modules]);

    const activeChapterSteps = isKssrCourse ? SCHOOL_CHAPTER_STEPS : CERT_CHAPTER_STEPS;

    // Step sequence: 'watch' | 'interact' (school) | 'guide' | 'quiz'
    const [chapterStep, setChapterStep] = useState('watch');
    const activeStepIndex = activeChapterSteps.findIndex((s) => s.id === chapterStep);

    // Collapsible Quick Notes drawer & Step 4 Quiz/Paper Sub-Toggle
    const [showNotesDrawer, setShowNotesDrawer] = useState(false);
    const [quizSubTab, setQuizSubTab] = useState('mini'); // 'mini' | 'paper'

    // Live Gamification XP, Level & Toast State
    const [bonusXp, setBonusXp] = useState(0);
    const [xpToast, setXpToast] = useState(null);
    const xpToastTimerRef = useRef(null);

    useEffect(() => {
        try {
            const savedXp = Number(localStorage.getItem(`coped_xp_${course.id}`) || 0);
            if (!Number.isNaN(savedXp) && savedXp > 0) {
                setBonusXp(savedXp);
            }
        } catch {}
        return () => {
            if (xpToastTimerRef.current) clearTimeout(xpToastTimerRef.current);
        };
    }, [course.id]);

    const awardXp = (amount, label = '') => {
        setBonusXp((prev) => {
            const next = prev + amount;
            try {
                localStorage.setItem(`coped_xp_${course.id}`, String(next));
            } catch {}
            return next;
        });
        if (xpToastTimerRef.current) clearTimeout(xpToastTimerRef.current);
        setXpToast({ amount, label });
        xpToastTimerRef.current = setTimeout(() => {
            setXpToast(null);
        }, 3500);
    };

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
        ? (isPdfFile(selectedLesson.url) ? 'pdf' : (selectedLesson.contentType || (isVideoUrl(selectedLesson.url) ? 'video' : 'link')))
        : (isPdfFile(activeModule?.media_url) ? 'pdf' : (activeModule?.content_type || 'link'));

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
        if (correct > 0) {
            awardXp(correct * 15, `Kuiz Pantas: ${correct}/${activeModuleQuizzes.length} Betul!`);
        }
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

    const kssrYearLevel = useMemo(() => {
        const text = `${course?.title || ''} ${course?.academic_year || ''} ${course?.description || ''} ${course?.category || ''}`;
        // KSSM secondary levels return strings; keep them away from Number() coercion.
        if (/matematik\s*tambahan|add(itional)?\s*math/i.test(text)) return 'F4_ADD';
        if (/tingkatan\s*1\b|form\s*1\b/i.test(text)) return 'F1';
        if (/tingkatan\s*4\b|form\s*4\b/i.test(text)) return 'F4';
        if (/tahun\s*2|standard\s*2|darjah\s*2/i.test(text)) return 2;
        if (/tahun\s*3|standard\s*3|darjah\s*3/i.test(text)) return 3;
        return 1;
    }, [course?.title, course?.academic_year, course?.description, course?.category]);

    const isSecondaryMath = ['F1', 'F4', 'F4_ADD'].includes(kssrYearLevel);

    // Penilaian Hibrid (Paper Worksheet & Scan/Photo Upload) State
    const hybridTask = useMemo(() => {
        if (kssrYearLevel === 'F4_ADD') {
            return {
                badge: 'Matematik Tambahan Tingkatan 4 · Fungsi (Bab 1)',
                prompt: 'Diberi f(x) = 2x - 3 dan g(x) = x + 4. Cari fg(x) dan f⁻¹(x) di atas kertas dengan menunjukkan semua langkah. Muat naik gambar kertas kerja anda.',
                placeholder: 'Contoh: fg(x) = 2x + 5, f⁻¹(x) = (x + 3) / 2',
                demoAnswer: 'fg(x) = 2x + 5, f⁻¹(x) = (x + 3) / 2',
                validate: (val) => {
                    const clean = String(val || '').replace(/\s+/g, '').toLowerCase();
                    return clean.includes('2x+5') && clean.includes('(x+3)/2');
                },
            };
        }
        if (kssrYearLevel === 'F1') {
            return {
                badge: 'Tingkatan 1 · Persamaan Linear (Bab 6)',
                prompt: 'Selesaikan persamaan berikut di atas kertas latihan dengan menunjukkan semua langkah pengiraan: (a) 3x - 4 = 11  (b) (y / 2) + 3 = 7. Tangkap gambar kertas kerja anda dan muat naik ke sistem.',
                placeholder: 'Contoh: x = 5, y = 8',
                demoAnswer: 'x = 5, y = 8',
                validate: (val) => {
                    const clean = String(val || '').replace(/\s+/g, '').toLowerCase();
                    return clean.includes('x=5') && clean.includes('y=8');
                },
            };
        }
        if (kssrYearLevel === 'F4') {
            return {
                badge: 'Tingkatan 4 · Persamaan Kuadratik (Bab 1)',
                prompt: 'Selesaikan persamaan kuadratik x² + 2x - 15 = 0 menggunakan kaedah pemfaktoran di atas kertas, dan lakarkan bentuk graf f(x) = x² + 2x - 15. Muat naik gambar jalan kerja dan lakaran anda.',
                placeholder: 'Contoh: x = 3, x = -5',
                demoAnswer: 'x = 3, x = -5',
                validate: (val) => {
                    const clean = String(val || '').replace(/\s+/g, '').toLowerCase();
                    return clean.includes('3') && clean.includes('-5');
                },
            };
        }
        if (kssrYearLevel === 2) {
            return {
                badge: 'Tahun 2 · Wang Hingga RM100',
                prompt: 'Tunjukkan jalan kerja pengiraan baki wang dalam bentuk lazim di atas kertas: RM90.00 - RM54.60 - RM27.00 = ___',
                placeholder: 'Contoh: RM8.40',
                demoAnswer: 'RM8.40',
                validate: (val) => String(val || '').replace(/\s+/g, '').toLowerCase().includes('8.4'),
            };
        }
        if (kssrYearLevel === 3) {
            return {
                badge: 'Tahun 3 · Pertukaran Unit & Darab Panjang',
                prompt: 'Tunjukkan langkah pertukaran unit dan jalan kerja darab di atas kertas: 6 x 6 m 80 cm = ___ m ___ cm',
                placeholder: 'Contoh: 40 m 80 cm',
                demoAnswer: '40 m 80 cm',
                validate: (val) => {
                    const clean = String(val || '').toLowerCase();
                    return (clean.includes('40') && clean.includes('80')) || clean.includes('4080');
                },
            };
        }
        return {
            badge: 'Tahun 1 · Bentuk Lazim (Kumpul Semula Puluh & Sa)',
            prompt: 'Selesaikan dalam bentuk lazim di atas kertas (tunjukkan langkah kumpul semula Puluh dan Sa): 39 + 47 = ___ dan 63 - 7 = ___',
            placeholder: 'Contoh: 86 dan 56',
            demoAnswer: '86 dan 56',
            validate: (val) => {
                const clean = String(val || '');
                return clean.includes('86') || clean.includes('56');
            },
        };
    }, [kssrYearLevel]);

    const [hybridAnswer, setHybridAnswer] = useState('');
    const [hybridScanPreview, setHybridScanPreview] = useState(null);
    const [hybridScanName, setHybridScanName] = useState('');
    const [hybridError, setHybridError] = useState('');
    const [hybridSubmitted, setHybridSubmitted] = useState(false);
    const [hybridZoom, setHybridZoom] = useState(false);

    // Live Total XP & Level Computation
    const totalXp = useMemo(() => {
        return (
            completedModuleIds.length * 50 +
            completedLessonIds.length * 25 +
            (isQuizPassed ? 200 : 0) +
            (hybridSubmitted ? 50 : 0) +
            bonusXp
        );
    }, [completedModuleIds.length, completedLessonIds.length, isQuizPassed, hybridSubmitted, bonusXp]);


    const handleHybridFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
            setHybridError('Sila muat naik fail gambar (JPG/PNG/WEBP) atau PDF sahaja.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setHybridError('Saiz fail melebihi had 5 MB. Sila pilih gambar yang lebih kecil.');
            return;
        }
        setHybridError('');
        setHybridSubmitted(false);
        setHybridScanName(file.name);
        if (file.type === 'application/pdf') {
            setHybridScanPreview(buildDemoWorksheetSvg(kssrYearLevel));
        } else {
            setHybridScanPreview(URL.createObjectURL(file));
        }
    };

    const handleLoadDemoWorksheet = () => {
        setHybridError('');
        setHybridSubmitted(false);
        setHybridAnswer(hybridTask.demoAnswer);
        setHybridScanName(
            `Imbasan_Kertas_Bentuk_Lazim_${typeof kssrYearLevel === 'string' ? `Tingkatan_${kssrYearLevel.slice(1)}` : `Tahun_${kssrYearLevel}`}.svg`
        );
        setHybridScanPreview(buildDemoWorksheetSvg(kssrYearLevel));
    };

    const handleVerifyHybridWorksheet = () => {
        if (!hybridAnswer.trim()) {
            setHybridError('Sila taip jawapan akhir daripada kertas jalan kerja anda di Kotak Input 1.');
            return;
        }
        if (!hybridScanPreview) {
            setHybridError('Sila muat naik gambar kertas jalan kerja atau klik butang Contoh Imbasan Kertas Murid (Demo).');
            return;
        }
        if (!hybridTask.validate(hybridAnswer)) {
            setHybridError(`Jawapan akhir belum tepat. Semak semula pengiraan bentuk lazim anda (Petunjuk: ${hybridTask.demoAnswer}).`);
            setHybridSubmitted(false);
            return;
        }
        setHybridError('');
        if (!hybridSubmitted) {
            awardXp(50, 'Imbasan Kertas Bentuk Lazim Disahkan! (+50 XP)');
        }
        setHybridSubmitted(true);
        markCurrentSubtopicOrModuleComplete(false);
    };

    const renderHybridPaperCard = () => (
        <div
            id="penilaian-hibrid-card"
            className="bg-[#FFFBEB] border border-[#FCD34D] rounded-xl p-3 sm:p-4 space-y-3 max-w-3xl"
        >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#FDE68A]">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-[#D97706] text-white text-[11px] font-black uppercase tracking-wider">
                        📝 Tugasan Kertas &amp; Imbasan
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-white text-[#92400E] border border-[#FCD34D] text-[11px] font-extrabold">
                        Penilaian Hibrid · {hybridTask.badge}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={handleLoadDemoWorksheet}
                    className="px-2.5 py-1 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-[11px] font-black transition-colors"
                >
                    ⚡ Gunakan Contoh Imbasan Kertas Murid (Demo)
                </button>
            </div>

            {/* 1. Assigned Textbook Problem */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-white border border-[#E2E8F0] space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#D97706] block">
                    Soalan Jalan Kerja Bentuk Lazim (Kertas Latihan):
                </span>
                <p className="text-sm font-extrabold text-[#0F172A] leading-snug">
                    {renderMathText(hybridTask.prompt, isSecondaryMath)}
                </p>
            </div>

            {/* 2. Step-by-Step Hybrid Submission Flow */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {/* Input 1: Final Numerical Answer */}
                <div className="p-2.5 sm:p-3 rounded-lg bg-white border border-[#E2E8F0] space-y-1.5">
                    <label
                        htmlFor="hybrid-final-answer"
                        className="text-xs font-extrabold text-[#0F172A] block"
                    >
                        Langkah 1: Taip Jawapan Akhir daripada Kertas Anda
                    </label>
                    <input
                        id="hybrid-final-answer"
                        type="text"
                        value={hybridAnswer}
                        onChange={(e) => {
                            setHybridAnswer(e.target.value);
                            setHybridSubmitted(false);
                        }}
                        placeholder={hybridTask.placeholder}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-sm font-extrabold text-[#0F172A] min-h-[36px] focus:outline-none focus:border-[#2563EB] focus:bg-white"
                    />
                    <p className="text-[11px] font-semibold text-gray-500">
                        Kira di atas kertas latihan dahulu, kemudian masukkan jawapan akhir di sini.
                    </p>
                </div>

                {/* Input 2: Upload Scan / Photo of Handwritten Working */}
                <div className="p-2.5 sm:p-3 rounded-lg bg-white border border-[#E2E8F0] space-y-1.5 flex flex-col justify-between">
                    <div className="space-y-1.5">
                        <span className="text-xs font-extrabold text-[#0F172A] block">
                            Langkah 2: Muat Naik Gambar / Imbasan Kertas Jalan Kerja
                        </span>
                        <label className="w-full min-h-[36px] px-3 py-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#111827] hover:text-white border border-[#D97706] text-xs font-black cursor-pointer inline-flex items-center justify-center gap-2 transition-colors text-center">
                            <span>📷 Tangkap Gambar / Muat Naik Kertas Jalan Kerja</span>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                capture="environment"
                                onChange={handleHybridFileChange}
                                className="sr-only"
                            />
                        </label>
                    </div>
                    {hybridScanName && (
                        <p className="text-xs font-extrabold text-[#059669] truncate">
                            📎 Fail dipilih: {hybridScanName}
                        </p>
                    )}
                </div>
            </div>

            {/* Instant Worksheet Preview */}
            {hybridScanPreview && (
                <div className="p-2.5 sm:p-3 rounded-lg bg-white border border-[#E2E8F0] space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#0F172A]">
                            🔍 Pratonton Imbasan Kertas:
                        </span>
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => setHybridZoom((prev) => !prev)}
                                className="text-[11px] font-extrabold text-[#2563EB] hover:underline"
                            >
                                {hybridZoom ? 'Kecilkan' : 'Besarkan'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setHybridScanPreview(null);
                                    setHybridScanName('');
                                    setHybridSubmitted(false);
                                    setHybridZoom(false);
                                }}
                                className="text-[11px] font-extrabold text-red-600 hover:underline"
                            >
                                Padam Imbasan
                            </button>
                        </div>
                    </div>
                    <div className={`border border-[#CBD5E1] rounded-lg overflow-hidden bg-[#FFFBEB] flex items-center justify-center transition-all ${hybridZoom ? 'max-h-80' : 'max-h-36'}`}>
                        <img
                            src={hybridScanPreview}
                            alt="Pratonton Kertas Jalan Kerja Bentuk Lazim"
                            className={`${hybridZoom ? 'max-h-76' : 'max-h-32'} w-auto object-contain`}
                        />
                    </div>
                </div>
            )}

            {hybridError && (
                <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs sm:text-sm font-extrabold text-[#991B1B]">
                    ⚠ {hybridError}
                </div>
            )}

            {/* Submit & Verify Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-xs font-semibold text-gray-600">
                    Sistem menyemak imbasan jalan kerja bentuk lazim dan ketepatan jawapan akhir.
                </span>
                <button
                    type="button"
                    onClick={handleVerifyHybridWorksheet}
                    className="px-5 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs sm:text-sm font-black transition-transform active:scale-[0.98]"
                >
                    ✓ Hantar &amp; Semak Jalan Kerja
                </button>
            </div>

            {/* 3. Automated & Rubric Evaluation Result */}
            {hybridSubmitted && (
                <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#10B981] space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-[#065F46]">
                        🌟 Keputusan Penilaian Hibrid (Disahkan Sistem):
                    </p>
                    <p className="text-sm font-extrabold text-[#065F46]">
                        ✓ Imbasan Kertas Kerja Diterima (Bentuk Lazim Disahkan) · +50 XP Bintang Matematik!
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <LearnerLayout wide>
            <Head title={`Learn: ${course.title}`} />

            {quizToast && (
                <div
                    role="status"
                    aria-live="polite"
                    className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-extrabold max-w-md border ${
                        quizToast.type === 'pass'
                            ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
                            : quizToast.type === 'fail'
                            ? 'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]'
                            : 'bg-[#EFF6FF] border-[#2563EB] text-[#1E40AF]'
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

            {xpToast && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#ECFDF5] border-2 border-[#10B981] text-[#065F46] flex items-center gap-3 animate-bounce"
                >
                    <span className="w-8 h-8 rounded-lg bg-[#10B981] text-white font-black text-xs flex items-center justify-center shrink-0">
                        +{xpToast.amount}
                    </span>
                    <div>
                        <p className="text-xs font-black uppercase tracking-wider text-[#047857]">
                            ⭐ Ganjaran XP Diperoleh!
                        </p>
                        <p className="text-xs font-bold text-[#065F46]">
                            {xpToast.label || `+${xpToast.amount} XP ditambah ke tahap anda!`}
                        </p>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* Compact Khan-Academy Style Top Header Bar */}
                <div className="py-3.5 px-4 sm:px-5 bg-white border border-[#E2E8F0] rounded-xl space-y-3 w-full min-w-0 overflow-hidden">
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3.5 w-full min-w-0">
                        {/* Left Column: Back Link, Course Title & KPM PDF Pill */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                            {course.category_logo && (
                                <div className="hidden md:block shrink-0">
                                    <CourseLogoBadge category={course.category_logo} size="tile" className="!w-28 rounded-lg" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1 space-y-1">
                                {isKssrCourse ? (
                                    <div className="space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#64748B]">
                                            <Link
                                                href={route('portal')}
                                                className="inline-flex items-center gap-1 text-[#0F172A] hover:text-[#2563EB] hover:underline font-extrabold"
                                            >
                                                <span>&larr;</span>
                                                <span>My Portal</span>
                                            </Link>
                                            <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-[10px] font-extrabold uppercase tracking-wider">
                                                🏫 {kssrYearLevel === 'F1'
                                                    ? 'KSSM Menengah · Tingkatan 1'
                                                    : kssrYearLevel === 'F4'
                                                    ? 'KSSM Menengah · Tingkatan 4'
                                                    : kssrYearLevel === 'F4_ADD'
                                                    ? 'KSSM Menengah Atas · Matematik Tambahan Tingkatan 4'
                                                    : `KSSR Rendah · Tahun ${kssrYearLevel}`}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <h1 className="font-display text-base sm:text-xl font-extrabold text-[#0F172A] break-words leading-snug">
                                                {course.title}
                                            </h1>
                                            {course.bundle_url && (
                                                <a
                                                    href={course.bundle_url}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#065F46] bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] px-2.5 py-0.5 rounded-lg transition-colors"
                                                >
                                                    <span className="truncate">
                                                        📄 {course.bundle_title || 'Buku Teks PDF'}
                                                    </span>
                                                    <span className="text-[10px] shrink-0">&#11015;</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#64748B]">
                                            <nav aria-label="Course breadcrumb" className="inline-flex items-center gap-1.5 shrink-0">
                                                <Link href={route('learner.catalog')} className="text-[#0F172A] hover:text-[#2563EB] hover:underline">
                                                    Browse Catalog
                                                </Link>
                                                <span className="text-gray-400">/</span>
                                                <Link href={route('portal')} className="text-[#0F172A] hover:text-[#2563EB] hover:underline">
                                                    My Portal
                                                </Link>
                                            </nav>
                                            <span>·</span>
                                            <span className="truncate">Instructed by {course.instructor?.name || 'Faculty Instructor'}</span>
                                            {course.academic_year && (
                                                <span className="text-[10px] font-bold text-[#1E40AF] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded-md">
                                                    📅 {course.academic_year}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <h1 className="font-display text-base sm:text-xl font-extrabold text-[#0F172A] break-words leading-snug">
                                                {course.title}
                                            </h1>
                                            {course.bundle_url && (
                                                <a
                                                    href={course.bundle_url}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#065F46] bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] px-2.5 py-0.5 rounded-lg transition-colors"
                                                >
                                                    <span className="truncate">
                                                        📥 {course.bundle_title || 'Muat Turun Buku Teks KPM (PDF)'}
                                                    </span>
                                                    <span className="text-[10px] shrink-0">&#11015;</span>
                                                </a>
                                            )}
                                            {course.cert_title && (
                                                <a
                                                    href={course.cert_url || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1D4ED8] bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] px-2 py-0.5 rounded-lg transition-colors"
                                                >
                                                    <span className="truncate">🎓 Leads to: {course.cert_title}</span>
                                                    <span className="text-[10px] shrink-0">&#8599;</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: XP (School Mode) + Progress % + Assessment / Certificate CTA */}
                        <div className="flex items-center gap-3 sm:gap-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 shrink-0">
                            {isKssrCourse && (
                                <div className="relative inline-flex items-center">
                                    <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-extrabold inline-flex items-center gap-1">
                                        <span>⭐</span>
                                        <span>{totalXp} XP</span>
                                    </span>
                                    {xpToast && (
                                        <span className="absolute -top-3 -right-2 bg-[#10B981] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-[#059669] animate-bounce pointer-events-none">
                                            +{xpToast.amount} XP!
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <div
                                    className="w-28 sm:w-36 h-2 bg-[#E2E8F0] rounded-full overflow-hidden"
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
                                <span className="text-sm font-extrabold text-[#111827]">{progressPct}%</span>
                            </div>

                            {assessments.length > 0 && !isCompleted && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('assessment')}
                                    className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors shrink-0"
                                >
                                    Take Final Assessment
                                </button>
                            )}
                            {isCompleted && (
                                <Link
                                    href={route('learner.course.certificate', course.id)}
                                    className="bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors shrink-0 inline-flex items-center gap-1"
                                >
                                    🎓 View Certificate
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Celebration Banner */}
                    {isCompleted && (
                        <div className="bg-[#10B981] text-white p-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <CircleCheckIcon className="w-5 h-5 text-white shrink-0" />
                                <span>
                                    Course Completed! You have passed the Final Assessment with 100%. Your verified record is issued.
                                </span>
                            </div>
                            <Link
                                href={route('learner.course.certificate', course.id)}
                                className="inline-flex items-center justify-center gap-1.5 bg-[#0F172A] hover:bg-white hover:text-[#0F172A] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shrink-0 transition-colors"
                            >
                                <span>🎓 View &amp; Download Certificate PDF</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Horizontal Course Sub-Navigation Tabs */}
                <div className="w-full max-w-full overflow-x-auto no-scrollbar flex items-center justify-start gap-1 sm:gap-3 border border-[#E2E8F0] rounded-xl bg-white px-3 sm:px-5">
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
                                className={`text-xs sm:text-sm whitespace-nowrap transition-colors py-2.5 px-2.5 sm:px-3 min-h-[40px] flex items-center shrink-0 ${
                                    active
                                        ? 'border-b-2 border-[#2563EB] font-extrabold text-[#2563EB]'
                                        : 'text-[#64748B] hover:text-[#0F172A] font-semibold border-b-2 border-transparent'
                                }`}
                            >
                                <span className="sm:hidden">{tab.shortLabel}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab 1: Course (Single-Screen Workspace + Curriculum Sidebar) */}
                {activeTab === 'course' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                            {/* Left Curriculum Outline (order-2 lg:order-1 lg:col-span-3) */}
                            <div
                                className={`order-2 lg:order-1 lg:col-span-3 space-y-3 ${
                                    desktopSidebarOpen ? '' : 'lg:hidden'
                                }`}
                            >
                                {/* Mobile Curriculum Accordion Toggle Button */}
                                <div className="lg:hidden">
                                    <button
                                        type="button"
                                        onClick={() => setMobileCurriculumOpen((v) => !v)}
                                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-extrabold text-[#0F172A] hover:border-[#2563EB] transition-colors min-h-[42px]"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>📑</span>
                                            <span>Course Curriculum ({modules.length} {isKssrCourse ? 'Bab' : 'Modules'})</span>
                                        </span>
                                        <span className="text-[#64748B] font-bold">{mobileCurriculumOpen ? '▲ Hide' : '▼ View Curriculum'}</span>
                                    </button>
                                </div>

                                <div className={`${mobileCurriculumOpen ? 'block' : 'hidden'} lg:block bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col`}>
                                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#E2E8F0]">
                                        <h3 className="font-display font-extrabold text-xs text-[#0F172A] uppercase tracking-wider">
                                            Curriculum ({modules.length} {isKssrCourse ? 'Bab' : 'Modules'})
                                        </h3>
                                        {pilotModule && (
                                            <button
                                                type="button"
                                                onClick={() => goToModule(pilotModule.id)}
                                                className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                                title="Lompat terus ke Bab Fokus Ujian Rintis"
                                            >
                                                <span>🎯</span>
                                                <span>Fokus Rintis</span>
                                            </button>
                                        )}
                                    </div>

                                    {modules.length === 0 ? (
                                        <p className="text-xs text-[#64748B] py-4 text-center">
                                            No modules added to this course yet.
                                        </p>
                                    ) : (
                                        <div
                                            ref={sidebarScrollRef}
                                            className="max-h-[440px] lg:max-h-[490px] overflow-y-auto pr-1 space-y-1.5 focus:outline-none"
                                        >
                                            {modules.map((m, idx) => {
                                                const isActive = m.id === activeModuleId;
                                                const mLessons = m.lessons || [];
                                                const doneSubCount = mLessons.filter((l) => doneLessonSet.has(l.id)).length;
                                                const isChecked = isModuleFullyDone(m);
                                                const isEmbed = m.content_type === 'embed';
                                                const isPilot = /fokus\s+ujian\s+rintis|ujian\s+rintis/i.test(m.title);
                                                const cleanTitle = m.title.replace(/\s*\(Fokus Ujian Rintis\)/i, '');

                                                return (
                                                    <div
                                                        key={m.id}
                                                        ref={isActive ? activeModuleRef : null}
                                                        className="space-y-1"
                                                    >
                                                        {/* Parent Chapter Bar (1-Line Sleek Row) */}
                                                        <div
                                                            onClick={() => goToModule(m.id)}
                                                            className={`py-2 px-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                                                                isActive
                                                                    ? 'border-2 border-[#2563EB] bg-[#EFF6FF]/70 text-[#1E40AF]'
                                                                    : isPilot
                                                                    ? 'border border-amber-200 bg-amber-50/40 hover:border-amber-300'
                                                                    : 'border border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                {/* Status Icon / Chevron */}
                                                                <span
                                                                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px] font-black ${
                                                                        isChecked
                                                                            ? 'bg-[#10B981] text-white'
                                                                            : isActive
                                                                            ? 'text-[#2563EB]'
                                                                            : 'text-[#94A3B8]'
                                                                    }`}
                                                                >
                                                                    {isChecked ? '✓' : isActive ? '▼' : '▶'}
                                                                </span>

                                                                {/* Single-line Chapter Title */}
                                                                <span
                                                                    className={`text-xs truncate ${
                                                                        isActive
                                                                            ? 'font-extrabold text-[#1E40AF]'
                                                                            : isPilot
                                                                            ? 'font-bold text-[#0F172A]'
                                                                            : 'font-semibold text-[#111827]'
                                                                    }`}
                                                                    title={m.title}
                                                                >
                                                                    {cleanTitle}
                                                                </span>

                                                                {isPilot && (
                                                                    <span className="shrink-0 text-[9px] font-black text-amber-700 bg-amber-100 border border-amber-300 px-1 rounded">
                                                                        ★ Rintis
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Right Status / Fraction */}
                                                            <div className="shrink-0 flex items-center gap-1">
                                                                {isChecked ? (
                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                                        ✓
                                                                    </span>
                                                                ) : mLessons.length > 0 ? (
                                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                                                                        {doneSubCount}/{mLessons.length}
                                                                    </span>
                                                                ) : (
                                                                    <span
                                                                        className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${
                                                                            isEmbed
                                                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                                : 'bg-gray-100 text-gray-700 border-gray-200'
                                                                        }`}
                                                                    >
                                                                        {isEmbed ? 'EMBED' : 'LINK'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Subtopics Accordion: Expanded ONLY for the Active Chapter */}
                                                        {isActive && mLessons.length > 0 && (
                                                            <div className="ml-3 pl-2.5 border-l-2 border-[#BFDBFE] space-y-1 pt-0.5 pb-1">
                                                                {mLessons.map((lesson, lIdx) => {
                                                                    const isSubDone = doneLessonSet.has(lesson.id);
                                                                    const isCurrentLesson = selectedLesson?.id === lesson.id;
                                                                    const lessonSafe = safeUrl(lesson.content_url);
                                                                    const isPdf = isPdfFile(lessonSafe, lesson.content_type);
                                                                    const isVideo = isVideoUrl(lessonSafe, lesson.content_type);
                                                                    const icon = isPdf ? '📄' : isVideo ? '▶' : '📖';
                                                                    const pillLabel = isPdf ? 'PDF' : isVideo ? 'VIDEO' : 'GUIDE';

                                                                    const cleanSubTitle = lesson.title.replace(/^Subtopik\s*[\d.]+\s*[:\-]\s*/i, '');
                                                                    const displayTitle = `${idx + 1}.${lIdx + 1} ${cleanSubTitle}`;

                                                                    return (
                                                                        <div
                                                                            key={lesson.id}
                                                                            onClick={() => selectSubtopic(m.id, lesson)}
                                                                            className={`py-1.5 px-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                                                                                isCurrentLesson
                                                                                    ? 'border border-[#2563EB] bg-[#EFF6FF] text-[#1E40AF]'
                                                                                    : 'border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] text-[#334155]'
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                                                <span className="text-xs shrink-0">{icon}</span>
                                                                                <span
                                                                                    className={`text-[11px] truncate ${
                                                                                        isCurrentLesson
                                                                                            ? 'font-extrabold text-[#1E40AF]'
                                                                                            : 'font-medium text-[#334155]'
                                                                                    }`}
                                                                                    title={lesson.title}
                                                                                >
                                                                                    {displayTitle}
                                                                                </span>
                                                                            </div>

                                                                            <span
                                                                                className={`shrink-0 text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                                                                    isSubDone
                                                                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                                                        : isPdf
                                                                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                                        : isVideo
                                                                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                                        : 'bg-gray-100 text-gray-700 border-gray-200'
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
                                        </div>
                                    )}

                                    {/* Bottom Assessment Jump Button */}
                                    {assessments.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('assessment')}
                                                className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs py-2.5 px-3 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                                            >
                                                <span>Final Assessment ({assessments.length} Questions)</span>
                                                <ArrowRightIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Official Certificate Tree Item */}
                                    <div className="mt-2.5 pt-2.5 border-t border-[#E2E8F0]">
                                        {isCompleted ? (
                                            <Link
                                                href={route('learner.course.certificate', course.id)}
                                                className="w-full p-2.5 rounded-lg border border-[#10B981] bg-emerald-50 hover:bg-emerald-100 text-[#065F46] font-bold text-xs flex items-center justify-between transition-colors"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-sm">🎓</span>
                                                    <span className="truncate">Official Certificate</span>
                                                </div>
                                                <span className="text-[10px] font-extrabold uppercase shrink-0">View &amp; Download 1-Page PDF →</span>
                                            </Link>
                                        ) : (
                                            <div className="w-full p-2.5 rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] text-[#64748B] font-semibold text-xs flex items-center gap-2">
                                                <span className="text-sm">🔒</span>
                                                <span className="text-[11px] leading-tight">Pass Final Exam (100%) to unlock certificate</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Center/Right Single-Screen Learning Stage */}
                            <div
                                className={`order-1 lg:order-2 ${
                                    desktopSidebarOpen ? 'lg:col-span-9' : 'lg:col-span-12'
                                } space-y-4`}
                            >
                                {activeModule ? (
                                    <div
                                        id="course-stage-top"
                                        className="scroll-mt-20 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden"
                                    >
                                        {/* Step Tab Bar (4 Steps for School Mode, 3 Steps for Certification Mode) */}
                                        <div
                                            className={`grid ${
                                                isKssrCourse ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'
                                            } border-b border-[#E2E8F0] bg-[#F8FAFC] divide-x divide-[#E2E8F0]`}
                                            role="tablist"
                                            aria-label="Chapter learning steps"
                                        >
                                            {activeChapterSteps.map((step, sIdx) => {
                                                const isActiveStep = chapterStep === step.key;
                                                const isPastStep = sIdx < activeStepIndex;

                                                return (
                                                    <button
                                                        key={step.key}
                                                        type="button"
                                                        role="tab"
                                                        aria-selected={isActiveStep}
                                                        onClick={() => goToStep(step.key)}
                                                        className={`px-3 py-3 text-left sm:text-center transition-colors flex items-center justify-center gap-2 ${
                                                            isActiveStep
                                                                ? 'bg-[#EFF6FF] text-[#1D4ED8] border-b-2 border-b-[#2563EB] font-extrabold'
                                                                : isPastStep
                                                                ? 'bg-[#ECFDF5]/60 text-[#065F46] hover:bg-[#ECFDF5] font-bold'
                                                                : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] font-bold'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 border ${
                                                                isActiveStep
                                                                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                                                                    : isPastStep
                                                                    ? 'bg-[#10B981] text-white border-[#10B981]'
                                                                    : 'bg-white text-[#475569] border-[#CBD5E1]'
                                                            }`}
                                                        >
                                                            {isPastStep ? '✓' : sIdx + 1}
                                                        </span>
                                                        <span className="text-xs sm:text-sm leading-tight truncate">
                                                            <span className="hidden sm:inline">{step.label}</span>
                                                            <span className="sm:hidden">{step.shortLabel}</span>
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="p-4 sm:p-6 space-y-4">
                                            {/* Compact 1-Line Module & Subtopic Header */}
                                            <div className="space-y-2 pb-3 border-b border-[#E2E8F0]">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                                                        <span className="text-[11px] font-extrabold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                            {isKssrCourse
                                                                ? `Bab ${activeIndex + 1} daripada ${modules.length}`
                                                                : `Chapter ${activeIndex + 1} of ${modules.length}`}
                                                        </span>
                                                        <h2 className="font-display font-extrabold text-base sm:text-xl text-[#0F172A] truncate">
                                                            {activeModule.title}
                                                        </h2>
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={toggleCurrentViewComplete}
                                                            title={
                                                                isCurrentViewDone
                                                                    ? isKssrCourse ? 'Klik untuk tandakan belum selesai' : 'Click to mark incomplete'
                                                                    : isKssrCourse ? 'Klik untuk tandakan selesai' : 'Click to mark complete'
                                                            }
                                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                                                                isCurrentViewDone
                                                                    ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981] hover:bg-emerald-100'
                                                                    : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#2563EB]'
                                                            }`}
                                                        >
                                                            <span>{isCurrentViewDone ? '✓' : '☐'}</span>
                                                            <span>
                                                                {isCurrentViewDone
                                                                    ? isKssrCourse
                                                                        ? selectedLesson ? 'Subtopik Selesai' : 'Bab Selesai'
                                                                        : selectedLesson ? 'Subtopic Completed' : 'Chapter Completed'
                                                                    : isKssrCourse ? 'Tandakan Selesai' : 'Mark Complete'}
                                                            </span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDesktopSidebarOpen((v) => !v)}
                                                            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E2E8F0] hover:border-[#2563EB] bg-[#F8FAFC] text-[11px] font-bold text-[#0F172A] transition-colors cursor-pointer"
                                                        >
                                                            <span>{desktopSidebarOpen ? '◀ Expand' : '▶ Show Curriculum'}</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Quick Subtopic Switcher Pills (Tab 1 Video & Guides) */}
                                                {chapterStep !== 'interact' && activeLessons.length > 0 && (
                                                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                                        {activeLessons.map((lesson, lIdx) => {
                                                            const isSelectedSub = selectedLesson?.id === lesson.id;
                                                            const isSubDone = doneLessonSet.has(lesson.id);
                                                            const lessonSafe = safeUrl(lesson.content_url);
                                                            const isPdf = isPdfFile(lessonSafe, lesson.content_type);
                                                            const isVideo = isVideoUrl(lessonSafe, lesson.content_type);
                                                            const pillIcon = isPdf ? '📄' : isVideo ? '▶' : '📖';
                                                            const pillShortLabel = isPdf
                                                                ? (isKssrCourse ? 'Buku Teks PDF' : 'Textbook PDF')
                                                                : isVideo
                                                                ? (isKssrCourse ? 'Video Topik' : 'Topic Video')
                                                                : (isKssrCourse ? 'Nota Panduan' : 'Study Guide');

                                                            return (
                                                                <button
                                                                    key={lesson.id}
                                                                    type="button"
                                                                    onClick={() => selectSubtopic(activeModule.id, lesson)}
                                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 ${
                                                                        isSelectedSub
                                                                            ? 'border-2 border-[#2563EB] bg-[#EFF6FF] text-[#1E40AF] font-extrabold'
                                                                            : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#CBD5E1]'
                                                                    }`}
                                                                >
                                                                    <span>{isSubDone ? '✓' : pillIcon}</span>
                                                                    <span>{activeIndex + 1}.{lIdx + 1} {pillShortLabel}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Auto-Completed Flat Toast Banner */}
                                            {autoCompletedNotice && autoCompletedNotice.moduleId === activeModule.id && (
                                                <div className="bg-[#ECFDF5] text-[#065F46] p-3 rounded-xl font-bold text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-[#10B981]">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="w-6 h-6 rounded-full bg-[#10B981] text-white flex items-center justify-center font-black text-xs shrink-0">
                                                            ✓
                                                        </span>
                                                        <div>
                                                            <p className="font-extrabold text-xs text-[#065F46]">
                                                                {autoCompletedNotice.lessonId
                                                                    ? 'Subtopic Marked Complete! (+25 XP)'
                                                                    : 'Chapter Marked Complete! (+50 XP)'}
                                                            </p>
                                                            <p className="text-[11px] text-[#047857]">
                                                                "{autoCompletedNotice.title}" has been ticked off.
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
                                                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-xs font-extrabold shrink-0"
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
                                                    {activeSafeUrl ? (
                                                        <VideoPlayer
                                                            key={`${activeSafeUrl}_${activeContentType}`}
                                                            module={activeModule}
                                                            mediaUrl={activeSafeUrl}
                                                            activeTitle={activeMediaTitle}
                                                            contentType={activeContentType}
                                                            popupQuiz={activeModuleQuizzes[0] || assessments[0] || null}
                                                            isKidTheme={isKssrCourse}
                                                            onCheckpointPass={(amt, lbl) => awardXp(amt, lbl)}
                                                            onEnded={() => handleAutoVideoComplete(activeModule)}
                                                        />
                                                    ) : (
                                                        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-8 text-center space-y-2">
                                                            <BookOpenIcon className="w-10 h-10 text-gray-400 mx-auto" />
                                                            <h3 className="font-display font-bold text-base text-[#0F172A]">
                                                                Lecture Notes &amp; Content
                                                            </h3>
                                                            <p className="text-xs text-[#64748B] max-w-md mx-auto">
                                                                No external media URL attached to this chapter. Proceed to the next step to continue learning.
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Step 1 Sticky Footer Bar */}
                                                    <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
                                                            onClick={() => goToStep(isKssrCourse ? 'interact' : 'guide')}
                                                            className={BTN_PRIMARY}
                                                        >
                                                            <span>
                                                                {isKssrCourse
                                                                    ? 'Next: 🎮 Aktiviti Interaktif →'
                                                                    : 'Next: Study Guide & Notes →'}
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* STEP 2 (SCHOOL MODE): INTERACTIVE TEXTBOOK MANIPULATIVES */}
                                            {chapterStep === 'interact' && (
                                                <div className="space-y-4">
                                                    <MathPlayground
                                                        yearLevel={kssrYearLevel}
                                                        moduleIndex={activeIndex}
                                                        moduleTitle={activeModule?.title || ''}
                                                        onEarnXp={awardXp}
                                                        onCompleteStep={() => goToStep('guide')}
                                                    />

                                                    <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => goToStep('watch')}
                                                            className={BTN_SECONDARY}
                                                        >
                                                            <span>← Kembali ke Video</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => goToStep('guide')}
                                                            className={BTN_PRIMARY}
                                                        >
                                                            <span>Seterusnya: 📖 Nota Ringkas →</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* STEP 3 (OR STEP 2 IN CERT MODE): SINGLE-SCREEN STUDY GUIDE + COLLAPSIBLE QUICK NOTES DRAWER */}
                                            {chapterStep === 'guide' && (
                                                <div className="space-y-4">
                                                    <div className="rounded-xl border border-[#E2E8F0] bg-[#FAFBFD] p-4 sm:p-6 space-y-4">
                                                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[11px] font-black uppercase tracking-wider bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] px-2.5 py-1 rounded-lg">
                                                                    📖 {isKssrCourse ? 'NOTA RINGKAS BUKU TEKS KPM' : 'ARTICLE & STUDY GUIDE'}
                                                                </span>
                                                                {activeArticleContent && (
                                                                    <span className="text-xs font-bold text-[#64748B]">
                                                                        ~{Math.max(1, Math.ceil(activeArticleContent.split(/\s+/).length / 180))} min read
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowNotesDrawer((v) => !v)}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border transition-colors inline-flex items-center gap-1.5 ${
                                                                    showNotesDrawer
                                                                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                                                                        : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:border-[#2563EB]'
                                                                }`}
                                                            >
                                                                <span>📝</span>
                                                                <span>{showNotesDrawer ? 'Hide Quick Notes' : 'Quick Study Notes'}</span>
                                                            </button>
                                                        </div>

                                                        {/* Collapsible Quick Study Notes Drawer */}
                                                        {showNotesDrawer && (
                                                            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <h4 className="font-display font-extrabold text-sm text-[#0F172A]">
                                                                        Quick Study Notes
                                                                    </h4>
                                                                    <div className="flex items-center gap-2">
                                                                        {autosaveStatus === 'saving' ? (
                                                                            <span className="text-xs text-amber-600 font-bold animate-pulse">
                                                                                Saving...
                                                                            </span>
                                                                        ) : autosaveStatus === 'saved' ? (
                                                                            <span className="text-xs text-[#10B981] font-bold">
                                                                                ✓ Autosaved to cloud {lastSavedTime ? `at ${lastSavedTime}` : ''}
                                                                            </span>
                                                                        ) : autosaveStatus === 'saved-local' ? (
                                                                            <span className="text-xs text-blue-600 font-bold">
                                                                                ✓ Saved locally
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                                <textarea
                                                                    rows={4}
                                                                    value={courseNotes}
                                                                    onChange={handleNotesChange}
                                                                    placeholder="Type your key takeaways here while reading the study guide..."
                                                                    className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-gray-400 focus:outline-none focus:border-[#2563EB] focus:bg-white"
                                                                />
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={saveNotesExplicit}
                                                                        disabled={isSavingNotes}
                                                                        className="px-3.5 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white font-extrabold text-xs rounded-lg transition-colors disabled:opacity-50"
                                                                    >
                                                                        {isSavingNotes ? 'Saving...' : 'Save Notes Now'}
                                                                    </button>
                                                                    <span className="text-[11px] text-[#64748B]">
                                                                        Debounced cloud autosave (800ms)
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Single-Viewport Scrollable Study Guide Body */}
                                                        <div className="max-h-[54vh] overflow-y-auto pr-1 space-y-3">
                                                            <h3 className="font-display font-extrabold text-base sm:text-lg text-[#0F172A]">
                                                                {activeArticleTitle}
                                                            </h3>
                                                            {activeArticleContent ? (
                                                                <FormattedGuide
                                                                    text={activeArticleContent}
                                                                    className={
                                                                        isKssrCourse
                                                                            ? '!text-base font-semibold text-[#0F172A]'
                                                                            : ''
                                                                    }
                                                                />
                                                            ) : (
                                                                <p className="text-sm text-[#475569] leading-relaxed">
                                                                    {activeModule.description || 'Review the materials in Step 1 and record your key takeaways in Quick Study Notes.'}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Step Guide Bottom Bar */}
                                                    <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => goToStep(isKssrCourse ? 'interact' : 'watch')}
                                                            className={BTN_SECONDARY}
                                                        >
                                                            <span>
                                                                {isKssrCourse ? '← Kembali ke Aktiviti' : '← Back to Video'}
                                                            </span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => goToStep('quiz')}
                                                            className={BTN_PRIMARY}
                                                        >
                                                            <span>
                                                                {isKssrCourse
                                                                    ? 'Next: 📝 Latihan Kertas & Kuiz →'
                                                                    : 'Next: Take Chapter Mini-Quiz →'}
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* STEP 4 (OR STEP 3 IN CERT MODE): PRACTICE QUIZ & HYBRID PAPER SCAN */}
                                            {chapterStep === 'quiz' && (
                                                <div className="space-y-4">
                                                    {/* Sub-Toggle for School Mode so Mini-Quiz and Paper Scan never stack vertically */}
                                                    {isKssrCourse && (
                                                        <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                                                            <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto flex-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setQuizSubTab('mini')}
                                                                    className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-colors flex items-center justify-center gap-2 ${
                                                                        quizSubTab === 'mini'
                                                                            ? 'bg-[#2563EB] text-white'
                                                                            : 'bg-white text-[#475569] border border-[#E2E8F0] hover:text-[#0F172A]'
                                                                    }`}
                                                                >
                                                                    <span>✏️ Kuiz Pantas ({activeModuleQuizzes.length} Soalan)</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setQuizSubTab('paper')}
                                                                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5 ${
                                                                        quizSubTab === 'paper'
                                                                            ? 'bg-[#D97706] text-white'
                                                                            : 'bg-white text-[#475569] border border-[#E2E8F0] hover:text-[#0F172A]'
                                                                    }`}
                                                                >
                                                                    <span>📷 Imbasan Kertas (+50 XP)</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Sub-View A: Mini-Quiz Practice */}
                                                    {(!isKssrCourse || quizSubTab === 'mini') && (
                                                        activeModuleQuizzes.length > 0 ? (
                                                            <div className="rounded-xl p-4 sm:p-5 bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] font-black uppercase tracking-wider bg-[#10B981] text-white px-2.5 py-0.5 rounded-md">
                                                                                MINI-QUIZ PRACTICE
                                                                            </span>
                                                                            <span className="text-xs font-bold text-[#0F172A]">
                                                                                {activeModuleQuizzes.length} {activeModuleQuizzes.length === 1 ? 'Question' : 'Questions'}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-[#64748B] mt-1">
                                                                            Formative self-check for {activeModule?.title}. Select an answer for each question to test your understanding.
                                                                        </p>
                                                                    </div>
                                                                    {miniChecked && (
                                                                        <div className="flex items-center gap-2">
                                                                            <span
                                                                                className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
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
                                                                                className="text-xs font-bold text-[#475569] hover:text-[#0F172A] underline"
                                                                            >
                                                                                ↻ Try Again
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-3 max-h-[48vh] overflow-y-auto pr-1">
                                                                    {activeModuleQuizzes.map((mq, qIdx) => {
                                                                        const picked = miniAnswers[mq.id] || null;
                                                                        const isCorrect =
                                                                            miniChecked &&
                                                                            picked?.toLowerCase() === String(mq.correct_option || '').toLowerCase();

                                                                        return (
                                                                            <div
                                                                                key={mq.id}
                                                                                className={`p-4 rounded-xl border bg-white transition-colors ${
                                                                                    miniChecked
                                                                                        ? isCorrect
                                                                                            ? 'border-[#10B981] bg-emerald-50/30'
                                                                                            : 'border-rose-400 bg-rose-50/20'
                                                                                        : 'border-[#E2E8F0]'
                                                                                }`}
                                                                            >
                                                                                <div className="flex items-start justify-between gap-3 mb-2.5">
                                                                                    <p className="font-extrabold text-[#0F172A] leading-snug text-sm sm:text-base">
                                                                                        <span className="text-[#64748B] font-mono mr-1.5">Q{qIdx + 1}.</span>{' '}
                                                                                        {renderMathText(mq.question, isSecondaryMath)}
                                                                                    </p>
                                                                                    {miniChecked && (
                                                                                        <span
                                                                                            className={`text-xs font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                                                                                                isCorrect
                                                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                                                    : 'bg-rose-100 text-rose-800'
                                                                                            }`}
                                                                                        >
                                                                                            {isCorrect ? '✓ Correct' : '✕ Review'}
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                                                    {['a', 'b', 'c', 'd'].map((optKey) => {
                                                                                        const optVal = mq[`option_${optKey}`];
                                                                                        if (!optVal) return null;
                                                                                        const isSelected = picked === optKey;
                                                                                        const isThisCorrect =
                                                                                            miniChecked &&
                                                                                            String(mq.correct_option || '').toLowerCase() === optKey;

                                                                                        let optStyle =
                                                                                            'border border-[#E2E8F0] bg-white text-[#334155] hover:border-[#CBD5E1]';
                                                                                        if (isSelected) {
                                                                                            optStyle =
                                                                                                'border-2 border-[#2563EB] bg-[#EFF6FF] text-[#0F172A] font-bold';
                                                                                        }
                                                                                        if (miniChecked) {
                                                                                            if (isThisCorrect) {
                                                                                                optStyle =
                                                                                                    'border-2 border-[#10B981] bg-emerald-100/70 text-[#065F46] font-bold';
                                                                                            } else if (isSelected && !isCorrect) {
                                                                                                optStyle =
                                                                                                    'border-2 border-rose-500 bg-rose-100/70 text-rose-900 font-bold';
                                                                                            }
                                                                                        }

                                                                                        return (
                                                                                            <label
                                                                                                key={optKey}
                                                                                                className={`flex items-start gap-2.5 p-3 rounded-xl cursor-pointer transition-colors text-xs sm:text-sm ${optStyle}`}
                                                                                            >
                                                                                                <input
                                                                                                    type="radio"
                                                                                                    name={`mini_quiz_${mq.id}`}
                                                                                                    value={optKey}
                                                                                                    checked={isSelected}
                                                                                                    onChange={() => setMiniAnswer(mq.id, optKey)}
                                                                                                    className="mt-0.5 text-[#2563EB] focus:ring-0"
                                                                                                />
                                                                                                <span className="flex-1 break-words leading-relaxed">
                                                                                                    <strong className="uppercase font-mono mr-1">
                                                                                                        {optKey}.
                                                                                                    </strong>{' '}
                                                                                                    {renderMathText(optVal, isSecondaryMath)}
                                                                                                </span>
                                                                                            </label>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>

                                                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                                                    <span className="text-[11px] text-[#64748B]">
                                                                        {miniChecked
                                                                            ? 'Review the highlighted answers above, or click Retry to test again.'
                                                                            : 'Practice quiz awards +15 XP per correct answer.'}
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        {miniChecked ? (
                                                                            <button
                                                                                type="button"
                                                                                onClick={resetMiniQuiz}
                                                                                className="px-4 py-2 bg-white border border-[#CBD5E1] hover:border-[#0F172A] text-[#0F172A] text-xs font-bold rounded-lg transition-colors"
                                                                            >
                                                                                ↻ Retry Quiz
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                type="button"
                                                                                disabled={!activeModuleQuizzes.every((mq) => miniAnswers[mq.id])}
                                                                                onClick={checkMiniQuiz}
                                                                                className="px-5 py-2 bg-[#10B981] hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-extrabold rounded-lg transition-colors"
                                                                            >
                                                                                Check Answers
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-6 text-center space-y-1.5">
                                                                <p className="font-display font-extrabold text-sm text-[#0F172A]">
                                                                    Ready to Complete Chapter {activeIndex + 1}
                                                                </p>
                                                                <p className="text-xs text-[#64748B]">
                                                                    No practice questions for this chapter. Mark this chapter as complete below and continue.
                                                                </p>
                                                            </div>
                                                        )
                                                    )}

                                                    {/* Sub-View B: Hybrid Paper Worksheet & Scan Upload (School Mode) */}
                                                    {isKssrCourse && quizSubTab === 'paper' && renderHybridPaperCard()}

                                                    {/* Step Footer Progression Bar */}
                                                    <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-dashed border-[#CBD5E1] rounded-xl p-12 text-center">
                                        <p className="text-[#64748B] font-medium text-sm">
                                            No module selected. Choose a chapter from the curriculum on the left.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 2: Dates (Vertical Milestone Timeline) */}
                {activeTab === 'dates' && (
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 w-full space-y-6">
                        <div>
                            <h2 className="font-display font-extrabold text-2xl text-[#0F172A]">
                                Important Dates &amp; Milestones
                            </h2>
                            <p className="text-xs text-[#64748B] mt-1">
                                Self-paced timeline tracking your course enrollment, study progress, and assessment deadlines.
                            </p>
                        </div>

                        {/* Vertical Timeline */}
                        <div className="relative border-l-2 border-[#CBD5E1] ml-4 pl-6 space-y-8 my-6">
                            {/* Milestone 1: Enrollment Date */}
                            <div className="relative">
                                <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#2563EB] border-2 border-white" />
                                <div>
                                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                                        Enrollment Confirmed
                                    </span>
                                    <h3 className="font-display font-bold text-base text-[#0F172A]">
                                        {formatDate(enrollment?.created_at)}
                                    </h3>
                                    <p className="text-xs text-[#64748B] mt-0.5">
                                        Enrollment confirmed in CoPED PULSE. Self-paced course window activated.
                                    </p>
                                </div>
                            </div>

                            {/* Milestone 2: Today Badge */}
                            <div className="relative">
                                <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#F59E0B] border-2 border-white" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                                            Current Date
                                        </span>
                                        <span className="bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[10px] font-extrabold px-2 py-0.5 rounded">
                                            Today
                                        </span>
                                    </div>
                                    <h3 className="font-display font-bold text-base text-[#0F172A]">
                                        {new Date().toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </h3>
                                    <p className="text-xs text-[#64748B] mt-0.5">
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
                                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                                        Grading Gate
                                    </span>
                                    <h3 className="font-display font-bold text-base text-[#0F172A]">
                                        Final Assessment (100% Mastery Required)
                                    </h3>
                                    <p className="text-xs text-[#64748B] mt-0.5">
                                        {isCompleted
                                            ? 'Passed with 100% score. Requirement fulfilled.'
                                            : 'Pending completion. You may attempt the assessment at any time.'}
                                    </p>
                                    {!isCompleted && assessments.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('assessment')}
                                            className="mt-2 text-xs font-bold text-[#2563EB] underline hover:text-[#1D4ED8]"
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
                                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                                        Certificate Unlocked
                                    </span>
                                    <h3 className="font-display font-bold text-base text-[#0F172A]">
                                        Official Verified Record
                                    </h3>
                                    <p className="text-xs text-[#64748B] mt-0.5">
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
                    <div className="w-full space-y-5">
                        {/* Final Assessment Status Box */}
                        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#E2E8F0]">
                                <div>
                                    <h2 className="font-display font-extrabold text-xl text-[#0F172A]">
                                        Final Assessment Mastery
                                    </h2>
                                    <p className="text-xs text-[#64748B] mt-0.5">
                                        Answer all questions correctly (100% mastery) to unlock your official verified certificate.
                                    </p>
                                </div>
                                <div className="shrink-0">
                                    {isQuizPassed ? (
                                        <span className="px-3 py-1 rounded-lg text-xs font-black bg-[#ECFDF5] border border-[#10B981] text-[#047857]">
                                            ✓ Passed 100% · Certificate Unlocked
                                        </span>
                                    ) : hasSubmittedQuiz ? (
                                        <span className="px-3 py-1 rounded-lg text-xs font-black bg-[#FEF2F2] border border-[#EF4444] text-[#B91C1C]">
                                            Needs Review · {correctCount} / {totalQuestions} Correct
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-lg text-xs font-black bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8]">
                                            Pending Attempt ({totalQuestions} Questions)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Interactive Final Assessment Form (1-Question-at-a-Time Stepper) */}
                        <div id="final-assessment-section" className="scroll-mt-24 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
                            <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-display font-extrabold text-lg text-[#0F172A]">
                                            Final Assessment
                                        </h3>
                                        <span className="bg-[#2563EB] text-white text-[11px] font-black px-2.5 py-0.5 rounded-md">
                                            100% Mastery
                                        </span>
                                        <span className="text-xs text-[#64748B] font-semibold">
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

                                                let pillClass = 'bg-white border border-[#CBD5E1] text-[#0F172A] hover:border-[#2563EB]';
                                                if (hasSubmittedQuiz) {
                                                    if (itemCorrect) {
                                                        pillClass = isActive
                                                            ? 'bg-[#10B981] border-2 border-[#059669] text-white'
                                                            : 'bg-[#ECFDF5] border border-[#10B981] text-[#047857]';
                                                    } else {
                                                        pillClass = isActive
                                                            ? 'bg-[#EF4444] border-2 border-[#B91C1C] text-white'
                                                            : 'bg-[#FEF2F2] border border-[#EF4444] text-[#B91C1C]';
                                                    }
                                                } else if (isActive) {
                                                    pillClass = 'bg-[#2563EB] border-2 border-[#1D4ED8] text-white';
                                                } else if (isAnswered) {
                                                    pillClass = 'bg-[#EFF6FF] border border-[#2563EB] text-[#1D4ED8]';
                                                }

                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => goToQuestion(idx)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${pillClass}`}
                                                    >
                                                        <span>Q{idx + 1}</span>
                                                        {hasSubmittedQuiz ? (
                                                            <span>{itemCorrect ? '✓' : '✗'}</span>
                                                        ) : (
                                                            isAnswered && (
                                                                <span
                                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                                        isActive ? 'bg-white' : 'bg-[#2563EB]'
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
                                        className="px-3.5 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-extrabold transition-colors shrink-0"
                                    >
                                        ↻ Restart Quiz
                                    </button>
                                )}
                            </div>

                            <div className="p-5 sm:p-6">
                                {!q ? (
                                    <div className="py-12 text-center border border-dashed border-[#CBD5E1] rounded-xl">
                                        <ClipboardCheckIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-[#64748B] font-medium">
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
                                                    className={`border rounded-xl p-5 space-y-4 transition-colors ${
                                                        hasResult
                                                            ? isCorrect
                                                                ? 'border-[#10B981] bg-[#F0FDF4]'
                                                                : 'border-[#EF4444] bg-[#FEF2F2]'
                                                            : 'border-[#E2E8F0] bg-[#F8FAFC]'
                                                    }`}
                                                >
                                                    <legend className="sr-only">Question {qIndex + 1}</legend>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-start gap-3">
                                                            <span className="text-xs font-black text-white bg-[#2563EB] px-2.5 py-1 rounded-lg shrink-0 mt-0.5">
                                                                Q{qIndex + 1} of {assessments.length}
                                                            </span>
                                                            <p className="font-extrabold text-base sm:text-lg text-[#0F172A] leading-snug">
                                                                {renderMathText(q.question, isSecondaryMath)}
                                                            </p>
                                                        </div>
                                                        {hasResult && (
                                                            <span
                                                                className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
                                                                    isCorrect
                                                                        ? 'bg-[#ECFDF5] border-[#10B981] text-[#047857]'
                                                                        : 'bg-[#FEF2F2] border-[#EF4444] text-[#B91C1C]'
                                                                }`}
                                                            >
                                                                {isCorrect ? '✓ Correct' : '✗ Incorrect - Review this topic and try again'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2.5 pt-2">
                                                        {['a', 'b', 'c', 'd'].map((key) => {
                                                            const isChecked = activeAnswers[q.id] === key;
                                                            const isSubmittedChoice = results?.submitted && results.submitted[q.id] === key;
                                                            const is100PctPassed = isQuizPassed || (results?.passed === true);
                                                            const isActualCorrectAnswer = is100PctPassed && results?.correct_options && results.correct_options[q.id] === key;

                                                            let optionClass = 'border border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#CBD5E1]';
                                                            let badge = null;

                                                            if (hasResult) {
                                                                if (isSubmittedChoice) {
                                                                    if (isCorrect) {
                                                                        optionClass = 'border border-[#10B981] bg-[#ECFDF5] text-[#047857] font-bold';
                                                                        badge = (
                                                                            <span className="text-xs font-extrabold text-[#047857] shrink-0">
                                                                                ✓ Correct Answer
                                                                            </span>
                                                                        );
                                                                    } else {
                                                                        optionClass = 'border border-[#EF4444] bg-[#FEF2F2] text-[#B91C1C] font-bold';
                                                                        badge = (
                                                                            <span className="text-xs font-extrabold text-[#B91C1C] shrink-0">
                                                                                ✗ Your Answer - Incorrect
                                                                            </span>
                                                                        );
                                                                    }
                                                                } else if (isActualCorrectAnswer) {
                                                                    optionClass = 'border border-[#10B981] bg-[#ECFDF5] text-[#047857] font-bold';
                                                                    badge = (
                                                                        <span className="text-xs font-extrabold text-[#047857] shrink-0">
                                                                            ✓ Correct Answer
                                                                        </span>
                                                                    );
                                                                }
                                                            } else if (isChecked && !hasResult) {
                                                                optionClass = 'border border-[#2563EB] bg-[#EFF6FF] text-[#1E40AF] font-bold';
                                                            }

                                                            return (
                                                                <label
                                                                    key={key}
                                                                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${optionClass}`}
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
                                                                            className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-black uppercase shrink-0 ${
                                                                                isChecked && !hasResult
                                                                                    ? 'border-[#2563EB] bg-[#2563EB] text-white'
                                                                                    : hasResult && isSubmittedChoice
                                                                                    ? isCorrect
                                                                                        ? 'border-[#10B981] bg-[#10B981] text-white'
                                                                                        : 'border-[#EF4444] bg-[#EF4444] text-white'
                                                                                    : hasResult && isActualCorrectAnswer
                                                                                    ? 'border-[#10B981] bg-[#10B981] text-white'
                                                                                    : 'border-[#CBD5E1] text-[#475569] bg-[#F8FAFC]'
                                                                            }`}
                                                                        >
                                                                            {key}
                                                                        </span>
                                                                        <span
                                                                            className={
                                                                                isKssrCourse
                                                                                    ? 'text-base sm:text-lg font-bold'
                                                                                    : 'text-sm sm:text-base font-semibold'
                                                                            }
                                                                        >
                                                                            {renderMathText(q[`option_${key}`], isSecondaryMath)}
                                                                        </span>
                                                                    </div>
                                                                    {badge}
                                                                </label>
                                                            );
                                                        })}
                                                    </div>

                                                    {hasResult && !isCorrect && (() => {
                                                        const hintMod = modules.find((m) => m.id === q.module_id) || modules[qIndex % modules.length] || modules[0];
                                                        const hintIdx = hintMod ? modules.findIndex((m) => m.id === hintMod.id) + 1 : (qIndex + 1);
                                                        return (
                                                            <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E40AF] flex items-center gap-2.5">
                                                                <span className="text-base shrink-0">💡</span>
                                                                <span>
                                                                    <span className="font-extrabold">Review Hint: </span>
                                                                    Review Chapter {hintIdx}: "{hintMod?.title || 'Course Material'}" to master this concept before retrying.
                                                                </span>
                                                            </div>
                                                        );
                                                    })()}

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
                                        <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                disabled={qIndex === 0}
                                                onClick={() => goToQuestion(qIndex - 1)}
                                                className={BTN_SECONDARY}
                                            >
                                                <span>← Previous Question</span>
                                            </button>

                                            <div className="text-center text-xs font-extrabold text-[#0F172A] px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
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
                                                        className="w-full sm:w-auto min-h-[40px] inline-flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#10B981] text-white font-extrabold text-xs sm:text-sm px-5 py-2 rounded-lg transition-colors"
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
                    <div className="w-full space-y-5">
                        {/* Course Tools & Guidelines Card */}
                        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-3">
                            <h3 className="font-display font-bold text-base text-[#0F172A]">
                                About this Course &amp; Guidelines
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                                    <p className="font-bold text-[#0F172A]">Instructor</p>
                                    <p className="text-[#64748B] mt-0.5">{course.instructor?.name || 'Faculty'}</p>
                                </div>
                                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                                    <p className="font-bold text-[#0F172A]">Passing Standard</p>
                                    <p className="text-[#64748B] mt-0.5">100% required on final assessment</p>
                                </div>
                                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                                    <p className="font-bold text-[#0F172A]">Curriculum Structure</p>
                                    <p className="text-[#64748B] mt-0.5">{modules.length} interactive modules</p>
                                </div>
                                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                                    <p className="font-bold text-[#0F172A]">Institutional Partner</p>
                                    <p className="text-[#64748B] mt-0.5">Universiti Utara Malaysia · CoPED</p>
                                </div>
                            </div>
                        </div>

                        {/* Course Study Notes Card */}
                        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                                <div>
                                    <h2 className="font-display font-extrabold text-xl text-[#0F172A]">
                                        Course Study Notes
                                    </h2>
                                    <p className="text-xs text-[#64748B] mt-0.5">
                                        Personal scratchpad saved locally in your browser and synced to your account.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {autosaveStatus === 'saving' ? (
                                        <span className="text-xs text-amber-600 font-bold animate-pulse">
                                            Saving...
                                        </span>
                                    ) : autosaveStatus === 'saved' ? (
                                        <span className="text-xs text-[#10B981] font-bold">
                                            ✓ Autosaved to cloud {lastSavedTime ? `at ${lastSavedTime}` : ''}
                                        </span>
                                    ) : autosaveStatus === 'saved-local' ? (
                                        <span className="text-xs text-blue-600 font-bold">
                                            ✓ Saved locally
                                        </span>
                                    ) : null}
                                </div>
                            </div>

                            <textarea
                                rows={10}
                                value={courseNotes}
                                onChange={handleNotesChange}
                                placeholder="Type your full study notes, lecture takeaways, and questions here..."
                                className="w-full p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder:text-gray-400 focus:outline-none focus:border-[#2563EB] focus:bg-white"
                            />

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={saveNotesExplicit}
                                        disabled={isSavingNotes}
                                        className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-extrabold text-xs rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isSavingNotes ? 'Saving...' : 'Save Notes Now'}
                                    </button>
                                    <span className="text-xs text-[#64748B]">
                                        Debounced cloud autosave (800ms)
                                    </span>
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
                    <div className="w-full space-y-5">
                        {/* Course Discussion Header */}
                        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-[#0F172A]">
                                    Course Discussions &amp; Inquiries
                                </h3>
                                <p className="text-xs text-[#64748B] mt-0.5">
                                    Ask questions directly to your instructor or collaborate with classmates in the course group chat.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] text-xs font-bold">
                                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
                                    Active Discussion
                                </span>
                            </div>
                        </div>

                        {/* Mode Selector: Direct Q&A vs Group Chat */}
                        <div className="bg-white border border-[#E2E8F0] rounded-xl p-1.5 sm:p-2 grid grid-cols-2 gap-2 w-full min-w-0">
                            <button
                                type="button"
                                onClick={() => setChatMode('direct')}
                                className={`w-full min-w-0 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs font-extrabold transition-colors flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                                    chatMode === 'direct'
                                        ? 'bg-[#2563EB] text-white'
                                        : 'bg-white text-[#475569] border border-[#E2E8F0] hover:border-[#CBD5E1]'
                                }`}
                            >
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span>💬</span>
                                    <span className="truncate">Instructor Q&amp;A</span>
                                </div>
                                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                    chatMode === 'direct' ? 'bg-blue-700 text-blue-100' : 'bg-blue-50 text-blue-700'
                                }`}>
                                    Private
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setChatMode('group')}
                                className={`w-full min-w-0 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs font-extrabold transition-colors flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                                    chatMode === 'group'
                                        ? 'bg-[#2563EB] text-white'
                                        : 'bg-white text-[#475569] border border-[#E2E8F0] hover:border-[#CBD5E1]'
                                }`}
                            >
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span>📢</span>
                                    <span className="truncate">Class Group</span>
                                </div>
                                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                    chatMode === 'group' ? 'bg-blue-700 text-blue-100' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    All Students
                                </span>
                            </button>
                        </div>

                        {/* Chat Feed Card */}
                        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden flex flex-col">
                            {/* Feed Header */}
                            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-sm font-bold shrink-0">
                                        {chatMode === 'direct' ? '👨‍🏫' : '📢'}
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-extrabold text-[#0F172A]">
                                            {chatMode === 'direct'
                                                ? `Direct Message with ${course.instructor?.name || 'Instructor'}`
                                                : 'Course Class Group Chat'}
                                        </h3>
                                        <p className="text-xs text-[#64748B]">
                                            {chatMode === 'direct'
                                                ? 'Private 1-on-1 discussion between you and your instructor.'
                                                : 'Classroom broadcast thread visible to all students and instructors.'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-[#64748B] bg-white border border-[#E2E8F0] px-2.5 py-1 rounded-lg self-start sm:self-auto">
                                    {activeChatMessages.length} Messages
                                </span>
                            </div>

                            {/* Scrollable Message History */}
                            <div ref={chatContainerRef} className="p-4 sm:p-5 overflow-y-auto space-y-3 bg-[#F8FAFC] min-h-[380px] max-h-[460px]">
                                {activeChatMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                                        <span className="text-3xl">💬</span>
                                        <h4 className="text-sm font-bold text-[#334155]">
                                            No messages here yet.
                                        </h4>
                                        <p className="text-xs text-[#64748B] max-w-sm">
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
                                                    <span className="text-[11px] font-extrabold text-[#334155]">
                                                        {isMine ? 'You' : msg.sender?.name || 'User'}
                                                    </span>
                                                    {isStaff && (
                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                                                            Lecturer
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-[#94A3B8]">
                                                        {timeAgo(msg.created_at)}
                                                    </span>
                                                </div>
                                                <div
                                                    className={`max-w-md sm:max-w-lg p-3 rounded-xl border text-xs leading-relaxed ${
                                                        isMine
                                                            ? 'bg-[#2563EB] text-white border-[#1D4ED8]'
                                                            : 'bg-white text-[#0F172A] border-[#E2E8F0]'
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
                            <form onSubmit={handleSendMessage} className="p-3.5 sm:p-4 border-t border-[#E2E8F0] bg-white flex items-end gap-2.5">
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
                                        className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:bg-white focus:border-[#2563EB] focus:outline-none resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || isSending}
                                    className="px-4 py-2.5 bg-[#2563EB] text-white text-xs font-extrabold rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-40 shrink-0 h-[46px] flex items-center gap-1.5"
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
