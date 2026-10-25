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
    const [whatsappUrl, setWhatsappUrl] = useState(course.whatsapp_group_url || '');
    const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);
    const [whatsappSaved, setWhatsappSaved] = useState(false);
    const [isSimulatingWhatsapp, setIsSimulatingWhatsapp] = useState(false);
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

    const handleSaveWhatsappUrl = (e) => {
        e.preventDefault();
        setIsSavingWhatsapp(true);
        router.post(route('staff.courses.whatsapp-link.update', course.id), {
            whatsapp_group_url: whatsappUrl,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSavingWhatsapp(false);
                setWhatsappSaved(true);
                setTimeout(() => setWhatsappSaved(false), 3000);
            },
            onError: () => {
                setIsSavingWhatsapp(false);
            },
        });
    };

    const handleSimulateWhatsappReply = async (customText = null) => {
        setIsSimulatingWhatsapp(true);
        const replyText = customText || (selectedStudentId
            ? 'Hello instructor! I saw your note. Thank you for the guidance.'
            : 'Waalaikumsalam! Thank you for reaching out. Let me know which module topic you would like to review.');

        try {
            const res = await fetch(route('courses.chat.whatsapp-simulate', course.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    body: replyText,
                    sender_id: selectedStudentId || (enrolledStudents[0]?.id || null),
                    recipient_id: selectedStudentId ? instructor?.id : null,
                }),
            });
            if (res.ok) {
                const newMsg = await res.json();
                setMessages((prev) => [...prev, newMsg]);
            }
        } catch (err) {
            // ignore
        } finally {
            setIsSimulatingWhatsapp(false);
        }
    };

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
            return {
                id: user.id || e.user_id,
                name: user.name || 'Enrolled Student',
                email: user.email || 'N/A',
                phone: user.phone || null,
                role: user.role || 'learner',
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

    // Edit Mode Toggle: true (interactive builder) | false (read-only canvas)
    const [editMode, setEditMode] = useState(true);

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
            <Head title={`Edit: ${course.title} · Instructor Studio`} />

            {/* Top Workspace Bar */}
            <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-4 sm:p-5 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link
                                href={route('staff.courses.index')}
                                className="text-xs font-bold text-gray-500 hover:text-[#10B981] flex items-center gap-1 transition-colors"
                            >
                                <span>← Back to Courses</span>
                            </Link>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                UUM CoPED Studio
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <CourseLogoBadge category={data.category_logo} size="badge" />
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight font-display">
                                {course.title}
                            </h1>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-extrabold border ${
                                course.status === 'published'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : course.status === 'archived'
                                    ? 'bg-gray-100 text-gray-800 border-gray-300'
                                    : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}>
                                {course.status ? course.status.toUpperCase() : 'DRAFT'}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-[#F3F4F6] border border-[#E5E7EB] text-xs font-bold text-gray-700 px-2.5 py-0.5 rounded">
                                📅 {data.academic_year || '2026 / 2027'}
                            </span>
                        </div>
                    </div>

                    {/* Mode Toggle & Deploy Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        {course.status === 'draft' ? (
                            <button
                                type="button"
                                onClick={() => router.post(route('staff.courses.deploy', course.id), {}, { preserveScroll: true })}
                                className="px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-md flex items-center gap-1.5 transition-transform active:scale-[0.98] shrink-0"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>🚀 Deploy & Publish Subject</span>
                            </button>
                        ) : (
                            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-xs rounded-md flex items-center gap-1 shrink-0">
                                <span>✓ Deployed · Live in Catalog</span>
                            </span>
                        )}

                        <div className="flex items-center gap-2 bg-[#F3F4F6] p-1.5 rounded-lg border-2 border-[#E5E7EB] shrink-0">
                            <button
                                type="button"
                                onClick={() => setMode('editor')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-extrabold transition-colors ${
                                    mode === 'editor'
                                        ? 'bg-[#111827] text-white'
                                        : 'text-gray-700 hover:text-[#111827]'
                                }`}
                            >
                                <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Curriculum & Studio Editor</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('preview')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-extrabold transition-colors ${
                                    mode === 'preview'
                                        ? 'bg-[#111827] text-white'
                                        : 'text-gray-700 hover:text-[#111827]'
                                }`}
                            >
                                <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>Learner Preview Mode</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODE 1: CURRICULUM & STUDIO EDITOR */}
            {mode === 'editor' && (
                <div className="space-y-6">
                    {/* Top 5-Tab Moodle Bar + "Edit Mode" Toggle */}
                    <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-2.5 sm:p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* 5 Tabs on Left (Horizontally Scrollable on Mobile) */}
                        <div className="flex overflow-x-auto whitespace-nowrap -mx-2 px-2 sm:mx-0 sm:px-0 items-center gap-1.5 pb-1 max-w-full" role="tablist">
                            {[
                                { id: 'curriculum', label: `Course (${modules.length} Modules)`, icon: '📚' },
                                { id: 'settings', label: 'Settings', icon: '⚙️' },
                                { id: 'participants', label: `Participants (${enrollments.length})`, icon: '👥' },
                                { id: 'grades', label: 'Grades', icon: '📊' },
                                { id: 'chat', label: 'Student Chat', icon: '💬' },
                            ].map((tab) => {
                                const active = courseTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setCourseTab(tab.id)}
                                        className={`px-3.5 sm:px-4 py-2 rounded-md text-xs font-extrabold border-2 transition-colors flex items-center gap-1.5 shrink-0 min-h-[44px] ${
                                            active
                                                ? 'bg-[#111827] border-[#111827] text-white'
                                                : 'bg-white border-[#E5E7EB] text-gray-700 hover:border-[#111827] hover:text-[#111827]'
                                        }`}
                                    >
                                        <span>{tab.icon}</span>
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Edit Mode Toggle Switch on Right */}
                        <div className="flex items-center gap-2.5 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-lg px-3 py-1.5 shrink-0 self-start md:self-auto">
                            <span className="text-xs font-extrabold text-[#111827]">Edit Mode</span>
                            <button
                                type="button"
                                onClick={() => setEditMode((v) => !v)}
                                aria-pressed={editMode}
                                title={editMode ? 'Disable Edit Mode' : 'Enable Edit Mode'}
                                className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                                    editMode ? 'bg-[#10B981] justify-end' : 'bg-gray-300 justify-start'
                                }`}
                            >
                                <span className="bg-white w-5 h-5 rounded-full block border border-black/10" />
                            </button>
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                                editMode ? 'text-[#10B981]' : 'text-gray-500'
                            }`}>
                                {editMode ? 'ON' : 'OFF'}
                            </span>
                        </div>
                    </div>

                    {/* TAB 1: COURSE CURRICULUM (2-Column Index Tree + Module Canvas) */}
                    {courseTab === 'curriculum' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* Left Column (lg:col-span-3): Compact Course Index Tree */}
                            <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-4">
                                {/* Mobile Index Accordion Toggle Button */}
                                <div className="lg:hidden">
                                    <button
                                        type="button"
                                        onClick={() => setMobileIndexOpen((v) => !v)}
                                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border-2 border-[#E5E7EB] rounded-md text-xs font-extrabold text-[#111827] hover:border-[#111827] transition-colors min-h-[44px]"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>📑</span>
                                            <span>Course Index ({modules.length} Modules)</span>
                                        </span>
                                        <span className="text-gray-500 font-bold">{mobileIndexOpen ? '▲ Hide' : '▼ View Index'}</span>
                                    </button>
                                </div>

                                <div className={`${mobileIndexOpen ? 'block' : 'hidden'} lg:block bg-white rounded-md border-2 border-[#E5E7EB] p-4 space-y-3`}>
                                    <div className="flex items-center justify-between pb-2 border-b-2 border-[#E5E7EB]">
                                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#111827] font-display">
                                            Course Index
                                        </h3>
                                        <span className="text-[10px] font-bold text-gray-500">
                                            {modules.length} Module{modules.length === 1 ? '' : 's'}
                                        </span>
                                    </div>

                                    {modules.length === 0 ? (
                                        <p className="text-xs text-gray-500 italic py-2">
                                            No modules created yet.
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
                                                        className="w-full text-left p-2 rounded hover:bg-[#F3F4F6] text-xs font-bold text-[#111827] flex items-center justify-between gap-1 transition-colors group"
                                                    >
                                                        <span className="truncate">
                                                            {idx + 1}. {m.title}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 font-semibold shrink-0 group-hover:text-[#10B981]">
                                                            {m.lessons?.length || 0} unit{m.lessons?.length === 1 ? '' : 's'}
                                                        </span>
                                                    </button>

                                                    {/* Nested subtopics */}
                                                    {m.lessons && m.lessons.length > 0 && (
                                                        <div className="pl-4 space-y-1 border-l-2 border-[#E5E7EB] ml-2">
                                                            {m.lessons.map((lesson, lIdx) => (
                                                                <div
                                                                    key={lesson.id}
                                                                    className="text-[11px] text-gray-600 truncate py-0.5 flex items-center gap-1.5"
                                                                >
                                                                    <span className="text-[9px] text-gray-400">
                                                                        {lesson.content_type === 'file' ? '📄' : '🎬'}
                                                                    </span>
                                                                    <span className="truncate">{lesson.title}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </nav>
                                    )}

                                    {/* Final Assessment Jump in Tree */}
                                    {finalAssessments.length > 0 && (
                                        <div className="pt-2 border-t-2 border-[#E5E7EB]">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const el = document.getElementById('final-exam-section');
                                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="w-full text-left p-2 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-extrabold flex items-center justify-between transition-colors"
                                            >
                                                <span>🎯 Final Exam</span>
                                                <span className="text-[10px]">{finalAssessments.length} Qs</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column (lg:col-span-9): Modules & Activity Canvas */}
                            <div className="lg:col-span-9 space-y-6">
                                <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                                        <div>
                                            <h2 className="text-2xl font-extrabold text-[#111827] font-display">
                                                Course Modules & Curriculum
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {editMode
                                                    ? 'Use inline rename or Add Activity to build lessons, slides, and quizzes.'
                                                    : 'Read-only preview. Turn Edit Mode ON above to make modifications.'}
                                            </p>
                                        </div>
                                        {editMode && (
                                            <button
                                                type="button"
                                                onClick={addModule}
                                                className="px-5 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 rounded-md transition-colors shrink-0"
                                            >
                                                + Add Module
                                            </button>
                                        )}
                                    </div>

                                    {/* Module Completion Telemetry Strip */}
                                    {modules.length > 0 && (
                                        <div className="bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-md p-5 mb-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#111827]">
                                                    Module Completion & Telemetry ({enrolledCount} Enrolled Learners)
                                                </h4>
                                                <span className="text-[11px] font-semibold text-gray-500">
                                                    Live learner unit completion rates
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                {modules.map((m, idx) => {
                                                    const completed = m.completions_count ?? 0;
                                                    const pct = enrolledCount > 0 ? Math.round((completed / enrolledCount) * 100) : 0;
                                                    return (
                                                        <div key={m.id} className="bg-white border-2 border-[#E5E7EB] rounded p-3">
                                                            <div className="flex items-center justify-between text-xs mb-1">
                                                                <span className="font-bold text-[#111827] truncate">Unit {idx + 1}</span>
                                                                <span className="font-extrabold text-[#10B981]">{pct}%</span>
                                                            </div>
                                                            <p className="text-[11px] text-gray-600 truncate mb-2">{m.title}</p>
                                                            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                                                <div
                                                                    className="bg-[#10B981] h-full rounded-full transition-all"
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] text-gray-500 font-medium mt-1.5 block">
                                                                {completed} / {enrolledCount} completed
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Module Cards List */}
                                    <div className="space-y-4 mb-8">
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
                                                />
                                            ))
                                        ) : (
                                            <div className="text-center py-12 bg-[#F9FAFB] rounded-md border-2 border-[#E5E7EB] border-dashed">
                                                <p className="text-gray-700 font-bold text-sm mb-1">No modules added yet.</p>
                                                <p className="text-xs text-gray-500 mb-4">Create your first chapter below to begin adding lessons and files.</p>
                                                <button
                                                    type="button"
                                                    onClick={addModule}
                                                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#111827] hover:bg-gray-800 rounded-md"
                                                >
                                                    + Create First Module
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Final Exam Overview Card */}
                                    <div id="final-exam-section" className="bg-[#FFFBEB] border-2 border-[#FDE68A] rounded-md p-5 scroll-mt-24">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div>
                                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#92400E] block">
                                                    Course Assessment
                                                </span>
                                                <h3 className="font-extrabold text-base text-[#92400E]">
                                                    🎯 Final Exam ({finalAssessments.length} Questions)
                                                </h3>
                                                <p className="text-xs text-gray-600 mt-0.5">
                                                    Learners must pass this exam with 100% to unlock their verified official certificate.
                                                </p>
                                            </div>
                                            {modules.length > 0 && (
                                                <Link
                                                    href={`${route('staff.courses.modules.edit', [course.id, modules[0].id])}?tab=assessment`}
                                                    className="px-4 py-2 bg-[#92400E] hover:bg-amber-800 text-white font-extrabold text-xs rounded-md shrink-0 transition-colors"
                                                >
                                                    Manage Final Exam Questions →
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {editMode && modules.length > 0 && (
                                        <div className="flex justify-end pt-4 mt-6 border-t-2 border-[#E5E7EB]">
                                            <button
                                                type="button"
                                                onClick={addModule}
                                                className="px-6 py-3 text-sm font-bold text-white bg-[#111827] rounded-md hover:bg-gray-800 transition-colors"
                                            >
                                                + Add Next Module
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: COURSE SETTINGS */}
                    {courseTab === 'settings' && (
                        <form onSubmit={submitCourse} className="flex flex-col gap-6">
                            {/* Settings Sub-Tabs */}
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { key: 'identity', label: '1. Course Identity' },
                                    { key: 'pricing', label: '2. Subscription Model' },
                                    { key: 'cert', label: '3. Certification' },
                                ].map((t) => (
                                    <button
                                        key={t.key}
                                        type="button"
                                        onClick={() => setSettingsTab(t.key)}
                                        className={`px-4 py-2 rounded-md text-xs font-extrabold border-2 transition-colors ${
                                            settingsTab === t.key
                                                ? 'bg-[#10B981] border-[#10B981] text-white'
                                                : 'bg-white border-[#E5E7EB] text-gray-700 hover:border-[#10B981]'
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

                    {/* TAB 5: STUDENT CHAT (WHATSAPP WEB STYLE) */}
                    {courseTab === 'chat' && (
                        <div className="space-y-6">
                            {/* Course WhatsApp Cloud API Integration Bar */}
                            <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-md bg-[#25D366] text-white flex items-center justify-center text-xl font-bold shrink-0">
                                        💬
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-extrabold text-[#111827]">
                                                Meta WhatsApp Cloud API Integration
                                            </h3>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]">
                                                In-Web Cloud API Active
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block animate-pulse"></span>
                                            <span className="text-xs text-gray-600 font-semibold">
                                                Direct In-Web Bridge Active · Automatic Student Phone Routing & Webhook Simulation
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleSimulateWhatsappReply()}
                                        disabled={isSimulatingWhatsapp}
                                        className="px-3.5 py-1.5 text-xs font-black bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded border border-[#16A34A] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                                        title="Simulate incoming WhatsApp message from student"
                                    >
                                        <span>⚡</span>
                                        <span>{isSimulatingWhatsapp ? 'Simulating...' : 'Simulate WhatsApp Reply'}</span>
                                    </button>
                                    <form onSubmit={handleSaveWhatsappUrl} className="flex items-center gap-2">
                                        <input
                                            type="url"
                                            value={whatsappUrl}
                                            onChange={(e) => setWhatsappUrl(e.target.value)}
                                            placeholder="https://chat.whatsapp.com/..."
                                            className="w-full sm:w-64 px-3 py-1.5 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded text-xs text-[#111827] font-semibold focus:bg-white focus:border-[#111827] focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSavingWhatsapp}
                                            className="px-3 py-1.5 text-xs font-bold bg-[#111827] text-white rounded hover:bg-black transition-colors disabled:opacity-50"
                                        >
                                            {isSavingWhatsapp ? 'Saving...' : whatsappSaved ? 'Saved!' : 'Save Link'}
                                        </button>
                                        {course.whatsapp_group_url && (
                                            <a
                                                href={course.whatsapp_group_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 text-xs font-bold bg-[#25D366] text-white rounded hover:bg-[#1EBE5D] transition-colors flex items-center justify-center gap-1.5"
                                            >
                                                <span>Open</span>
                                                <span>↗</span>
                                            </a>
                                        )}
                                    </form>
                                </div>
                            </div>

                            {/* Split-Pane WhatsApp Web Interface */}
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
                                                placeholder="Search student, phone, or email..."
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
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                {student.phone ? (
                                                                    <span className={`text-[10px] font-mono ${
                                                                        isSelected ? 'text-emerald-300 font-bold' : 'text-emerald-700 font-semibold'
                                                                    }`}>
                                                                        📞 {student.phone}
                                                                    </span>
                                                                ) : (
                                                                    <span className={`text-[10px] truncate ${
                                                                        isSelected ? 'text-gray-300' : 'text-gray-500'
                                                                    }`}>
                                                                        {student.email}
                                                                    </span>
                                                                )}
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
                                                            {selectedStudent?.phone && (
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                                                    📞 {selectedStudent.phone}
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
                                            <button
                                                type="button"
                                                onClick={() => handleSimulateWhatsappReply()}
                                                disabled={isSimulatingWhatsapp}
                                                className="px-2.5 py-1 text-xs font-black bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded border border-[#16A34A] transition-colors flex items-center gap-1 disabled:opacity-50"
                                                title="Simulate student incoming WhatsApp reply"
                                            >
                                                <span>⚡</span>
                                                <span className="hidden sm:inline">Simulate Reply</span>
                                            </button>
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
                                                const isWhatsapp = msg.body.startsWith('[WhatsApp]');

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
                                                            {isWhatsapp && (
                                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] flex items-center gap-0.5">
                                                                    ✓✓ WhatsApp API
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
        </StaffLayout>
    );
}