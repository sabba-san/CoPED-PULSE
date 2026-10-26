import { Head, Link, useForm } from '@inertiajs/react';
import logo from '@/images/logo.png';
import FlatButton from '@/Components/flat/FlatButton';
import FlatInput from '@/Components/flat/FlatInput';
import { BookOpenIcon, GraduationCapIcon } from '@/Components/flat/icons';

const DEMO_ACCOUNTS = [
    {
        label: 'Learner',
        icon: '🎓',
        email: 'learn@gmail.com',
        classes: 'bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border-2 border-[#3B82F6]',
    },
    {
        label: 'Abbas (100%)',
        icon: '🏆',
        email: 'abbasabudzarr@gmail.com',
        classes: 'bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#047857] border-2 border-[#10B981]',
    },
    {
        label: 'Instructor',
        icon: '👩‍🏫',
        email: 'instruct@gmail.com',
        classes: 'bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#6D28D9] border-2 border-[#8B5CF6]',
    },
    {
        label: 'Coordinator',
        icon: '🛡️',
        email: 'coordinator@coped.org',
        classes: 'bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#B45309] border-2 border-[#F59E0B]',
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
                {/* Cheerful Mobile Hero Header (< lg) */}
                <div className="lg:hidden bg-[#2563EB] text-white border-b-2 border-[#111827] px-5 pt-4 pb-5">
                    {/* Top Row */}
                    <div className="flex items-center justify-between">
                        <Link href={route('home')} className="flex items-center gap-2" aria-label="CoPED PULSE home">
                            <img src={logo} alt="CoPED PULSE logo" className="h-7 w-auto rounded bg-white p-0.5" />
                            <span className="font-display text-base font-black tracking-tight text-white">CoPED PULSE</span>
                        </Link>
                        <Link
                            href={route('home')}
                            className="bg-white/15 hover:bg-white/25 border border-white/30 text-white px-3 py-1 rounded-md text-xs font-bold transition-colors"
                        >
                            ← Home
                        </Link>
                    </div>

                    {/* Greeting Badge & Headline */}
                    <div className="mt-3">
                        <span className="bg-[#FDE68A] text-[#111827] border border-[#111827] px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider inline-block">
                            ✨ UUM CoPED UPSKILLING HUB
                        </span>
                        <h1 className="text-2xl font-extrabold text-white mt-1.5 font-display tracking-tight">
                            Welcome back! 👋
                        </h1>
                        <p className="text-xs text-blue-100 mt-0.5 leading-relaxed">
                            Sign in or tap a role below to jump right into your courses.
                        </p>
                    </div>
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

                    {/* Form block: crisp white, single column immediately below mobile banner */}
                    <div className="flex flex-col justify-start lg:justify-center items-center px-4 py-6 sm:px-8 lg:py-12 lg:px-12">
                        <div className="w-full max-w-md">
                            {/* Original Desktop Heading (Hidden on Mobile) */}
                            <div className="hidden lg:block mb-8">
                                <h2 className="font-display text-3xl font-extrabold tracking-tight">Log in</h2>
                                <p className="mt-2 text-base leading-relaxed text-gray-600">
                                    One login for learners and instructors.
                                </p>
                            </div>

                            {/* Mobile-Only Color-Coded 1-Tap Demo Account 2x2 Grid (< lg) */}
                            <div className="lg:hidden bg-[#FFFBEB] border-2 border-[#111827] rounded-xl p-3.5 mb-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black text-[#111827] uppercase tracking-wider">
                                        ⚡ 1-TAP DEMO LOGIN
                                    </span>
                                    <span className="bg-white border border-[#111827] px-2 py-0.5 rounded text-[10px] font-mono font-bold text-[#111827]">
                                        KEY: password
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2.5">
                                    {DEMO_ACCOUNTS.map((acc) => {
                                        const isSelected = form.data.email === acc.email;
                                        return (
                                            <button
                                                key={acc.label}
                                                type="button"
                                                onClick={() => fillDemo(acc.email)}
                                                className={`${acc.classes} ${
                                                    isSelected ? 'ring-2 ring-[#111827] ring-offset-1 font-black' : ''
                                                } rounded-lg px-3 py-2 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors active:scale-95`}
                                            >
                                                <span>{acc.icon}</span>
                                                <span className="truncate">{acc.label}</span>
                                                {isSelected && <span className="font-black text-xs shrink-0">✓</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

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
                                    inputClassName="bg-white border-2 border-[#CBD5E1] focus:border-[#2563EB] focus:bg-[#F8FAFC] text-[#111827] rounded-lg px-3.5 py-2.5 text-sm font-medium lg:bg-[#F3F4F6] lg:border-2 lg:border-transparent lg:focus:bg-white lg:focus:border-[#3B82F6] lg:px-4 lg:py-3 lg:rounded-md"
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
                                    inputClassName="bg-white border-2 border-[#CBD5E1] focus:border-[#2563EB] focus:bg-[#F8FAFC] text-[#111827] rounded-lg px-3.5 py-2.5 text-sm font-medium lg:bg-[#F3F4F6] lg:border-2 lg:border-transparent lg:focus:bg-white lg:focus:border-[#3B82F6] lg:px-4 lg:py-3 lg:rounded-md"
                                    error={form.errors.password}
                                />

                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        name="remember"
                                        type="checkbox"
                                        checked={form.data.remember}
                                        onChange={(e) => form.setData('remember', e.target.checked)}
                                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#3B82F6] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    />
                                    <label htmlFor="remember" className="ml-2 cursor-pointer select-none text-sm font-medium text-gray-600">
                                        Remember me for 30 days
                                    </label>
                                </div>

                                {/* Desktop Submit Button (Baseline FlatButton) */}
                                <FlatButton
                                    type="submit"
                                    variant="primary"
                                    disabled={form.processing}
                                    className="hidden lg:flex w-full disabled:opacity-50 disabled:hover:scale-100 min-h-[44px]"
                                >
                                    {form.processing ? 'Signing in...' : 'Log in'}
                                </FlatButton>

                                {/* Mobile Tactile Submit Button (< lg) */}
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="lg:hidden w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-sm py-3 rounded-lg border-2 border-[#111827] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
                                >
                                    {form.processing ? 'Signing in...' : 'Log in to Workspace →'}
                                </button>
                            </form>

                            {/* Mobile-Only Cheerful Bottom Feature Strip (< lg) */}
                            <div className="lg:hidden flex flex-wrap items-center justify-center gap-2 pt-4">
                                <span className="bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] px-2.5 py-1 rounded-full text-[11px] font-bold">
                                    🎬 Interactive Video Theater
                                </span>
                                <span className="bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] px-2.5 py-1 rounded-full text-[11px] font-bold">
                                    📜 1-Page Verified PDF Certs
                                </span>
                                <span className="bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] px-2.5 py-1 rounded-full text-[11px] font-bold">
                                    ⚡ Instant Curriculum Deploy
                                </span>
                            </div>

                            <div className="mt-8 border-t-2 border-[#E5E7EB] pt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    New to CoPED PULSE?{' '}
                                    <Link
                                        href={route('register')}
                                        className="font-bold text-[#3B82F6] hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    >
                                        Create an account
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
