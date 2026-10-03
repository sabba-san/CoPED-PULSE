import { Link, usePage } from '@inertiajs/react';

export default function StaffLayout({ children }) {
    const { url } = usePage();

    const navLinks = [
        { name: 'Dashboard', href: route('dashboard'), active: url === '/dashboard' },
        { name: 'Courses', href: route('staff.courses.index'), active: url.startsWith('/staff/courses') },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 text-gray-900 font-sans">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200/50 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-8">
                            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 tracking-tight cursor-default hover:scale-105 transition-transform duration-300">
                                CoPED PULSE <span className="text-sm font-bold text-teal-600 ml-1">Instructor</span>
                            </span>
                            
                            <div className="hidden md:flex space-x-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                                            link.active
                                                ? 'bg-emerald-100/80 text-emerald-800 shadow-inner'
                                                : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-100/50'
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
                {children}
            </main>
        </div>
    );
}
