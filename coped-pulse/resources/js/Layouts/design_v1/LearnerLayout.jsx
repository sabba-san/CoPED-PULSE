import { Link, usePage } from '@inertiajs/react';
import logo from '@/images/logo.png';

export default function LearnerLayout({ children }) {
    const { url, props } = usePage();
    const flash = props?.flash;

    const navLinks = [
        { name: 'My Portal', href: route('portal'), active: url.startsWith('/portal') },
        { name: 'Browse Catalog', href: route('learner.catalog'), active: url.startsWith('/learner/catalog') },
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-white border-b-2 border-[#E5E7EB] print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-8">
                            <Link href={route('portal')} className="flex items-center space-x-3" aria-label="CoPED PULSE Home">
                                <img src={logo} alt="CoPED PULSE Logo" className="h-8 w-auto" />
                                <span className="text-xl font-display font-extrabold text-[#111827] tracking-tight hidden sm:block">
                                    CoPED PULSE
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

            {/* Global Flash Messages (hidden when printing) */}
            {flash?.success && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 print:hidden">
                    <div className="bg-emerald-50 border-2 border-[#10B981] text-[#065F46] rounded-md px-5 py-3 text-sm font-bold flex items-center gap-2">
                        <span className="w-5 h-5 bg-[#10B981] text-white rounded-full flex items-center justify-center text-xs font-black shrink-0">✓</span>
                        <span>{flash.success}</span>
                    </div>
                </div>
            )}
            {flash?.error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 print:hidden">
                    <div className="bg-[#FEF3C7] border-2 border-[#F59E0B] text-[#111827] rounded-md px-5 py-3 text-sm font-bold flex items-center gap-2">
                        <span className="w-5 h-5 bg-[#F59E0B] text-[#111827] rounded-full flex items-center justify-center text-xs font-black shrink-0">!</span>
                        <span>{flash.error}</span>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 print:p-0 print:m-0 print:max-w-none">
                {children}
            </main>
        </div>
    );
}

