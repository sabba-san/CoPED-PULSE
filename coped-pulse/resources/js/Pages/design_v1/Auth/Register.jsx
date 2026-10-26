import { Head, Link, useForm } from '@inertiajs/react';
import logo from '@/images/logo.png';
import FlatButton from '@/Components/flat/FlatButton';
import FlatInput from '@/Components/flat/FlatInput';
import { BookOpenIcon, CircleCheckIcon, GraduationCapIcon } from '@/Components/flat/icons';

const ROLES = [
    {
        value: 'learner',
        title: 'Learner',
        emoji: '🎓',
        desc: 'Enroll in courses and track completion.',
        Icon: BookOpenIcon,
        selectedClass: 'border-2 border-[#2563EB] bg-[#EFF6FF]',
        iconSelectedClass: 'bg-[#2563EB] text-white',
        checkClass: 'text-[#2563EB]',
    },
    {
        value: 'staff',
        title: 'Instructor',
        emoji: '👩‍🏫',
        desc: 'Publish courses and track learners.',
        Icon: GraduationCapIcon,
        selectedClass: 'border-2 border-[#10B981] bg-[#ECFDF5]',
        iconSelectedClass: 'bg-[#10B981] text-white',
        checkClass: 'text-[#10B981]',
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
                            Start learning today! 🚀
                        </h1>
                        <p className="text-xs text-blue-100 mt-0.5 leading-relaxed">
                            Join UUM CoPED's professional upskilling community in seconds.
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

                    {/* Form block: crisp white, single column immediately below mobile banner */}
                    <div className="flex flex-col justify-start lg:justify-center items-center px-4 py-6 sm:px-8 lg:py-12 lg:px-12">
                        <div className="w-full max-w-md">
                            {/* Original Desktop Heading (Hidden on Mobile) */}
                            <div className="hidden lg:block mb-8">
                                <h2 className="font-display text-3xl font-extrabold tracking-tight">Create an account</h2>
                                <p className="mt-2 text-base leading-relaxed text-gray-600">
                                    Pick your role. Learners and instructors sign in on the same page.
                                </p>
                            </div>

                            <form className="flex flex-col gap-4 sm:gap-5" onSubmit={submit}>
                                <fieldset>
                                    <legend className="text-sm font-bold text-[#111827]">Choose your role</legend>
                                    
                                    {/* Desktop Baseline Role Picker (lg:grid) */}
                                    <div className="hidden lg:grid grid-cols-2 gap-3 mt-2">
                                        {ROLES.map(({ value, title, desc, Icon }) => {
                                            const selected = form.data.role === value;
                                            return (
                                                <label key={value} className="cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="role_desktop"
                                                        value={value}
                                                        checked={selected}
                                                        onChange={() => form.setData('role', value)}
                                                        className="sr-only"
                                                    />
                                                    <span
                                                        className={`flex h-full items-start gap-3 rounded-lg border-4 p-4 transition-all duration-200 hover:scale-[1.02] focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${
                                                            selected
                                                                ? 'border-[#3B82F6] bg-blue-50'
                                                                : 'border-transparent bg-[#F3F4F6] hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
                                                                selected ? 'bg-[#3B82F6] text-white' : 'bg-white text-[#3B82F6]'
                                                            }`}
                                                        >
                                                            <Icon className="h-6 w-6" />
                                                        </span>
                                                        <span>
                                                            <span className="flex items-center gap-1.5 font-display text-base font-bold">
                                                                {title}
                                                                {selected && <CircleCheckIcon className="h-4 w-4 text-[#3B82F6]" />}
                                                            </span>
                                                            <span className="mt-1 block text-sm leading-relaxed text-gray-600">{desc}</span>
                                                        </span>
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {/* Mobile Compact Role Picker (< lg) */}
                                    <div className="lg:hidden grid grid-cols-1 gap-2.5 mt-2.5">
                                        {ROLES.map(({ value, title, emoji, desc, selectedClass, iconSelectedClass, checkClass }) => {
                                            const selected = form.data.role === value;
                                            return (
                                                <label key={value} className="cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="role_mobile"
                                                        value={value}
                                                        checked={selected}
                                                        onChange={() => form.setData('role', value)}
                                                        className="sr-only"
                                                    />
                                                    <span
                                                        className={`flex h-full items-start gap-3 rounded-xl p-3 sm:p-3.5 transition-all duration-200 hover:scale-[1.01] ${
                                                            selected
                                                                ? selectedClass
                                                                : 'border-2 border-[#CBD5E1] bg-white hover:border-gray-400'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-base transition-colors ${
                                                                selected ? iconSelectedClass : 'bg-gray-100 text-gray-700'
                                                            }`}
                                                        >
                                                            <span>{emoji}</span>
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="flex items-center gap-1.5 font-display text-sm font-bold text-[#111827]">
                                                                {emoji} {title}
                                                                {selected && <CircleCheckIcon className={`h-4 w-4 ${checkClass}`} />}
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
                                    inputClassName="bg-white border-2 border-[#CBD5E1] focus:border-[#2563EB] focus:bg-[#F8FAFC] text-[#111827] rounded-lg px-3.5 py-2.5 text-sm font-medium lg:bg-[#F3F4F6] lg:border-2 lg:border-transparent lg:focus:bg-white lg:focus:border-[#3B82F6] lg:px-4 lg:py-3 lg:rounded-md"
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
                                    inputClassName="bg-white border-2 border-[#CBD5E1] focus:border-[#2563EB] focus:bg-[#F8FAFC] text-[#111827] rounded-lg px-3.5 py-2.5 text-sm font-medium lg:bg-[#F3F4F6] lg:border-2 lg:border-transparent lg:focus:bg-white lg:focus:border-[#3B82F6] lg:px-4 lg:py-3 lg:rounded-md"
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
                                    inputClassName="bg-white border-2 border-[#CBD5E1] focus:border-[#2563EB] focus:bg-[#F8FAFC] text-[#111827] rounded-lg px-3.5 py-2.5 text-sm font-medium lg:bg-[#F3F4F6] lg:border-2 lg:border-transparent lg:focus:bg-white lg:focus:border-[#3B82F6] lg:px-4 lg:py-3 lg:rounded-md"
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
                                    inputClassName="bg-white border-2 border-[#CBD5E1] focus:border-[#2563EB] focus:bg-[#F8FAFC] text-[#111827] rounded-lg px-3.5 py-2.5 text-sm font-medium lg:bg-[#F3F4F6] lg:border-2 lg:border-transparent lg:focus:bg-white lg:focus:border-[#3B82F6] lg:px-4 lg:py-3 lg:rounded-md"
                                    error={form.errors.password_confirmation}
                                />

                                {/* Desktop Submit Button (Baseline FlatButton) */}
                                <FlatButton
                                    type="submit"
                                    variant="primary"
                                    disabled={form.processing}
                                    className="hidden lg:flex w-full disabled:opacity-50 disabled:hover:scale-100 min-h-[44px]"
                                >
                                    {form.processing ? 'Creating account...' : 'Create account'}
                                </FlatButton>

                                {/* Mobile Tactile Submit Button (< lg) */}
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="lg:hidden w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-sm py-3 rounded-lg border-2 border-[#111827] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
                                >
                                    {form.processing ? 'Creating account...' : 'Create Free Account →'}
                                </button>
                            </form>

                            <div className="mt-8 border-t-2 border-[#E5E7EB] pt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <Link
                                        href={route('login')}
                                        className="font-bold text-[#3B82F6] hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
