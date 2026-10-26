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
import { safeUrl, formatEmbedUrl, getYouTubeId, isVideoUrl } from '@/Utils/mediaUtils';

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
    const resumeModule = useMemo(() => {
        return modules.find((m) => !doneSet.has(m.id)) ?? modules[0] ?? null;
    }, [modules, doneSet]);

    // Active selected module in the stage
    const [activeModuleId, setActiveModuleId] = useState(resumeModule?.id ?? modules[0]?.id ?? null);

    // State for instant automatic/manual completion banner
    const [autoCompletedNotice, setAutoCompletedNotice] = useState(null);

    // Mobile curriculum accordion toggle state
    const [mobileCurriculumOpen, setMobileCurriculumOpen] = useState(false);

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
        if (tabParam && ['course', 'dates', 'assessment', 'notes', 'chat'].includes(tabParam)) {
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
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left Curriculum Outline (order-2 lg:order-1 lg:col-span-4) */}
                            <div className="order-2 lg:order-1 lg:col-span-4 space-y-4">
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
                            <div className="order-1 lg:order-2 lg:col-span-8 space-y-6">
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

                                        {/* Unified 3-Action Bottom Control Bar */}
                                        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t-2 border-[#E5E7EB]">
                                            {prevModule ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveModuleId(prevModule.id)}
                                                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 bg-white border-2 border-[#E5E7EB] hover:border-[#111827] text-[#111827] font-bold text-xs px-4 py-2.5 rounded-md transition-colors"
                                                >
                                                    <span>← Previous Unit</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 bg-gray-100 border-2 border-[#E5E7EB] text-gray-400 font-bold text-xs px-4 py-2.5 rounded-md cursor-not-allowed"
                                                >
                                                    <span>← Previous Unit</span>
                                                </button>
                                            )}

                                            {doneSet.has(activeModule.id) ? (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 bg-emerald-50 border-2 border-[#10B981] text-[#10B981] font-bold text-xs px-5 py-2.5 rounded-md cursor-default"
                                                >
                                                    <span>✓ Module Completed</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleMarkComplete(activeModule.id)}
                                                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-md transition-transform active:scale-[0.98]"
                                                >
                                                    <span>✓ Mark Module as Complete</span>
                                                </button>
                                            )}

                                            {nextModule ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveModuleId(nextModule.id)}
                                                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs px-4 py-2.5 rounded-md transition-transform active:scale-[0.98]"
                                                >
                                                    <span>Next Module →</span>
                                                </button>
                                            ) : assessments.length > 0 ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('assessment')}
                                                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-md transition-transform active:scale-[0.98]"
                                                >
                                                    <span>🎯 Take Final Assessment →</span>
                                                </button>
                                            ) : (
                                                <div className="hidden sm:block w-28" />
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

                            {/* Success/error flash is rendered globally by LearnerLayout */}
                            {flash?.assessment_score !== undefined && !flash?.assessment_passed && (
                                <div className="bg-[#FEF3C7] border-2 border-[#F59E0B] text-[#111827] p-4 rounded-md text-xs font-bold">
                                    You scored {flash.assessment_score}%. 100% is required to pass. Please review your answers and retry.
                                </div>
                            )}

                            {isCompleted && (
                                <Link
                                    href={route('learner.course.certificate', course.id)}
                                    className="inline-flex items-center justify-center gap-1.5 bg-[#111827] hover:bg-[#10B981] text-white font-bold text-xs px-4 py-2.5 rounded transition-colors duration-200"
                                >
                                    <span>🎓 View &amp; Download Certificate PDF</span>
                                </Link>
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

                {/* Tab 5: Chat with Instructor & Course Group */}
                {activeTab === 'chat' && (
                    <div className="max-w-4xl space-y-6">
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
