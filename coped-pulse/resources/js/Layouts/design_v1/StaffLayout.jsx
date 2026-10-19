import { Link, usePage } from '@inertiajs/react';
import logo from '@/images/logo.png';

export default function StaffLayout({ children }) {
    const { url } = usePage();
    const { auth, flash } = usePage().props;

    const navLinks = [
        { name: 'Dashboard', href: route('dashboard'), active: url === '/dashboard' },
        { name: 'Courses', href: route('staff.courses.index'), active: url.startsWith('/staff/courses') },
        ...(auth?.user?.organization_id
            ? [{ name: 'Organization', href: route('staff.organization.show'), active: url.startsWith('/staff/organization') }]
            : []),
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-white border-b-2 border-[#E5E7EB]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-8">
                            <Link href={route('dashboard')} className="flex items-center space-x-3" aria-label="CoPED PULSE Instructor Home">
                                <img src={logo} alt="CoPED PULSE Logo" className="h-8 w-auto" />
                                <span className="text-xl font-display font-extrabold text-[#111827] tracking-tight hidden sm:block">
                                    CoPED PULSE <span className="text-xs uppercase tracking-wider font-extrabold px-2 py-0.5 bg-[#10B981] text-white rounded ml-2">Instructor</span>
                                </span>
                            </Link>
                            
                            <div className="hidden md:flex space-x-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`px-4 py-2 rounded-md text-sm transition-colors ${
                                            link.active
                                                ? 'bg-[#111827] text-white font-bold'
                                                : 'text-gray-700 hover:text-[#111827] hover:bg-[#F3F4F6] font-semibold'
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
                                className="px-4 py-2 text-sm font-bold text-red-600 bg-white border-2 border-red-200 rounded-md hover:bg-red-50 hover:border-red-500 transition-colors"
                            >
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Global Flash Messages */}
            {flash?.success && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                    <div className="bg-emerald-50 border-2 border-[#10B981] text-[#065F46] rounded-md px-5 py-3 text-sm font-bold flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-[#10B981] text-white rounded-full flex items-center justify-center text-xs font-black">✓</span>
                            <span>{flash.success}</span>
                        </div>
                    </div>
                </div>
            )}
            {flash?.error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                    <div className="bg-red-50 border-2 border-red-500 text-red-900 rounded-md px-5 py-3 text-sm font-bold flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-black">!</span>
                            <span>{flash.error}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}

