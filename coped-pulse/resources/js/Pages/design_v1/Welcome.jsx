import { Head, Link } from '@inertiajs/react';
import logo from '@/images/logo.png';
import FlatButton from '@/Components/flat/FlatButton';
import FlatCard, { FlatIconBadge } from '@/Components/flat/FlatCard';
import FlatSection from '@/Components/flat/FlatSection';
import {
    ArrowRightIcon,
    BookOpenIcon,
    ChartColumnIcon,
    CircleCheckIcon,
    ClipboardCheckIcon,
    GraduationCapIcon,
    LinkIcon,
    ShieldCheckIcon,
} from '@/Components/flat/icons';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-[100dvh] bg-white font-sans text-[#111827] antialiased">
                {/* Navigation: solid white, single line, max 80px */}
                <header className="sticky top-0 z-40 border-b-2 border-[#E5E7EB] bg-white">
                    <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8">
                        <Link href={route('home')} className="flex shrink-0 items-center gap-2" aria-label="CoPED PULSE Home">
                            <img src={logo} alt="CoPED PULSE Logo" className="h-7 sm:h-8 w-auto" />
                            <span className="font-display text-base sm:text-2xl font-extrabold tracking-tight text-[#111827]">
                                CoPED PULSE
                            </span>
                        </Link>
                        <div className="flex items-center gap-1.5 sm:gap-3">
                            <Link
                                href={route('login')}
                                className="rounded-md px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#111827] transition-all duration-200 hover:bg-[#F3F4F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            >
                                Log in
                            </Link>
                            <Link
                                href={route('register')}
                                className="rounded-md bg-[#3B82F6] px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            >
                                Start free
                            </Link>
                        </div>
                    </nav>
                </header>

                {/* Hero: solid blue color block, geometric art only */}
                <section className="relative overflow-hidden bg-[#3B82F6] text-white">
                    {/* Strategic decoration: large flat geometric shapes */}
                    <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10" aria-hidden="true" />
                    <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/10" aria-hidden="true" />
                    <div className="pointer-events-none absolute right-1/3 top-16 hidden h-24 w-24 rotate-12 rounded-lg bg-[#F59E0B] lg:block" aria-hidden="true" />

                    <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-24">
                        <div className="overflow-hidden break-words">
                            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight sm:leading-none tracking-tight break-words">
                                Publish courses. Enroll in seconds. Prove completion.
                            </h1>
                            <p className="mt-4 sm:mt-5 max-w-[65ch] text-sm sm:text-base leading-relaxed text-blue-50 break-words">
                                Instructors publish modules and quizzes. Learners enroll, learn, and complete at 100%.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <FlatButton href={route('register')} variant="onBlue">
                                    Start free
                                    <ArrowRightIcon className="h-4 w-4" />
                                </FlatButton>
                                <FlatButton href={route('login')} variant="outlineWhite">
                                    Log in
                                </FlatButton>
                            </div>
                        </div>

                        {/* Geometric composition: overlapping circles, squares, module blocks */}
                        <div className="relative" aria-hidden="true">
                            <div className="relative mx-auto w-full max-w-md">
                                <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-white/15" />
                                <div className="absolute -right-4 top-8 h-16 w-16 rotate-12 rounded-lg bg-[#F59E0B]" />
                                <div className="absolute -bottom-8 right-10 h-20 w-20 rounded-full bg-[#10B981]" />

                                <div className="relative rounded-lg bg-white p-6 text-[#111827]">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#3B82F6] font-display text-lg font-extrabold text-white">
                                            1
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-3 w-3/4 rounded-md bg-[#111827]" />
                                            <div className="mt-2 h-2 w-1/2 rounded-md bg-gray-300" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-3 rounded-lg bg-[#F3F4F6] p-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#10B981] font-display text-lg font-extrabold text-white">
                                            2
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-3 w-2/3 rounded-md bg-[#111827]" />
                                            <div className="mt-2 h-2 w-1/3 rounded-md bg-gray-300" />
                                        </div>
                                    </div>
                                    <div className="mt-4 rounded-lg bg-[#111827] p-4">
                                        <div className="h-3 w-1/2 rounded-md bg-white" />
                                        <div className="mt-3 h-2.5 rounded-md bg-white/25">
                                            <div className="h-2.5 w-4/5 rounded-md bg-[#3B82F6]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -top-8 right-2 flex h-20 w-20 items-center justify-center rounded-full bg-[#F59E0B] text-white">
                                    <CircleCheckIcon className="h-9 w-9" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Learners: white section, 3 tinted color-block cards */}
                <FlatSection bg="white">
                    <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                        How it works for learners
                    </h2>
                    <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-gray-600">
                        Three moves from discovery to a verifiable completion.
                    </p>

                    <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <FlatCard tone="primary">
                            <FlatIconBadge>
                                <BookOpenIcon className="h-6 w-6" />
                            </FlatIconBadge>
                            <h3 className="mt-5 font-display text-xl font-bold">Browse catalog</h3>
                            <p className="mt-2 text-sm leading-relaxed text-blue-50">
                                Explore published courses only. Drafts and archived content stay hidden.
                            </p>
                        </FlatCard>
                        <FlatCard tone="blue">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3B82F6] text-white transition-transform duration-200 group-hover:scale-110">
                                <ArrowRightIcon className="h-6 w-6" />
                            </div>
                            <h3 className="mt-5 font-display text-xl font-bold">One-click enroll</h3>
                            <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                Enroll instantly. Your portal tracks enrolled and completed with a live bar.
                            </p>
                        </FlatCard>
                        <FlatCard tone="green">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981] text-white transition-transform duration-200 group-hover:scale-110">
                                <ClipboardCheckIcon className="h-6 w-6" />
                            </div>
                            <h3 className="mt-5 font-display text-xl font-bold">Learn and pass quiz</h3>
                            <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                Study embeds or links, take the final assessment, and finish at 100%.
                            </p>
                        </FlatCard>
                    </div>
                </FlatSection>

                {/* Instructors: dark ink color block */}
                <FlatSection bg="ink">
                    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
                        <div>
                            <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                                How it works for instructors
                            </h2>
                            <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-gray-300">
                                Publish training, attach content, add a quiz, then watch completions land.
                            </p>
                            <div className="mt-6">
                                <FlatButton href={route('register')} variant="accent">
                                    Teach on CoPED PULSE
                                    <ArrowRightIcon className="h-4 w-4" />
                                </FlatButton>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-4 rounded-lg bg-white p-6 text-[#111827] transition-all duration-200 hover:scale-[1.02]">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#3B82F6] font-display font-extrabold text-white">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-display font-bold">Create course</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                                        Move through draft, published, and archived. Only published appears in the catalog.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 rounded-lg bg-white p-6 text-[#111827] transition-all duration-200 hover:scale-[1.02]">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#10B981] font-display font-extrabold text-white">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-display font-bold">Add modules and quiz</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                                        Attach each module as a link or an embed, then write quiz questions with four options.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 rounded-lg bg-white p-6 text-[#111827] transition-all duration-200 hover:scale-[1.02]">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B] font-display font-extrabold text-[#111827]">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-display font-bold">Track progress</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                                        Enrollments carry progress to 100 with timestamps for every learner.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </FlatSection>

                {/* Capabilities: muted section, 2-col card grid with visual diversity */}
                <FlatSection bg="muted">
                    <h2 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
                        Built for accountable training
                    </h2>
                    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FlatCard tone="white">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3B82F6] text-white transition-transform duration-200 group-hover:scale-110">
                                <ShieldCheckIcon className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 font-display text-lg font-bold">Role gating</h3>
                            <p className="mt-1 text-sm leading-relaxed text-gray-600">
                                Staff and learner areas stay separate by role.
                            </p>
                        </FlatCard>
                        <FlatCard tone="blue">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#3B82F6] transition-transform duration-200 group-hover:scale-110">
                                <LinkIcon className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 font-display text-lg font-bold">Embed vs Link</h3>
                            <p className="mt-1 text-sm leading-relaxed text-gray-600">
                                Show slides inline or open media in a new tab.
                            </p>
                        </FlatCard>
                        <FlatCard tone="green">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#10B981] transition-transform duration-200 group-hover:scale-110">
                                <ClipboardCheckIcon className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 font-display text-lg font-bold">Quiz-gated completion</h3>
                            <p className="mt-1 text-sm leading-relaxed text-gray-600">
                                Completion unlocks at a 100% quiz score.
                            </p>
                        </FlatCard>
                        <FlatCard tone="amber">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#D97706] transition-transform duration-200 group-hover:scale-110">
                                <ChartColumnIcon className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 font-display text-lg font-bold">Progress bars</h3>
                            <p className="mt-1 text-sm leading-relaxed text-gray-700">
                                Every enrollment shows live progress to completion.
                            </p>
                        </FlatCard>
                    </div>
                </FlatSection>

                {/* Amber CTA band */}
                <section className="bg-[#F59E0B] text-[#111827]">
                    <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#111827] text-white">
                                <GraduationCapIcon className="h-8 w-8" />
                            </div>
                            <h2 className="max-w-md font-display text-2xl font-extrabold tracking-tight md:text-3xl">
                                Start teaching or start learning today.
                            </h2>
                        </div>
                        <FlatButton href={route('register')} variant="dark">
                            Start free
                            <ArrowRightIcon className="h-4 w-4" />
                        </FlatButton>
                    </div>
                </section>

                {/* Footer: dark ink */}
                <footer className="bg-[#111827] text-white overflow-hidden">
                    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:px-8 overflow-hidden">
                        <div className="min-w-0 break-words">
                            <span className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
                                <img src={logo} alt="CoPED PULSE Logo" className="h-7 w-auto" />
                                CoPED PULSE
                            </span>
                            <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-gray-300 break-words">
                                A lightweight LMS where instructors publish courses and learners prove completion.
                            </p>
                        </div>
                        <div className="rounded-lg bg-[#F3F4F6] p-5 text-[#111827] min-w-0 break-words overflow-hidden">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                For Local Dev Demo
                            </p>
                            <p className="mt-2 text-sm break-all">
                                Instructor: <span className="font-mono font-bold">instruct@gmail.com</span>
                            </p>
                            <p className="mt-1 text-sm break-all">
                                Learner: <span className="font-mono font-bold">learn@gmail.com</span>
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                                Password: <span className="font-mono font-bold">password</span>
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
