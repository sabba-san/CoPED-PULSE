import { Head, Link, useForm } from '@inertiajs/react';
import logo from '@/images/logo.png';
import FlatInput from '@/Components/flat/FlatInput';
import { BookOpenIcon, CheckIcon, GraduationCapIcon } from '@/Components/flat/icons';

const ROLES = [
    {
        value: 'learner',
        title: 'Learner',
        desc: 'Enroll in courses and track completion.',
        Icon: GraduationCapIcon,
    },
    {
        value: 'staff',
        title: 'Instructor',
        desc: 'Publish courses and track learners.',
        Icon: BookOpenIcon,
    },
];

export default function Register() {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'learner',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('register'), {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Register" />

            <div className="min-h-[100dvh] bg-white font-sans text-[#111827] antialiased">
                {/* Clean Institutional Mobile Top Navbar (< lg) */}
                <div className="lg:hidden bg-white border-b border-[#E5E7EB] px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href={route('home')} className="flex shrink-0 items-center gap-2" aria-label="CoPED PULSE home">
                        <img src={logo} alt="CoPED PULSE logo" className="h-7 w-auto" />
                        <span className="font-display text-base font-extrabold tracking-tight text-[#111827]">
                            CoPED PULSE
                        </span>
                    </Link>
                    <Link
                        href={route('home')}
                        className="text-xs font-semibold text-[#4B5563] hover:text-[#111827] border border-[#E5E7EB] rounded-md px-3 py-1.5 transition-colors"
                    >
                        ← Back to home
                    </Link>
                </div>

                <div className="grid min-h-0 lg:min-h-[100dvh] grid-cols-1 lg:grid-cols-2">
                    {/* Brand block: solid blue poster, geometric decoration only - Hidden on mobile (< lg) */}
                    <div className="hidden lg:flex relative overflow-hidden bg-[#3B82F6] text-white flex-col justify-center">
                        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10" aria-hidden="true" />
                        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10" aria-hidden="true" />
                        <div className="pointer-events-none absolute bottom-16 right-10 hidden h-20 w-20 rotate-12 rounded-lg bg-[#F59E0B] lg:block" aria-hidden="true" />

                        <div className="relative mx-auto flex h-full w-full max-w-xl flex-col justify-center gap-8 px-4 py-12 sm:px-8 lg:px-12 lg:py-16">
                            <Link href={route('home')} className="flex items-center gap-2" aria-label="CoPED PULSE home">
                                <img src={logo} alt="CoPED PULSE logo" className="h-9 w-auto rounded-md bg-white p-0.5" />
                                <span className="font-display text-2xl font-extrabold tracking-tight">CoPED PULSE</span>
                            </Link>

                            <div>
                                <h1 className="font-display text-4xl font-extrabold leading-none tracking-tight md:text-5xl">
                                    Start today.
                                </h1>
                                <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-blue-50">
                                    One account. Learn as a learner or publish as an instructor.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4 rounded-lg bg-white p-4 text-[#111827]">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#3B82F6] text-white">
                                        <BookOpenIcon className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm leading-relaxed">
                                        <span className="font-display font-bold">Learners</span> browse the catalog, enroll in one click, finish at 100 percent.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 rounded-lg bg-white p-4 text-[#111827]">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white">
                                        <GraduationCapIcon className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm leading-relaxed">
                                        <span className="font-display font-bold">Instructors</span> create courses, add modules and quizzes, track progress.
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={route('home')}
                                className="w-fit rounded-md px-3 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#3B82F6]"
                            >
                                Back to home
                            </Link>
                        </div>
                    </div>

                    {/* Form block: crisp white, clean institutional layout */}
                    <div className="flex flex-col justify-center items-center px-4 py-8 sm:px-8 lg:py-12 lg:px-12">
                        <div className="w-full max-w-md">
                            {/* Clean Section Heading Above the Form (Zero Emojis) */}
                            <div className="mb-6 sm:mb-8">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB]">
                                    UUM CoPED · Learning Portal
                                </span>
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827] mt-1 font-display">
                                    Create an account
                                </h1>
                                <p className="text-sm text-[#4B5563] mt-1 leading-relaxed">
                                    Select your role and complete your profile to get started.
                                </p>
                            </div>

                            <form className="flex flex-col gap-4 sm:gap-5" onSubmit={submit}>
                                <fieldset>
                                    <legend className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                                        Choose your role
                                    </legend>

                                    {/* Clean Monoline Role Cards (Zero Emojis) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                        {ROLES.map(({ value, title, desc, Icon }) => {
                                            const selected = form.data.role === value;
                                            return (
                                                <label key={value} className="cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="role"
                                                        value={value}
                                                        checked={selected}
                                                        onChange={() => form.setData('role', value)}
                                                        className="sr-only"
                                                    />
                                                    <span
                                                        className={`flex h-full items-start gap-3 rounded-lg p-3 sm:p-3.5 transition-all ${
                                                            selected
                                                                ? 'border-2 border-[#2563EB] bg-[#EFF6FF]/50'
                                                                : 'border border-[#CBD5E1] bg-white hover:border-[#94A3B8]'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                                                selected ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#475569]'
                                                            }`}
                                                        >
                                                            <Icon className="h-5 w-5" />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="flex items-center justify-between gap-1 font-display text-sm font-bold text-[#111827]">
                                                                <span>{title}</span>
                                                                {selected && <CheckIcon className="h-4 w-4 text-[#2563EB] shrink-0" />}
                                                            </span>
                                                            <span className="mt-0.5 block text-xs leading-relaxed text-gray-600">{desc}</span>
                                                        </span>
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {form.errors.role && (
                                        <p className="mt-2 text-sm font-medium text-red-600">{form.errors.role}</p>
                                    )}
                                </fieldset>

                                <FlatInput
                                    label="Full name"
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="Your full name"
                                    inputClassName="bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:bg-[#F8FAFC] text-[#111827] rounded-lg px-3.5 py-2.5 text-sm font-medium"
                                    error={form.errors.name}
                                />

                                <FlatInput
                                    label="Email address"
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    placeholder="you@example.com"
                                    inputClassName="bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:bg-[#F8FAFC] text-[#111827] rounded-lg px-3.5 py-2.5 text-sm font-medium"
                                    error={form.errors.email}
                                />

                                <FlatInput
                                    label="Password"
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    placeholder="Create a strong password"
                                    inputClassName="bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:bg-[#F8FAFC] text-[#111827] rounded-lg px-3.5 py-2.5 text-sm font-medium"
                                    error={form.errors.password}
                                />

                                <FlatInput
                                    label="Confirm password"
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={form.data.password_confirmation}
                                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                    placeholder="Repeat your password"
                                    inputClassName="bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:bg-[#F8FAFC] text-[#111827] rounded-lg px-3.5 py-2.5 text-sm font-medium"
                                    error={form.errors.password_confirmation}
                                />

                                {/* Strictly ONE Submit Button */}
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm py-3 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
                                >
                                    {form.processing ? 'Creating account...' : 'Create account'}
                                </button>
                            </form>

                            {/* Divider & Login Link */}
                            <div className="mt-6 border-t border-[#E5E7EB] pt-5 text-center">
                                <p className="text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <Link
                                        href={route('login')}
                                        className="font-bold text-[#2563EB] hover:text-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    >
                                        Log in
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
