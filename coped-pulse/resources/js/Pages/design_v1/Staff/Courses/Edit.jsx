import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';
import ModuleCard from './Partials/ModuleCard';
import {
    formatEmbedUrl,
    getYouTubeId,
    isPdfFile,
    isVideoFile,
    isVideoUrl,
    safeUrl,
} from '@/Utils/mediaUtils';
import CourseLogoBadge, { LOGO_CONFIG, COURSE_THEME_COLORS, RANDOM_THEME_KEYS } from '@/Components/flat/CourseLogoBadge';

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

export default function Edit({
    course,
    initialMode = 'editor',
    enrolledCount = 0,
    moduleCompletions = {},
    instructors = [],
    isCoordinator = false,
    chatMessages = [],
}) {
    const { flash } = usePage().props;
    const modules = course.modules || [];
    const enrollments = course.enrollments || [];
    const instructor = course.instructor;
    const assessments = course.assessments || [];
    const finalAssessments = assessments.filter((q) => !q.module_id);

    // Workspace Mode: 'editor' (Curriculum & Studio Editor) | 'preview' (Learner Preview Mode)
    const [mode, setMode] = useState(initialMode);

    // 5-Tab Navigation: 'curriculum' | 'settings' | 'participants' | 'grades' | 'chat'
    const [courseTab, setCourseTab] = useState('curriculum');

    // Chat State
    const [messages, setMessages] = useState(chatMessages || []);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [chatSearch, setChatSearch] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const chatContainerRef = useRef(null);
    const prevLastMessageIdRef = useRef(null);
    const prevThreadKeyRef = useRef(null);
    const prevCourseTabRef = useRef(null);

    // Mobile Responsive Viewport States
    const [mobileIndexOpen, setMobileIndexOpen] = useState(false);
    const [mobileChatView, setMobileChatView] = useState('list'); // 'list' | 'thread'

    // Read ?tab=... query parameter from URL on load
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam && ['curriculum', 'settings', 'participants', 'grades', 'chat'].includes(tabParam)) {
            setCourseTab(tabParam);
        }
    }, []);

    // Silent mark-read fetch when chat tab is active
    useEffect(() => {
        if (courseTab === 'chat') {
            fetch(route('courses.chat.mark-read', course.id), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                },
            }).catch(() => {});
        }
    }, [courseTab, course.id]);

    useEffect(() => {
        if (chatMessages) {
            setMessages(chatMessages);
        }
    }, [chatMessages]);

    useEffect(() => {
        if (courseTab !== 'chat') return;

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
                // ignore
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [courseTab, course.id]);

    const handleSendMessage = (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const bodyText = newMessage.trim();
        setIsSending(true);
        router.post(route('courses.chat.messages.store', course.id), {
            body: bodyText,
            recipient_id: selectedStudentId,
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

    const enrolledStudents = useMemo(() => {
        return (enrollments || []).map((e) => {
            const user = e.user || {};
            const progress = Math.min(100, Math.max(0, Math.round(Number(e.progress ?? 0))));
            return {
                id: user.id || e.user_id,
                name: user.name || 'Enrolled Student',
                email: user.email || 'N/A',
                role: user.role || 'learner',
                progress,
                isCertified: Boolean(e.completed_at),
            };
        });
    }, [enrollments]);

    const filteredChatStudents = useMemo(() => {
        if (!chatSearch.trim()) return enrolledStudents;
        const q = chatSearch.toLowerCase();
        return enrolledStudents.filter(
            (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
        );
    }, [enrolledStudents, chatSearch]);

    const groupMessages = useMemo(() => {
        return (messages || []).filter((m) => m.recipient_id === null);
    }, [messages]);

    const lastGroupMessage = groupMessages[groupMessages.length - 1];

    const getStudentDMs = (studentId) => {
        const sId = Number(studentId);
        return (messages || []).filter(
            (m) => m.recipient_id !== null && (Number(m.sender_id) === sId || Number(m.recipient_id) === sId)
        );
    };

    const activeThreadMessages = useMemo(() => {
        if (selectedStudentId === null) {
            return (messages || []).filter((m) => m.recipient_id === null);
        }
        const sId = Number(selectedStudentId);
        return (messages || []).filter(
            (m) => m.recipient_id !== null && (Number(m.sender_id) === sId || Number(m.recipient_id) === sId)
        );
    }, [messages, selectedStudentId]);

    const selectedStudent = useMemo(() => {
        if (selectedStudentId === null) return null;
        return enrolledStudents.find((s) => Number(s.id) === Number(selectedStudentId)) || null;
    }, [enrolledStudents, selectedStudentId]);

    useEffect(() => {
        if (courseTab !== 'chat') {
            prevCourseTabRef.current = courseTab;
            return;
        }

        const isTabJustSwitched = prevCourseTabRef.current !== 'chat';
        const isThreadSwitched = prevThreadKeyRef.current !== selectedStudentId;
        prevCourseTabRef.current = courseTab;
        prevThreadKeyRef.current = selectedStudentId;

        const lastMsg = activeThreadMessages[activeThreadMessages.length - 1];
        const lastMsgId = lastMsg?.id;
        const hasNewMessage = lastMsgId && lastMsgId !== prevLastMessageIdRef.current;
        prevLastMessageIdRef.current = lastMsgId;

        if (isTabJustSwitched || isThreadSwitched || hasNewMessage) {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }
    }, [courseTab, selectedStudentId, activeThreadMessages]);

    // Edit Mode Toggle: true (interactive builder) | false (read-only canvas)
    const [editMode, setEditMode] = useState(true);
    const [previewMaterial, setPreviewMaterial] = useState(null);

    // Settings sub-tab: 'identity' | 'pricing' | 'cert'
    const [settingsTab, setSettingsTab] = useState('identity');

    // 4-Tile Activity/Resource Modal
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [activityModalModule, setActivityModalModule] = useState(null);

    // Participants filter state
    const [participantSearch, setParticipantSearch] = useState('');
    const [letterFilter, setLetterFilter] = useState('ALL');

    // Reassign lecturer modal state
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedReassignInstructorId, setSelectedReassignInstructorId] = useState(course.instructor_id || '');
    const [isReassigning, setIsReassigning] = useState(false);

    const handleReassign = (e) => {
        e.preventDefault();
        if (!selectedReassignInstructorId) return;
        setIsReassigning(true);
        router.post(route('staff.courses.assign-instructor', course.id), {
            instructor_id: selectedReassignInstructorId,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsReassigning(false);
                setShowReassignModal(false);
            },
        });
    };

    // Active module in preview mode
    const [activeModuleId, setActiveModuleId] = useState(modules[0]?.id ?? null);
    const [selectedMediaUrl, setSelectedMediaUrl] = useState(null);
    const [selectedMediaTitle, setSelectedMediaTitle] = useState(null);

    const activeIndex = Math.max(0, modules.findIndex((m) => m.id === activeModuleId));
    const activeModule = modules[activeIndex] || modules[0] || null;
    const prevModule = activeIndex > 0 ? modules[activeIndex - 1] : null;
    const nextModule = activeIndex < modules.length - 1 ? modules[activeIndex + 1] : null;

    // Expand transcript drawer in preview
    const [showTranscript, setShowTranscript] = useState(false);

    // Course Details form
    const { data, setData, put, processing, errors } = useForm({
        title: course.title || '',
        description: course.description || '',
        status: course.status || 'draft',
        academic_year: course.academic_year || '2026 / 2027',
        category_logo: course.category_logo || 'general',
        billing_type: course.billing_type || 'free',
        price: course.price ? String(course.price) : '0.00',
        cert_title: course.cert_title || '',
        cert_url: course.cert_url || '',
        instructor_id: course.instructor_id || '',
    });

    const pickRandomColor = () => {
        const others = RANDOM_THEME_KEYS.filter((k) => k !== data.category_logo);
        const next = others[Math.floor(Math.random() * others.length)] || RANDOM_THEME_KEYS[0];
        setData('category_logo', next);
    };

    const submitCourse = (e) => {
        e.preventDefault();
        put(route('staff.courses.update', course), {
            preserveScroll: true,
        });
    };

    const addModule = () => {
        router.post(route('staff.courses.modules.store', course.id), {
            title: 'Untitled Module',
            content_type: 'link',
        });
    };

    const handleQuickRename = (targetModule, newTitle) => {
        if (!newTitle.trim()) return;
        router.put(
            route('staff.courses.modules.update', [course.id, targetModule.id]),
            {
                title: newTitle.trim(),
                description: targetModule.description || '',
                duration_minutes: targetModule.duration != null ? Math.round(targetModule.duration / 60) : null,
                content_type: targetModule.content_type || 'link',
                media_url: targetModule.media_url || null,
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const openAddActivityModal = (targetModule) => {
        setActivityModalModule(targetModule);
        setShowActivityModal(true);
    };

    const handleSelectModule = (modId) => {
        setActiveModuleId(modId);
        setSelectedMediaUrl(null);
        setSelectedMediaTitle(null);
    };

    const activeSafeUrl = selectedMediaUrl
        ? safeUrl(selectedMediaUrl)
        : safeUrl(activeModule?.media_url) || safeUrl((activeModule?.lessons || []).find((l) => l.content_url)?.content_url);
    const activeEmbedUrl = formatEmbedUrl(activeSafeUrl);
    const isVideo = isVideoUrl(activeSafeUrl);

    // Compute participants list with instructor at top (Safeguard #2)
    const allParticipants = useMemo(() => {
        const list = [];
        if (instructor) {
            list.push({
                id: `instructor-${instructor.id}`,
                name: instructor.name || 'Course Instructor',
                email: instructor.email || 'N/A',
                role: 'Lecturer',
                progress: 100,
                lastAccess: 'Live',
                status: 'Active',
                isInstructor: true,
            });
        }
        (enrollments || []).forEach((e) => {
            const user = e.user || {};
            list.push({
                id: `learner-${e.id}`,
                userId: user.id || e.user_id,
                name: user.name || 'Enrolled Student',
                email: user.email || 'N/A',
                role: 'Student',
                progress: Math.min(100, Math.max(0, Math.round(Number(e.progress ?? 0)))),
                lastAccess: timeAgo(e.updated_at || e.created_at),
                status: e.completed_at ? 'Certified' : 'Active',
                completedAt: e.completed_at,
                isInstructor: false,
            });
        });
        return list;
    }, [instructor, enrollments]);

    // Filter participants by search and alphabet
    const filteredParticipants = useMemo(() => {
        return allParticipants.filter((p) => {
            const q = participantSearch.trim().toLowerCase();
            const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
            if (!matchesSearch) return false;

            if (letterFilter === 'ALL') return true;
            return p.name.trim().toUpperCase().startsWith(letterFilter);
        });
    }, [allParticipants, participantSearch, letterFilter]);

    // Compute Grade Matrix records
    const gradeLearners = useMemo(() => {
        return (enrollments || []).map((e) => {
            const user = e.user || {};
            const uid = user.id || e.user_id;
            const comps = moduleCompletions[uid] || [];
            const completedModIds = new Set(comps.map((c) => c.module_id));

            return {
                id: e.id,
                userId: uid,
                name: user.name || 'Enrolled Student',
                email: user.email || 'N/A',
                progress: Math.min(100, Math.max(0, Math.round(Number(e.progress ?? 0)))),
                completedModIds,
                completedAt: e.completed_at,
            };
        });
    }, [enrollments, moduleCompletions]);

    const certifiedCount = gradeLearners.filter((g) => Boolean(g.completedAt)).length;
    const avgProgress = gradeLearners.length > 0
        ? Math.round(gradeLearners.reduce((sum, g) => sum + g.progress, 0) / gradeLearners.length)
        : 0;

    return (
        <StaffLayout>
            <Head title={`${course.title} · Course Management`} />

            {/* Moodle 4 Course Header & Secondary Navigation Container */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded mb-6 overflow-hidden">
                <div className="p-4 sm:p-5">
                    {/* Breadcrumb */}
                    <div className="flex items-center flex-wrap gap-1.5 text-xs text-gray-500 mb-2">
                        <Link href={route('dashboard')} className="hover:text-[#111827] hover:underline">
                            Dashboard
                        </Link>
                        <span>/</span>
                        <Link href={route('staff.courses.index')} className="hover:text-[#111827] hover:underline">
                            My courses
                        </Link>
                        <span>/</span>
                        <span className="text-[#111827] font-medium truncate max-w-xs">{course.title}</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <CourseLogoBadge category={data.category_logo} size="badge" />
                            <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight font-display">
                                {course.title}
                            </h1>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                course.status === 'published'
                                    ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]'
                                    : 'bg-[#F3F4F6] text-gray-700 border-[#D1D5DB]'
                            }`}>
                                {course.status === 'published' ? 'Published' : 'Draft'}
                            </span>
                            <span className="inline-flex items-center bg-[#F3F4F6] border border-[#D1D5DB] text-[11px] font-medium text-gray-700 px-2 py-0.5 rounded">
                                {data.academic_year || '2026 / 2027'}
                            </span>
                        </div>

                        {/* Right Controls: Publish, Learner Preview, and Moodle 4 "Edit mode" Switch */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {course.status === 'draft' && (
                                <button
                                    type="button"
                                    onClick={() => router.post(route('staff.courses.deploy', course.id), {}, { preserveScroll: true })}
                                    className="px-3.5 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white font-semibold text-xs rounded transition-colors shrink-0"
                                >
                                    Publish course
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => setMode(mode === 'editor' ? 'preview' : 'editor')}
                                className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors shrink-0 ${
                                    mode === 'preview'
                                        ? 'bg-[#111827] text-white border-[#111827]'
                                        : 'bg-white text-gray-700 border-[#D1D5DB] hover:bg-[#F3F4F6]'
                                }`}
                            >
                                {mode === 'preview' ? 'Exit learner preview' : 'Switch to learner view'}
                            </button>

                            {mode === 'editor' && (
                                <div className="flex items-center gap-2 border border-[#D1D5DB] bg-[#F8FAFC] rounded px-3 py-1 shrink-0">
                                    <span className="text-xs font-semibold text-[#111827]">Edit mode</span>
                                    <button
                                        type="button"
                                        onClick={() => setEditMode((v) => !v)}
                                        aria-pressed={editMode}
                                        title={editMode ? 'Turn editing off' : 'Turn editing on'}
                                        className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                                            editMode ? 'bg-[#2563EB] justify-end' : 'bg-gray-300 justify-start'
                                        }`}
                                    >
                                        <span className="bg-white w-4 h-4 rounded-full block border border-black/10" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Moodle 4 Contextual Secondary Navigation Bar (Underline Tabs, Zero Emojis) */}
                {mode === 'editor' && (
                    <div className="px-4 sm:px-5 border-t border-[#E5E7EB] bg-[#F8FAFC] flex overflow-x-auto whitespace-nowrap items-center gap-1" role="tablist">
                        {[
                            { id: 'curriculum', label: 'Course' },
                            { id: 'settings', label: 'Settings' },
                            { id: 'participants', label: `Participants (${enrollments.length})` },
                            { id: 'grades', label: 'Grades' },
                            { id: 'chat', label: 'Discussions' },
                        ].map((tab) => {
                            const active = courseTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => setCourseTab(tab.id)}
                                    className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors shrink-0 ${
                                        active
                                            ? 'border-[#111827] text-[#111827] bg-white'
                                            : 'border-transparent text-gray-600 hover:text-[#111827] hover:border-gray-300'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* MODE 1: MOODLE 4 COURSE WORKSPACE */}
            {mode === 'editor' && (
                <div className="space-y-6">
                    {!editMode && courseTab === 'curriculum' && (
                        <div className="bg-white border border-[#D1D5DB] rounded px-4 py-3 flex items-center justify-between gap-3 text-xs text-gray-600">
                            <span>
                                Viewing course in read-only mode. Turn on <strong className="text-[#111827]">Edit mode</strong> in the top-right corner to add or modify topics and activities.
                            </span>
                            <button
                                type="button"
                                onClick={() => setEditMode(true)}
                                className="px-3 py-1 rounded bg-[#111827] text-white font-semibold shrink-0"
                            >
                                Turn editing on
                            </button>
                        </div>
                    )}

                    {/* TAB 1: COURSE OUTLINE (Moodle 4 Left Course Index + Right Collapsible Topics) */}
                    {courseTab === 'curriculum' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* Left Column: Moodle Course Index Drawer */}
                            <div className="lg:col-span-3 space-y-3 lg:sticky lg:top-20">
                                <div className="lg:hidden">
                                    <button
                                        type="button"
                                        onClick={() => setMobileIndexOpen((v) => !v)}
                                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-[#D1D5DB] rounded text-xs font-semibold text-[#111827]"
                                    >
                                        <span>Course index ({modules.length} topics)</span>
                                        <span className="text-gray-500">{mobileIndexOpen ? 'Hide' : 'Show'}</span>
                                    </button>
                                </div>

                                <div className={`${mobileIndexOpen ? 'block' : 'hidden'} lg:block bg-white rounded border border-[#D1D5DB] p-4 space-y-3`}>
                                    <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E7EB]">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                            Course index
                                        </h3>
                                        <span className="text-[11px] font-medium text-gray-500">
                                            {modules.length} {modules.length === 1 ? 'topic' : 'topics'}
                                        </span>
                                    </div>

                                    {modules.length === 0 ? (
                                        <p className="text-xs text-gray-500 py-2">
                                            No topics added yet.
                                        </p>
                                    ) : (
                                        <nav className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
                                            {modules.map((m, idx) => (
                                                <div key={m.id} className="space-y-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const el = document.getElementById(`module-${m.id}`);
                                                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                                                        }}
                                                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#F3F4F6] text-xs font-semibold text-[#111827] flex items-center justify-between gap-2 transition-colors"
                                                    >
                                                        <span className="truncate">
                                                            Topic {idx + 1}: {m.title}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 shrink-0">
                                                            {m.lessons?.length || 0}
                                                        </span>
                                                    </button>

                                                    {m.lessons && m.lessons.length > 0 && (
                                                        <div className="pl-3 space-y-1 border-l border-[#E5E7EB] ml-2.5">
                                                            {m.lessons.map((lesson) => (
                                                                <div
                                                                    key={lesson.id}
                                                                    className="text-[11px] text-gray-600 truncate py-0.5"
                                                                >
                                                                    {lesson.title}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </nav>
                                    )}

                                    <div className="pt-2 border-t border-[#E5E7EB]">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const el = document.getElementById('final-exam-section');
                                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#F3F4F6] text-xs font-semibold text-[#111827] flex items-center justify-between transition-colors"
                                        >
                                            <span>Final Assessment</span>
                                            <span className="text-[10px] text-gray-500">{finalAssessments.length} Qs</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Moodle Course Sections */}
                            <div className="lg:col-span-9 space-y-4">
                                {/* General / Course Summary Section */}
                                <div className="bg-white rounded border border-[#D1D5DB] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                            General
                                        </span>
                                        <h2 className="text-base sm:text-lg font-bold text-[#111827] font-display">
                                            Course Outline &amp; Topics
                                        </h2>
                                        {course.description && (
                                            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                                                {course.description}
                                            </p>
                                        )}
                                    </div>
                                    {editMode && (
                                        <button
                                            type="button"
                                            onClick={addModule}
                                            className="px-4 py-2 text-xs font-semibold text-white bg-[#111827] hover:bg-gray-800 rounded transition-colors shrink-0"
                                        >
                                            + Add topic
                                        </button>
                                    )}
                                </div>

                                {/* Topic Sections List */}
                                <div className="space-y-3">
                                    {modules.length > 0 ? (
                                        modules.map((module, index) => (
                                            <ModuleCard
                                                key={module.id}
                                                course={course}
                                                module={module}
                                                index={index}
                                                quizCount={assessments.filter((q) => q.module_id === module.id).length}
                                                enrolledCount={enrolledCount}
                                                editMode={editMode}
                                                onAddActivity={openAddActivityModal}
                                                onQuickRename={handleQuickRename}
                                                onPreviewMaterial={setPreviewMaterial}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-white rounded border border-dashed border-[#D1D5DB]">
                                            <p className="text-[#111827] font-semibold text-sm mb-1">No topics added to this course yet.</p>
                                            <p className="text-xs text-gray-500 mb-4">Add your first topic section to begin uploading lectures, slides, and quizzes.</p>
                                            {editMode && (
                                                <button
                                                    type="button"
                                                    onClick={addModule}
                                                    className="px-4 py-2 text-xs font-semibold text-white bg-[#111827] hover:bg-gray-800 rounded"
                                                >
                                                    + Add first topic
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Final Assessment Section Card */}
                                <div id="final-exam-section" className="bg-white border border-[#D1D5DB] rounded overflow-hidden scroll-mt-24">
                                    <div className="px-4 sm:px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 block">
                                                Course Certification Requirement
                                            </span>
                                            <h3 className="font-display font-bold text-base text-[#111827]">
                                                Final Assessment ({finalAssessments.length} Question{finalAssessments.length === 1 ? '' : 's'})
                                            </h3>
                                        </div>
                                        {modules.length > 0 && editMode ? (
                                            <Link
                                                href={`${route('staff.courses.modules.edit', [course.id, modules[0].id])}?tab=assessment`}
                                                className="px-3.5 py-1.5 bg-[#111827] hover:bg-gray-800 text-white font-semibold text-xs rounded shrink-0 transition-colors"
                                            >
                                                Edit final assessment →
                                            </Link>
                                        ) : (
                                            <span className="text-xs font-medium text-gray-500 shrink-0">
                                                100% score required for certificate
                                            </span>
                                        )}
                                    </div>
                                    <div className="px-4 sm:px-5 py-3 text-xs text-gray-600">
                                        Learners must complete all course topics and score 100% on the Final Assessment to unlock their verified certificate.
                                    </div>
                                </div>

                                {editMode && modules.length > 0 && (
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={addModule}
                                            className="w-full py-2.5 text-xs font-semibold text-[#111827] bg-white border border-dashed border-[#D1D5DB] rounded hover:bg-[#F3F4F6] transition-colors"
                                        >
                                            + Add topic section
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: COURSE SETTINGS */}
                    {courseTab === 'settings' && (
                        <form onSubmit={submitCourse} className="flex flex-col gap-6">
                            {/* Settings Sub-Tabs */}
                            <div className="flex flex-wrap gap-1 border-b border-[#D1D5DB]">
                                {[
                                    { key: 'identity', label: 'General & Course Details' },
                                    { key: 'pricing', label: 'Enrollment & Access' },
                                    { key: 'cert', label: 'Certificate Settings' },
                                ].map((t) => (
                                    <button
                                        key={t.key}
                                        type="button"
                                        onClick={() => setSettingsTab(t.key)}
                                        className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px ${
                                            settingsTab === t.key
                                                ? 'border-[#111827] text-[#111827] bg-white'
                                                : 'border-transparent text-gray-600 hover:text-[#111827]'
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Section 1: Course Identity, Year & Theme Color */}
                            <div className={`bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8 space-y-6 ${settingsTab === 'identity' ? '' : 'hidden'}`}>
                                <div className="border-b-2 border-[#E5E7EB] pb-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-[#111827] font-display">
                                            1. Course Identity & Intake Details
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Specify course title, intake date, theme color, and curriculum description.
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold bg-[#111827] text-white px-2.5 py-1 rounded">
                                        Identity
                                    </span>
                                </div>

                                <div>
                                    <label htmlFor="title" className="block text-sm font-bold text-[#111827] mb-2">
                                        Course Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="title"
                                        name="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                        className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors"
                                    />
                                    {errors.title && (
                                        <p className="mt-2 text-red-600 text-sm font-medium">{errors.title}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="academic_year" className="block text-sm font-bold text-[#111827] mb-2">
                                            Academic Year / Intake Session
                                        </label>
                                        <input
                                            id="academic_year"
                                            name="academic_year"
                                            type="text"
                                            value={data.academic_year}
                                            onChange={(e) => setData('academic_year', e.target.value)}
                                            placeholder="e.g. 2026 / 2027 · Intake 1"
                                            className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors"
                                        />
                                        {errors.academic_year && (
                                            <p className="mt-2 text-red-600 text-sm font-medium">{errors.academic_year}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="status" className="block text-sm font-bold text-[#111827] mb-2">
                                            Publication Status
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            required
                                            className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors"
                                        >
                                            <option value="draft">Draft - Hidden from learners</option>
                                            <option value="published">Published - Visible to everyone</option>
                                            <option value="archived">Archived - Read only</option>
                                        </select>
                                        {errors.status && (
                                            <p className="mt-2 text-red-600 text-sm font-medium">{errors.status}</p>
                                        )}
                                    </div>
                                </div>

                                {isCoordinator && (
                                    <div className="bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-md p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="settings_instructor_id" className="block text-sm font-extrabold text-[#111827]">
                                                Assigned Subject Instructor
                                            </label>
                                            <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-amber-600 text-white rounded">
                                                Coordinator Control
                                            </span>
                                        </div>
                                        <select
                                            id="settings_instructor_id"
                                            name="instructor_id"
                                            value={data.instructor_id}
                                            onChange={(e) => setData('instructor_id', e.target.value)}
                                            className="block w-full px-4 py-2.5 bg-white border-2 border-amber-300 rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#111827] focus:outline-none transition-colors"
                                        >
                                            <option value="">Leave Unassigned / Self</option>
                                            {instructors.map((ins) => (
                                                <option key={ins.id} value={ins.id}>
                                                    {ins.name} ({ins.email})
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-amber-900 font-medium">
                                            Subject Coordinator can change or reassign the instructor directly here.
                                        </p>
                                        {errors.instructor_id && (
                                            <p className="text-red-600 text-xs font-bold">{errors.instructor_id}</p>
                                        )}
                                    </div>
                                )}

                                {/* Theme Color Swatches */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-bold text-[#111827]">
                                            Course Theme Color
                                        </label>
                                        <button
                                            type="button"
                                            onClick={pickRandomColor}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-[#F3F4F6] hover:bg-gray-200 border border-[#E5E7EB] px-2.5 py-1 rounded transition-colors"
                                        >
                                            <span>🎲</span>
                                            <span>Random Color</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Choose a flat theme color for catalog cards, header banners, and student certificates.
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                        {COURSE_THEME_COLORS.map((color) => {
                                            const isSelected = data.category_logo === color.key;
                                            return (
                                                <button
                                                    key={color.key}
                                                    type="button"
                                                    onClick={() => setData('category_logo', color.key)}
                                                    className={`flex items-center gap-2.5 p-3 rounded-md border-2 text-left transition-all ${
                                                        isSelected
                                                            ? 'border-[#111827] bg-[#F9FAFB] ring-2 ring-[#111827]'
                                                            : 'border-[#E5E7EB] bg-white hover:border-gray-400'
                                                    }`}
                                                >
                                                    <span
                                                        className="w-5 h-5 rounded-full shrink-0 border border-black/15 flex items-center justify-center text-[10px] text-white font-black"
                                                        style={{ backgroundColor: color.hex }}
                                                    >
                                                        {isSelected && '✓'}
                                                    </span>
                                                    <span className="text-xs font-bold text-[#111827] truncate">
                                                        {color.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-bold text-[#111827] mb-2">
                                        Curriculum & Subject Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Outline what learners will master, key outcomes, and syllabus scope..."
                                        className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors"
                                    />
                                    {errors.description && (
                                        <p className="mt-2 text-red-600 text-sm font-medium">{errors.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Section 2: Subscription Model */}
                            <div className={`bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8 space-y-6 ${settingsTab === 'pricing' ? '' : 'hidden'}`}>
                                <div className="border-b-2 border-[#E5E7EB] pb-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-[#111827] font-display">
                                            2. Subscription Model & Pricing
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Choose whether this course is free or paid.
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold bg-[#10B981] text-white px-2.5 py-1 rounded">
                                        Pricing
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData((prev) => ({ ...prev, billing_type: 'free', price: '0.00' }));
                                        }}
                                        className={`p-5 rounded-md border-2 text-left transition-all ${
                                            data.billing_type === 'free'
                                                ? 'border-[#10B981] bg-emerald-50/40 ring-2 ring-[#10B981]'
                                                : 'border-[#E5E7EB] bg-white hover:border-gray-400'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-2xl">🎁</span>
                                            <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                                                data.billing_type === 'free' ? 'bg-[#10B981] text-white' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                FREE
                                            </span>
                                        </div>
                                        <p className="font-extrabold text-sm text-[#111827]">Free Enrollment</p>
                                        <p className="text-xs text-gray-500 mt-1">Open access for all learners. No payment gateway required.</p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData((prev) => ({
                                                ...prev,
                                                billing_type: 'one_time',
                                                price: prev.price && Number(prev.price) > 0 ? prev.price : '49.00',
                                            }));
                                        }}
                                        className={`p-5 rounded-md border-2 text-left transition-all ${
                                            data.billing_type !== 'free'
                                                ? 'border-[#10B981] bg-emerald-50/40 ring-2 ring-[#10B981]'
                                                : 'border-[#E5E7EB] bg-white hover:border-gray-400'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-2xl">💳</span>
                                            <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                                                data.billing_type !== 'free' ? 'bg-[#10B981] text-white' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                PAID
                                            </span>
                                        </div>
                                        <p className="font-extrabold text-sm text-[#111827]">Paid Course</p>
                                        <p className="text-xs text-gray-500 mt-1">Learners pay a tuition fee via ToyyibPay before accessing content.</p>
                                    </button>
                                </div>

                                {data.billing_type !== 'free' && (
                                    <div className="bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-md p-5 space-y-3">
                                        <label htmlFor="price" className="block text-sm font-bold text-[#111827]">
                                            Course Fee (MYR) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center gap-2 max-w-xs">
                                            <span className="px-3 py-2.5 bg-gray-200 border-2 border-gray-300 rounded-md text-xs font-black text-gray-700">
                                                RM
                                            </span>
                                            <input
                                                id="price"
                                                name="price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.price}
                                                onChange={(e) => setData('price', e.target.value)}
                                                placeholder="49.00"
                                                required
                                                className="block w-full px-4 py-2.5 bg-white border-2 border-[#E5E7EB] rounded-md text-sm text-[#111827] font-bold focus:border-[#10B981] focus:outline-none"
                                            />
                                        </div>
                                        <div className="text-xs text-gray-600 flex items-center gap-2">
                                            <span className="text-[#10B981] font-bold">✓ Catalog Display:</span>
                                            <span>
                                                Learners see <span className="font-extrabold text-[#111827]">RM {Number(data.price || 0).toFixed(2)}</span>
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section 3: Industry Certification Link */}
                            <div className={`bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8 space-y-6 ${settingsTab === 'cert' ? '' : 'hidden'}`}>
                                <div className="border-b-2 border-[#E5E7EB] pb-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-[#111827] font-display">
                                            3. Industry Certification Link (e.g. CAPM®, JLM)
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Link your course to an external certification body or regulatory license.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData((prev) => ({
                                                ...prev,
                                                category_logo: 'capm',
                                                cert_title: 'CAPM® · Certified Associate in Project Management',
                                                cert_url: 'https://www.pmi.org/certifications/certified-associate-capm',
                                            }));
                                        }}
                                        className="text-[11px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-2.5 py-1 rounded hover:bg-amber-200 transition-colors"
                                    >
                                        + Prefill CAPM®
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="cert_title" className="block text-sm font-bold text-[#111827] mb-2">
                                            Certification Name
                                        </label>
                                        <input
                                            id="cert_title"
                                            name="cert_title"
                                            type="text"
                                            value={data.cert_title}
                                            onChange={(e) => setData('cert_title', e.target.value)}
                                            placeholder="e.g. CAPM® · Certified Associate in Project Management"
                                            className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="cert_url" className="block text-sm font-bold text-[#111827] mb-2">
                                            Official Info URL
                                        </label>
                                        <input
                                            id="cert_url"
                                            name="cert_url"
                                            type="url"
                                            value={data.cert_url}
                                            onChange={(e) => setData('cert_url', e.target.value)}
                                            placeholder="https://www.pmi.org/certifications/certified-associate-capm"
                                            className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-5 flex items-center justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-3 text-sm font-bold text-white bg-[#10B981] rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save All Course Info'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB 3: PARTICIPANTS */}
                    {courseTab === 'participants' && (
                        <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#E5E7EB]">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-[#111827] font-display">
                                        Participants ({allParticipants.length})
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Assigned course instructors and actively enrolled students.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-xs font-bold text-gray-600 bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-1.5 rounded-md">
                                        Total Learners: {enrollments.length}
                                    </div>
                                    {isCoordinator && (
                                        <button
                                            type="button"
                                            onClick={() => setShowReassignModal(true)}
                                            className="px-3 py-1.5 text-xs font-bold bg-[#FEF3C7] text-[#92400E] border-2 border-[#F59E0B] rounded-md hover:bg-amber-100 transition-colors"
                                        >
                                            Reassign Lecturer
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Search & Filter Controls */}
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={participantSearch}
                                            onChange={(e) => setParticipantSearch(e.target.value)}
                                            placeholder="Search by name or email..."
                                            className="w-full pl-9 pr-4 py-2 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-md text-xs text-[#111827] font-semibold focus:bg-white focus:border-[#111827] focus:outline-none"
                                        />
                                        <span className="absolute left-3 top-2.5 text-xs text-gray-400">🔍</span>
                                    </div>
                                    {participantSearch && (
                                        <button
                                            type="button"
                                            onClick={() => setParticipantSearch('')}
                                            className="px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md shrink-0"
                                        >
                                            Clear Search
                                        </button>
                                    )}
                                </div>

                                {/* A-Z Alphabet Filter Pills (Scrollable on Mobile) */}
                                <div className="flex overflow-x-auto whitespace-nowrap items-center gap-1 pt-1 pb-1">
                                    <span className="text-[10px] font-extrabold uppercase text-gray-400 mr-1">Filter:</span>
                                    {['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')].map((letter) => {
                                        const active = letterFilter === letter;
                                        return (
                                            <button
                                                key={letter}
                                                type="button"
                                                onClick={() => setLetterFilter(letter)}
                                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-colors border ${
                                                    active
                                                        ? 'bg-[#111827] text-white border-[#111827]'
                                                        : 'bg-white text-gray-600 border-[#E5E7EB] hover:border-gray-400'
                                                }`}
                                            >
                                                {letter}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Participants Table */}
                            <div className="overflow-x-auto border-2 border-[#E5E7EB] rounded-md">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-[#F9FAFB] border-b-2 border-[#E5E7EB] text-gray-700 font-extrabold uppercase text-[10px] tracking-wider">
                                        <tr>
                                            <th className="py-3 px-4">Learner Name</th>
                                            <th className="py-3 px-4">Email</th>
                                            <th className="py-3 px-4">Role</th>
                                            <th className="py-3 px-4">Progress %</th>
                                            <th className="py-3 px-4">Last Access</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                            <th className="py-3 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB]">
                                        {filteredParticipants.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-8 text-center text-gray-500 italic">
                                                    No participants match the selected filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredParticipants.map((p) => (
                                                <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors">
                                                    <td className="py-3 px-4 font-bold text-[#111827]">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                                                                p.isInstructor ? 'bg-purple-700 text-white' : 'bg-[#111827] text-white'
                                                            }`}>
                                                                {p.name.charAt(0).toUpperCase()}
                                                            </span>
                                                            <span className="truncate">{p.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600 font-medium">{p.email}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                                                            p.isInstructor
                                                                ? 'bg-purple-100 text-purple-800 border-purple-300'
                                                                : 'bg-blue-100 text-blue-800 border-blue-300'
                                                        }`}>
                                                            {p.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-extrabold text-[#111827] w-9 text-right">
                                                                {p.progress}%
                                                            </span>
                                                            <div className="w-20 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                                                <div
                                                                    className="bg-[#10B981] h-full rounded-full"
                                                                    style={{ width: `${p.progress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-500 font-medium">
                                                        {p.lastAccess}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        {p.isInstructor && isCoordinator ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowReassignModal(true)}
                                                                className="px-2.5 py-1 text-[10px] font-extrabold bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B] rounded hover:bg-amber-100 transition-colors"
                                                            >
                                                                Reassign Lecturer
                                                            </button>
                                                        ) : (
                                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                                                                p.status === 'Certified'
                                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                                            }`}>
                                                                {p.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        {!p.isInstructor ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedStudentId(p.userId);
                                                                    setMobileChatView('thread');
                                                                    setCourseTab('chat');
                                                                }}
                                                                className="px-2.5 py-1 text-[10px] font-extrabold bg-white text-[#111827] border-2 border-[#111827] rounded hover:bg-[#111827] hover:text-white transition-colors"
                                                            >
                                                                💬 Chat
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-gray-400">Instructor</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: GRADES */}
                    {courseTab === 'grades' && (
                        <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#E5E7EB]">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-[#111827] font-display">
                                        Grades & Course Matrix
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Track module unit completion and final exam certification per enrolled learner.
                                    </p>
                                </div>
                            </div>

                            {/* Summary Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-md">
                                    <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider block">
                                        Enrolled Students
                                    </span>
                                    <span className="text-2xl font-extrabold text-[#111827]">
                                        {gradeLearners.length}
                                    </span>
                                </div>
                                <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-md">
                                    <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider block">
                                        Certified (100% Pass)
                                    </span>
                                    <span className="text-2xl font-extrabold text-[#10B981]">
                                        {certifiedCount}
                                    </span>
                                </div>
                                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-md">
                                    <span className="text-[10px] font-extrabold uppercase text-blue-800 tracking-wider block">
                                        Average Progress
                                    </span>
                                    <span className="text-2xl font-extrabold text-[#1D4ED8]">
                                        {avgProgress}%
                                    </span>
                                </div>
                            </div>

                            {/* Grader Matrix Table */}
                            <div className="overflow-x-auto border-2 border-[#E5E7EB] rounded-md">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-[#F9FAFB] border-b-2 border-[#E5E7EB] text-gray-700 font-extrabold uppercase text-[10px] tracking-wider">
                                        <tr>
                                            <th className="py-3 px-4 sticky left-0 bg-[#F9FAFB] z-10">Enrolled Learner</th>
                                            {modules.map((m, idx) => (
                                                <th key={m.id} className="py-3 px-3 text-center whitespace-nowrap">
                                                    Unit {idx + 1}
                                                </th>
                                            ))}
                                            <th className="py-3 px-4 text-center">Final Assessment</th>
                                            <th className="py-3 px-4 text-right">Overall Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB]">
                                        {gradeLearners.length === 0 ? (
                                            <tr>
                                                <td colSpan={modules.length + 3} className="py-8 text-center text-gray-500 italic">
                                                    No students enrolled in this course yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            gradeLearners.map((learner) => (
                                                <tr key={learner.id} className="hover:bg-[#F9FAFB] transition-colors">
                                                    <td className="py-3 px-4 font-bold text-[#111827] sticky left-0 bg-white z-10">
                                                        <div className="min-w-[160px]">
                                                            <p className="truncate">{learner.name}</p>
                                                            <p className="text-[11px] text-gray-500 font-normal truncate">{learner.email}</p>
                                                        </div>
                                                    </td>

                                                    {modules.map((m) => {
                                                        const isDone = learner.completedModIds.has(m.id);
                                                        return (
                                                            <td key={m.id} className="py-3 px-3 text-center">
                                                                {isDone ? (
                                                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-[#10B981] font-black text-xs">
                                                                        ✓
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400 font-bold">-</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}

                                                    <td className="py-3 px-4 text-center">
                                                        {learner.completedAt ? (
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                                100% Passed
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="py-3 px-4 text-right">
                                                        <div className="inline-flex items-center gap-2">
                                                            <span className="font-extrabold text-[#111827]">
                                                                {learner.progress}%
                                                            </span>
                                                            <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                                                <div
                                                                    className="bg-[#10B981] h-full rounded-full"
                                                                    style={{ width: `${learner.progress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: STUDENT CHAT */}
                    {courseTab === 'chat' && (
                        <div className="space-y-6">
                            {/* Course Discussions Header */}
                            <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-extrabold text-[#111827] uppercase tracking-wider">
                                        Course Discussions &amp; Student Inquiries
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Broadcast announcements to the entire class or message enrolled students directly 1-on-1.
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] text-xs font-bold self-start sm:self-auto">
                                    <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                                    In-App Chat Active
                                </span>
                            </div>

                            {/* Split-Pane Course Chat Interface */}
                            <div className="bg-white rounded-md border-2 border-[#E5E7EB] overflow-hidden flex flex-col lg:flex-row min-h-[580px]">
                                {/* Left Pane: Student Threads & Group Chat */}
                                <div className={`w-full lg:w-80 xl:w-96 border-b-2 lg:border-b-0 lg:border-r-2 border-[#E5E7EB] bg-[#F9FAFB] flex flex-col ${
                                    mobileChatView === 'thread' ? 'hidden lg:flex' : 'flex'
                                }`}>
                                    {/* Sidebar Header & Search */}
                                    <div className="p-3.5 border-b-2 border-[#E5E7EB] bg-white space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black uppercase tracking-wider text-[#111827]">
                                                Conversations
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                {enrolledStudents.length} Students
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={chatSearch}
                                                onChange={(e) => setChatSearch(e.target.value)}
                                                placeholder="Search student by name or email..."
                                                className="w-full pl-8 pr-3 py-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-xs text-[#111827] focus:bg-white focus:border-[#111827] focus:outline-none"
                                            />
                                            <span className="absolute left-2.5 top-2 text-xs text-gray-400">🔍</span>
                                        </div>
                                    </div>

                                    {/* Thread List */}
                                    <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7EB] max-h-[500px]">
                                        {/* Pinned: Course Group Chat */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedStudentId(null);
                                                setMobileChatView('thread');
                                            }}
                                            className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 ${
                                                selectedStudentId === null
                                                    ? 'bg-[#111827] text-white'
                                                    : 'hover:bg-gray-100 text-[#111827]'
                                            }`}
                                        >
                                            <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                                                selectedStudentId === null ? 'bg-white text-[#111827]' : 'bg-[#111827] text-white'
                                            }`}>
                                                📢
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1">
                                                    <span className="text-xs font-extrabold truncate">
                                                        Course Group Chat
                                                    </span>
                                                    {lastGroupMessage && (
                                                        <span className={`text-[10px] shrink-0 ${
                                                            selectedStudentId === null ? 'text-gray-300' : 'text-gray-400'
                                                        }`}>
                                                            {timeAgo(lastGroupMessage.created_at)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-[11px] truncate mt-0.5 ${
                                                    selectedStudentId === null ? 'text-gray-300' : 'text-gray-500'
                                                }`}>
                                                    {lastGroupMessage
                                                        ? `${lastGroupMessage.sender?.name || 'Someone'}: ${lastGroupMessage.body.replace('[WhatsApp] ', '')}`
                                                        : 'Broadcast announcements to all students'}
                                                </p>
                                                <span className={`inline-block mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                                                    selectedStudentId === null
                                                        ? 'bg-gray-800 text-gray-200 border-gray-700'
                                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                    Class Broadcast
                                                </span>
                                            </div>
                                        </button>

                                        {/* Direct 1-on-1 Student Threads */}
                                        <div className="px-3.5 py-2 bg-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-500">
                                            Direct Messages (1-on-1)
                                        </div>

                                        {filteredChatStudents.length === 0 ? (
                                            <div className="p-4 text-center text-xs text-gray-400 italic">
                                                No students found.
                                            </div>
                                        ) : (
                                            filteredChatStudents.map((student) => {
                                                const isSelected = selectedStudentId === student.id;
                                                const dms = getStudentDMs(student.id);
                                                const lastDM = dms[dms.length - 1];

                                                return (
                                                    <button
                                                        key={student.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedStudentId(student.id);
                                                            setMobileChatView('thread');
                                                        }}
                                                        className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 ${
                                                            isSelected
                                                                ? 'bg-[#111827] text-white'
                                                                : 'hover:bg-gray-100 text-[#111827]'
                                                        }`}
                                                    >
                                                        <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                                                            isSelected ? 'bg-white text-[#111827]' : 'bg-gray-200 text-gray-800'
                                                        }`}>
                                                            {student.name.charAt(0).toUpperCase()}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-1">
                                                                <span className="text-xs font-bold truncate">
                                                                    {student.name}
                                                                </span>
                                                                {lastDM && (
                                                                    <span className={`text-[10px] shrink-0 ${
                                                                        isSelected ? 'text-gray-300' : 'text-gray-400'
                                                                    }`}>
                                                                        {timeAgo(lastDM.created_at)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center justify-between gap-1.5 mt-0.5">
                                                                <span className={`text-[10px] truncate ${
                                                                    isSelected ? 'text-gray-300' : 'text-gray-500'
                                                                }`}>
                                                                    {student.email}
                                                                </span>
                                                                <span className={`shrink-0 px-1.5 py-0.2 rounded text-[9px] font-extrabold border ${
                                                                    isSelected
                                                                        ? 'bg-gray-800 text-emerald-300 border-gray-700'
                                                                        : student.isCertified
                                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                                        : 'bg-gray-100 text-gray-700 border-gray-200'
                                                                }`}>
                                                                    {student.isCertified ? '✓ Certified' : `${student.progress}%`}
                                                                </span>
                                                            </div>
                                                            <p className={`text-[11px] truncate mt-0.5 ${
                                                                isSelected ? 'text-gray-300' : 'text-gray-500'
                                                            }`}>
                                                                {lastDM ? lastDM.body.replace('[WhatsApp] ', '') : 'No direct messages yet'}
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Right Pane: Active Thread Chat Feed & Composer */}
                                <div className={`flex-1 flex flex-col bg-white ${
                                    mobileChatView === 'list' ? 'hidden lg:flex' : 'flex'
                                }`}>
                                    {/* Active Thread Header */}
                                    <div className="p-3.5 sm:p-4 border-b-2 border-[#E5E7EB] bg-white flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            {/* Mobile Back Button to Conversation List */}
                                            <button
                                                type="button"
                                                onClick={() => setMobileChatView('list')}
                                                className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-extrabold bg-[#111827] text-white rounded hover:bg-black transition-colors min-h-[36px] shrink-0"
                                                title="Back to all conversations"
                                            >
                                                <span>←</span>
                                                <span className="hidden xs:inline">Conversations</span>
                                            </button>
                                            {selectedStudentId === null ? (
                                                <>
                                                    <span className="w-9 h-9 rounded-full bg-[#111827] text-white flex items-center justify-center text-base font-bold shrink-0">
                                                        📢
                                                    </span>
                                                    <div>
                                                        <h4 className="text-sm font-extrabold text-[#111827]">
                                                            Course Group Chat
                                                        </h4>
                                                        <p className="text-[11px] text-gray-500">
                                                            Public thread · Visible to all enrolled students and course instructors
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="w-9 h-9 rounded-full bg-[#111827] text-white flex items-center justify-center text-xs font-black shrink-0">
                                                        {selectedStudent?.name?.charAt(0).toUpperCase() || 'S'}
                                                    </span>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-extrabold text-[#111827]">
                                                                {selectedStudent?.name || 'Student'}
                                                            </h4>
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
                                                                1-on-1 Direct Chat
                                                            </span>
                                                            {selectedStudent && (
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                                                                    selectedStudent.isCertified
                                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                                                        : 'bg-gray-100 text-gray-700 border-gray-300'
                                                                }`}>
                                                                    {selectedStudent.isCertified ? '✓ Certified (100%)' : `${selectedStudent.progress}% Progress`}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-gray-500">
                                                            {selectedStudent?.email || 'N/A'} · Private conversation
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {selectedStudentId !== null && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedStudentId(null)}
                                                    className="px-2.5 py-1 text-xs font-bold bg-[#F9FAFB] text-gray-700 border border-[#E5E7EB] rounded hover:bg-gray-100 transition-colors"
                                                >
                                                    ← Group
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Message History Feed */}
                                    <div ref={chatContainerRef} className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 bg-[#F9FAFB] min-h-[380px] max-h-[440px]">
                                        {activeThreadMessages.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                                                <span className="text-3xl">💬</span>
                                                <h5 className="text-sm font-bold text-gray-700">
                                                    No messages in this thread yet.
                                                </h5>
                                                <p className="text-xs text-gray-500 max-w-sm">
                                                    {selectedStudentId === null
                                                        ? 'Send an announcement or discussion prompt to the entire class.'
                                                        : `Send a direct, private message to ${selectedStudent?.name || 'this student'}.`}
                                                </p>
                                            </div>
                                        ) : (
                                            activeThreadMessages.map((msg) => {
                                                const isInstructorMsg = msg.sender?.role === 'staff' || msg.sender?.role === 'coordinator';
                                                const isMine = msg.sender_id === instructor?.id;

                                                return (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                                                    >
                                                        <div className="flex items-center gap-1.5 mb-1 px-1">
                                                            <span className="text-[11px] font-extrabold text-gray-800">
                                                                {isMine ? 'You' : msg.sender?.name || 'Member'}
                                                            </span>
                                                            {isInstructorMsg && (
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
                                                            <p className="whitespace-pre-wrap break-words">{msg.body.replace('[WhatsApp] ', '')}</p>
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
                                                    selectedStudentId === null
                                                        ? 'Write a message to the course group chat (Press Enter to send)...'
                                                        : `Direct message to ${selectedStudent?.name || 'student'}...`
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
                        </div>
                    )}
                </div>
            )}

            {/* MODE 2: LEARNER PREVIEW MODE */}
            {mode === 'preview' && (
                <div className="space-y-8">
                    {/* Instructor Overlay Banner */}
                    <div className="bg-[#111827] text-white border-2 border-gray-900 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-md bg-[#10B981] text-white flex items-center justify-center text-sm font-extrabold shrink-0">
                                👁️
                            </span>
                            <div>
                                <p className="text-sm font-bold">
                                    Learner Preview Mode · Active Unit: <span className="text-[#10B981]">{activeModule?.title || 'No Unit Selected'}</span>
                                </p>
                                <p className="text-xs text-gray-400">
                                    Previewing courseware exactly as enrolled students experience it.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {activeModule && (
                                <Link
                                    href={route('staff.courses.modules.edit', [course.id, activeModule.id])}
                                    className="px-3.5 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded transition-colors"
                                >
                                    Edit This Unit
                                </Link>
                            )}
                            <button
                                type="button"
                                onClick={() => setMode('editor')}
                                className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded transition-colors"
                            >
                                Switch to Studio Editor
                            </button>
                        </div>
                    </div>

                    {/* 2-Column Student Theater Stage */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column: Media Stage & Unit Detail */}
                        <div className="lg:col-span-8 space-y-6">
                            {activeModule ? (
                                <div className="bg-white rounded-lg border-2 border-[#E5E7EB] overflow-hidden">
                                    {/* Media Frame */}
                                    <div
                                        key={activeSafeUrl || activeModule.id}
                                        className="aspect-video bg-[#111827] flex items-center justify-center relative overflow-hidden border-b-2 border-[#E5E7EB]"
                                    >
                                        {activeEmbedUrl && isVideo ? (
                                            <>
                                                {getYouTubeId(activeSafeUrl) && (
                                                    <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111827]/90 border border-gray-700 text-[11px] font-bold text-white uppercase tracking-wider">
                                                        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                                                        <span>Live YouTube Preview</span>
                                                    </div>
                                                )}
                                                <iframe
                                                    src={activeEmbedUrl}
                                                    title={selectedMediaTitle || activeModule.title}
                                                    className="w-full h-full border-0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    allowFullScreen
                                                />
                                            </>
                                        ) : isVideo && isVideoFile(activeSafeUrl) ? (
                                            <video
                                                src={activeSafeUrl}
                                                controls
                                                className="w-full h-full bg-black"
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : activeSafeUrl ? (
                                            <div className="p-8 text-center text-white space-y-4">
                                                <div className="w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center mx-auto text-2xl">
                                                    {isPdfFile(activeSafeUrl) ? '📑' : '📄'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{selectedMediaTitle || activeModule.title}</p>
                                                    <p className="text-xs text-gray-400 mt-1">Uploaded document or external resource link</p>
                                                </div>
                                                <a
                                                    href={activeSafeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded transition-transform active:scale-95"
                                                >
                                                    Open Attached Material ↗
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="text-center p-8 text-gray-400 space-y-3">
                                                <span className="text-4xl block">🎬</span>
                                                <p className="text-sm font-bold text-gray-300">No media uploaded for this unit yet.</p>
                                                <p className="text-xs text-gray-500">Instructors can attach videos, slides, or links via the Studio Editor.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Unit Navigation Bar */}
                                    <div className="bg-[#F9FAFB] border-b-2 border-[#E5E7EB] px-6 py-3.5 flex items-center justify-between gap-4">
                                        <button
                                            type="button"
                                            disabled={!prevModule}
                                            onClick={() => prevModule && handleSelectModule(prevModule.id)}
                                            className="px-3 py-1.5 text-xs font-bold bg-white border-2 border-[#E5E7EB] text-[#111827] rounded hover:border-[#111827] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                        >
                                            ← Previous Unit
                                        </button>
                                        <span className="text-xs font-bold text-gray-500">
                                            Unit {activeIndex + 1} of {modules.length}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={!nextModule}
                                            onClick={() => nextModule && handleSelectModule(nextModule.id)}
                                            className="px-3 py-1.5 text-xs font-bold bg-white border-2 border-[#E5E7EB] text-[#111827] rounded hover:border-[#111827] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                        >
                                            Next Unit →
                                        </button>
                                    </div>

                                    {/* Unit Info & Attachments */}
                                    <div className="p-6 space-y-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-[#E5E7EB]">
                                            <div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-[#10B981] uppercase tracking-wider mb-1">
                                                    <span>Unit {activeIndex + 1}</span>
                                                    <span>·</span>
                                                    <span>{activeModule.content_type?.toUpperCase() || 'LINK'}</span>
                                                </div>
                                                <h2 className="text-xl font-extrabold text-[#111827]">
                                                    {activeModule.title}
                                                </h2>
                                            </div>
                                        </div>

                                        {activeModule.description && (
                                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                                {activeModule.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg border-2 border-[#E5E7EB] p-12 text-center text-gray-500">
                                    <p className="text-base font-bold text-[#111827] mb-1">No module selected</p>
                                    <p className="text-xs">Add a module in the editor or select one from the sidebar.</p>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Units Playlist Sidebar */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="bg-white rounded-lg border-2 border-[#E5E7EB] p-5 space-y-3">
                                <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#111827]">
                                    Course Curriculum ({modules.length} Units)
                                </h3>
                                <div className="space-y-2">
                                    {modules.map((m, idx) => {
                                        const isSelected = m.id === activeModule?.id;
                                        return (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => handleSelectModule(m.id)}
                                                className={`w-full text-left p-3 rounded-md border-2 transition-all flex items-start gap-3 ${
                                                    isSelected
                                                        ? 'bg-[#111827] border-[#111827] text-white'
                                                        : 'bg-white border-[#E5E7EB] text-gray-800 hover:border-gray-400'
                                                }`}
                                            >
                                                <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black shrink-0 ${
                                                    isSelected ? 'bg-[#10B981] text-white' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {idx + 1}
                                                </span>
                                                <span className="truncate flex-1 font-bold text-xs">{m.title}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 4-Tile Add Activity or Resource Modal */}
            {showActivityModal && activityModalModule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                    <div className="bg-white rounded-lg border-2 border-[#111827] w-full max-w-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-[#111827] text-white p-5 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#10B981] block">
                                    Add Activity or Resource
                                </span>
                                <h3 className="text-lg font-extrabold font-display">
                                    Target: {activityModalModule.title}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowActivityModal(false)}
                                className="text-gray-400 hover:text-white text-lg font-bold p-1 rounded transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* 4 Tiles Grid (Safeguard #1 Deep-Linking) */}
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Tile 1: Video / URL */}
                            <Link
                                href={`${route('staff.courses.modules.edit', [course.id, activityModalModule.id])}?tab=materials&subtab=subtopics`}
                                className="p-4 rounded-md border-2 border-[#E5E7EB] hover:border-[#10B981] hover:bg-[#F9FAFB] text-left transition-all group"
                            >
                                <span className="text-3xl block mb-2">🎬</span>
                                <h4 className="font-extrabold text-sm text-[#111827] group-hover:text-[#10B981]">
                                    Video / URL Lecture
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    Attach YouTube, Vimeo, or direct streaming video URLs to this module.
                                </p>
                                <span className="inline-block mt-3 text-[11px] font-bold text-[#10B981]">
                                    Add Video Unit →
                                </span>
                            </Link>

                            {/* Tile 2: Slide / File */}
                            <Link
                                href={`${route('staff.courses.modules.edit', [course.id, activityModalModule.id])}?tab=materials&subtab=subtopics&type=file`}
                                className="p-4 rounded-md border-2 border-[#E5E7EB] hover:border-[#10B981] hover:bg-[#F9FAFB] text-left transition-all group"
                            >
                                <span className="text-3xl block mb-2">📄</span>
                                <h4 className="font-extrabold text-sm text-[#111827] group-hover:text-[#10B981]">
                                    Slide / PDF Document
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    Upload lecture slides, PDF handbooks, or doc worksheets (up to 15MB).
                                </p>
                                <span className="inline-block mt-3 text-[11px] font-bold text-[#10B981]">
                                    Upload Document →
                                </span>
                            </Link>

                            {/* Tile 3: Optional Practice Quiz */}
                            <Link
                                href={`${route('staff.courses.modules.edit', [course.id, activityModalModule.id])}?tab=quizzes`}
                                className="p-4 rounded-md border-2 border-[#E5E7EB] hover:border-[#10B981] hover:bg-[#F9FAFB] text-left transition-all group"
                            >
                                <span className="text-3xl block mb-2">📝</span>
                                <h4 className="font-extrabold text-sm text-[#111827] group-hover:text-[#10B981]">
                                    Optional Practice Quiz
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    Add quick knowledge check questions attached to this specific module.
                                </p>
                                <span className="inline-block mt-3 text-[11px] font-bold text-[#10B981]">
                                    Build Unit Quiz →
                                </span>
                            </Link>

                            {/* Tile 4: Final Exam Question */}
                            <Link
                                href={`${route('staff.courses.modules.edit', [course.id, activityModalModule.id])}?tab=assessment`}
                                className="p-4 rounded-md border-2 border-[#E5E7EB] hover:border-[#10B981] hover:bg-[#F9FAFB] text-left transition-all group"
                            >
                                <span className="text-3xl block mb-2">🎯</span>
                                <h4 className="font-extrabold text-sm text-[#111827] group-hover:text-[#10B981]">
                                    Final Exam Question
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    Add a comprehensive question to the official Course Final Exam.
                                </p>
                                <span className="inline-block mt-3 text-[11px] font-bold text-[#10B981]">
                                    Add Exam Question →
                                </span>
                            </Link>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-[#F9FAFB] border-t-2 border-[#E5E7EB] p-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowActivityModal(false)}
                                className="px-4 py-2 bg-white border-2 border-[#E5E7EB] hover:border-[#111827] text-[#111827] text-xs font-bold rounded-md transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reassign Lecturer Flat Modal */}
            {showReassignModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="bg-white border-2 border-[#111827] rounded-lg p-6 max-w-md w-full space-y-4 text-left">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-amber-500 text-white rounded">
                                    Coordinator Action
                                </span>
                                <h3 className="font-display text-lg font-extrabold text-[#111827] leading-snug mt-1">
                                    Reassign Subject Lecturer
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowReassignModal(false)}
                                className="text-gray-400 hover:text-[#111827] font-bold text-lg leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        <p className="text-xs text-gray-600">
                            Subject: <span className="font-bold text-[#111827]">&ldquo;{course.title}&rdquo;</span>
                            <br />
                            Currently assigned: <span className="font-bold text-[#111827]">{instructor?.name || 'Unassigned'}</span>
                        </p>

                        <form onSubmit={handleReassign} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#111827] mb-1">
                                    Select New Lecturer
                                </label>
                                <select
                                    value={selectedReassignInstructorId}
                                    onChange={(e) => setSelectedReassignInstructorId(e.target.value)}
                                    required
                                    className="block w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-md text-sm text-[#111827] focus:border-[#111827] focus:outline-none"
                                >
                                    <option value="">-- Choose Instructor --</option>
                                    {instructors.map((ins) => (
                                        <option key={ins.id} value={ins.id}>
                                            {ins.name} ({ins.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
                                <button
                                    type="button"
                                    onClick={() => setShowReassignModal(false)}
                                    disabled={isReassigning}
                                    className="border-2 border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#111827] font-bold text-xs px-4 py-2 rounded transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isReassigning || !selectedReassignInstructorId}
                                    className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded transition-colors disabled:opacity-50"
                                >
                                    {isReassigning ? 'Reassigning...' : 'Confirm Reassignment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {previewMaterial && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                    <div className="bg-white rounded-lg border-2 border-[#111827] w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="bg-[#111827] text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-lg">👁</span>
                                <h3 className="font-extrabold text-sm truncate font-display">
                                    {previewMaterial.title}
                                </h3>
                                {(() => {
                                    const url = safeUrl(previewMaterial.url) || '';
                                    const isPdf = isPdfFile(url, previewMaterial.contentType);
                                    const isVid = isVideoUrl(url, previewMaterial.contentType);
                                    if (isPdf) {
                                        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200 shrink-0">PDF DOCUMENT</span>;
                                    }
                                    if (isVid) {
                                        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200 shrink-0">VIDEO EMBED</span>;
                                    }
                                    return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 shrink-0">EXTERNAL LINK</span>;
                                })()}
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreviewMaterial(null)}
                                className="text-gray-400 hover:text-white text-lg font-bold p-1 leading-none transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-4 overflow-y-auto flex-1 bg-[#F9FAFB]">
                            {(() => {
                                const url = safeUrl(previewMaterial.url);
                                const isPdf = isPdfFile(url, previewMaterial.contentType);
                                const isVid = isVideoUrl(url, previewMaterial.contentType);

                                if (isPdf) {
                                    return (
                                        <div className="space-y-3">
                                            <div className="p-3 bg-white border-2 border-[#E5E7EB] rounded-md flex items-center justify-between gap-3">
                                                <span className="text-xs font-bold text-gray-700">PDF Document Preview</span>
                                                <a
                                                    href={url}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-[#111827] hover:bg-gray-800 text-white font-extrabold text-xs rounded transition-colors inline-flex items-center gap-1.5"
                                                >
                                                    <span>⬇ Download PDF Document</span>
                                                </a>
                                            </div>
                                            <div className="border-2 border-[#E5E7EB] rounded-md overflow-hidden bg-white">
                                                <iframe src={url} title={previewMaterial.title} className="w-full h-[500px] border-0" />
                                            </div>
                                        </div>
                                    );
                                }

                                if (isVid) {
                                    return (
                                        <div className="aspect-video w-full bg-[#111827] rounded-md overflow-hidden border-2 border-[#E5E7EB]">
                                            <iframe
                                                src={formatEmbedUrl(url)}
                                                title={previewMaterial.title}
                                                className="w-full h-full border-0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                            />
                                        </div>
                                    );
                                }

                                return (
                                    <div className="bg-white border-2 border-[#E5E7EB] rounded-md p-8 text-center space-y-4">
                                        <p className="text-sm font-bold text-[#111827]">External Resource Link</p>
                                        <p className="text-xs text-gray-600 break-all">{url || 'No URL provided'}</p>
                                        {url && (
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block px-5 py-2.5 bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs rounded transition-colors"
                                            >
                                                Open Link in New Tab ↗
                                            </a>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-white border-t-2 border-[#E5E7EB] flex justify-end">
                            <button
                                type="button"
                                onClick={() => setPreviewMaterial(null)}
                                className="px-4 py-2 bg-[#F3F4F6] hover:bg-gray-200 text-[#111827] font-bold text-xs rounded transition-colors"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </StaffLayout>
    );
}