import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-[100dvh] bg-white text-gray-900 antialiased">
                {/* Navigation */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
                    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                        <Link href={route('home')} className="shrink-0">
                            <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                CoPED PULSE
                            </span>
                        </Link>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link
                                href={route('login')}
                                className="px-4 sm:px-5 py-2 text-sm font-bold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                href={route('register')}
                                className="px-4 sm:px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all"
                            >
                                Sign up free
                            </Link>
                        </div>
                    </nav>
                </header>

                {/* Hero: asymmetric split */}
                <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                Lightweight LMS for training teams
                            </span>
                            <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none text-gray-900">
                                Publish courses. Enroll in seconds. Prove completion.
                            </h1>
                            <p className="mt-5 text-base text-gray-600 leading-relaxed max-w-[65ch]">
                                Instructors create modules, embed slides/PDFs, and add a final quiz. Learners browse, enroll, learn, and pass at 100% to complete.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all"
                                >
                                    Start free
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 rounded-xl shadow-sm hover:shadow-md transition-all"
                                >
                                    Log in
                                </Link>
                            </div>
                        </div>

                        {/* Custom abstract SVG illustration: indigo/purple geometric learning motif */}
                        <div className="relative" aria-hidden="true">
                            <svg viewBox="0 0 560 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" role="img" aria-label="Abstract illustration of layered course modules and completion progress">
                                <defs>
                                    <linearGradient id="wel-grad-a" x1="0" y1="0" x2="560" y2="440" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#6366F1" />
                                        <stop offset="1" stopColor="#A855F7" />
                                    </linearGradient>
                                    <linearGradient id="wel-grad-b" x1="0" y1="0" x2="1" y2="1">
                                        <stop stopColor="#C7D2FE" />
                                        <stop offset="1" stopColor="#E9D5FF" />
                                    </linearGradient>
                                    <linearGradient id="wel-grad-c" x1="0" y1="0" x2="1" y2="0">
                                        <stop stopColor="#10B981" />
                                        <stop offset="1" stopColor="#14B8A6" />
                                    </linearGradient>
                                </defs>
                                {/* backdrop cards */}
                                <rect x="40" y="60" width="320" height="200" rx="24" fill="url(#wel-grad-b)" opacity="0.55" />
                                <rect x="80" y="100" width="320" height="200" rx="24" fill="#fff" stroke="#E0E7FF" strokeWidth="2" />
                                {/* module rows */}
                                <rect x="112" y="132" width="256" height="44" rx="12" fill="#EEF2FF" />
                                <circle cx="140" cy="154" r="12" fill="url(#wel-grad-a)" />
                                <rect x="160" y="146" width="120" height="10" rx="5" fill="#6366F1" opacity="0.55" />
                                <rect x="160" y="160" width="80" height="8" rx="4" fill="#A5B4FC" />
                                <rect x="112" y="188" width="256" height="44" rx="12" fill="#F5F3FF" />
                                <circle cx="140" cy="210" r="12" fill="url(#wel-grad-a)" opacity="0.85" />
                                <rect x="160" y="202" width="140" height="10" rx="5" fill="#8B5CF6" opacity="0.55" />
                                <rect x="160" y="216" width="96" height="8" rx="4" fill="#C4B5FD" />
                                <rect x="112" y="244" width="256" height="44" rx="12" fill="#ECFDF5" />
                                <circle cx="140" cy="266" r="12" fill="url(#wel-grad-c)" />
                                <rect x="160" y="258" width="100" height="10" rx="5" fill="#10B981" opacity="0.6" />
                                <rect x="160" y="272" width="64" height="8" rx="4" fill="#6EE7B7" />
                                {/* progress card */}
                                <rect x="300" y="280" width="220" height="120" rx="20" fill="#fff" stroke="#E0E7FF" strokeWidth="2" />
                                <rect x="324" y="304" width="120" height="12" rx="6" fill="#1F2937" />
                                <rect x="324" y="328" width="172" height="10" rx="5" fill="#E0E7FF" />
                                <rect x="324" y="328" width="140" height="10" rx="5" fill="url(#wel-grad-a)" />
                                <rect x="324" y="350" width="88" height="24" rx="12" fill="#DCFCE7" />
                                <circle cx="338" cy="362" r="6" fill="#16A34A" />
                                <rect x="350" y="358" width="56" height="8" rx="4" fill="#16A34A" />
                                {/* floating completion badge */}
                                <circle cx="452" cy="110" r="44" fill="url(#wel-grad-a)" />
                                <path d="M434 110l13 13 22-26" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                                {/* small accent dots */}
                                <circle cx="96" cy="330" r="10" fill="#C7D2FE" />
                                <circle cx="500" cy="230" r="8" fill="#DDD6FE" />
                                <circle cx="120" cy="80" r="6" fill="#A5B4FC" />
                            </svg>
                        </div>
                    </div>
                </section>

                {/* How it works: learner bento */}
                <section className="py-16 lg:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
                            How it works for learners
                        </h2>
                        <p className="mt-3 text-base text-gray-600 leading-relaxed max-w-[65ch]">
                            Three moves from discovery to a verifiable completion.
                        </p>

                        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-8 shadow-lg">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl font-black">1</div>
                                <h3 className="mt-5 text-xl font-bold">Browse catalog</h3>
                                <p className="mt-2 text-sm leading-relaxed text-indigo-100">
                                    Explore published courses only. Drafts and archived content stay hidden.
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-8 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black text-xl flex items-center justify-center shadow-md">2</div>
                                <h3 className="mt-5 text-xl font-bold text-gray-900">One-click enroll</h3>
                                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                    Enroll instantly. Your portal tracks ENROLLED and COMPLETED plus a live progress bar.
                                </p>
                            </div>
                            <div className="bg-indigo-50/60 rounded-2xl p-8 border border-indigo-100">
                                <div className="w-10 h-10 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-black text-xl flex items-center justify-center">3</div>
                                <h3 className="mt-5 text-xl font-bold text-gray-900">Learn and pass quiz</h3>
                                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                    Study inline embeds or links, open Take Final Assessment, and hit 100% for the Course Completed banner.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it works: instructor */}
                <section className="py-16 lg:py-24 bg-gray-50/60 border-y border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
                                How it works for instructors
                            </h2>
                            <p className="mt-3 text-base text-gray-600 leading-relaxed max-w-[65ch]">
                                Publish training, attach content, add a quiz, then watch completions land.
                            </p>
                            <Link
                                href={route('register')}
                                className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all"
                            >
                                Teach on CoPED PULSE
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </Link>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-4">
                                <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-black flex items-center justify-center">1</div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Create course</h3>
                                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">Move through draft, published, and archived. Only published appears in the catalog.</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-4">
                                <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-black flex items-center justify-center">2</div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Add modules and quiz</h3>
                                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">Attach each module as a link or an embed, then write Final Quiz questions with four options.</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-4">
                                <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-black flex items-center justify-center">3</div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Track progress</h3>
                                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">Enrollments carry a progress value to 100 with completion timestamps for every learner.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature strip: scroll-snap pills */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-black tracking-tight text-gray-900">Built for accountable training</h2>
                        <div className="mt-6 flex gap-3 overflow-x-auto pb-2 snap-x">
                            <span className="snap-start shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-sm font-bold text-indigo-800">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                                Role gating
                            </span>
                            <span className="snap-start shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-50 border border-purple-100 text-sm font-bold text-purple-800">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                                Embed vs Link
                            </span>
                            <span className="snap-start shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-sm font-bold text-emerald-800">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Quiz-gated completion
                            </span>
                            <span className="snap-start shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-700">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                                Progress bars
                            </span>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-100 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                CoPED PULSE
                            </span>
                            <p className="mt-2 text-sm text-gray-500 max-w-[65ch] leading-relaxed">
                                A lightweight LMS where instructors publish courses and learners prove completion.
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">For Local Dev Demo</p>
                            <p className="mt-2 text-sm text-gray-700">
                                Instructor: <span className="font-mono font-bold">instructor@coped.org</span>
                            </p>
                            <p className="mt-1 text-sm text-gray-700">
                                Learner: <span className="font-mono font-bold">learner@coped.org</span>
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Password: <span className="font-mono font-bold">password</span>
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
