import { Link, usePage } from '@inertiajs/react';
import logo from '@/images/logo.png';
import ChatNotificationBell from '@/Components/ChatNotificationBell';
import UserProfileDropdown from '@/Components/UserProfileDropdown';

export default function StaffLayout({ children }) {
    const { url } = usePage();
    const { auth, flash } = usePage().props;

    const isCoordinator = auth?.user?.role === 'coordinator';

    const navLinks = [
        { name: 'Dashboard', href: route('dashboard'), active: url === '/dashboard' },
        { name: 'My courses', href: route('staff.courses.index'), active: url.startsWith('/staff/courses') },
        ...(auth?.user?.organization_id
            ? [{ name: 'Site administration', href: route('staff.organization.show'), active: url.startsWith('/staff/organization') }]
            : []),
    ];

    return (
        <div className="min-h-screen bg-[#E5EAF0] text-[#1E293B] font-sans w-full max-w-[100vw] overflow-x-hidden">
            {/* Low-Glare Institutional Slate Top Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-[#1E293B] border-b border-[#0F172A] w-full max-w-full">
                <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 sm:h-16 items-center w-full max-w-full gap-2">
                        <div className="flex items-center h-full space-x-4 sm:space-x-6">
                            <Link href={route('dashboard')} className="flex items-center space-x-2.5 shrink-0" aria-label="UUM CoPED LMS Home">
                                <img src={logo} alt="UUM CoPED Logo" className="h-7 sm:h-8 w-auto bg-[#F8FAFC] rounded p-0.5" />
                                <div className="leading-tight">
                                    <span className="text-sm sm:text-base font-display font-bold tracking-tight text-[#F8FAFC] block">
                                        UUM CoPED
                                    </span>
                                    <span className="text-[11px] text-slate-300 font-medium hidden sm:block">
                                        {isCoordinator ? 'Coordinator Portal' : 'Instructor Portal'}
                                    </span>
                                </div>
                            </Link>

                            <div className="hidden md:flex items-center h-full space-x-1 border-l border-slate-700 pl-6">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`h-full inline-flex items-center px-3 text-sm border-b-2 transition-colors ${
                                            link.active
                                                ? 'border-[#38BDF8] text-white font-semibold'
                                                : 'border-transparent text-slate-300 hover:text-white hover:border-slate-500 font-medium'
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2.5">
                            <ChatNotificationBell isStaff={true} />
                            <UserProfileDropdown />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Global Flash Messages */}
            {flash?.success && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                    <div className="bg-[#ECFDF5] border border-[#10B981] text-[#065F46] rounded px-4 py-3 text-sm font-medium flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-[#10B981] text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                            <span>{flash.success}</span>
                        </div>
                    </div>
                </div>
            )}
            {flash?.error && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                    <div className="bg-[#FEF2F2] border border-[#EF4444] text-[#991B1B] rounded px-4 py-3 text-sm font-medium flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-[#EF4444] text-white rounded-full flex items-center justify-center text-xs font-bold">!</span>
                            <span>{flash.error}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-12">
                {children}
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <nav
                aria-label="Mobile Bottom Navigation"
                className="md:hidden fixed bottom-0 inset-x-0 z-40 w-full max-w-full bg-[#1E293B] border-t border-[#0F172A] print:hidden"
            >
                <div className="grid grid-cols-4 w-full max-w-full divide-x divide-slate-700">
                    <Link
                        href={route('dashboard')}
                        className={`min-h-[52px] w-full flex flex-col items-center justify-center py-1.5 px-1 text-center transition-colors min-w-0 ${
                            url === '/dashboard'
                                ? 'bg-[#0F172A] text-white font-semibold'
                                : 'text-slate-300 hover:bg-slate-800 font-medium'
                        }`}
                    >
                        <span className="text-[11px] leading-tight truncate w-full text-center">Dashboard</span>
                    </Link>

                    <Link
                        href={route('staff.courses.index')}
                        className={`min-h-[52px] w-full flex flex-col items-center justify-center py-1.5 px-1 text-center transition-colors min-w-0 ${
                            url.startsWith('/staff/courses') && !url.includes('/create')
                                ? 'bg-[#0F172A] text-white font-semibold'
                                : 'text-slate-300 hover:bg-slate-800 font-medium'
                        }`}
                    >
                        <span className="text-[11px] leading-tight truncate w-full text-center">My courses</span>
                    </Link>

                    <Link
                        href={route('staff.courses.create')}
                        className={`min-h-[52px] w-full flex flex-col items-center justify-center py-1.5 px-1 text-center transition-colors min-w-0 ${
                            url.includes('/create')
                                ? 'bg-[#0F172A] text-white font-semibold'
                                : 'text-slate-300 hover:bg-slate-800 font-medium'
                        }`}
                    >
                        <span className="text-[11px] leading-tight truncate w-full text-center">New course</span>
                    </Link>

                    <Link
                        href={route('profile.edit')}
                        className={`min-h-[52px] w-full flex flex-col items-center justify-center py-1.5 px-1 text-center transition-colors min-w-0 ${
                            url.startsWith('/profile')
                                ? 'bg-[#0F172A] text-white font-semibold'
                                : 'text-slate-300 hover:bg-slate-800 font-medium'
                        }`}
                    >
                        <span className="text-[11px] leading-tight truncate w-full text-center">Profile</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}

