import { Head, Link, router } from '@inertiajs/react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';
import QuestionCard from '../Partials/QuestionCard';
import QuestionEditForm from '../Partials/QuestionEditForm';
import QuestionForm from '../Partials/QuestionForm';
import { useEffect, useState } from 'react';
import { formatEmbedUrl, isPdfFile, isVideoUrl, safeUrl } from '@/Utils/mediaUtils';

const MAX_MODULE_FILE_SIZE = 15 * 1024 * 1024; // 15MB - must stay below PHP post_max_size
const MAX_MODULE_FILE_LABEL = '15MB';

const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function Edit({ course, module, assessments, finalAssessments = [] }) {
    const quizzes = assessments || [];
    const finals = finalAssessments?.length
        ? finalAssessments
        : (course.assessments || []).filter((q) => !q.module_id);

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const initialTab = searchParams.get('tab') || 'materials';
    const initialSubtab = searchParams.get('subtab') || 'info';
    const initialType = searchParams.get('type') === 'file' ? 'file' : 'link';

    // Active Action Card: 'materials' | 'quizzes' | 'assessment'
    const [activeTab, setActiveTab] = useState(initialTab);

    // Materials Sub-Tab: 'info' | 'subtopics'
    const [materialsSubTab, setMaterialsSubTab] = useState(initialSubtab);
    const [previewMaterial, setPreviewMaterial] = useState(null);

    const [details, setDetails] = useState({
        title: module.title || '',
        description: module.description || '',
        duration_minutes: module.duration != null ? Math.round(module.duration / 60) : '',
    });
    const set = (key, value) => setDetails((prev) => ({ ...prev, [key]: value }));
    const [modErrors, setModErrors] = useState({});
    const [modSaving, setModSaving] = useState(false);
    const [fileAlert, setFileAlert] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const [showAddQuiz, setShowAddQuiz] = useState(initialTab === 'quizzes');
    const [showQuizSection, setShowQuizSection] = useState(quizzes.length > 0 || initialTab === 'quizzes');
    const [showAddFinalQuiz, setShowAddFinalQuiz] = useState(initialTab === 'assessment');
    const [editingId, setEditingId] = useState(null);
    const [editErrors, setEditErrors] = useState({});
    const [editSaving, setEditSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(t);
    }, [toast]);

    const pop = (text) => setToast({ id: Date.now(), text });

    const handleFile = (file, apply, inputId = null) => {
        if (!file) return;
        if (file.size > MAX_MODULE_FILE_SIZE) {
            setFileAlert(`File is too large. "${file.name}" is ${formatBytes(file.size)} - limit is ${MAX_MODULE_FILE_LABEL}. Please choose a smaller file.`);
            if (inputId) {
                const input = document.getElementById(inputId);
                if (input) input.value = '';
            }
            return;
        }
        setFileAlert(null);
        apply(file);
    };

    const saveDetails = (e, goToSubtopics = false) => {
        e?.preventDefault();
        setModSaving(true);
        setModErrors({});
        router.post(route('staff.courses.modules.update', [course, module.id]), {
            _method: 'put',
            title: details.title,
            description: details.description,
            duration_minutes: details.duration_minutes === '' ? null : details.duration_minutes,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                const updated = page?.props?.module;
                if (updated) {
                    setDetails({
                        title: updated.title || '',
                        description: updated.description || '',
                        duration_minutes: updated.duration != null ? Math.round(updated.duration / 60) : '',
                    });
                }
                pop('Module details saved.');
                if (goToSubtopics) {
                    setMaterialsSubTab('subtopics');
                }
            },
            onError: (errs) => setModErrors(errs),
            onFinish: () => setModSaving(false),
        });
    };

    const lessons = module.lessons || [];
    const [newLesson, setNewLesson] = useState({
        title: '',
        content: '',
        content_type: initialType,
        content_url: '',
        file: null,
    });
    const [lessonErrors, setLessonErrors] = useState({});
    const [lessonSaving, setLessonSaving] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [lessonDraft, setLessonDraft] = useState({});
    const [lessonEditErrors, setLessonEditErrors] = useState({});
    const [lessonEditSaving, setLessonEditSaving] = useState(false);

    const submitLesson = (e) => {
        e?.preventDefault();
        setLessonSaving(true);
        setLessonErrors({});
        router.post(route('staff.courses.modules.lessons.store', [course, module.id]), {
            title: newLesson.title,
            content: newLesson.content,
            content_type: newLesson.content_type,
            content_url: newLesson.content_url,
            file: newLesson.file,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setNewLesson({ title: '', content: '', content_type: 'link', content_url: '', file: null });
                setFileAlert(null);
                pop('Subtopic added.');
            },
            onError: (errs) => setLessonErrors(errs),
            onFinish: () => setLessonSaving(false),
        });
    };

    const startLessonEdit = (l) => {
        setEditingLessonId(l.id);
        setLessonEditErrors({});
        setLessonDraft({
            title: l.title || '',
            content: l.content || '',
            content_type: l.content_type === 'file' ? 'file' : 'link',
            content_url: l.content_url || '',
            file: null,
        });
    };

    const saveLessonEdit = (l) => {
        setLessonEditSaving(true);
        setLessonEditErrors({});
        router.put(route('staff.courses.modules.lessons.update', [course, module.id, l.id]), {
            title: lessonDraft.title,
            content: lessonDraft.content,
            content_type: lessonDraft.content_type,
            content_url: lessonDraft.content_url,
            file: lessonDraft.file,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => { setEditingLessonId(null); pop('Subtopic updated.'); },
            onError: (errs) => setLessonEditErrors(errs),
            onFinish: () => setLessonEditSaving(false),
        });
    };

    const deleteLesson = (l) => {
        if (confirm(`Delete subtopic "${l.title}"?`)) {
            router.delete(route('staff.courses.modules.lessons.destroy', [course, module.id, l.id]), {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const saveEdit = (q, data) => {
        setEditSaving(true);
        setEditErrors({});
        router.put(route('staff.courses.assessments.update', [course, q.id]), {
            module_id: q.module_id ?? null,
            ...data,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setEditingId(null),
            onError: (errs) => setEditErrors(errs),
            onFinish: () => setEditSaving(false),
        });
    };

    const deleteQuiz = (q) => {
        if (confirm('Delete this question?')) {
            router.delete(route('staff.courses.assessments.destroy', [course, q.id]), {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    return (
        <StaffLayout>
            <Head title={`Module: ${module.title}`} />

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Module Header Bar */}
                <div>
                    <Link
                        href={route('staff.courses.edit', course)}
                        className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-[#10B981] mb-2 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Course Curriculum
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{course.title}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs font-bold bg-[#111827] text-white px-2 py-0.5 rounded">Unit {module.order || 1}</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-display">
                        {details.title || module.title}
                    </h1>
                </div>

                {/* Top 3-Card Action Hub */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab('materials')}
                        className={`text-left p-5 rounded-md border-2 transition-colors ${
                            activeTab === 'materials'
                                ? 'bg-[#111827] border-[#111827] text-white'
                                : 'bg-white border-[#E5E7EB] text-[#111827] hover:border-[#10B981]'
                        }`}
                    >
                        <span className="block text-3xl mb-2" aria-hidden="true">📚</span>
                        <span className="block font-extrabold text-base font-display">Module & Learning Materials</span>
                        <span className={`block text-xs mt-0.5 font-semibold ${activeTab === 'materials' ? 'text-gray-300' : 'text-gray-500'}`}>
                            {lessons.length} subtopic{lessons.length === 1 ? '' : 's'} & materials
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('quizzes')}
                        className={`text-left p-5 rounded-md border-2 transition-colors ${
                            activeTab === 'quizzes'
                                ? 'bg-[#111827] border-[#111827] text-white'
                                : 'bg-white border-[#E5E7EB] text-[#111827] hover:border-[#10B981]'
                        }`}
                    >
                        <span className="block text-3xl mb-2" aria-hidden="true">📝</span>
                        <span className="block font-extrabold text-base font-display">Quizzes (Optional Mini-Quiz)</span>
                        <span className={`block text-xs mt-0.5 font-semibold ${activeTab === 'quizzes' ? 'text-gray-300' : 'text-gray-500'}`}>
                            {quizzes.length} practice question{quizzes.length === 1 ? '' : 's'} · Optional
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('assessment')}
                        className={`text-left p-5 rounded-md border-2 transition-colors ${
                            activeTab === 'assessment'
                                ? 'bg-[#111827] border-[#111827] text-white'
                                : 'bg-white border-[#E5E7EB] text-[#111827] hover:border-[#10B981]'
                        }`}
                    >
                        <span className="block text-3xl mb-2" aria-hidden="true">🎯</span>
                        <span className="block font-extrabold text-base font-display">Final Assessment</span>
                        <span className={`block text-xs mt-0.5 font-semibold ${activeTab === 'assessment' ? 'text-gray-300' : 'text-gray-500'}`}>
                            {finals.length} course exam question{finals.length === 1 ? '' : 's'}
                        </span>
                    </button>
                </div>

                {/* CARD 1: MODULE & LEARNING MATERIALS */}
                {activeTab === 'materials' && (
                    <div className="space-y-6">
                        {/* 2-Step Sub-Tab Pill Switcher */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setMaterialsSubTab('info')}
                                className={`px-4 py-2 rounded-md text-xs font-extrabold border-2 transition-colors ${
                                    materialsSubTab === 'info'
                                        ? 'bg-[#10B981] border-[#10B981] text-white'
                                        : 'bg-white border-[#E5E7EB] text-gray-700 hover:border-[#10B981]'
                                }`}
                            >
                                1. Chapter Overview Media
                            </button>
                            <button
                                type="button"
                                onClick={() => setMaterialsSubTab('subtopics')}
                                className={`px-4 py-2 rounded-md text-xs font-extrabold border-2 transition-colors ${
                                    materialsSubTab === 'subtopics'
                                        ? 'bg-[#10B981] border-[#10B981] text-white'
                                        : 'bg-white border-[#E5E7EB] text-gray-700 hover:border-[#10B981]'
                                }`}
                            >
                                2. Subtopic Lessons & Materials ({lessons.length})
                            </button>
                        </div>

                        {/* Sub-tab A: Module Info */}
                        {materialsSubTab === 'info' && (
                            <form onSubmit={(e) => saveDetails(e, false)} className="bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8 space-y-5">
                                <div className="border-b-2 border-[#E5E7EB] pb-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-[#111827] font-display">
                                            1. Chapter Overview Media (Main Unit Stage)
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Primary introductory video or reference link shown when a learner first opens this chapter.
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold bg-[#111827] text-white px-2.5 py-1 rounded">
                                        Step 1 of 2
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#111827] mb-2">Topic / Module Title <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={details.title}
                                        onChange={(e) => set('title', e.target.value)}
                                        required
                                        className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors"
                                    />
                                    {modErrors.title && <p className="mt-2 text-red-600 text-sm font-medium">{modErrors.title}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#111827] mb-2">Description</label>
                                    <textarea
                                        rows={4}
                                        value={details.description}
                                        onChange={(e) => set('description', e.target.value)}
                                        className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors resize-none"
                                    />
                                    {modErrors.description && <p className="mt-2 text-red-600 text-sm font-medium">{modErrors.description}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-[#111827] mb-2">Duration (minutes, optional)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={1440}
                                            value={details.duration_minutes}
                                            onChange={(e) => set('duration_minutes', e.target.value)}
                                            placeholder="e.g. 12"
                                            className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors"
                                        />
                                        {modErrors.duration_minutes && <p className="mt-2 text-red-600 text-sm font-medium">{modErrors.duration_minutes}</p>}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t-2 border-[#E5E7EB]">
                                    <button
                                        type="submit"
                                        disabled={modSaving}
                                        className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-gray-700 bg-[#F3F4F6] hover:bg-gray-200 border border-[#E5E7EB] rounded-md transition-colors disabled:opacity-50"
                                    >
                                        {modSaving ? 'Saving...' : 'Save Details'}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={modSaving}
                                        onClick={(e) => saveDetails(e, true)}
                                        className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                                    >
                                        <span>{modSaving ? 'Saving...' : 'Save Details & Next: Add Materials'}</span>
                                        <span aria-hidden="true">→</span>
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Sub-tab B: Subtopics & Materials */}
                        {materialsSubTab === 'subtopics' && (
                            <div className="space-y-6">
                                {/* Current Unit Main Video Preview if attached */}
                                {module.media_url && safeUrl(module.media_url) && isVideoUrl(module.media_url) && (
                                    <div className="bg-white rounded-md border-2 border-[#E5E7EB] overflow-hidden animate-fade-in">
                                        <div className="p-4 bg-[#F9FAFB] border-b-2 border-[#E5E7EB] flex items-center justify-between">
                                            <div className="inline-flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse-dot" />
                                                <span className="text-sm font-extrabold text-[#111827] font-display">Unit Main Media Stage</span>
                                            </div>
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Inline Playback Active</span>
                                        </div>
                                        <div className="aspect-video bg-[#111827]">
                                            <iframe
                                                src={formatEmbedUrl(module.media_url)}
                                                title={module.title}
                                                className="w-full h-full border-0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                                        <div>
                                            <h2 className="text-xl font-extrabold text-[#111827] font-display">
                                                2. Subtopic Lessons & Downloadable Materials (PDFs, Slides & Extra Videos)
                                            </h2>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Add individual subtopics, downloadable PDF notes, or supplementary links inside this chapter.
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold bg-[#111827] text-white px-2.5 py-1 rounded shrink-0">
                                            {lessons.length} Item{lessons.length === 1 ? '' : 's'}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        {lessons.length > 0 ? (
                                            lessons.map((l, li) => (
                                                editingLessonId === l.id ? (
                                                    <div key={l.id} className="bg-white p-4 rounded-md border-2 border-amber-400 space-y-3">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <div className="sm:col-span-2">
                                                                <label className="block text-xs font-bold text-[#111827] mb-1">Subtopic Title</label>
                                                                <input
                                                                    type="text"
                                                                    value={lessonDraft.title}
                                                                    onChange={(e) => setLessonDraft((p) => ({ ...p, title: e.target.value }))}
                                                                    className="block w-full px-3 py-2 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none"
                                                                />
                                                                {lessonEditErrors.title && <p className="mt-1 text-red-600 text-xs font-medium">{lessonEditErrors.title}</p>}
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-[#111827] mb-1">Material</label>
                                                                <select
                                                                    value={lessonDraft.content_type}
                                                                    onChange={(e) => {
                                                                        setLessonDraft((p) => ({ ...p, content_type: e.target.value, file: e.target.value === 'link' ? null : p.file }));
                                                                        if (e.target.value === 'link') setFileAlert(null);
                                                                    }}
                                                                    className="block w-full px-3 py-2 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none"
                                                                >
                                                                    <option value="link">External Link</option>
                                                                    <option value="file">Upload Material</option>
                                                                </select>
                                                            </div>
                                                            <div className="sm:col-span-2">
                                                                <label className="block text-xs font-bold text-[#111827] mb-1">Subtopic Description</label>
                                                                <textarea
                                                                    rows={2}
                                                                    value={lessonDraft.content}
                                                                    onChange={(e) => setLessonDraft((p) => ({ ...p, content: e.target.value }))}
                                                                    className="block w-full px-3 py-2 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none resize-y"
                                                                />
                                                            </div>
                                                            {lessonDraft.content_type === 'link' ? (
                                                            <div className="sm:col-span-2 space-y-2">
                                                                <label className="block text-xs font-bold text-[#111827] mb-1">Media URL (YouTube, Vimeo, or direct video)</label>
                                                                <input
                                                                    type="text"
                                                                    value={lessonDraft.content_url}
                                                                    onChange={(e) => setLessonDraft((p) => ({ ...p, content_url: e.target.value }))}
                                                                    placeholder="https://www.youtube.com/watch?v=..."
                                                                    className="block w-full px-3 py-2 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none"
                                                                />
                                                                {safeUrl(lessonDraft.content_url) && formatEmbedUrl(lessonDraft.content_url) && isVideoUrl(lessonDraft.content_url) && (
                                                                    <div className="border-2 border-[#E5E7EB] rounded-md overflow-hidden bg-[#111827] animate-fade-in mt-2">
                                                                        <div className="p-2 bg-[#1F2937] text-white flex items-center justify-between text-xs font-bold border-b border-gray-700">
                                                                            <div className="inline-flex items-center gap-1.5">
                                                                                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse-dot" />
                                                                                <span>Live Subtopic Video Preview</span>
                                                                            </div>
                                                                            <span className="text-gray-400 text-[11px]">Inline playback</span>
                                                                        </div>
                                                                        <div className="aspect-video w-full">
                                                                            <iframe
                                                                                src={formatEmbedUrl(lessonDraft.content_url)}
                                                                                title="Subtopic Preview"
                                                                                className="w-full h-full border-0"
                                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                                                allowFullScreen
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            ) : (
                                                            <div className="sm:col-span-2">
                                                                <label className="block text-xs font-bold text-[#111827] mb-1">Upload material (mp4, PDF, DOCX, PPTX up to 15MB)</label>
                                                                <input
                                                                    id="lesson-edit-file-input"
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept=".mp4,.mov,.webm,.m4v,.pdf,.doc,.docx,.ppt,.pptx"
                                                                    onChange={(e) => {
                                                                        if (e.target.files?.[0]) handleFile(e.target.files[0], (f) => setLessonDraft((p) => ({ ...p, file: f })), 'lesson-edit-file-input');
                                                                    }}
                                                                />
                                                                <div
                                                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                                                    onDragLeave={() => setIsDragging(false)}
                                                                    onDrop={(e) => {
                                                                        e.preventDefault();
                                                                        setIsDragging(false);
                                                                        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0], (f) => setLessonDraft((p) => ({ ...p, file: f })), 'lesson-edit-file-input');
                                                                    }}
                                                                    onClick={() => document.getElementById('lesson-edit-file-input').click()}
                                                                    className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${
                                                                        isDragging ? 'border-[#10B981] bg-emerald-50' : 'border-[#E5E7EB] hover:border-[#10B981] bg-[#F9FAFB]'
                                                                    }`}
                                                                >
                                                                    {lessonDraft.file ? (
                                                                        <div className="text-xs text-emerald-700 font-bold">New file: {lessonDraft.file.name}</div>
                                                                    ) : (
                                                                        <p className="text-xs text-gray-600"><span className="font-bold text-[#10B981]">Click to upload</span> or drag and drop</p>
                                                                    )}
                                                                </div>
                                                                {lessonEditErrors.file && <p className="mt-1 text-red-600 text-xs font-medium">{lessonEditErrors.file}</p>}
                                                                {fileAlert && <p className="mt-1 text-xs font-bold text-red-600">{fileAlert}</p>}
                                                            </div>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-end space-x-2 pt-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingLessonId(null)}
                                                                disabled={lessonEditSaving}
                                                                className="px-4 py-2 text-xs font-bold text-[#111827] bg-[#F3F4F6] hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => saveLessonEdit(l)}
                                                                disabled={lessonEditSaving}
                                                                className="px-4 py-2 text-xs font-bold text-[#111827] bg-amber-400 hover:bg-amber-500 rounded-md transition-colors disabled:opacity-50"
                                                            >
                                                                {lessonEditSaving ? 'Saving...' : 'Save Changes'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div key={l.id} className="bg-[#F9FAFB] p-4 rounded-md border-2 border-[#E5E7EB]">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <p className="text-sm font-bold text-[#111827]">
                                                                <span className="text-[#10B981] mr-1">{li + 1}.</span> {l.title}
                                                            </p>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {(l.content_url || l.file) && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setPreviewMaterial({
                                                                            title: l.title,
                                                                            url: l.content_url,
                                                                            contentType: l.content_type,
                                                                        })}
                                                                        className="px-2.5 py-1 text-xs font-extrabold text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#111827] rounded transition-colors"
                                                                    >
                                                                        👁 Preview
                                                                    </button>
                                                                )}
                                                                <button onClick={() => startLessonEdit(l)} className="text-amber-700 hover:text-amber-800 text-xs font-bold">Edit</button>
                                                                <button onClick={() => deleteLesson(l)} className="text-red-600 hover:text-red-700 text-xs font-bold">Delete</button>
                                                            </div>
                                                        </div>
                                                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-bold text-gray-500">
                                                            {l.content_type && <span className="px-2 py-0.5 rounded-md bg-white border border-[#E5E7EB] uppercase">{l.content_type}</span>}
                                                            {l.content_url && <span className="px-2 py-0.5 rounded-md bg-white border border-[#E5E7EB]">has media</span>}
                                                        </div>
                                                    </div>
                                                )
                                            ))
                                        ) : (
                                            <div className="text-center py-10 bg-[#F9FAFB] rounded-md border-2 border-[#E5E7EB] border-dashed">
                                                <p className="text-gray-500 font-medium text-sm">No subtopics yet. Add the first one below.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Add Subtopic Form */}
                                    <form onSubmit={submitLesson} className="pt-6 border-t-2 border-[#E5E7EB] space-y-4">
                                        <h3 className="text-lg font-bold text-[#111827] font-display">Add Subtopic with Materials</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-bold text-[#111827] mb-2">Subtopic Title <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    value={newLesson.title}
                                                    onChange={(e) => setNewLesson((p) => ({ ...p, title: e.target.value }))}
                                                    required
                                                    placeholder="e.g. What is phishing?"
                                                    className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md sm:text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none"
                                                />
                                                {lessonErrors.title && <p className="mt-2 text-red-600 text-sm font-medium">{lessonErrors.title}</p>}
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-bold text-[#111827] mb-2">Subtopic Description</label>
                                                <textarea
                                                    rows={2}
                                                    value={newLesson.content}
                                                    onChange={(e) => setNewLesson((p) => ({ ...p, content: e.target.value }))}
                                                    placeholder="What will learners learn here?"
                                                    className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md sm:text-sm text-[#111827] resize-y focus:bg-white focus:border-[#10B981] focus:outline-none"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-bold text-[#111827] mb-2">Material Type</label>
                                                <select
                                                    value={newLesson.content_type}
                                                    onChange={(e) => {
                                                        setNewLesson((p) => ({ ...p, content_type: e.target.value, file: e.target.value === 'link' ? null : p.file }));
                                                        if (e.target.value === 'link') setFileAlert(null);
                                                    }}
                                                    className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md sm:text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none"
                                                >
                                                    <option value="link">External Link (YouTube, Vimeo, mp4)</option>
                                                    <option value="file">Upload Material (PDF, DOCX, Video)</option>
                                                </select>
                                            </div>
                                            {newLesson.content_type === 'link' ? (
                                            <div className="sm:col-span-2 space-y-2">
                                                <label className="block text-sm font-bold text-[#111827] mb-2">Media URL (YouTube, Vimeo, or direct video)</label>
                                                <input
                                                    type="text"
                                                    value={newLesson.content_url}
                                                    onChange={(e) => setNewLesson((p) => ({ ...p, content_url: e.target.value }))}
                                                    placeholder="https://... (YouTube, Vimeo, or direct mp4)"
                                                    className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md sm:text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none"
                                                />
                                                {safeUrl(newLesson.content_url) && formatEmbedUrl(newLesson.content_url) && isVideoUrl(newLesson.content_url) && (
                                                    <div className="border-2 border-[#E5E7EB] rounded-md overflow-hidden bg-[#111827] animate-fade-in mt-2">
                                                        <div className="p-2 bg-[#1F2937] text-white flex items-center justify-between text-xs font-bold border-b border-gray-700">
                                                            <div className="inline-flex items-center gap-1.5">
                                                                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse-dot" />
                                                                <span>Live Subtopic Video Preview</span>
                                                            </div>
                                                            <span className="text-gray-400 text-[11px]">Inline playback</span>
                                                        </div>
                                                        <div className="aspect-video w-full">
                                                            <iframe
                                                                src={formatEmbedUrl(newLesson.content_url)}
                                                                title="New Subtopic Preview"
                                                                className="w-full h-full border-0"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                                allowFullScreen
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            ) : (
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-bold text-[#111827] mb-2">Upload material (mp4, PDF, DOCX, PPTX up to 15MB)</label>
                                                <input
                                                    id="lesson-file-input"
                                                    type="file"
                                                    className="hidden"
                                                    accept=".mp4,.mov,.webm,.m4v,.pdf,.doc,.docx,.ppt,.pptx"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) handleFile(e.target.files[0], (f) => setNewLesson((p) => ({ ...p, file: f })), 'lesson-file-input');
                                                    }}
                                                />
                                                <div
                                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                                    onDragLeave={() => setIsDragging(false)}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        setIsDragging(false);
                                                        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0], (f) => setNewLesson((p) => ({ ...p, file: f })), 'lesson-file-input');
                                                    }}
                                                    onClick={() => document.getElementById('lesson-file-input').click()}
                                                    className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                                                        isDragging ? 'border-[#10B981] bg-emerald-50' : 'border-[#E5E7EB] hover:border-[#10B981] bg-[#F9FAFB]'
                                                    }`}
                                                >
                                                    {newLesson.file ? (
                                                        <div className="text-sm text-emerald-700 font-bold">Selected: {newLesson.file.name}</div>
                                                    ) : (
                                                        <div className="space-y-1 text-sm text-gray-600">
                                                            <p><span className="font-bold text-[#10B981]">Click to upload</span> or drag and drop</p>
                                                            <p className="text-xs text-gray-500">mp4, PDF, DOC, DOCX, PPT, PPTX up to 15MB</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {lessonErrors.file && <p className="mt-2 text-red-600 text-sm font-medium">{lessonErrors.file}</p>}
                                                {fileAlert && <p className="mt-2 text-sm font-bold text-red-600">{fileAlert}</p>}
                                            </div>
                                            )}
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="submit"
                                                disabled={lessonSaving}
                                                className="px-6 py-3 text-sm font-bold text-white bg-[#111827] hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
                                            >
                                                {lessonSaving ? 'Adding...' : 'Add Subtopic'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* CARD 2: QUIZZES (OPTIONAL MINI-QUIZ) */}
                {activeTab === 'quizzes' && (
                    <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h2 className="text-2xl font-extrabold text-[#111827] font-display">Module Practice Quiz</h2>
                                    <span className="bg-[#F3F4F6] border border-[#E5E7EB] text-xs font-bold uppercase px-2 py-0.5 rounded text-gray-700">
                                        OPTIONAL
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Optional · Leave empty for lecture-only or introductory modules. Questions provide instant self-test feedback to learners without blocking course progression.
                                </p>
                            </div>
                            {(quizzes.length > 0 || showQuizSection) && (
                                <button
                                    type="button"
                                    onClick={() => setShowAddQuiz((v) => !v)}
                                    className="px-4 py-2 text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 rounded-md transition-colors shrink-0"
                                >
                                    {showAddQuiz ? 'Close Form' : '+ Add Question'}
                                </button>
                            )}
                        </div>

                        {!showQuizSection && quizzes.length === 0 ? (
                            <div className="text-center py-12 px-6 bg-[#F9FAFB] rounded-md border-2 border-[#E5E7EB] border-dashed">
                                <p className="text-[#111827] font-bold text-sm mb-1">No Practice Quiz For This Module</p>
                                <p className="text-xs text-gray-500 max-w-md mx-auto mb-5">
                                    Practice mini-quizzes are completely optional. If this unit is an introductory chapter or lecture without questions, you can leave this blank.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowQuizSection(true);
                                        setShowAddQuiz(true);
                                    }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#111827] bg-white border-2 border-[#E5E7EB] hover:border-[#10B981] rounded-md transition-colors"
                                >
                                    <span>+ Add Optional Practice Quiz for This Module</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 mb-8">
                                    {quizzes.length > 0 ? (
                                        quizzes.map((q, qIdx) => (
                                            editingId === q.id ? (
                                                <QuestionEditForm
                                                    key={q.id}
                                                    initial={q}
                                                    saving={editSaving}
                                                    errors={editErrors}
                                                    onCancel={() => setEditingId(null)}
                                                    onSave={(data) => saveEdit(q, data)}
                                                />
                                            ) : (
                                                <QuestionCard
                                                    key={q.id}
                                                    q={q}
                                                    index={qIdx}
                                                    onEdit={() => { setEditingId(q.id); setEditErrors({}); }}
                                                    onDelete={() => deleteQuiz(q)}
                                                />
                                            )
                                        ))
                                    ) : (
                                        <div className="text-center py-8 bg-[#F9FAFB] rounded-md border-2 border-[#E5E7EB] border-dashed">
                                            <p className="text-gray-500 font-medium text-xs">
                                                No questions created yet. Use the form below to add your first question, or collapse this section.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {showAddQuiz && (
                                    <QuestionForm
                                        course={course}
                                        moduleId={module.id}
                                        allowAddAnother
                                        onDone={() => setShowAddQuiz(false)}
                                        onSaved={() => pop('Mini-quiz question saved.')}
                                        title="Add Mini-Quiz Question (Optional)"
                                    />
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* CARD 3: FINAL ASSESSMENT */}
                {activeTab === 'assessment' && (
                    <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h2 className="text-2xl font-extrabold text-[#111827] font-display">Course Final Assessment / Exam</h2>
                                    <span className="bg-[#10B981] text-white text-xs font-black uppercase px-2 py-0.5 rounded">
                                        100% to pass
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Course-wide final exam. Learners must pass this comprehensive assessment to earn their verifiable certificate.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Link
                                    href={route('staff.courses.assessments.index', course.id)}
                                    className="px-3.5 py-2 text-xs font-bold text-[#111827] bg-[#F3F4F6] hover:bg-gray-200 border border-[#E5E7EB] rounded-md transition-colors"
                                >
                                    Full Screen Editor ↗
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setShowAddFinalQuiz((v) => !v)}
                                    className="px-4 py-2 text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 rounded-md transition-colors"
                                >
                                    {showAddFinalQuiz ? 'Close Form' : '+ Add Exam Question'}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            {finals.length > 0 ? (
                                finals.map((q, qIdx) => (
                                    editingId === q.id ? (
                                        <QuestionEditForm
                                            key={q.id}
                                            initial={q}
                                            saving={editSaving}
                                            errors={editErrors}
                                            onCancel={() => setEditingId(null)}
                                            onSave={(data) => saveEdit(q, data)}
                                        />
                                    ) : (
                                        <QuestionCard
                                            key={q.id}
                                            q={q}
                                            index={qIdx}
                                            onEdit={() => { setEditingId(q.id); setEditErrors({}); }}
                                            onDelete={() => deleteQuiz(q)}
                                        />
                                    )
                                ))
                            ) : (
                                <div className="text-center py-10 px-6 bg-[#F9FAFB] rounded-md border-2 border-[#E5E7EB] border-dashed">
                                    <p className="text-[#111827] font-bold text-sm mb-1">No Final Exam Questions Yet</p>
                                    <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
                                        Add multiple-choice questions for the final exam. Learners must score 100% on these questions to receive their certificate.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddFinalQuiz(true)}
                                        className="px-4 py-2 text-xs font-bold text-white bg-[#111827] hover:bg-gray-800 rounded-md transition-colors"
                                    >
                                        + Add First Exam Question
                                    </button>
                                </div>
                            )}
                        </div>

                        {showAddFinalQuiz && (
                            <QuestionForm
                                course={course}
                                moduleId={null}
                                allowAddAnother
                                onDone={() => setShowAddFinalQuiz(false)}
                                onSaved={() => pop('Final exam question saved.')}
                                title="Add Final Exam Question (Course-wide)"
                            />
                        )}
                    </div>
                )}
            </div>

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

            {toast && (
                <div
                    key={toast.id}
                    role="status"
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-md bg-[#111827] text-white text-sm font-bold border-2 border-gray-800"
                >
                    <span className="w-6 h-6 rounded-md bg-[#10B981] flex items-center justify-center text-xs">✓</span>
                    {toast.text}
                </div>
            )}
        </StaffLayout>
    );
}
