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
        { name: 'My courses', href: route('staff.courses.index'), active: url.startsWith('/staff/courses') && !url.includes('/create') },
        ...(auth?.user?.organization_id
            ? [{ name: 'Site administration', href: route('staff.organization.show'), active: url.startsWith('/staff/organization') }]
            : []),
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans w-full max-w-[100vw] overflow-x-hidden">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] print:hidden w-full max-w-full">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 sm:h-16 items-center w-full max-w-full gap-2">
                        <div className="flex items-center space-x-3 sm:space-x-8">
                            <Link href={route('dashboard')} className="flex items-center space-x-2 sm:space-x-3 shrink-0" aria-label="CoPED PULSE Home">
                                <img src={logo} alt="CoPED PULSE Logo" className="h-7 sm:h-8 w-auto" />
                                <span className="text-sm sm:text-xl font-display font-black tracking-tight text-[#111827]">
                                    CoPED PULSE
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                    isCoordinator
                                        ? 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]'
                                        : 'bg-[#111827] text-white'
                                }`}>
                                    {isCoordinator ? 'Coordinator' : 'Instructor'}
                                </span>
                            </Link>

                            <div className="hidden md:flex space-x-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${
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

                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <ChatNotificationBell isStaff={true} />
                            <UserProfileDropdown />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Global Flash Messages */}
            {flash?.success && (
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 print:hidden">
                    <div className="bg-emerald-50 border border-[#10B981] text-[#065F46] rounded-xl px-4 sm:px-5 py-3 text-sm font-bold flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-[#10B981] text-white rounded-full flex items-center justify-center text-xs font-black shrink-0">✓</span>
                            <span>{flash.success}</span>
                        </div>
                    </div>
                </div>
            )}
            {flash?.error && (
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 print:hidden">
                    <div className="bg-[#FEF3C7] border border-[#F59E0B] text-[#111827] rounded-xl px-4 sm:px-5 py-3 text-sm font-bold flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-[#F59E0B] text-[#111827] rounded-full flex items-center justify-center text-xs font-black shrink-0">!</span>
                            <span>{flash.error}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="w-full max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-12 print:p-0 print:m-0 print:max-w-none">
                {children}
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <nav
                aria-label="Mobile Bottom Navigation"
                className="md:hidden fixed bottom-0 inset-x-0 z-40 w-full max-w-full bg-white border-t border-[#E2E8F0] print:hidden"
            >
                <div className="grid grid-cols-4 w-full max-w-full divide-x divide-gray-200">
                    <Link
                        href={route('dashboard')}
                        className={`min-h-[56px] w-full flex flex-col items-center justify-center py-1.5 px-0.5 text-center transition-colors min-w-0 ${
                            url === '/dashboard'
                                ? 'bg-[#111827] text-white font-black'
                                : 'text-gray-700 hover:bg-[#F3F4F6] font-bold'
                        }`}
                    >
                        <span className="text-base leading-none mb-1 shrink-0">📊</span>
                        <span className="text-[10px] uppercase tracking-wide leading-none truncate w-full text-center">Dashboard</span>
                    </Link>

                    <Link
                        href={route('staff.courses.index')}
                        className={`min-h-[56px] w-full flex flex-col items-center justify-center py-1.5 px-0.5 text-center transition-colors min-w-0 ${
                            url.startsWith('/staff/courses') && !url.includes('/create')
                                ? 'bg-[#111827] text-white font-black'
                                : 'text-gray-700 hover:bg-[#F3F4F6] font-bold'
                        }`}
                    >
                        <span className="text-base leading-none mb-1 shrink-0">📚</span>
                        <span className="text-[10px] uppercase tracking-wide leading-none truncate w-full text-center">Courses</span>
                    </Link>

                    <Link
                        href={route('staff.courses.create')}
                        className={`min-h-[56px] w-full flex flex-col items-center justify-center py-1.5 px-0.5 text-center transition-colors min-w-0 ${
                            url.includes('/create')
                                ? 'bg-[#111827] text-white font-black'
                                : 'text-gray-700 hover:bg-[#F3F4F6] font-bold'
                        }`}
                    >
                        <span className="text-base leading-none mb-1 shrink-0">➕</span>
                        <span className="text-[10px] uppercase tracking-wide leading-none truncate w-full text-center">New</span>
                    </Link>

                    <Link
                        href={route('profile.edit')}
                        className={`min-h-[56px] w-full flex flex-col items-center justify-center py-1.5 px-0.5 text-center transition-colors min-w-0 ${
                            url.startsWith('/profile')
                                ? 'bg-[#111827] text-white font-black'
                                : 'text-gray-700 hover:bg-[#F3F4F6] font-bold'
                        }`}
                    >
                        <span className="text-base leading-none mb-1 shrink-0">👤</span>
                        <span className="text-[10px] uppercase tracking-wide leading-none truncate w-full text-center">Profile</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
