import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';
import CourseLogoBadge, {
    LOGO_CONFIG,
    COURSE_THEME_COLORS,
    getRandomThemeKey,
    RANDOM_THEME_KEYS,
} from '@/Components/flat/CourseLogoBadge';

const INPUT_CLASS =
    'block w-full px-4 py-3 bg-[#F3F4F6] border-2 border-transparent rounded-md text-sm text-[#111827] placeholder:text-gray-400 focus:bg-white focus:border-[#10B981] focus:outline-none transition-colors';

const STEPS = [
    { id: 1, label: 'Course Identity', short: 'Course Info' },
    { id: 2, label: 'Subscription Model', short: 'Pricing' },
    { id: 3, label: 'Industry Certification', short: 'Certification' },
];

const FIELD_STEP = {
    title: 1,
    description: 1,
    status: 1,
    academic_year: 1,
    category_logo: 1,
    instructor_id: 1,
    billing_type: 2,
    price: 2,
    cert_title: 3,
    cert_url: 3,
};

const BILLING_TIERS = [
    {
        id: 'free',
        label: 'Free Institutional Course',
        sub: 'RM 0.00 · Free access for all registered learners',
    },
    {
        id: 'one_time',
        label: 'Paid / Commercial Course',
        sub: 'Learners pay a set price (RM) to unlock course access',
    },
];

function billingSummary(data) {
    if (data.billing_type === 'one_time' || data.billing_type === 'subscription') {
        return `RM ${Number(data.price || 0).toFixed(2)} · PAID COURSE`;
    }
    return 'FREE ACCESS';
}

export default function Create({ instructors = [], isCoordinator = false }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [stepError, setStepError] = useState('');
    // Auto-random theme color default so lazy instructors have a nice color pre-picked
    const [initialTheme] = useState(() => getRandomThemeKey());

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        status: 'draft',
        academic_year: '2026 / 2027',
        category_logo: initialTheme,
        billing_type: 'free',
        price: '0.00',
        cert_title: '',
        cert_url: '',
        instructor_id: '',
        redirect_to_hub: true,
    });

    const progressPct = Math.round((currentStep / STEPS.length) * 100);
    const progressWidth = currentStep === 1 ? 'w-1/3' : currentStep === 2 ? 'w-2/3' : 'w-full';

    // If the server rejects a field, jump to the earliest wizard step that owns it.
    useEffect(() => {
        const failingSteps = Object.keys(errors)
            .map((key) => FIELD_STEP[key])
            .filter(Boolean);
        if (failingSteps.length > 0) {
            setCurrentStep(Math.min(...failingSteps));
        }
    }, [errors]);

    const titleIsValid = () => data.title.trim() !== '';

    const goToStep = (target) => {
        if (target > 1 && !titleIsValid()) {
            setStepError('Please enter a Course Title before continuing.');
            setCurrentStep(1);
            return;
        }
        setStepError('');
        setCurrentStep(target);
    };

    const submit = (e) => {
        e.preventDefault();
        // Enter key on steps 1 and 2 must advance the wizard, never submit early.
        if (currentStep < STEPS.length) {
            goToStep(currentStep + 1);
            return;
        }
        if (!titleIsValid()) {
            goToStep(1);
            return;
        }
        post(route('staff.courses.store'));
    };

    const pickRandomColor = () => {
        const others = RANDOM_THEME_KEYS.filter((k) => k !== data.category_logo);
        const next = others[Math.floor(Math.random() * others.length)] || RANDOM_THEME_KEYS[0];
        setData('category_logo', next);
    };

    const prefillCapm = () => {
        setData((prev) => ({
            ...prev,
            category_logo: 'amber',
            cert_title: 'CAPM® · Certified Associate in Project Management',
            cert_url: 'https://www.pmi.org/certifications/certified-associate-capm',
            billing_type: 'one_time',
            price: '199.00',
        }));
    };

    const prefillMaritime = () => {
        setData((prev) => ({
            ...prev,
            category_logo: 'navy',
            cert_title: 'JLM Pelaut & Pegawai Operasi Maritim Certified',
            cert_url: 'https://www.marine.gov.my',
            billing_type: 'one_time',
            price: '150.00',
        }));
    };

    const currentTheme = LOGO_CONFIG[data.category_logo] || LOGO_CONFIG.charcoal || LOGO_CONFIG.general;

    return (
        <StaffLayout>
            <Head title="Create Course · Instructor Studio" />

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <Link
                        href={route('staff.courses.index')}
                        className="inline-flex items-center text-sm font-semibold text-[#10B981] hover:text-emerald-700 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Courses
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-display">
                                Create New Subject
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Three quick steps: course info, subscription model, and industry certification.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={prefillCapm}
                                className="px-3 py-1.5 text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] rounded hover:bg-amber-200 transition-colors"
                            >
                                + Prefill CAPM® Demo
                            </button>
                            <button
                                type="button"
                                onClick={prefillMaritime}
                                className="px-3 py-1.5 text-xs font-bold bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE] rounded hover:bg-blue-200 transition-colors"
                            >
                                + Prefill Maritime Demo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Wizard Progress Bar + Step Tracker */}
                <nav
                    aria-label="Course setup progress"
                    className="bg-white rounded-md border-2 border-[#E5E7EB] p-5 space-y-4"
                >
                    <div className="flex items-center justify-between text-xs font-extrabold text-[#111827]">
                        <span>Step {currentStep} of {STEPS.length} · {progressPct}%</span>
                        <span className="text-gray-500 uppercase tracking-wider">
                            {STEPS[currentStep - 1].label}
                        </span>
                    </div>
                    <div
                        className="w-full bg-[#F3F4F6] border border-[#E5E7EB] h-3 rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={progressPct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div className={`h-full bg-[#10B981] rounded-full transition-all duration-300 ${progressWidth}`} />
                    </div>
                    <ol className="grid grid-cols-3 gap-2">
                        {STEPS.map((step) => {
                            const active = currentStep === step.id;
                            const done = currentStep > step.id;
                            return (
                                <li key={step.id}>
                                    <button
                                        type="button"
                                        onClick={() => goToStep(step.id)}
                                        aria-current={active ? 'step' : undefined}
                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md border-2 text-left transition-colors ${
                                            active
                                                ? 'border-[#111827] bg-[#111827] text-white'
                                                : done
                                                ? 'border-[#10B981] bg-emerald-50 text-[#065F46]'
                                                : 'border-[#E5E7EB] bg-white text-gray-600 hover:border-gray-400'
                                        }`}
                                    >
                                        <span
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                                                active
                                                    ? 'bg-white text-[#111827]'
                                                    : done
                                                    ? 'bg-[#10B981] text-white'
                                                    : 'bg-[#F3F4F6] text-gray-500'
                                            }`}
                                        >
                                            {done ? '✓' : step.id}
                                        </span>
                                        <span className="text-xs font-extrabold leading-tight">
                                            <span className="hidden sm:inline">{step.label}</span>
                                            <span className="sm:hidden">{step.short}</span>
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                </nav>

                {stepError && (
                    <div className="bg-[#FEF3C7] border-2 border-[#F59E0B] text-[#111827] rounded-md px-5 py-3 text-sm font-bold">
                        {stepError}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-8">
                    {/* PAGE 1: Course Identity */}
                    {currentStep === 1 && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8 space-y-6">
                                <div className="border-b-2 border-[#E5E7EB] pb-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-[#111827] font-display">
                                            Course Identity & Intake Details
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
                                        onChange={(e) => {
                                            setData('title', e.target.value);
                                            if (stepError) setStepError('');
                                        }}
                                        placeholder="e.g. Pengurusan Projek Profesional (CAPM® Exam Preparation)"
                                        className={INPUT_CLASS}
                                    />
                                    {errors.title && (
                                        <p className="mt-2 text-red-600 text-sm font-medium">{errors.title}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="academic_year" className="block text-sm font-bold text-[#111827] mb-2">
                                            Academic Year / Intake Date
                                        </label>
                                        <input
                                            id="academic_year"
                                            name="academic_year"
                                            type="text"
                                            value={data.academic_year}
                                            onChange={(e) => setData('academic_year', e.target.value)}
                                            placeholder="e.g. 2026 / 2027 · Intake 1"
                                            className={INPUT_CLASS}
                                        />
                                        {errors.academic_year && (
                                            <p className="mt-2 text-red-600 text-sm font-medium">{errors.academic_year}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="status" className="block text-sm font-bold text-[#111827] mb-2">
                                            Initial Status
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className={INPUT_CLASS}
                                        >
                                            <option value="draft">Draft - Hidden from catalog until deployed</option>
                                            <option value="published">Published - Live in catalog immediately</option>
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
                                            <label htmlFor="instructor_id" className="block text-sm font-extrabold text-[#111827]">
                                                Assigned Subject Instructor
                                            </label>
                                            <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-amber-600 text-white rounded">
                                                Coordinator Control
                                            </span>
                                        </div>
                                        <select
                                            id="instructor_id"
                                            name="instructor_id"
                                            value={data.instructor_id}
                                            onChange={(e) => setData('instructor_id', e.target.value)}
                                            className="block w-full px-4 py-2.5 bg-white border-2 border-amber-300 rounded-md text-sm text-[#111827] focus:bg-white focus:border-[#111827] focus:outline-none transition-colors"
                                        >
                                            <option value="">Assign to myself or leave unassigned</option>
                                            {instructors.map((ins) => (
                                                <option key={ins.id} value={ins.id}>
                                                    {ins.name} ({ins.email})
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-amber-900 font-medium">
                                            As Subject Coordinator, you can assign any faculty lecturer to manage and teach this subject.
                                        </p>
                                        {errors.instructor_id && (
                                            <p className="text-red-600 text-xs font-bold">{errors.instructor_id}</p>
                                        )}
                                    </div>
                                )}

                                {/* Simple Color Swatch Picker + Randomizer */}
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
                                        placeholder="Describe what learners will gain from this program..."
                                        className={`${INPUT_CLASS} resize-none`}
                                    />
                                    {errors.description && (
                                        <p className="mt-2 text-red-600 text-sm font-medium">{errors.description}</p>
                                    )}
                                </div>
                            </div>

                            <div key="actions-step-1" className="bg-white rounded-md border-2 border-[#E5E7EB] p-5 flex items-center justify-between gap-3">
                                <Link
                                    href={route('staff.courses.index')}
                                    className="px-6 py-3 text-sm font-bold text-[#111827] bg-[#F3F4F6] hover:bg-gray-200 rounded-md transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    key="next-1"
                                    type="button"
                                    onClick={() => goToStep(2)}
                                    className="px-6 py-3 text-sm font-bold text-white bg-[#111827] rounded-md hover:bg-[#10B981] transition-colors duration-200"
                                >
                                    Next: Subscription Model →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PAGE 2: Subscription Model */}
                    {currentStep === 2 && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8 space-y-6">
                                <div className="border-b-2 border-[#E5E7EB] pb-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-[#111827] font-display">
                                            Subscription Model
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Choose whether this course is free for all learners or requires a paid enrollment.
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold bg-[#111827] text-white px-2.5 py-1 rounded shrink-0">
                                        Pricing
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {BILLING_TIERS.map((tier) => (
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
                                {errors.billing_type && (
                                    <p className="text-red-600 text-sm font-medium">{errors.billing_type}</p>
                                )}

                                {data.billing_type === 'one_time' && (
                                    <div className="p-4 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-md space-y-3">
                                        <div>
                                            <label htmlFor="price" className="block text-sm font-bold text-[#111827] mb-1">
                                                Course Price (RM)
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
                                            {errors.price && (
                                                <p className="mt-1 text-red-600 text-xs font-semibold">{errors.price}</p>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-600 flex items-center gap-2">
                                            <span className="text-[#10B981] font-bold">✓ Catalog Display:</span>
                                            <span>
                                                Learners will see{' '}
                                                <span className="font-extrabold text-[#111827]">RM {Number(data.price || 0).toFixed(2)}</span>{' '}
                                                in the catalog.
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Live learner pricing preview card */}
                                <div className="border-2 border-[#111827] rounded-md p-4 flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                                            Learner Catalog Preview
                                        </p>
                                        <p className="font-display font-extrabold text-sm text-[#111827] truncate">
                                            {data.title.trim() || 'Untitled Subject'}
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center px-3 py-1.5 rounded bg-[#111827] text-white text-xs font-extrabold shrink-0">
                                        {billingSummary(data)}
                                    </span>
                                </div>
                            </div>

                            <div key="actions-step-2" className="bg-white rounded-md border-2 border-[#E5E7EB] p-5 flex items-center justify-between gap-3">
                                <button
                                    key="back-2"
                                    type="button"
                                    onClick={() => goToStep(1)}
                                    className="px-6 py-3 text-sm font-bold text-[#111827] bg-[#F3F4F6] hover:bg-gray-200 rounded-md transition-colors"
                                >
                                    ← Back to Course Info
                                </button>
                                <button
                                    key="next-2"
                                    type="button"
                                    onClick={() => goToStep(3)}
                                    className="px-6 py-3 text-sm font-bold text-white bg-[#111827] rounded-md hover:bg-[#10B981] transition-colors duration-200"
                                >
                                    Next: Industry Certification →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PAGE 3: Industry Certification & Finalize */}
                    {currentStep === 3 && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8 space-y-6">
                                <div className="border-b-2 border-[#E5E7EB] pb-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-[#111827] font-display">
                                            Industry Certification Link (e.g. CAPM®, JLM)
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Link your subject to an external professional standard or licensing body.
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold bg-[#111827] text-white px-2.5 py-1 rounded shrink-0">
                                        Credentials
                                    </span>
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
                                            className={INPUT_CLASS}
                                        />
                                        {errors.cert_title && (
                                            <p className="mt-2 text-red-600 text-sm font-medium">{errors.cert_title}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="cert_url" className="block text-sm font-bold text-[#111827] mb-2">
                                            Official Certification / Registration Link
                                        </label>
                                        <input
                                            id="cert_url"
                                            name="cert_url"
                                            type="url"
                                            value={data.cert_url}
                                            onChange={(e) => setData('cert_url', e.target.value)}
                                            placeholder="https://www.pmi.org/certifications/certified-associate-capm"
                                            className={INPUT_CLASS}
                                        />
                                        {errors.cert_url && (
                                            <p className="mt-2 text-red-600 text-sm font-medium">{errors.cert_url}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Course Setup Summary Box */}
                            <div className="bg-white rounded-md border-2 border-[#111827] p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-display font-extrabold text-lg text-[#111827]">
                                        Course Setup Summary
                                    </h3>
                                    <CourseLogoBadge category={data.category_logo} size="badge" />
                                </div>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                    <div>
                                        <dt className="text-[10px] font-black uppercase tracking-wider text-gray-500">Title</dt>
                                        <dd className="font-bold text-[#111827] break-words">{data.title.trim() || 'Untitled Subject'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-[10px] font-black uppercase tracking-wider text-gray-500">Intake</dt>
                                        <dd className="font-bold text-[#111827]">{data.academic_year || '2026 / 2027'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-[10px] font-black uppercase tracking-wider text-gray-500">Theme Color</dt>
                                        <dd className="font-bold text-[#111827] flex items-center gap-1.5">
                                            <span
                                                className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                                                style={{ backgroundColor: currentTheme.hex || '#111827' }}
                                            />
                                            <span>{currentTheme.name || 'Classic Ink'}</span>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-[10px] font-black uppercase tracking-wider text-gray-500">Initial Status</dt>
                                        <dd className="font-bold text-[#111827] uppercase">{data.status}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-[10px] font-black uppercase tracking-wider text-gray-500">Subscription Model</dt>
                                        <dd className="font-bold text-[#111827]">{billingSummary(data)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-[10px] font-black uppercase tracking-wider text-gray-500">Industry Certification</dt>
                                        <dd className="font-bold text-[#111827] break-words">
                                            {data.cert_title || 'None linked'}
                                        </dd>
                                    </div>
                                    {isCoordinator && (
                                        <div>
                                            <dt className="text-[10px] font-black uppercase tracking-wider text-gray-500">Assigned Instructor</dt>
                                            <dd className="font-bold text-[#111827]">
                                                {instructors.find((i) => String(i.id) === String(data.instructor_id))?.name || 'Self / Unassigned'}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>

                            <div key="actions-step-3" className="bg-white rounded-md border-2 border-[#E5E7EB] p-5 flex items-center justify-between gap-3">
                                <button
                                    key="back-3"
                                    type="button"
                                    onClick={() => goToStep(2)}
                                    className="px-6 py-3 text-sm font-bold text-[#111827] bg-[#F3F4F6] hover:bg-gray-200 rounded-md transition-colors"
                                >
                                    ← Back to Subscription Model
                                </button>
                                <button
                                    key="submit-3"
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-3 text-sm font-bold text-white bg-[#10B981] rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : '✓ Create Subject & Open Action Hub'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </StaffLayout>
    );
}
