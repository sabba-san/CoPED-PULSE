import { Head, Link, useForm } from '@inertiajs/react';
import logo from '@/images/logo.png';
import FlatInput from '@/Components/flat/FlatInput';
import { BookOpenIcon, CheckIcon, GraduationCapIcon } from '@/Components/flat/icons';

const DEMO_ACCOUNTS = [
    {
        label: 'Learner',
        email: 'learn@gmail.com',
    },
    {
        label: 'Learner (Certified)',
        email: 'abbasabudzarr@gmail.com',
    },
    {
        label: 'Instructor',
        email: 'instruct@gmail.com',
    },
    {
        label: 'Coordinator',
        email: 'coordinator@coped.org',
    },
];

export default function Login() {
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('login'));
    };

    const fillDemo = (email) => {
        form.setData({
            ...form.data,
            email,
            password: 'password',
        });
    };

    return (
        <>
            <Head title="Login" />

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
                                    Welcome back.
                                </h1>
                                <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-blue-50">
                                    Sign in to keep learning or to manage your courses.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4 rounded-lg bg-white p-4 text-[#111827]">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#3B82F6] text-white">
                                        <BookOpenIcon className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm leading-relaxed">
                                        <span className="font-display font-bold">Learners</span> enroll in seconds and track progress to completion.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 rounded-lg bg-white p-4 text-[#111827]">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white">
                                        <GraduationCapIcon className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm leading-relaxed">
                                        <span className="font-display font-bold">Instructors</span> publish courses and watch completions land.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-lg bg-white p-5 text-[#111827]">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Demo accounts
                                </p>
                                <p className="mt-2 text-sm">
                                    Coordinator: <span className="font-mono font-bold">coordinator@coped.org</span>
                                </p>
                                <p className="mt-1 text-sm">
                                    Instructor: <span className="font-mono font-bold">instruct@gmail.com</span>
                                </p>
                                <p className="mt-1 text-sm">
                                    Learner: <span className="font-mono font-bold">learn@gmail.com</span>
                                </p>
                                <p className="mt-1 text-sm text-gray-600">
                                    Password: <span className="font-mono font-bold">password</span>
                                </p>
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
                                    Log in to your account
                                </h1>
                                <p className="text-sm text-[#4B5563] mt-1 leading-relaxed">
                                    Enter your credentials to access your courses and learning records.
                                </p>
                            </div>

                            {/* Primary Login Form First */}
                            <form className="flex flex-col gap-4 sm:gap-5" onSubmit={submit}>
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
                                    autoComplete="current-password"
                                    required
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    placeholder="Your password"
                                    inputClassName="bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:bg-[#F8FAFC] text-[#111827] rounded-lg px-3.5 py-2.5 text-sm font-medium"
                                    error={form.errors.password}
                                />

                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        name="remember"
                                        type="checkbox"
                                        checked={form.data.remember}
                                        onChange={(e) => form.setData('remember', e.target.checked)}
                                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#2563EB] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    />
                                    <label htmlFor="remember" className="ml-2 cursor-pointer select-none text-sm font-medium text-gray-600">
                                        Remember me for 30 days
                                    </label>
                                </div>

                                {/* Strictly ONE Submit Button */}
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm py-3 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
                                >
                                    {form.processing ? 'Signing in...' : 'Log in'}
                                </button>
                            </form>

                            {/* Divider & Registration Link */}
                            <div className="mt-6 border-t border-[#E5E7EB] pt-5 text-center">
                                <p className="text-sm text-gray-600">
                                    New to CoPED PULSE?{' '}
                                    <Link
                                        href={route('register')}
                                        className="font-bold text-[#2563EB] hover:text-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    >
                                        Create an account
                                    </Link>
                                </p>
                            </div>

                            {/* Move the Demo Quick-Fill Box Below the Form with Neutral Institutional Styling */}
                            <div className="mt-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                                        Demo Quick Access
                                    </span>
                                    <span className="text-[11px] font-mono text-[#64748B]">
                                        Password: password
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2.5">
                                    {DEMO_ACCOUNTS.map((acc) => {
                                        const isSelected = form.data.email === acc.email;
                                        return (
                                            <button
                                                key={acc.email}
                                                type="button"
                                                onClick={() => fillDemo(acc.email)}
                                                className={
                                                    isSelected
                                                        ? 'bg-[#EFF6FF] text-[#1D4ED8] border-2 border-[#2563EB] rounded-md px-3 py-2 text-xs font-bold text-left flex items-center justify-between transition-colors'
                                                        : 'bg-white hover:bg-[#F1F5F9] text-[#1E293B] border border-[#CBD5E1] rounded-md px-3 py-2 text-xs font-semibold text-left flex items-center justify-between transition-colors'
                                                }
                                            >
                                                <span className="truncate">{acc.label}</span>
                                                {isSelected && <CheckIcon className="h-3.5 w-3.5 text-[#2563EB] shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
