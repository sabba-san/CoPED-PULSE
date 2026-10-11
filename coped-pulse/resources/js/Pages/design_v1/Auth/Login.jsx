import { Head, Link, useForm } from '@inertiajs/react';
import logo from '@/images/logo.png';
import FlatButton from '@/Components/flat/FlatButton';
import FlatInput from '@/Components/flat/FlatInput';
import { BookOpenIcon, GraduationCapIcon } from '@/Components/flat/icons';

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

    return (
        <>
            <Head title="Login" />

            <div className="grid min-h-[100dvh] grid-cols-1 bg-white font-sans text-[#111827] antialiased lg:grid-cols-2">
                {/* Brand block: solid blue poster, geometric decoration only */}
                <div className="relative overflow-hidden bg-[#3B82F6] text-white">
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
                                Instructor: <span className="font-mono font-bold">instructor@coped.org</span>
                            </p>
                            <p className="mt-1 text-sm">
                                Learner: <span className="font-mono font-bold">learner@coped.org</span>
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

                {/* Form block: crisp white, single column */}
                <div className="flex items-center justify-center px-4 py-12 sm:px-8 lg:px-12">
                    <div className="w-full max-w-md">
                        <h2 className="font-display text-3xl font-extrabold tracking-tight">Log in</h2>
                        <p className="mt-2 text-base leading-relaxed text-gray-600">
                            One login for learners and instructors.
                        </p>

                        <form className="mt-8 flex flex-col gap-5" onSubmit={submit}>
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

                            <FlatButton
                                type="submit"
                                variant="primary"
                                disabled={form.processing}
                                className="w-full disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {form.processing ? 'Signing in...' : 'Log in'}
                            </FlatButton>
                        </form>

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
        </>
    );
}
