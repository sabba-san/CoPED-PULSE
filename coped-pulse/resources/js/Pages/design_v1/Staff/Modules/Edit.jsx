import { Head, Link, router, usePage } from '@inertiajs/react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';
import QuestionCard from '../Partials/QuestionCard';
import QuestionEditForm from '../Partials/QuestionEditForm';
import QuestionForm from '../Partials/QuestionForm';
import { useEffect, useState } from 'react';

const MAX_MODULE_FILE_SIZE = 15 * 1024 * 1024; // 15MB - must stay below PHP post_max_size
const MAX_MODULE_FILE_LABEL = '15MB';

const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function Edit({ course, module, assessments }) {
    const { flash } = usePage().props;
    const quizzes = assessments || [];

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

    const [showAddQuiz, setShowAddQuiz] = useState(false);
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

    const saveDetails = (e) => {
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
            },
            onError: (errs) => setModErrors(errs),
            onFinish: () => setModSaving(false),
        });
    };

    const lessons = module.lessons || [];
    const [newLesson, setNewLesson] = useState({
        title: '',
        content: '',
        content_type: 'link',
        content_url: '',
        transcript: '',
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
            transcript: newLesson.transcript,
            file: newLesson.file,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setNewLesson({ title: '', content: '', content_type: 'link', content_url: '', transcript: '', file: null });
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
            transcript: l.transcript || '',
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
            transcript: lessonDraft.transcript,
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
            });
        }
    };

    const saveEdit = (q, data) => {
        setEditSaving(true);
        setEditErrors({});
        router.put(route('staff.courses.assessments.update', [course, q.id]), {
            module_id: module.id,
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
            });
        }
    };

    return (
        <StaffLayout>
            <Head title={`Module: ${module.title}`} />

            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <Link
                        href={route('staff.courses.edit', course)}
                        className="inline-flex items-center text-sm font-semibold text-[#10B981] hover:text-emerald-700 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Course
                    </Link>
                    <p className="text-xs font-bold text-[#10B981] uppercase tracking-wider">{course.title}</p>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-display">
                        {module.title}
                    </h1>
                </div>

                {flash?.success && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-800 rounded-md px-6 py-4 text-sm font-medium">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-md px-6 py-4 text-sm font-medium">
                        {flash.error}
                    </div>
                )}

                {/* 1 - Module details (big title) */}
                <form onSubmit={saveDetails} className="bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8 space-y-5">
                    <h2 className="text-xl font-extrabold text-[#111827] font-display">Module Details</h2>

                    <div>
                        <label className="block text-sm font-bold text-[#111827] mb-2">Topic / Module Title</label>
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

                    <div className="flex items-center justify-end pt-2">
                        <button
                            type="submit"
                            disabled={modSaving}
                            className="px-8 py-3 text-sm font-bold text-white bg-[#10B981] rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                            {modSaving ? 'Saving...' : 'Save Details'}
                        </button>
                    </div>
                </form>

                {/* 2 - Subtopics (small titles) */}
                <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8">
                    <h2 className="text-xl font-extrabold text-[#111827] font-display mb-1">Subtopics & Materials</h2>
                    <p className="text-sm text-gray-500 mb-6">Small titles with their own video, files, links, and transcripts.</p>

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
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-bold text-[#111827] mb-1">Media URL (video link, mp4, or page)</label>
                                                <input
                                                    type="text"
                                                    value={lessonDraft.content_url}
                                                    onChange={(e) => setLessonDraft((p) => ({ ...p, content_url: e.target.value }))}
                                                    placeholder="https://..."
                                                    className="block w-full px-3 py-2 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none"
                                                />
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
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-bold text-[#111827] mb-1">Transcript (optional)</label>
                                                <textarea
                                                    rows={2}
                                                    value={lessonDraft.transcript}
                                                    onChange={(e) => setLessonDraft((p) => ({ ...p, transcript: e.target.value }))}
                                                    className="block w-full px-3 py-2 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none resize-y"
                                                />
                                            </div>
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
                                                <button onClick={() => startLessonEdit(l)} className="text-amber-700 hover:text-amber-800 text-xs font-bold">Edit</button>
                                                <button onClick={() => deleteLesson(l)} className="text-red-600 hover:text-red-700 text-xs font-bold">Delete</button>
                                            </div>
                                        </div>
                                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-bold text-gray-500">
                                            {l.content_type && <span className="px-2 py-0.5 rounded-md bg-white border border-[#E5E7EB] uppercase">{l.content_type}</span>}
                                            {l.content_url && <span className="px-2 py-0.5 rounded-md bg-white border border-[#E5E7EB]">has media</span>}
                                            {l.transcript && <span className="px-2 py-0.5 rounded-md bg-white border border-[#E5E7EB]">has transcript</span>}
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

                    <form onSubmit={submitLesson} className="pt-6 border-t-2 border-[#E5E7EB] space-y-4">
                        <h3 className="text-lg font-bold text-[#111827] font-display">Add Subtopic with Materials</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-bold text-[#111827] mb-2">Subtopic Title</label>
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
                                <label className="block text-sm font-bold text-[#111827] mb-2">Material</label>
                                <select
                                    value={newLesson.content_type}
                                    onChange={(e) => {
                                        setNewLesson((p) => ({ ...p, content_type: e.target.value, file: e.target.value === 'link' ? null : p.file }));
                                        if (e.target.value === 'link') setFileAlert(null);
                                    }}
                                    className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md sm:text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none"
                                >
                                    <option value="link">External Link</option>
                                    <option value="file">Upload Material</option>
                                </select>
                            </div>
                            {newLesson.content_type === 'link' ? (
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-bold text-[#111827] mb-2">Media URL</label>
                                <input
                                    type="text"
                                    value={newLesson.content_url}
                                    onChange={(e) => setNewLesson((p) => ({ ...p, content_url: e.target.value }))}
                                    placeholder="https://... (YouTube, Vimeo, or direct mp4)"
                                    className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md sm:text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none"
                                />
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
                            <div>
                                <label className="block text-sm font-bold text-[#111827] mb-2">Transcript (optional)</label>
                                <textarea
                                    rows={2}
                                    value={newLesson.transcript}
                                    onChange={(e) => setNewLesson((p) => ({ ...p, transcript: e.target.value }))}
                                    placeholder="Video transcript for the Dive deeper panel..."
                                    className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md sm:text-sm text-[#111827] resize-y focus:bg-white focus:border-[#10B981] focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
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

                {/* 3 - Mini-quiz (unchanged) */}
                <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-extrabold text-[#111827] font-display">Mini-Quiz</h2>
                            <p className="text-sm text-gray-500">{quizzes.length} {quizzes.length === 1 ? 'question' : 'questions'} in this module.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowAddQuiz((v) => !v)}
                            className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors"
                        >
                            {showAddQuiz ? 'Close Form' : '+ Add Question'}
                        </button>
                    </div>

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
                            <div className="text-center py-10 bg-[#F9FAFB] rounded-md border-2 border-[#E5E7EB] border-dashed">
                                <p className="text-gray-500 font-medium text-sm">No mini-quiz questions yet. Add the first one.</p>
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
                            title="Add Mini-Quiz Question"
                        />
                    )}
                </div>
            </div>
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
