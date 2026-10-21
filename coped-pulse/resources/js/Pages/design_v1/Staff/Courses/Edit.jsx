import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
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

export default function Edit({ course, initialMode = 'editor', enrolledCount = 0 }) {
    const { flash } = usePage().props;
    const modules = course.modules || [];
    const assessments = course.assessments || [];
    const finalAssessments = assessments.filter((q) => !q.module_id);

    // Workspace Mode: 'editor' (Curriculum & Studio Editor) | 'preview' (Learner Preview Mode)
    const [mode, setMode] = useState(initialMode);

    // Course Section Switcher: 'curriculum' | 'settings'
    const [courseTab, setCourseTab] = useState('curriculum');
    // Settings sub-tab: 'identity' | 'pricing' | 'cert'
    const [settingsTab, setSettingsTab] = useState('identity');

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

    return (
        <StaffLayout>
            <Head title={`Edit: ${course.title} · Instructor Studio`} />

            {/* Top Workspace Mode Bar */}
            <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-4 sm:p-5 mb-8">
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
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
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
                                <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
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
                                <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                <span>Learner Preview Mode</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODE 1: CURRICULUM & STUDIO EDITOR */}
            {mode === 'editor' && (
                <div className="space-y-8">
                    {/* 2-Option Course Level Switcher */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setCourseTab('curriculum')}
                            className={`text-left p-5 rounded-md border-2 transition-colors ${
                                courseTab === 'curriculum'
                                    ? 'bg-[#111827] border-[#111827] text-white'
                                    : 'bg-white border-[#E5E7EB] text-[#111827] hover:border-[#10B981]'
                            }`}
                        >
                            <span className="block text-3xl mb-2" aria-hidden="true">📚</span>
                            <span className="block font-extrabold text-base font-display">Course Curriculum & Modules</span>
                            <span className={`block text-xs mt-0.5 font-semibold ${courseTab === 'curriculum' ? 'text-gray-300' : 'text-gray-500'}`}>
                                {modules.length} module{modules.length === 1 ? '' : 's'} · Telemetry & chapters
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setCourseTab('settings')}
                            className={`text-left p-5 rounded-md border-2 transition-colors ${
                                courseTab === 'settings'
                                    ? 'bg-[#111827] border-[#111827] text-white'
                                    : 'bg-white border-[#E5E7EB] text-[#111827] hover:border-[#10B981]'
                            }`}
                        >
                            <span className="block text-3xl mb-2" aria-hidden="true">⚙️</span>
                            <span className="block font-extrabold text-base font-display">Course Settings</span>
                            <span className={`block text-xs mt-0.5 font-semibold ${courseTab === 'settings' ? 'text-gray-300' : 'text-gray-500'}`}>
                                Identity, pricing & certification
                            </span>
                        </button>
                    </div>

                    {/* Course Details Form (Settings) */}
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
                        {/* Section 1: Course Identity, Year & Emblem */}
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
                                    Course Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors resize-none"
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
                                        2. Subscription Model
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Choose whether this course is free for all learners or requires a paid enrollment.
                                    </p>
                                </div>
                                <span className="text-xs font-bold bg-[#111827] text-white px-2.5 py-1 rounded">
                                    Pricing
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { id: 'free', label: 'Free Institutional Course', sub: 'RM 0.00 · Free access for all registered learners' },
                                    { id: 'one_time', label: 'Paid / Commercial Course', sub: 'Learners pay a set price (RM) to unlock course access' },
                                ].map((tier) => (
                                    <div
                                        key={tier.id}
                                        onClick={() => {
                                            setData('billing_type', tier.id);
                                            if (tier.id === 'free') setData('price', '0.00');
                                        }}
                                        className={`p-5 rounded-md border-2 cursor-pointer transition-all ${
                                            data.billing_type === tier.id
                                                ? 'border-[#111827] bg-[#F9FAFB] ring-2 ring-[#111827]'
                                                : 'border-[#E5E7EB] bg-white hover:border-gray-400'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 mb-1.5">
                                            <input
                                                type="radio"
                                                name="billing_type"
                                                value={tier.id}
                                                checked={data.billing_type === tier.id}
                                                onChange={() => {
                                                    setData('billing_type', tier.id);
                                                    if (tier.id === 'free') setData('price', '0.00');
                                                }}
                                                className="text-[#111827] focus:ring-0"
                                            />
                                            <span className="text-sm font-extrabold text-[#111827]">{tier.label}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-6">{tier.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {data.billing_type === 'one_time' && (
                                <div className="p-4 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-md space-y-3">
                                    <div>
                                        <label htmlFor="price" className="block text-sm font-bold text-[#111827] mb-1">
                                            Price in Malaysian Ringgit (RM)
                                        </label>
                                        <div className="relative max-w-xs">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
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
                                                placeholder="199.00"
                                                className="block w-full pl-12 pr-4 py-2.5 bg-white border-2 border-[#E5E7EB] rounded-md text-sm font-extrabold text-[#111827] focus:border-[#10B981] focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-600 flex items-center gap-2">
                                        <span className="text-[#10B981] font-bold">✓ Catalog Display:</span>
                                        <span>
                                            Learners see{' '}
                                            <span className="font-extrabold text-[#111827]">
                                                RM {Number(data.price || 0).toFixed(2)}
                                            </span>
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
                                <div className="flex gap-2">
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

                    {/* Course Modules Section */}
                    {courseTab === 'curriculum' && (
                    <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            <div>
                                <h2 className="text-2xl font-extrabold text-[#111827] font-display">Course Modules & Curriculum</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Click any module to edit its lectures, media attachments, and optional mini-quizzes.</p>
                            </div>
                            <button
                                type="button"
                                onClick={addModule}
                                className="px-5 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 rounded-md transition-colors shrink-0"
                            >
                                + Add Module
                            </button>
                        </div>
                        
                        {/* Module Completion & Student Progress Summary Strip */}
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

                        {modules.length > 0 && (
                            <div className="flex justify-end pt-2 border-t-2 border-[#E5E7EB]">
                                <button
                                    type="button"
                                    onClick={addModule}
                                    className="px-6 py-3 text-sm font-bold text-white bg-[#111827] rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    + Add Next Module
                                </button>
                            </div>
                        )}
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
                                        className="aspect-video bg-[#111827] flex items-center justify-center relative overflow-hidden border-b-2 border-[#E5E7EB] animate-fade-in"
                                    >
                                        {activeEmbedUrl && isVideo ? (
                                            <>
                                                {getYouTubeId(activeSafeUrl) && (
                                                    <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111827]/90 border border-gray-700 text-[11px] font-bold text-white uppercase tracking-wider">
                                                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse-dot" />
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
                                            className="px-3 py-1.5 text-xs font-bold bg-[#111827] text-white rounded hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                        >
                                            Next Unit →
                                        </button>
                                    </div>

                                    {/* Unit Description & Content */}
                                    <div className="p-6 sm:p-8 space-y-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded bg-[#10B981] text-white">
                                                Module {activeIndex + 1}
                                            </span>
                                            {activeModule.duration && (
                                                <span className="text-xs font-bold text-gray-500">
                                                    · {Math.round(activeModule.duration / 60)} minutes
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-bold text-[#111827] font-display">
                                            {activeModule.title}
                                        </h2>
                                        {activeModule.description ? (
                                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                                {activeModule.description}
                                            </p>
                                        ) : (
                                            <p className="text-gray-400 text-sm italic">
                                                No module description added yet.
                                            </p>
                                        )}

                                        {/* Subtopic Lessons in Preview Mode */}
                                        {activeModule.lessons && activeModule.lessons.length > 0 && (
                                            <div className="pt-4 border-t-2 border-[#E5E7EB] space-y-2">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Subtopic Lectures & Materials:
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {activeModule.lessons.map((lesson, lIdx) => {
                                                        const lessonSafe = safeUrl(lesson.content_url);
                                                        const isCurrent = activeSafeUrl === lessonSafe;
                                                        return (
                                                            <button
                                                                key={lesson.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    if (lessonSafe) {
                                                                        setSelectedMediaUrl(lessonSafe);
                                                                        setSelectedMediaTitle(lesson.title);
                                                                    }
                                                                }}
                                                                className={`text-left p-3 rounded-md border-2 transition-all flex items-center justify-between gap-2 active:scale-95 ${
                                                                    isCurrent
                                                                        ? 'bg-[#111827] text-white border-[#111827]'
                                                                        : 'bg-[#F9FAFB] hover:bg-white text-gray-800 border-[#E5E7EB] hover:border-gray-400'
                                                                }`}
                                                            >
                                                                <div className="min-w-0">
                                                                    <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded mr-1.5 ${
                                                                        isCurrent ? 'bg-[#10B981] text-white' : 'bg-gray-200 text-gray-700'
                                                                    }`}>
                                                                        Lesson {lIdx + 1}
                                                                    </span>
                                                                    <span className="text-xs font-bold truncate">
                                                                        {lesson.title}
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs font-black shrink-0">
                                                                    {isCurrent ? '▶' : '→'}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Transcript / Dive Deeper */}
                                        {activeModule.transcript && (
                                            <div className="pt-4 border-t-2 border-[#E5E7EB]">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowTranscript((v) => !v)}
                                                    className="flex items-center gap-2 text-xs font-bold text-[#10B981] hover:text-emerald-700"
                                                >
                                                    <span>{showTranscript ? '▼ Hide Transcript & Notes' : '▶ Show Lecture Transcript & Reading'}</span>
                                                </button>
                                                {showTranscript && (
                                                    <div className="mt-3 p-4 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                        {activeModule.transcript}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg border-2 border-dashed border-[#E5E7EB] p-12 text-center">
                                    <p className="text-base font-bold text-[#111827]">No modules created yet.</p>
                                    <p className="text-xs text-gray-500 mt-1 mb-4">Switch to the Studio Editor to add your first module.</p>
                                    <button
                                        type="button"
                                        onClick={() => setMode('editor')}
                                        className="px-4 py-2 bg-[#10B981] text-white font-bold text-xs rounded"
                                    >
                                        Open Studio Editor
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Syllabus Navigation */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white rounded-lg border-2 border-[#E5E7EB] p-5">
                                <h3 className="text-lg font-bold text-[#111827] font-display mb-1">
                                    Course Curriculum
                                </h3>
                                <p className="text-xs text-gray-500 mb-4">
                                    Click any unit to jump and preview its learner stage.
                                </p>

                                <div className="space-y-2.5">
                                    {modules.map((m, idx) => {
                                        const isActive = m.id === activeModuleId;
                                        const qCount = assessments.filter((q) => q.module_id === m.id).length;

                                        return (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => handleSelectModule(m.id)}
                                                className={`w-full text-left p-3.5 rounded-md border-2 transition-all flex items-start justify-between gap-2 ${
                                                    isActive
                                                        ? 'bg-[#111827] text-white border-[#111827]'
                                                        : 'bg-white hover:bg-[#F9FAFB] text-gray-800 border-[#E5E7EB]'
                                                }`}
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                                            isActive ? 'bg-[#10B981] text-white' : 'bg-gray-200 text-gray-700'
                                                        }`}>
                                                            Unit {idx + 1}
                                                        </span>
                                                        {qCount > 0 && (
                                                            <span className={`text-[10px] font-bold ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                                                                · {qCount} quiz
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-[#111827]'}`}>
                                                        {m.title}
                                                    </p>
                                                </div>
                                                <span className="shrink-0 text-xs font-black">
                                                    {isActive ? '▶' : '→'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Final Course Quiz Card */}
                            <div className="bg-white rounded-lg border-2 border-[#E5E7EB] p-5">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h4 className="font-display font-bold text-sm text-[#111827]">
                                        Final Course Assessment
                                    </h4>
                                    <span className="bg-[#10B981] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shrink-0">
                                        100% Required
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-4">
                                    Comprehensive exam ({finalAssessments.length} questions) required for learners to earn their certificate.
                                </p>
                                <Link
                                    href={route('staff.courses.assessments.index', course.id)}
                                    className="block text-center w-full py-2 bg-[#F3F4F6] hover:bg-gray-200 text-[#111827] font-bold text-xs rounded border border-[#E5E7EB] transition-colors"
                                >
                                    Manage Final Quiz Questions ({finalAssessments.length}) →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </StaffLayout>
    );
}